import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getOrderById, Order, submitReview } from "@/lib/store";

// ─── STAR ROW ─────────────────────────────────────────────────────────────────

const StarRow = ({
  value,
  onChange,
  size = 26,
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

// ─── Per-product review state ──────────────────────────────────────────────

type DraftReview = {
  productRating: number;
  farmerRating: number;
  deliveryRating: number;
  text: string;
  photos: string[];
};

const emptyDraft = (): DraftReview => ({
  productRating: 0, farmerRating: 0, deliveryRating: 0, text: "", photos: [],
});

// ─── ProductReviewCard ──────────────────────────────────────────────────────

const ProductReviewCard = ({
  item,
  draft,
  onChange,
}: {
  item: Order["items"][number];
  draft: DraftReview;
  onChange: (next: DraftReview) => void;
}) => {
  const pickImage = async () => {
    if (draft.photos.length >= 5) {
      Alert.alert("Limit reached", "You can upload up to 5 photos.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library to add review photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - draft.photos.length,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      onChange({ ...draft, photos: [...draft.photos, ...uris].slice(0, 5) });
    }
  };

  const removePhoto = (index: number) => {
    onChange({ ...draft, photos: draft.photos.filter((_, i) => i !== index) });
  };

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 14,
      padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: "#f0f0f0",
    }}>
      {/* Product header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Image
          source={typeof item.image === "string" ? { uri: item.image } : item.image}
          style={{ width: 48, height: 48, borderRadius: 8 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
            {item.productName}
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }} numberOfLines={1}>
            {item.farmName}
          </Text>
        </View>
      </View>

      {/* Product rating */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
        Rate the Product
      </Text>
      <StarRow value={draft.productRating} onChange={(v) => onChange({ ...draft, productRating: v })} />

      {/* Farmer rating */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginTop: 14, marginBottom: 6 }}>
        Rate the Farmer
      </Text>
      <StarRow value={draft.farmerRating} onChange={(v) => onChange({ ...draft, farmerRating: v })} />

      {/* Delivery rating */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginTop: 14, marginBottom: 6 }}>
        Delivery Experience
      </Text>
      <StarRow value={draft.deliveryRating} onChange={(v) => onChange({ ...draft, deliveryRating: v })} />

      {/* Written review */}
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginTop: 14, marginBottom: 6 }}>
        Write a Review
      </Text>
      <TextInput
        value={draft.text}
        onChangeText={(t) => onChange({ ...draft, text: t })}
        multiline
        numberOfLines={3}
        placeholder="Share your experience with this product..."
        placeholderTextColor="#9ca3af"
        style={{
          borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
          padding: 10, fontSize: 12, color: "#111827",
          minHeight: 70, textAlignVertical: "top",
        }}
      />

      {/* Photo upload */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>
          Add Photos <Text style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</Text>
        </Text>
        <Text style={{ fontSize: 10, color: "#9ca3af" }}>{draft.photos.length}/5</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {draft.photos.map((uri, i) => (
          <View key={i} style={{ position: "relative" }}>
            <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 8 }} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => removePhoto(i)}
              activeOpacity={0.8}
              style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: "#dc2626",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {draft.photos.length < 5 && (
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.7}
            style={{
              width: 60, height: 60, borderRadius: 8,
              borderWidth: 1.5, borderColor: "#d1d5db", borderStyle: "dashed",
              alignItems: "center", justifyContent: "center", gap: 2,
            }}
          >
            <Ionicons name="camera-outline" size={18} color="#9ca3af" />
            <Text style={{ fontSize: 8, color: "#9ca3af" }}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Review() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, DraftReview>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!params.orderId) { setLoading(false); return; }
      const found = await getOrderById(params.orderId);
      if (found) {
        setOrder(found);
        const initialDrafts: Record<string, DraftReview> = {};
        found.items.filter((i) => !i.reviewed).forEach((i) => {
          initialDrafts[i.productId] = emptyDraft();
        });
        setDrafts(initialDrafts);
      }
      setLoading(false);
    })();
  }, [params.orderId]);

  const pendingItems = order?.items.filter((i) => !i.reviewed) ?? [];

  const canSubmit = pendingItems.length > 0 && pendingItems.every((i) => {
    const d = drafts[i.productId];
    return d && d.productRating > 0 && d.farmerRating > 0 && d.deliveryRating > 0;
  });

  const handleSubmit = async () => {
    if (!canSubmit || !order) return;

    try {
      await Promise.all(
        pendingItems.map((item) => {
          const d = drafts[item.productId];
          return submitReview({
            productId: item.productId,
            orderId: order.id,
            productRating: d.productRating,
            farmerRating: d.farmerRating,
            deliveryRating: d.deliveryRating,
            text: d.text,
            photos: d.photos,
          });
        })
      );
      setSubmitted(true);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not submit your review. Please try again.");
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 13 }}>Loading order…</Text>
      </View>
    );
  }

  // ── No order found ──
  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
          We couldn&apos;t find that order.
        </Text>
      </View>
    );
  }

  // ── Success screen ──
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
          Thank you for your reviews!
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", lineHeight: 19 }}>
          Your feedback helps other buyers and supports the farmers you ordered from.
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
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>

      {/* Header */}
      <View style={{
        paddingTop: 60, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingBottom: 12, backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>Leave a Review</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>
          {order.id} • Rate each item from your order
        </Text>

        {pendingItems.map((item) => (
          <ProductReviewCard
            key={item.productId}
            item={item}
            draft={drafts[item.productId] ?? emptyDraft()}
            onChange={(next) => setDrafts((prev) => ({ ...prev, [item.productId]: next }))}
          />
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
          style={{
            marginTop: 8, borderRadius: 12, paddingVertical: 14,
            alignItems: "center",
            backgroundColor: canSubmit ? "#15803d" : "#d1fae5",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Submit {pendingItems.length > 1 ? "Reviews" : "Review"}
          </Text>
        </TouchableOpacity>

        {!canSubmit && (
          <Text style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
            Please rate every product, farmer, and delivery experience above to submit.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}