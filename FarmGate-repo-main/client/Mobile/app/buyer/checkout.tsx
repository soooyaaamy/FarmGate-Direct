import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.8.26:5000";

export default function Checkout() {
  const { buyerId, items } = useLocalSearchParams();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [payment, setPayment] = useState<"qr" | "cod">("qr");
  const [buyerName, setBuyerName] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        router.replace("/login"); // redirect if not logged in
        return;
      }
      const user = JSON.parse(userString);
      setBuyerName(user.fullName); // <-- and buyerName
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (items) {
      setCart(JSON.parse(items as string));
    }
  }, []);

  // subtotal
  const subTotal = cart.reduce((sum, farm) => {
    return (
      sum +
      farm.products.reduce(
        (pSum: number, p: any) => pSum + parseFloat(p.price) * p.quantity,
        0,
      )
    );
  }, 0);

  const deliveryFee = delivery === "delivery" ? 35 : 0;
  const total = subTotal + deliveryFee;

  const placeOrder = async () => {
    if (!buyerId) {
      Alert.alert("Error", "Buyer not found");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/orders/${buyerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          delivery,
          payment,
          buyerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      Alert.alert("Success", "Order placed!");

      router.replace({
        pathname: "/buyer/thankyou",
        params: {
          delivery,
          payment,
          subTotal,
          deliveryFee,
          total,
        },
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No items to checkout</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* HEADER */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text className="ml-3 text-lg font-semibold">Checkout</Text>
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* CART ITEMS */}

        <Text className="font-semibold text-base mt-4 mb-2">Items</Text>

        {cart.map((farm: any) =>
          farm.products.map((p: any) => (
            <View key={p.id} className="flex-row bg-white p-3 rounded-xl mb-3">
              <Image
                source={{ uri: p.image }}
                className="w-16 h-16 rounded-lg bg-gray-200"
              />

              <View className="flex-1 ml-3">
                <Text className="font-semibold">{p.name}</Text>

                <Text className="text-xs text-gray-500">₱{p.price}</Text>

                <Text className="text-xs text-gray-500 mt-1">
                  Qty: {p.quantity}
                </Text>
              </View>

              <Text className="font-semibold">
                ₱{(parseFloat(p.price) * p.quantity).toFixed(2)}
              </Text>
            </View>
          )),
        )}

        {/* DELIVERY */}

        <Text className="font-semibold text-base mt-4 mb-2">Delivery</Text>

        <TouchableOpacity
          onPress={() => setDelivery("pickup")}
          className={`bg-white p-4 rounded-xl mb-3 flex-row items-center ${
            delivery === "pickup" ? "border border-green-700" : ""
          }`}
        >
          <Ionicons name="leaf-outline" size={22} />

          <Text className="ml-3 font-semibold">Farm Pickup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDelivery("delivery")}
          className={`bg-white p-4 rounded-xl mb-4 flex-row items-center ${
            delivery === "delivery" ? "border border-green-700" : ""
          }`}
        >
          <Ionicons name="car-outline" size={22} />

          <Text className="ml-3 font-semibold">Delivery (+₱35)</Text>
        </TouchableOpacity>

        {/* PAYMENT */}

        <Text className="font-semibold text-base mb-2">Payment</Text>

        <TouchableOpacity
          onPress={() => setPayment("qr")}
          className={`bg-white p-4 rounded-xl mb-3 flex-row items-center ${
            payment === "qr" ? "border border-green-700" : ""
          }`}
        >
          <Ionicons name="qr-code-outline" size={22} />

          <Text className="ml-3 font-semibold">GCash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPayment("cod")}
          className={`bg-white p-4 rounded-xl mb-4 flex-row items-center ${
            payment === "cod" ? "border border-green-700" : ""
          }`}
        >
          <Ionicons name="cash-outline" size={22} />

          <Text className="ml-3 font-semibold">Cash on Delivery</Text>
        </TouchableOpacity>

        {/* SUMMARY */}

        <Text className="font-semibold text-base mb-2">Summary</Text>

        <View className="bg-white rounded-xl p-4">
          <View className="flex-row justify-between mb-2">
            <Text>Subtotal</Text>
            <Text>₱{subTotal.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text>Delivery Fee</Text>
            <Text>₱{deliveryFee.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold">₱{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER */}

      <View className="absolute bottom-0 left-0 right-0 bg-white p-4">
        <TouchableOpacity
          disabled={loading}
          onPress={placeOrder}
          className={`py-4 rounded-xl ${
            loading ? "bg-gray-400" : "bg-green-700"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
