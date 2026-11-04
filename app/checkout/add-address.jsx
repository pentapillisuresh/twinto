
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { COLORS } from "../../constants";
import { useLocation } from "../../context";
import {
  createAddress,
  getAddresses,
  updateAddress,
} from "../../services/addressService";

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const params = useLocalSearchParams();
  const rawAddressId = params.id;
  const addressId = Array.isArray(rawAddressId)
    ? rawAddressId[0]
    : rawAddressId;
  const isEditMode = Boolean(addressId);

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
  // LOAD ADDRESS FOR EDITING
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
          throw new Error("The selected address could not be found.");
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
            [{ text: "OK", onPress: () => router.back() }]
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
  // SAVE ADDRESS
  // =========================================

  async function saveAddress() {
    // Keep the address linked to its existing delivery location when editing.
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

    if (phone.trim().replace(/\D/g, "").length !== 10) {
      Alert.alert(
        "Invalid Phone",
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

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
        addressLine2: editingAddress?.addressLine2 || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim() || "Andhra Pradesh",
        pincode: pincode.trim(),
        type: addressType,
        isDefault: editingAddress?.isDefault ?? false,

        // Preserve the existing delivery location when editing.
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
        isEditMode ? "[EditAddress] Success:" : "[AddAddress] Success:",
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
        isEditMode ? "[EditAddress] FAILED:" : "[AddAddress] FAILED:",
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
  // SCREEN UI
  // =========================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Address" : "Add New Address"}
          </Text>

          <Text style={styles.headerSubtitle}>
            {isEditMode
              ? "Update your delivery address"
              : "Add your delivery location"}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {loadingAddress ? (
        <View style={styles.loadingAddress}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingAddressText}>Loading address...</Text>
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
                name="location"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>
                Where should we deliver?
              </Text>

              <Text style={styles.introText}>
                Add your complete address so we can deliver your groceries
                quickly.
              </Text>
            </View>
          </View>

          {/* SELECTED DELIVERY LOCATION */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconBox}>
              <Ionicons
                name="location"
                size={20}
                color={COLORS.primary}
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

            {location?.id ? (
              <Ionicons
                name="checkmark-circle"
                size={21}
                color="#16834B"
              />
            ) : (
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#D97706"
              />
            )}
          </View>

          {/* ADDRESS TYPE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Address Type
            </Text>

            <Text style={styles.sectionSubtitle}>
              Select a label for this address
            </Text>

            <View style={styles.typeRow}>
              {["HOME", "WORK", "OTHER"].map((type) => {
                const selected = addressType === type;

                return (
                  <Pressable
                    key={type}
                    onPress={() => setAddressType(type)}
                    style={({ pressed }) => [
                      styles.typeButton,
                      selected && styles.typeButtonSelected,
                      pressed && styles.typeButtonPressed,
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
                      size={17}
                      color={
                        selected
                          ? COLORS.white
                          : COLORS.primary
                      }
                    />

                    <Text
                      style={[
                        styles.typeText,
                        selected && styles.typeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* CONTACT DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Contact Details
            </Text>

            <Text style={styles.sectionSubtitle}>
              Details for delivery communication
            </Text>

            {/* NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={COLORS.muted}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#A5A9B0"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* PHONE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={COLORS.muted}
                />

                <TextInput
                  value={phone}
                  onChangeText={(t) =>
                    setPhone(
                      t.replace(/[^0-9]/g, "").slice(0, 10)
                    )
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor="#A5A9B0"
                  style={styles.input}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          {/* ADDRESS DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Address Details
            </Text>

            <Text style={styles.sectionSubtitle}>
              Enter your complete delivery address
            </Text>

            {/* COMPLETE ADDRESS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Complete Address
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={COLORS.muted}
                  style={styles.textAreaIcon}
                />

                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="House / Flat / Street / Area"
                  placeholderTextColor="#A5A9B0"
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* LANDMARK */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Landmark
                <Text style={styles.optional}>
                  {" "}(Optional)
                </Text>
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color={COLORS.muted}
                />

                <TextInput
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="Nearby landmark"
                  placeholderTextColor="#A5A9B0"
                  style={styles.input}
                />
              </View>
            </View>

            {/* CITY AND STATE */}
            <View style={styles.row}>
              <View
                style={[
                  styles.inputGroup,
                  styles.cityInput,
                ]}
              >
                <Text style={styles.label}>
                  City
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={COLORS.muted}
                  />

                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#A5A9B0"
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View
                style={[
                  styles.inputGroup,
                  styles.stateInput,
                ]}
              >
                <Text style={styles.label}>
                  State
                </Text>

                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="map-outline"
                    size={16}
                    color={COLORS.muted}
                  />

                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="State"
                    placeholderTextColor="#A5A9B0"
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* PINCODE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Pincode
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="keypad-outline"
                  size={16}
                  color={COLORS.muted}
                />

                <TextInput
                  value={pincode}
                  onChangeText={(t) =>
                    setPincode(
                      t.replace(/[^0-9]/g, "").slice(0, 6)
                    )
                  }
                  placeholder="Pincode"
                  placeholderTextColor="#A5A9B0"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          {/* SECURE */}
          <View style={styles.secureCard}>
            <View style={styles.secureIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.secureContent}>
              <Text style={styles.secureTitle}>
                Your address is secure
              </Text>

              <Text style={styles.secureText}>
                Your information is only used for order delivery.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}

      {/* SAVE BUTTON */}
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
          onPress={saving || loadingAddress ? undefined : saveAddress}
          disabled={saving || loadingAddress}
          style={({ pressed }) => [
            styles.saveButton,
            saving && { opacity: 0.6 },
            pressed &&
              !saving &&
              styles.saveButtonPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
            />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={COLORS.white}
            />
          )}

          <Text style={styles.saveButtonText}>
            {saving
              ? (isEditMode ? "Updating..." : "Saving...")
              : (isEditMode ? "Update Address" : "Save Address")}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={COLORS.white}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  loadingAddress: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingAddressText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 17,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 8.5,
    fontWeight: "600",
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  pressed: {
    opacity: 0.7,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    flex: 1,
    marginLeft: 11,
  },

  introTitle: {
    color: COLORS.text,
    fontSize: 13.5,
    fontWeight: "900",
  },

  introText: {
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },

  // LOCATION CARD

  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    padding: 13,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  locationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 11,
  },

  locationLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  locationName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },

  locationPincode: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },

  // SECTIONS

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#EEDFE5",
    padding: 15,
    marginBottom: 13,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
    marginBottom: 13,
  },

  // ADDRESS TYPE

  typeRow: {
    flexDirection: "row",
    gap: 8,
  },

  typeButton: {
    flex: 1,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#FFF8FB",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  typeButtonPressed: {
    opacity: 0.8,
  },

  typeText: {
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: "900",
    marginLeft: 5,
  },

  typeTextSelected: {
    color: COLORS.white,
  },

  // INPUTS

  inputGroup: {
    marginTop: 11,
  },

  label: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
  },

  optional: {
    color: COLORS.muted,
    fontWeight: "600",
  },

  inputWrapper: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#FFF9FB",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    marginLeft: 9,
    paddingVertical: 0,
  },

  textAreaWrapper: {
    minHeight: 82,
    alignItems: "flex-start",
    paddingTop: 12,
  },

  textAreaIcon: {
    marginTop: 1,
  },

  textArea: {
    height: 65,
    paddingTop: 0,
  },

  row: {
    flexDirection: "row",
    gap: 9,
  },

  cityInput: {
    flex: 1.1,
  },

  stateInput: {
    flex: 0.9,
  },

  // SECURITY CARD

  secureCard: {
    backgroundColor: "#FFF0F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1D2DF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  secureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  secureContent: {
    flex: 1,
    marginLeft: 10,
  },

  secureTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  secureText: {
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 3,
  },

  // BOTTOM SAVE BAR

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#EEDFE5",
    paddingHorizontal: 16,
    paddingTop: 10,
    elevation: 12,
  },

  saveButton: {
    height: 51,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 9,
  },

  saveButtonText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  saveButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
