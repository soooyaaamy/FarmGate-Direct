import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const CARD_W  = (SW - 40) / 2;
const INFO_H = 80;
const IMG_H  = 120;

const allProducts = [
  { id: "1",  name: "Fresh Farm Tomatoes",  farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/tomato.jpg"),     price: 120, unit: "kg",  stock: 45,  rate: 4.8, reviewCount: 32, createdAt: Date.now() - 86400000,   freshness: "3"  },
  { id: "2",  name: "Fresh Eggplant",        farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/eggplant.jpg"),   price: 80,  unit: "kg",  stock: 32,  rate: 4.6, reviewCount: 18, createdAt: Date.now() - 518400000,  freshness: "5"  },
  { id: "3",  name: "Fresh Farm Eggs",       farm: "Golden Poultry Farm",  farmerId: "f2", category: "Eggs & Poultry", image: require("@/assets/images/egg.jpg"),        price: 10,  unit: "pc",  stock: 250, rate: 4.9, reviewCount: 88, createdAt: Date.now() - 43200000,   freshness: "14" },
  { id: "4",  name: "Premium White Rice",    farm: "Bulacan Organic Farm", farmerId: "f3", category: "Rice",           image: require("@/assets/images/rice.jpg"),       price: 200, unit: "kg",  stock: 20,  rate: 4.5, reviewCount: 21, createdAt: Date.now() - 864000000,  freshness: "7"  },
  { id: "5",  name: "Organic Brown Rice",    farm: "Bulacan Organic Farm", farmerId: "f3", category: "Rice",           image: require("@/assets/images/rice.jpg"),       price: 60,  unit: "kg",  stock: 50,  rate: 4.3, reviewCount: 15, createdAt: Date.now() - 518400000,  freshness: "5"  },
  { id: "6",  name: "Native Egg",            farm: "Golden Poultry Farm",  farmerId: "f2", category: "Eggs & Poultry", image: require("@/assets/images/egg.jpg"),        price: 15,  unit: "pc",  stock: 6,   rate: 4.7, reviewCount: 9,  createdAt: Date.now() - 21600000,   freshness: "14" },
  { id: "7",  name: "Fresh Pumpkin",         farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/pumpkin.jpg"),    price: 60,  unit: "kg",  stock: 50,  rate: 4.4, reviewCount: 11, createdAt: Date.now() - 3600000,    freshness: "4"  },
  { id: "8",  name: "Fresh Banana",          farm: "Golden Orchard Farm",  farmerId: "f4", category: "Fruits",         image: require("@/assets/images/banana.jpg"),     price: 80,  unit: "kg",  stock: 22,  rate: 4.6, reviewCount: 54, createdAt: Date.now() - 86400000,   freshness: "4"  },
  { id: "9",  name: "Fresh Orange",          farm: "Golden Orchard Farm",  farmerId: "f4", category: "Fruits",         image: require("@/assets/images/orange.jpg"),     price: 60,  unit: "kg",  stock: 50,  rate: 4.3, reviewCount: 21, createdAt: Date.now() - 864000000,  freshness: "7"  },
  { id: "10", name: "Native Okra",           farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/okra.jpg"),       price: 45,  unit: "kg",  stock: 4,   rate: 4.0, reviewCount: 5,  createdAt: Date.now() - 259200000,  freshness: "2"  },
  { id: "11", name: "Cherry Tomatoes",       farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/tomato.jpg"),     price: 85,  unit: "kg",  stock: 20,  rate: 4.6, reviewCount: 27, createdAt: Date.now() - 3600000,    freshness: "3"  },
  { id: "12", name: "Long Eggplant",         farm: "Green Valley Farm",    farmerId: "f1", category: "Vegetables",     image: require("@/assets/images/eggplant.jpg"),   price: 70,  unit: "kg",  stock: 30,  rate: 4.1, reviewCount: 13, createdAt: Date.now() - 518400000,  freshness: "3"  },
  { id: "13", name: "Fresh Mango",           farm: "Golden Orchard Farm",  farmerId: "f4", category: "Fruits",         image: require("@/assets/images/mango.jpg"),      price: 60,  unit: "kg",  stock: 50,  rate: 4.5, reviewCount: 18, createdAt: Date.now() - 86400000,   freshness: "5"  },
  { id: "14", name: "Native Green Grapes",   farm: "Golden Orchard Farm",  farmerId: "f4", category: "Fruits",         image: require("@/assets/images/greengrape.jpg"), price: 200, unit: "kg",  stock: 22,  rate: 4.2, reviewCount: 9,  createdAt: Date.now() - 604800000,  freshness: "6"  },
];

const isFresh = (item: any): boolean => {
  if (!item.createdAt || !item.freshness) return false;
  return Date.now() - item.createdAt < parseInt(item.freshness) * 86_400_000;
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
        source={item.image}
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
            {item.farm}
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
              {item.rate.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 9, color: "#9ca3af" }}>({item.reviewCount})</Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", justifyContent: "flex-start", paddingTop: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#15803d" }}>
            ₱{item.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SearchModal = ({
  visible,
  onClose,
  onSelectProduct,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectProduct: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");

  const results = query.trim().length === 0
    ? []
    : allProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.farm.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{
          backgroundColor: "#15803d",
          paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
          flexDirection: "row", alignItems: "center", gap: 10,
        }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "#fff", borderRadius: 12,
            paddingHorizontal: 12, paddingVertical: 11,
          }}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search fresh produce, farms..."
              placeholderTextColor="#9ca3af"
              style={{ flex: 1, fontSize: 13, color: "#111827" }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {query.trim().length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>Type to search products</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ionicons name="sad-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>No results for &quot;{query}&quot;</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {results.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => { onClose(); onSelectProduct(item.id); }}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: "#fff", borderRadius: 12,
                  padding: 10, marginBottom: 10,
                  borderWidth: 1, borderColor: "#efefef",
                }}
              >
                <Image
                  source={item.image}
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{item.farm}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#15803d", marginTop: 3 }}>
                    ₱{item.price}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default function Shop() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = 0;

  const goToProduct = (id: string) =>
    router.push({ pathname: "/buyer/products/[id]" as any, params: { id } });
  const goToCart     = () => router.push("/buyer/(tabs)/cart" as any);
  const goToMessages = () => router.push("/buyer/chat-list" as any);

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>

      <SearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(id) => goToProduct(id)}
      />

      <FlatList
        data={allProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListHeaderComponent={
          <View style={{
            backgroundColor: "#15803d",
            marginHorizontal: -16,
            paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
            borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
            marginBottom: 12,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setSearchOpen(true)}
                activeOpacity={0.9}
                style={{
                  flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
                  backgroundColor: "#fff", borderRadius: 12,
                  paddingHorizontal: 12, paddingVertical: 11,
                }}
              >
                <Ionicons name="search-outline" size={16} color="#9ca3af" />
                <Text style={{ fontSize: 13, color: "#9ca3af" }}>Search fresh produce, farms...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToCart}
                activeOpacity={0.85}
                style={{ position: "relative", padding: 6 }}
              >
                <Ionicons name="cart-outline" size={26} color="#fff" />
                {cartCount > 0 && (
                  <View style={{
                    position: "absolute", top: 0, right: 0,
                    backgroundColor: "#fff", borderRadius: 10,
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
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 }}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>No products found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/buyer/products/[id]" as any,
                params: {
                  id: item.id,
                  name: item.name,
                  price: String(item.price),
                  stock: String(item.stock),
                  rate: item.rate,
                  farm: item.farm,
                  category: item.category,
                },
              })
            }
          />
        )}
      />

    </View>
  );
}