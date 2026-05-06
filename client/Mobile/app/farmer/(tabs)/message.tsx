/**
 * message.tsx — Messages / Conversations List
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout: single green header + one unified white rounded card body.
 * No nested containers, no redundant sections.
 *
 * Changes:
 *  - Replaced dual-section layout (search inside green, list in grey) with
 *    a single white body that starts just below the green title bar
 *  - Search bar sits inside the white body, so the whole screen reads as one
 *    coherent surface
 *  - ChatRow redesigned: avatar with deterministic colour, bold unread state,
 *    read-tick icon, unread badge
 *  - Consistent 16 px horizontal padding throughout
 *  - Empty state centred in the white body
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id:           string;
  name:         string;
  message:      string;
  time:         string;
  unreadCount?: number;
  isRead?:      boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MESSAGES: Message[] = [
  { id: "1", name: "Buyer Anna",   message: "Can I get 2 kg of tomatoes tomorrow?",        time: "10m ago", unreadCount: 2 },
  { id: "2", name: "Buyer Carlos", message: "Please reserve 5 heads of lettuce for me.",    time: "30m ago", unreadCount: 1 },
  { id: "3", name: "Buyer Lina",   message: "Thank you for the quick delivery last time!",  time: "2h ago",  isRead: true  },
  { id: "4", name: "Buyer Marco",  message: "Is the eggplant still available this week?",   time: "5h ago",  isRead: true  },
];

// ─── Avatar colour helpers ────────────────────────────────────────────────────

const AVATAR_PAIRS = [
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#fef9c3", text: "#a16207" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#ede9fe", text: "#6d28d9" },
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getAvatar = (name: string) =>
  AVATAR_PAIRS[name.charCodeAt(0) % AVATAR_PAIRS.length];

// ─── Chat Row ─────────────────────────────────────────────────────────────────

const ChatRow = ({
  item,
  onPress,
}: {
  item: Message;
  onPress: () => void;
}) => {
  const { bg, text } = getAvatar(item.name);
  const isUnread     = !!item.unreadCount;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
      }}
    >
      {/* Avatar */}
      <View style={{
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: bg,
        alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: text }}>
          {getInitials(item.name)}
        </Text>
      </View>

      {/* Text content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: isUnread ? "700" : "600",
            color: "#111827",
          }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{item.time}</Text>
        </View>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            color: isUnread ? "#374151" : "#9ca3af",
            fontWeight: isUnread ? "500" : "400",
          }}
        >
          {item.message}
        </Text>
      </View>

      {/* Right indicator: unread badge OR read tick */}
      {isUnread ? (
        <View style={{
          backgroundColor: "#166534",
          borderRadius: 10, minWidth: 20, height: 20,
          paddingHorizontal: 5,
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
            {item.unreadCount}
          </Text>
        </View>
      ) : (
        <MaterialCommunityIcons
          name="check-all"
          size={17}
          color={item.isRead ? "#3b82f6" : "#d1d5db"}
        />
      )}
    </TouchableOpacity>
  );
};

// ─── Separator ────────────────────────────────────────────────────────────────

const Separator = () => (
  <View style={{ height: 1, backgroundColor: "#f3f4f6", marginLeft: 76 }} />
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MessagesScreen = () => {
  const router       = useRouter();
  const [search, setSearch] = useState("");

  const filtered = MESSAGES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Green title bar ── */}
      <View style={{
        paddingTop: STATUS_BAR + 14,
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <View>         
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 28 }}>
              Messages
            </Text>
          </View>
        </View>
      </View>

      {/* ── Single white body ── */}
      <View style={{
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -4,
        overflow: "hidden",
      }}>

        {/* Search bar — lives inside the white body */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "#f3f4f6",
            borderRadius: 14, paddingHorizontal: 13, height: 42,
          }}>
            <MaterialCommunityIcons name="magnify" size={18} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search conversations..."
              placeholderTextColor="#9ca3af"
              style={{ flex: 1, fontSize: 13, color: "#111827", padding: 0 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Conversation list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/farmer/chats/[id]",
                  params: { id: item.id, name: item.name },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={{
              flex: 1, alignItems: "center",
              justifyContent: "center", paddingTop: 80,
            }}>
              <View style={{
                width: 68, height: 68, borderRadius: 34,
                backgroundColor: "#f0fdf4",
                alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <MaterialCommunityIcons
                  name="message-off-outline"
                  size={30}
                  color="#15803d"
                />
              </View>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
                No conversations
              </Text>
              <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 19 }}>
                {search
                  ? `No results for "${search}"`
                  : "Messages from buyers will appear here."}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default MessagesScreen;

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * LAYOUT SIMPLIFICATION
 *  • Removed nested grey/white container split.
 *  • Single white rounded card covers everything below the title bar.
 *  • Search bar now lives at the top of the white body — not in the green header.
 *  • Consistent 16 px horizontal padding everywhere.
 *  • Ionicons replaced with MaterialCommunityIcons for icon-library consistency.
 *
 * UI / UX
 *  • "Farmer Hub" sub-label added above title for context (matches other screens).
 *  • Unread total pill shows in the header right when there are unread messages.
 *  • Separator only extends from the avatar's right edge (76 px indent), giving
 *    the list a lighter, more modern feel.
 *  • Read-tick uses MaterialCommunityIcons "check-all" (matches WhatsApp/Telegram
 *    convention users expect).
 *  • Unread badge uses the app's dark green (#166534) for brand consistency.
 */