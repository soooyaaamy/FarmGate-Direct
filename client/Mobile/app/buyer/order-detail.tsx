import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const ORDER = {
  number: "ORD-12345",
  date: "June 10, 2026",
  status: "Delivered" as "Order Placed" | "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered",
  farmer: "Juan Dela Cruz",
  farm: "Green Valley Farm",
  address: "123 Mabini St., Hagonoy, Bulacan",
  contact: "+63 912 345 6789",
  items: [
    { id: "1", name: "Fresh Farm Tomatoes", qty: 2, price: 120, image: require("@/assets/images/tomato.jpg") },
    { id: "2", name: "Fresh Eggplant",      qty: 1, price: 80,  image: require("@/assets/images/eggplant.jpg") },
  ],
};

const TIMELINE = ["Order Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderDetails() {
  const router = useRouter();
  const currentStep = TIMELINE.indexOf(ORDER.status);
  const total = ORDER.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Order Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{ORDER.number}</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>{ORDER.date}</Text>
        </View>
        <View style={{
          alignSelf: "flex-start", marginTop: 6,
          backgroundColor: "#f0fdf4", borderRadius: 6,
          paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>{ORDER.status}</Text>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 10 }}>
          Order Timeline
        </Text>
        {TIMELINE.map((step, i) => (
          <View key={step} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ alignItems: "center" }}>
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: i <= currentStep ? "#15803d" : "#f3f4f6",
                alignItems: "center", justifyContent: "center",
              }}>
                {i <= currentStep && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              {i < TIMELINE.length - 1 && (
                <View style={{ width: 2, height: 24, backgroundColor: i < currentStep ? "#15803d" : "#f3f4f6" }} />
              )}
            </View>
            <Text style={{
              fontSize: 13, marginTop: 3,
              color: i <= currentStep ? "#111827" : "#9ca3af",
              fontWeight: i <= currentStep ? "700" : "400",
            }}>
              {step}
            </Text>
          </View>
        ))}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0f0f0" }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person" size={20} color="#15803d" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{ORDER.farmer}</Text>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{ORDER.farm}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 10 }}>
          Products Ordered
        </Text>
        {ORDER.items.map((item, i) => (
          <View key={item.id} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: i < ORDER.items.length - 1 ? 1 : 0, borderBottomColor: "#f0f0f0" }}>
            <Image source={item.image} style={{ width: 52, height: 52, borderRadius: 8 }} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Qty: {item.qty}</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#15803d" }}>₱{item.price * item.qty}</Text>
          </View>
        ))}

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>Total</Text>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#15803d" }}>₱{total}</Text>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 8 }}>
          Delivery Information
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          <Ionicons name="location-outline" size={16} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: "#374151", flex: 1, lineHeight: 17 }}>{ORDER.address}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="call-outline" size={16} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: "#374151" }}>{ORDER.contact}</Text>
        </View>

        {ORDER.status === "Delivered" && (
          <TouchableOpacity
            onPress={() => router.push("/buyer/review" as any)}
            activeOpacity={0.85}
            style={{ marginTop: 24, backgroundColor: "#15803d", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>Leave Review</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}