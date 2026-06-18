import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type Order = {
  id: string;
  number: string;
  date: string;
  status: "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered";
  total: number;
  thumbnail: any;
  itemCount: number;
};

const ORDERS: Order[] = [
  { id: "1", number: "ORD-12347", date: "Jun 13, 2026", status: "Out for Delivery", total: 320, thumbnail: require("@/assets/images/tomato.jpg"), itemCount: 3 },
  { id: "2", number: "ORD-12346", date: "Jun 12, 2026", status: "Preparing",        total: 150, thumbnail: require("@/assets/images/egg.jpg"),    itemCount: 1 },
  { id: "3", number: "ORD-12345", date: "Jun 10, 2026", status: "Delivered",        total: 320, thumbnail: require("@/assets/images/tomato.jpg"), itemCount: 2 },
  { id: "4", number: "ORD-12340", date: "Jun 5, 2026",  status: "Delivered",        total: 80,  thumbnail: require("@/assets/images/banana.jpg"),  itemCount: 1 },
];

const STATUS_COLOR: Record<Order["status"], { bg: string; text: string }> = {
  Confirmed:         { bg: "#eff6ff", text: "#2563eb" },
  Preparing:         { bg: "#fffbeb", text: "#d97706" },
  "Out for Delivery": { bg: "#eef2ff", text: "#4f46e5" },
  Delivered:         { bg: "#f0fdf4", text: "#15803d" },
};

const TABS = ["Active", "Completed"] as const;

export default function ProfileOrders() {
  const router = useRouter();
  const [tab, setTab] = useState<typeof TABS[number]>("Active");

  const filtered = ORDERS.filter((o) =>
    tab === "Active" ? o.status !== "Delivered" : o.status === "Delivered"
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>My Orders</Text>
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 20, marginTop: 16, gap: 24, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ paddingBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: tab === t ? "700" : "500", color: tab === t ? "#15803d" : "#9ca3af" }}>
              {t}
            </Text>
            {tab === t && <View style={{ height: 2, backgroundColor: "#15803d", marginTop: 6, borderRadius: 1 }} />}
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
          <Text style={{ fontSize: 13, color: "#9ca3af" }}>No {tab.toLowerCase()} orders.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const sc = STATUS_COLOR[item.status];
            return (
              <TouchableOpacity
                onPress={() => router.push("/buyer/orders/[id]" as any)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: index < filtered.length - 1 ? 1 : 0,
                  borderBottomColor: "#f0f0f0",
                }}
              >
                <Image source={item.thumbnail} style={{ width: 52, height: 52, borderRadius: 8 }} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{item.number}</Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.date} • {item.itemCount} items</Text>
                  <View style={{ alignSelf: "flex-start", backgroundColor: sc.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: sc.text }}>{item.status}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#15803d" }}>₱{item.total}</Text>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </TouchableOpacity>
            );
          }}
        />
      )}

    </View>
  );
}