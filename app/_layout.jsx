import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  AuthProvider,
  CartProvider,
  LocationProvider,
} from "../context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
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
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}