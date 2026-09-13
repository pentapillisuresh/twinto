import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants";

export default function TipSelector({
  tip,
  setTip,
}) {
  const options = [0, 10, 20, 30];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.iconBox}>
            <Ionicons
              name="heart-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.titleContent}>
            <Text style={styles.title}>
              Tip your delivery partner
            </Text>

            <Text style={styles.subtitle}>
              100% of your tip goes to the delivery partner.
            </Text>
          </View>
        </View>
      </View>

      {/* OPTIONS */}
      <View style={styles.options}>
        {options.map((amount) => {
          const active = tip === amount;

          return (
            <Pressable
              key={amount}
              onPress={() => setTip(amount)}
              style={({ pressed }) => [
                styles.option,
                active && styles.activeOption,
                pressed && styles.optionPressed,
              ]}
            >
              {active && (
                <View style={styles.check}>
                  <Ionicons
                    name="checkmark"
                    size={8}
                    color={COLORS.white}
                  />
                </View>
              )}

              <Text
                style={[
                  styles.optionText,
                  active && styles.activeOptionText,
                ]}
              >
                {amount === 0
                  ? "No tip"
                  : `₹${amount}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* FOOTER NOTE */}
      <View style={styles.note}>
        <Ionicons
          name="information-circle-outline"
          size={13}
          color={COLORS.muted}
        />

        <Text style={styles.noteText}>
          Your kindness makes a difference.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,

    padding: 15,

    borderRadius: 18,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEDFE5",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleSection: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#FFE3EF",

    alignItems: "center",
    justifyContent: "center",
  },

  titleContent: {
    flex: 1,

    marginLeft: 10,
  },

  title: {
    color: COLORS.text,

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: -0.1,
  },

  subtitle: {
    marginTop: 4,

    color: COLORS.muted,

    fontSize: 9.5,
    lineHeight: 14,
  },

  /* OPTIONS */

  options: {
    flexDirection: "row",

    marginTop: 15,

    gap: 7,
  },

  option: {
    flex: 1,

    height: 43,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#E9DDE3",

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  activeOption: {
    borderColor: COLORS.primary,

    backgroundColor: "#FFE3EF",
  },

  optionPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  optionText: {
    color: COLORS.text,

    fontSize: 10.5,
    fontWeight: "800",
  },

  activeOptionText: {
    color: COLORS.primary,

    fontWeight: "900",
  },

  check: {
    position: "absolute",

    top: 4,
    right: 4,

    width: 13,
    height: 13,

    borderRadius: 7,

    backgroundColor: COLORS.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  /* NOTE */

  note: {
    marginTop: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  noteText: {
    marginLeft: 5,

    color: COLORS.muted,

    fontSize: 9,
    fontWeight: "600",
  },
});