
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useLocation } from "../../context";
import {
  createAddress,
  getAddresses,
  updateAddress,
} from "../../services/addressService";

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

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();

  const params = useLocalSearchParams();
  const rawAddressId = params.id;

  const addressId = Array.isArray(rawAddressId)
    ? rawAddressId[0]
    : rawAddressId;

  const isEditMode = Boolean(addressId);

  // ORIGINAL STATE - UNCHANGED
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(isEditMode);

  const [addressType, setAddressType] = useState("HOME");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  const [city, setCity] = useState(location?.city || "");

  const [state, setState] = useState(
    location?.state || "Andhra Pradesh"
  );

  const [pincode, setPincode] = useState(
    location?.pincode || ""
  );

  const [saving, setSaving] = useState(false);

  // =========================================
  // LOAD ADDRESS FOR EDITING - UNCHANGED
  // =========================================

  useEffect(() => {
    let active = true;

    async function loadAddressForEdit() {
      if (!isEditMode) {
        setLoadingAddress(false);
        return;
      }

      try {
        setLoadingAddress(true);

        const list = await getAddresses();

        const existing = list.find(
          (item) => String(item.id) === String(addressId)
        );

        if (!existing) {
          throw new Error(
            "The selected address could not be found."
          );
        }

        if (!active) return;

        setEditingAddress(existing);
        setAddressType(existing.type || "HOME");
        setName(existing.name || "");
        setPhone(existing.mobile || existing.phone || "");
        setAddress(existing.addressLine1 || "");
        setLandmark(existing.landmark || "");
        setCity(existing.city || "");
        setState(existing.state || "Andhra Pradesh");
        setPincode(existing.pincode || "");
      } catch (error) {
        console.log("[EditAddress] Load failed:", error);

        if (active) {
          Alert.alert(
            "Could not load address",
            error?.message || "Please try again.",
            [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]
          );
        }
      } finally {
        if (active) setLoadingAddress(false);
      }
    }

    loadAddressForEdit();

    return () => {
      active = false;
    };
  }, [addressId, isEditMode]);

  // =========================================
  // SAVE ADDRESS - UNCHANGED
  // =========================================

  async function saveAddress() {
    // Preserve existing delivery location when editing
    const locationId = Number(
      editingAddress?.locationId || location?.id
    );

    if (!Number.isSafeInteger(locationId) || locationId <= 0) {
      Alert.alert(
        "Delivery Location Required",
        "Please select your delivery location before adding an address."
      );
      return;
    }

    // Required fields validation
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      Alert.alert(
        "Required",
        "Please fill name, phone, address, city and pincode."
      );
      return;
    }

    // Phone validation
    if (phone.trim().replace(/\D/g, "").length !== 10) {
      Alert.alert(
        "Invalid Phone",
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    // Pincode validation
    if (pincode.trim().replace(/\D/g, "").length !== 6) {
      Alert.alert(
        "Invalid Pincode",
        "Enter a valid 6-digit pincode."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        mobile: phone.trim(),
        addressLine1: address.trim(),
        addressLine2:
          editingAddress?.addressLine2 || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim() || "Andhra Pradesh",
        pincode: pincode.trim(),
        type: addressType,
        isDefault: editingAddress?.isDefault ?? false,

        // Preserve existing location
        locationId,
      };

      console.log(
        "[AddAddress] Sending payload:",
        payload
      );

      const result = isEditMode
        ? await updateAddress(addressId, payload)
        : await createAddress(payload);

      console.log(
        isEditMode
          ? "[EditAddress] Success:"
          : "[AddAddress] Success:",
        result
      );

      Alert.alert(
        isEditMode ? "Updated" : "Saved",
        isEditMode
          ? "Address updated successfully."
          : "Address added successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log(
        isEditMode
          ? "[EditAddress] FAILED:"
          : "[AddAddress] FAILED:",
        error
      );

      Alert.alert(
        "Could not save address",
        error?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // HEADER SAFE AREA
  // =========================================

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  // =========================================
  // REUSABLE PREMIUM INPUT
  // =========================================

  function renderInput({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType,
    maxLength,
    autoCapitalize,
    multiline,
    optional,
  }) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {label}

          {optional && (
            <Text style={styles.optional}>
              {" "}(Optional)
            </Text>
          )}
        </Text>

        <View
          style={[
            styles.inputWrapper,
            multiline && styles.textAreaWrapper,
          ]}
        >
          <View
            style={[
              styles.inputIcon,
              multiline && styles.inputIconTop,
            ]}
          >
            <Ionicons
              name={icon}
              size={17}
              color={PREMIUM.primary}
            />
          </View>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A5A9B0"
            style={[
              styles.input,
              multiline && styles.textArea,
            ]}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            selectionColor={PREMIUM.primary}
          />
        </View>
      </View>
    );
  }

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

      {/* =====================================
          PREMIUM FIXED HEADER
      ===================================== */}
      <View
        style={[
          styles.header,
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
              {isEditMode
                ? "Edit Address"
                : "Add New Address"}
            </Text>

            <Text style={styles.headerSubtitle}>
              {isEditMode
                ? "Update your delivery address"
                : "Add your delivery location"}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoIcon}>
            <Ionicons
              name={
                isEditMode
                  ? "create-outline"
                  : "location-outline"
              }
              size={21}
              color={PREMIUM.gold}
            />
          </View>

          <View style={styles.headerInfoContent}>
            <Text style={styles.headerInfoTitle}>
              {isEditMode
                ? "Update delivery details"
                : "Your doorstep, our destination"}
            </Text>

            <Text style={styles.headerInfoSubtitle}>
              {isEditMode
                ? "Keep your address information up to date"
                : "Add an address for smooth grocery delivery"}
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

      {/* =====================================
          ORIGINAL LOADING STATE
      ===================================== */}
      {loadingAddress ? (
        <View style={styles.loadingAddress}>
          <ActivityIndicator
            size="large"
            color={PREMIUM.primary}
          />

          <Text style={styles.loadingAddressText}>
            Loading address...
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              {
                paddingBottom: 130 + insets.bottom,
              },
            ]}
          >
            {/* INTRO */}
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Ionicons
                  name="map-outline"
                  size={23}
                  color={PREMIUM.primary}
                />
              </View>

              <View style={styles.introContent}>
                <Text style={styles.introTitle}>
                  Where should we deliver?
                </Text>

                <Text style={styles.introText}>
                  Add your complete address so we can
                  deliver your groceries quickly.
                </Text>
              </View>
            </View>

            {/* =====================================
                SELECTED DELIVERY LOCATION
            ===================================== */}
            <View style={styles.locationCard}>
              <View style={styles.locationIconBox}>
                <Ionicons
                  name="location"
                  size={21}
                  color={PREMIUM.primary}
                />
              </View>

              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>
                  DELIVERY LOCATION
                </Text>

                <Text style={styles.locationName}>
                  {location?.name ||
                    location?.city ||
                    "No location selected"}
                </Text>

                <Text style={styles.locationPincode}>
                  {[location?.city, location?.pincode]
                    .filter(Boolean)
                    .join(" - ")}
                </Text>
              </View>

              <View
                style={[
                  styles.locationStatus,
                  {
                    backgroundColor: location?.id
                      ? "#EAF8F0"
                      : "#FFF3E8",
                  },
                ]}
              >
                <Ionicons
                  name={
                    location?.id
                      ? "checkmark-circle"
                      : "alert-circle-outline"
                  }
                  size={21}
                  color={
                    location?.id
                      ? "#16834B"
                      : "#D97706"
                  }
                />
              </View>
            </View>

            {/* =====================================
                ADDRESS TYPE
            ===================================== */}
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="pricetag-outline"
                    size={19}
                    color={PREMIUM.primary}
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Address Type
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Select a label for this address
                  </Text>
                </View>
              </View>

              <View style={styles.typeRow}>
                {["HOME", "WORK", "OTHER"].map((type) => {
                  const selected = addressType === type;

                  return (
                    <Pressable
                      key={type}
                      onPress={() => setAddressType(type)}
                      style={({ pressed }) => [
                        styles.typeButton,
                        selected &&
                          styles.typeButtonSelected,
                        pressed &&
                          styles.typeButtonPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.typeIcon,
                          selected &&
                            styles.typeIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={
                            type === "HOME"
                              ? "home-outline"
                              : type === "WORK"
                              ? "briefcase-outline"
                              : "location-outline"
                          }
                          size={19}
                          color={
                            selected
                              ? PREMIUM.white
                              : PREMIUM.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.typeText,
                          selected &&
                            styles.typeTextSelected,
                        ]}
                      >
                        {type}
                      </Text>

                      {selected && (
                        <View style={styles.typeCheck}>
                          <Ionicons
                            name="checkmark"
                            size={10}
                            color={PREMIUM.primary}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* =====================================
                CONTACT DETAILS
            ===================================== */}
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color={PREMIUM.primary}
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Contact Details
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Details for delivery communication
                  </Text>
                </View>
              </View>

              {/* NAME */}
              {renderInput({
                label: "Full Name",
                value: name,
                onChangeText: setName,
                placeholder: "Enter your name",
                icon: "person-outline",
                autoCapitalize: "words",
              })}

              {/* PHONE */}
              {renderInput({
                label: "Phone Number",
                value: phone,
                onChangeText: (t) =>
                  setPhone(
                    t.replace(/[^0-9]/g, "").slice(0, 10)
                  ),
                placeholder: "Enter phone number",
                icon: "call-outline",
                keyboardType: "phone-pad",
                maxLength: 10,
              })}
            </View>

            {/* =====================================
                ADDRESS DETAILS
            ===================================== */}
            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="map-outline"
                    size={19}
                    color={PREMIUM.primary}
                  />
                </View>

                <View style={styles.sectionHeadingText}>
                  <Text style={styles.sectionTitle}>
                    Address Details
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Enter your complete delivery address
                  </Text>
                </View>
              </View>

              {/* COMPLETE ADDRESS */}
              {renderInput({
                label: "Complete Address",
                value: address,
                onChangeText: setAddress,
                placeholder:
                  "House / Flat / Street / Area",
                icon: "location-outline",
                multiline: true,
              })}

              {/* LANDMARK */}
              {renderInput({
                label: "Landmark",
                value: landmark,
                onChangeText: setLandmark,
                placeholder: "Nearby landmark",
                icon: "navigate-outline",
                optional: true,
              })}

              {/* CITY + STATE */}
              <View style={styles.row}>
                <View style={styles.cityInput}>
                  {renderInput({
                    label: "City",
                    value: city,
                    onChangeText: setCity,
                    placeholder: "City",
                    icon: "business-outline",
                    autoCapitalize: "words",
                  })}
                </View>

                <View style={styles.stateInput}>
                  {renderInput({
                    label: "State",
                    value: state,
                    onChangeText: setState,
                    placeholder: "State",
                    icon: "map-outline",
                    autoCapitalize: "words",
                  })}
                </View>
              </View>

              {/* PINCODE */}
              {renderInput({
                label: "Pincode",
                value: pincode,
                onChangeText: (t) =>
                  setPincode(
                    t.replace(/[^0-9]/g, "").slice(0, 6)
                  ),
                placeholder: "Pincode",
                icon: "keypad-outline",
                keyboardType: "number-pad",
                maxLength: 6,
              })}
            </View>

            {/* =====================================
                SECURITY CARD
            ===================================== */}
            <View style={styles.secureCard}>
              <View style={styles.secureIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={PREMIUM.primary}
                />
              </View>

              <View style={styles.secureContent}>
                <Text style={styles.secureTitle}>
                  Your address is secure
                </Text>

                <Text style={styles.secureText}>
                  Your information is only used for
                  order delivery.
                </Text>
              </View>

              <View style={styles.secureBadge}>
                <Ionicons
                  name="lock-closed"
                  size={13}
                  color={PREMIUM.primary}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* =====================================
          FIXED SAVE BUTTON
      ===================================== */}
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
        <Pressable
          onPress={
            saving || loadingAddress
              ? undefined
              : saveAddress
          }
          disabled={saving || loadingAddress}
          style={({ pressed }) => [
            styles.saveButton,
            (saving || loadingAddress) &&
              styles.saveButtonDisabled,
            pressed &&
              !saving &&
              styles.saveButtonPressed,
          ]}
        >
          <View style={styles.saveLeftIcon}>
            {saving ? (
              <ActivityIndicator
                size="small"
                color={PREMIUM.white}
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={PREMIUM.white}
              />
            )}
          </View>

          <Text style={styles.saveButtonText}>
            {saving
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
              ? "Update Address"
              : "Save Address"}
          </Text>

          <View style={styles.saveArrow}>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={PREMIUM.primary}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// =========================================
// PREMIUM STYLES
// =========================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  // LOADING
  loadingAddress: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingAddressText: {
    color: PREMIUM.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 12,
  },

  // PREMIUM HEADER
  header: {
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

  // SCROLL CONTENT
  content: {
    paddingHorizontal: 16,
    paddingTop: 17,
  },

  // INTRO
  introCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  introIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  introText: {
    color: PREMIUM.muted,
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
  },

  // LOCATION
  locationCard: {
    backgroundColor: PREMIUM.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  locationIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  locationLabel: {
    color: PREMIUM.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  locationName: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 5,
  },

  locationPincode: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  locationStatus: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  // SECTIONS
  section: {
    backgroundColor: PREMIUM.white,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    padding: 15,
    marginBottom: 14,
    shadowColor: "#7A2949",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeadingText: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    color: PREMIUM.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: PREMIUM.muted,
    fontSize: 10,
    marginTop: 4,
  },

  // ADDRESS TYPE
  typeRow: {
    flexDirection: "row",
    gap: 9,
  },

  typeButton: {
    flex: 1,
    minHeight: 85,
    borderRadius: 19,
    backgroundColor: PREMIUM.background,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },

  typeButtonSelected: {
    backgroundColor: PREMIUM.primary,
    borderColor: PREMIUM.primary,
  },

  typeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  typeIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  typeIconSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  typeText: {
    color: PREMIUM.navy,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 7,
  },

  typeTextSelected: {
    color: PREMIUM.white,
  },

  typeCheck: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  // INPUTS
  inputGroup: {
    marginTop: 12,
  },

  label: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
  },

  optional: {
    color: PREMIUM.muted,
    fontWeight: "600",
  },

  inputWrapper: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: PREMIUM.background,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    color: PREMIUM.navy,
    fontSize: 12,
    marginLeft: 10,
    paddingVertical: 8,
    minWidth: 0,
  },

  textAreaWrapper: {
    minHeight: 105,
    alignItems: "flex-start",
    paddingTop: 10,
  },

  inputIconTop: {
    marginTop: 1,
  },

  textArea: {
    minHeight: 85,
    paddingTop: 7,
  },

  row: {
    flexDirection: "row",
    gap: 9,
  },

  cityInput: {
    flex: 1.1,
    minWidth: 0,
  },

  stateInput: {
    flex: 0.9,
    minWidth: 0,
  },

  // SECURITY CARD
  secureCard: {
    backgroundColor: PREMIUM.pinkSoft,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  secureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  secureContent: {
    flex: 1,
    marginLeft: 11,
  },

  secureTitle: {
    color: PREMIUM.navy,
    fontSize: 12,
    fontWeight: "900",
  },

  secureText: {
    color: PREMIUM.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  secureBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
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
    elevation: 12,
    shadowColor: PREMIUM.navy,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  saveButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: PREMIUM.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  saveLeftIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    flex: 1,
    color: PREMIUM.white,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },

  saveArrow: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
