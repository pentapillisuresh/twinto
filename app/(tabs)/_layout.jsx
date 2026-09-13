import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../../context";

const PREMIUM = {
  primary: "#C9004F",
  navy: "#172033",
  white: "#FFFFFF",
  border: "#E9DDE2",
  muted: "#9296A0",
  background: "#FFF9FB",
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const { itemCount = 0 } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          PREMIUM.primary,

        tabBarInactiveTintColor:
          PREMIUM.muted,

        tabBarStyle: {
          height:
            64 + insets.bottom,

          paddingTop: 8,

          paddingBottom:
            Platform.OS === "android"
              ? Math.max(
                  insets.bottom,
                  8
                )
              : insets.bottom + 5,

          borderTopWidth: 1,

          borderTopColor:
            PREMIUM.border,

          backgroundColor:
            PREMIUM.white,

          elevation: 10,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: -2,
          },

          shadowOpacity: 0.05,

          shadowRadius: 8,
        },

        tabBarLabelStyle: {
          fontSize: 10,

          fontWeight: "700",

          marginTop: 1,
        },

        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      {/* =========================================
          HOME
      ========================================= */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================================
          CATEGORIES
      ========================================= */}

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "grid"
                  : "grid-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================================
          CART
      ========================================= */}

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",

          /*
           * CART NUMBER
           *
           * 0  = no badge
           * 1  = 1
           * 2  = 2
           * 10 = 10
           * 100 = 99+
           */

          tabBarBadge:
            itemCount > 0
              ? itemCount > 99
                ? "99+"
                : itemCount
              : undefined,

          tabBarBadgeStyle: {
            backgroundColor:
              PREMIUM.primary,

            color: PREMIUM.white,

            fontSize: 9,

            fontWeight: "900",

            minWidth: 18,

            height: 18,

            lineHeight: 18,

            borderRadius: 9,

            paddingHorizontal: 4,

            marginTop: -3,

            marginRight: -5,
          },

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "cart"
                  : "cart-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================================
          ORDERS
      ========================================= */}

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "receipt"
                  : "receipt-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================================
          ACCOUNT
      ========================================= */}

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person"
                  : "person-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}