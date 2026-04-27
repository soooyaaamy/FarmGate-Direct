import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

interface Message {
  id: string;
  name: string;
  message: string;
  time: string;
  unreadCount?: number;
  isRead?: boolean;
}

const MESSAGES: Message[] = [
  { id: "1", name: "Buyer Anna",   message: "Can I get 2 kg of tomatoes tomorrow?",       time: "10m ago", unreadCount: 2 },
  { id: "2", name: "Buyer Carlos", message: "Please reserve 5 heads of lettuce for me.",   time: "30m ago", unreadCount: 1 },
  { id: "3", name: "Buyer Lina",   message: "Thank you for the quick delivery last time!", time: "2h ago",  isRead: true },
  { id: "4", name: "Buyer Marco",  message: "Is the eggplant still available this week?",  time: "5h ago",  isRead: true },
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = ["#bbf7d0","#bfdbfe","#fde68a","#fbcfe8","#e9d5ff"];
const AVATAR_TEXT   = ["#15803d","#1d4ed8","#b45309","#be185d","#6d28d9"];
const getAvatarBg   = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];
const getAvatarTxt  = (n: string) => AVATAR_TEXT[n.charCodeAt(0) % AVATAR_TEXT.length];

// ── Chat Row ──────────────────────────────────────────────────────────────
const ChatRow = ({ item, onPress }: { item: Message; onPress: () => void }) => {
  const isUnread = !!item.unreadCount;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 12,
        marginBottom: 8,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Avatar */}
      <View style={{
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: getAvatarBg(item.name),
        alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Text style={{ fontWeight: "700", fontSize: 15, color: getAvatarTxt(item.name) }}>
          {getInitials(item.name)}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <Text style={{ fontWeight: isUnread ? "700" : "600", fontSize: 14, color: isUnread ? "#111827" : "#374151" }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{item.time}</Text>
        </View>
        <Text numberOfLines={1} style={{
          fontSize: 13,
          color: isUnread ? "#374151" : "#9ca3af",
          fontWeight: isUnread ? "500" : "400",
        }}>
          {item.message}
        </Text>
      </View>

      {/* Right indicator */}
      {isUnread ? (
        <View style={{
          backgroundColor: "#16a34a", borderRadius: 10,
          width: 20, height: 20, alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{item.unreadCount}</Text>
        </View>
      ) : (
        <Ionicons name="checkmark-done" size={16} color={item.isRead ? "#3b82f6" : "#9ca3af"} />
      )}
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
const Messages = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = MESSAGES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Green Header ── */}
      <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>Messages</Text>
      </View>

      {/* Search bar */}
      <View style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 3,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}>
        <Ionicons name="search" size={15} color="#9ca3af" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
          placeholderTextColor="#9ca3af"
          style={{ flex: 1, fontSize: 14, color: "#111827" }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── White Body ── */}
      <View style={{ flex: 1, backgroundColor: "#f3f4f6", borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingTop: 16 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/farmer/chats/[id]",
                  params: {
                    id: item.id,
                    name: item.name,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <MaterialCommunityIcons name="message-off-outline" size={32} color="#15803d" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 6 }}>No conversations</Text>
              <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
                {search ? `No results for "${search}"` : "Messages from buyers will appear here."}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Messages;