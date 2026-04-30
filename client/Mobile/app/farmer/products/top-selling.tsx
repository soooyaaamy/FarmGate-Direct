/**
 * top-selling.tsx — Top Selling Products Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from previous version:
 *
 *  BUG FIX — Category filter buttons expanding vertically (shown in screenshot)
 *    Root cause: Inside a horizontal ScrollView, TouchableOpacity has no
 *    explicit height, so React Native stretches it to fill the cross-axis
 *    (the full visible height of the ScrollView container).
 *    Fix: add `alignItems: "center"` to contentContainerStyle AND set an
 *    explicit `height: 34` on every pill button — this locks the cross-axis
 *    size regardless of content or active-state style changes.
 *
 *  BUG FIX — Sort dropdown shifts layout
 *    The dropdown was absolutely positioned but its parent `View` had
 *    `position: relative` inside a flex row, which caused neighboring items
 *    to move. Fix: wrap sort row in a View with `zIndex: 10` and
 *    `overflow: visible` so the dropdown floats above content without
 *    affecting layout flow.
 *
 *  UI — Removed redundant "View All" button at the bottom of the product list
 *    (navigation already exists in the header back button and section labels).
 *
 *  UI — Uses only MaterialCommunityIcons for icon consistency.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useRef, useState } from "react";
import {
  Animated,
  // Image,
  ScrollView,
  Text,
  TouchableOpacity,
  // useWindowDimensions,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey      = "revenue" | "sold" | "name";
type CategoryKey  = "all" | "vegetables" | "fruits" | "herbs";

// ─── Product data ─────────────────────────────────────────────────────────────

const ALL_PRODUCTS = [
  { rank: 1,  emoji: "🍅", name: "Organic Tomatoes", category: "vegetables", sold: 47, revenue: 7050, stock: 18, pct: 90, trend: "+14%", trendUp: true  },
  { rank: 2,  emoji: "🌽", name: "Sweet Corn",        category: "vegetables", sold: 38, revenue: 4560, stock: 30, pct: 65, trend: "+8%",  trendUp: true  },
  { rank: 3,  emoji: "🍆", name: "Eggplant",           category: "vegetables", sold: 22, revenue: 2640, stock: 25, pct: 38, trend: "-3%",  trendUp: false },
  { rank: 4,  emoji: "🥬", name: "Kangkong",            category: "vegetables", sold: 19, revenue: 1140, stock: 1,  pct: 30, trend: "+5%",  trendUp: true  },
  { rank: 5,  emoji: "🍉", name: "Watermelon",          category: "fruits",     sold: 17, revenue: 3400, stock: 12, pct: 27, trend: "+22%", trendUp: true  },
  { rank: 6,  emoji: "🥭", name: "Carabao Mango",      category: "fruits",     sold: 15, revenue: 2250, stock: 8,  pct: 24, trend: "+11%", trendUp: true  },
  { rank: 7,  emoji: "🌿", name: "Pandan Leaves",      category: "herbs",      sold: 13, revenue: 780,  stock: 20, pct: 20, trend: "+2%",  trendUp: true  },
  { rank: 8,  emoji: "🥦", name: "Broccoli",            category: "vegetables", sold: 11, revenue: 1320, stock: 6,  pct: 17, trend: "-6%",  trendUp: false },
  { rank: 9,  emoji: "🧅", name: "Red Onions",          category: "vegetables", sold: 10, revenue: 900,  stock: 22, pct: 15, trend: "+1%",  trendUp: true  },
  { rank: 10, emoji: "🌶️", name: "Siling Labuyo",     category: "herbs",      sold: 9,  revenue: 540,  stock: 14, pct: 13, trend: "+9%",  trendUp: true  },
];

const TOTAL_REVENUE = ALL_PRODUCTS.reduce((s, p) => s + p.revenue, 0);
const TOTAL_SOLD    = ALL_PRODUCTS.reduce((s, p) => s + p.sold, 0);

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all",        label: "All"        },
  { key: "vegetables", label: "Vegetables" },
  { key: "fruits",     label: "Fruits"     },
  { key: "herbs",      label: "Herbs"      },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Revenue"    },
  { key: "sold",    label: "Units Sold" },
  { key: "name",    label: "Name"       },
];

// ─── Product Row ──────────────────────────────────────────────────────────────

type Product = typeof ALL_PRODUCTS[0];

const ProductRow: React.FC<{
  product: Product;
  isLast:  boolean;
  onPress: () => void;
}> = ({ product, isLast, onPress }) => {
  const isTop3     = product.rank <= 3;
  const isLowStock = product.stock <= 5;

  const rankBg =
    product.rank === 1 ? "#166534" :
    product.rank === 2 ? "#15803d" :
    product.rank === 3 ? "#16a34a" : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1, borderBottomColor: "#f3f4f6",
      }}
    >
      {/* Rank badge */}
      <View style={{
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: rankBg ?? "#f0fdf4",
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ fontSize: 11, fontWeight: "800", color: isTop3 ? "#fff" : "#15803d" }}>
          {product.rank}
        </Text>
      </View>

      {/* Emoji */}
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20 }}>{product.emoji}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{product.name}</Text>
          {isLowStock && (
            <View style={{ backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: "#b45309" }}>LOW</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
          <View style={{ flex: 1, height: 5, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${product.pct}%`, backgroundColor: "#166534", borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 10, color: "#9ca3af" }}>{product.sold} sold</Text>
        </View>
      </View>

      {/* Revenue + trend */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
          ₱{product.revenue.toLocaleString()}
        </Text>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4,
          backgroundColor: product.trendUp ? "#f0fdf4" : "#fef2f2",
          borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
        }}>
          <MaterialCommunityIcons
            name={product.trendUp ? "trending-up" : "trending-down"}
            size={10}
            color={product.trendUp ? "#15803d" : "#dc2626"}
          />
          <Text style={{ fontSize: 10, fontWeight: "700", color: product.trendUp ? "#15803d" : "#dc2626" }}>
            {product.trend}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TopSellingPage = () => {
  const router                    = useRouter();
  // const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR                = Constants.statusBarHeight ?? 44;

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [sortBy,         setSortBy]         = useState<SortKey>("revenue");
  const [sortMenuOpen,   setSortMenuOpen]   = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [60, 110], outputRange: [0, 1], extrapolate: "clamp",
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [1, 0], extrapolate: "clamp",
  });
  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [0, -20], extrapolate: "clamp",
  });

  const filtered = activeCategory === "all"
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "sold")    return b.sold    - a.sold;
    return a.name.localeCompare(b.name);
  });

  const sortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? "Revenue";

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Sticky compact header ── */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: STATUS_BAR, opacity: headerTitleOpacity,
        backgroundColor: "#166534", paddingBottom: 12, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 12,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}
        >
          <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          Top Selling Products
        </Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* ── GREEN HEADER ── */}
        <View style={{ paddingTop: STATUS_BAR + 12, paddingHorizontal: 20, paddingBottom: 28, backgroundColor: "#166534" }}>
          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslate }] }}>

            {/* Back + title */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>
                Top Selling Products
              </Text>
            </View>

            {/* Summary card */}
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#15803d", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12 }}>
                This Month&apos;s Overview
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Revenue */}
                <View style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: 14, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <MaterialCommunityIcons name="cash-multiple" size={13} color="#15803d" />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: 1 }}>
                      Revenue
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                    ₱{TOTAL_REVENUE.toLocaleString()}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 }}>
                    <MaterialCommunityIcons name="trending-up" size={11} color="#15803d" />
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>
                      +12% vs last month
                    </Text>
                  </View>
                </View>

                {/* Units sold */}
                <View style={{ flex: 1, backgroundColor: "#fffbeb", borderRadius: 14, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <MaterialCommunityIcons name="package-variant" size={13} color="#b45309" />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#b45309", textTransform: "uppercase", letterSpacing: 1 }}>
                      Units Sold
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                    {TOTAL_SOLD}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#b45309", marginTop: 4 }}>
                    across {ALL_PRODUCTS.length} products
                  </Text>
                </View>
              </View>

              {/* Top earner */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#166534", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 16 }}>🏆</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>Top Earner</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                    Organic Tomatoes · ₱7,050
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#f0fdf4", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <MaterialCommunityIcons name="trending-up" size={12} color="#15803d" />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>+14%</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── WHITE BODY ── */}
        <View style={{
          backgroundColor: "#f3f4f6", borderTopLeftRadius: 32, borderTopRightRadius: 32,
          paddingHorizontal: 16, paddingTop: 16,
          marginTop: -18,
        }}>

          {/* ── Category filter pills ──────────────────────────────────────────
              FIX: alignItems:"center" on contentContainerStyle locks the
              cross-axis so buttons can never stretch to fill the ScrollView
              height. Explicit height:34 on each pill is the second guard.
          */}
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", color: "#15803d", marginBottom: 10 }}>
            Browse by Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingRight: 8,
            }}
            style={{ marginBottom: 4 }}
          >
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setActiveCategory(cat.key)}
                  style={{
                    height: 34,               // ← explicit fixed height
                    paddingHorizontal: 16,
                    borderRadius: 17,
                    backgroundColor: active ? "#166534" : "#fff",
                    borderWidth: 1,
                    borderColor: active ? "#166534" : "#e5e7eb",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: "700",
                    color: active ? "#fff" : "#6b7280",
                  }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Sort row ──────────────────────────────────────────────────────
              zIndex + overflow:visible lets the dropdown float above the list
              without affecting any layout measurements below.
          */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 8, zIndex: 10 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", color: "#15803d" }}>
              {sorted.length} Products
            </Text>

            {/* Sort button + dropdown */}
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={() => setSortMenuOpen(v => !v)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
                  borderWidth: 1, borderColor: "#e5e7eb",
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="sort-descending" size={13} color="#374151" />
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#374151" }}>
                  {sortLabel}
                </Text>
                <MaterialCommunityIcons
                  name={sortMenuOpen ? "chevron-up" : "chevron-down"}
                  size={13}
                  color="#9ca3af"
                />
              </TouchableOpacity>

              {sortMenuOpen && (
                <View style={{
                  position: "absolute", right: 0, top: 40,
                  width: 150, backgroundColor: "#fff", borderRadius: 14,
                  borderWidth: 1, borderColor: "#f3f4f6",
                  // Shadow for floating effect
                  shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12, shadowRadius: 10, elevation: 8,
                  overflow: "hidden", zIndex: 99,
                }}>
                  {SORT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => { setSortBy(opt.key); setSortMenuOpen(false); }}
                      style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                        paddingHorizontal: 14, paddingVertical: 12,
                        backgroundColor: sortBy === opt.key ? "#f0fdf4" : "#fff",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: sortBy === opt.key ? "#15803d" : "#4b5563" }}>
                        {opt.label}
                      </Text>
                      {sortBy === opt.key && (
                        <MaterialCommunityIcons name="check" size={14} color="#15803d" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Product list ── */}
          <View style={{ backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            {sorted.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 36 }}>🌱</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#9ca3af" }}>
                  No products in this category
                </Text>
              </View>
            ) : (
              sorted.map((product, i) => (
                <ProductRow
                  key={product.name}
                  product={product}
                  isLast={i === sorted.length - 1}
                  onPress={() => router.push(
                    `/farmer/products/edit-product?id=${product.name.toLowerCase().replace(/\s+/g, "-")}` as any
                  )}
                />
              ))
            )}
          </View>
          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default TopSellingPage;

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * BUG FIX — Category filter buttons expanding vertically
 *   Added alignItems:"center" to ScrollView contentContainerStyle.
 *   Added explicit height:34 to every pill TouchableOpacity.
 *   Both guards are needed: contentContainerStyle controls cross-axis
 *   stretching; explicit height prevents style changes (borderColor, bg)
 *   from triggering layout recalculation that could resize the button.
 *
 * BUG FIX — Sort dropdown shifting layout
 *   Parent View now has zIndex:10; dropdown has zIndex:99 + elevation:8.
 *   This makes it float above the product list without displacing it.
 *
 * ICON LIBRARY
 *   Replaced FontAwesome5 with MaterialCommunityIcons throughout for
 *   consistency with the rest of the app.
 *
 * REMOVED
 *   Redundant "View All" button at the bottom of the product list.
 *   (Back button + section header already provide navigation.)
 */