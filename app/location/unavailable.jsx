import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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
};

export default function LocationUnavailable() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <View style={styles.iconInner}>
            <Ionicons
              name="location-outline"
              size={48}
              color={PREMIUM.primary}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          We are coming soon!
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          TWINTO is not currently delivering to
          {"\n"}
          this location. We are expanding rapidly
          {"\n"}
          and hope to reach you soon.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="notifications-outline"
              size={23}
              color={PREMIUM.primary}
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>
              Stay updated
            </Text>

            <Text style={styles.infoDescription}>
              Check back soon for delivery
              {"\n"}
              availability in your area.
            </Text>
          </View>
        </View>

        {/* Button */}
        <Pressable
          onPress={() => router.replace("/location")}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            Choose Another Location
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color={PREMIUM.white}
          />
        </Pressable>

        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={PREMIUM.navy}
          />

          <Text style={styles.backText}>
            Go Back
          </Text>
        </Pressable>
      </View>

      {/* Bottom Branding */}
      <View style={styles.footer}>
        <View style={styles.footerDot} />

        <Text style={styles.footerText}>
          TWINTO • Fresh groceries, delivered
        </Text>

        <View style={styles.footerDot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  /* Main Icon */
  iconCircle: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  iconInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: PREMIUM.white,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Text */
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: PREMIUM.navy,
    textAlign: "center",
    letterSpacing: -0.6,
  },

  description: {
    marginTop: 13,
    color: PREMIUM.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },

  /* Information */
  infoCard: {
    width: "100%",
    marginTop: 30,
    padding: 17,
    borderRadius: 20,
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    flex: 1,
    marginLeft: 13,
  },

  infoTitle: {
    color: PREMIUM.navy,
    fontSize: 15,
    fontWeight: "800",
  },

  infoDescription: {
    color: PREMIUM.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  /* Main Button */
  button: {
    width: "100%",
    height: 56,
    borderRadius: 17,
    backgroundColor: PREMIUM.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },

  buttonPressed: {
    backgroundColor: PREMIUM.primaryDark,
    transform: [{ scale: 0.985 }],
  },

  buttonText: {
    color: PREMIUM.white,
    fontSize: 15,
    fontWeight: "800",
    marginRight: 10,
  },

  /* Back Button */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },

  backText: {
    color: PREMIUM.navy,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM.primary,
    marginHorizontal: 8,
  },

  footerText: {
    color: PREMIUM.muted,
    fontSize: 10,
    fontWeight: "600",
  },
});