
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AddressCard from "../../components/checkout/AddressCard";
import { COLORS } from "../../constants";
import { getAddresses } from "../../services/addressService";

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

export default function AddressScreen() {
  const insets = useSafeAreaInsets();

  // ORIGINAL STATE - UNCHANGED
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ORIGINAL API LOGIC - UNCHANGED
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const list = await getAddresses();

      setAddresses(list);

      if (list.length && !selectedId) {
        setSelectedId(list[0].id);
      }
    } catch (e) {
      console.log("Address load error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  // RELOAD EVERY TIME SCREEN GAINS FOCUS
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ORIGINAL CONFIRM LOGIC
  function confirm() {
    if (!selectedId) return;
    router.back();
  }

  // ORIGINAL ADD ADDRESS NAVIGATION
  function addNewAddress() {
    router.push("/checkout/add-address");
  }

  // ORIGINAL EDIT ADDRESS NAVIGATION
  function editAddress(address) {
    if (!address?.id) return;

    router.push({
      pathname: "/checkout/add-address",
      params: { id: String(address.id) },
    });
  }

  // ORIGINAL SELECTED ADDRESS LOGIC
  const selected = addresses.find(
    (a) => String(a.id) === String(selectedId)
  );

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
          {
            paddingTop: topInset + 16,
          },
        ]}
      >
        <View style={styles.headerCircleOne} />
        <View style={styles.headerCircleTwo} />

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color={PREMIUM.white}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Delivery Address
            </Text>

            <Text style={styles.headerSubtitle}>
              Choose your delivery location
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name="location-outline"
              size={21}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              Delivering happiness
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              Select where your groceries should arrive
            </Text>
          </View>

          <View style={styles.headerInfoBadge}>
            <Ionicons
              name="navigate-outline"
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
          styles.scroll,
          {
            paddingBottom: 125 + insets.bottom,
          },
        ]}
      >
        {/* INTRO CARD */}
        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="map-outline"
              size={22}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.headingContent}>
            <Text style={styles.title}>
              Select delivery address
            </Text>

            <Text style={styles.subtitle}>
              Choose where you want your groceries delivered.
            </Text>
          </View>
        </View>

        {/* SAVED ADDRESSES HEADING */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeadingLeft}>
            <View style={styles.sectionAccent} />

            <View>
              <Text style={styles.sectionTitle}>
                Saved Addresses
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your available delivery locations
              </Text>
            </View>
          </View>

          <View style={styles.savedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={PREMIUM.primary}
            />

            <Text style={styles.savedBadgeText}>
              {addresses.length} SAVED
            </Text>
          </View>
        </View>

        {/* ORIGINAL LOADING / EMPTY / LIST LOGIC */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />

            <Text style={styles.loadingText}>
              Loading your addresses...
            </Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="location-outline"
                  size={32}
                  color={PREMIUM.primary}
                />
              </View>
            </View>

            <Text style={styles.emptyTitle}>
              No saved addresses yet
            </Text>

            <Text style={styles.emptyText}>
              Add your delivery address to receive groceries
              at your doorstep.
            </Text>
          </View>
        ) : (
          addresses.map((address) => {
            const isSelected =
              String(address.id) === String(selectedId);

            return (
              <Pressable
                key={address.id}
                onPress={() => setSelectedId(address.id)}
                style={({ pressed }) => [
                  styles.addressWrapper,
                  isSelected &&
                    styles.addressWrapperSelected,
                  pressed && styles.addressPressed,
                ]}
              >
                {isSelected && (
                  <View style={styles.selectedTopLine} />
                )}

                {/* ORIGINAL ADDRESS COMPONENT */}
                <AddressCard
                  address={address}
                  selected={isSelected}
                  onChange={() => editAddress(address)}
                />

                {/* PREMIUM SELECTION FOOTER */}
                <View style={styles.addressFooter}>
                  <View style={styles.addressFooterLeft}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.selectLabel,
                        isSelected &&
                          styles.selectLabelActive,
                      ]}
                    >
                      {isSelected
                        ? "Selected delivery address"
                        : "Tap to select this address"}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedPill}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={PREMIUM.white}
                      />

                      <Text style={styles.selectedPillText}>
                        SELECTED
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        {/* ORIGINAL ADD NEW ADDRESS ACTION */}
        <Pressable
          style={({ pressed }) => [
            styles.addAddress,
            pressed && styles.pressed,
          ]}
          onPress={addNewAddress}
        >
          <View style={styles.addIcon}>
            <Ionicons
              name="add"
              size={23}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.addContent}>
            <Text style={styles.addTitle}>
              Add a new address
            </Text>

            <Text style={styles.addSubtitle}>
              Add another delivery location
            </Text>
          </View>

          <View style={styles.arrowBox}>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={PREMIUM.primary}
            />
          </View>
        </Pressable>

        {/* INFORMATION CARD */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={PREMIUM.primary}
            />
          </View>

          <Text style={styles.infoText}>
            Your delivery address helps us bring your
            groceries to the right doorstep.
          </Text>
        </View>
      </ScrollView>

      {/* ORIGINAL SELECTED ADDRESS BOTTOM BAR */}
      {selected && (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Math.max(
                12,
                insets.bottom + 8
              ),
            },
          ]}
        >
          <View style={styles.bottomAddress}>
            <View style={styles.bottomLocationIcon}>
              <Ionicons
                name="location"
                size={17}
                color={PREMIUM.primary}
              />
            </View>

            <View style={styles.bottomAddressInfo}>
              <Text style={styles.bottomAddressLabel}>
                Delivering to
              </Text>

              <Text
                style={styles.bottomAddressText}
                numberOfLines={1}
              >
                {selected.type} • {selected.name}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={confirm}
            style={({ pressed }) => [
              styles.confirm,
              pressed && styles.confirmPressed,
            ]}
          >
            <Text style={styles.confirmText}>
              Deliver Here
            </Text>

            <View style={styles.confirmIcon}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={PREMIUM.primary}
              />
            </View>
          </Pressable>
        </View>
      )}
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

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 17,
  },

  // PREMIUM FIXED HEADER
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
    color: "#FFE0EB",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
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
    minWidth: 0,
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

  // INTRO CARD
  heading: {
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  headingIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headingContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  subtitle: {
    color: PREMIUM.muted,
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
  },

  // SECTION HEADING
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    paddingHorizontal: 2,
  },

  sectionHeadingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  sectionAccent: {
    width: 4,
    height: 35,
    borderRadius: 3,
    backgroundColor: PREMIUM.primary,
    marginRight: 10,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 9.5,
    marginTop: 4,
  },

  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  savedBadgeText: {
    color: PREMIUM.primary,
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 5,
  },

  // LOADING
  loadingBox: {
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    marginBottom: 13,
  },

  loadingText: {
    color: PREMIUM.muted,
    fontSize: 11,
    marginTop: 12,
    fontWeight: "600",
  },

  // EMPTY
  emptyBox: {
    paddingVertical: 36,
    paddingHorizontal: 25,
    alignItems: "center",
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    marginBottom: 13,
  },

  emptyIconOuter: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIcon: {
    width: 69,
    height: 69,
    borderRadius: 35,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: PREMIUM.navy,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: PREMIUM.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },

  // ADDRESS CARDS
  addressWrapper: {
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    overflow: "hidden",
    marginBottom: 13,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },

  addressWrapperSelected: {
    borderColor: PREMIUM.primary,
    borderWidth: 1.5,
    shadowColor: PREMIUM.primary,
    shadowOpacity: 0.09,
    elevation: 3,
  },

  addressPressed: {
    opacity: 0.88,
  },

  selectedTopLine: {
    height: 4,
    backgroundColor: PREMIUM.primary,
  },

  addressFooter: {
    minHeight: 43,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  addressFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D9CDD3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  radioOuterSelected: {
    borderColor: PREMIUM.primary,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PREMIUM.primary,
  },

  selectLabel: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  selectLabelActive: {
    color: PREMIUM.primary,
    fontWeight: "900",
  },

  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PREMIUM.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
  },

  selectedPillText: {
    color: PREMIUM.white,
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 4,
  },

  // ADD ADDRESS BUTTON
  addAddress: {
    minHeight: 77,
    padding: 13,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  addIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  addContent: {
    flex: 1,
    marginLeft: 12,
  },

  addTitle: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "900",
  },

  addSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 5,
  },

  arrowBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // INFO CARD
  infoCard: {
    padding: 13,
    borderRadius: 19,
    backgroundColor: PREMIUM.pinkSoft,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  infoIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    color: PREMIUM.gray,
    fontSize: 10.5,
    lineHeight: 16,
  },

  // FIXED BOTTOM BAR
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PREMIUM.white,
    borderTopWidth: 1,
    borderTopColor: PREMIUM.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 12,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  bottomAddress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  bottomLocationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomAddressInfo: {
    flex: 1,
    marginLeft: 9,
  },

  bottomAddressLabel: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "700",
  },

  bottomAddressText: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  confirm: {
    height: 52,
    minWidth: 150,
    paddingLeft: 19,
    paddingRight: 7,
    borderRadius: 27,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  confirmText: {
    color: PREMIUM.white,
    fontSize: 12,
    fontWeight: "900",
  },

  confirmIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
