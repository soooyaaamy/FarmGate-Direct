import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type NotifType = "message" | "order_placed" | "order_processing" | "out_for_delivery" | "delivered";

type NotifItem = {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  avatar?: any;
  orderId?: string;
};

const SAMPLE_NOTIFICATIONS: NotifItem[] = [
  {
    id: "1",
    type: "message",
    title: "Juan Dela Cruz",
    description: "Sent you a message.",
    timestamp: "2m ago",
    read: false,
  },
  {
    id: "2",
    type: "out_for_delivery",
    title: "Order out for delivery",
    description: "Your order is on the way.",
    timestamp: "1h ago",
    read: false,
    orderId: "12345",
  },
  {
    id: "3",
    type: "order_processing",
    title: "Order packed",
    description: "Your order has been packed.",
    timestamp: "3h ago",
    read: true,
    orderId: "12345",
  },
  {
    id: "4",
    type: "order_placed",
    title: "Order placed",
    description: "Your order was placed successfully.",
    timestamp: "Yesterday",
    read: true,
    orderId: "12344",
  },
  {
    id: "5",
    type: "delivered",
    title: "Order delivered",
    description: "Your order has been delivered. How was it?",
    timestamp: "2 days ago",
    read: true,
    orderId: "12340",
  },
];

const NotificationRow = ({
  item,
  onPress,
  onLeaveReview,
  isLast,
}: {
  item: NotifItem;
  onPress: () => void;
  onLeaveReview?: () => void;
  isLast: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#f0f0f0",
      }}
    >
      {/* Title row + unread dot */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: item.read ? "#374151" : "#111827",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {!item.read && (
          <View style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: "#15803d",
          }} />
        )}
      </View>

      <Text
        style={{ fontSize: 12, color: "#6b7280", marginTop: 3, lineHeight: 16 }}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 6 }}>
        {item.timestamp}
      </Text>

      {/* Leave Review button — only on delivered notifications */}
      {item.type === "delivered" && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onLeaveReview?.(); }}
          activeOpacity={0.8}
          style={{
            marginTop: 8,
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor: "#15803d",
            borderRadius: 8,
            paddingVertical: 6,
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>
            Leave Review
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotifItem[]>(SAMPLE_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handlePress = (item: NotifItem) => {
    markAsRead(item.id);
    switch (item.type) {
      case "message":
        router.push({ pathname: "/buyer/chat/[id]" as any, params: { id: item.id } });
        break;
      case "order_placed":
      case "order_processing":
        router.push({ pathname: "/buyer/orders/[id]" as any, params: { id: item.orderId } });
        break;
      case "out_for_delivery":
        router.push({ pathname: "/buyer/orders/[id]/tracking" as any, params: { id: item.orderId } });
        break;
      case "delivered":
        navigateToReview(item);
        break;
    }
  };

  const navigateToReview = (item: NotifItem) => {
    markAsRead(item.id);
    router.push({
      pathname: "/buyer/review" as any,
      params: { orderId: item.orderId },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Header */}
      <View style={{
        backgroundColor: "#15803d",
        paddingTop: 52, paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>
          Notifications
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 }}>
          <Ionicons name="notifications-off-outline" size={52} color="#d1d5db" />
          <Text style={{ color: "#374151", fontSize: 15, fontWeight: "700" }}>No notifications yet</Text>
          <Text style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", lineHeight: 18 }}>
            We&apos;ll notify you when there are updates about your orders, messages, and deliveries.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <NotificationRow
              item={item}
              isLast={index === notifications.length - 1}
              onPress={() => handlePress(item)}
              onLeaveReview={() => navigateToReview(item)}
            />
          )}
        />
      )}
    </View>
  );
}