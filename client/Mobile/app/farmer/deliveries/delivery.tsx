import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus =
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Delivered"
  | "Failed";

interface Delivery {
  id: string;
  orderId: string;
  buyerName: string;
  buyerInitials: string;
  productName: string;
  quantity: string;
  address: string;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveryType: "Pickup" | "Delivery";
  rider?: string;
  estimatedTime?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; bg: string; text: string; dot: string; icon: string }
> = {
  "Ready for Pickup": {
    label: "Ready for Pickup",
    bg: "#fef3c7",
    text: "#b45309",
    dot: "#f59e0b",
    icon: "package-variant-closed",
  },
  "Out for Delivery": {
    label: "Out for Delivery",
    bg: "#dbeafe",
    text: "#1d4ed8",
    dot: "#3b82f6",
    icon: "truck-delivery",
  },
  Delivered: {
    label: "Delivered",
    bg: "#dcfce7",
    text: "#15803d",
    dot: "#22c55e",
    icon: "check-circle",
  },
  Failed: {
    label: "Failed",
    bg: "#fee2e2",
    text: "#b91c1c",
    dot: "#ef4444",
    icon: "close-circle",
  },
};

type FilterTab = "All" | DeliveryStatus;
const FILTERS: FilterTab[] = [
  "All",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Failed",
];

// ─── Sample Data ──────────────────────────────────────────────────────────────

