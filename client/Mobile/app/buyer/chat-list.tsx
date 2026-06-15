import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const CONVERSATIONS = [
  { id: "f1", name: "Juan Dela Cruz",  farm: "Green Valley Farm",    lastMessage: "Your order is being prepared now.", time: "2m ago",  unread: true,  avatar: require("@/assets/images/farmer-profile.jpg") },
  { id: "f2", name: "Maria Reyes",     farm: "Golden Poultry Farm",  lastMessage: "Thank you for your order!",          time: "1h ago",  unread: false, avatar: require("@/assets/images/farmer-profile.jpg") },
  { id: "f4", name: "Pedro Santos",    farm: "Golden Orchard Farm",  lastMessage: "Yes, the mangoes are very sweet 🍋", time: "Yesterday", unread: false, avatar: require("@/assets/images/farmer-profile.jpg") },
];

export default function ChatList() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>Messages</Text>
      </View>

      {CONVERSATIONS.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 40 }}>
          <Ionicons name="chatbubble-ellipses-outline" size={52} color="#d1d5db" />
          <Text style={{ fontSize: 14, color: "#9ca3af" }}>No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/buyer/chat/[id]" as any, params: { id: item.id, name: item.name } })}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                paddingVertical: 12,
                borderBottomWidth: index < CONVERSATIONS.length - 1 ? 1 : 0,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Image source={item.avatar} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ fontSize: 10, color: "#9ca3af" }}>{item.time}</Text>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }} numberOfLines={1}>{item.farm}</Text>
                <Text
                  style={{ fontSize: 12, marginTop: 3, color: item.unread ? "#111827" : "#9ca3af", fontWeight: item.unread ? "600" : "400" }}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>

              {item.unread && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#15803d" }} />
              )}
            </TouchableOpacity>
          )}
        />
      )}

    </View>
  );
}