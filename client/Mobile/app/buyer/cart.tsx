import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CartFarmGroup,
  getCart,
  removeFromCart,
  updateCartQty,
} from "@/lib/store";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartFarmGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        const cart = await getCart();
        if (!cancelled) setCartItems(cart);
        if (!cancelled) setLoading(false);
      })();
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
      cartItems.find(f => f.farmerId === farmerId)?.products.map(p => p.id) || [];
    setSelectedItems(prev => {
      const copy = new Set(prev);
      const allSelected = farmProductIds.every(id => copy.has(id));
      allSelected
        ? farmProductIds.forEach(id => copy.delete(id))
        : farmProductIds.forEach(id => copy.add(id));
      return copy;
    });
  };

  // Quantity helpers — optimistic UI, then persisted to AsyncStorage
  const incrementQty = async (farmerId: string, productId: string) => {
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find(p => p.id === productId);
    if (!product) return;
    const newQty = product.quantity + 1;
    setCartItems(prev =>
      prev.map(f => f.farmerId === farmerId
        ? { ...f, products: f.products.map(p => p.id === productId ? { ...p, quantity: newQty } : p) }
        : f
      )
    );
    await updateCartQty(farmerId, productId, newQty);
  };

  const decrementQty = async (farmerId: string, productId: string) => {
    const product = cartItems.find(f => f.farmerId === farmerId)?.products.find(p => p.id === productId);
    if (!product) return;
    if (product.quantity <= 1) { removeItem(farmerId, productId); return; }
    const newQty = product.quantity - 1;
    setCartItems(prev =>
      prev.map(f => f.farmerId === farmerId
        ? { ...f, products: f.products.map(p => p.id === productId ? { ...p, quantity: newQty } : p) }
        : f
      )
    );
    await updateCartQty(farmerId, productId, newQty);
  };

  const removeItem = async (farmerId: string, productId: string) => {
    setCartItems(prev =>
      prev
        .map(f => f.farmerId === farmerId ? { ...f, products: f.products.filter(p => p.id !== productId) } : f)
        .filter(f => f.products.length > 0)
    );
    setSelectedItems(prev => { const copy = new Set(prev); copy.delete(productId); return copy; });
    await removeFromCart(farmerId, productId);
  };

  const totalPrice = cartItems.reduce((acc, farm) => {
    return acc + farm.products.reduce((sum, p) => {
      return selectedItems.has(p.id) ? sum + p.price * p.quantity : sum;
    }, 0);
  }, 0);

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert("No items selected", "Please select at least one item to checkout.");
      return;
    }

    const itemsToCheckout = cartItems
      .map(farm => ({
        farmerId: farm.farmerId,
        farmName: farm.farmName,
        products: farm.products.filter(p => selectedItems.has(p.id)),
      }))
      .filter(f => f.products.length > 0);

    router.push({
      pathname: "/buyer/checkout",
      params: { items: JSON.stringify(itemsToCheckout) },
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
          paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
          flexDirection: "row", alignItems: "center", gap: 12,
          borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={{ color: "#111827", fontSize: 17, fontWeight: "700" }}>My Cart</Text>
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
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>

      {/* Header */}
      <View style={{
        backgroundColor: "#fff",
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 12,
        borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ color: "#111827", fontSize: 17, fontWeight: "700" }}>My Cart</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={f => f.farmerId}
        contentContainerStyle={{ padding: 12, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: farm }) => (
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            marginBottom: 12,
            overflow: "hidden",
          }}>

            {/* Farm header row */}
            <TouchableOpacity
              onPress={() => toggleFarmSelection(farm.farmerId)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
              }}
            >
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: 2, borderColor: "#d1d5db",
                justifyContent: "center", alignItems: "center",
              }}>
                {farm.products.every(p => selectedItems.has(p.id)) && (
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: "#15803d" }} />
                )}
              </View>
              <Ionicons name="storefront-outline" size={15} color="#15803d" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>{farm.farmName}</Text>
            </TouchableOpacity>

            {/* Products */}
            {farm.products.map((p, idx) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderBottomWidth: idx < farm.products.length - 1 ? 1 : 0,
                  borderBottomColor: "#f5f5f5",
                  gap: 10,
                }}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleItemSelection(p.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    borderWidth: 2, borderColor: "#d1d5db",
                    justifyContent: "center", alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  {selectedItems.has(p.id) && (
                    <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: "#15803d" }} />
                  )}
                </TouchableOpacity>

                {/* Image */}
                <View style={{
                  width: 80, height: 80, borderRadius: 10,
                  backgroundColor: "#f3f4f6", overflow: "hidden",
                }}>
                  <Image
                    source={typeof p.image === "string" ? { uri: p.image } : p.image}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Info column */}
                <View style={{ flex: 1, justifyContent: "space-between", minHeight: 80 }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }} numberOfLines={2}>
                      {p.name}
                    </Text>

                    {/* Freshness tag */}
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 4,
                      marginTop: 4, alignSelf: "flex-start",
                      backgroundColor: p.isFresh ? "#f0fdf4" : "#f3f4f6",
                      paddingHorizontal: 6, paddingVertical: 2,
                      borderRadius: 6,
                    }}>
                      <Ionicons
                        name={p.isFresh ? "leaf" : "time-outline"}
                        size={10}
                        color={p.isFresh ? "#15803d" : "#9ca3af"}
                      />
                      <Text style={{
                        fontSize: 10, fontWeight: "600",
                        color: p.isFresh ? "#15803d" : "#9ca3af",
                      }}>
                        {p.isFresh ? "Fresh" : "Not fresh"}
                      </Text>
                    </View>
                  </View>

                  {/* Price row */}
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>
                    ₱{p.price.toFixed(2)} <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "500" }}>/{p.unit}</Text>
                  </Text>
                </View>

                {/* Right column: delete on top, stepper below */}
                <View style={{ alignItems: "flex-end", justifyContent: "space-between", minHeight: 80 }}>
                  <TouchableOpacity
                    onPress={() => removeItem(farm.farmerId, p.id)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={17} color="#9ca3af" />
                  </TouchableOpacity>

                  <View style={{
                    flexDirection: "row", alignItems: "center",
                    borderWidth: 1, borderColor: "#e5e7eb",
                    borderRadius: 8, overflow: "hidden",
                  }}>
                    <TouchableOpacity
                      onPress={() => decrementQty(farm.farmerId, p.id)}
                      style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}
                    >
                      <Ionicons name="remove" size={14} color="#374151" />
                    </TouchableOpacity>

                    <Text style={{
                      fontSize: 12, fontWeight: "700", color: "#111827",
                      minWidth: 24, textAlign: "center",
                      borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#e5e7eb",
                      paddingVertical: 5,
                    }}>
                      {p.quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => incrementQty(farm.farmerId, p.id)}
                      style={{ width: 26, height: 26, justifyContent: "center", alignItems: "center" }}
                    >
                      <Ionicons name="add" size={14} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
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
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>
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