const DELIVERIES: Delivery[] = [
  {
    id: "d1",
    orderId: "11248",
    buyerName: "Maria Santos",
    buyerInitials: "MS",
    productName: "Organic Tomatoes",
    quantity: "5 kg",
    address: "123 Rizal St., Hagonoy, Bulacan",
    status: "Out for Delivery",
    scheduledDate: "Today, 2:00 PM",
    deliveryType: "Delivery",
    rider: "Juan Dela Cruz",
    estimatedTime: "30 min",
  },
  {
    id: "d2",
    orderId: "11247",
    buyerName: "Carlos Mendoza",
    buyerInitials: "CM",
    productName: "Lettuce",
    quantity: "5 heads",
    address: "Farm Gate Pickup",
    status: "Ready for Pickup",
    scheduledDate: "Today, 4:00 PM",
    deliveryType: "Pickup",
  },
  {
    id: "d3",
    orderId: "11245",
    buyerName: "Lina Garcia",
    buyerInitials: "LG",
    productName: "Eggplant",
    quantity: "3 kg",
    address: "45 Mabini Ave., Hagonoy",
    status: "Delivered",
    scheduledDate: "Yesterday, 10:00 AM",
    deliveryType: "Delivery",
    rider: "Pedro Reyes",
  },
  {
    id: "d4",
    orderId: "11244",
    buyerName: "Marco Dela Cruz",
    buyerInitials: "MD",
    productName: "Sweet Corn",
    quantity: "10 pcs",
    address: "78 Quezon Blvd., Hagonoy",
    status: "Delivered",
    scheduledDate: "Yesterday, 3:00 PM",
    deliveryType: "Delivery",
    rider: "Juan Dela Cruz",
  },
  {
    id: "d5",
    orderId: "11240",
    buyerName: "Sofia Bautista",
    buyerInitials: "SB",
    productName: "Mango",
    quantity: "4 kg",
    address: "12 Del Pilar St., Hagonoy",
    status: "Failed",
    scheduledDate: "Jan 20, 11:00 AM",
    deliveryType: "Delivery",
    rider: "Pedro Reyes",
    estimatedTime: "—",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#bbf7d0", "#bfdbfe", "#fde68a", "#fbcfe8", "#e9d5ff"];
const AVATAR_TEXT = ["#15803d", "#1d4ed8", "#b45309", "#be185d", "#6d28d9"];
const getAvatarBg = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getAvatarTxt = (name: string) =>
  AVATAR_TEXT[name.charCodeAt(0) % AVATAR_TEXT.length];

// ─── Delivery Card ────────────────────────────────────────────────────────────

const DeliveryCard = ({
  item,
  onPress,
}: {
  item: Delivery;
  onPress: () => void;
}) => {
  const cfg = STATUS_CONFIG[item.status];

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
      {/* Top status bar accent */}
      <View
        style={{ height: 3, backgroundColor: cfg.dot, width: "100%" }}
      />

      <View style={{ padding: 14 }}>
        {/* Row 1: Avatar + buyer + status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: getAvatarBg(item.buyerName),
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 13,
                color: getAvatarTxt(item.buyerName),
              }}
            >
              {item.buyerInitials}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontWeight: "700", fontSize: 14, color: "#111827" }}
              numberOfLines={1}
            >
              {item.buyerName}
            </Text>
            <Text
              style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}
              numberOfLines={1}
            >
              {item.productName} · {item.quantity}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: cfg.bg,
              borderRadius: 20,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: cfg.text }}>
              {cfg.label}
            </Text>
          </View>
        </View>

        {/* Row 2: Info chips */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {/* Delivery type */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#f9fafb",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <MaterialCommunityIcons
              name={item.deliveryType === "Pickup" ? "store-outline" : "truck-outline"}
              size={12}
              color="#6b7280"
            />
            <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "600" }}>
              {item.deliveryType}
            </Text>
          </View>

          {/* Schedule */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#f9fafb",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color="#6b7280"
            />
            <Text style={{ fontSize: 11, color: "#6b7280", fontWeight: "600" }}>
              {item.scheduledDate}
            </Text>
          </View>

          {/* ETA for out-for-delivery */}
          {item.status === "Out for Delivery" && item.estimatedTime && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#dbeafe",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={12}
                color="#1d4ed8"
              />
              <Text
                style={{ fontSize: 11, color: "#1d4ed8", fontWeight: "700" }}
              >
                ETA {item.estimatedTime}
              </Text>
            </View>
          )}
        </View>

        {/* Row 3: Address / rider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 8,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={13}
            color="#9ca3af"
          />
          <Text
            style={{ fontSize: 11, color: "#9ca3af", flex: 1 }}
            numberOfLines={1}
          >
            {item.deliveryType === "Pickup"
              ? "Farm Gate Pickup"
              : item.address}
          </Text>
        </View>

        {item.rider && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 4,
            }}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={13}
              color="#9ca3af"
            />
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>
              Rider: {item.rider}
            </Text>
          </View>
        )}
      </View>

      {/* Action row for active deliveries */}
      {(item.status === "Ready for Pickup" ||
        item.status === "Out for Delivery") && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 14,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: "#e5e7eb",
              backgroundColor: "#f9fafb",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: "#6b7280" }}
            >
              View Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 2,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: "#166534",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}
            >
              {item.status === "Ready for Pickup"
                ? "Mark as Picked Up"
                : "Mark as Delivered"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DeliveriesScreen = () => {
  const router = useRouter();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const countOf = (f: FilterTab) =>
    f === "All"
      ? DELIVERIES.length
      : DELIVERIES.filter((d) => d.status === f).length;

  const filtered =
    activeFilter === "All"
      ? DELIVERIES
      : DELIVERIES.filter((d) => d.status === activeFilter);

  const activeCount = DELIVERIES.filter(
    (d) => d.status === "Out for Delivery"
  ).length;
  const pendingPickup = DELIVERIES.filter(
    (d) => d.status === "Ready for Pickup"
  ).length;
  const deliveredCount = DELIVERIES.filter(
    (d) => d.status === "Delivered"
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── GREEN HEADER ── */}
        <View
          style={{
            paddingTop: STATUS_BAR + 16,
            paddingHorizontal: 20,
            paddingBottom: 32,
            backgroundColor: "#166534",
          }}
        >
          {/* Back + title */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 12, padding: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="chevron-left" size={16} color="white" />
            </TouchableOpacity>
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 26,
                lineHeight: 32,
                flex: 1,
              }}
            >
              Deliveries
            </Text>
            {/* Active delivery indicator */}
            {activeCount > 0 && (
              <View
                style={{
                  backgroundColor: "#3b82f6",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                  }}
                />
                <Text
                  style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                >
                  {activeCount} Active
                </Text>
              </View>
            )}
          </View>

          {/* Stats strip */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "#f59e0b",
                  fontWeight: "700",
                  fontSize: 22,
                  lineHeight: 26,
                }}
              >
                {pendingPickup}
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 10,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                For Pickup
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "#1d4ed8",
                  fontWeight: "700",
                  fontSize: 22,
                  lineHeight: 26,
                }}
              >
                {activeCount}
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 10,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                In Transit
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "#15803d",
                  fontWeight: "700",
                  fontSize: 22,
                  lineHeight: 26,
                }}
              >
                {deliveredCount}
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 10,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                Delivered
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: "#ef4444",
                  fontWeight: "700",
                  fontSize: 22,
                  lineHeight: 26,
                }}
              >
                {countOf("Failed")}
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 10,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                Failed
              </Text>
            </View>
          </View>
        </View>

        {/* ── WHITE ROUNDED BODY ── */}
        <View
          style={{
            backgroundColor: "#f3f4f6",
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            paddingHorizontal: 16,
            paddingTop: 20,
            marginTop: -20,
            minHeight: SCREEN_HEIGHT,
          }}
        >
          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginBottom: 14 }}
            contentContainerStyle={{
              gap: 8,
              paddingRight: 4,
              alignItems: "center",
            }}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const count = countOf(filter);
              const cfg =
                filter !== "All"
                  ? STATUS_CONFIG[filter as DeliveryStatus]
                  : null;
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
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: cfg.dot,
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isActive ? "#fff" : "#6b7280",
                    }}
                  >
                    {filter}
                  </Text>
                  <View
                    style={{
                      borderRadius: 20,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : "#f0fdf4",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: isActive ? "#fff" : "#15803d",
                      }}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Delivery list */}
          {filtered.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                paddingTop: 60,
                paddingBottom: 40,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "#dcfce7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="truck-outline"
                  size={32}
                  color="#15803d"
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                No deliveries
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#9ca3af",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {activeFilter === "All"
                  ? "No deliveries at the moment."
                  : `No "${activeFilter}" deliveries found.`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <DeliveryCard item={item} onPress={() => {}} />
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveriesScreen;