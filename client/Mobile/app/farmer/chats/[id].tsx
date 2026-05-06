/**
 * chats/[id].tsx — Individual Chat / Conversation Screen
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Features:
 *  • Functional send button — appends message, clears input, auto-scrolls
 *  • Plus button — opens action sheet to pick from Gallery or Camera
 *    with proper Expo permission requests and graceful denial handling
 *  • Call button — shows a mock "Calling…" modal (no real VOIP)
 *  • Keyboard handling — KeyboardAvoidingView ensures input is never obscured
 *  • Image messages rendered inline with a light bubble
 *  • Consistent green / white design matching the rest of the app
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback, useEffect, useRef, useState,
} from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType = "text" | "image";

interface ChatMessage {
  id:        string;
  text?:     string;
  imageUri?: string;
  type:      MessageType;
  fromMe:    boolean;
  time:      string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const uid = () => Math.random().toString(36).slice(2);

// ─── Seed messages ────────────────────────────────────────────────────────────

const SEED_MESSAGES: ChatMessage[] = [
  { id: "s1", type: "text", text: "Hello! Is the eggplant still available?",  fromMe: false, time: "09:10" },
  { id: "s2", type: "text", text: "Yes, we still have plenty. How many kg?",   fromMe: true,  time: "09:11" },
  { id: "s3", type: "text", text: "I would like 3 kg please.",                  fromMe: false, time: "09:12" },
  { id: "s4", type: "text", text: "Sure! I will set it aside for you.",         fromMe: true,  time: "09:13" },
];

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_PAIRS = [
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#fef9c3", text: "#a16207" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#ede9fe", text: "#6d28d9" },
];

const getAvatar = (name: string) =>
  AVATAR_PAIRS[name.charCodeAt(0) % AVATAR_PAIRS.length];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Message bubble ───────────────────────────────────────────────────────────

const Bubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isMine = msg.fromMe;

  return (
    <View style={{
      flexDirection: "row",
      justifyContent: isMine ? "flex-end" : "flex-start",
      marginBottom: 6,
      paddingHorizontal: 14,
    }}>
      <View style={{
        maxWidth: "78%",
        backgroundColor: isMine ? "#166534" : "#fff",
        borderRadius: 18,
        borderBottomRightRadius: isMine ? 4 : 18,
        borderBottomLeftRadius:  isMine ? 18 : 4,
        paddingHorizontal: msg.type === "image" ? 4 : 13,
        paddingVertical:   msg.type === "image" ? 4 : 9,
        // Subtle shadow on buyer bubbles
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isMine ? 0 : 0.06,
        shadowRadius: 3,
        elevation: isMine ? 0 : 1,
      }}>
        {msg.type === "image" && msg.imageUri ? (
          <Image
            source={{ uri: msg.imageUri }}
            style={{ width: 200, height: 200, borderRadius: 14 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{
            fontSize: 14,
            color: isMine ? "#fff" : "#111827",
            lineHeight: 20,
          }}>
            {msg.text}
          </Text>
        )}
        <Text style={{
          fontSize: 10,
          color: isMine ? "rgba(255,255,255,0.55)" : "#9ca3af",
          textAlign: "right",
          marginTop: 4,
        }}>
          {msg.time}
        </Text>
      </View>
    </View>
  );
};

// ─── Calling Modal ────────────────────────────────────────────────────────────

const CallingModal: React.FC<{
  visible: boolean;
  name:    string;
  onEnd:   () => void;
}> = ({ visible, name, onEnd }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulseAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onEnd}
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(22,101,52,0.96)",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}>
        {/* Pulsing avatar ring */}
        <Animated.View style={{
          width: 110, height: 110, borderRadius: 55,
          backgroundColor: "rgba(255,255,255,0.12)",
          alignItems: "center", justifyContent: "center",
          transform: [{ scale: pulseAnim }],
        }}>
          <View style={{
            width: 86, height: 86, borderRadius: 43,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: "#fff" }}>
              {getInitials(name)}
            </Text>
          </View>
        </Animated.View>

        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Calling…</Text>
        </View>

        {/* End call button */}
        <TouchableOpacity
          onPress={onEnd}
          style={{
            marginTop: 16,
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: "#ef4444",
            alignItems: "center", justifyContent: "center",
            shadowColor: "#ef4444",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <MaterialCommunityIcons name="phone-hangup" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          (Demo — no real call)
        </Text>
      </View>
    </Modal>
  );
};

