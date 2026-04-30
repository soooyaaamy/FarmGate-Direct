/**
 * home.tsx — Farmer Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from previous version:
 *  - Pull-to-refresh added via RefreshControl on the ScrollView
 *  - Low Stock section always visible; shows "No low stock alerts" empty state
 *    when list is empty (previously hidden entirely)
 *  - Bottom padding added so last low-stock item is never clipped
 *  - "See all N orders" button inside the orders card removed (redundant with
 *    "See All" in the section header)
 *  - Entire Recent Orders card is now one TouchableOpacity → navigates to Orders
 *  - Entire Top Selling card is now one TouchableOpacity → navigates to Products
 *  - Empty states for both cards ("No recent orders", "No top selling products")
 *  - SalesCardSkeleton imported from SalesCard for a proper loading state
 *  - Unused imports (ScrollView, ActivityIndicator) removed
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useRef, useState, useCallback } from "react";
import {
  Animated, Image, Text, TouchableOpacity,
  useWindowDimensions, View, RefreshControl,
} from "react-native";

import { useHomeData } from "../../hooks/UseHomeData";
import type { StockProduct, TopProduct, RecentOrder } from "../../hooks/UseHomeData";
import { SalesCard, SalesCardSkeleton } from "../../../components/SalesCard";
import { QuickActions }               from "../../../components/QuickAction";
import { RestockModal }               from "../../../components/RestockModal";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Section Label ────────────────────────────────────────────────────────────

const SectionLabel = ({
  title, actionLabel, onAction,
}: { title: string; actionLabel?: string; onAction?: () => void }) => (
  <View style={{
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 20, marginBottom: 8,
  }}>
    <Text style={{
      fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
      textTransform: "uppercase", color: "#15803d",
    }}>
      {title}
    </Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>{actionLabel}</Text>
        <MaterialCommunityIcons name="arrow-right" size={12} color="#15803d" />
      </TouchableOpacity>
    )}
  </View>
);

// ─── Skeleton block ───────────────────────────────────────────────────────────

const Skeleton = ({ h = 16, radius = 8 }: { h?: number; radius?: number }) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ])).start();
  }, [pulse]);
  return (
    <Animated.View style={{
      height: h, borderRadius: radius, backgroundColor: "#e5e7eb",
      marginBottom: 8, opacity: pulse,
    }} />
  );
};

// ─── Order status style map ───────────────────────────────────────────────────

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  New:       { bg: "#f0fdf4", text: "#15803d" },
  Packing:   { bg: "#eff6ff", text: "#1d4ed8" },
  Ready:     { bg: "#f5f3ff", text: "#7c3aed" },
  Delivered: { bg: "#f3f4f6", text: "#6b7280" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626" },
};

// ─── Shared card style ────────────────────────────────────────────────────────

const CARD_STYLE = {
  backgroundColor: "#fff",
  borderRadius: 18,
  overflow: "hidden" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Homepage = () => {
  const router              = useRouter();
  const { height: SCREEN_H } = useWindowDimensions();

  const {
    sales, topProducts, recentOrders, lowStockProducts,
    badgeCounts, loading, error,
    refresh, updateProductStock,
  } = useHomeData();

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Restock modal
  const [restockTarget, setRestockTarget] = useState<StockProduct | null>(null);

  const handleRestockConfirm = useCallback((id: string, newTotal: number) => {
    updateProductStock(id, newTotal);
  }, [updateProductStock]);

  // Scroll animations
  const scrollY        = useRef(new Animated.Value(0)).current;
  const headerOpacity  = scrollY.interpolate({ inputRange: [0, 110], outputRange: [1, 0], extrapolate: "clamp" });
  const headerTranslate= scrollY.interpolate({ inputRange: [0, 110], outputRange: [0, -24], extrapolate: "clamp" });
  const cardScale      = scrollY.interpolate({ inputRange: [0, 110], outputRange: [1, 0.96], extrapolate: "clamp" });

  const unread = badgeCounts.orders + badgeCounts.messages;

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* Error banner */}
      {error && (
        <View style={{
          position: "absolute", top: STATUS_BAR, left: 12, right: 12, zIndex: 50,
          backgroundColor: "#fef2f2", borderRadius: 12, padding: 12,
          flexDirection: "row", alignItems: "center", gap: 8,
          borderWidth: 1, borderColor: "#fecaca",
        }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#dc2626" />
          <Text style={{ flex: 1, fontSize: 12, color: "#991b1b", fontWeight: "600" }}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#dc2626" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#166534"]}
            progressBackgroundColor="#fff"
          />
        }
      >

        {/* ── GREEN HEADER ─────────────────────────────────────────────────── */}
        <View style={{
          paddingTop: STATUS_BAR + 14, paddingHorizontal: 18,
          paddingBottom: 28, backgroundColor: "#166534",
        }}>

          {/* Greeting + bell */}
          <Animated.View style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 18,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Image
                source={require("../../../assets/images/farmer-profile.jpg")}
                style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" }}
              />
              <View>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" }}>
                  Good Morning
                </Text>
                <Text style={{ color: "#fff", fontSize: 19, fontWeight: "800", lineHeight: 24 }}>
                  Mario Santos
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/farmer/notifications/notif" as any)}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.14)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="bell-outline" size={20} color="#fff" />
              {unread > 0 && (
                <View style={{
                  position: "absolute", top: -2, right: -2,
                  backgroundColor: "#facc15", borderRadius: 8, minWidth: 17, height: 17,
                  alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
                  borderWidth: 2, borderColor: "#166534",
                }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#1a3a1a" }}>
                    {unread > 99 ? "99+" : unread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Sales card — shows skeleton while loading */}
          <Animated.View style={{ transform: [{ scale: cardScale }] }}>
            {loading || !sales ? <SalesCardSkeleton /> : <SalesCard data={sales} />}
          </Animated.View>
        </View>

        {/* ── WHITE BODY ───────────────────────────────────────────────────── */}
        <View style={{
          backgroundColor: "#f3f4f6", borderTopLeftRadius: 32, borderTopRightRadius: 32,
          paddingHorizontal: 16, paddingTop: 16, minHeight: SCREEN_H, marginTop: -18,
        }}>

          {/* Quick Actions */}
          <SectionLabel title="Quick Actions" />
          <QuickActions badges={badgeCounts} />

          {/* ── Top Selling ──
              The entire card is one TouchableOpacity → tap goes to Products page.
              "View All" in the header also navigates there.
          */}
          <SectionLabel
            title="Top Selling This Month"
            actionLabel="View All"
            onAction={() => router.push("/farmer/products/top-selling" as any)}
          />
          <TouchableOpacity
            style={CARD_STYLE}
            onPress={() => router.push("/farmer/products/top-selling" as any)}
            activeOpacity={0.96}
          >
            {loading ? (
              <View style={{ padding: 16, gap: 10 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} h={44} radius={10} />)}
              </View>
            ) : topProducts.length === 0 ? (
              // Empty state
              <View style={{ paddingVertical: 36, alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 32 }}>🌱</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#9ca3af" }}>
                  No top selling products yet
                </Text>
              </View>
            ) : (
              topProducts.map((prod: TopProduct, i: number, arr: TopProduct[]) => (
                <View key={prod.id} style={{
                  flexDirection: "row", alignItems: "center", gap: 11,
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: "#f3f4f6",
                }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: prod.rank === 1 ? "#166534" : "#f0fdf4",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: prod.rank === 1 ? "#fff" : "#15803d" }}>
                      {prod.rank}
                    </Text>
                  </View>
                  <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {prod.image
                      ? <Image source={{ uri: prod.image }} style={{ width: 38, height: 38 }} resizeMode="cover" />
                      : <Text style={{ fontSize: 20 }}>{prod.emoji ?? "🌿"}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{prod.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 }}>
                      <View style={{ flex: 1, height: 5, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                        <View style={{ height: "100%", width: `${prod.pct}%`, backgroundColor: "#166534", borderRadius: 3 }} />
                      </View>
                      <Text style={{ fontSize: 10, color: "#9ca3af" }}>{prod.sold} sold</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                    ₱{prod.revenue.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </TouchableOpacity>

          {/* ── Recent Orders ──
              Entire card is one TouchableOpacity → tap goes to Orders page.
              Redundant "See all N orders" footer button removed.
          */}
          <SectionLabel
            title="Recent Orders"
            actionLabel="See All"
            onAction={() => router.push("/farmer/(tabs)/order" as any)}
          />
          <TouchableOpacity
            style={CARD_STYLE}
            onPress={() => router.push("/farmer/(tabs)/order" as any)}
            activeOpacity={0.96}
          >
            {loading ? (
              <View style={{ padding: 16, gap: 10 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} h={52} radius={10} />)}
              </View>
            ) : recentOrders.length === 0 ? (
              // Empty state
              <View style={{ paddingVertical: 36, alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 32 }}>📦</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#9ca3af" }}>
                  No recent orders
                </Text>
              </View>
            ) : (
              recentOrders.map((order: RecentOrder, i: number, arr: RecentOrder[]) => {
                const sc    = STATUS_COLOR[order.status] ?? STATUS_COLOR.New;
                const isNew = order.status === "New";
                return (
                  <View
                    key={order.id}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 11,
                      paddingHorizontal: 14, paddingVertical: 12,
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                      borderBottomColor: "#f3f4f6",
                      backgroundColor: isNew ? "#fafffe" : "#fff",
                    }}
                  >
                    <View style={{
                      width: 38, height: 38, borderRadius: 19,
                      backgroundColor: order.avatarColor + "18",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: "800", color: order.avatarColor }}>
                        {order.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                          {order.customerName}
                        </Text>
                        {isNew && (
                          <View style={{ backgroundColor: "#166534", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1.5 }}>
                            <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }} numberOfLines={1}>
                        {order.item}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{order.price}</Text>
                      <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text }}>{order.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </TouchableOpacity>

          {/* ── Low Stock Alerts ──
              Section always visible.
              Shows warning list OR an "all clear" empty state.
          */}
          <SectionLabel title="Low Stock Alerts" />
          <View style={CARD_STYLE}>
            {loading ? (
              <View style={{ padding: 16, gap: 10 }}>
                {[1, 2].map(i => <Skeleton key={i} h={44} radius={10} />)}
              </View>
            ) : lowStockProducts.length === 0 ? (
              // Empty state — no low stock
              <View style={{ paddingVertical: 28, alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 28 }}>✅</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d" }}>
                  All stock levels are healthy
                </Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                  No low stock alerts at the moment
                </Text>
              </View>
            ) : (
              <>
                {/* Warning header */}
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 8,
                  paddingHorizontal: 14, paddingVertical: 11,
                  backgroundColor: "#fffbeb",
                  borderBottomWidth: 1, borderBottomColor: "#fde68a",
                }}>
                  <MaterialCommunityIcons name="alert-outline" size={14} color="#b45309" />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#92400e" }}>
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} need restocking
                  </Text>
                </View>

                {lowStockProducts.map((item: StockProduct, i: number, arr: StockProduct[]) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setRestockTarget(item)}
                    activeOpacity={0.72}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 10,
                      paddingHorizontal: 14, paddingVertical: 12,
                      // Extra bottom padding on last item so it is never clipped
                      paddingBottom: i === arr.length - 1 ? 16 : 12,
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                      borderBottomColor: "#f3f4f6",
                    }}
                  >
                    <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
                      {item.image
                        ? <Image source={{ uri: item.image }} style={{ width: 34, height: 34 }} resizeMode="cover" />
                        : <Text style={{ fontSize: 17 }}>{item.emoji ?? "🌿"}</Text>}
                    </View>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#f59e0b" }} />
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: "#374151" }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#d97706", marginRight: 8 }}>
                      {item.stock} {item.unit} left
                    </Text>
                    <View style={{ backgroundColor: "#fffbeb", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#fde68a" }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#b45309" }}>Restock</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          {/* Bottom padding so the last card is never clipped by the tab bar */}
          <View style={{ height: 80 }} />
        </View>
      </Animated.ScrollView>

      <RestockModal
        visible={!!restockTarget}
        product={restockTarget}
        onClose={() => setRestockTarget(null)}
        onConfirm={handleRestockConfirm}
      />
    </View>
  );
};

export default Homepage;

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * GENERAL ENHANCEMENTS
 *  • Pull-to-refresh: RefreshControl added to Animated.ScrollView.
 *    Calls refresh() from useHomeData and resets refreshing state on completion.
 *
 * SALES CARD
 *  • SalesCardSkeleton (from SalesCard.tsx) replaces the ad-hoc Skeleton
 *    blocks — shows a realistic pulsing skeleton while data loads.
 *
 * RECENT ORDERS
 *  • Entire card wrapped in TouchableOpacity → navigates to Orders tab.
 *  • Redundant "See all N orders" footer button removed.
 *  • Empty state: shows 📦 + "No recent orders" when list is empty.
 *
 * TOP SELLING PRODUCTS
 *  • Entire card wrapped in TouchableOpacity → navigates to Products page.
 *  • Empty state: shows 🌱 + "No top selling products yet" when list is empty.
 *
 * LOW STOCK ALERTS
 *  • Section is now ALWAYS rendered (not conditionally hidden).
 *  • When list is empty: shows ✅ "All stock levels are healthy" message.
 *  • Last list item gets extra paddingBottom: 16 to prevent clipping.
 *
 * SCROLL / SPACING
 *  • Bottom spacer increased from h:28 to h:40 so last card clears the tab bar.
 */