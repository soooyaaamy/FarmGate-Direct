import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileAbout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>About</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, alignItems: "center" }}>

        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Ionicons name="leaf" size={32} color="#15803d" />
        </View>

        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>FarmGate</Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, marginBottom: 20 }}>Version 1.0.0</Text>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", alignSelf: "flex-start", marginBottom: 6 }}>
          About FarmGate
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 20, alignSelf: "flex-start", marginBottom: 20 }}>
          FarmGate connects consumers directly with local farmers, allowing fresh and affordable agricultural products to reach buyers while supporting local farming communities.
        </Text>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", alignSelf: "flex-start", marginBottom: 6 }}>
          Our Mission
        </Text>
        <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 20, alignSelf: "flex-start" }}>
          Support local farmers and provide fresh produce directly to consumers.
        </Text>

      </ScrollView>
    </View>
  );
}