import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://192.168.8.7:5000";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [buyerId, setBuyerId] = useState<string | null>(null);

  // Load logged-in user
  const loadUser = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        router.replace("/login");
        return;
      }
      const user = JSON.parse(userString);
      setBuyerId(user.userId);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!buyerId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cart/${buyerId}`);
      const data = await res.json();
      setCartItems(data?.farmers || []); // adjust to backend response
    } catch (err) {
      console.log(err);
      Alert.alert("Error fetching cart");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [buyerId])
  );

  // Toggle selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const toggleFarmSelection = (farmerId: string) => {
    const farmProducts =
      cartItems.find(f => f.farmerId === farmerId)?.products.map(p => p.id) || [];
    setSelectedItems(prev => {
      const copy = new Set(prev);
      const allSelected = farmProducts.every(id => copy.has(id));
      allSelected
        ? farmProducts.forEach(id => copy.delete(id))
        : farmProducts.forEach(id => copy.add(id));
      return copy;
    });
  };

  // Update local quantity
  const updateLocalQty = (farmerId: string, productId: string, qty: number) => {
    setCartItems(prev =>
      prev.map(f =>
        f.farmerId === farmerId
          ? {
              ...f,
              products: f.products.map(p => (p.id === productId ? { ...p, quantity: qty } : p)),
            }
          : f
      )
    );
  };

  const incrementQty = async (farmerId: string, productId: string) => {
    if (!buyerId) return;
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find(p => p.id === productId);
    if (!product) return;
    const newQty = product.quantity + 1;
    updateLocalQty(farmerId, productId, newQty);

    try {
      const res = await fetch(`${API_URL}/cart/${buyerId}/${farmerId}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
    } catch {
      updateLocalQty(farmerId, productId, product.quantity);
      Alert.alert("Error updating quantity");
    }
  };

  const decrementQty = async (farmerId: string, productId: string) => {
    if (!buyerId) return;
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find(p => p.id === productId);
    if (!product) return;

    if (product.quantity <= 1) {
      removeItem(farmerId, productId);
    } else {
      const newQty = product.quantity - 1;
      updateLocalQty(farmerId, productId, newQty);

      try {
        const res = await fetch(`${API_URL}/cart/${buyerId}/${farmerId}/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQty }),
        });
        if (!res.ok) throw new Error("Failed to update quantity");
      } catch {
        updateLocalQty(farmerId, productId, product.quantity);
        Alert.alert("Error updating quantity");
      }
    }
  };

  const removeItem = async (farmerId: string, productId: string) => {
    if (!buyerId) return;
    const backupCart = [...cartItems];
    setCartItems(prev =>
      prev
        .map(f =>
          f.farmerId === farmerId ? { ...f, products: f.products.filter(p => p.id !== productId) } : f
        )
        .filter(f => f.products.length > 0)
    );
    setSelectedItems(prev => {
      const copy = new Set(prev);
      copy.delete(productId);
      return copy;
    });

    try {
      const res = await fetch(`${API_URL}/cart/${buyerId}/${farmerId}/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
    } catch {
      setCartItems(backupCart);
      Alert.alert("Error removing item");
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((acc, farm) => {
    const farmTotal = farm.products.reduce((sum, p) => {
      if (selectedItems.has(p.id)) return sum + parseFloat(p.price.replace("₱", "")) * p.quantity;
      return sum;
    }, 0);
    return acc + farmTotal;
  }, 0);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#16a34a"
        className="flex-1 justify-center items-center"
      />
    );

  if (cartItems.length === 0)
    return (
      <Text className="text-center mt-10 text-gray-500">
        Your cart is empty
      </Text>
    );

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="bg-green-500 px-6 py-4 pt-16 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg ml-4">My Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={f => f.farmerId}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        renderItem={({ item: farm }) => (
          <View className="mb-6">
            {/* Farm Header */}
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                onPress={() => toggleFarmSelection(farm.farmerId)}
                className="w-6 h-6 border-2 border-gray-400 rounded-full justify-center items-center mr-3"
              >
                {farm.products.every(p => selectedItems.has(p.id)) && (
                  <View className="w-4 h-4 bg-green-500 rounded-full" />
                )}
              </TouchableOpacity>
              <Text className="font-bold text-lg">{farm.farmName}</Text>
            </View>

            {farm.products.map(p => (
              <View
                key={p.id}
                className="flex-row bg-gray-100 rounded-xl p-4 mb-4 items-center h-32"
              >
                <TouchableOpacity
                  onPress={() => toggleItemSelection(p.id)}
                  className="w-6 h-6 border-2 border-gray-400 rounded-full justify-center items-center mr-3"
                >
                  {selectedItems.has(p.id) && (
                    <View className="w-4 h-4 bg-green-500 rounded-full" />
                  )}
                </TouchableOpacity>

                <View className="bg-gray-200 rounded-lg w-24 h-full justify-center items-center">
                  <Image
                    source={{ uri: p.image }}
                    className="w-full h-full object-contain"
                  />
                </View>

                <View className="flex-1 ml-4 justify-center">
                  <Text className="font-bold text-lg">{p.name}</Text>
                  <Text className="text-green-700 font-semibold mt-1">{p.price}</Text>

                  <View className="flex-row mt-2 items-center">
                    <TouchableOpacity
                      onPress={() => decrementQty(farm.farmerId, p.id)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text className="mx-3">{p.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => incrementQty(farm.farmerId, p.id)}
                      className="bg-gray-300 px-2 py-1 rounded"
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      />

     {/* Bottom action bar */}
<View className="absolute bottom-[60px] left-0 right-0 bg-white border-t border-gray-200 p-4 flex-row items-center">
  <View className="flex-1">
    <Text className="text-lg font-bold">Total: ₱{totalPrice.toFixed(2)}</Text>
  </View>

  <TouchableOpacity
    onPress={() => {
      if (!buyerId) {
        Alert.alert("Error", "Buyer not logged in");
        return;
      }

      if (selectedItems.size === 0) {
        Alert.alert("Select items", "Please select at least one item to checkout");
        return;
      }

      // Prepare selected items for checkout
      const itemsToCheckout = cartItems
        .map(farm => ({
          farmerId: farm.farmerId,
          farmName: farm.farmName,
          products: farm.products.filter(p => selectedItems.has(p.id)),
        }))
        .filter(f => f.products.length > 0);

      // Navigate to Checkout screen with selected items
      router.push({
        pathname: "/buyer/checkout",
        params: { items: JSON.stringify(itemsToCheckout), buyerId }
      });
      console.log(JSON.stringify(itemsToCheckout));
    }}
    className="bg-green-700 px-6 py-3 rounded-xl ml-4"
  >
    <Text className="text-white font-bold text-center">Checkout</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}