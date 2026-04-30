/**
 * notifications/notif.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes applied:
 *  1. Removed "Mark all as read" button
 *  2. Removed unread dot indicators from rows
 *  3. Filter tabs: fixed explicit width so buttons never resize on press
 *  4. Text sizes proportionally reduced (filter labels 11px, row title 13px)
 *  5. Order notifications navigate directly to Order Details
 *  6. Non-order notifications open a matching bottom-sheet detail modal
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, {
  useState, useRef, useCallback, useMemo, useEffect,
} from "react";
import {
  Animated, FlatList, Modal, Platform, Text,
  TouchableOpacity, View, ScrollView,
} from "react-native";

type NotifType = "order" | "stock" | "system" | "promo";
type FilterTab = "all" | "order" | "stock" | "system";

interface Notification {
  id: string; type: NotifType; title: string; body: string;
  time: string; orderId?: string;
}

const MOCK: Notification[] = [
  { id: "n1", type: "order",  orderId: "ord-001", title: "New Order Received",   body: "Maria Santos placed an order for Organic Tomatoes · 5 kg.", time: "2 min ago"   },
  { id: "n2", type: "order",  orderId: "ord-002", title: "Order Packed",          body: "Juan Dela Cruz's order for Eggplant · 3 kg is ready.",    time: "18 min ago"  },
  { id: "n3", type: "stock",                       title: "Low Stock: Bitter Melon", body: "Only 2 kg remaining. Restock soon.",                    time: "1 hr ago"    },
  { id: "n4", type: "order",  orderId: "ord-003", title: "Order Delivered",       body: "Rosa Lim's order for Sweet Corn · 10 pcs delivered.",     time: "3 hrs ago"   },
  { id: "n5", type: "system",                      title: "Profile Verified ✅",  body: "Your farm profile is now visible in buyer search.",        time: "Yesterday"   },
  { id: "n6", type: "stock",                       title: "Low Stock: Kangkong",  body: "Only 1 bundle remaining.",                                time: "Yesterday"   },
  { id: "n7", type: "promo",                       title: "Harvest Festival Promo", body: "List your products before April 30 to get featured.",   time: "2 days ago"  },
  { id: "n8", type: "order",  orderId: "ord-004", title: "New Order Received",   body: "Carlo Reyes placed an order for Mango · 10 pcs.",         time: "3 days ago"  },
];

const TYPE_CFG: Record<NotifType, { icon: string; iconColor: string; bg: string }> = {
  order:  { icon: "clipboard-list-outline", iconColor: "#15803d", bg: "#f0fdf4" },
  stock:  { icon: "alert-outline",          iconColor: "#d97706", bg: "#fffbeb" },
  system: { icon: "shield-check-outline",   iconColor: "#2563eb", bg: "#eff6ff" },
  promo:  { icon: "tag-outline",            iconColor: "#7c3aed", bg: "#f5f3ff" },
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",    label: "All"     },
  { key: "order",  label: "Orders"  },
  { key: "stock",  label: "Stock"   },
  { key: "system", label: "System"  },
];

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Detail bottom sheet ──────────────────────────────────────────────────────

const DetailSheet: React.FC<{
  notif: Notification | null; onClose: () => void;
}> = ({ notif, onClose }) => {
  const slideY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (notif) {
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
    } else {
      Animated.timing(slideY, { toValue: 500, duration: 200, useNativeDriver: true }).start();
    }
  }, [notif, slideY]);

  if (!notif) return null;
  const cfg = TYPE_CFG[notif.type];

  return (
    <Modal visible={!!notif} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.46)", justifyContent: "flex-end" }}
        activeOpacity={1} onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <Animated.View style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 36 : 22,
            transform: [{ translateY: slideY }],
          }}>
            <View style={{ alignItems: "center", marginBottom: 14 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" }} />
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center" }}>
                    <MaterialCommunityIcons name={cfg.icon as any} size={21} color={cfg.iconColor} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#9ca3af", letterSpacing: 1.2, textTransform: "uppercase" }}>
                      {notif.type}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827", maxWidth: 220 }}>
                      {notif.title}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                  <MaterialCommunityIcons name="close" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={{ backgroundColor: "#f9fafb", borderRadius: 14, padding: 14, marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: "#374151", lineHeight: 22 }}>{notif.body}</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, fontWeight: "600" }}>{notif.time}</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{ height: 52, borderRadius: 15, backgroundColor: "#166534", alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>Got it</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────

const NotifRow = React.memo(({ notif, onPress }: { notif: Notification; onPress: (n: Notification) => void }) => {
  const cfg = TYPE_CFG[notif.type];
  return (
    <TouchableOpacity
      onPress={() => onPress(notif)} activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 13 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 3 }}>
          {notif.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#6b7280", lineHeight: 18 }} numberOfLines={2}>
          {notif.body}
        </Text>
        <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 5, fontWeight: "600" }}>
          {notif.time}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color="#e5e7eb" style={{ marginTop: 2 }} />
    </TouchableOpacity>
  );
});

NotifRow.displayName = "NotifRow";

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NotificationsScreen = () => {
  const router = useRouter();
  const [activeTab,   setActiveTab]   = useState<FilterTab>("all");
  const [detailSheet, setDetailSheet] = useState<Notification | null>(null);

  const filtered = useMemo(
    () => activeTab === "all"
      ? MOCK
      : MOCK.filter(n =>
          activeTab === "system"
            ? n.type === "system" || n.type === "promo"
            : n.type === activeTab
        ),
    [activeTab],
  );

  const handlePress = useCallback((notif: Notification) => {
    if (notif.type === "order" && notif.orderId) {
      router.push(`/farmer/orders/${notif.orderId}` as any);
    } else {
      setDetailSheet(notif);
    }
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: Notification; index: number }) => (
      <View>
        <NotifRow notif={item} onPress={handlePress} />
        {index < filtered.length - 1 && (
          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginHorizontal: 16 }} />
        )}
      </View>
    ),
    [handlePress, filtered.length],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* Green header */}
      <View style={{ paddingTop: STATUS_BAR + 10, paddingHorizontal: 18, paddingBottom: 22, backgroundColor: "#166634" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" }}>Farmer Hub</Text>
            <Text style={{ color: "#fff", fontSize: 19, fontWeight: "800" }}>Notifications</Text>
          </View>
        </View>
      </View>

      {/* White body */}
      <View style={{ flex: 1, backgroundColor: "#f3f4f6", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -16 }}>

        {/* ── Filter tabs ──
            Each tab has a FIXED width (minWidth + explicit paddingHorizontal)
            so pressing one never causes layout shift in neighbouring tabs.
        */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 8 }}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                // Fixed dimensions prevent the tab from "jumping" when pressed
                style={{
                  width: 76,              // explicit fixed width
                  height: 32,             // explicit fixed height
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? "#166534" : "#fff",
                  borderWidth: 1,
                  borderColor: active ? "#166534" : "#e5e7eb",
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  fontSize: 11,           // reduced from previous over-large size
                  fontWeight: "700",
                  color: active ? "#fff" : "#6b7280",
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🔔</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>No notifications</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>You&apos;re all caught up!</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{
              backgroundColor: "#fff", borderRadius: 18,
              marginHorizontal: 14, marginBottom: 24, overflow: "hidden",
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <DetailSheet notif={detailSheet} onClose={() => setDetailSheet(null)} />
    </View>
  );
};

export default NotificationsScreen;