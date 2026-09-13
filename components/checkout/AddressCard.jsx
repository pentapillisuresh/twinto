import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function AddressCard({
  address,
  selected = true,
  onChange,
}) {
  return (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
    >
      {/* TOP */}
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Ionicons
            name="home"
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.type}>
              {address.type}
            </Text>

            <View style={styles.defaultBadge}>
              <Ionicons
                name="checkmark-circle"
                size={10}
                color={COLORS.primary}
              />

              <Text style={styles.defaultText}>
                DEFAULT
              </Text>
            </View>
          </View>

          <Text style={styles.name}>
            {address.name}
          </Text>
        </View>

        <Pressable
          onPress={onChange}
          style={({ pressed }) => [
            styles.change,
            pressed && styles.changePressed,
          ]}
        >
          <Text style={styles.changeText}>
            Change
          </Text>
        </Pressable>
      </View>

      {/* ADDRESS */}
      <View style={styles.addressSection}>
        <View style={styles.addressIcon}>
          <Ionicons
            name="location-outline"
            size={15}
            color={COLORS.muted}
          />
        </View>

        <Text style={styles.address}>
          {address.address}
        </Text>
      </View>

      {/* PHONE */}
      <View style={styles.phoneRow}>
        <View style={styles.phoneIcon}>
          <Ionicons
            name="call-outline"
            size={13}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.phone}>
          {address.phone}
        </Text>
      </View>

      {/* SELECTED */}
      <View style={styles.selectedRow}>
        <View
          style={[
            styles.radio,
            selected && styles.radioSelected,
          ]}
        >
          {selected && (
            <View style={styles.radioDot} />
          )}
        </View>

        <Text style={styles.selectedText}>
          Deliver to this address
        </Text>

        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons
              name="checkmark"
              size={11}
              color={COLORS.white}
            />

            <Text style={styles.selectedBadgeText}>
              SELECTED
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 0,

    padding: 15,

    borderRadius: 19,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  selectedContainer: {
    borderColor: "#F0C7D8",
  },

  /* TOP */

  top: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,

    marginLeft: 11,
    marginRight: 7,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  type: {
    color: COLORS.text,

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 0.2,
  },

  defaultBadge: {
    marginLeft: 7,

    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 8,

    backgroundColor: "#FFE3EF",

    flexDirection: "row",
    alignItems: "center",
  },

  defaultText: {
    marginLeft: 3,

    color: COLORS.primary,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.4,
  },

  name: {
    marginTop: 4,

    color: COLORS.muted,

    fontSize: 10.5,
    fontWeight: "600",
  },

  change: {
    paddingHorizontal: 5,
    paddingVertical: 8,

    borderRadius: 8,
  },

  changePressed: {
    backgroundColor: "#FFE3EF",
  },

  changeText: {
    color: COLORS.primary,

    fontSize: 11,
    fontWeight: "900",
  },

  /* ADDRESS */

  addressSection: {
    marginTop: 14,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  addressIcon: {
    width: 26,
    height: 26,

    borderRadius: 9,

    backgroundColor: "#F8F5F7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  address: {
    flex: 1,

    paddingTop: 2,

    color: COLORS.textSecondary,

    fontSize: 11.5,
    lineHeight: 18,
  },

  /* PHONE */

  phoneRow: {
    marginTop: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  phoneIcon: {
    width: 26,
    height: 26,

    borderRadius: 9,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  phone: {
    color: COLORS.muted,

    fontSize: 10.5,
    fontWeight: "600",
  },

  /* SELECTED */

  selectedRow: {
    marginTop: 14,
    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: "#F0E5EA",

    flexDirection: "row",
    alignItems: "center",
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
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: COLORS.primary,
  },

  selectedText: {
    flex: 1,

    marginLeft: 8,

    color: COLORS.text,

    fontSize: 10.5,
    fontWeight: "800",
  },

  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 9,

    backgroundColor: COLORS.primary,

    flexDirection: "row",
    alignItems: "center",
  },

  selectedBadgeText: {
    marginLeft: 3,

    color: COLORS.white,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.3,
  },
});