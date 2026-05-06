import { CartProvider } from "@/context/CartContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register"/>
          <Stack.Screen name="buyer/(tabs)" />
          <Stack.Screen name="farmer/(tabs)" />
          <Stack.Screen name="products/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="farmer/products/delete-product" />
        </Stack>
      </CartProvider>
    </GestureHandlerRootView>
  );
}