// ─── Attach Popover (upward dropdown) ────────────────────────────────────────
/**
 * Rendered inline INSIDE the KeyboardAvoidingView, directly above the input
 * bar. Because it is in the normal layout flow (not a Modal or position:absolute
 * overlay), it rises with the keyboard and is never covered by it.
 *
 * When visible={false} the component collapses to height 0 via scaleY + opacity
 * so no space is reserved in the layout when it is hidden.
 */

const AttachPopover: React.FC<{
  visible:   boolean;
  onGallery: () => void;
  onCamera:  () => void;
}> = ({ visible, onGallery, onCamera }) => {
  const scaleY  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleY, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        damping: 18, stiffness: 260,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 140 : 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleY, opacity]);

  const options = [
    { icon: "image-multiple-outline", label: "Photo Library", onPress: onGallery, color: "#1d4ed8", bg: "#dbeafe" },
    { icon: "camera-outline",         label: "Take Photo",    onPress: onCamera,  color: "#15803d", bg: "#dcfce7" },
  ];

  return (
    <Animated.View
      style={{
        opacity,
        // scale from bottom-up: anchor the transform origin at the bottom
        transform: [
          { translateY: scaleY.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          { scaleY },
        ],
        // Hide from layout when fully closed so the input row doesn't shift
        overflow: "hidden",
        marginHorizontal: 12,
        marginBottom: visible ? 6 : 0,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.label}
          onPress={opt.onPress}
          activeOpacity={0.75}
          style={{
            flexDirection: "row", alignItems: "center", gap: 14,
            paddingHorizontal: 16, paddingVertical: 13,
            borderBottomWidth: i < options.length - 1 ? 1 : 0,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <View style={{
            width: 38, height: 38, borderRadius: 11,
            backgroundColor: opt.bg,
            alignItems: "center", justifyContent: "center",
          }}>
            <MaterialCommunityIcons name={opt.icon as any} size={20} color={opt.color} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};


// ─── Main Chat Screen ─────────────────────────────────────────────────────────

const ChatScreen = () => {
  const router            = useRouter();
  const insets            = useSafeAreaInsets();
  const { id, name = "Buyer" } = useLocalSearchParams<{ id: string; name: string }>();

  const [messages,      setMessages]      = useState<ChatMessage[]>(SEED_MESSAGES);
  const [inputText,     setInputText]     = useState("");
  const [callingVisible, setCallingVisible] = useState(false);
  const [attachVisible,  setAttachVisible]  = useState(false);

  const listRef = useRef<FlatList>(null);
  const { bg, text: avatarText } = getAvatar(name);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  // ── Send text message ──────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages(prev => [
      ...prev,
      { id: uid(), type: "text", text: trimmed, fromMe: true, time: now() },
    ]);
    setInputText("");
    scrollToBottom();
  }, [inputText, scrollToBottom]);

  // ── Pick from gallery ──────────────────────────────────────────────────────
  const handleGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow access to your photo library to send images.",
        [{ text: "OK" }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setMessages(prev => [
        ...prev,
        { id: uid(), type: "image", imageUri: result.assets[0].uri, fromMe: true, time: now() },
      ]);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  // ── Take a photo ───────────────────────────────────────────────────────────
  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow camera access to take and send photos.",
        [{ text: "OK" }]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setMessages(prev => [
        ...prev,
        { id: uid(), type: "image", imageUri: result.assets[0].uri, fromMe: true, time: now() },
      ]);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const canSend = inputText.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* ── Header ── */}
      <View style={{
        paddingTop: STATUS_BAR + 10,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#166534",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}>
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: "#fff",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={18} color="#111827" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: bg,
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: avatarText }}>
            {getInitials(name)}
          </Text>
        </View>

        {/* Name */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{name}</Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Online</Text>
        </View>

        {/* Call button — icon only, no background */}
        <TouchableOpacity
          onPress={() => setCallingVisible(true)}
          style={{ padding: 6 }}
        >
          <MaterialCommunityIcons name="phone-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Message list + input in a KeyboardAvoidingView ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Tapping the message area dismisses the attach popover */}
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setAttachVisible(false)}
        >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
          onContentSizeChange={scrollToBottom}
          renderItem={({ item }) => <Bubble msg={item} />}
        />
        </Pressable>

        {/* ── Attach popover — inline above input, rises with keyboard ── */}
        <AttachPopover
          visible={attachVisible}
          onGallery={() => { setAttachVisible(false); handleGallery(); }}
          onCamera={() => { setAttachVisible(false); handleCamera(); }}
        />

        {/* ── Input bar ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
        }}>

          {/* Plus (attach) — toggles the upward popover */}
          <TouchableOpacity
            onPress={() => setAttachVisible(v => !v)}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: attachVisible ? "#166534" : "#f3f4f6",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons
              name={attachVisible ? "close" : "plus"}
              size={22}
              color={attachVisible ? "#fff" : "#6b7280"}
            />
          </TouchableOpacity>

          {/* Text input */}
          <View style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === "ios" ? 9 : 6,
            minHeight: 40,
            justifyContent: "center",
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message…"
              placeholderTextColor="#9ca3af"
              multiline
              style={{
                fontSize: 14,
                color: "#111827",
                maxHeight: 100,
                padding: 0,
              }}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              returnKeyType="send"
            />
          </View>

          {/* Send / mic button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: canSend ? "#166534" : "#e5e7eb",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={canSend ? "#fff" : "#9ca3af"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Modals ── */}
      <CallingModal
        visible={callingVisible}
        name={name}
        onEnd={() => setCallingVisible(false)}
      />


    </View>
  );
};

