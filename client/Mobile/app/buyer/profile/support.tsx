import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const FAQS = [
  { q: "How do I track my order?", a: "Go to Orders and select the order you want to track." },
  { q: "How do I contact a farmer?", a: "Open the Messages page and select the farmer conversation." },
  { q: "Can I cancel an order?", a: "Orders can be cancelled before the farmer confirms them. Go to Orders and tap Cancel on a pending order." },
  { q: "What payment methods are accepted?", a: "Cash on delivery and GCash are currently supported." },
];

export default function ProfileSupport() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
          Frequently Asked Questions
        </Text>
        {FAQS.map((faq, i) => (
          <View key={i} style={{ borderBottomWidth: i < FAQS.length - 1 ? 1 : 0, borderBottomColor: "#f0f0f0" }}>
            <TouchableOpacity
              onPress={() => setOpenIndex(openIndex === i ? null : i)}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13 }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 }}>{faq.q}</Text>
              <Ionicons name={openIndex === i ? "chevron-up" : "chevron-down"} size={16} color="#9ca3af" />
            </TouchableOpacity>
            {openIndex === i && (
              <Text style={{ fontSize: 12, color: "#6b7280", lineHeight: 18, paddingBottom: 13 }}>{faq.a}</Text>
            )}
          </View>
        ))}

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 24, marginBottom: 10 }}>
          Contact Support
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="mail-outline" size={18} color="#15803d" />
          </View>
          <View>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>Email</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>support@farmgate.com</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="call-outline" size={18} color="#15803d" />
          </View>
          <View>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>Phone</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>+63 900 000 0000</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}