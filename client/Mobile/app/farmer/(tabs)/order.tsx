/**
 * orders.tsx — Orders Tab
 * Search bar + status filter + "New" badges + tap → Order Details
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Animated, useWindowDimensions,
} from "react-native";
import { useHomeData } from "../../hooks/UseHomeData";
import type { RecentOrder, OrderStatus } from "../../hooks/UseHomeData";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

type FilterKey = "All" | OrderStatus;

const FILTERS: FilterKey[] = ["All", "New", "Packing", "Ready", "Delivered", "Cancelled"];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  New:       { bg: "#f0fdf4", text: "#15803d" },
  Packing:   { bg: "#eff6ff", text: "#1d4ed8" },
  Ready:     { bg: "#f5f3ff", text: "#7c3aed" },
  Delivered: { bg: "#f3f4f6", text: "#6b7280" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626" },
};

// ─── Order row ────────────────────────────────────────────────────────────────

const OrderRow = React.memo(({
  order, onPress, isLast,
}: { order: RecentOrder; onPress: () => void; isLast: boolean }) => {
  const sc    = STATUS_STYLE[order.status] ?? STATUS_STYLE.New;
  const isNew = order.status === "New";

  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.72}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, paddingVertical: 13,
        backgroundColor: isNew ? "#fafffe" : "#fff",
        borderBottomWidth: isLast ? 0 : 1, borderBottomColor: "#f3f4f6",
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 20,
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
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }} numberOfLines={1}>
          {order.item}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{order.price}</Text>
        <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginTop: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text }}>{order.status}</Text>
        </View>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={16} color="#e5e7eb" />
    </TouchableOpacity>
  );
});

OrderRow.displayName = "OrderRow";

// ─── Main ─────────────────────────────────────────────────────────────────────

const OrdersScreen = () => {
  const router = useRouter();
  const { recentOrders, loading } = useHomeData();
  useWindowDimensions();

  const [query,        setQuery]        = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchFocused, setSearchFocused] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerScale = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.97], extrapolate: "clamp" });

  // Count per status for filter badges
  const counts = useMemo(() => {
    const c: Partial<Record<FilterKey, number>> = { All: recentOrders.length };
    recentOrders.forEach((o: RecentOrder) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [recentOrders]);

  const filtered = useMemo(() => {
    let list = activeFilter === "All" ? recentOrders : recentOrders.filter((o: RecentOrder) => o.status === activeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((o: RecentOrder) =>
        o.customerName.toLowerCase().includes(q) ||
        o.item.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [recentOrders, activeFilter, query]);

  const renderItem = useCallback(({ item, index }: { item: RecentOrder; index: number }) => (
    <OrderRow
      order={item}
      onPress={() => router.push(`/farmer/orders/${item.id}` as any)}
      isLast={index === filtered.length - 1}
    />
  ), [filtered.length, router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* Green header */}
      <Animated.View style={{
        paddingTop: STATUS_BAR + 12,
        paddingHorizontal: 18, paddingBottom: 20,
        backgroundColor: "#166534",
        transform: [{ scale: headerScale }],
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" }}>Farmer Hub</Text>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>Orders</Text>
          </View>
          {counts.New ? (
            <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                {counts.New} new
              </Text>
            </View>
          ) : null}
        </View>

        {/* Search bar */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: searchFocused ? "#fff" : "rgba(255,255,255,0.92)",
          borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9,
        }}>
          <MaterialCommunityIcons name="magnify" size={18} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, item, order ID…"
            placeholderTextColor="#9ca3af"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ flex: 1, fontSize: 13, color: "#111827", padding: 0 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* White body */}
      <View style={{ flex: 1, backgroundColor: "#f3f4f6", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -14 }}>

        {/* Status filter tabs */}
        <Animated.ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 8 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollY } } }], { useNativeDriver: true })}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f;
            const count  = counts[f] ?? 0;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={{
                  height: 32,
                  paddingHorizontal: 12,
                  borderRadius: 16, alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 5,
                  backgroundColor: active ? "#166534" : "#fff",
                  borderWidth: 1, borderColor: active ? "#166534" : "#e5e7eb",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: active ? "#fff" : "#6b7280" }}>
                  {f}
                </Text>
                {count > 0 && (
                  <View style={{
                    backgroundColor: active ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1.5,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: active ? "#fff" : "#6b7280" }}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>

        {/* Results header */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600" }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            {query ? ` matching "${query}"` : ""}
          </Text>
        </View>

        {/* Order list */}
        {loading ? (
          <View style={{ padding: 20 }}>
            {[1,2,3,4].map(i => (
              <View key={i} style={{ height: 64, backgroundColor: "#e5e7eb", borderRadius: 12, marginBottom: 8 }} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100 }}>
            <Text style={{ fontSize: 36 }}>📦</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151", marginTop: 10 }}>No orders found</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Try a different filter or search term</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{
              backgroundColor: "#fff", borderRadius: 18,
              marginHorizontal: 14, overflow: "hidden", marginBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default OrdersScreen;