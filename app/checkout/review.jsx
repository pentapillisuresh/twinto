

import {

  useCallback,

  useEffect,

  useRef,

  useState,

} from "react";



import {

  ActivityIndicator,

  Alert,

  AppState,

  Image,


  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  View,

} from "react-native";



import AsyncStorage from "@react-native-async-storage/async-storage";



import {

  SafeAreaView,

  useSafeAreaInsets,

} from "react-native-safe-area-context";



import { Ionicons } from "@expo/vector-icons";



import {

  useFocusEffect,

  useLocalSearchParams,

  useRouter,

} from "expo-router";



import { COLORS } from "../../constants";

import { useCart } from "../../context";

import { getAddresses } from "../../services/addressService";

import { syncCartToBackend } from "../../services/cartService";

import { createOrder, retryCashfreePayment } from "../../services/orderService";
import { CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import { CFEnvironment, CFSession } from "cashfree-pg-api-contract";



import {

  verifyPayment,

  getPaymentStatus,

} from "../../services/paymentService";



const PENDING_ORDER_KEY = "twinto_cashfree_pending_order_v1";



function money(value) {

  return `₹${(Number(value) || 0).toFixed(2)}`;

}



function imageSource(image) {

  if (!image) return null;

  if (typeof image === "string") {

    return { uri: image };

  }

  return image;

}



function paymentIsPaid(data) {

  return (

    String(data?.paymentStatus || "").toUpperCase() === "PAID" ||

    data?.isPaid === true

  );

}



export default function ReviewOrder() {

  const router = useRouter();

  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();



  const paymentMethod =

    String(

      Array.isArray(params.paymentMethod)

        ? params.paymentMethod[0]

        : params.paymentMethod || "COD"

    ).toUpperCase() === "CASHFREE"

      ? "CASHFREE"

      : "COD";



  const isCashfree = paymentMethod === "CASHFREE";



  const {

    cart = [],

    itemCount = 0,

    itemTotal = 0,

    platformFee = 0,

    deliveryFee = 0,

    tip = 0,

    total = 0,

    clear,

  } = useCart();



  const [address, setAddress] = useState(null);

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [placing, setPlacing] = useState(false);

  const [checkingPayment, setCheckingPayment] = useState(false);

  const [pendingOrderId, setPendingOrderId] = useState(null);



  const submittingRef = useRef(false);

  const verifyingRef = useRef(false);

  const pendingRef = useRef(null);

  const mountedRef = useRef(true);



  const normalizedCart = (cart || [])

    .filter((item) => item && item.id != null)

    .map((item) => ({

      ...item,

      quantity: Math.max(1, Number(item.quantity) || 1),

    }));



  useEffect(() => {

    mountedRef.current = true;

    return () => {

      mountedRef.current = false;

    };

  }, []);



  const savePendingOrder = useCallback(async (orderId) => {

    const id = Number(orderId);



    if (!Number.isSafeInteger(id) || id <= 0) {

      throw new Error("Invalid Cashfree order ID.");

    }



    // Persist before opening the payment browser.

    await AsyncStorage.setItem(

      PENDING_ORDER_KEY,

      String(id)

    );



    pendingRef.current = id;



    if (mountedRef.current) {

      setPendingOrderId(id);

    }

  }, []);



  const removePendingOrder = useCallback(async () => {

    await AsyncStorage.removeItem(PENDING_ORDER_KEY);

    pendingRef.current = null;



    if (mountedRef.current) {

      setPendingOrderId(null);

    }

  }, []);



  const checkPayment = useCallback(

    async (orderId, showMessage = true) => {

      const id = Number(orderId);



      if (

        !Number.isSafeInteger(id) ||

        id <= 0 ||

        verifyingRef.current

      ) {

        return;

      }



      verifyingRef.current = true;



      if (mountedRef.current) {

        setCheckingPayment(true);

      }



      try {

        // Backend verifies against Cashfree.

        const result = await verifyPayment(id);



        // Fetch latest authoritative backend state.

        const status = await getPaymentStatus(id);



        if (

          paymentIsPaid(result) ||

          paymentIsPaid(status)

        ) {

          await removePendingOrder();



          clear();



          router.replace(`/order/${id}`);

          return;

        }



        const paymentStatus = String(

          status?.paymentStatus ||

          result?.paymentStatus ||

          "PENDING"

        ).toUpperCase();



        if (showMessage) {

          if (

            paymentStatus === "FAILED" ||

            paymentStatus === "CANCELLED"

          ) {

            Alert.alert(

              "Payment not completed",

              "Your payment was not confirmed. Your order is saved. Please check its status before trying another payment.",

              [

                {

                  text: "View Order",

                  onPress: () =>

                    router.push(`/order/${id}`),

                },

                { text: "OK" },

              ]

            );

          } else {

            Alert.alert(

              "Payment pending",

              "Cashfree has not confirmed this payment yet. Please check the order status. Do not place another order.",

              [

                {

                  text: "View Order",

                  onPress: () =>

                    router.push(`/order/${id}`),

                },

                { text: "OK" },

              ]

            );

          }

        }

      } catch (error) {

        if (showMessage) {

          Alert.alert(

            "Unable to verify payment",

            error?.message ||

              "Please check your order status before paying again."

          );

        }

      } finally {

        verifyingRef.current = false;



        if (mountedRef.current) {

          setCheckingPayment(false);

        }

      }

    },

    [clear, removePendingOrder, router]

  );




  const startCashfreePayment = useCallback(
    async (internalOrderId, cashfreeData) => {
      const paymentSessionId =
        cashfreeData?.paymentSessionId ||
        cashfreeData?.payment_session_id ||
        cashfreeData?.sessionId;

      const cashfreeOrderId =
        cashfreeData?.cashfreeOrderId ||
        cashfreeData?.cashfree_order_id ||
        cashfreeData?.orderId ||
        cashfreeData?.cfOrderId;

      if (!paymentSessionId || !cashfreeOrderId) {
        throw new Error(
          "Cashfree payment session or order ID is missing. Please retry payment."
        );
      }

      const environment = String(
        cashfreeData?.environment || "sandbox"
      ).toLowerCase();

      if (!["sandbox", "production"].includes(environment)) {
        throw new Error("Invalid Cashfree environment returned by backend.");
      }

      if (
        !CFPaymentGatewayService ||
        typeof CFPaymentGatewayService.doWebPayment !== "function"
      ) {
        throw new Error(
          "Cashfree native SDK is unavailable. Rebuild the Android app; Expo Go is not supported."
        );
      }

      const cfEnvironment =
        environment === "production"
          ? CFEnvironment.PRODUCTION
          : CFEnvironment.SANDBOX;

      const session = new CFSession(
        String(paymentSessionId),
        String(cashfreeOrderId),
        cfEnvironment
      );

      // Persist the internal TWINTO order ID before opening checkout.
      await savePendingOrder(internalOrderId);

      console.log("[CASHFREE SDK] Opening checkout", {
        internalOrderId,
        cashfreeOrderId,
        environment,
      });

      try {
        CFPaymentGatewayService.doWebPayment(session);
      } catch (error) {
        console.error(
          "[CASHFREE SDK] doWebPayment failed:",
          error?.message || error
        );
        throw new Error(
          error?.message || "Unable to open Cashfree checkout."
        );
      }
    },
    [savePendingOrder]
  );

  const continuePendingPayment = useCallback(async () => {
    const id = Number(pendingRef.current || pendingOrderId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      Alert.alert("Payment unavailable", "No pending order was found.");
      return;
    }

    if (placing || checkingPayment || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setPlacing(true);

    try {
      const status = await getPaymentStatus(id);

      if (paymentIsPaid(status)) {
        await removePendingOrder();
        clear();
        router.replace(`/order/${id}`);
        return;
      }

      // Ask the backend to create/reuse a valid Cashfree session
      // for this existing TWINTO order. Never create a second order.
      const retryResult = await retryCashfreePayment(id);

      if (retryResult?.isPaid || paymentIsPaid(retryResult)) {
        await removePendingOrder();
        clear();
        router.replace(`/order/${id}`);
        return;
      }

      if (!retryResult?.cashfree) {
        throw new Error(
          "Backend did not return Cashfree payment session details."
        );
      }

      await startCashfreePayment(id, retryResult.cashfree);
    } catch (error) {
      console.error(
        "[CASHFREE] Retry payment failed:",
        error?.message || error
      );

      Alert.alert(
        "Unable to start payment",
        error?.message ||
          "Your existing order is saved. Please try again."
      );
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setPlacing(false);
      }
    }
  }, [
    pendingOrderId,
    placing,
    checkingPayment,
    removePendingOrder,
    clear,
    router,
    startCashfreePayment,
  ]);

  useEffect(() => {
    let callbackRegistered = false;

    try {
      if (
        !CFPaymentGatewayService ||
        typeof CFPaymentGatewayService.setCallback !== "function"
      ) {
        console.error("[CASHFREE SDK] Callback API is unavailable.");
        return undefined;
      }

      CFPaymentGatewayService.setCallback({
        onVerify: async (cashfreeOrderId) => {
          console.log(
            "[CASHFREE SDK] Verify callback:",
            cashfreeOrderId
          );

          const id = pendingRef.current;
          if (id) {
            await checkPayment(id, true);
          }
        },

        onError: async (error, cashfreeOrderId) => {
          console.error(
            "[CASHFREE SDK] Payment error:",
            error?.getMessage?.() ||
              error?.message ||
              String(error),
            "Code:",
            error?.getCode?.() || error?.code,
            "Cashfree order:",
            cashfreeOrderId
          );

          const id = pendingRef.current;
          if (id) {
            await checkPayment(id, true);
          }
        },
      });

      callbackRegistered = true;
    } catch (error) {
      console.error(
        "[CASHFREE SDK] Callback registration failed:",
        error?.message || error
      );
    }

    return () => {
      if (callbackRegistered) {
        try {
          CFPaymentGatewayService.removeCallback();
        } catch (error) {
          console.log(
            "[CASHFREE SDK] Callback cleanup failed:",
            error?.message || error
          );
        }
      }
    };
  }, [checkPayment]);

  // Restore an existing payment after app restart.

  useEffect(() => {

    let active = true;



    async function restorePending() {

      try {

        const saved = await AsyncStorage.getItem(

          PENDING_ORDER_KEY

        );



        if (!active || !saved) return;



        const id = Number(saved);



        if (Number.isSafeInteger(id) && id > 0) {

          pendingRef.current = id;

          setPendingOrderId(id);

        }

      } catch (error) {

        console.log(

          "Pending order restore failed:",

          error?.message

        );

      }

    }



    restorePending();



    return () => {

      active = false;

    };

  }, []);



  // Load delivery address whenever review regains focus.

  useFocusEffect(

    useCallback(() => {

      let active = true;



      async function loadAddress() {

        try {

          setLoadingAddress(true);



          const list = await getAddresses();



          if (active) {

            setAddress(

              list.find((a) => a.isDefault) ||

              list[0] ||

              null

            );

          }

        } catch (error) {

          console.log(

            "Review address error:",

            error?.message

          );

        } finally {

          if (active) {

            setLoadingAddress(false);

          }

        }

      }



      loadAddress();



      return () => {

        active = false;

      };

    }, [])

  );



  // Check pending payment when app returns from browser.

  useEffect(() => {

    const subscription = AppState.addEventListener(

      "change",

      (state) => {

        if (

          state === "active" &&

          pendingRef.current &&

          !submittingRef.current

        ) {

          checkPayment(pendingRef.current, false);

        }

      }

    );



    return () => subscription.remove();

  }, [checkPayment]);



  function editAddress() {

    router.push("/checkout/address");

  }



  function editPayment() {

    router.push("/checkout/payment");

  }



  async function placeOrder() {

    // Synchronous guard prevents rapid double taps.

    if (

      submittingRef.current ||

      placing ||

      checkingPayment

    ) {

      return;

    }



    if (pendingRef.current || pendingOrderId) {

      const existingId =

        pendingRef.current || pendingOrderId;



      Alert.alert(

        "Existing payment",

        "You already have a Cashfree order awaiting confirmation. Check that order before creating another.",

        [

          {

            text: "Continue Payment",

            onPress: () => continuePendingPayment(),

          },

          {

            text: "Check Payment",

            onPress: () => checkPayment(existingId),

          },

          {

            text: "View Order",

            onPress: () =>

              router.push(`/order/${existingId}`),

          },

          { text: "Cancel", style: "cancel" },

        ]

      );

      return;

    }



    if (!normalizedCart.length) {

      Alert.alert(

        "Cart empty",

        "Add products before placing an order."

      );

      return;

    }



    if (!address?.id) {

      Alert.alert(

        "Address missing",

        "Please select a delivery address."

      );

      return;

    }



    submittingRef.current = true;

    setPlacing(true);



    try {

      // Sync cart before creating the backend order.

      await syncCartToBackend(normalizedCart);



      const result = await createOrder({

        addressId: address.id,

        paymentMethod,

        tip: Number(tip) || 0,

        sendAddressToAdmin: true,

      });



      const orderId = Number(result?.order?.id);



      if (

        !Number.isSafeInteger(orderId) ||

        orderId <= 0

      ) {

        throw new Error(

          "Order response did not include a valid ID."

        );

      }



      // COD: no payment gateway needed.

      if (!isCashfree) {

        clear();

        router.replace(`/order/${orderId}`);

        return;

      }



      // Save order immediately to prevent duplicates.

      await savePendingOrder(orderId);



      const cashfreeData = result?.cashfree;

      if (!cashfreeData) {
        Alert.alert(
          "Payment setup incomplete",
          "Your order was created, but Cashfree did not return a payment session. " +
            "Do not create another order. Please retry this existing order.",
          [
            {
              text: "View Order",
              onPress: () => router.replace(`/order/${orderId}`),
            },
            { text: "OK" },
          ]
        );
        return;
      }

      await startCashfreePayment(orderId, cashfreeData);

    } catch (error) {

      console.log(

        "Checkout error:",

        error?.message

      );



      Alert.alert(

        "Checkout could not be completed",

        "The request may have created an order. Check My Orders before trying again.\n\n" +

          (error?.message || "Please try later.")

      );

    } finally {

      submittingRef.current = false;



      if (mountedRef.current) {

        setPlacing(false);

      }

    }

  }



  const busy = placing || checkingPayment;



  return (

    <SafeAreaView

      style={styles.safeArea}

      edges={["top", "left", "right"]}

    >

      {/* HEADER */}

      <View style={styles.header}>

        <Pressable

          onPress={() => router.back()}

          style={styles.backButton}

          disabled={busy}

        >

          <Ionicons

            name="arrow-back"

            size={21}

            color={COLORS.text}

          />

        </Pressable>



        <View style={styles.headerCenter}>

          <Text style={styles.headerTitle}>

            Review Order

          </Text>

          <Text style={styles.headerSubtitle}>

            Check everything before placing your order

          </Text>

        </View>



        <View style={{ width: 42 }} />

      </View>



      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={[

          styles.content,

          { paddingBottom: 150 + insets.bottom },

        ]}

      >

        {/* CHECKOUT PROGRESS */}

        <View style={styles.progressCard}>

          {[

            ["location", "Address"],

            ["wallet", "Payment"],

            ["checkmark", "Review"],

          ].map(([icon, title], index) => (

            <View

              key={title}

              style={styles.progressGroup}

            >

              {index > 0 && (

                <View style={styles.progressLine} />

              )}



              <View style={styles.progressStep}>

                <View

                  style={[

                    styles.progressCircle,

                    index === 2 &&

                      styles.progressCircleCurrent,

                  ]}

                >

                  <Ionicons

                    name={icon}

                    size={14}

                    color={

                      index === 2

                        ? COLORS.primary

                        : COLORS.white

                    }

                  />

                </View>



                <Text style={styles.progressText}>

                  {title}

                </Text>

              </View>

            </View>

          ))}

        </View>



        {/* PENDING PAYMENT NOTICE */}

        {!!pendingOrderId && (

          <View style={styles.pendingCard}>

            <Ionicons

              name="time-outline"

              size={22}

              color={COLORS.primary}

            />



            <View style={{ flex: 1 }}>

              <Text style={styles.pendingTitle}>

                Payment confirmation pending

              </Text>



              <Text style={styles.pendingDescription}>

                Order #{pendingOrderId} is already

                created. Check its payment status

                before placing another order.

              </Text>



              <Pressable

                disabled={busy}

                onPress={continuePendingPayment}

                style={styles.pendingButton}

              >

                <Text style={styles.pendingButtonText}>

                  {checkingPayment

                    ? "Checking..."

                    : "Continue Payment"}

                </Text>

              </Pressable>

            </View>

          </View>

        )}



        {/* DELIVERY ADDRESS */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionHeading}>

              <View style={styles.sectionIcon}>

                <Ionicons

                  name="location-outline"

                  size={19}

                  color={COLORS.primary}

                />

              </View>



              <View style={{ flex: 1 }}>

                <Text style={styles.sectionTitle}>

                  Delivery Address

                </Text>

                <Text style={styles.sectionSubtitle}>

                  Where your order will be delivered

                </Text>

              </View>

            </View>



            <Pressable

              onPress={editAddress}

              disabled={busy}

              style={styles.editButton}

            >

              <Text style={styles.editText}>

                Edit

              </Text>

            </Pressable>

          </View>



          {loadingAddress ? (

            <ActivityIndicator

              color={COLORS.primary}

              style={{ marginVertical: 20 }}

            />

          ) : address ? (

            <View style={styles.addressCard}>

              <View style={styles.addressTop}>

                <View style={styles.addressIcon}>

                  <Ionicons

                    name="home"

                    size={20}

                    color={COLORS.primary}

                  />

                </View>



                <View style={{ flex: 1 }}>

                  <Text style={styles.addressType}>

                    {address.type || "HOME"}

                  </Text>

                  <Text style={styles.addressName}>

                    {address.name || "Customer"}

                  </Text>

                </View>

              </View>



              <View style={styles.addressDetail}>

                <Ionicons

                  name="location-outline"

                  size={15}

                  color={COLORS.muted}

                />

                <Text style={styles.addressText}>

                  {address.address}

                </Text>

              </View>



              <View style={styles.addressDetail}>

                <Ionicons

                  name="call-outline"

                  size={15}

                  color={COLORS.primary}

                />

                <Text style={styles.addressText}>

                  {address.phone || address.mobile}

                </Text>

              </View>

            </View>

          ) : (

            <Pressable

              style={styles.addressCard}

              onPress={editAddress}

            >

              <Text style={styles.editText}>

                Add a delivery address

              </Text>

            </Pressable>

          )}

        </View>



        {/* PAYMENT METHOD */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionHeading}>

              <View style={styles.sectionIcon}>

                <Ionicons

                  name="wallet-outline"

                  size={19}

                  color={COLORS.primary}

                />

              </View>



              <View style={{ flex: 1 }}>

                <Text style={styles.sectionTitle}>

                  Payment Method

                </Text>

                <Text style={styles.sectionSubtitle}>

                  Selected payment option

                </Text>

              </View>

            </View>



            <Pressable

              onPress={editPayment}

              disabled={busy}

              style={styles.editButton}

            >

              <Text style={styles.editText}>

                Change

              </Text>

            </Pressable>

          </View>



          <View style={styles.paymentCard}>

            <View style={styles.paymentIcon}>

              <Ionicons

                name={

                  isCashfree

                    ? "card-outline"

                    : "cash-outline"

                }

                size={22}

                color={COLORS.primary}

              />

            </View>



            <View style={{ flex: 1 }}>

              <View style={styles.paymentTitleRow}>

                <Text style={styles.paymentTitle}>

                  {isCashfree

                    ? "Pay Online (Cashfree)"

                    : "Cash on Delivery"}

                </Text>



                <View style={styles.selectedBadge}>

                  <Text style={styles.selectedText}>

                    SELECTED

                  </Text>

                </View>

              </View>



              <Text style={styles.paymentSubtitle}>

                {isCashfree

                  ? "Secure online payment"

                  : "Pay when your order arrives"}

              </Text>

            </View>



            <Ionicons

              name="checkmark-circle"

              size={24}

              color={COLORS.primary}

            />

          </View>

        </View>



        {/* ITEMS */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionHeading}>

              <View style={styles.sectionIcon}>

                <Ionicons

                  name="basket-outline"

                  size={19}

                  color={COLORS.primary}

                />

              </View>



              <View style={{ flex: 1 }}>

                <Text style={styles.sectionTitle}>

                  Your Items

                </Text>

                <Text style={styles.sectionSubtitle}>

                  {itemCount}{" "}

                  {itemCount === 1

                    ? "item"

                    : "items"}{" "}

                  in your order

                </Text>

              </View>

            </View>



            <View style={styles.itemCountBadge}>

              <Text style={styles.itemCountText}>

                {itemCount}

              </Text>

            </View>

          </View>



          {normalizedCart.map((item, index) => {

            const quantity = item.quantity;

            const price = Number(item.price) || 0;

            const source = imageSource(item.image);



            return (

              <View

                key={`${item.id}-${index}`}

                style={[

                  styles.productRow,

                  index < normalizedCart.length - 1 &&

                    styles.productBorder,

                ]}

              >

                <View style={styles.imageBox}>

                  {source ? (

                    <Image

                      source={source}

                      style={styles.productImage}

                      resizeMode="cover"

                    />

                  ) : (

                    <Ionicons

                      name="image-outline"

                      size={25}

                      color={COLORS.muted}

                    />

                  )}

                </View>



                <View style={styles.productInfo}>

                  <Text

                    style={styles.productName}

                    numberOfLines={2}

                  >

                    {item.name || "Product"}

                  </Text>



                  <Text style={styles.weight}>

                    {item.weight || "Standard"}

                  </Text>



                  <View style={styles.quantityBadge}>

                    <Text style={styles.quantityText}>

                      Qty {quantity}

                    </Text>

                  </View>

                </View>



                <View style={styles.productPriceArea}>

                  <Text style={styles.productPrice}>

                    {money(price * quantity)}

                  </Text>



                  {quantity > 1 && (

                    <Text style={styles.priceEach}>

                      {money(price)} each

                    </Text>

                  )}

                </View>

              </View>

            );

          })}

        </View>



        {/* DELIVERY INFO */}

        <View style={styles.deliveryCard}>

          <View style={styles.deliveryIcon}>

            <Ionicons

              name="flash"

              size={21}

              color={COLORS.primary}

            />

          </View>



          <View style={{ flex: 1 }}>

            <Text style={styles.deliveryTitle}>

              Fast Delivery

            </Text>



            <Text style={styles.deliveryText}>

              Your groceries will be prepared for

              delivery as soon as your order is

              confirmed.

            </Text>

          </View>

        </View>



        {/* BILL DETAILS */}

        <View style={styles.section}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionHeading}>

              <View style={styles.sectionIcon}>

                <Ionicons

                  name="receipt-outline"

                  size={19}

                  color={COLORS.primary}

                />

              </View>



              <View>

                <Text style={styles.sectionTitle}>

                  Bill Details

                </Text>

                <Text style={styles.sectionSubtitle}>

                  Complete payment breakdown

                </Text>

              </View>

            </View>

          </View>



          {[

            ["Item Total", itemTotal],

            ["Platform Fee", platformFee],

            ["Delivery Partner Fee", deliveryFee],

            ...(Number(tip) > 0

              ? [["Tip", tip]]

              : []),

          ].map(([label, amount]) => (

            <View key={label} style={styles.billRow}>

              <Text style={styles.billLabel}>

                {label}

              </Text>



              <Text

                style={[

                  styles.billValue,

                  label === "Delivery Partner Fee" &&

                    Number(amount) === 0 &&

                    styles.freeText,

                ]}

              >

                {label === "Delivery Partner Fee" &&

                Number(amount) === 0

                  ? "FREE"

                  : money(amount)}

              </Text>

            </View>

          ))}



          <View style={styles.divider} />



          <View style={styles.totalRow}>

            <View style={{ flex: 1 }}>

              <Text style={styles.totalLabel}>

                Total Amount

              </Text>



              <Text style={styles.totalSubtitle}>

                Inclusive of applicable charges

              </Text>

            </View>



            <Text style={styles.totalValue}>

              {money(total)}

            </Text>

          </View>

        </View>



        {/* SECURITY NOTE */}

        {isCashfree && (

          <View style={styles.securityCard}>

            <Ionicons

              name="shield-checkmark-outline"

              size={22}

              color={COLORS.primary}

            />



            <Text style={styles.securityText}>

              Your online payment is processed

              through Cashfree. Payment success is

              confirmed by the TWINTO server.

            </Text>

          </View>

        )}

      </ScrollView>



      {/* BOTTOM BAR */}

      <View

        style={[

          styles.bottomBar,

          {

            paddingBottom: Math.max(

              insets.bottom + 10,

              18

            ),

          },

        ]}

      >

        <View style={styles.bottomAmount}>

          <Text style={styles.bottomLabel}>

            Total to Pay

          </Text>



          <Text style={styles.bottomTotal}>

            {money(total)}

          </Text>

        </View>



        <Pressable

          disabled={

            busy ||

            Boolean(pendingOrderId) ||

            loadingAddress

          }

          onPress={placeOrder}

          style={({ pressed }) => [

            styles.placeButton,

            (busy || pendingOrderId) &&

              styles.disabledButton,

            pressed && styles.pressedButton,

          ]}

        >

          <Text style={styles.placeButtonText}>

            {placing

              ? "PROCESSING..."

              : checkingPayment

                ? "VERIFYING..."

                : pendingOrderId

                  ? "PAYMENT PENDING"

                  : isCashfree

                    ? "PAY NOW"

                    : "PLACE ORDER"}

          </Text>



          <View style={styles.placeIcon}>

            {busy ? (

              <ActivityIndicator

                size="small"

                color={COLORS.primary}

              />

            ) : (

              <Ionicons

                name={

                  isCashfree

                    ? "arrow-forward"

                    : "checkmark"

                }

                size={17}

                color={COLORS.primary}

              />

            )}

          </View>

        </Pressable>

      </View>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

    backgroundColor: COLORS.background,

  },



  content: {

    paddingHorizontal: 16,

    paddingTop: 14,

  },



  header: {

    height: 66,

    paddingHorizontal: 16,

    backgroundColor: COLORS.white,

    borderBottomWidth: 1,

    borderBottomColor: "#F0E5EA",

    flexDirection: "row",

    alignItems: "center",

  },



  backButton: {

    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor: "#FFF0F6",

    alignItems: "center",

    justifyContent: "center",

  },



  headerCenter: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

  },



  headerTitle: {

    color: COLORS.text,

    fontSize: 18,

    fontWeight: "900",

  },



  headerSubtitle: {

    marginTop: 2,

    color: COLORS.muted,

    fontSize: 8.5,

    fontWeight: "600",

  },



  progressCard: {

    padding: 12,

    borderRadius: 16,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: "#EEDFE5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 12,

  },



  progressGroup: {

    flexDirection: "row",

    alignItems: "center",

    flex: 1,

    justifyContent: "center",

  },



  progressStep: {

    alignItems: "center",

  },



  progressCircle: {

    width: 27,

    height: 27,

    borderRadius: 14,

    backgroundColor: COLORS.primary,

    alignItems: "center",

    justifyContent: "center",

  },



  progressCircleCurrent: {

    backgroundColor: "#FFE3EF",

    borderWidth: 1,

    borderColor: COLORS.primary,

  },



  progressText: {

    marginTop: 4,

    fontSize: 8,

    color: COLORS.primary,

    fontWeight: "800",

  },



  progressLine: {

    height: 1,

    flex: 1,

    backgroundColor: COLORS.primary,

    marginHorizontal: 7,

  },



  section: {

    marginBottom: 12,

    padding: 15,

    borderRadius: 19,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: "#EEDFE5",

  },



  sectionHeader: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 13,

  },



  sectionHeading: {

    flex: 1,

    flexDirection: "row",

    alignItems: "center",

  },



  sectionIcon: {

    width: 40,

    height: 40,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,

  },



  sectionTitle: {

    color: COLORS.text,

    fontSize: 14,

    fontWeight: "900",

  },



  sectionSubtitle: {

    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 3,

  },



  editButton: {

    paddingHorizontal: 9,

    paddingVertical: 7,

    borderRadius: 9,

    backgroundColor: "#FFF0F6",

  },



  editText: {

    color: COLORS.primary,

    fontSize: 10.5,

    fontWeight: "900",

  },



  addressCard: {

    padding: 13,

    borderRadius: 15,

    backgroundColor: "#FFF8FB",

    borderWidth: 1,

    borderColor: "#F2DCE6",

  },



  addressTop: {

    flexDirection: "row",

    alignItems: "center",

  },



  addressIcon: {

    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,

  },



  addressType: {

    color: COLORS.primary,

    fontSize: 10,

    fontWeight: "900",

  },



  addressName: {

    color: COLORS.text,

    fontSize: 13,

    fontWeight: "800",

    marginTop: 3,

  },



  addressDetail: {

    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 12,

    gap: 8,

  },



  addressText: {

    flex: 1,

    color: COLORS.textSecondary,

    fontSize: 10.5,

    lineHeight: 17,

  },



  paymentCard: {

    minHeight: 68,

    padding: 11,

    borderRadius: 15,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,

    borderColor: "#F1C9DA",

    flexDirection: "row",

    alignItems: "center",

  },



  paymentIcon: {

    width: 43,

    height: 43,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,

  },



  paymentTitleRow: {

    flexDirection: "row",

    alignItems: "center",

    flexWrap: "wrap",

  },



  paymentTitle: {

    color: COLORS.text,

    fontSize: 12.5,

    fontWeight: "900",

  },



  paymentSubtitle: {

    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 4,

  },



  selectedBadge: {

    marginLeft: 7,

    paddingHorizontal: 6,

    paddingVertical: 4,

    borderRadius: 7,

    backgroundColor: COLORS.primary,

  },



  selectedText: {

    color: COLORS.white,

    fontSize: 7,

    fontWeight: "900",

  },



  itemCountBadge: {

    minWidth: 29,

    height: 29,

    paddingHorizontal: 7,

    borderRadius: 10,

    backgroundColor: COLORS.primary,

    alignItems: "center",

    justifyContent: "center",

  },



  itemCountText: {

    color: COLORS.white,

    fontSize: 10,

    fontWeight: "900",

  },



  productRow: {

    minHeight: 86,

    paddingVertical: 8,

    flexDirection: "row",

    alignItems: "center",

  },



  productBorder: {

    borderBottomWidth: 1,

    borderBottomColor: "#F0E5EA",

  },



  imageBox: {

    width: 72,

    height: 72,

    borderRadius: 14,

    backgroundColor: "#F8F5F1",

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

  },



  productImage: {

    width: "100%",

    height: "100%",

  },



  productInfo: {

    flex: 1,

    marginLeft: 11,

    marginRight: 8,

  },



  productName: {

    color: COLORS.text,

    fontSize: 12,

    lineHeight: 17,

    fontWeight: "800",

  },



  weight: {

    color: COLORS.muted,

    fontSize: 9.5,

    marginTop: 4,

  },



  quantityBadge: {

    alignSelf: "flex-start",

    marginTop: 5,

    paddingHorizontal: 7,

    paddingVertical: 3,

    borderRadius: 7,

    backgroundColor: "#FFF0F6",

  },



  quantityText: {

    color: COLORS.primary,

    fontSize: 8,

    fontWeight: "900",

  },



  productPriceArea: {

    alignItems: "flex-end",

    minWidth: 55,

  },



  productPrice: {

    color: COLORS.text,

    fontSize: 13,

    fontWeight: "900",

  },



  priceEach: {

    color: COLORS.muted,

    fontSize: 8,

    marginTop: 3,

  },



  deliveryCard: {

    minHeight: 70,

    marginBottom: 12,

    padding: 13,

    borderRadius: 17,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,

    borderColor: "#F2D5E1",

    flexDirection: "row",

    alignItems: "center",

  },



  deliveryIcon: {

    width: 43,

    height: 43,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 10,

  },



  deliveryTitle: {

    color: COLORS.text,

    fontSize: 12,

    fontWeight: "900",

  },



  deliveryText: {

    color: COLORS.muted,

    fontSize: 9.5,

    lineHeight: 15,

    marginTop: 4,

  },



  billRow: {

    minHeight: 38,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },



  billLabel: {

    color: COLORS.muted,

    fontSize: 10.5,

    fontWeight: "600",

  },



  billValue: {

    color: COLORS.text,

    fontSize: 11,

    fontWeight: "800",

  },



  freeText: {

    color: COLORS.primary,

    fontWeight: "900",

  },



  divider: {

    height: 1,

    backgroundColor: "#F0E5EA",

    marginTop: 8,

    marginBottom: 12,

  },



  totalRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },



  totalLabel: {

    color: COLORS.text,

    fontSize: 14,

    fontWeight: "900",

  },



  totalSubtitle: {

    color: COLORS.muted,

    fontSize: 8.5,

    marginTop: 3,

  },



  totalValue: {

    color: COLORS.primary,

    fontSize: 20,

    fontWeight: "900",

  },



  securityCard: {

    padding: 13,

    borderRadius: 16,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,

    borderColor: "#F2D5E1",

    flexDirection: "row",

    alignItems: "center",

    gap: 10,

    marginBottom: 12,

  },



  securityText: {

    flex: 1,

    color: COLORS.muted,

    fontSize: 10,

    lineHeight: 16,

  },



  pendingCard: {

    padding: 14,

    marginBottom: 12,

    borderRadius: 16,

    backgroundColor: "#FFF0F6",

    borderWidth: 1,

    borderColor: "#F2D5E1",

    flexDirection: "row",

    alignItems: "flex-start",

    gap: 10,

  },



  pendingTitle: {

    color: COLORS.text,

    fontSize: 12,

    fontWeight: "900",

  },



  pendingDescription: {

    color: COLORS.muted,

    fontSize: 10,

    lineHeight: 16,

    marginTop: 5,

  },



  pendingButton: {

    alignSelf: "flex-start",

    backgroundColor: COLORS.primary,

    borderRadius: 9,

    paddingHorizontal: 12,

    paddingVertical: 9,

    marginTop: 10,

  },



  pendingButtonText: {

    color: COLORS.white,

    fontSize: 10,

    fontWeight: "900",

  },



  bottomBar: {

    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    minHeight: 76,

    paddingHorizontal: 16,

    paddingTop: 10,

    backgroundColor: COLORS.white,

    borderTopWidth: 1,

    borderTopColor: "#EEDFE5",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    elevation: 12,

  },



  bottomAmount: {

    flex: 1,

    paddingLeft: 2,

  },



  bottomLabel: {

    color: COLORS.muted,

    fontSize: 9.5,

    fontWeight: "700",

  },



  bottomTotal: {

    color: COLORS.text,

    fontSize: 21,

    fontWeight: "900",

    marginTop: 2,

  },



  placeButton: {

    minWidth: 157,

    height: 50,

    paddingLeft: 16,

    paddingRight: 7,

    borderRadius: 16,

    backgroundColor: COLORS.primary,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },



  disabledButton: {

    opacity: 0.6,

  },



  pressedButton: {

    opacity: 0.85,

  },



  placeButtonText: {

    color: COLORS.white,

    fontSize: 11,

    fontWeight: "900",

    letterSpacing: 0.3,

    marginRight: 10,

  },



  placeIcon: {

    width: 36,

    height: 36,

    borderRadius: 12,

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

  },

});
