
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AuthProvider,
  CartProvider,
  LocationProvider,
} from "../context";

import {
  FlyToCartProvider,
} from "../components/cart/FlyToCart";

function RootNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <FlyToCartProvider bottomInset={insets.bottom}>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#F7F9F7",
          },
        }}
      />
    </FlyToCartProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
