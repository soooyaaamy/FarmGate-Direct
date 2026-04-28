import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  // ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Reusable small components ───────────────────────────────────────────────

const SectionLabel = ({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View className="flex-row items-center justify-between mt-5 mb-2">
    <Text className="text-[11px] font-bold tracking-widest uppercase text-green-700">
      {title}
    </Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} className="flex-row items-center gap-1">
        <Text className="text-[11px] font-bold text-green-700">{actionLabel}</Text>
        <FontAwesome5 name="arrow-right" size={9} color="#15803d" />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Sales data ───────────────────────────────────────────────────────────────

const DAILY_SALES = [
  { day: "Mon", amount: 1800 },
  { day: "Tue", amount: 2600 },
  { day: "Wed", amount: 2200 },
  { day: "Thu", amount: 3400 },
  { day: "Fri", amount: 2750 },
  { day: "Sat", amount: 3900 },
  { day: "Sun", amount: 2200 },
];

const WEEKLY_SALES = [
  { week: "Wk 1", amount: 12500 },
  { week: "Wk 2", amount: 15200 },
  { week: "Wk 3", amount: 13800 },
  { week: "Wk 4", amount: 18450 },
];

type SalesView = "daily" | "weekly";

// ─── Sales Chart Component ────────────────────────────────────────────────────

const SalesChart = ({
  view,
  data,
}: {
  view: SalesView;
  data: { label: string; amount: number }[];
}) => {
  const maxAmount = Math.max(...data.map((d) => d.amount));
  const chartHeight = 52;

  return (
    <View>
      <View
        className="flex-row items-end gap-1"
        style={{ height: chartHeight }}
      >
        {data.map((item, i) => {
          const barHeight = (item.amount / maxAmount) * chartHeight;
          const isToday =
            view === "daily"
              ? i === data.length - 1
              : i === data.length - 1;
          return (
            <View key={i} className="flex-1 items-center" style={{ height: chartHeight, justifyContent: "flex-end" }}>
              <View
                style={{
                  height: barHeight,
                  width: "70%",
                  borderRadius: 4,
                  backgroundColor: isToday ? "#166534" : "#bbf7d0",
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row mt-1 gap-1">
        {data.map((item, i) => (
          <Text
            key={i}
            style={{ flex: 1 }}
            className="text-[9px] text-gray-400 text-center font-medium"
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ─── Top Products (full page) data & types ───────────────────────────────────

const TOP_PRODUCTS = [
  {
    emoji: "🍅",
    name: "Organic Tomatoes",
    sold: 47,
    pct: 90,
    revenue: "₱7,050",
    rank: 1,
    image: null, // replace with require() or { uri: '...' } for real images
  },
  {
    emoji: "🌽",
    name: "Sweet Corn",
    sold: 38,
    pct: 65,
    revenue: "₱4,560",
    rank: 2,
    image: null,
  },
  {
    emoji: "🍆",
    name: "Eggplant",
    sold: 22,
    pct: 38,
    revenue: "₱2,640",
    rank: 3,
    image: null,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const Homepage = () => {
  const router = useRouter();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const unreadCount = 5;
  const [salesView, setSalesView] = useState<SalesView>("daily");

  const chartData =
    salesView === "daily"
      ? DAILY_SALES.map((d) => ({ label: d.day, amount: d.amount }))
      : WEEKLY_SALES.map((d) => ({ label: d.week, amount: d.amount }));

  const totalForView =
    salesView === "daily"
      ? DAILY_SALES.reduce((s, d) => s + d.amount, 0)
      : WEEKLY_SALES.reduce((s, d) => s + d.amount, 0);

  // ── Animated scroll ───────────────────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const salesCardScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

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
        {/* ── GREEN HEADER ─────────────────────────────────────────────────── */}
        <View
          style={{ paddingTop: STATUS_BAR + 16 }}
          className="bg-green-800 px-5 pb-8"
        >
          {/* Greeting row */}
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
            }}
            className="flex-row justify-between items-center mb-6"
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={require("../../../assets/images/farmer-profile.jpg")}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
              <View>
                <Text className="text-white/60 text-xs font-medium">
                  Good Morning
                </Text>
                <Text className="text-white font-bold text-[20px] leading-tight">
                  Mario Santos
                </Text>
              </View>
            </View>

            {/* Bell with number badge */}
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 items-center justify-center"
              onPress={() =>
                router.push("/farmer/notifications/notif" as any)
              }
            >
              <FontAwesome5 name="bell" size={17} color="white" />
              {unreadCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 bg-yellow-400 rounded-full items-center justify-center border-2 border-green-800"
                  style={{ minWidth: 18, height: 18, paddingHorizontal: 3 }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#1a3a1a",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* ── Enhanced Sales Card ── */}
          <Animated.View style={{ transform: [{ scale: salesCardScale }] }}>
            <View className="bg-white rounded-2xl p-5">
              {/* Header row */}
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-green-700 font-bold text-[11px] tracking-widest uppercase">
                    {salesView === "daily"
                      ? "Sales This Week"
                      : "Sales This Month"}
                  </Text>
                  <Text className="text-[30px] font-bold text-gray-900 leading-tight mt-1">
                    ₱{totalForView.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center bg-green-50 rounded-full px-3 py-1 gap-1 mt-1">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={14}
                    color="#15803d"
                  />
                  <Text className="text-green-700 font-bold text-[12px]">
                    +12%
                  </Text>
                </View>
              </View>

              {/* Toggle: Daily / Weekly */}
              <View className="flex-row bg-gray-100 rounded-full p-1 mb-4 self-start gap-1">
                {(["daily", "weekly"] as SalesView[]).map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setSalesView(v)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 5,
                      borderRadius: 20,
                      backgroundColor:
                        salesView === v ? "#166534" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: salesView === v ? "#fff" : "#9ca3af",
                        textTransform: "capitalize",
                      }}
                    >
                      {v === "daily" ? "Daily (Week)" : "Weekly (Month)"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bar chart */}
              <SalesChart view={salesView} data={chartData} />

              {/* Summary row */}
              {salesView === "daily" && (
                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                  <View>
                    <Text className="text-[10px] text-gray-400 font-medium">
                      Best Day
                    </Text>
                    <Text className="text-[13px] font-bold text-gray-800">
                      Saturday · ₱3,900
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-medium">
                      Today
                    </Text>
                    <Text className="text-[13px] font-bold text-green-700">
                      ₱2,200
                    </Text>
                  </View>
                </View>
              )}
              {salesView === "weekly" && (
                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                  <View>
                    <Text className="text-[10px] text-gray-400 font-medium">
                      Best Week
                    </Text>
                    <Text className="text-[13px] font-bold text-gray-800">
                      Week 4 · ₱18,450
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-medium">
                      vs Last Month
                    </Text>
                    <Text className="text-[13px] font-bold text-green-700">
                      ↑ ₱2,000
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* ── WHITE ROUNDED BODY ────────────────────────────────────────────── */}
        <View
          className="bg-gray-100 rounded-t-[35px] px-5 pt-5"
          style={{ minHeight: SCREEN_HEIGHT, marginTop: -20 }}
        >

          {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
          <SectionLabel title="Quick Actions" />
          <View className="flex-row gap-2">
            {[
              {
                label: "Add\nProduct",
                iconName: "plus-circle",
                lib: "FA5",
                bg: "bg-green-50",
                color: "#15803d",
                route: "/farmer/(tabs)/product",
              },
              {
                label: "Orders",
                iconName: "clipboard-list",
                lib: "FA5",
                bg: "bg-amber-50",
                color: "#B85C00",
                route: "/farmer/(tabs)/order",
              },
              {
                label: "Messages",
                iconName: "message-text-outline",
                lib: "MCI",
                bg: "bg-blue-50",
                color: "#1A5FA0",
                route: "/farmer/(tabs)/message",
              },
              {
                label: "Deliveries",
                iconName: "truck-delivery",
                lib: "MCI",
                bg: "bg-purple-50",
                color: "#7C3AED",
                route: "/farmer/deliveries/delivery",
              },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                className="flex-1 bg-white rounded-2xl pt-3 pb-2 px-1 items-center shadow-sm"
                onPress={() => router.push(action.route as any)}
              >
                <View
                  className={`w-10 h-10 rounded-[11px] ${action.bg} items-center justify-center mb-2`}
                >
                  {action.lib === "FA5" ? (
                    <FontAwesome5
                      name={action.iconName as any}
                      size={16}
                      color={action.color}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={action.iconName as any}
                      size={19}
                      color={action.color}
                    />
                  )}
                </View>
                <Text className="text-[10px] font-bold text-gray-600 text-center leading-tight">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── TOP SELLING PRODUCTS ───────────────────────────────────────── */}
          <SectionLabel
            title= "Top Selling This Month"
          />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {TOP_PRODUCTS.map((prod, i, arr) => (
              <View
                key={prod.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Rank badge */}
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    prod.rank === 1 ? "bg-green-800" : "bg-green-50"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      prod.rank === 1 ? "text-white" : "text-green-700"
                    }`}
                  >
                    {prod.rank}
                  </Text>
                </View>

                {/* Product image or emoji fallback */}
                <View className="w-10 h-10 rounded-[10px] bg-gray-50 items-center justify-center overflow-hidden">
                  {prod.image ? (
                    <Image
                      source={prod.image as any}
                      style={{ width: 40, height: 40 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 20 }}>{prod.emoji}</Text>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-gray-800">
                    {prod.name}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-green-800 rounded-full"
                        style={{ width: `${prod.pct}%` }}
                      />
                    </View>
                    <Text className="text-[11px] text-gray-400">
                      {prod.sold} sold
                    </Text>
                  </View>
                </View>
                <Text className="text-[13px] font-bold text-gray-800">
                  {prod.revenue}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              className="py-3 border-t border-gray-100 items-center flex-row justify-center gap-1"
              onPress={() =>
                router.push("/farmer/products/top-selling" as any)
              }
            >
              <Text className="text-green-700 font-bold text-[12px]">
                View All Top Products
              </Text>
              <FontAwesome5 name="arrow-right" size={10} color="#15803d" />
            </TouchableOpacity>
          </View>

          {/* ── RECENT ORDERS ──────────────────────────────────────────────── */}
          <SectionLabel title="Recent Orders" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {[
              {
                initials: "MS",
                name: "Maria Santos",
                item: "Organic Tomatoes · 5 kg",
                price: "₱350",
                status: "New",
                statusBg: "bg-green-50",
                statusText: "text-green-700",
                avBg: "bg-green-50",
                avText: "text-green-700",
              },
              {
                initials: "JD",
                name: "Juan Dela Cruz",
                item: "Eggplant · 3 kg",
                price: "₱180",
                status: "Packing",
                statusBg: "bg-blue-50",
                statusText: "text-blue-700",
                avBg: "bg-blue-50",
                avText: "text-blue-700",
              },
              {
                initials: "RL",
                name: "Rosa Lim",
                item: "Sweet Corn · 10 pcs",
                price: "₱120",
                status: "Delivered",
                statusBg: "bg-gray-100",
                statusText: "text-gray-500",
                avBg: "bg-gray-100",
                avText: "text-gray-500",
              },
            ].map((order, i, arr) => (
              <TouchableOpacity
                key={order.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
                onPress={() => router.push("/farmer/(tabs)/order" as any)}
              >
                <View
                  className={`w-10 h-10 rounded-full ${order.avBg} items-center justify-center`}
                >
                  <Text
                    className={`text-[12px] font-bold ${order.avText}`}
                  >
                    {order.initials}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-gray-800">
                    {order.name}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {order.item}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[13px] font-bold text-gray-800">
                    {order.price}
                  </Text>
                  <View
                    className={`${order.statusBg} rounded-full px-2 py-0.5 mt-1`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${order.statusText}`}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="py-3 border-t border-gray-100 items-center flex-row justify-center gap-1"
              onPress={() => router.push("/farmer/(tabs)/order" as any)}
            >
              <Text className="text-green-700 font-bold text-[12px]">
                See all 121 orders
              </Text>
              <FontAwesome5 name="arrow-right" size={10} color="#15803d" />
            </TouchableOpacity>
          </View>

          {/* ── LOW STOCK ALERTS ───────────────────────────────────────────── */}
          <SectionLabel title="Low Stock Alerts" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-100 bg-amber-50">
              <FontAwesome5
                name="exclamation-triangle"
                size={13}
                color="#B85C00"
              />
              <Text className="text-[13px] font-bold text-amber-800">
                3 products need restocking soon
              </Text>
            </View>
            {[
              {
                name: "Bitter Melon",
                qty: "2 kg left",
                productId: "bitter-melon",
              },
              {
                name: "Kangkong",
                qty: "1 bundle left",
                productId: "kangkong",
              },
              { name: "Okra", qty: "4 kg left", productId: "okra" },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
                onPress={() =>
                  router.push(
                    `/farmer/products/edit-product?id=${item.productId}` as any
                  )
                }
                activeOpacity={0.7}
              >
                <View className="w-2 h-2 rounded-full bg-amber-500" />
                <Text className="flex-1 text-[13px] font-medium text-gray-700">
                  {item.name}
                </Text>
                <Text className="text-[12px] font-bold text-amber-600 mr-2">
                  {item.qty}
                </Text>
                <View className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  <Text className="text-[11px] font-bold text-amber-700">
                    Restock
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="h-20" />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default Homepage;

// TODO: Add pull-to-refresh to update sales data and orders list
// FIXME: Chart bars sometimes jump in height when toggling views due to animation conflicts
// TODO: Low stock alerts should ideally link to a restocking workflow instead of just the edit product page
// FIXME: On smaller screens, the sales card's text can overflow - consider making it scrollable or reducing font size dynamically
// FIXME: In the notifications screen, the bell icon's badge doesn't update when notifications are read - need to connect it to actual notification state
// FIXME: The notifications for new orders should navigate to the specific order details instead of just the notifications list when clicked from notifications.
// TODO: In the Sales chart, consider adding tooltips or line graphs to see exact sales numbers when tapping on bars for better data visibility and the average time range of customer orders to optimize the sales data presentation.
// NOTE: Ensure that the UI remains responsive and accessible, especially for users with visual impairments, by testing with screen readers and various font sizes.
// NOTE: Ensure that the UI IS RESPONSIVE AND DYNAMIC, SINCE USER HAVE DIFFERENT SCREEN SIZES, by testing on various devices and orientations, and consider implementing a more adaptive layout if necessary.