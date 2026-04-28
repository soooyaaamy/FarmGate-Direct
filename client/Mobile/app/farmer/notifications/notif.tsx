import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "order" | "message" | "payment" | "stock";
type Tab = "all" | "orders" | "payments" | "messages";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  unread: boolean;
  actionable?: boolean;
  orderId?: string;
  buyerId?: string;
  productId?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1", type: "order",
    title: "New Order from Maria Santos",
    subtitle: "Organic Tomatoes (5kg) · ₱350.00",
    time: "2 minutes ago", date: "Today",
    unread: true, actionable: true,
    orderId: "11248", buyerId: "maria-santos",
  },
  {
    id: "2", type: "order",
    title: "New Order from Juan Dela Cruz",
    subtitle: "Eggplant (3kg) · ₱180.00",
    time: "18 minutes ago", date: "Today",
    unread: true, actionable: true,
    orderId: "11247", buyerId: "juan-dela-cruz",
  },
  {
    id: "3", type: "message",
    title: "Message from Maria Santos",
    subtitle: '"Pwede pa bang dagdagan ng 2kg?"',
    time: "35 minutes ago", date: "Today",
    unread: true, actionable: true,
    buyerId: "maria-santos",
  },
  {
    id: "4", type: "payment",
    title: "Payment Received",
    subtitle: "Order #11243 · +₱350.00 via GCash",
    time: "1 hour ago", date: "Today",
    unread: true, actionable: false,
  },
  {
    id: "5", type: "stock",
    title: "Low Stock Alert",
    subtitle: "Bitter Melon is almost out — only 2 kg left",
    time: "2 hours ago", date: "Today",
    unread: true, actionable: true,
    productId: "bitter-melon",
  },
  {
    id: "6", type: "payment",
    title: "Payment Received",
    subtitle: "Order #11241 · +₱240.00 via GCash",
    time: "Feb 20, 3:15 PM", date: "Yesterday",
    unread: false,
  },
  {
    id: "7", type: "order",
    title: "Order Delivered",
    subtitle: "Order #11240 · Rosa Lim · Sweet Corn (10pcs)",
    time: "Feb 20, 1:40 PM", date: "Yesterday",
    unread: false, orderId: "11240",
  },
];

// ─── Icon config ──────────────────────────────────────────────────────────────

const ICON: Record<NotifType, { bg: string; color: string; icon: string; lib: "FA5" | "MCI"; dot: string }> = {
  order:   { bg: "#dcfce7", color: "#15803d", icon: "clipboard-list",       lib: "FA5", dot: "#15803d" },
  message: { bg: "#dbeafe", color: "#1d4ed8", icon: "message-text-outline", lib: "MCI", dot: "#1d4ed8" },
  payment: { bg: "#fef3c7", color: "#b45309", icon: "coins",                lib: "FA5", dot: "#b45309" },
  stock:   { bg: "#ffedd5", color: "#c2410c", icon: "exclamation-triangle", lib: "FA5", dot: "#c2410c" },
};

// ─── Notif Icon ───────────────────────────────────────────────────────────────

