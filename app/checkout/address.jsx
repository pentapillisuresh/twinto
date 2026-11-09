
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../../context";
import {
  getAddresses,
  filterAddressesByLocation,
} from "../../services/addressService";
import {
  getCheckoutAddressId,
  saveValidatedCheckoutAddress,
} from "../../services/checkoutAddressService";

/* =========================================
   PREMIUM COLORS
========================================= */

const C = {
  primary: "#C9004F",
  dark: "#A90042",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  soft: "#FFF0F5",
  border: "#E9DDE2",
  muted: "#858B95",
  green: "#15803D",
  gold: "#FFE19A",
};

function validId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

/* =========================================
   ADDRESS SELECTION SCREEN
========================================= */

export default function AddressScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Use the actual delivery location from Cart Context.
  const { location } = useCart();

  const contextLocationId =
    location?.isActive !== false &&
    location?.isAvailable !== false
      ? validId(location?.id)
      : null;

  const paramLocationId = validId(
    Array.isArray(params.locationId)
      ? params.locationId[0]
      : params.locationId
  );

  // Context is the source of truth.
  // A stale route parameter must not change the area.
  const selectedLocationId = contextLocationId;

  const locationConflict =
    !!paramLocationId &&
    !!contextLocationId &&
    paramLocationId !== contextLocationId;

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  /* =========================================
     FILTER AVAILABLE ADDRESSES
  ========================================= */

  const availableAddresses =
    selectedLocationId && !locationConflict
      ? filterAddressesByLocation(
          addresses,
          selectedLocationId
        )
      : [];

  const selected =
    availableAddresses.find(
      (address) =>
        validId(address.id) === validId(selectedId)
    ) || null;

  /* =========================================
     LOAD SAVED ADDRESSES
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);
          setLoadError("");

          if (!selectedLocationId || locationConflict) {
            if (active) {
              setAddresses([]);
              setSelectedId(null);
            }
            return;
          }

          const [list, savedId] = await Promise.all([
            getAddresses(),
            getCheckoutAddressId(),
          ]);

          if (!active) return;

          const allAddresses = Array.isArray(list)
            ? list
            : [];

          const matching =
            filterAddressesByLocation(
              allAddresses,
              selectedLocationId
            );

          const previouslySelected = matching.find(
            (item) =>
              validId(item.id) === validId(savedId)
          );

          const fallback =
            matching.find((item) => item.isDefault) ||
            matching[0] ||
            null;

          setAddresses(allAddresses);
          setSelectedId(
            previouslySelected?.id ??
              fallback?.id ??
              null
          );
        } catch (error) {
          if (!active) return;

          console.log(
            "[ADDRESS SCREEN] Load error:",
            error
          );

          setLoadError(
            error?.message || "Unable to load addresses."
          );

          setAddresses([]);
          setSelectedId(null);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [selectedLocationId, locationConflict])
  );

  /* =========================================
     CONFIRM ADDRESS
  ========================================= */

  const confirm = async () => {
    if (saving) return;

    if (!selectedLocationId || locationConflict) {
      Alert.alert(
        "Delivery Location Required",
        "Please select an available delivery location."
      );
      return;
    }

    if (!selected) {
      Alert.alert(
        "Select Address",
        "Please select a delivery address."
      );
      return;
    }

    try {
      setSaving(true);

      await saveValidatedCheckoutAddress(
        selected,
        selectedLocationId
      );

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to Select Address",
        error?.message ||
          "Please try selecting the address again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     ADD ADDRESS
  ========================================= */

  const addNewAddress = () => {
    if (!selectedLocationId || locationConflict) {
      Alert.alert(
        "Select Delivery Location",
        "Please select an available delivery location first."
      );
      return;
    }

    router.push({
      pathname: "/checkout/add-address",
      params: {
        locationId: String(selectedLocationId),
      },
    });
  };

  /* =========================================
     EDIT ADDRESS
  ========================================= */

  const editAddress = (address) => {
    if (
      !address?.id ||
      !selectedLocationId ||
      locationConflict
    ) {
      return;
    }

    router.push({
      pathname: "/checkout/add-address",
      params: {
        id: String(address.id),
        locationId: String(selectedLocationId),
      },
    });
  };

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  /* =========================================
     PREMIUM UI
  ========================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.white}
        translucent={
          Platform.OS === "android" &&
          Platform.Version >= 35
        }
      />

       {/* WHITE HEADER — SAME AS PAYMENT */}
       <View style={[styles.header, { paddingTop: topInset + 10 }]}>
         <View style={styles.headerRow}>
           <Pressable
             style={styles.backButton}
             onPress={() => router.back()}
             accessibilityRole="button"
             accessibilityLabel="Go back"
           >
             <Ionicons name="arrow-back" size={22} color={C.navy} />
           </Pressable>
           <View style={styles.headerCenter}>
             <Text style={styles.headerTitle}>Delivery Address</Text>
             <Text style={styles.headerSubtitle}>Choose your delivery address</Text>
           </View>
           <View style={styles.headerTrailing}>
             <Ionicons name="location-outline" size={21} color={C.primary} />
           </View>
         </View>
       </View>

      {/* CONTENT */}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130 + insets.bottom,
        }}
      >
        {/* INTRO */}

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons
              name="map-outline"
              size={24}
              color={C.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>
              Select delivery address
            </Text>

            <Text style={styles.introSubtitle}>
              Choose where you want your groceries
              delivered.
            </Text>
          </View>
        </View>

        {/* SAVED ADDRESS HEADING */}

        <View style={styles.sectionRow}>
          <View style={styles.sectionAccent} />

          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              Saved Addresses
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your available delivery locations
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={C.primary}
            />

            <Text style={styles.countText}>
              {availableAddresses.length} SAVED
            </Text>
          </View>
        </View>

        {/* LOADING */}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color={C.primary}
            />

            <Text style={styles.loadingText}>
              Loading your addresses...
            </Text>
          </View>
        ) : availableAddresses.length === 0 ? (
          /* EMPTY STATE */

          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={35}
                color={C.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {locationConflict
                ? "Delivery location changed"
                : !selectedLocationId
                  ? "Select a delivery location"
                  : loadError
                    ? "Unable to load addresses"
                    : "No addresses in this location"}
            </Text>

            <Text style={styles.emptyText}>
              {locationConflict
                ? "Return to checkout and reopen address selection."
                : !selectedLocationId
                  ? "Choose an available delivery area before selecting an address."
                  : loadError
                    ? loadError
                    : "Add a new address in your selected delivery area."}
            </Text>
          </View>
        ) : (
          /* SAVED ADDRESS LIST */

          availableAddresses.map((item) => {
            const isSelected =
              validId(item.id) === validId(selectedId);

            return (
               <Pressable
                 key={String(item.id)}
                 onPress={() => setSelectedId(item.id)}
                 style={({ pressed }) => [
                   styles.addressWrapper,
                   isSelected && styles.addressWrapperSelected,
                   pressed && styles.pressed,
                 ]}
                 accessibilityRole="radio"
                 accessibilityState={{ selected: isSelected }}
               >
                 <View style={styles.addressMainRow}>
                   <View style={[styles.addressTypeIcon, isSelected && styles.addressTypeIconSelected]}>
                     <Ionicons
                       name={String(item.type || "").toLowerCase() === "work" ? "business-outline" : "home-outline"}
                       size={21}
                       color={C.primary}
                     />
                   </View>
                   <View style={styles.addressMainText}>
                     <View style={styles.addressNameRow}>
                       <Text style={styles.addressTypeText} numberOfLines={1}>
                         {item.type || "Home"}
                       </Text>
                       {item.isDefault && (
                         <View style={styles.defaultBadge}>
                           <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                         </View>
                       )}
                     </View>
                     <Text style={styles.addressName} numberOfLines={1}>
                       {item.name || "Customer"}
                     </Text>
                   </View>
                   <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                     {isSelected && <View style={styles.radioInner} />}
                   </View>
                 </View>
                 <View style={styles.addressDetails}>
                   <Ionicons name="location-outline" size={16} color={C.muted} />
                   <Text style={styles.addressDetailText}>
                     {[item.address, item.landmark, item.city, item.state, item.pincode]
                       .filter(Boolean).join(", ") || "Address details unavailable"}
                   </Text>
                 </View>
                 {!!(item.phone || item.mobile) && (
                   <View style={styles.addressDetails}>
                     <Ionicons name="call-outline" size={16} color={C.muted} />
                     <Text style={styles.addressDetailText}>{item.phone || item.mobile}</Text>
                   </View>
                 )}
                 <View style={styles.addressFooter}>
                   <View style={styles.radioRow}>
                     <Ionicons
                       name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                       size={17}
                       color={isSelected ? C.primary : C.muted}
                     />
                     <Text style={[styles.selectLabel, isSelected && styles.selectLabelActive]}>
                       {isSelected ? "Selected delivery address" : "Tap to select this address"}
                     </Text>
                   </View>
                   <Pressable
                     onPress={(event) => {
                       event.stopPropagation?.();
                       editAddress(item);
                     }}
                     style={styles.editAddressButton}
                     accessibilityRole="button"
                     accessibilityLabel="Edit address"
                   >
                     <Ionicons name="create-outline" size={16} color={C.primary} />
                     <Text style={styles.editAddressText}>Edit</Text>
                   </Pressable>
                 </View>
               </Pressable>
            );
          })
        )}

        {/* ADD NEW ADDRESS */}

        <Pressable
          onPress={addNewAddress}
          style={({ pressed }) => [
            styles.addAddress,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.addIcon}>
            <Ionicons
              name="add"
              size={24}
              color={C.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.addTitle}>
              Add a new address
            </Text>

            <Text style={styles.addSubtitle}>
              Add another delivery address
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={C.primary}
          />
        </Pressable>

        {/* INFORMATION */}

        <View style={styles.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={C.primary}
          />

          <Text style={styles.infoText}>
            Your delivery address helps us bring
            your groceries to the right doorstep.
          </Text>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}

      {!!selected && (
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
            <View style={styles.bottomIcon}>
              <Ionicons
                name="location"
                size={18}
                color={C.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bottomLabel}>
                Delivering to
              </Text>

              <Text
                style={styles.bottomText}
                numberOfLines={1}
              >
                {selected.type} • {selected.name}
              </Text>
            </View>
          </View>

          <Pressable
            disabled={saving}
            onPress={confirm}
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.pressed,
              saving && { opacity: 0.65 },
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={C.white}
              />
            ) : (
              <>
                <Text style={styles.confirmText}>
                  Deliver Here
                </Text>

                <View style={styles.confirmArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={C.primary}
                  />
                </View>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* =========================================
   PREMIUM STYLES
========================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
   header: {
     backgroundColor: C.white,
     paddingHorizontal: 15,
     paddingBottom: 13,
     borderBottomWidth: 1,
     borderBottomColor: C.border,
   },
   headerRow: { flexDirection: "row", alignItems: "center" },
   backButton: {
     width: 43, height: 43, borderRadius: 14,
     backgroundColor: C.soft, alignItems: "center", justifyContent: "center",
   },
   headerCenter: {
     flex: 1, minWidth: 0, alignItems: "flex-start", paddingHorizontal: 12,
   },
   headerTitle: { color: C.navy, fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
   headerSubtitle: { color: C.muted, fontSize: 10, marginTop: 3 },
   headerTrailing: {
     width: 43, height: 43, borderRadius: 14,
     backgroundColor: C.soft, alignItems: "center", justifyContent: "center",
   },
  intro: {
    margin: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  introIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  introSubtitle: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  sectionRow: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  sectionAccent: {
    width: 4,
    height: 36,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  sectionTitle: {
    color: C.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.soft,
  },
  countText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  loadingBox: {
    marginHorizontal: 16,
    paddingVertical: 48,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: C.muted,
    fontSize: 12,
  },
  emptyBox: {
    marginHorizontal: 16,
    padding: 28,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },
   addressWrapper: {
     marginHorizontal: 16,
     marginBottom: 12,
     padding: 15,
     borderRadius: 16,
     backgroundColor: C.white,
     borderWidth: 1,
     borderColor: C.border,
   },
   addressWrapperSelected: {
     borderColor: C.primary,
     backgroundColor: C.white,
   },
   addressMainRow: { flexDirection: "row", alignItems: "center", gap: 11 },
   addressTypeIcon: {
     width: 43, height: 43, borderRadius: 12,
     backgroundColor: C.soft, alignItems: "center", justifyContent: "center",
   },
   addressTypeIconSelected: { backgroundColor: C.soft },
   addressMainText: { flex: 1, minWidth: 0 },
   addressNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
   addressTypeText: { color: C.navy, fontSize: 14, fontWeight: "800" },
   addressName: { color: C.muted, fontSize: 12, marginTop: 4 },
   defaultBadge: {
     paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: C.soft,
   },
   defaultBadgeText: { color: C.primary, fontSize: 9, fontWeight: "800" },
   addressDetails: {
     flexDirection: "row", alignItems: "flex-start", gap: 9, marginTop: 12,
   },
   addressDetailText: { flex: 1, color: C.navy, fontSize: 12, lineHeight: 19 },
   addressFooter: {
     marginTop: 14, paddingTop: 12,
     borderTopWidth: 1, borderTopColor: C.border,
     flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8,
   },
   radioRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
   radioOuter: {
     width: 20, height: 20, borderRadius: 10, borderWidth: 2,
     borderColor: "#C6C8CE", alignItems: "center", justifyContent: "center",
   },
   radioOuterSelected: { borderColor: C.primary },
   radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
   selectLabel: { color: C.muted, fontSize: 11, fontWeight: "600" },
   selectLabelActive: { color: C.primary },
   editAddressButton: {
     flexDirection: "row", alignItems: "center", gap: 5,
     paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: C.soft,
   },
   editAddressText: { color: C.primary, fontSize: 11, fontWeight: "800" },
  addAddress: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 16,
    minHeight: 80,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: {
    color: C.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  addSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 17,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.soft,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  infoText: {
    flex: 1,
    color: C.dark,
    fontSize: 11,
    lineHeight: 18,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 13,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 12,
  },
  bottomAddress: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  bottomIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLabel: {
    color: C.muted,
    fontSize: 10,
  },
  bottomText: {
    color: C.navy,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  confirmButton: {
    minWidth: 148,
    height: 51,
    paddingHorizontal: 14,
    borderRadius: 26,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },
  confirmText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },
  confirmArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
