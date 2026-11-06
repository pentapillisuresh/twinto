
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS } from "../../constants";
import { useCart } from "../../context";

const PREMIUM = {
  primary: "#C9004F",
  primaryDark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  pinkSoft: "#FFF0F5",
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
  gray: "#68717F",
  gold: "#FFE19A",
};

export default function Payment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ORIGINAL CART CONTEXT - UNCHANGED
  const {
    itemTotal = 0,
    platformFee = 0,
    deliveryFee = 0,
    tip = 0,
    total = 0,
  } = useCart();

  // ONLY LOGIC CHANGE:
  // DEFAULT PAYMENT IS NOW CASHFREE
  const [selectedPayment, setSelectedPayment] =
    useState("CASHFREE");

  // ORIGINAL PAYMENT METHODS - UNCHANGED
  const paymentMethods = [
    {
      id: "CASHFREE",
      title: "Pay Online (Cashfree)",
      subtitle:
        "UPI, cards, net banking and other supported methods",
      icon: "card-outline",
    },
    {
      id: "COD",
      title: "Cash on Delivery",
      subtitle: "Pay when your order arrives",
      icon: "cash-outline",
    },
  ];

  // ORIGINAL NAVIGATION LOGIC - UNCHANGED
  const handleContinue = () => {
    router.push({
      pathname: "/checkout/review",
      params: {
        paymentMethod: selectedPayment,
      },
    });
  };

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={PREMIUM.primary}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

      {/* FIXED PREMIUM HEADER */}
      <View
        style={[
          styles.headerBackground,
          { paddingTop: topInset + 16 },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Payment
            </Text>

            <Text style={styles.headerSubtitle}>
              Choose your payment method
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="card-outline"
              size={20}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              Secure Payment
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              Select how you want to pay
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={PREMIUM.white}
            />
          </View>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 150 + insets.bottom,
          },
        ]}
      >
        {/* PAYMENT METHODS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="wallet-outline"
                size={19}
                color={PREMIUM.primary}
              />
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Select Payment Method
              </Text>

              <Text style={styles.sectionSubtitle}>
                Choose how you want to pay for your order
              </Text>
            </View>
          </View>

          <View style={styles.methods}>
            {paymentMethods.map((method) => {
              const selected =
                selectedPayment === method.id;

              return (
                <Pressable
                  key={method.id}
                  onPress={() =>
                    setSelectedPayment(method.id)
                  }
                  style={({ pressed }) => [
                    styles.paymentCard,
                    selected && styles.paymentCardSelected,
                    pressed && styles.paymentCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      selected && styles.paymentIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={21}
                      color={
                        selected
                          ? PREMIUM.white
                          : PREMIUM.primary
                      }
                    />
                  </View>

                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text
                        style={styles.paymentTitle}
                        numberOfLines={1}
                      >
                        {method.title}
                      </Text>

                      {method.id === "CASHFREE" && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>
                            ONLINE
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={styles.paymentSubtitle}
                      numberOfLines={2}
                    >
                      {method.subtitle}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SECURITY INFORMATION */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <View style={styles.securityTitleRow}>
              <Text style={styles.securityTitle}>
                Safe & Secure
              </Text>

              <View style={styles.secureBadge}>
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={PREMIUM.primary}
                />

                <Text style={styles.secureText}>
                  SECURE
                </Text>
              </View>
            </View>

            <Text style={styles.securityText}>
              Your information is encrypted and securely processed.
            </Text>
          </View>
        </View>

        {/* PAYMENT SUMMARY */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryHeaderContent}>
              <Text style={styles.summaryTitle}>
                Payment Summary
              </Text>

              <Text style={styles.summarySubtitle}>
                Review your final payable amount
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="receipt-outline"
                size={19}
                color={PREMIUM.primary}
              />
            </View>
          </View>

          {/* ITEM TOTAL */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="basket-outline"
                  size={14}
                  color={PREMIUM.gray}
                />
              </View>

              <Text style={styles.summaryLabel}>
                Item Total
              </Text>
            </View>

            <Text style={styles.summaryValue}>
              ₹{itemTotal.toFixed(2)}
            </Text>
          </View>

          {/* PLATFORM FEE */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="grid-outline"
                  size={14}
                  color={PREMIUM.gray}
                />
              </View>

              <Text style={styles.summaryLabel}>
                Platform Fee
              </Text>
            </View>

            <Text style={styles.summaryValue}>
              ₹{platformFee.toFixed(2)}
            </Text>
          </View>

          {/* DELIVERY FEE */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="bicycle-outline"
                  size={14}
                  color={PREMIUM.gray}
                />
              </View>

              <Text style={styles.summaryLabel}>
                Delivery Partner Fee
              </Text>
            </View>

            <Text
              style={[
                styles.summaryValue,
                deliveryFee === 0 && styles.freeText,
              ]}
            >
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {/* OPTIONAL TIP */}
          {tip > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <View style={styles.summarySmallIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={14}
                    color={PREMIUM.gray}
                  />
                </View>

                <Text style={styles.summaryLabel}>
                  Tip
                </Text>
              </View>

              <Text style={styles.summaryValue}>
                ₹{tip.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalSubtitle}>
                Inclusive of all applicable charges
              </Text>
            </View>

            <Text style={styles.totalValue}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
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
            Payable Amount
          </Text>

          <Text style={styles.bottomTotal}>
            ₹{total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // PAGE
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 17,
  },

  // FIXED PREMIUM HEADER
  headerBackground: {
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 18,
    paddingBottom: 21,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    zIndex: 10,
    elevation: 4,
  },

  headerCircleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.055)",
    right: -95,
    top: -110,
  },

  headerCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.045)",
    left: -65,
    bottom: -60,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    color: PREMIUM.white,
    fontSize: 17,
    fontWeight: "800",
  },

  headerSubtitle: {
    marginTop: 4,
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  headerInfo: {
    marginTop: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
  },

  headerInfoIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerInfoContent: {
    flex: 1,
  },

  headerInfoTitle: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "800",
  },

  headerInfoSubtitle: {
    color: "#FFE0EB",
    fontSize: 10,
    marginTop: 4,
  },

  headerInfoBadge: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // PAYMENT METHOD SECTION
  section: {
    backgroundColor: PREMIUM.white,
    borderRadius: 23,
    padding: 15,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 10,
  },

  methods: {
    marginTop: 16,
  },

  paymentCard: {
    minHeight: 77,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentCardSelected: {
    backgroundColor: PREMIUM.pinkSoft,
    borderColor: PREMIUM.primary,
    borderWidth: 1.5,
  },

  paymentCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  paymentIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentIconSelected: {
    backgroundColor: PREMIUM.primary,
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  paymentTitle: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  paymentSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  recommendedBadge: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: PREMIUM.pinkLight,
  },

  recommendedText: {
    color: PREMIUM.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D9CDD3",
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: PREMIUM.primary,
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PREMIUM.primary,
  },

  // SECURITY CARD
  securityCard: {
    marginTop: 13,
    padding: 14,
    minHeight: 73,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
  },

  securityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  securityTitle: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  secureBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: PREMIUM.white,
    flexDirection: "row",
    alignItems: "center",
  },

  secureText: {
    marginLeft: 4,
    color: PREMIUM.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  securityText: {
    color: PREMIUM.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  // SUMMARY
  summarySection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 23,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  summaryHeaderContent: {
    flex: 1,
  },

  summaryTitle: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  summarySubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  summarySmallIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  summaryLabel: {
    color: PREMIUM.gray,
    fontSize: 11,
    fontWeight: "600",
  },

  summaryValue: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "800",
  },

  freeText: {
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: PREMIUM.border,
    marginTop: 10,
    marginBottom: 14,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalContent: {
    flex: 1,
  },

  totalLabel: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  totalSubtitle: {
    marginTop: 4,
    color: PREMIUM.muted,
    fontSize: 9,
  },

  totalValue: {
    color: PREMIUM.primary,
    fontSize: 21,
    fontWeight: "900",
  },

  // FIXED BOTTOM BAR
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: PREMIUM.white,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 12,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  bottomAmount: {
    flex: 1,
    paddingLeft: 2,
  },

  bottomLabel: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  bottomTotal: {
    marginTop: 3,
    color: PREMIUM.navy,
    fontSize: 21,
    fontWeight: "900",
  },

  continueButton: {
    minWidth: 150,
    height: 52,
    paddingLeft: 20,
    paddingRight: 7,
    borderRadius: 27,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },

  continueText: {
    color: PREMIUM.white,
    fontSize: 13,
    fontWeight: "900",
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
