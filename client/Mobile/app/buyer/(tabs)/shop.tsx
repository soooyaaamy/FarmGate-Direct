import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getCart, getProducts, isFresh, Product } from "@/lib/store";

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 40) / 2;
const INFO_H = 80;
const IMG_H  = 120;
const SEARCH_DROPDOWN_TOP = 100;

const ProductCard = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const fresh = isFresh(item);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{ width: CARD_W, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", marginBottom: 10, borderWidth: 1, borderColor: "#efefef" }}
    >
      <Image source={item.image} style={{ width: "100%", height: IMG_H }} resizeMode="cover" />
      <View style={{ height: INFO_H, paddingHorizontal: 8, paddingVertical: 6, flexDirection: "row", gap: 6 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#111827", fontWeight: "700", lineHeight: 14 }} numberOfLines={1}>{item.name}</Text>
          <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 2, lineHeight: 12 }} numberOfLines={1}>{item.farmName}</Text>
          <View style={{ height: 14, marginTop: 2, justifyContent: "center" }}>
            {fresh && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2, alignSelf: "flex-start", backgroundColor: "#f0fdf4", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                <Ionicons name="leaf" size={7} color="#16a34a" />
                <Text style={{ fontSize: 7, fontWeight: "700", color: "#16a34a" }}>Fresh</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 }}>
            <Ionicons name="star" size={9} color="#f59e0b" />
            <Text style={{ fontSize: 9, color: "#374151", fontWeight: "600" }}>{item.rate.toFixed(1)}</Text>
            <Text style={{ fontSize: 9, color: "#9ca3af" }}>({item.reviewCount})</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", justifyContent: "flex-start", paddingTop: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d" }}>₱{item.price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Shop() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [freshProducts, cart] = await Promise.all([getProducts(), getCart()]);
        setProducts(freshProducts);
        const count = cart.reduce((sum, f) => sum + f.products.reduce((s, p) => s + p.quantity, 0), 0);
        setCartCount(count);
      })();
    }, [])
  );

  const goToProduct = (id: string) =>
    router.push({ pathname: "/buyer/products/[id]" as any, params: { id } });
  const goToCart     = () => router.push("/buyer/cart" as any);
  const goToMessages = () => router.push("/buyer/chat-list" as any);

  const closeSearch = () => { setSearchQuery(""); Keyboard.dismiss(); };

  const searchResults = searchQuery.trim().length === 0
    ? []
    : products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListHeaderComponent={
          <>
            <View style={{
              backgroundColor: "#15803d",
              marginHorizontal: -16,
              paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
              borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{
                  flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
                  backgroundColor: "#fff", borderRadius: 12,
                  paddingHorizontal: 12, paddingVertical: 8,
                }}>
                  <Ionicons name="search-outline" size={16} color="#9ca3af" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search fresh produce, farms..."
                    placeholderTextColor="#9ca3af"
                    style={{ flex: 1, fontSize: 13, color: "#111827", paddingVertical: 0 }}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={closeSearch}>
                      <Ionicons name="close-circle" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={goToCart} activeOpacity={0.85} style={{ position: "relative", padding: 6 }}>
                  <Ionicons name="cart-outline" size={26} color="#fff" />
                  {cartCount > 0 && (
                    <View style={{ position: "absolute", top: 0, right: 0, backgroundColor: "#fff", borderRadius: 10, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3, borderWidth: 1.5, borderColor: "#15803d" }}>
                      <Text style={{ fontSize: 8, color: "#15803d", fontWeight: "800", lineHeight: 11 }}>{cartCount > 99 ? "99+" : cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={goToMessages} activeOpacity={0.85} style={{ padding: 6 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 12 }} />
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 }}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>No products found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard item={item} onPress={() => goToProduct(item.id)} />
        )}
      />

      {searchQuery.trim().length > 0 && (
        <View style={{
          position: "absolute",
          top: SEARCH_DROPDOWN_TOP, left: 16, right: 16,
          backgroundColor: "#fff", borderRadius: 12,
          overflow: "hidden",
          shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.10, shadowRadius: 8, elevation: 8,
        }}>
          {searchResults.length === 0 ? (
            <View style={{ paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>No results for &quot;{searchQuery}&quot;</Text>
            </View>
          ) : (
            searchResults.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => { closeSearch(); goToProduct(item.id); }}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 14, paddingVertical: 11,
                  borderBottomWidth: idx < searchResults.length - 1 ? 1 : 0,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 13, color: "#111827", fontWeight: "500" }} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

    </View>
  );
}