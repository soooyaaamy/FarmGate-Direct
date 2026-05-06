/**
 * order.tsx — Orders List Screen
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * UI/UX IMPROVEMENTS
 * ──────────────────
 * [UI-1]  Removed "Farmer Hub" subtitle above "Orders" title
 * [UI-2]  Removed the "X new" badge from the top-right corner
 * [UI-3]  Removed the results count label ("X orders matching…")
 * [UI-4]  Removed right arrow icon (chevron-right) from each order row
 * [UI-5]  Removed the filter section entirely (was already removed; confirmed clean)
 *
 * LAYOUT SIMPLIFICATIONS
 * ───────────────────────
 * [LAY-1] Single flat white background body — no nested containers
 * [LAY-2] FlatList renders directly inside the white body, no extra wrappers
 * [LAY-3] Order row is clean and content-focused: avatar, name/item, price+status
 * [LAY-4] No gap between green header and white body (marginTop: -2)
 *
 * FEATURE ENHANCEMENTS
 * ─────────────────────
 * [ENH-1] Skeleton loading with pulsing animation while orders load
 * [ENH-2] Pull-to-refresh on the FlatList
 * [ENH-3] Search bar filters by name or item
 * [ENH-4] "Order Complete" handling: completed orders are moved to history
 *         (state-level; Profile page integration is a future step)
 */

import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "New"
  | "Packing"
  | "Ready"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id:    string;
  name:  string;
  emoji: string;
  image: string | null;
  qty:   number;
  unit:  string;
  price: number;
}

export interface Order {
  id:                  string;
  customerName:        string;
  initials:            string;
  avatarColor:         string;
  phone:               string;
  address:             string;
  item:                string; // short summary for list row
  price:               string; // formatted total
  subtotal:            number;
  shippingFee:         number;
  items:               OrderItem[];
  status:              OrderStatus;
  specialInstructions: string;
  orderDate:           string;
  timeline: {
    status: OrderStatus;
    time:   string;
    done:   boolean;
  }[];
}

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_STYLE: Record<
  OrderStatus,
  { bg: string; text: string; border: string }
