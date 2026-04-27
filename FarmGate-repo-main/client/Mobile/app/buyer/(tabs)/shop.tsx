import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QuantityModal from "@/components/QuantityModal";

/* ---------- PRODUCTS ---------- */
const allProducts = [
  {
    id: "1",
    name: "Fresh Farm Tomatoes",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/tomato.jpg"),
    price: "₱120 / kg",
    stock: "45 kg Available",
    rate: "5",
  },
  {
    id: "2",
    name: "Fresh Eggplant",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/eggplant.jpg"),
    price: "₱80 / kg",
    stock: "32 kg Available",
    rate: "5",
  },
  {
    id: "3",
    name: "Fresh Farm Eggs",
    farm: "Golden Poultry Farm",
    category: "Eggs & Poultry",
    image: require("@/assets/images/egg.jpg"),
    price: "₱10 / pc",
    stock: "250 pcs Available",
    rate: "5",
  },
  {
    id: "4",
    name: "Fresh Rice",
    farm: "Bulacan Organic Farm",
    category: "Rice",
    image: require("@/assets/images/rice.jpg"),
    price: "₱200 / kg",
    stock: "20 kg Available",
    rate: "5",
  },
  {
    id: "5",
    name: "Fresh Rice",
    farm: "Bulacan Organic Farm",
    category: "Rice",
    image: require("@/assets/images/rice.jpg"),
    price: "₱60 / kg",
    stock: "50 kg Available",
    rate: "5",
  },
  {
    id: "6",
    name: "Native Egg",
    farm: "Golden Poultry Farm",
    category: "Eggs & Poultry",
    image: require("@/assets/images/egg.jpg"),
    price: "₱200 / kg",
    stock: "22 kg Available",
    rate: "5",
  },
  {
    id: "7",
    name: "Fresh Pumpkin",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/pumpkin.jpg"),
    price: "₱60 / kg",
    stock: "50 kg Available",
    rate: "5",
  },
  {
    id: "8",
    name: "Fresh Banana",
    farm: "Golden Orchard Farm",
    category: "Fruits",
    image: require("@/assets/images/banana.jpg"),
    price: "₱200 / kg",
    stock: "22 kg Available",
    rate: "5",
  },
  {
    id: "9",
    name: "Fresh Orange",
    farm: "Golden Orchard Farm",
    category: "Fruits",
    image: require("@/assets/images/orange.jpg"),
    price: "₱60 / kg",
    stock: "50 kg Available",
    rate: "5",
  },
  {
    id: "10",
    name: "Native Okra",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/okra.jpg"),
    price: "₱200 / kg",
    stock: "22 kg Available",
    rate: "5",
  },
  {
    id: "11",
    name: "Fresh Farm Tomatoes",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/tomato.jpg"),
    price: "₱120 / kg",
    stock: "45 kg Available",
    rate: "5",
  },
  {
    id: "12",
    name: "Fresh Eggplant",
    farm: "Green Valley Farm",
    category: "Vegetables",
    image: require("@/assets/images/eggplant.jpg"),
    price: "₱80 / kg",
    stock: "32 kg Available",
    rate: "5",
  },
  {
    id: "13",
    name: "Fresh Mango",
    farm: "Golden Orchard Farm",
    category: "Fruits",
    image: require("@/assets/images/mango.jpg"),
    price: "₱60 / kg",
    stock: "50 kg Available",
    rate: "5",
  },
  {
    id: "14",
    name: "Native Green Grapes",
    farm: "Golden Orchard Farm",
    category: "Fruits",
    image: require("@/assets/images/greengrape.jpg"),
    price: "₱200 / kg",
    stock: "22 kg Available",
    rate: "5",
  },
];

const categories = ["All", "Vegetables", "Fruits", "Eggs & Poultry", "Rice"];

export default function Shop() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  /* ---------- FILTER LOGIC ---------- */
  const filteredProducts = allProducts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      {/* HEADER */}
      <View
        style={{
          backgroundColor: "#4B8B3B",
          paddingBottom: 24,
          paddingTop: 56,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginLeft: 12,
            }}
          >
            Shop
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "white",
            marginHorizontal: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Search fresh produce, farms..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ marginLeft: 8, flex: 1, fontSize: 16 }}
          />
        </View>
      </View>

      {/* FILTER */}
      <View style={{ paddingHorizontal: 16, marginTop: 16, paddingBottom: 10 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 10,
            color: "#555",
          }}
        >
          Filter By:
        </Text>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = activeCategory === item;

            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: isActive ? "#4B8B3B" : "#E5E5E5",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "white" : "#333",
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* PRODUCTS */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/products/[id]",
                params: {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  stock: item.stock,
                  rate: item.rate,
                  farm: item.farm,
                  category: item.category,
                },
              })
            }
            style={{
              width: "48%",
              backgroundColor: "white",
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              overflow: "hidden",
            }}
          >
            <View style={{ padding: 10 }}>
              <Image
                source={item.image}
                style={{ width: "100%", height: 120, borderRadius: 10 }}
                resizeMode="cover"
              />

              <Text
                style={{ fontWeight: "600", fontSize: 14, marginTop: 8 }}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text style={{ fontSize: 12, color: "gray", marginTop: 4 }}>
                {item.farm}, Bulacan
              </Text>

              <Text
                style={{
                  fontWeight: "bold",
                  color: "#4B8B3B",
                  marginTop: 4,
                }}
              >
                {item.price}
              </Text>

              <Text style={{ fontSize: 12, color: "gray", marginTop: 4 }}>
                {item.stock} • ⭐ {item.rate}
              </Text>

              {/* ADD TO CART */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(item);
                  setShowQtyModal(true);
                }}
                style={{
                  backgroundColor: "#4B8B3B",
                  marginTop: 10,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* QUANTITY MODAL */}
      <QuantityModal
        visible={showQtyModal}
        onClose={() => {
          setShowQtyModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={(qty) => {
          if (!selectedProduct) return;

          addToCart({
            id: selectedProduct.id,
            name: selectedProduct.name,
            image: selectedProduct.image,
            price: Number(selectedProduct.price.replace(/[^0-9]/g, "")),
            quantity: qty,
          });

          setShowQtyModal(false);
          setSelectedProduct(null);
        }}
      />
    </View>
  );
}
