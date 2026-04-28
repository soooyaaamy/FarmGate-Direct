import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "revenue" | "sold" | "name";
type CategoryKey = "all" | "vegetables" | "fruits" | "herbs";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_PRODUCTS = [
  {
    rank: 1,
    emoji: "🍅",
    name: "Organic Tomatoes",
    category: "vegetables",
    sold: 47,
    revenue: 7050,
    stock: 18,
    pct: 90,
    trend: "+14%",
    trendUp: true,
  },
  {
    rank: 2,
    emoji: "🌽",
    name: "Sweet Corn",
    category: "vegetables",
    sold: 38,
    revenue: 4560,
    stock: 30,
    pct: 65,
    trend: "+8%",
    trendUp: true,
  },
  {
    rank: 3,
    emoji: "🍆",
    name: "Eggplant",
    category: "vegetables",
    sold: 22,
    revenue: 2640,
    stock: 25,
    pct: 38,
    trend: "-3%",
    trendUp: false,
  },
  {
    rank: 4,
    emoji: "🥬",
    name: "Kangkong",
    category: "vegetables",
    sold: 19,
    revenue: 1140,
    stock: 1,
    pct: 30,
    trend: "+5%",
    trendUp: true,
  },
  {
    rank: 5,
    emoji: "🍉",
    name: "Watermelon",
    category: "fruits",
    sold: 17,
    revenue: 3400,
    stock: 12,
    pct: 27,
    trend: "+22%",
    trendUp: true,
  },
  {
    rank: 6,
    emoji: "🥭",
    name: "Carabao Mango",
    category: "fruits",
    sold: 15,
    revenue: 2250,
    stock: 8,
    pct: 24,
    trend: "+11%",
    trendUp: true,
  },
  {
    rank: 7,
    emoji: "🌿",
    name: "Pandan Leaves",
    category: "herbs",
    sold: 13,
    revenue: 780,
    stock: 20,
    pct: 20,
    trend: "+2%",
    trendUp: true,
  },
  {
    rank: 8,
    emoji: "🥦",
    name: "Broccoli",
    category: "vegetables",
    sold: 11,
    revenue: 1320,
    stock: 6,
    pct: 17,
    trend: "-6%",
    trendUp: false,
  },
  {
    rank: 9,
    emoji: "🧅",
    name: "Red Onions",
    category: "vegetables",
    sold: 10,
    revenue: 900,
    stock: 22,
    pct: 15,
    trend: "+1%",
    trendUp: true,
  },
  {
    rank: 10,
    emoji: "🌶️",
    name: "Siling Labuyo",
    category: "herbs",
    sold: 9,
    revenue: 540,
    stock: 14,
    pct: 13,
    trend: "+9%",
    trendUp: true,
  },
];

const TOTAL_REVENUE = ALL_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
const TOTAL_SOLD = ALL_PRODUCTS.reduce((s, p) => s + p.sold, 0);

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "vegetables", label: "Vegetables" },
  { key: "fruits", label: "Fruits" },
  { key: "herbs", label: "Herbs" },
];

// ─── Reusable Components ──────────────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <View className="flex-row items-center justify-between mt-5 mb-2">
    <Text className="text-[11px] font-bold tracking-widest uppercase text-green-700">
      {title}
    </Text>
  </View>
);

// ─── Product Row ──────────────────────────────────────────────────────────────

