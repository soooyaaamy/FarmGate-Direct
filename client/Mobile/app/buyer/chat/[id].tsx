import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

type Message = { id: string; text?: string; image?: string; sender: "me" | "farmer"; time: string };

const INITIAL_MESSAGES: Message[] = [
  { id: "1", text: "Hi! Is the order ready for pickup?", sender: "me", time: "9:00 AM" },
  { id: "2", text: "Hello! Yes, your order is being prepared now.", sender: "farmer", time: "9:02 AM" },
  { id: "3", text: "It will be ready in about 30 minutes.", sender: "farmer", time: "9:02 AM" },
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const farmerName = params.name ?? "Farmer";

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [calling, setCalling] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: input.trim(), sender: "me", time: "Now" }]);
    setInput("");
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to send images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), image: result.assets[0].uri, sender: "me", time: "Now" }]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), image: result.assets[0].uri, sender: "me", time: "Now" }]);
    }
  };

  if (calling) {
    return (
      <View style={{ flex: 1, backgroundColor: "#15803d", alignItems: "center", justifyContent: "space-between", paddingVertical: 80 }}>
        <View />
        <View style={{ alignItems: "center", gap: 14 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{farmerName}</Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Calling...</Text>
        </View>
        <TouchableOpacity
          onPress={() => setCalling(false)}
          activeOpacity={0.85}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#dc2626", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: "135deg" }] }} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="person" size={18} color="#15803d" />
        </View>
        <Text style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{farmerName}</Text>
        <TouchableOpacity onPress={() => setCalling(true)}>
          <Ionicons name="call-outline" size={22} color="#15803d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.sender === "me" ? "flex-end" : "flex-start",
            maxWidth: "78%",
          }}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={{ width: 160, height: 160, borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <View style={{
                backgroundColor: item.sender === "me" ? "#15803d" : "#f3f4f6",
                borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
              }}>
                <Text style={{ fontSize: 13, color: item.sender === "me" ? "#fff" : "#111827", lineHeight: 18 }}>
                  {item.text}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 3, textAlign: item.sender === "me" ? "right" : "left" }}>
              {item.time}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
        <TouchableOpacity onPress={pickFromGallery}>
          <Ionicons name="image-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto}>
          <Ionicons name="camera-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          style={{ flex: 1, backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, color: "#111827" }}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          activeOpacity={0.85}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#15803d", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="send" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}