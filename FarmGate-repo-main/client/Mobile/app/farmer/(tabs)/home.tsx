import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Reusable small components ───────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <Text className="text-[11px] font-bold tracking-widest uppercase text-green-700 mt-5 mb-2">
    {title}
  </Text>
);

const SparkBar = ({ height, active }: { height: number; active?: boolean }) => (
  <View
    style={{ height, flex: 1, borderRadius: 3 }}
    className={active ? "bg-green-800" : "bg-green-100"}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Homepage = () => {
  const router = useRouter();

  // ── Fully dynamic — reacts to screen size changes ────────────────────────
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  // Dynamic status bar height — works on all Android & iOS devices
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const unreadCount = 5;

  const sparkData = [35, 52, 44, 68, 55, 78, 100];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];

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
          {/* Greeting row — fades + slides as you scroll */}
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
                <Text className="text-white/60 text-xs font-medium">Good Morning</Text>
                <Text className="text-white font-bold text-[20px] leading-tight">
                  Mario Santos
                </Text>
              </View>
            </View>

            {/* Bell with number badge */}
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 items-center justify-center"
              onPress={() => router.push("/farmer/notifications/notif" as any)}
            >
              <FontAwesome5 name="bell" size={17} color="white" />
              {unreadCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 bg-yellow-400 rounded-full items-center justify-center border-2 border-green-800"
                  style={{ minWidth: 18, height: 18, paddingHorizontal: 3 }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#1a3a1a" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Sales card — scales as you scroll */}
          <Animated.View style={{ transform: [{ scale: salesCardScale }] }}>
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-green-700 font-bold text-[11px] tracking-widest uppercase">
                    Total Sales This Month
                  </Text>
                  <Text className="text-[32px] font-bold text-gray-900 leading-tight mt-1">
                    ₱18,450
                  </Text>
                </View>
                <View className="flex-row items-center bg-green-50 rounded-full px-3 py-1 gap-1 mt-1">
                  <MaterialCommunityIcons name="trending-up" size={14} color="#15803d" />
                  <Text className="text-green-700 font-bold text-[12px]">+12%</Text>
                </View>
              </View>

              <Text className="text-[12px] text-gray-400 mb-3">
                ↑ ₱2,000 more than last month
              </Text>

              <View className="flex-row items-end gap-1" style={{ height: 36 }}>
                {sparkData.map((h, i) => (
                  <SparkBar
                    key={i}
                    height={(h / 100) * 36}
                    active={i === sparkData.length - 1}
                  />
                ))}
              </View>

              <View className="flex-row mt-1 gap-1">
                {dayLabels.map((d, i) => (
                  <Text
                    key={i}
                    style={{ flex: 1 }}
                    className="text-[9px] text-gray-400 text-center"
                  >
                    {d}
                  </Text>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── WHITE ROUNDED BODY — rises over green as you scroll ────────────── */}
        <View
          className="bg-gray-100 rounded-t-[35px] px-5 pt-5"
          style={{ minHeight: SCREEN_HEIGHT, marginTop: -20 }}
        >

          {/* ── OVERVIEW STATS ─────────────────────────────────────────────── */}
          <SectionLabel title="Overview" />
          <View className="flex-row gap-2">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-9 h-9 rounded-[10px] bg-green-50 items-center justify-center mb-2">
                <MaterialCommunityIcons name="storefront-outline" size={19} color="#15803d" />
              </View>
              <Text className="text-[22px] font-bold text-gray-900">21</Text>
              <Text className="text-[10px] text-gray-400 mt-1 font-medium text-center">
                Products
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-9 h-9 rounded-[10px] bg-blue-50 items-center justify-center mb-2">
                <MaterialCommunityIcons name="package-variant-closed" size={19} color="#1A5FA0" />
              </View>
              <Text className="text-[22px] font-bold text-gray-900">121</Text>
              <Text className="text-[10px] text-gray-400 mt-1 font-medium text-center">
                Orders
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm">
              <View className="w-9 h-9 rounded-[10px] bg-amber-50 items-center justify-center mb-2">
                <FontAwesome5 name="exclamation-triangle" size={16} color="#B85C00" />
              </View>
              <Text className="text-[22px] font-bold text-amber-600">3</Text>
              <Text className="text-[10px] text-amber-500 mt-1 font-medium text-center">
                Low Stock
              </Text>
            </View>
          </View>

          {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
          <SectionLabel title="Quick Actions" />
          <View className="flex-row gap-2">
            {[
              { label: "Add Product", iconName: "plus-circle",          lib: "FA5", bg: "bg-green-50", color: "#15803d", route: "/farmer/(tabs)/products/add" },
              { label: "Orders",   iconName: "clipboard-list",       lib: "FA5", bg: "bg-amber-50", color: "#B85C00", route: "/farmer/(tabs)/orders"        },
              { label: "Messages",    iconName: "message-text-outline", lib: "MCI", bg: "bg-blue-50",  color: "#1A5FA0", route: "/farmer/chats"                 },
              { label: "Deliveries",  iconName: "truck-delivery",       lib: "MCI", bg: "bg-purple-50",color: "#7C3AED", route: "/farmer/(tabs)/deliveries"     },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                className="flex-1 bg-white rounded-2xl pt-3 pb-2 px-1 items-center shadow-sm"
                onPress={() => router.push(action.route as any)}
              >
                <View className={`w-10 h-10 rounded-[11px] ${action.bg} items-center justify-center mb-2`}>
                  {action.lib === "FA5" ? (
                    <FontAwesome5 name={action.iconName as any} size={16} color={action.color} />
                  ) : (
                    <MaterialCommunityIcons name={action.iconName as any} size={19} color={action.color} />
                  )}
                </View>
                <Text className="text-[10px] font-bold text-gray-600 text-center leading-tight">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── TOP PRODUCTS ───────────────────────────────────────────────── */}
          <SectionLabel title="Top Selling This Month" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {[
              { emoji: "🍅", name: "Organic Tomatoes", sold: 47, pct: 90, revenue: "₱7,050", rank: 1 },
              { emoji: "🌽", name: "Sweet Corn",       sold: 38, pct: 65, revenue: "₱4,560", rank: 2 },
              { emoji: "🍆", name: "Eggplant",         sold: 22, pct: 38, revenue: "₱2,640", rank: 3 },
            ].map((prod, i, arr) => (
              <View
                key={prod.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className={`w-6 h-6 rounded-full items-center justify-center ${prod.rank === 1 ? "bg-green-800" : "bg-green-50"}`}>
                  <Text className={`text-[11px] font-bold ${prod.rank === 1 ? "text-white" : "text-green-700"}`}>
                    {prod.rank}
                  </Text>
                </View>
                <View className="w-10 h-10 rounded-[10px] bg-gray-50 items-center justify-center">
                  <Text style={{ fontSize: 20 }}>{prod.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-gray-800">{prod.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-green-800 rounded-full"
                        style={{ width: `${prod.pct}%` }}
                      />
                    </View>
                    <Text className="text-[11px] text-gray-400">{prod.sold} sold</Text>
                  </View>
                </View>
                <Text className="text-[13px] font-bold text-gray-800">{prod.revenue}</Text>
              </View>
            ))}
          </View>

          {/* ── RECENT ORDERS ──────────────────────────────────────────────── */}
          <SectionLabel title="Recent Orders" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {[
              { initials: "MS", name: "Maria Santos",   item: "Organic Tomatoes · 5 kg", price: "₱350", status: "New",       statusBg: "bg-green-50", statusText: "text-green-700", avBg: "bg-green-50", avText: "text-green-700" },
              { initials: "JD", name: "Juan Dela Cruz", item: "Eggplant · 3 kg",         price: "₱180", status: "Packing",   statusBg: "bg-blue-50",  statusText: "text-blue-700",  avBg: "bg-blue-50",  avText: "text-blue-700"  },
              { initials: "RL", name: "Rosa Lim",       item: "Sweet Corn · 10 pcs",      price: "₱120", status: "Delivered", statusBg: "bg-gray-100", statusText: "text-gray-500",  avBg: "bg-gray-100", avText: "text-gray-500"  },
            ].map((order, i, arr) => (
              <TouchableOpacity
                key={order.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
                onPress={() => router.push("/farmer/(tabs)/orders" as any)}
              >
                <View className={`w-10 h-10 rounded-full ${order.avBg} items-center justify-center`}>
                  <Text className={`text-[12px] font-bold ${order.avText}`}>
                    {order.initials}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-gray-800">{order.name}</Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">{order.item}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[13px] font-bold text-gray-800">{order.price}</Text>
                  <View className={`${order.statusBg} rounded-full px-2 py-0.5 mt-1`}>
                    <Text className={`text-[10px] font-bold ${order.statusText}`}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="py-3 border-t border-gray-100 items-center flex-row justify-center gap-1"
              onPress={() => router.push("/farmer/(tabs)/orders" as any)}
            >
              <Text className="text-green-700 font-bold text-[12px]">See all 121 orders</Text>
              <FontAwesome5 name="arrow-right" size={10} color="#15803d" />
            </TouchableOpacity>
          </View>


          {/* ── LOW STOCK ALERTS ───────────────────────────────────────────── */}
          <SectionLabel title="Low Stock Alerts" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <View className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-100 bg-amber-50">
              <FontAwesome5 name="exclamation-triangle" size={13} color="#B85C00" />
              <Text className="text-[13px] font-bold text-amber-800">
                3 products need restocking soon
              </Text>
            </View>
            {[
              { name: "Bitter Melon", qty: "2 kg left",    productId: "bitter-melon" },
              { name: "Kangkong",     qty: "1 bundle left", productId: "kangkong"    },
              { name: "Okra",         qty: "4 kg left",    productId: "okra"         },
            ].map((item, i, arr) => (
              <View
                key={item.name}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-2 h-2 rounded-full bg-amber-500" />
                <Text className="flex-1 text-[13px] font-medium text-gray-700">
                  {item.name}
                </Text>
                <Text className="text-[12px] font-bold text-amber-600 mr-2">{item.qty}</Text>
                <TouchableOpacity
                  className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1"
                  onPress={() =>
                    router.push(`/farmer/(tabs)/products/edit/${item.productId}` as any)
                  }
                >
                  <Text className="text-[11px] font-bold text-amber-700">Restock</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="h-20" />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default Homepage;