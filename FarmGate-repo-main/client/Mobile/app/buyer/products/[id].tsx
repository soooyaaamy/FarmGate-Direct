import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

const API_URL = "http://192.168.8.23:5000";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState<string | null>(null);

  // Bottom modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"cart" | "buynow">("cart");
  const [quantity, setQuantity] = useState(1);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const reviews = [
    { id: "1", user: "Buyer12345", date: "2 months ago", rating: 5, comment: "Fresh and organic, highly recommend!" },
    { id: "2", user: "Buyer67890", date: "1 month ago", rating: 4, comment: "Good quality but a bit pricey." },
  ];

  useEffect(() => {
    fetchProduct();
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      setBuyerId(user.userId);
      setBuyerName(user.fullName);
    } catch (err) {
      console.log("Failed to load user info", err);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      const prod = data.find((p: any) => String(p.id) === String(id));
      setProduct(prod);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Show modal
  const openModal = (mode: "cart" | "buynow") => {
    setModalMode(mode);
    setQuantity(1);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setModalVisible(false));
  };

  const handleConfirm = async () => {
    if (!product) return;

    if (modalMode === "cart") {
      if (!buyerId || !buyerName) {
        Alert.alert("Error", "You must be logged in to add items to cart.");
        return;
      }
      try {
        await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerId,
            buyerName,
            farmName: product.farmName,
            farmerId: product.farmerId,
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          }),
        });
        Alert.alert("Added to Cart", `${product.name} x${quantity} added.`);
      } catch (err) {
        Alert.alert("Error", "Failed to add to cart.");
      }
      closeModal();
      return;
    }

    // Buy Now
    if (!buyerId) return;

    const itemsToCheckout = [
      {
        farmName: product.farmName,
        farmerId: product.farmerId,
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          },
        ],
      },
    ];

    closeModal();
    router.push({
      pathname: "/buyer/checkout",
      params: { items: JSON.stringify(itemsToCheckout), buyerId },
    });
  };

  if (loading)
    return <ActivityIndicator size="large" color="#16a34a" className="flex-1 justify-center items-center" />;
  if (!product) return <Text className="text-center mt-10">Product not found</Text>;

  return (
    <View className="flex-1 bg-white">
      {/* Image with back button */}
      <View className="relative">
        <Image source={{ uri: product.image }} className="w-full h-80" resizeMode="cover" />
        <TouchableOpacity
          className="absolute top-12 left-4 bg-white rounded-full p-2 shadow-md"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tab Switch */}
      <View className="flex-row self-center bg-gray-100 rounded-full p-1 mt-2">
        <TouchableOpacity
          onPress={() => setActiveTab("details")}
          className={`px-6 py-2 rounded-full ${activeTab === "details" ? "bg-green-700" : ""}`}
        >
          <Text className={`font-semibold text-sm ${activeTab === "details" ? "text-white" : "text-gray-500"}`}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("reviews")}
          className={`px-6 py-2 rounded-full ${activeTab === "reviews" ? "bg-green-700" : ""}`}
        >
          <Text className={`font-semibold text-sm ${activeTab === "reviews" ? "text-white" : "text-gray-500"}`}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Details / Reviews */}
      {activeTab === "details" && (
        <View className="p-4">
          <Text className="text-2xl font-bold">{product.name}</Text>
          <Text className="text-gray-500 mt-1">{product.farmName}</Text>
          <Text className="text-green-700 font-bold text-xl mt-2">{product.price}</Text>
          <Text className="text-gray-400 mt-1">{product.stock} available</Text>
          <Text className="mt-3 text-gray-600">{product.description}</Text>
        </View>
      )}
      {activeTab === "reviews" && (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
          renderItem={({ item }) => (
            <View className="bg-gray-100 rounded-xl p-4 mb-4">
              <Text className="font-bold">{item.user}</Text>
              <Text className="text-gray-400 text-sm">{item.date}</Text>
              <Text className="text-yellow-500 mt-1">{"⭐".repeat(item.rating)}</Text>
              <Text className="mt-2">{item.comment}</Text>
            </View>
          )}
        />
      )}

      {/* Bottom action bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row bg-white border-t border-gray-100 p-4 items-center">
        <View className="flex-row items-center">
          <TouchableOpacity className="items-center mr-5" onPress={() => Alert.alert("View shop profile")}>
            <MaterialIcons name="storefront" size={24} color="#15803d" />
            <Text className="text-xs mt-1 text-center">Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center" onPress={() => Alert.alert("Message farmer")}>
            <AntDesign name="message" size={20} color="#15803d" />
            <Text className="text-xs mt-1 text-center">Message</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-1 ml-4 items-center">
          <TouchableOpacity
            onPress={() => openModal("cart")}
            className="px-4 py-4 rounded-xl items-center justify-center bg-green-100"
          >
            <FontAwesome5 name="cart-plus" size={20} color="#16a34a" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openModal("buynow")}
            className="flex-1 bg-green-800 py-4 rounded-xl items-center justify-center ml-3"
          >
            <Text className="text-white font-bold text-center">Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Modal */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <Animated.View className="flex-1 bg-black/50" style={{ opacity: fadeAnim }}>
          <TouchableOpacity className="flex-1" onPress={closeModal} />
        </Animated.View>

        <Animated.View className="bg-white rounded-t-3xl p-6 absolute bottom-0 w-full" style={{ transform: [{ translateY: slideAnim }] }}>
          <View className="w-16 h-1.5 bg-gray-300 rounded-full self-center mb-4" />

          <View className="flex-row items-center mb-4">
            <Image source={{ uri: product.image }} className="w-24 h-24 rounded-xl mr-4" />
            <View className="flex-1">
              <Text className="font-bold text-lg">{product.name}</Text>
              <Text className="text-green-700 font-bold mt-1">₱{product.price}</Text>
              <Text className="text-gray-400 text-sm mt-1">Stock: {product.stock}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-100 rounded-lg justify-center items-center mr-2"
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#16a34a"} />
              </TouchableOpacity>
              <Text className="text-lg font-bold">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 bg-gray-100 rounded-lg justify-center items-center ml-2"
              >
                <Ionicons name="add" size={20} color={quantity >= product.stock ? "#ccc" : "#16a34a"} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="font-semibold">Total Price</Text>
            <Text className="text-green-700 font-bold text-lg">₱{Number(product.price.replace("₱","")) * quantity}</Text>
          </View>

          <TouchableOpacity className="bg-green-700 py-4 rounded-xl items-center justify-center flex-row" onPress={handleConfirm}>
            <Text className="text-white font-bold text-lg">{modalMode === "cart" ? "Add to Cart" : "Buy Now"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
}