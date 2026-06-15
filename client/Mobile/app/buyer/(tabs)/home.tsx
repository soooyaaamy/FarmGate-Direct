  import { Ionicons } from "@expo/vector-icons";
  import { useRouter } from "expo-router";
  import { useEffect, useState } from "react";
  import {
    Dimensions,
    Image,
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import { Product } from "@/interfaces/product";

  const { width: SW } = Dimensions.get("window");
  const CARD_W = (SW - 40) / 2;
  const INFO_H = 80;
  const IMG_H  = 120;
  const SEARCH_DROPDOWN_TOP = 100;

  const SAMPLE_PRODUCTS: (Product & { rating?: number; reviewCount?: number })[] = [
    { id: "1",  name: "Organic Tomatoes",  price: "70.00",  stock: "45 kg",   farmName: "Green Valley Farm", image: require("../../../assets/images/tomato.jpg"),   createdAt: Date.now() - 86400000,  freshness: "3",  distanceKm: 1.2, pickupAvailable: true,  rating: 4.8, reviewCount: 32 },
    { id: "2",  name: "Carabao Mango",     price: "60.50",  stock: "50 pcs",  farmName: "Sunny Orchards",    image: require("../../../assets/images/mango.jpg"),    createdAt: Date.now() - 172800000, freshness: "5",  distanceKm: 3.5, pickupAvailable: true,  rating: 4.5, reviewCount: 18 },
    { id: "3",  name: "Eggplant",          price: "45.00",  stock: "5 kg",    farmName: "Green Valley Farm", image: require("../../../assets/images/eggplant.jpg"), createdAt: Date.now() - 43200000,  freshness: "2",  distanceKm: 1.2, pickupAvailable: false, rating: 4.2, reviewCount: 9  },
    { id: "4",  name: "Lakatan Banana",    price: "35.75",  stock: "80 pcs",  farmName: "TropiFarm",         image: require("../../../assets/images/banana.jpg"),   createdAt: Date.now() - 86400000,  freshness: "4",  distanceKm: 5.8, pickupAvailable: true,  rating: 4.7, reviewCount: 54 },
    { id: "5",  name: "Okra",              price: "38.25",  stock: "4 kg",    farmName: "BioGrow Fields",    image: require("../../../assets/images/okra.jpg"),     createdAt: Date.now() - 21600000,  freshness: "2",  distanceKm: 2.1, pickupAvailable: true,  rating: 4.0, reviewCount: 5  },
    { id: "6",  name: "Sweet Orange",      price: "52.00",  stock: "60 pcs",  farmName: "Sunny Orchards",    image: require("../../../assets/images/orange.jpg"),   createdAt: Date.now() - 259200000, freshness: "7",  distanceKm: 3.5, pickupAvailable: false, rating: 4.3, reviewCount: 21 },
    { id: "7",  name: "Farm Eggs",         price: "12.50",  stock: "3 trays", farmName: "Happy Hen Farm",    image: require("../../../assets/images/egg.jpg"),      createdAt: Date.now() - 86400000,  freshness: "14", distanceKm: 0.8, pickupAvailable: true,  rating: 4.9, reviewCount: 88 },
    { id: "8",  name: "Purple Eggplant",   price: "48.62",  stock: "30 kg",   farmName: "Hilltop Gardens",   image: require("../../../assets/images/eggplant.jpg"), createdAt: Date.now() - 3600000,   freshness: "2",  distanceKm: 7.4, pickupAvailable: true,  rating: 4.1, reviewCount: 13 },
    { id: "9",  name: "Cherry Tomatoes",   price: "85.00",  stock: "20 kg",   farmName: "Hilltop Gardens",   image: require("../../../assets/images/tomato.jpg"),   createdAt: Date.now() - 3600000,   freshness: "3",  distanceKm: 7.4, pickupAvailable: false, rating: 4.6, reviewCount: 27 },
    { id: "10", name: "Okra Bundles",      price: "32.00",  stock: "8 kg",    farmName: "BioGrow Fields",    image: require("../../../assets/images/okra.jpg"),     createdAt: Date.now() - 7200000,   freshness: "2",  distanceKm: 2.1, pickupAvailable: true,  rating: 3.9, reviewCount: 7  },
  ];

  const CATEGORY_FILTER: Record<string, string[]> = {
    All: [], Vegetables: ["Tomatoes", "Eggplant", "Okra", "Corn", "Kangkong"],
    Fruits: ["Mango", "Banana", "Orange", "Grapes", "Watermelon"],
    Rice: ["Rice"], Poultry: ["Eggs", "Chicken"],
    Dairy: ["Milk", "Cheese", "Yogurt"], Herbs: ["Herb", "Basil", "Mint"], Organic: [],
  };

  const CATEGORIES = [
    { label: "All",        icon: "grid-outline"       },
    { label: "Vegetables", icon: "leaf-outline"       },
    { label: "Fruits",     icon: "nutrition-outline"  },
    { label: "Rice",       icon: "restaurant-outline" },
    { label: "Poultry",    icon: "egg-outline"        },
    { label: "Dairy",      icon: "water-outline"      },
    { label: "Herbs",      icon: "flower-outline"     },
    { label: "Organic",    icon: "earth-outline"      },
  ];

  const BANNERS = [
    { id: "1", imageSource: require("../../../assets/images/banner1.png") },
    { id: "2", imageSource: require("../../../assets/images/banner2.png") },
    { id: "3", imageSource: require("../../../assets/images/banner3.png") },
  ];

  const isFresh = (p: any): boolean => {
    if (!p.createdAt || !p.freshness) return false;
    return Date.now() - p.createdAt < parseInt(p.freshness) * 86_400_000;
  };

  const ProductCard = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const fresh = isFresh(item);

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        style={{
          width: CARD_W,
          backgroundColor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 10,
          borderWidth: 1,
          borderColor: "#efefef",
        }}
      >
        <Image
          source={typeof item.image === "string" ? { uri: item.image } : item.image}
          style={{ width: "100%", height: IMG_H }}
          resizeMode="cover"
        />

        <View style={{
          height: INFO_H,
          paddingHorizontal: 8, paddingVertical: 6,
          flexDirection: "row", gap: 6,
        }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 11, color: "#111827", fontWeight: "700", lineHeight: 14 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={{ fontSize: 9, color: "#9ca3af", marginTop: 2, lineHeight: 12 }}
              numberOfLines={1}
            >
              {item.farmName}
            </Text>

            <View style={{ height: 14, marginTop: 2, justifyContent: "center" }}>
              {fresh && (
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 2,
                  alignSelf: "flex-start",
                  backgroundColor: "#f0fdf4", borderRadius: 4,
                  paddingHorizontal: 4, paddingVertical: 1,
                }}>
                  <Ionicons name="leaf" size={7} color="#16a34a" />
                  <Text style={{ fontSize: 7, fontWeight: "700", color: "#16a34a" }}>Fresh</Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 }}>
              <Ionicons name="star" size={9} color="#f59e0b" />
              <Text style={{ fontSize: 9, color: "#374151", fontWeight: "600" }}>
                {item.rating != null ? item.rating.toFixed(1) : "—"}
              </Text>
              {item.reviewCount != null && (
                <Text style={{ fontSize: 9, color: "#9ca3af" }}>({item.reviewCount})</Text>
              )}
            </View>
          </View>

          <View style={{ alignItems: "flex-end", justifyContent: "flex-start", paddingTop: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d" }}>
              ₱{parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  export default function Home() {
    const router = useRouter();
    const [activeCat,     setActiveCat]     = useState("All");
    const [bannerIdx,     setBannerIdx]     = useState(0);
    const [bannerHeights, setBannerHeights] = useState<Record<string, number>>({});
    const [searchQuery,   setSearchQuery]   = useState("");

    const cartCount = 3;

    const goToProduct = (id: string) =>
      router.push({ pathname: "/buyer/products/[id]" as any, params: { id } });
    const goToCart = () => router.push("/buyer/cart" as any);
    const goToMessages = () => router.push("/buyer/chat-list" as any);

    const closeSearch = () => {
      setSearchQuery("");
      Keyboard.dismiss();
    };

    const selectSearchResult = (id: string) => {
      closeSearch();
      goToProduct(id);
    };

    const searchResults = searchQuery.trim().length === 0
      ? []
      : SAMPLE_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.farmName.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6);

    useEffect(() => {
      BANNERS.forEach((b) => {
        if (!b.imageSource) return;
        const uri =
          typeof b.imageSource === "number"
            ? Image.resolveAssetSource(b.imageSource).uri
            : (b.imageSource as { uri: string }).uri;
        Image.getSize(uri, (w, h) => {
          setBannerHeights((prev) => ({ ...prev, [b.id]: (h / w) * SW }));
        }, () => {
          setBannerHeights((prev) => ({ ...prev, [b.id]: 200 }));
        });
      });
    }, []);

    const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
      if (activeCat === "All") return true;
      const kws = CATEGORY_FILTER[activeCat] ?? [];
      if (!kws.length) return true;
      return kws.some((kw) => p.name.toLowerCase().includes(kw.toLowerCase()));
    });

    const productPairs: any[][] = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      productPairs.push(filteredProducts.slice(i, i + 2));
    }

    return (
      <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

          <View style={{
            backgroundColor: "#15803d",
            paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
            borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

              <View style={{
                flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "#fff", borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 11,
              }}>
                
                <Ionicons name="search-outline" size={16} color="#9ca3af" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search vegetables, fruits…"
                  placeholderTextColor="#9ca3af"
                  style={{ flex: 1, fontSize: 13, color: "#111827" }}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={closeSearch}>
                    <Ionicons name="close-circle" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={goToCart}
                activeOpacity={0.85}
                style={{ position: "relative", padding: 6 }}
              >
                <Ionicons name="cart-outline" size={26} color="#fff" />
                {cartCount > 0 && (
                  <View style={{
                    position: "absolute", top: 0, right: 0,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    minWidth: 16, height: 16,
                    alignItems: "center", justifyContent: "center",
                    paddingHorizontal: 3,
                    borderWidth: 1.5, borderColor: "#15803d",
                  }}>
                    <Text style={{ fontSize: 8, color: "#15803d", fontWeight: "800", lineHeight: 11 }}>
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToMessages}
                activeOpacity={0.85}
                style={{ padding: 6 }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
              </TouchableOpacity>

            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / SW))
              }
            >
              {BANNERS.map((b) => {
                const height = bannerHeights[b.id] ?? 200;
                return (
                  <View key={b.id} style={{ width: SW, height, overflow: "hidden" }}>
                    {b.imageSource && (
                      <Image
                        source={b.imageSource}
                        style={{ position: "absolute", top: 0, left: 0, width: SW, height }}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 10 }}>
              {BANNERS.map((_, i) => (
                <View key={i} style={{
                  width: bannerIdx === i ? 18 : 5, height: 5, borderRadius: 3,
                  backgroundColor: bannerIdx === i ? "#15803d" : "#d1d5db",
                }} />
              ))}
            </View>
          </View>

          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 16 }}
          >
            {CATEGORIES.map((cat) => {
              const active = activeCat === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setActiveCat(cat.label)}
                  style={{ alignItems: "center", gap: 5 }}
                >
                  <View style={{
                    width: 48, height: 48, borderRadius: 12,
                    backgroundColor: active ? "#15803d" : "transparent",
                    borderWidth: 1, borderColor: active ? "#15803d" : "transparent",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Ionicons name={cat.icon as any} size={20} color={active ? "#fff" : "#6b7280"} />
                  </View>
                  <Text style={{
                    fontSize: 10, fontWeight: active ? "700" : "500",
                    color: active ? "#15803d" : "#6b7280",
                  }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            {productPairs.length === 0 ? (
              <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 }}>
                No products in this category yet.
              </Text>
            ) : (
              productPairs.map((pair, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {pair.map((item) => (
                    <ProductCard key={item.id} item={item} onPress={() => goToProduct(item.id)} />
                  ))}
                  {pair.length === 1 && <View style={{ width: CARD_W }} />}
                </View>
              ))
            )}
          </View>

        </ScrollView>

        {searchQuery.trim().length > 0 && (
          <>
            <TouchableOpacity
              onPress={closeSearch}
              activeOpacity={1}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.15)" }}
            />
            <View style={{
              position: "absolute",
              top: SEARCH_DROPDOWN_TOP, left: 16, right: 16,
              backgroundColor: "#fff", borderRadius: 12,
              maxHeight: 320, overflow: "hidden",
              shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12, shadowRadius: 10, elevation: 8,
            }}>
              {searchResults.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>No results for &quot;{searchQuery}&quot;</Text>
                </View>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled">
                  {searchResults.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => selectSearchResult(item.id)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 10,
                        paddingHorizontal: 12, paddingVertical: 10,
                        borderBottomWidth: idx < searchResults.length - 1 ? 1 : 0,
                        borderBottomColor: "#f3f4f6",
                      }}
                    >
                      <Image
                        source={typeof item.image === "string" ? { uri: item.image } : item.image}
                        style={{ width: 40, height: 40, borderRadius: 6 }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: "#9ca3af" }} numberOfLines={1}>
                          {item.farmName}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d" }}>
                        ₱{parseFloat(item.price).toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

      </View>
    );
  }