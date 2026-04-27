import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image, ScrollView, Text,
  TouchableOpacity, View,
} from "react-native";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ── Mock data (replace with API) ──────────────────────────────────────────
const FARM = {
  name: "Green Valley Farm",
  location: "Hagonoy, Bulacan",
  rating: 5.0,
  reviewCount: 125,
  about: "Green Valley Farm has been family-owned for three generations, specializing in organic and sustainable farming. We grow a diverse range of seasonal vegetables, fruits, and herbs across our 45-acre property.",
  farmer: { name: "Mario Santos", initials: "MS" },
  coverPhoto: require("../../../assets/images/farm-picture.jpg") as any,
};

const PRODUCTS = [
  { id: "1", name: "Tomatoes", price: 120, unit: "kg", available: 45, rating: 5.0, badge: "Fresh",   image: require("../../../assets/images/tomato.jpg") },
  { id: "2", name: "Eggplant", price: 80,  unit: "kg", available: 30, rating: 5.0, badge: "Fresh",   image: require("../../../assets/images/eggplant.jpg") },
  { id: "3", name: "Mango",    price: 60,  unit: "pc", available: 50, rating: 4.8, badge: "Fresh", image: require("../../../assets/images/mango.jpg") },
  { id: "4", name: "Banana",   price: 35,  unit: "pc", available: 80, rating: 4.9, badge: "Fresh",   image: require("../../../assets/images/banana.jpg") },
];

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Fresh:   { bg: "#166534", text: "#fff" },
};

// ── Product Card ──────────────────────────────────────────────────────────
const ProductCard = ({ item }: { item: typeof PRODUCTS[0] }) => {
  const badge = BADGE_COLORS[item.badge] ?? BADGE_COLORS.Fresh;

  return (
    <View style={{
      backgroundColor: "white",
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
      margin: 5,
    }}>
      {/* Image */}
      <View style={{ height: 140, position: "relative" }}>
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <View style={{
          position: "absolute", top: 7, left: 7,
          backgroundColor: badge.bg, borderRadius: 6,
          paddingHorizontal: 7, paddingVertical: 2,
        }}>
          <Text style={{ fontSize: 10, color: badge.text, fontWeight: "700" }}>
            {item.badge}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, marginBottom: 6 }} numberOfLines={1}>
          {FARM.name} · {FARM.location}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#15803d", marginBottom: 4 }}>
          ₱{item.price} / {item.unit}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, color: "#6b7280" }}>
            {item.available} {item.unit} Available
          </Text>
          <Text style={{ fontSize: 10, color: "#d1d5db" }}>•</Text>
          <Ionicons name="star" size={11} color="#f59e0b" />
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151" }}>
            {item.rating}
          </Text>
        </View>

        {/* Full-width Add to Cart */}
        <TouchableOpacity style={{
          backgroundColor: "#166534",
          borderRadius: 10,
          paddingVertical: 9,
          alignItems: "center",
        }}>
          <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
const FarmProfile = () => {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedProducts = showAll ? PRODUCTS : PRODUCTS.slice(0, 4);

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Cover Photo ── */}
        <View style={{ height: 220, position: "relative" }}>
          <Image
            source={FARM.coverPhoto}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Dark overlay */}
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.15)",
          }} />
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute", top: STATUS_BAR + 8, left: 16,
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.88)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* ── White Body ── */}
        <View style={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -20,
          padding: 18,
        }}>

          {/* Farm name + actions */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", lineHeight: 24 }}>
                {FARM.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <Ionicons name="location" size={13} color="#16a34a" />
                <Text style={{ fontSize: 12, color: "#6b7280" }}>{FARM.location}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }}>
                {[1,2,3,4,5].map((i) => (
                  <Ionicons key={i} name="star" size={13} color="#f59e0b" />
                ))}
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>
                  {FARM.rating}
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                  ({FARM.reviewCount} reviews)
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: "#f0fdf4",
                borderWidth: 1, borderColor: "#dcfce7",
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name="chatbubble-outline" size={17} color="#15803d" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsFavorited(!isFavorited)}
                style={{
                  width: 38, height: 38, borderRadius: 19,
                  backgroundColor: isFavorited ? "#fff1f2" : "#f9fafb",
                  borderWidth: 1,
                  borderColor: isFavorited ? "#ffe4e6" : "#f3f4f6",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={17}
                  color={isFavorited ? "#ef4444" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 14 }} />

          {/* About Farm */}
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
            About Farm
          </Text>
          <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 20, marginBottom: 14 }}>
            {FARM.about}
          </Text>

          {/* Farmer card */}
          <View style={{
            backgroundColor: "#f9fafb",
            borderRadius: 14,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

              {/* ── Replace path with your image ── */}
              <Image
                source={require("../../../assets/images/farmer-profile.jpg")}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                }}
                resizeMode="cover"
              />

              <View>
                <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600" }}>Farmer</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                  {FARM.farmer.name}
                </Text>
              </View>
            </View>
            <View style={{
              backgroundColor: "#dcfce7",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>Owner</Text>
            </View>
          </View>

          {/* Products header */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
              Our Products
            </Text>
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text style={{ fontSize: 12, color: "#15803d", fontWeight: "700" }}>
                {showAll ? "Show less" : "See all →"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Product grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -5 }}>
            {displayedProducts.map((item) => (
              <View key={item.id} style={{ width: "50%" }}>
                <ProductCard item={item} />
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default FarmProfile;