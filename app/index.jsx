import { useEffect } from "react";

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import { COLORS } from "../constants";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/splash.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.bottom}>
        <ActivityIndicator size="small" color={COLORS.white} />
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