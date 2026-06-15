import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View, Dimensions } from "react-native";

const { width: SW } = Dimensions.get("window");

const MAX_QTY_PER_ORDER = 10;

type ProductDetailData = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  farm: string;
  farmer: string;
  farmerId: string;
  category: string;
  description: string;
  harvestDate: string;
  fresh: boolean;
  rating: number;
  reviewCount: number;
  images: any[];
};

type ReviewItem = {
  name: string;
  rating: number;
  text: string;
  photos?: string[]; // local URIs or remote URLs
};

const PRODUCT_DETAILS: Record<string, ProductDetailData> = {
  "1": {
    id: "1", name: "Fresh Farm Tomatoes", price: 120, unit: "kg", stock: 45,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Hand-picked vine-ripened tomatoes, harvested this morning. Perfect for salads, sauces, and everyday cooking.",
    harvestDate: "Harvested today", fresh: true, rating: 4.8, reviewCount: 32,
    images: [require("@/assets/images/tomato.jpg"), require("@/assets/images/tomato.jpg")],
  },
  "2": {
    id: "2", name: "Fresh Eggplant", price: 80, unit: "kg", stock: 32,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Glossy, firm eggplants grown without synthetic pesticides. Great for grilling, frying, or classic eggplant stews.",
    harvestDate: "Harvested 5 days ago", fresh: false, rating: 4.6, reviewCount: 18,
    images: [require("@/assets/images/eggplant.jpg"), require("@/assets/images/eggplant.jpg")],
  },
  "3": {
    id: "3", name: "Fresh Farm Eggs", price: 10, unit: "pc", stock: 250,
    farm: "Golden Poultry Farm", farmer: "Maria Reyes", farmerId: "f2", category: "Eggs & Poultry",
    description: "Free-range chicken eggs collected daily. Rich yolks and great for baking, frying, or boiling.",
    harvestDate: "Collected today", fresh: true, rating: 4.9, reviewCount: 88,
    images: [require("@/assets/images/egg.jpg"), require("@/assets/images/egg.jpg")],
  },
  "4": {
    id: "4", name: "Premium White Rice", price: 200, unit: "kg", stock: 20,
    farm: "Bulacan Organic Farm", farmer: "Ramon Bautista", farmerId: "f3", category: "Rice",
    description: "Premium-grade milled white rice, sourced from this season's harvest. Soft texture with a clean, neutral taste.",
    harvestDate: "Milled 10 days ago", fresh: false, rating: 4.5, reviewCount: 21,
    images: [require("@/assets/images/rice.jpg"), require("@/assets/images/rice.jpg")],
  },
  "5": {
    id: "5", name: "Organic Brown Rice", price: 60, unit: "kg", stock: 50,
    farm: "Bulacan Organic Farm", farmer: "Ramon Bautista", farmerId: "f3", category: "Rice",
    description: "Unpolished organic brown rice, higher in fiber and nutrients than white rice. Nutty flavor, slightly chewy texture.",
    harvestDate: "Milled 6 days ago", fresh: false, rating: 4.3, reviewCount: 15,
    images: [require("@/assets/images/rice.jpg"), require("@/assets/images/rice.jpg")],
  },
  "6": {
    id: "6", name: "Native Egg", price: 15, unit: "pc", stock: 6,
    farm: "Golden Poultry Farm", farmer: "Maria Reyes", farmerId: "f2", category: "Eggs & Poultry",
    description: "Native free-roaming chicken eggs, smaller in size with deep orange yolks and a richer flavor than commercial eggs.",
    harvestDate: "Collected today", fresh: true, rating: 4.7, reviewCount: 9,
    images: [require("@/assets/images/egg.jpg"), require("@/assets/images/egg.jpg")],
  },
  "7": {
    id: "7", name: "Fresh Pumpkin", price: 60, unit: "kg", stock: 50,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Sweet, dense-fleshed pumpkins ideal for soups, curries, and baking. Stores well for weeks if kept whole.",
    harvestDate: "Harvested today", fresh: true, rating: 4.4, reviewCount: 11,
    images: [require("@/assets/images/pumpkin.jpg"), require("@/assets/images/pumpkin.jpg")],
  },
  "8": {
    id: "8", name: "Fresh Banana", price: 80, unit: "kg", stock: 22,
    farm: "Golden Orchard Farm", farmer: "Pedro Santos", farmerId: "f4", category: "Fruits",
    description: "Sweet, ripe bananas picked at peak ripeness. Great for snacking, smoothies, or baking banana bread.",
    harvestDate: "Harvested today", fresh: true, rating: 4.6, reviewCount: 54,
    images: [require("@/assets/images/banana.jpg"), require("@/assets/images/banana.jpg")],
  },
  "9": {
    id: "9", name: "Fresh Orange", price: 60, unit: "kg", stock: 50,
    farm: "Golden Orchard Farm", farmer: "Pedro Santos", farmerId: "f4", category: "Fruits",
    description: "Juicy, tangy oranges packed with vitamin C. Best enjoyed fresh or squeezed into juice.",
    harvestDate: "Harvested 10 days ago", fresh: false, rating: 4.3, reviewCount: 21,
    images: [require("@/assets/images/orange.jpg"), require("@/assets/images/orange.jpg")],
  },
  "10": {
    id: "10", name: "Native Okra", price: 45, unit: "kg", stock: 4,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Tender young okra pods, perfect for stir-fries, soups like sinigang, or grilling whole.",
    harvestDate: "Harvested 3 days ago", fresh: false, rating: 4.0, reviewCount: 5,
    images: [require("@/assets/images/okra.jpg"), require("@/assets/images/okra.jpg")],
  },
  "11": {
    id: "11", name: "Cherry Tomatoes", price: 85, unit: "kg", stock: 20,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Sweet, bite-sized cherry tomatoes, great for salads, snacking, or roasting whole.",
    harvestDate: "Harvested today", fresh: true, rating: 4.6, reviewCount: 27,
    images: [require("@/assets/images/tomato.jpg"), require("@/assets/images/tomato.jpg")],
  },
  "12": {
    id: "12", name: "Long Eggplant", price: 70, unit: "kg", stock: 30,
    farm: "Green Valley Farm", farmer: "Juan Dela Cruz", farmerId: "f1", category: "Vegetables",
    description: "Long, slender eggplants with thin skin and few seeds. Cooks quickly and works well in stir-fries.",
    harvestDate: "Harvested 6 days ago", fresh: false, rating: 4.1, reviewCount: 13,
    images: [require("@/assets/images/eggplant.jpg"), require("@/assets/images/eggplant.jpg")],
  },
  "13": {
    id: "13", name: "Fresh Mango", price: 60, unit: "kg", stock: 50,
    farm: "Golden Orchard Farm", farmer: "Pedro Santos", farmerId: "f4", category: "Fruits",
    description: "Sweet Carabao mangoes, hand-picked and ripened naturally. A local favorite for its rich, honeyed flavor.",
    harvestDate: "Harvested today", fresh: true, rating: 4.5, reviewCount: 18,
    images: [require("@/assets/images/mango.jpg"), require("@/assets/images/mango.jpg")],
  },
  "14": {
    id: "14", name: "Native Green Grapes", price: 200, unit: "kg", stock: 22,
    farm: "Golden Orchard Farm", farmer: "Pedro Santos", farmerId: "f4", category: "Fruits",
    description: "Crisp, tart-sweet native green grapes grown locally. A refreshing seasonal treat in limited supply.",
    harvestDate: "Harvested 7 days ago", fresh: false, rating: 4.2, reviewCount: 9,
    images: [require("@/assets/images/greengrape.jpg"), require("@/assets/images/greengrape.jpg")],
  },
};

