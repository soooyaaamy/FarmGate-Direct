import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  addToCart,
  getProductById,
  getProducts,
  getReviewsForProduct,
  isFresh,
  Product,
  Review,
} from "@/lib/store";

const { width: SW } = Dimensions.get("window");

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct]   = useState<Product | null>(null);
  const [related, setRelated]   = useState<Product[]>([]);
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]           = useState(1);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!id) return;
        setLoading(true);
        const [found, all, productReviews] = await Promise.all([
          getProductById(id),
          getProducts(),
          getReviewsForProduct(id),
        ]);
        if (cancelled) return;

        setProduct(found ?? null);
        setReviews(productReviews);
        setQty(1);
        setActiveImg(0);

        if (found) {
          const sameFarmer = all
            .filter((p) => p.farmerId === found.farmerId && p.id !== found.id)
            .slice(0, 8);
          setRelated(sameFarmer);
        }
        setLoading(false);
      })();
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
          We couldn&apos;t find this product.
        </Text>
      </View>
    );
  }

  const fresh = isFresh(product);
  const images = [product.image]; // single source image; swap in a real gallery array if your backend provides one
  const outOfStock = product.stock <= 0;

  // Rating breakdown computed from real reviews instead of hardcoded percentages
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.productRating === star).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  const handleAddToCart = async () => {
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      await addToCart(product, qty);
      setAddedFlash(true);
      setTimeout(() => setAddedFlash(false), 1500);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock) return;
    // Buy Now skips the cart entirely and goes straight to checkout
    // with just this product, matching the Shopee/Lazada pattern.
    const itemsToCheckout = [
      {
        farmerId: product.farmerId,
        farmName: product.farmName,
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            quantity: qty,
            isFresh: fresh,
          },
        ],
      },
    ];

    router.push({
      pathname: "/buyer/checkout",
      params: { items: JSON.stringify(itemsToCheckout) },
    });
  };

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
          data={images}
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / SW))}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Image
              source={typeof item === "string" ? { uri: item } : item}
              style={{ width: SW, height: 320 }}
              resizeMode="cover"
            />
          )}
        />
        {images.length > 1 && (
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }}>
            {images.map((_, i) => (
              <View key={i} style={{
                width: activeImg === i ? 18 : 5, height: 5, borderRadius: 3,
                backgroundColor: activeImg === i ? "#15803d" : "#d1d5db",
              }} />
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", flex: 1 }}>
              {product.name}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#15803d" }}>
              ₱{product.price.toFixed(2)}<Text style={{ fontSize: 12, color: "#9ca3af", fontWeight: "500" }}>/{product.unit}</Text>
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#374151" }}>{product.rate.toFixed(1)}</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>({product.reviewCount} reviews)</Text>
            </View>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>•</Text>
            <Text style={{ fontSize: 12, color: outOfStock ? "#dc2626" : "#9ca3af" }}>
              {outOfStock ? "Out of stock" : `${product.stock} ${product.unit} in stock`}
            </Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>•</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>{product.sold} sold</Text>
          </View>

          {fresh && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
              backgroundColor: "#f0fdf4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 10,
            }}>
              <Ionicons name="leaf" size={12} color="#16a34a" />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>Fresh</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0f0f0" }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="person" size={20} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{product.farmName}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{product.category}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/buyer/messages" as any)}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#15803d" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 16 }}>Description</Text>
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 6, lineHeight: 19 }}>
            Fresh {product.name.toLowerCase()} from {product.farmName}.
          </Text>

          <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20 }}>Reviews</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#111827" }}>
                {product.reviewCount > 0 ? product.rate.toFixed(1) : "—"}
              </Text>
              <View style={{ flexDirection: "row", gap: 1, marginTop: 2 }}>
                {[1,2,3,4,5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= Math.round(product.rate) ? "star" : "star-outline"}
                    size={11}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{product.reviewCount} reviews</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              {ratingBreakdown.map((r) => (
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

          {reviews.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <Ionicons name="chatbubble-outline" size={28} color="#d1d5db" />
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                No reviews yet. Be the first to review this product!
              </Text>
            </View>
          ) : (
            reviews.map((rev, i) => (
              <View
                key={rev.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: i < reviews.length - 1 ? 1 : 0,
                  borderBottomColor: "#f0f0f0",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>
                    Verified Buyer
                  </Text>
                  <View style={{ flexDirection: "row", gap: 1 }}>
                    {[1,2,3,4,5].map((i2) => (
                      <Ionicons key={i2} name="star" size={10} color={i2 <= rev.productRating ? "#f59e0b" : "#e5e7eb"} />
                    ))}
                  </View>
                </View>
                {rev.text ? (
                  <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 17 }}>{rev.text}</Text>
                ) : null}
                {rev.photos.length > 0 && (
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                    {rev.photos.map((uri, pi) => (
                      <Image key={pi} source={{ uri }} style={{ width: 50, height: 50, borderRadius: 6 }} />
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {related.length > 0 && (
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", marginTop: 20, marginBottom: 10 }}>
              More from this Farmer
            </Text>
          )}
        </View>

        {related.length > 0 && (
          <FlatList
            data={related}
            horizontal showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ width: 120 }}
                onPress={() => router.push({ pathname: "/buyer/products/[id]" as any, params: { id: item.id } })}
              >
                <Image source={item.image} style={{ width: 120, height: 100, borderRadius: 10 }} resizeMode="cover" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginTop: 6 }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d", marginTop: 2 }}>₱{item.price.toFixed(2)}</Text>
              </TouchableOpacity>
            )}
          />
        )}

      </ScrollView>

      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f0",
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 26,
      }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
          paddingHorizontal: 8, paddingVertical: 8,
          opacity: outOfStock ? 0.4 : 1,
        }}>
          <TouchableOpacity disabled={outOfStock} onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={16} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: "700", minWidth: 16, textAlign: "center" }}>{qty}</Text>
          <TouchableOpacity
            disabled={outOfStock}
            onPress={() => setQty((q) => Math.min(product.stock, q + 1))}
          >
            <Ionicons name="add" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={outOfStock || adding}
          onPress={handleAddToCart}
          style={{
            flex: 1, borderWidth: 1,
            borderColor: outOfStock ? "#d1d5db" : "#15803d",
            borderRadius: 10, paddingVertical: 12, alignItems: "center",
            backgroundColor: addedFlash ? "#f0fdf4" : "transparent",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: outOfStock ? "#9ca3af" : "#15803d" }}>
            {addedFlash ? "Added!" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={outOfStock}
          onPress={handleBuyNow}
          style={{
            flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center",
            backgroundColor: outOfStock ? "#d1d5db" : "#15803d",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
            {outOfStock ? "Out of Stock" : "Buy Now"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}