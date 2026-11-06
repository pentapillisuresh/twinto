
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const C = {
  primary: "#C9004F",
  navy: "#172033",
  muted: "#858B95",
  soft: "#FFF0F5",
  white: "#FFFFFF",
};

export default function AddressCard({
  address,
  selected = true,
  onChange,
}) {
  const type = address?.type || "HOME";

  const icon =
    type.toUpperCase() === "WORK"
      ? "briefcase-outline"
      : type.toUpperCase() === "HOME"
      ? "home-outline"
      : "location-outline";

  const fullAddress =
    address?.address ||
    [
      address?.addressLine1,
      address?.addressLine2,
      address?.landmark,
      address?.city,
      address?.state,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  const phone = address?.phone || address?.mobile;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon}
            size={22}
            color={C.primary}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.typeRow}>
            <Text style={styles.type}>
              {type}
            </Text>

            {address?.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>
                  DEFAULT
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {address?.name || "Delivery Address"}
          </Text>
        </View>

        <Pressable
          onPress={onChange}
          style={styles.editButton}
        >
          <Ionicons
            name="create-outline"
            size={15}
            color={C.primary}
          />

          <Text style={styles.editText}>
            Edit
          </Text>
        </Pressable>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="location-outline"
          size={17}
          color={C.primary}
        />

        <Text style={styles.address}>
          {fullAddress || "Address not available"}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="call-outline"
          size={16}
          color={C.primary}
        />

        <Text style={styles.phone}>
          {phone || "Phone not available"}
        </Text>
      </View>

      <View style={styles.selectionRow}>
        <View
          style={[
            styles.radio,
            selected && styles.radioSelected,
          ]}
        >
          {selected && <View style={styles.radioDot} />}
        </View>

        <Text
          style={[
            styles.selectionText,
            selected && styles.selectionTextActive,
          ]}
        >
          {selected
            ? "Selected for delivery"
            : "Tap to deliver here"}
        </Text>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={21}
            color={C.primary}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // No card background, border, shadow or margin.
  // Parent AddressScreen owns the only card.
  container: {
    padding: 16,
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: C.soft,
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginHorizontal: 11,
  },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  type: {
    color: C.navy,
    fontSize: 14,
    fontWeight: "900",
  },

  defaultBadge: {
    backgroundColor: C.soft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  defaultText: {
    color: C.primary,
    fontSize: 8,
    fontWeight: "900",
  },

  name: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
    fontWeight: "600",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
  },

  editText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginTop: 17,
    paddingHorizontal: 3,
  },

  address: {
    flex: 1,
    color: C.navy,
    fontSize: 11.5,
    lineHeight: 19,
    fontWeight: "500",
  },

  phone: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F3EBEF",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D8CDD2",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: C.primary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.primary,
  },

  selectionText: {
    flex: 1,
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  selectionTextActive: {
    color: C.primary,
    fontWeight: "900",
  },
});