const NotifIcon = ({ type }: { type: NotifType }) => {
  const cfg = ICON[type];
  return (
    <View
      style={{ backgroundColor: cfg.bg }}
      className="w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
    >
      {cfg.lib === "FA5" ? (
        <FontAwesome5 name={cfg.icon as any} size={15} color={cfg.color} />
      ) : (
        <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NotificationsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // ── Animated scroll — same pattern as homepage ────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  const markOneRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  // ── Navigation handlers ───────────────────────────────────────────────────

  const goToOrder = (notif: Notification) => {
    markOneRead(notif.id);
    router.push("/farmer/(tabs)/orders" as any);
  };

  const goToChat = (notif: Notification) => {
    markOneRead(notif.id);
    router.push(`/farmer/chats/${notif.buyerId}` as any);
  };

  const goToEditProduct = (notif: Notification) => {
    markOneRead(notif.id);
    router.push(`/farmer/(tabs)/products/edit/${notif.productId}` as any);
  };

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filtered = notifications.filter((n) => {
    if (activeTab === "orders")   return n.type === "order";
    if (activeTab === "payments") return n.type === "payment";
    if (activeTab === "messages") return n.type === "message";
    return true;
  });

  const todayItems     = filtered.filter((n) => n.date === "Today");
  const yesterdayItems = filtered.filter((n) => n.date === "Yesterday");

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",      label: "All"      },
    { key: "orders",   label: "Orders"   },
    { key: "payments", label: "Payments" },
    { key: "messages", label: "Messages" },
  ];

  // ── Card renderer ─────────────────────────────────────────────────────────

  const renderCard = (notif: Notification) => {
    const dot = ICON[notif.type].dot;

    return (
      <View
        key={notif.id}
        className={`rounded-2xl overflow-hidden mb-2 border ${
          notif.unread
            ? "border-green-200 bg-green-50"
            : "border-gray-100 bg-white"
        }`}
      >
        {/* Tappable main row */}
        <TouchableOpacity
          className="flex-row items-start gap-3 px-3 pt-3 pb-2"
          onPress={() => {
            if (notif.type === "order")   goToOrder(notif);
            if (notif.type === "message") goToChat(notif);
            if (notif.type === "payment") markOneRead(notif.id);
            if (notif.type === "stock")   goToEditProduct(notif);
          }}
        >
          <NotifIcon type={notif.type} />

          <View className="flex-1">
            <Text
              className={`text-[13px] leading-snug ${
                notif.unread
                  ? "font-bold text-gray-900"
                  : "font-medium text-gray-500"
              }`}
            >
              {notif.title}
            </Text>
            <Text className="text-[12px] text-gray-500 mt-0.5 leading-snug">
              {notif.subtitle}
            </Text>
            <Text className="text-[11px] text-gray-400 mt-1">{notif.time}</Text>
          </View>

          {notif.unread && (
            <View
              style={{ backgroundColor: dot }}
              className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
            />
          )}
        </TouchableOpacity>

        {/* Action buttons — unread + actionable only */}
        {notif.actionable && notif.unread && (
          <>
            {notif.type === "order" && (
              <View className="flex-row gap-2 px-3 pb-3 pt-1">
                <TouchableOpacity
                  className="flex-1 bg-white border border-gray-200 rounded-full py-2 items-center"
                  onPress={() => markOneRead(notif.id)}
                >
                  <Text className="text-[12px] font-bold text-gray-400">Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-green-800 rounded-full py-2 items-center"
                  onPress={() => goToOrder(notif)}
                >
                  <Text className="text-[12px] font-bold text-white">Accept</Text>
                </TouchableOpacity>
              </View>
            )}

            {notif.type === "message" && (
              <View className="px-3 pb-3 pt-1">
                <TouchableOpacity
                  className="bg-blue-50 border border-blue-200 rounded-full py-2 items-center"
                  onPress={() => goToChat(notif)}
                >
                  <Text className="text-[12px] font-bold text-blue-700">Reply</Text>
                </TouchableOpacity>
              </View>
            )}

            {notif.type === "stock" && (
              <View className="px-3 pb-3 pt-1">
                <TouchableOpacity
                  className="bg-orange-50 border border-orange-200 rounded-full py-2 items-center"
                  onPress={() => goToEditProduct(notif)}
                >
                  <Text className="text-[12px] font-bold text-orange-700">
                    Update Stock
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-green-800">

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* ── GREEN HEADER — fades + slides as you scroll ──────────────────── */}
        <View className="bg-green-800 px-5 pt-16 pb-8">

          <Animated.View
            style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}
          >
            {/* Back + title */}
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => router.back()}
              >
                <FontAwesome5 name="chevron-left" size={16} color="white" />
                <Text className="text-white text-[15px] font-semibold">Back</Text>
              </TouchableOpacity>

              <Text className="text-white font-bold text-[20px]">Notifications</Text>

              <View style={{ width: 60 }} />
            </View>
          </Animated.View>
        </View>

        {/* ── WHITE ROUNDED BODY rises over green when scrolling ──────────── */}
        <View
          className="bg-gray-100 rounded-t-[35px] px-5 pt-5"
          style={{ minHeight: SCREEN_HEIGHT, marginTop: -20 }}
        >
          {/* ── FILTER TABS ─────────────────────────────────────────────────── */}
          <View className="flex-row gap-2 mb-4">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{ flex: 1 }}
                className={`rounded-full py-2 items-center border ${
                  activeTab === tab.key
                    ? "bg-green-800 border-green-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    activeTab === tab.key ? "text-white" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── NOTIFICATION LIST ────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                <FontAwesome5 name="bell-slash" size={24} color="#15803d" />
              </View>
              <Text className="text-[16px] font-bold text-gray-600 mb-1">
                All caught up!
              </Text>
              <Text className="text-[13px] text-gray-400 text-center">
                No notifications in this category.
              </Text>
            </View>
          ) : (
            <>
              {todayItems.length > 0 && (
                <>
                  <Text className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2 ml-1">
                    Today
                  </Text>
                  {todayItems.map(renderCard)}
                </>
              )}
              {yesterdayItems.length > 0 && (
                <>
                  <Text className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2 ml-1 mt-3">
                    Yesterday
                  </Text>
                  {yesterdayItems.map(renderCard)}
                </>
              )}
            </>
          )}

          <View className="h-28" />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default NotificationsScreen;