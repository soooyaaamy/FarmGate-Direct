import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useRef } from "react";
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

const API_URL = "http://192.168.8.19:5000";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const buyerIdRef = useRef<string | null>(null);

  // Load user then fetch cart — runs every time screen is focused
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const init = async () => {
        setLoading(true);
        try {
          const userString = await AsyncStorage.getItem("user");
          if (!userString) { router.replace("/login"); return; }

          const user = JSON.parse(userString);
          const id = user.userId;
          buyerIdRef.current = id;

          const res = await fetch(`${API_URL}/cart/${id}`);
          if (!res.ok) throw new Error("Failed to fetch cart");
          const data = await res.json();

          if (!cancelled) setCartItems(data?.farmers || []);
        } catch (err) {
          console.error(err);
          if (!cancelled) Alert.alert("Error", "Could not load your cart.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      init();
      return () => { cancelled = true; };
    }, [])
  );

  // Selection helpers
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const toggleFarmSelection = (farmerId: string) => {
    const farmProductIds =
      cartItems.find(f => f.farmerId === farmerId)?.products.map((p: any) => p.id) || [];
    setSelectedItems(prev => {
      const copy = new Set(prev);
      const allSelected = farmProductIds.every((id: string) => copy.has(id));
      allSelected
        ? farmProductIds.forEach((id: string) => copy.delete(id))
        : farmProductIds.forEach((id: string) => copy.add(id));
      return copy;
    });
  };

  // Quantity helpers
  const updateLocalQty = (farmerId: string, productId: string, qty: number) => {
    setCartItems(prev =>
      prev.map(f =>
        f.farmerId === farmerId
          ? { ...f, products: f.products.map((p: any) => p.id === productId ? { ...p, quantity: qty } : p) }
          : f
      )
    );
  };

  const syncQtyToBackend = async (farmerId: string, productId: string, newQty: number, rollbackQty: number) => {
    const buyerId = buyerIdRef.current;
    if (!buyerId) return;
    try {
      const res = await fetch(`${API_URL}/cart/${buyerId}/${farmerId}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (!res.ok) throw new Error();
    } catch {
      updateLocalQty(farmerId, productId, rollbackQty);
      Alert.alert("Error", "Could not update quantity.");
    }
  };

  const incrementQty = (farmerId: string, productId: string) => {
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find((p: any) => p.id === productId);
    if (!product) return;
    const newQty = product.quantity + 1;
    updateLocalQty(farmerId, productId, newQty);
    syncQtyToBackend(farmerId, productId, newQty, product.quantity);
  };

  const decrementQty = (farmerId: string, productId: string) => {
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find((p: any) => p.id === productId);
    if (!product) return;
    if (product.quantity <= 1) { removeItem(farmerId, productId); return; }
    const newQty = product.quantity - 1;
    updateLocalQty(farmerId, productId, newQty);
    syncQtyToBackend(farmerId, productId, newQty, product.quantity);
  };

  const removeItem = async (farmerId: string, productId: string) => {
    const buyerId = buyerIdRef.current;
    if (!buyerId) return;
    const backupCart = [...cartItems];
    setCartItems(prev =>
      prev
        .map(f => f.farmerId === farmerId ? { ...f, products: f.products.filter((p: any) => p.id !== productId) } : f)
        .filter(f => f.products.length > 0)
    );
    setSelectedItems(prev => { const copy = new Set(prev); copy.delete(productId); return copy; });

    try {
      const res = await fetch(`${API_URL}/cart/${buyerId}/${farmerId}/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setCartItems(backupCart);
      Alert.alert("Error", "Could not remove item.");
    }
  };

  // Safe price parser — handles both number and "₱10.00" string
  const parsePrice = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
    return 0;
  };

  const totalPrice = cartItems.reduce((acc, farm) => {
    return acc + farm.products.reduce((sum: number, p: any) => {
      return selectedItems.has(p.id) ? sum + parsePrice(p.price) * p.quantity : sum;
    }, 0);
  }, 0);

  const handleCheckout = () => {
    const buyerId = buyerIdRef.current;
    if (!buyerId) { Alert.alert("Error", "Buyer not logged in."); return; }
    if (selectedItems.size === 0) { Alert.alert("No items selected", "Please select at least one item to checkout."); return; }

    const itemsToCheckout = cartItems
      .map(farm => ({
        farmerId: farm.farmerId,
        farmName: farm.farmName,
        products: farm.products.filter((p: any) => selectedItems.has(p.id)),
      }))
      .filter(f => f.products.length > 0);

    router.push({
      pathname: "/buyer/checkout",
      params: { items: JSON.stringify(itemsToCheckout), buyerId },
    });
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{
          backgroundColor: "#15803d",
          paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
          flexDirection: "row", alignItems: "center", gap: 12,
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>My Cart</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingHorizontal: 40 }}>
          <Ionicons name="cart-outline" size={52} color="#d1d5db" />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#374151" }}>Your cart is empty</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 18 }}>
            Add items from a farm to get started.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Header */}
      <View style={{
        backgroundColor: "#15803d",
        paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 12,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>My Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={f => f.farmerId}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: farm }) => (
          <View style={{ marginBottom: 24 }}>

            {/* Farm row */}
            <TouchableOpacity
              onPress={() => toggleFarmSelection(farm.farmerId)}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                borderWidth: 2, borderColor: "#d1d5db",
                justifyContent: "center", alignItems: "center",
              }}>
                {farm.products.every((p: any) => selectedItems.has(p.id)) && (
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#15803d" }} />
                )}
              </View>
              <Ionicons name="storefront-outline" size={16} color="#6b7280" />
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{farm.farmName}</Text>
            </TouchableOpacity>

            {/* Products */}
            {farm.products.map((p: any) => (
              <View key={p.id} style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#f9fafb", borderRadius: 14,
                padding: 12, marginBottom: 10, gap: 10,
              }}>
                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleItemSelection(p.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 11,
                    borderWidth: 2, borderColor: "#d1d5db",
                    justifyContent: "center", alignItems: "center",
                  }}
                >
                  {selectedItems.has(p.id) && (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#15803d" }} />
                  )}
                </TouchableOpacity>

                {/* Image */}
                <View style={{
                  width: 72, height: 72, borderRadius: 10,
                  backgroundColor: "#e5e7eb", overflow: "hidden",
                }}>
                  <Image
                    source={{ uri: p.image }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#15803d", fontWeight: "600", marginTop: 2 }}>
                    ₱{parsePrice(p.price).toFixed(2)}
                  </Text>

                  {/* Qty controls */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => decrementQty(farm.farmerId, p.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: "#e5e7eb",
                        justifyContent: "center", alignItems: "center",
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#374151" />
                    </TouchableOpacity>

                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827", minWidth: 20, textAlign: "center" }}>
                      {p.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => incrementQty(farm.farmerId, p.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: "#e5e7eb",
                        justifyContent: "center", alignItems: "center",
                      }}
                    >
                      <Ionicons name="add" size={16} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => removeItem(farm.farmerId, p.id)}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />

      {/* Bottom bar */}
      <View style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1, borderTopColor: "#f0f0f0",
        paddingHorizontal: 20, paddingVertical: 14,
        flexDirection: "row", alignItems: "center",
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
            ₱{totalPrice.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#15803d",
            paddingVertical: 12, paddingHorizontal: 28,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            Checkout ({selectedItems.size})
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}