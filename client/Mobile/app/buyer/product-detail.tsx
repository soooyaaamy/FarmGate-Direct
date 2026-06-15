import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View, Dimensions } from "react-native";

const { width: SW } = Dimensions.get("window");

const PRODUCT = {
  id: "1",
  name: "Fresh Farm Tomatoes",
  price: 120,
  unit: "kg",
  stock: 45,
  farm: "Green Valley Farm",
  farmer: "Juan Dela Cruz",
  category: "Vegetables",
  description: "Hand-picked vine-ripened tomatoes, harvested this morning. Perfect for salads, sauces, and everyday cooking.",
  harvestDate: "Harvested today",
  fresh: true,
  rating: 4.8,
  reviewCount: 32,
  images: [
    require("@/assets/images/tomato.jpg"),
    require("@/assets/images/tomato.jpg"),
    require("@/assets/images/tomato.jpg"),
  ],
};

const RATING_BREAKDOWN = [
  { star: 5, pct: 80 },
  { star: 4, pct: 15 },
  { star: 3, pct: 5 },
  { star: 2, pct: 0 },
  { star: 1, pct: 0 },
];

const REVIEWS = [
  { name: "Maria Santos", rating: 5, text: "Fresh vegetables and very fast delivery. Will order again." },
  { name: "John Cruz",    rating: 4, text: "Good quality products and fair pricing." },
];

const RELATED = [
  { id: "2", name: "Fresh Eggplant", price: 80, image: require("@/assets/images/eggplant.jpg") },
  { id: "7", name: "Fresh Pumpkin",  price: 60, image: require("@/assets/images/pumpkin.jpg") },
  { id: "11", name: "Cherry Tomatoes", price: 85, image: require("@/assets/images/tomato.jpg") },
];

export default function ProductDetail() {
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

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
          {PRODUCT.images.map((_, i) => (
            <View key={i} style={{
              width: activeImg === i ? 18 : 5, height: 5, borderRadius: 3,
              backgroundColor: activeImg === i ? "#15803d" : "#d1d5db",
            }} />
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", flex: 1 }}>
              {PRODUCT.name}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#15803d" }}>
              ₱{PRODUCT.price}<Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "500" }}>/{PRODUCT.unit}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#374151" }}>{PRODUCT.rating}</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>({PRODUCT.reviewCount} reviews)</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>•</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>{PRODUCT.stock} {PRODUCT.unit} in stock</Text>
          </View>

          {PRODUCT.fresh && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
              backgroundColor: "#f0fdf4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 10,
            }}>
              <Ionicons name="leaf" size={12} color="#16a34a" />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>{PRODUCT.harvestDate}</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0f0f0" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person" size={20} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{PRODUCT.farmer}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{PRODUCT.farm} • {PRODUCT.category}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/buyer/messages" as any)}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#15803d" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 16 }}>Description</Text>
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 19 }}>
            {PRODUCT.description}
          </Text>

          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20 }}>Reviews</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>{PRODUCT.rating}</Text>
              <View style={{ flexDirection: "row", gap: 1, marginTop: 2 }}>
                {[1,2,3,4,5].map((i) => (
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

          {REVIEWS.map((rev, i) => (
            <View key={i} style={{ paddingVertical: 12, borderBottomWidth: i < REVIEWS.length - 1 ? 1 : 0, borderBottomColor: "#f0f0f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>{rev.name}</Text>
                <View style={{ flexDirection: "row", gap: 1 }}>
                  {[1,2,3,4,5].map((i2) => (
                    <Ionicons key={i2} name="star" size={10} color={i2 <= rev.rating ? "#f59e0b" : "#e5e7eb"} />
                  ))}
                </View>
              </View>
              <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 17 }}>{rev.text}</Text>
            </View>
          ))}

          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 10 }}>
            More from this Farmer
          </Text>
        </View>

        <FlatList
          data={RELATED}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} style={{ width: 120 }}>
              <Image source={item.image} style={{ width: 120, height: 100, borderRadius: 10 }} resizeMode="cover" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginTop: 6 }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d", marginTop: 2 }}>₱{item.price}</Text>
            </TouchableOpacity>
          )}
        />

      </ScrollView>

      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f0",
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 8 }}>
          <TouchableOpacity onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={16} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: "700", minWidth: 16, textAlign: "center" }}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty((q) => q + 1)}>
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={{ flex: 1, borderWidth: 1, borderColor: "#15803d", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d" }}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={{ flex: 1, backgroundColor: "#15803d", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Buy Now</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}