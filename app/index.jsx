
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import { COLORS } from "../constants";

import { useAuth } from "../context";

export default function SplashScreen() {
  const { user, loading: authLoading } = useAuth();

  const [splashFinished, setSplashFinished] = useState(false);

  // Keep original splash visible for 2.2 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Navigate after authentication initialization
  // and splash animation have completed.
  useEffect(() => {
    if (!splashFinished || authLoading) {
      return;
    }

    let cancelled = false;

    async function navigate() {
      try {
        const onboardingCompleted =
          await AsyncStorage.getItem("twinto_onboarding");

        if (cancelled) {
          return;
        }

        // Logged-in users skip onboarding and OTP.
        if (user) {
          router.replace("/location");
          return;
        }

        // First-time users see onboarding.
        if (onboardingCompleted !== "true") {
          router.replace("/onboarding");
          return;
        }

        // Returning users without a session log in.
        router.replace("/auth/login");
      } catch (error) {
        if (!cancelled) {
          // Safe fallback if local storage cannot be read.
          router.replace(
            user ? "/location" : "/auth/login"
          );
        }
      }
    }

    navigate();

    return () => {
      cancelled = true;
    };
  }, [splashFinished, authLoading, user]);

  return (
    <ImageBackground
      source={require("../assets/images/splash.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.bottom}>
        <ActivityIndicator
          size="small"
          color={COLORS.white}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B1023F",
    alignItems: "center",
    justifyContent: "center",
  },

  bottom: {
    position: "absolute",
    bottom: 55,
    alignItems: "center",
  },
});
