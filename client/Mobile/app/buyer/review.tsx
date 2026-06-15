import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── ORDER DATA ───────────────────────────────────────────────────────────────
// In a real app, fetch the order by orderId from your API/context.
// Here we use a static mock so the page is functional without a backend.

const ORDER = {
  number: "ORD-12345",
  farmer: "Juan Dela Cruz",
  farm: "Green Valley Farm",
  items: [
    { id: "1", name: "Fresh Farm Tomatoes", image: require("@/assets/images/tomato.jpg") },
    { id: "2", name: "Fresh Eggplant",      image: require("@/assets/images/eggplant.jpg") },
  ],
};

// ─── STAR ROW ─────────────────────────────────────────────────────────────────

const StarRow = ({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) => (
  <View style={{ flexDirection: "row", gap: 6 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
        <Ionicons
          name={i <= value ? "star" : "star-outline"}
          size={size}
          color="#f59e0b"
        />
      </TouchableOpacity>
    ))}
  </View>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Review() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();

  const [productRating,  setProductRating]  = useState(0);
  const [farmerRating,   setFarmerRating]   = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [text,           setText]           = useState("");
  // Stores local URI strings of picked images
  const [photos,         setPhotos]         = useState<string[]>([]);
  const [submitted,      setSubmitted]      = useState(false);

  // ── Image picker ────────────────────────────────────────────────────────────
  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit reached", "You can upload up to 5 photos.");
      return;
    }

    // Ask permission (required on iOS; on Android it auto-prompts)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to add review photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,  // iOS 14+ / Android
      selectionLimit: 5 - photos.length,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const canSubmit = productRating > 0 && farmerRating > 0 && deliveryRating > 0;

  const handleSubmit = () => {
    if (!canSubmit) return; // hard guard — belt-and-suspenders on top of disabled prop
    // In a real app: POST to your API with ratings, text, and photo URIs.
    // e.g. await submitReview({ orderId: params.orderId, productRating, farmerRating, deliveryRating, text, photos });
    setSubmitted(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={{
        flex: 1, backgroundColor: "#fff",
        alignItems: "center", justifyContent: "center",
        gap: 14, paddingHorizontal: 40,
      }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: "#f0fdf4",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="checkmark-circle" size={44} color="#15803d" />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>
          Thank you for your review!
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 19 }}>
          Your feedback helps other buyers and supports {ORDER.farm}.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/buyer/(tabs)/home" as any)}
          activeOpacity={0.85}
          style={{
            marginTop: 8, backgroundColor: "#15803d",
            borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Header */}
      <View style={{
        paddingTop: 60, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Leave a Review</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* Order info */}
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
          {ORDER.number} • {ORDER.farm}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {ORDER.items.map((item) => (
            <View key={item.id} style={{ alignItems: "center", gap: 4 }}>
              <Image
                source={item.image}
                style={{ width: 52, height: 52, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 9, color: "#9ca3af", maxWidth: 60 }} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Product rating ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 24, marginBottom: 8 }}>
          Rate the Products
        </Text>
        <StarRow value={productRating} onChange={setProductRating} />

        {/* ── Farmer rating ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 22, marginBottom: 8 }}>
          Rate the Farmer
        </Text>
        <StarRow value={farmerRating} onChange={setFarmerRating} />

        {/* ── Delivery rating (optional) ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 22, marginBottom: 8 }}>
          Delivery Experience{" "}
        </Text>
        <StarRow value={deliveryRating} onChange={setDeliveryRating} />

        {/* ── Written review ── */}
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 22, marginBottom: 8 }}>
          Write a Review
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          placeholder="Share your experience with this order..."
          placeholderTextColor="#9ca3af"
          style={{
            borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
            padding: 12, fontSize: 13, color: "#111827",
            minHeight: 90, textAlignVertical: "top",
          }}
        />

        {/* ── Photo upload ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
            Add Photos{" "}
            <Text style={{ color: "#9ca3af", fontWeight: "400" }}>(optional, up to 5)</Text>
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>{photos.length}/5</Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {/* Picked photo thumbnails */}
          {photos.map((uri, i) => (
            <View key={i} style={{ position: "relative" }}>
              <Image
                source={{ uri }}
                style={{ width: 72, height: 72, borderRadius: 10 }}
                resizeMode="cover"
              />
              {/* Remove button */}
              <TouchableOpacity
                onPress={() => removePhoto(i)}
                activeOpacity={0.8}
                style={{
                  position: "absolute", top: -6, right: -6,
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: "#dc2626",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={11} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add photo button — hidden when limit reached */}
          {photos.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.7}
              style={{
                width: 72, height: 72, borderRadius: 10,
                borderWidth: 1.5, borderColor: "#d1d5db",
                borderStyle: "dashed",
                alignItems: "center", justifyContent: "center",
                gap: 4,
              }}
            >
              <Ionicons name="camera-outline" size={22} color="#9ca3af" />
              <Text style={{ fontSize: 9, color: "#9ca3af" }}>Add photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={{
            marginTop: 32, borderRadius: 12, paddingVertical: 14,
            alignItems: "center",
            backgroundColor: canSubmit ? "#15803d" : "#d1fae5",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Submit Review
          </Text>
        </TouchableOpacity>

        {!canSubmit && (
          <Text style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
            Please rate the products, farmer, and delivery experience to submit your review.
          </Text>
        )}

      </ScrollView>
    </View>
  );
}