const FALLBACK_PRODUCT = PRODUCT_DETAILS["1"];

const RATING_BREAKDOWN = [
  { star: 5, pct: 80 },
  { star: 4, pct: 15 },
  { star: 3, pct: 5  },
  { star: 2, pct: 0  },
  { star: 1, pct: 0  },
];

// Reviews now include an optional photos array of URI strings
const REVIEWS: ReviewItem[] = [
  {
    name: "Maria Santos",
    rating: 5,
    text: "Fresh vegetables and very fast delivery. Will order again.",
    photos: [
      "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=200",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200",
    ],
  },
  {
    name: "John Cruz",
    rating: 4,
    text: "Good quality products and fair pricing.",
    photos: [],
  },
];

// ─── QUANTITY MODAL ────────────────────────────────────────────────────────────

const QuantityModal = ({
  visible,
  product,
  mode,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  product: ProductDetailData;
  mode: "cart" | "buy";
  onClose: () => void;
  onConfirm: (qty: number) => void;
}) => {
  const [qty, setQty] = useState(1);
  if (!visible) return null;

  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_ORDER, product.stock));
  const total  = product.price * qty;

  return (
    <>
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={1}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 30 }}
      />
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 31,
        backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
      }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 }} />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Image source={product.images[0]} style={{ width: 56, height: 56, borderRadius: 8 }} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{product.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#15803d", marginTop: 2 }}>
              ₱{product.price}<Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "500" }}>/{product.unit}</Text>
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginTop: 20 }}>Quantity</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            style={{
              width: 36, height: 36, borderRadius: 18, borderWidth: 1,
              borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center",
              opacity: qty <= 1 ? 0.4 : 1,
            }}
          >
            <Ionicons name="remove" size={18} color="#374151" />
          </TouchableOpacity>

          <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827", minWidth: 28, textAlign: "center" }}>{qty}</Text>

          <TouchableOpacity
            onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            style={{
              width: 36, height: 36, borderRadius: 18, backgroundColor: "#15803d",
              alignItems: "center", justifyContent: "center",
              opacity: qty >= maxQty ? 0.4 : 1,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: "#9ca3af" }}>{product.unit}</Text>
        </View>

        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, lineHeight: 16 }}>
          Limited to {maxQty} {product.unit} per order.
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f0f0f0" }}>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#15803d" }}>₱{total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => onConfirm(qty)}
          activeOpacity={0.85}
          style={{ marginTop: 16, backgroundColor: "#15803d", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            {mode === "cart" ? "Add to Cart" : "Buy Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

// ─── REVIEW ROW ───────────────────────────────────────────────────────────────

const ReviewRow = ({ review, isLast }: { review: ReviewItem; isLast: boolean }) => (
  <View style={{
    paddingVertical: 14,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: "#f0f0f0",
  }}>
    {/* Name + stars */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{review.name}</Text>
      <View style={{ flexDirection: "row", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name="star" size={11} color={i <= review.rating ? "#f59e0b" : "#e5e7eb"} />
        ))}
      </View>
    </View>

    {/* Review text */}
    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 17 }}>
      {review.text}
    </Text>

    {/* Review photos — shown as a horizontal strip when present */}
    {review.photos && review.photos.length > 0 && (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginTop: 10 }}
      >
        {review.photos.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: 72, height: 72, borderRadius: 8 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    )}
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const PRODUCT = PRODUCT_DETAILS[params.id] ?? FALLBACK_PRODUCT;

  const [activeImg, setActiveImg] = useState(0);
  const [modalMode, setModalMode] = useState<"cart" | "buy" | null>(null);

  const handleConfirm = (qty: number) => {
    const mode = modalMode;
    setModalMode(null);
    if (mode === "buy") {
      router.push("/buyer/checkout" as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Back button */}
      <View style={{
        position: "absolute", top: 52, left: 16, zIndex: 10,
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center", justifyContent: "center",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Image carousel */}
        <FlatList
          data={PRODUCT.images}
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / SW))}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Image source={item} style={{ width: SW, height: 320 }} resizeMode="cover" />
          )}
        />
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }}>
          {PRODUCT.images.map((_: any, i: number) => (
            <View key={i} style={{
              width: activeImg === i ? 18 : 5, height: 5, borderRadius: 3,
              backgroundColor: activeImg === i ? "#15803d" : "#d1d5db",
            }} />
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>

          {/* Name + price */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", flex: 1 }}>
              {PRODUCT.name}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#15803d" }}>
              ₱{PRODUCT.price}
              <Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "500" }}>/{PRODUCT.unit}</Text>
            </Text>
          </View>

          {/* Stock */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Ionicons name="cube-outline" size={14} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {PRODUCT.stock} {PRODUCT.unit} available
            </Text>
          </View>

          {/* Fresh badge */}
          {PRODUCT.fresh && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
              backgroundColor: "#f0fdf4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 10,
            }}>
              <Ionicons name="leaf" size={12} color="#16a34a" />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>{PRODUCT.harvestDate}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 18 }}>Description</Text>
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 19 }}>
            {PRODUCT.description}
          </Text>

          {/* Farmer row */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            marginTop: 18, paddingVertical: 12,
            borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0f0f0",
          }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person" size={20} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{PRODUCT.farmer}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                {PRODUCT.farm} • {PRODUCT.category}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/buyer/chat/[id]" as any,
                  params: { id: PRODUCT.farmerId, name: PRODUCT.farmer },
                })
              }
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#15803d" />
            </TouchableOpacity>
          </View>

          {/* Reviews section */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20 }}>Reviews</Text>

          {/* Rating summary */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>{PRODUCT.rating}</Text>
              <View style={{ flexDirection: "row", gap: 1, marginTop: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name="star" size={11} color="#f59e0b" />
                ))}
              </View>
              <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{PRODUCT.reviewCount} reviews</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              {RATING_BREAKDOWN.map((r) => (
                <View key={r.star} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 10, color: "#6b7280", width: 24 }}>{r.star}★</Text>
                  <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: "#f3f4f6", overflow: "hidden" }}>
                    <View style={{ width: `${r.pct}%`, height: 5, backgroundColor: "#f59e0b" }} />
                  </View>
                  <Text style={{ fontSize: 10, color: "#9ca3af", width: 28 }}>{r.pct}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Individual reviews — each can now include photos */}
          <View style={{ marginTop: 10 }}>
            {REVIEWS.map((rev, i) => (
              <ReviewRow key={i} review={rev} isLast={i === REVIEWS.length - 1} />
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Bottom CTA bar */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f0",
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26,
      }}>
        <TouchableOpacity
          onPress={() => setModalMode("cart")}
          activeOpacity={0.85}
          style={{
            flex: 1, borderWidth: 1, borderColor: "#15803d",
            borderRadius: 10, paddingVertical: 12, alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d" }}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalMode("buy")}
          activeOpacity={0.85}
          style={{
            flex: 1, backgroundColor: "#15803d",
            borderRadius: 10, paddingVertical: 12, alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <QuantityModal
        visible={modalMode !== null}
        product={PRODUCT}
        mode={modalMode ?? "cart"}
        onClose={() => setModalMode(null)}
        onConfirm={handleConfirm}
      />
    </View>
  );
}