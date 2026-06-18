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
import { clearCartItems, createOrder, CartFarmGroup } from "@/lib/store";

export default function Checkout() {
  const { items } = useLocalSearchParams();

  const [cart, setCart] = useState<CartFarmGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [payment, setPayment] = useState<"qr" | "cod">("qr");
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (!userString) { router.replace("/login"); return; }
        const user = JSON.parse(userString);
        setBuyerId(user.userId);
        setBuyerName(user.fullName);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (items) {
      try {
        setCart(JSON.parse(items as string));
      } catch {
        setCart([]);
      }
    }
  }, [items]);

  // ── Accurate math: prices are numbers in the store, never re-parsed from strings ──
  const subTotal = cart.reduce((sum, farm) => {
    return sum + farm.products.reduce((pSum, p) => pSum + p.price * p.quantity, 0);
  }, 0);

  const deliveryFee = delivery === "delivery" ? 35 : 0;
  const total = subTotal + deliveryFee;

  const placeOrder = async () => {
    if (!buyerId) {
      Alert.alert("Error", "Buyer not found. Please log in again.");
      return;
    }
    if (cart.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.flatMap((farm) =>
        farm.products.map((p) => ({
          productId: p.id,
          productName: p.name,
          farmerId: farm.farmerId,
          farmName: farm.farmName,
          image: p.image,
          price: p.price,
          quantity: p.quantity,
          reviewed: false,
        }))
      );

      const order = await createOrder({
        buyerId,
        buyerName: buyerName ?? "Buyer",
        items: orderItems,
        delivery,
        payment,
        subTotal,
        deliveryFee,
        total,
      });

      // Remove only the purchased product IDs from the cart, leaving
      // anything the buyer didn't select untouched.
      const purchasedIds = new Set(orderItems.map((i) => i.productId));
      await clearCartItems(purchasedIds);

      router.replace({
        pathname: "/buyer/thankyou",
        params: {
          orderId: order.id,
          delivery,
          payment,
          subTotal: subTotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          total: total.toFixed(2),
        },
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Text style={{ color: "#9ca3af", fontSize: 14 }}>No items to checkout</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>

      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 17, fontWeight: "700", color: "#111827" }}>Checkout</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Items ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
          Items
        </Text>

        {cart.map((farm) => (
          <View key={farm.farmerId} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Ionicons name="storefront-outline" size={13} color="#15803d" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#15803d" }}>{farm.farmName}</Text>
            </View>

            {farm.products.map((p) => (
              <View key={p.id} style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#fff", borderRadius: 12,
                padding: 12, marginBottom: 8,
              }}>
                <Image
                  source={typeof p.image === "string" ? { uri: p.image } : p.image}
                  style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: "#f3f4f6" }}
                  resizeMode="cover"
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    ₱{p.price.toFixed(2)} × {p.quantity}
                  </Text>
                </View>

                <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                  ₱{(p.price * p.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* ── Delivery ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 12, marginBottom: 8 }}>
          Delivery
        </Text>

        <TouchableOpacity
          onPress={() => setDelivery("pickup")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
            flexDirection: "row", alignItems: "center", gap: 10,
            borderWidth: 1.5, borderColor: delivery === "pickup" ? "#15803d" : "transparent",
          }}
        >
          <Ionicons name="leaf-outline" size={20} color={delivery === "pickup" ? "#15803d" : "#374151"} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>Farm Pickup</Text>
          <Text style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>Free</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDelivery("delivery")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
            flexDirection: "row", alignItems: "center", gap: 10,
            borderWidth: 1.5, borderColor: delivery === "delivery" ? "#15803d" : "transparent",
          }}
        >
          <Ionicons name="car-outline" size={20} color={delivery === "delivery" ? "#15803d" : "#374151"} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>Delivery</Text>
          <Text style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>+₱35.00</Text>
        </TouchableOpacity>

        {/* ── Payment ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
          Payment
        </Text>

        <TouchableOpacity
          onPress={() => setPayment("qr")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
            flexDirection: "row", alignItems: "center", gap: 10,
            borderWidth: 1.5, borderColor: payment === "qr" ? "#15803d" : "transparent",
          }}
        >
          <Ionicons name="qr-code-outline" size={20} color={payment === "qr" ? "#15803d" : "#374151"} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>GCash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPayment("cod")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
            flexDirection: "row", alignItems: "center", gap: 10,
            borderWidth: 1.5, borderColor: payment === "cod" ? "#15803d" : "transparent",
          }}
        >
          <Ionicons name="cash-outline" size={20} color={payment === "cod" ? "#15803d" : "#374151"} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>Cash on Delivery</Text>
        </TouchableOpacity>

        {/* ── Summary ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
          Summary
        </Text>

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Subtotal</Text>
            <Text style={{ fontSize: 12, color: "#111827" }}>₱{subTotal.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Delivery Fee</Text>
            <Text style={{ fontSize: 12, color: "#111827" }}>₱{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: "#f0f0f0", marginVertical: 4 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>Total</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#15803d" }}>₱{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", padding: 16,
        borderTopWidth: 1, borderTopColor: "#f0f0f0",
      }}>
        <TouchableOpacity
          disabled={loading}
          onPress={placeOrder}
          activeOpacity={0.85}
          style={{
            paddingVertical: 14, borderRadius: 12, alignItems: "center",
            backgroundColor: loading ? "#9ca3af" : "#15803d",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Place Order · ₱{total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}