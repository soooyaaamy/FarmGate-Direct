/**
 * orders/[id].tsx — Order Details
 * Full order info + animated step-by-step status timeline.
 * Uses useLocalSearchParams() from expo-router to get the order ID.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated, ScrollView, Text, TouchableOpacity, View,
} from "react-native";
import { useHomeData } from "../../hooks/UseHomeData";
import type { OrderStatus } from "../../hooks/UseHomeData";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  New:       { bg: "#f0fdf4", text: "#15803d", border: "#166534" },
  Packing:   { bg: "#eff6ff", text: "#1d4ed8", border: "#1d4ed8" },
  Ready:     { bg: "#f5f3ff", text: "#7c3aed", border: "#7c3aed" },
  Delivered: { bg: "#f3f4f6", text: "#6b7280", border: "#6b7280" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626", border: "#dc2626" },
};

const STEP_ICONS: Record<OrderStatus, string> = {
  New:       "clipboard-check-outline",
  Packing:   "package-variant",
  Ready:     "truck-check-outline",
  Delivered: "check-circle-outline",
  Cancelled: "close-circle-outline",
};

// ─── Animated step ────────────────────────────────────────────────────────────

const TimelineStep: React.FC<{
  status:  OrderStatus;
  time:    string;
  done:    boolean;
  isLast:  boolean;
  delay:   number;
}> = ({ status, time, done, isLast, delay }) => {
  const scale   = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lineH   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1,   useNativeDriver: true, damping: 14, stiffness: 160 }),
        Animated.timing(opacity, { toValue: 1,   duration: 220, useNativeDriver: true }),
      ]),
    ]);
    seq.start();
    if (!isLast && done) {
      Animated.sequence([
        Animated.delay(delay + 180),
        Animated.timing(lineH, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [delay, done, isLast, scale, opacity, lineH]);

  const sc     = STATUS_STYLE[status] ?? STATUS_STYLE.New;
  const active = done;

  return (
    <View style={{ flexDirection: "row", gap: 14 }}>
      {/* Left: dot + connector line */}
      <View style={{ alignItems: "center", width: 32 }}>
        <Animated.View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: active ? sc.bg : "#f3f4f6",
          borderWidth: 2,
          borderColor: active ? sc.border : "#e5e7eb",
          alignItems: "center", justifyContent: "center",
          opacity, transform: [{ scale }],
        }}>
          <MaterialCommunityIcons
            name={STEP_ICONS[status] as any}
            size={15}
            color={active ? sc.text : "#d1d5db"}
          />
        </Animated.View>

        {!isLast && (
          <Animated.View style={{
            width: 2, flex: 1, minHeight: 28, marginTop: 4,
            backgroundColor: done ? sc.border : "#e5e7eb",
            opacity: done ? lineH : 1,
          }} />
        )}
      </View>

      {/* Right: label + time */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <Text style={{ fontSize: 13, fontWeight: done ? "700" : "500", color: done ? "#111827" : "#9ca3af", marginTop: 6 }}>
          {status}
        </Text>
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontWeight: "500" }}>
          {time}
        </Text>
      </View>
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const OrderDetails = () => {
  const router        = useRouter();
  const { id }        = useLocalSearchParams<{ id: string }>();
  const { getOrderById } = useHomeData();
  const order         = getOrderById(id);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [headerFade]);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: "#166534", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#bbf7d0", fontWeight: "700" }}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sc = STATUS_STYLE[order.status] ?? STATUS_STYLE.New;
  const subtotal = order.items.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* Header */}
      <Animated.View style={{
        paddingTop: STATUS_BAR + 10, paddingHorizontal: 18, paddingBottom: 22,
        opacity: headerFade,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" }}>Order #{order.id}</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{order.customerName}</Text>
          </View>
          <View style={{ marginLeft: "auto" }}>
            <View style={{ backgroundColor: sc.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text }}>{order.status}</Text>
            </View>
          </View>
        </View>

        {/* Order meta pill */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
          flexDirection: "row", alignItems: "center", gap: 16,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>{order.orderDate}</Text>
          </View>
          <View style={{ width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.2)" }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialCommunityIcons name="currency-php" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 11, color: "#fff", fontWeight: "800" }}>{order.price}</Text>
          </View>
        </View>
      </Animated.View>

      {/* White scrollable body */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f3f4f6", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -14 }}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Customer info card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>
            Customer Info
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: order.avatarColor + "20", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: order.avatarColor }}>{order.initials}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{order.customerName}</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>{order.phone}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#f9fafb", borderRadius: 12, padding: 10 }}>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color="#15803d" style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: 12, color: "#4b5563", lineHeight: 18 }}>{order.address}</Text>
          </View>
        </View>

        {/* Items card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Order Items
            </Text>
          </View>

          {order.items.map((item: { name: string; qty: number; price: number }, i: number) => (
            <View key={i} style={{
              flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
              borderBottomWidth: i < order.items.length - 1 ? 1 : 0, borderBottomColor: "#f3f4f6",
            }}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: "#111827" }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginRight: 16 }}>× {item.qty}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>₱{(item.qty * item.price).toLocaleString()}</Text>
            </View>
          ))}

          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6", backgroundColor: "#fafafa" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151" }}>Total</Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#166534" }}>₱{subtotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Status timeline */}
        <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16 }}>
            Order Progress
          </Text>

          {order.timeline.map((step: { status: OrderStatus; time: string; done: boolean }, i: number) => (
            <TimelineStep
              key={step.status}
              status={step.status}
              time={step.time}
              done={step.done}
              isLast={i === order.timeline.length - 1}
              delay={i * 140}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default OrderDetails;