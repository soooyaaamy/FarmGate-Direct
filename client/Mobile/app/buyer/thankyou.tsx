import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ThankYou() {
  const { cart, clearCart } = useCart();
  const { delivery, payment, subTotal, deliveryFee, total } =
    useLocalSearchParams();

  const orderNumber = useMemo(() => {
    return "ORD-" + Math.floor(100000 + Math.random() * 900000);
  }, []);

  const orderDate = new Date().toLocaleString();

  const handleHome = () => {
    clearCart();
    router.replace("/buyer/(tabs)/home");
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
      >
        {/* Success Icon */}
        <View className="items-center mt-32">
          <View className="bg-green-700 w-28 h-28 rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={60} color="white" />
          </View>

          <Text className="text-2xl font-bold mt-6">
            Thank You!
          </Text>
          <Text className="text-gray-500">
            Your order has been placed.
          </Text>
        </View>

        {/* Receipt Card */}
        <View className="bg-white rounded-2xl p-5 mt-6 m-7">
          <Text className="text-lg font-bold mb-3">
            Order Receipt
          </Text>

          <Text className="text-xs text-gray-500 mb-2">
            Order #: {orderNumber}
          </Text>
          <Text className="text-xs text-gray-500 mb-4">
            Date: {orderDate}
          </Text>

          {/* Items */}
          {cart.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between mb-3"
            >
              <Text className="text-sm">
                {item.name} x{item.quantity}
              </Text>
              <Text className="text-sm">
                ₱{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View className="border-t my-3" />

          {/* Delivery */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">
              Delivery Type
            </Text>
            <Text className="capitalize">
              {delivery}
            </Text>
          </View>

          {/* Payment */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">
              Payment Method
            </Text>
            <Text>
              {payment === "qr"
                ? "GCash"
                : "Cash on Delivery"}
            </Text>
          </View>

          {/* Totals */}
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">
              Subtotal
            </Text>
            <Text>₱{subTotal}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500">
              Delivery Fee
            </Text>
            <Text>₱{deliveryFee}</Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <Text className="font-bold text-base">
              Total
            </Text>
            <Text className="font-bold text-base">
              ₱{total}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4">
        <TouchableOpacity
          onPress={() => router.push("/buyer/(tabs)/profile")}
          className="bg-green-700 py-4 rounded-xl mb-3"
        >
          <Text className="text-white text-center font-bold">
            Track Order
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleHome}
          className="border border-green-700 py-4 rounded-xl"
        >
          <Text className="text-green-700 text-center font-bold">
            Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