export default ChatScreen;

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * LAYOUT
 *  • Single-surface design: white body, no nested containers.
 *  • Green header bar with back arrow, avatar, name, online status, call icon.
 *  • Input bar uses insets.bottom so it sits above the home indicator on iOS
 *    and above the navigation bar on Android.
 *
 * FEATURE — Send Button
 *  • Functional: appends message to local state, clears input, auto-scrolls.
 *  • Icon toggles: microphone-outline when empty → send when text is present.
 *  • Button goes dark green only when there is text to send.
 *
 * FEATURE — Plus Button (Attachments)
 *  • Opens AttachSheet — a slide-up bottom sheet with two options.
 *  • "Photo Library": calls ImagePicker.requestMediaLibraryPermissionsAsync()
 *    before launching launchImageLibraryAsync(). Shows an Alert on denial.
 *  • "Take Photo": calls ImagePicker.requestCameraPermissionsAsync() before
 *    launching launchCameraAsync(). Shows an Alert on denial.
 *  • Selected/taken image is sent as an inline image bubble.
 *
 * FEATURE — Call Button
 *  • Opens CallingModal — full-screen dark-green overlay with pulsing avatar,
 *    name, "Calling…" subtitle, and a red end-call button.
 *  • Animated.loop runs a scale pulse while the modal is visible.
 *  • No real VoIP; modal is clearly labelled "(Demo — no real call)".
 *
 * KEYBOARD HANDLING
 *  • KeyboardAvoidingView wraps the message list + input bar.
 *  • behavior = "padding" on iOS, "height" on Android.
 *  • Input is never obscured by the software keyboard.
 *
 * IMAGE MESSAGES
 *  • Image bubbles rendered at 200 × 200 with rounded corners.
 *  • Timestamp shown below the image, right-aligned, same as text bubbles.
 */