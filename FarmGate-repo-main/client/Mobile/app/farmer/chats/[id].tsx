import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

interface ChatMessage {
  id: string;
  text: string;
  sender: "buyer" | "farmer";
  time: string;
  isRead?: boolean;
}

const CHAT_DATA: Record<string, Omit<ChatMessage, "id">[]> = {
  "1": [
    { text: "Can I get 2 kg of tomatoes tomorrow?",      sender: "buyer",  time: "10:00 AM" },
    { text: "Sure! I'll set aside 2kg for you.",          sender: "farmer", time: "10:01 AM", isRead: true },
    { text: "Thank you! See you tomorrow.",               sender: "buyer",  time: "10:02 AM" },
  ],
  "2": [
    { text: "Please reserve 5 heads of lettuce for me.", sender: "buyer",  time: "9:30 AM" },
    { text: "Reserved! Pick up anytime tomorrow.",        sender: "farmer", time: "9:32 AM", isRead: true },
  ],
  "3": [
    { text: "Thank you for the quick delivery last time!", sender: "buyer",  time: "8:00 AM" },
    { text: "Always happy to help!",                       sender: "farmer", time: "8:01 AM", isRead: true },
  ],
  "4": [
    { text: "Is the eggplant still available this week?", sender: "buyer",  time: "7:00 AM" },
    { text: "Yes, plenty available!",                      sender: "farmer", time: "7:05 AM", isRead: true },
  ],
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_COLORS = ["#bbf7d0","#bfdbfe","#fde68a","#fbcfe8","#e9d5ff"];
const AVATAR_TEXT   = ["#15803d","#1d4ed8","#b45309","#be185d","#6d28d9"];
const getAvatarBg   = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];
const getAvatarTxt  = (n: string) => AVATAR_TEXT[n.charCodeAt(0) % AVATAR_TEXT.length];

// ── Date Chip ─────────────────────────────────────────────────────────────
const DateChip = ({ label }: { label: string }) => (
  <View style={{ alignItems: "center", marginVertical: 10 }}>
    <View style={{ backgroundColor: "#e5e7eb", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: "#6b7280" }}>{label}</Text>
    </View>
  </View>
);

// ── Message Bubble ────────────────────────────────────────────────────────
const Bubble = ({ item, buyerName }: { item: ChatMessage; buyerName: string }) => {
  const isFarmer = item.sender === "farmer";
  return (
    <View style={{
      flexDirection: isFarmer ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 8,
      marginBottom: 10,
    }}>
      {!isFarmer && (
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: getAvatarBg(buyerName),
          alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: getAvatarTxt(buyerName) }}>
            {getInitials(buyerName)}
          </Text>
        </View>
      )}

      <View style={{
        backgroundColor: isFarmer ? "#166534" : "#fff",
        borderRadius: 18,
        borderBottomRightRadius: isFarmer ? 4 : 18,
        borderBottomLeftRadius: isFarmer ? 18 : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "68%",
      }}>
        <Text style={{ fontSize: 13, color: isFarmer ? "#fff" : "#111827", lineHeight: 19 }}>
          {item.text}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: isFarmer ? "rgba(255,255,255,0.55)" : "#9ca3af" }}>
            {item.time}
          </Text>
          {isFarmer && (
            <Ionicons
              name="checkmark-done"
              size={13}
              color={item.isRead ? "#86efac" : "rgba(255,255,255,0.5)"}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
const Chats = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [inputText, setInputText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const buyerId   = (params.id   as string) ?? "1";
  const buyerName = (params.name as string) ?? "Buyer";

  const messages: ChatMessage[] = (CHAT_DATA[buyerId] ?? []).map((m, i) => ({
    ...m,
    id: String(i),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Green Header ── */}
      <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>

          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: getAvatarBg(buyerName),
            alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: getAvatarTxt(buyerName) }}>
              {getInitials(buyerName)}
            </Text>
          </View>

          {/* Name */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              {buyerName}
            </Text>
          </View>

          {/* Call */}
          <TouchableOpacity
            style={{ padding: 4 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="call-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chat Body ── */}
      <View style={{ flex: 1, backgroundColor: "#f3f4f6", borderTopLeftRadius: 35, borderTopRightRadius: 35 }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          ListHeaderComponent={<DateChip label="Today" />}
          renderItem={({ item }) => <Bubble item={item} buyerName={buyerName} />}
        />

        {/* ── Input Bar ── */}
        <View style={{ backgroundColor: "#fff", borderTopWidth: 0.5, borderTopColor: "#e5e7eb" }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowOptions(!showOptions)}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: "#f3f4f6",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name={showOptions ? "close" : "add"} size={20} color="#6b7280" />
            </TouchableOpacity>

            <View style={{ flex: 1, backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                style={{ fontSize: 13, color: "#111827" }}
              />
            </View>

            <TouchableOpacity style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "#166534",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="send" size={15} color="white" />
            </TouchableOpacity>
          </View>

          {showOptions && (
            <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 14, gap: 20 }}>
              <TouchableOpacity style={{ alignItems: "center", gap: 5 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="images-outline" size={20} color="#6b7280" />
                </View>
                <Text style={{ fontSize: 11, color: "#6b7280" }}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignItems: "center", gap: 5 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="camera-outline" size={20} color="#6b7280" />
                </View>
                <Text style={{ fontSize: 11, color: "#6b7280" }}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Chats;