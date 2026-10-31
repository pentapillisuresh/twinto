
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useLocation } from "../../context";
import { getLocations } from "../../services/locationService";

const LOCATION_STORAGE_KEY = "twinto_selected_location";

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
  success: "#16834B",
  unavailable: "#A0A4AC",
};

export default function LocationScreen() {
  const { setLocation } = useLocation();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectingId, setSelectingId] = useState(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const navigatingRef = useRef(false);

  // ========================================
  // FETCH LOCATIONS
  // ========================================

  const loadLocations = useCallback(async (refresh = false) => {
    const requestId = ++requestIdRef.current;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await getLocations();

      // Supports:
      // [...]
      // { locations: [...] }
      // { data: [...] }
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.locations)
          ? response.locations
          : Array.isArray(response?.data)
            ? response.data
            : [];

      if (
        !mountedRef.current ||
        requestId !== requestIdRef.current
      ) {
        return;
      }

      setLocations(list);
    } catch (e) {
      console.log(
        "[LOCATION] Load error:",
        e?.message
      );

      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setError(
          e?.message ||
            "Could not load delivery locations."
        );
      }
    } finally {
      if (
        mountedRef.current &&
        requestId === requestIdRef.current
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadLocations();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadLocations]);

  // ========================================
  // SELECT LOCATION
  // ========================================

  async function selectLocation(location) {
    if (
      navigatingRef.current ||
      !location ||
      location.id == null
    ) {
      return;
    }

    navigatingRef.current = true;
    setSelectingId(String(location.id));

    try {
      // Store the location for future sessions.
      await AsyncStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
      );

      // Update global location context.
      setLocation(location);

      if (!location.available) {
        router.push("/location/unavailable");
        return;
      }

      router.replace("/(tabs)");
    } catch (e) {
      console.log(
        "[LOCATION] Selection error:",
        e?.message
      );

      // Even if persistence fails, allow the
      // customer to continue this session.
      setLocation(location);

      if (!location.available) {
        router.push("/location/unavailable");
      } else {
        router.replace("/(tabs)");
      }
    } finally {
      navigatingRef.current = false;

      if (mountedRef.current) {
        setSelectingId(null);
      }
    }
  }

  // ========================================
  // LOCATION CARD
  // ========================================

  function renderLocation(location) {
    const available =
      location.available === true ||
      location.available === 1 ||
      location.available === "true";

    const selected =
      selectingId === String(location.id);

    const deliveryTime =
      location.deliveryTime ||
      location.delivery_time ||
      null;

    return (
      <Pressable
        key={String(location.id)}
        onPress={() =>
          selectLocation({
            ...location,
            available,
          })
        }
        disabled={selectingId !== null}
        accessibilityRole="button"
        accessibilityLabel={`Select ${location.name}`}
        style={({ pressed }) => [
          styles.locationCard,
          pressed && styles.locationCardPressed,
          selected && styles.locationCardSelected,
        ]}
      >
        {/* LOCATION ICON */}
        <View
          style={[
            styles.locationIcon,
            !available &&
              styles.locationIconUnavailable,
          ]}
        >
          <Ionicons
            name={
              available
                ? "location"
                : "location-outline"
            }
            size={23}
            color={
              available
                ? PREMIUM.primary
                : PREMIUM.unavailable
            }
          />
        </View>

        {/* LOCATION DETAILS */}
        <View style={styles.locationInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.locationName}>
              {location.name || "Delivery Location"}
            </Text>

            {available && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />

                <Text style={styles.availableText}>
                  Available
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.locationStatus}>
            {available
              ? deliveryTime
                ? `Delivery in ${deliveryTime}`
                : "Delivery available"
              : "Currently unavailable"}
          </Text>
        </View>

        {/* RIGHT ARROW */}
        <View style={styles.arrowBox}>
          {selected ? (
            <ActivityIndicator
              size="small"
              color={PREMIUM.primary}
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                available
                  ? PREMIUM.navy
                  : PREMIUM.unavailable
              }
            />
          )}
        </View>
      </Pressable>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.topIcon}>
          <Ionicons
            name="location"
            size={28}
            color={PREMIUM.primary}
          />
        </View>

        <Text style={styles.title}>
          Where should we deliver?
        </Text>

        <Text style={styles.subtitle}>
          Select your delivery location to see{"\n"}
          products available near you.
        </Text>
      </View>

      {/* LOCATION LIST */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadLocations(true)}
            colors={[PREMIUM.primary]}
            tintColor={PREMIUM.primary}
          />
        }
      >
        <Text style={styles.sectionTitle}>
          SELECT LOCATION
        </Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator
              size="large"
              color={PREMIUM.primary}
            />

            <Text style={styles.centerText}>
              Loading locations...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={PREMIUM.primary}
            />

            <Text style={styles.centerText}>
              {error}
            </Text>

            <Pressable
              onPress={() => loadLocations()}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryPressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={PREMIUM.white}
              />

              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : locations.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="location-outline"
              size={36}
              color={PREMIUM.muted}
            />

            <Text style={styles.centerText}>
              No delivery locations available yet.
            </Text>

            <Pressable
              onPress={() => loadLocations()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Refresh Locations
              </Text>
            </Pressable>
          </View>
        ) : (
          locations.map(renderLocation)
        )}
      </ScrollView>

      {/* BOTTOM INFO */}
      <View style={styles.bottom}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={PREMIUM.primary}
          />
        </View>

        <Text style={styles.bottomText}>
          You can change your delivery location anytime{"\n"}
          from the Home screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREMIUM.background,
  },

  header: {
    backgroundColor: PREMIUM.white,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PREMIUM.pinkLight,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: PREMIUM.navy,
    textAlign: "center",
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: PREMIUM.muted,
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: PREMIUM.muted,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 3,
  },

  centerBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  centerText: {
    marginTop: 12,
    color: PREMIUM.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: PREMIUM.primary,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  retryPressed: {
    opacity: 0.8,
  },

  retryText: {
    fontSize: 13,
    fontWeight: "800",
    color: PREMIUM.white,
  },

  locationCard: {
    backgroundColor: PREMIUM.white,
    borderWidth: 1,
    borderColor: PREMIUM.border,
    borderRadius: 20,
    minHeight: 82,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  locationCardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: PREMIUM.primary,
    backgroundColor: PREMIUM.pinkSoft,
  },

  locationCardSelected: {
    borderColor: PREMIUM.primary,
  },

  locationIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  locationIconUnavailable: {
    backgroundColor: "#F2F3F5",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  locationName: {
    fontSize: 16,
    fontWeight: "800",
    color: PREMIUM.navy,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECF8F1",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 8,
  },

  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PREMIUM.success,
    marginRight: 5,
  },

  availableText: {
    fontSize: 9,
    fontWeight: "800",
    color: PREMIUM.success,
  },

  locationStatus: {
    marginTop: 6,
    fontSize: 12,
    color: PREMIUM.muted,
    fontWeight: "500",
  },

  arrowBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F7F7F8",
    alignItems: "center",
    justifyContent: "center",
  },

  bottom: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 22,
    alignItems: "center",
    backgroundColor: PREMIUM.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: PREMIUM.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  bottomText: {
    color: PREMIUM.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
});