> = {
  New:       { bg: "#f0fdf4", text: "#15803d", border: "#166534" },
  Packing:   { bg: "#eff6ff", text: "#1d4ed8", border: "#1d4ed8" },
  Ready:     { bg: "#f5f3ff", text: "#7c3aed", border: "#7c3aed" },
  Delivered: { bg: "#f3f4f6", text: "#6b7280", border: "#6b7280" },
  Cancelled: { bg: "#fef2f2", text: "#dc2626", border: "#dc2626" },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    customerName: "Anna Reyes",
    initials: "AR",
    avatarColor: "#15803d",
    phone: "09171234567",
    address: "123 Rizal St., Hagonoy, Bulacan",
    item: "Fresh Tomatoes · 2 kg",
    price: "₱290",
    subtotal: 240,
    shippingFee: 50,
    items: [
      { id: "a", name: "Fresh Tomatoes", emoji: "🍅", image: null, qty: 2, unit: "kg", price: 120 },
    ],
    status: "New",
    specialInstructions: "Please deliver before noon.",
    orderDate: "Jan 22, 2024",
    timeline: [
      { status: "New",       time: "10:00 AM, Jan 22", done: true  },
      { status: "Packing",   time: "—",                done: false },
      { status: "Ready",     time: "—",                done: false },
      { status: "Delivered", time: "—",                done: false },
    ],
  },
  {
    id: "2",
    customerName: "Carlos Mendoza",
    initials: "CM",
    avatarColor: "#1d4ed8",
    phone: "09181234567",
    address: "Farm gate pickup",
    item: "Lettuce × 5 heads, Kangkong × 2 bundles",
    price: "₱285",
    subtotal: 285,
    shippingFee: 0,
    items: [
      { id: "b", name: "Lettuce",  emoji: "🥬", image: null, qty: 5, unit: "head",   price: 45 },
      { id: "c", name: "Kangkong", emoji: "🌿", image: null, qty: 2, unit: "bundle", price: 30 },
    ],
    status: "Packing",
    specialInstructions: "",
    orderDate: "Jan 22, 2024",
    timeline: [
      { status: "New",       time: "9:30 AM, Jan 22",  done: true  },
      { status: "Packing",   time: "9:45 AM, Jan 22",  done: true  },
      { status: "Ready",     time: "—",                done: false },
      { status: "Delivered", time: "—",                done: false },
    ],
  },
  {
    id: "3",
    customerName: "Lina Garcia",
    initials: "LG",
    avatarColor: "#7c3aed",
    phone: "09191234567",
    address: "45 Mabini Ave., Hagonoy, Bulacan",
    item: "Eggplant · 3 kg",
    price: "₱290",
    subtotal: 240,
    shippingFee: 50,
    items: [
      { id: "d", name: "Eggplant", emoji: "🍆", image: null, qty: 3, unit: "kg", price: 80 },
    ],
    status: "Ready",
    specialInstructions: "",
    orderDate: "Jan 21, 2024",
    timeline: [
      { status: "New",       time: "8:00 AM, Jan 21",  done: true },
      { status: "Packing",   time: "8:15 AM, Jan 21",  done: true },
      { status: "Ready",     time: "9:00 AM, Jan 21",  done: true },
      { status: "Delivered", time: "—",                done: false },
    ],
  },
  {
    id: "4",
    customerName: "Marco Dela Cruz",
    initials: "MD",
    avatarColor: "#b45309",
    phone: "09201234567",
    address: "78 Quezon Blvd., Hagonoy, Bulacan",
    item: "Sweet Corn · 10 pcs",
    price: "₱400",
    subtotal: 350,
    shippingFee: 50,
    items: [
      { id: "e", name: "Sweet Corn", emoji: "🌽", image: null, qty: 10, unit: "pc", price: 35 },
    ],
    status: "Delivered",
    specialInstructions: "",
    orderDate: "Jan 20, 2024",
    timeline: [
      { status: "New",       time: "7:00 AM, Jan 20",  done: true },
      { status: "Packing",   time: "7:20 AM, Jan 20",  done: true },
      { status: "Ready",     time: "8:00 AM, Jan 20",  done: true },
      { status: "Delivered", time: "10:30 AM, Jan 20", done: true },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// [ENH-1] Pulsing skeleton card
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, []); // eslint-disable-line

  return (
    <Animated.View style={[s.skeletonCard, { opacity: pulse }]}>
      <View style={s.skeletonAvatar} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[s.skeletonLine, { width: "55%" }]} />
        <View style={[s.skeletonLine, { width: "80%", height: 10 }]} />
      </View>
      <View style={s.skeletonBadge} />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// [LAY-3][UI-4] Order row — clean, no right arrow
// ─────────────────────────────────────────────────────────────────────────────
interface OrderRowProps {
  order:  Order;
  onPress: () => void;
  isLast: boolean;
}

const OrderRow: React.FC<OrderRowProps> = React.memo(({ order, onPress, isLast }) => {
  const sc    = STATUS_STYLE[order.status] ?? STATUS_STYLE.New;
  const isNew = order.status === "New";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[
        s.row,
        isNew && { backgroundColor: "#fafffe" },
        !isLast && s.rowBorder,
      ]}
    >
      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: order.avatarColor + "1A" }]}>
        <Text style={[s.avatarText, { color: order.avatarColor }]}>
          {order.initials}
        </Text>
      </View>

      {/* Name + item */}
      <View style={{ flex: 1 }}>
        <View style={s.nameRow}>
          <Text style={s.customerName} numberOfLines={1}>
            {order.customerName}
          </Text>
          {/* [UI-2] "NEW" badge kept on the row only — no header indicator */}
          {isNew && <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>}
        </View>
        <Text style={s.itemSummary} numberOfLines={1}>{order.item}</Text>
      </View>

      {/* Price + status — [UI-4] no chevron */}
      <View style={s.rowRight}>
        <Text style={s.rowPrice}>{order.price}</Text>
        <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[s.statusBadgeText, { color: sc.text }]}>{order.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
OrderRow.displayName = "OrderRow";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORDERS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
interface OrdersScreenProps {
  /** Orders moved to history are lifted out here so Profile can access them */
  onOrderCompleted?: (order: Order) => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ onOrderCompleted }) => {
  const router = useRouter();

  const [orders, setOrders]       = useState<Order[]>(MOCK_ORDERS);
  const [query, setQuery]         = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // [ENH-4] Order history state (Profile will read from here later)
  const [, setOrderHistory] = useState<Order[]>([]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  }, []);

  // [ENH-4] Mark as complete: remove from list, push to history
  const handleOrderComplete = useCallback((orderId: string) => {
    setOrders((prev) => {
      const completed = prev.find((o) => o.id === orderId);
      if (completed) {
        setOrderHistory((h) => [...h, completed]);
        onOrderCompleted?.(completed);
      }
      return prev.filter((o) => o.id !== orderId);
    });
  }, [onOrderCompleted]);

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.item.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  }, [orders, query]);

  const renderItem = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <OrderRow
        order={item}
        onPress={() =>
          router.push({
            pathname: "/farmer/orders/[id]",
            params: {
              id: item.id,
              orderData: JSON.stringify(item),
            },
          } as any)
        }
        isLast={index === filtered.length - 1}
      />
    ),
    [filtered.length, router]
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── [UI-1][UI-2] Green header — only "Orders" title ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Orders</Text>

        {/* Search bar */}
        <View style={[s.searchBox, searchFocused && s.searchBoxFocused]}>
          <Ionicons name="search-outline" size={17} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search orders…"
            placeholderTextColor="#9ca3af"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={s.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── [LAY-1][LAY-2] Single flat white body ── */}
      <View style={s.body}>
        {loading ? (
          // [ENH-1] Skeleton placeholders
          <View style={s.skeletonWrapper}>
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📦</Text>
            <Text style={s.emptyTitle}>No orders found</Text>
            <Text style={s.emptyBody}>
              {query ? `No results for "${query}"` : "Orders from buyers will appear here."}
            </Text>
          </View>
        ) : (
          // [LAY-2] FlatList directly in body — no extra container
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#166534"
                colors={["#166534"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#166534",
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    paddingTop: STATUS_BAR + 16,
    paddingHorizontal: 18,
    paddingBottom: 20,
    backgroundColor: "#166534",
  },
  // [UI-1] Plain "Orders" — no subtitle, no badge
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    paddingHorizontal: 13,
    height: 44,
  },
  searchBoxFocused: {
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    padding: 0,
  },

  // ── [LAY-1] Flat white body — no nested containers ─────────────────────────
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // [LAY-4] No gap between header and body
    marginTop: -2,
    overflow: "hidden",
  },

  // ── [LAY-3][UI-4] Order row — minimal, no chevron ──────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  customerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  newBadge: {
    backgroundColor: "#166534",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
  },
  itemSummary: {
    fontSize: 11,
    color: "#9ca3af",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 5,
    flexShrink: 0,
  },
  rowPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // ── [ENH-1] Skeleton ───────────────────────────────────────────────────────
  skeletonWrapper: {
    padding: 16,
    gap: 10,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    flexShrink: 0,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  skeletonBadge: {
    width: 56,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  emptyBody:  { fontSize: 12, color: "#9ca3af", textAlign: "center" },
});

export { MOCK_ORDERS };
export default OrdersScreen;