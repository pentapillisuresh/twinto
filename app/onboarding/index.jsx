
import { useState, useRef } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#C9004F",
  primaryDark: "#A80042",
  navy: "#172033",
  background: "#FFFDFB",
  white: "#FFFFFF",
  softPink: "#FCE8F0",
  softPinkLight: "#FFF4F7",
  text: "#171A21",
  muted: "#737983",
  border: "#EDE5E8",
};

// ==========================================
// ONBOARDING SLIDES
// ==========================================

const slides = [
  {
    title: "Fresh groceries, delivered fast",
    description:
      "Get fresh groceries and daily essentials delivered straight to your doorstep.",
    image: require("../../assets/images/onboard1.png"),
  },
  {
    title: "Everything you need",
    description:
      "Shop vegetables, fruits, dairy, snacks, beverages and everyday essentials.",
    image: require("../../assets/images/onboard2.png"),
  },
  {
    title: "From our store to your door",
    description:
      "Choose your favorites and enjoy a simple, fast and reliable delivery experience.",
    image: require("../../assets/images/onboard4.png"),
  },
];

// ==========================================
// ONBOARDING SCREEN
// ==========================================

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const finishingRef = useRef(false);

  const slide = slides[index];

  // ========================================
  // COMPLETE OR SKIP ONBOARDING
  // ========================================

  async function finish() {
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;
    setFinishing(true);

    try {
      await AsyncStorage.setItem(
        "twinto_onboarding",
        "true"
      );

      router.replace("/auth/login");
    } catch (error) {
      finishingRef.current = false;
      setFinishing(false);

      // Do not mark onboarding complete if
      // local storage fails.
      router.replace("/auth/login");
    }
  }

  // ========================================
  // NEXT SLIDE
  // ========================================

  function next() {
    if (finishingRef.current) {
      return;
    }

    if (index === slides.length - 1) {
      finish();
      return;
    }

    setIndex((previous) =>
      Math.min(previous + 1, slides.length - 1)
    );
  }

  // ========================================
  // PREVIOUS SLIDE
  // ========================================

  function previous() {
    if (finishingRef.current) {
      return;
    }

    setIndex((previous) => Math.max(previous - 1, 0));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {index < slides.length - 1 ? (
            <Pressable
              onPress={finish}
              disabled={finishing}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>

              <Ionicons
                name="arrow-forward"
                size={14}
                color={COLORS.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.headerSpace} />
          )}
        </View>

        {/* IMAGE AREA */}
        <View style={styles.imageContainer}>
          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />

          <Image
            source={slide.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* PAGINATION */}
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* TITLE */}
          <Text style={styles.title}>
            {slide.title}
          </Text>

          {/* DESCRIPTION */}
          <Text style={styles.description}>
            {slide.description}
          </Text>

          {/* BUTTON AREA */}
          <View style={styles.actions}>
            {index > 0 ? (
              <Pressable
                onPress={previous}
                disabled={finishing}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={COLORS.primary}
                />
              </Pressable>
            ) : (
              <View style={styles.backPlaceholder} />
            )}

            <Pressable
              onPress={next}
              disabled={finishing}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              {finishing ? (
                <ActivityIndicator
                  color={COLORS.white}
                  style={styles.buttonLoader}
                />
              ) : (
                <Text style={styles.continueText}>
                  {index === slides.length - 1
                    ? "Get Started"
                    : "Continue"}
                </Text>
              )}

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
            </Pressable>
          </View>

          {/* SLIDE COUNTER */}
          <Text style={styles.step}>
            {index + 1} / {slides.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 72,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 115,
    height: 52,
  },

  headerSpace: {
    width: 70,
  },

  skipButton: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 22,
    backgroundColor: COLORS.softPink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  skipText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  imageContainer: {
    height: "50%",
    marginHorizontal: 16,
    borderRadius: 34,
    overflow: "hidden",
    backgroundColor: COLORS.softPinkLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  circleOne: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: COLORS.softPink,
    opacity: 0.75,
    top: 30,
  },

  circleTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.white,
    opacity: 0.35,
    bottom: -50,
    right: -40,
  },

  image: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E8DDE2",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 27,
    backgroundColor: COLORS.primary,
  },

  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    color: COLORS.navy,
    textAlign: "center",
    maxWidth: 360,
  },

  description: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: "center",
    maxWidth: 350,
  },

  actions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  backButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  backPlaceholder: {
    width: 0,
    marginRight: 0,
  },

  continueButton: {
    flex: 1,
    height: 58,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 7,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  continueText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  buttonLoader: {
    flex: 1,
  },

  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  step: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