const ProductRow = ({
  product,
  index,
  isLast,
  onPress,
}: {
  product: (typeof ALL_PRODUCTS)[0];
  index: number;
  isLast: boolean;
  onPress: () => void;
}) => {
  const isTop3 = product.rank <= 3;
  const isLowStock = product.stock <= 5;

  const rankBgColor =
    product.rank === 1
      ? "#166534"
      : product.rank === 2
      ? "#15803d"
      : product.rank === 3
      ? "#16a34a"
      : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-3 px-4 py-3 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      {/* Rank badge */}
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: rankBgColor ?? "#f0fdf4",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "800",
            color: isTop3 ? "#fff" : "#15803d",
          }}
        >
          {product.rank}
        </Text>
      </View>

      {/* Emoji icon */}
      <View className="w-10 h-10 rounded-[10px] bg-gray-50 items-center justify-center">
        <Text style={{ fontSize: 20 }}>{product.emoji}</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[13px] font-bold text-gray-800">
            {product.name}
          </Text>
          {isLowStock && (
            <View className="bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
              <Text className="text-[9px] font-bold text-amber-600">
                LOW
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-2 mt-1.5">
          <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-700 rounded-full"
              style={{ width: `${product.pct}%` }}
            />
          </View>
          <Text className="text-[10px] text-gray-400">{product.sold} sold</Text>
        </View>
      </View>

      {/* Revenue + trend */}
      <View className="items-end">
        <Text className="text-[13px] font-bold text-gray-800">
          ₱{product.revenue.toLocaleString()}
        </Text>
        <View
          className={`flex-row items-center gap-0.5 mt-0.5 rounded-full px-1.5 py-0.5 ${
            product.trendUp ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <MaterialCommunityIcons
            name={product.trendUp ? "trending-up" : "trending-down"}
            size={10}
            color={product.trendUp ? "#15803d" : "#dc2626"}
          />
          <Text
            className={`text-[10px] font-bold ${
              product.trendUp ? "text-green-700" : "text-red-600"
            }`}
          >
            {product.trend}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TopSellingPage = () => {
  const router = useRouter();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [60, 110],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  // Filter + sort
  const filtered =
    activeCategory === "all"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "sold") return b.sold - a.sold;
    return a.name.localeCompare(b.name);
  });

  const sortLabel =
    sortBy === "revenue" ? "Revenue" : sortBy === "sold" ? "Units Sold" : "Name";

  return (
    <View className="flex-1 bg-green-800">
      {/* ── Sticky compact header (appears on scroll) ── */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingTop: STATUS_BAR,
          opacity: headerTitleOpacity,
          backgroundColor: "#166534",
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="w-8 h-8 items-center justify-center">
          <FontAwesome5 name="arrow-left" size={15} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-[16px]">Top Selling Products</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* ── GREEN HEADER ────────────────────────────────────────────────── */}
        <View
          style={{ paddingTop: STATUS_BAR + 12 }}
          className="bg-green-800 px-5 pb-8"
        >
          {/* Back + title row */}
          <Animated.View
            style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslate }] }}
          >
            <View className="flex-row items-center gap-3 mb-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 items-center justify-center"
              >
                <FontAwesome5 name="arrow-left" size={14} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-bold text-[20px]">
                Top Selling Products
              </Text>
            </View>

            {/* Summary stats card */}
            <View className="bg-white rounded-2xl p-5">
              <Text className="text-green-700 font-bold text-[11px] tracking-widest uppercase mb-3">
                This Month&apos;s Overview
              </Text>
              <View className="flex-row gap-3">
                {/* Total Revenue */}
                <View className="flex-1 bg-green-50 rounded-xl p-3">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <MaterialCommunityIcons
                      name="cash-multiple"
                      size={13}
                      color="#15803d"
                    />
                    <Text className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">
                      Revenue
                    </Text>
                  </View>
                  <Text className="text-[20px] font-bold text-gray-900">
                    ₱{TOTAL_REVENUE.toLocaleString()}
                  </Text>
                  <View className="flex-row items-center gap-0.5 mt-0.5">
                    <MaterialCommunityIcons
                      name="trending-up"
                      size={11}
                      color="#15803d"
                    />
                    <Text className="text-[11px] text-green-700 font-bold">
                      +12% vs last month
                    </Text>
                  </View>
                </View>

                {/* Total Units Sold */}
                <View className="flex-1 bg-amber-50 rounded-xl p-3">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={13}
                      color="#b45309"
                    />
                    <Text className="text-[10px] text-amber-700 font-semibold uppercase tracking-wide">
                      Units Sold
                    </Text>
                  </View>
                  <Text className="text-[20px] font-bold text-gray-900">
                    {TOTAL_SOLD}
                  </Text>
                  <Text className="text-[11px] text-amber-700 font-bold mt-0.5">
                    across {ALL_PRODUCTS.length} products
                  </Text>
                </View>
              </View>

              {/* Top earner highlight */}
              <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-green-800 items-center justify-center">
                  <Text style={{ fontSize: 14 }}>🏆</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 font-medium">
                    Top Earner
                  </Text>
                  <Text className="text-[13px] font-bold text-gray-800">
                    Organic Tomatoes · ₱7,050
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 bg-green-50 rounded-full px-2 py-1">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={12}
                    color="#15803d"
                  />
                  <Text className="text-[11px] font-bold text-green-700">
                    +14%
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── WHITE BODY ───────────────────────────────────────────────────── */}
        <View
          className="bg-gray-100 rounded-t-[35px] px-5 pt-5"
          style={{ minHeight: SCREEN_HEIGHT, marginTop: -20 }}
        >
          {/* ── Category filter pills ──────────────────────────────────────── */}
          <SectionLabel title="Browse by Category" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-1"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    activeCategory === cat.key ? "#166534" : "#fff",
                  borderWidth: 1,
                  borderColor:
                    activeCategory === cat.key ? "#166534" : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: activeCategory === cat.key ? "#fff" : "#6b7280",
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Sort row ───────────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between mt-4 mb-2">
            <Text className="text-[11px] font-bold tracking-widest uppercase text-green-700">
              {sorted.length} Products
            </Text>
            <View className="relative">
              <TouchableOpacity
                onPress={() => setSortMenuOpen((v) => !v)}
                className="flex-row items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-200"
              >
                <FontAwesome5 name="sort-amount-down" size={10} color="#374151" />
                <Text className="text-[11px] font-bold text-gray-700">
                  {sortLabel}
                </Text>
                <FontAwesome5
                  name={sortMenuOpen ? "chevron-up" : "chevron-down"}
                  size={9}
                  color="#9ca3af"
                />
              </TouchableOpacity>

              {/* Dropdown */}
              {sortMenuOpen && (
                <View
                  className="absolute right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  style={{ top: 36, width: 140, zIndex: 99 }}
                >
                  {(
                    [
                      { key: "revenue", label: "Revenue" },
                      { key: "sold", label: "Units Sold" },
                      { key: "name", label: "Name" },
                    ] as { key: SortKey; label: string }[]
                  ).map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => {
                        setSortBy(opt.key);
                        setSortMenuOpen(false);
                      }}
                      className={`px-4 py-3 flex-row items-center justify-between ${
                        sortBy === opt.key ? "bg-green-50" : ""
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-semibold ${
                          sortBy === opt.key ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </Text>
                      {sortBy === opt.key && (
                        <FontAwesome5
                          name="check"
                          size={10}
                          color="#15803d"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Product list ───────────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {sorted.length === 0 ? (
              <View className="py-12 items-center">
                <Text style={{ fontSize: 36 }}>🌱</Text>
                <Text className="text-gray-400 font-semibold text-sm mt-2">
                  No products in this category
                </Text>
              </View>
            ) : (
              sorted.map((product, i) => (
                <ProductRow
                  key={product.name}
                  product={product}
                  index={i}
                  isLast={i === sorted.length - 1}
                  onPress={() =>
                    router.push(
                      `/farmer/products/edit-product?id=${product.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}` as any
                    )
                  }
                />
              ))
            )}
          </View>

          {/* ── Low stock alert banner ─────────────────────────────────────── */}
          {ALL_PRODUCTS.filter((p) => p.stock <= 5).length > 0 && (
            <>
              <SectionLabel title="Low Stock in Top Products" />
              <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <View className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-100 bg-amber-50">
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={13}
                    color="#B85C00"
                  />
                  <Text className="text-[13px] font-bold text-amber-800">
                    {ALL_PRODUCTS.filter((p) => p.stock <= 5).length} top sellers
                    are running low
                  </Text>
                </View>
                {ALL_PRODUCTS.filter((p) => p.stock <= 5).map((item, i, arr) => (
                  <TouchableOpacity
                    key={item.name}
                    className={`flex-row items-center gap-3 px-4 py-3 ${
                      i < arr.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                    onPress={() =>
                      router.push(
                        `/farmer/products/edit-product?id=${item.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}` as any
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-[13px] font-bold text-gray-800">
                        {item.name}
                      </Text>
                      <Text className="text-[11px] text-amber-600 font-semibold">
                        Only {item.stock} {item.stock === 1 ? "unit" : "units"} left
                      </Text>
                    </View>
                    <View className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                      <Text className="text-[11px] font-bold text-amber-700">
                        Restock
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View className="h-20" />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default TopSellingPage;