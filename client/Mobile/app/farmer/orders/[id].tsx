import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, ScrollView, Text,
  TouchableOpacity, View,
} from "react-native";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

type OrderStatus = "Pending" | "Accepted" | "Delivered" | "Declined" | "Cancelled";

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string }> = {
  Pending:   { bg: "#fef3c7", text: "#b45309" },
  Accepted:  { bg: "#dcfce7", text: "#166534" },
  Delivered: { bg: "#dbeafe", text: "#1e40af" },
  Declined:  { bg: "#fecaca", text: "#b91c1c" },
  Cancelled: { bg: "#e5e7eb", text: "#374151" },
};

export default function OrderDetails() {
  const router = useRouter();
  const { order: orderParam } = useLocalSearchParams();

  // ── Parse order directly from params — no API call needed ──
  const [order, setOrder] = useState(() => {
    try {
      return orderParam ? JSON.parse(orderParam as string) : null;
    } catch {
      return null;
    }
  });

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: "#166534", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Order not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#86efac", fontSize: 14 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG.Cancelled;

  const handleStatusChange = (newStatus: OrderStatus) => {
    Alert.alert(
      `${newStatus} Order`,
      `Are you sure you want to ${newStatus.toLowerCase()} this order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: newStatus,
          style: newStatus === "Declined" ? "destructive" : "default",
          onPress: () => {
            setOrder({ ...order, status: newStatus });
            Alert.alert("Updated", `Order has been ${newStatus.toLowerCase()}.`);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Header ── */}
      <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              {order.buyerName}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 1 }}>
              Order #{order.id}
            </Text>
          </View>

          <View style={{ backgroundColor: statusCfg.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: statusCfg.text }}>
              {order.status}
            </Text>
          </View>
        </View>
      </View>

      {/* ── White Body ── */}
      <View style={{
        flex: 1, backgroundColor: "#f3f4f6",
        borderTopLeftRadius: 35, borderTopRightRadius: 35,
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >

          {/* Buyer Info */}
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "700", marginBottom: 10, letterSpacing: 0.4 }}>
              BUYER
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#15803d" }}>
                  {order.buyerName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{order.buyerName}</Text>
                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>Buyer</Text>
              </View>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "700", marginBottom: 10, letterSpacing: 0.4 }}>
              DELIVERY
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="location-outline" size={16} color="#15803d" />
              <Text style={{ fontSize: 13, color: "#374151", flex: 1 }}>
                {order.delivery === "pickup" ? "Pickup at farm" : (order.address ?? "No address provided")}
              </Text>
            </View>
          </View>

          {/* Order Details */}
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "700", marginBottom: 12, letterSpacing: 0.4 }}>
              ORDER DETAILS
            </Text>

            {[
              { label: "Product",  value: order.productName },
              { label: "Quantity", value: `${order.quantity} ${order.unit ?? ""}` },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>{row.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{row.value}</Text>
              </View>
            ))}

            <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>Total</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#15803d" }}>
                ₱{Number(order.totalPrice ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Order Date */}
          {order.createdAt && (
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "700", marginBottom: 8, letterSpacing: 0.4 }}>
                ORDER DATE
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="calendar-outline" size={16} color="#15803d" />
                <Text style={{ fontSize: 13, color: "#374151" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* ── Accept / Decline buttons — only for Pending ── */}
        {order.status === "Pending" && (
          <View style={{
            flexDirection: "row", gap: 10,
            padding: 16, backgroundColor: "white",
            borderTopWidth: 1, borderTopColor: "#f3f4f6",
          }}>
            <TouchableOpacity
              onPress={() => handleStatusChange("Declined")}
              style={{
                flex: 1, paddingVertical: 13, borderRadius: 12,
                borderWidth: 1.5, borderColor: "#fca5a5",
                backgroundColor: "#fff1f2", alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#ef4444" }}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange("Accepted")}
              style={{
                flex: 1, paddingVertical: 13, borderRadius: 12,
                backgroundColor: "#166534", alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}