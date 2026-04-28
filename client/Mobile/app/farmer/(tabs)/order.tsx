import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Accepted" | "Delivered" | "Declined" | "Cancelled";

interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  Pending:   { label: "Pending",   bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
  Accepted:  { label: "Accepted",  bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
  Delivered: { label: "Delivered", bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Declined:  { label: "Declined",  bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  Cancelled: { label: "Cancelled", bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" },
};

const FILTERS: (OrderStatus | "All")[] = ["All", "Pending", "Accepted", "Delivered", "Declined", "Cancelled"];

// ─── Sample Orders ────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  { id: "1", buyerId: "b1", buyerName: "Anna Reyes",      productName: "Fresh Tomatoes", quantity: 2,  totalPrice: 240, status: "Pending",   createdAt: "2024-01-22T10:00:00Z" },
  { id: "2", buyerId: "b2", buyerName: "Carlos Mendoza",  productName: "Lettuce",        quantity: 5,  totalPrice: 300, status: "Pending",   createdAt: "2024-01-22T09:30:00Z" },
  { id: "3", buyerId: "b3", buyerName: "Lina Garcia",     productName: "Eggplant",       quantity: 3,  totalPrice: 240, status: "Accepted",  createdAt: "2024-01-21T08:00:00Z" },
  { id: "4", buyerId: "b4", buyerName: "Marco Dela Cruz", productName: "Sweet Corn",     quantity: 10, totalPrice: 350, status: "Delivered", createdAt: "2024-01-21T07:00:00Z" },
  { id: "5", buyerId: "b5", buyerName: "Sofia Bautista",  productName: "Mango",          quantity: 4,  totalPrice: 240, status: "Cancelled", createdAt: "2024-01-20T06:00:00Z" },
  { id: "6", buyerId: "b6", buyerName: "Jose Ramos",      productName: "Banana",         quantity: 6,  totalPrice: 210, status: "Declined",  createdAt: "2024-01-22T11:00:00Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

const getAvatarColor = (name: string) => {
  const colors = ["#bbf7d0", "#bfdbfe", "#fde68a", "#fbcfe8", "#e9d5ff"];
  return colors[name ? name.charCodeAt(0) % colors.length : 0];
};

const getAvatarText = (name: string) => {
  const textColors = ["#15803d", "#1d4ed8", "#b45309", "#be185d", "#6d28d9"];
  return textColors[name ? name.charCodeAt(0) % textColors.length : 0];
};

// ─── Order Card ───────────────────────────────────────────────────────────────

const OrderCard = ({
  item,
  onPress,
  onAccept,
  onDecline,
}: {
  item: Order;
  onPress: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}) => {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Pending;
  const isPending = item.status === "Pending";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 12 }}>
        {/* Avatar */}
        <View style={{
          width: 46, height: 46, borderRadius: 23,
          backgroundColor: getAvatarColor(item.buyerName),
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: getAvatarText(item.buyerName) }}>
            {getInitials(item.buyerName)}
          </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontWeight: "700", fontSize: 14, color: "#111827" }} numberOfLines={1}>
            {item.buyerName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
            <MaterialCommunityIcons name="package-variant-closed" size={13} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: "#6b7280" }} numberOfLines={1}>
              {item.productName} × {item.quantity}
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d", marginTop: 3 }}>
            ₱{item.totalPrice.toLocaleString()}
          </Text>
        </View>

        {/* Status badge + chevron */}
        <View style={{ alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <View style={{ backgroundColor: cfg.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: cfg.text }}>
              {cfg.label}
            </Text>
          </View>
          <FontAwesome5 name="chevron-right" size={11} color="#d1d5db" />
        </View>
      </View>

      {/* Accept / Decline buttons — only for Pending */}
      {isPending && (
        <View style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 14,
          paddingBottom: 14,
        }}>
          <TouchableOpacity
            onPress={onDecline}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: "#fca5a5",
              backgroundColor: "#fff1f2",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#ef4444" }}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: "#166534",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Orders = () => {
  const router = useRouter();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const countOf = (status: OrderStatus | "All"): number =>
    status === "All" ? orders.length : orders.filter((o) => o.status === status).length;

  const filteredOrders = activeFilter === "All"
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, status } : o)
    );
  };

  const handleAccept = (item: Order) => {
    Alert.alert(
      "Accept Order",
      `Accept order from ${item.buyerName} for ${item.productName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => updateStatus(item.id, "Accepted"),
        },
      ]
    );
  };

  const handleDecline = (item: Order) => {
    Alert.alert(
      "Decline Order",
      `Decline order from ${item.buyerName} for ${item.productName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => updateStatus(item.id, "Declined"),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── GREEN HEADER ── */}
        <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 20, paddingBottom: 32, backgroundColor: "#166534" }}>

          <Text style={{ color: "white", fontWeight: "700", fontSize: 26, lineHeight: 32, marginBottom: 20 }}>
            My Orders
          </Text>

          {/* Stats strip */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 22, lineHeight: 26 }}>
                {countOf("Pending")}
              </Text>
              <Text style={{ color: "#9ca3af", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                New Orders
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#15803d", fontWeight: "700", fontSize: 22, lineHeight: 26 }}>
                {countOf("Accepted")}
              </Text>
              <Text style={{ color: "#9ca3af", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                Accepted
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#1d4ed8", fontWeight: "700", fontSize: 22, lineHeight: 26 }}>
                {countOf("Delivered")}
              </Text>
              <Text style={{ color: "#9ca3af", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                Delivered
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 22, lineHeight: 26 }}>
                {countOf("Declined")}
              </Text>
              <Text style={{ color: "#9ca3af", fontSize: 10, fontWeight: "600", marginTop: 2 }}>
                Declined
              </Text>
            </View>
          </View>
        </View>

        {/* ── WHITE ROUNDED BODY ── */}
        <View style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          paddingHorizontal: 16,
          paddingTop: 20,
          marginTop: -20,
          minHeight: SCREEN_HEIGHT,
        }}>

          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginBottom: 14 }}
            contentContainerStyle={{ gap: 8, paddingRight: 4, alignItems: "center" }}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const count = countOf(filter);
              const cfg = filter !== "All" ? STATUS_CONFIG[filter as OrderStatus] : null;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    borderWidth: 1.5,
                    borderColor: isActive ? "#166534" : "#e5e7eb",
                    backgroundColor: isActive ? "#166534" : "#fff",
                  }}
                >
                  {cfg && !isActive && (
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.dot }} />
                  )}
                  <Text style={{ fontSize: 12, fontWeight: "700", color: isActive ? "#fff" : "#6b7280" }}>
                    {filter}
                  </Text>
                  <View style={{ borderRadius: 20, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#f0fdf4" }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: isActive ? "#fff" : "#15803d" }}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Order list */}
          {filteredOrders.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60, paddingBottom: 40 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <MaterialCommunityIcons name="clipboard-text-off-outline" size={32} color="#15803d" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 6 }}>
                No orders yet
              </Text>
              <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 20 }}>
                {activeFilter === "All"
                  ? "You have no orders at the moment."
                  : `No ${activeFilter.toLowerCase()} orders found.`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <OrderCard
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "/farmer/orders/[id]",
                      params: { id: item.id, order: JSON.stringify(item) },
                    })
                  }
                  onAccept={() => handleAccept(item)}
                  onDecline={() => handleDecline(item)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Orders;