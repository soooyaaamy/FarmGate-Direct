import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated, Image, Modal, Text, TextInput,
  TouchableOpacity, useWindowDimensions, View, ScrollView,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { productStore, Product } from "../../../store/productStore";

type Category = "All" | "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";
const CATEGORIES: Category[] = ["All", "Vegetables", "Fruits", "Egg & Poultry", "Rice"];

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const DeleteModal = ({
  visible, productName, onConfirm, onCancel,
}: {
  visible: boolean; productName: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
    <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} activeOpacity={1} onPress={onCancel} />
    <View style={{ backgroundColor: "#166534", paddingTop: 24, paddingHorizontal: 20, paddingBottom: 8 }}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
          <FontAwesome5 name="trash-alt" size={26} color="#fca5a5" />
        </View>
      </View>
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>Delete Product?</Text>
      <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, textAlign: "center", marginBottom: 4 }}>You are about to delete:</Text>
      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
  {`"${productName}"`}
</Text>
    </View>
    <View style={{ backgroundColor: "#f3f4f6", borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, marginTop: -2 }}>
      <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
        This will permanently remove the product from your listing. This cannot be undone.
      </Text>
      <TouchableOpacity onPress={onConfirm} style={{ backgroundColor: "#ef4444", borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Yes, Delete Product</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel} style={{ backgroundColor: "#fff", borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 16 }}>
        <Text style={{ color: "#6b7280", fontSize: 16, fontWeight: "700" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({
  product, onEdit, onDelete,
}: {
  product: Product; onEdit: () => void; onDelete: () => void;
}) => {
  const swipeableRef = useRef<Swipeable>(null);
  const stockPct = Math.min((product.stock / product.maxStock) * 100, 100);
  const isLow = stockPct <= 20;
  const dragX = useRef(new Animated.Value(0)).current;

  const cardBg = dragX.interpolate({
    inputRange: [-120, -1, 0, 1, 120],
    outputRange: ["#fecaca", "#fecaca", isLow ? "#fffbeb" : "#ffffff", "#bfdbfe", "#bfdbfe"],
    extrapolate: "clamp",
  });

  const renderRightActions = () => (
    <View style={{ width: 100, justifyContent: "center", alignItems: "center", backgroundColor: "#ef4444" }}>
      <FontAwesome5 name="trash" size={22} color="white" />
      <Text style={{ color: "white", fontSize: 12, fontWeight: "700", marginTop: 5 }}>Delete</Text>
    </View>
  );

  const renderLeftActions = () => (
    <View style={{ width: 100, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" }}>
      <FontAwesome5 name="pen" size={22} color="white" />
      <Text style={{ color: "white", fontSize: 12, fontWeight: "700", marginTop: 5 }}>Edit</Text>
    </View>
  );

  return (
    <View style={{ borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableOpen={(direction) => {
          swipeableRef.current?.close();
          if (direction === "left") onEdit();
          else if (direction === "right") onDelete();
        }}
        onSwipeableWillOpen={(direction) => {
          Animated.spring(dragX, { toValue: direction === "left" ? 120 : -120, useNativeDriver: false }).start();
        }}
        onSwipeableClose={() => {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: false }).start();
        }}
        containerStyle={{ borderRadius: 16, overflow: "hidden" }}
      >
        <Animated.View style={{ backgroundColor: cardBg, borderColor: "#f3f4f6", borderWidth: 1, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
            {product.image ? (
              <Image source={typeof product.image === "string" ? { uri: product.image } : product.image} style={{ width: 64, height: 64, borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons name="camera-outline" size={24} color="#9BB09E" />
                <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 4, fontWeight: "500" }}>No photo</Text>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                {product.category as string}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{product.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>₱{product.price}</Text>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>/{product.unit}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                <View style={{ flex: 1, height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                  <View style={{ width: `${stockPct}%`, height: "100%", borderRadius: 3, backgroundColor: isLow ? "#f59e0b" : "#15803d" }} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "600", color: isLow ? "#b45309" : "#6b7280" }}>
                  {product.stock} {product.unit} left
                </Text>
              </View>
              {isLow && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "#fed7aa", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <FontAwesome5 name="exclamation-triangle" size={9} color="#b45309" />
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#b45309" }}>Restock needed</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingBottom: 8, gap: 4 }}>
            <MaterialCommunityIcons name="gesture-swipe" size={12} color="#d1d5db" />
            <Text style={{ fontSize: 10, color: "#d1d5db", fontWeight: "500" }}>Swipe right to edit · Swipe left to delete</Text>
          </View>
        </Animated.View>
      </Swipeable>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ProductListingScreen = () => {
  const router = useRouter();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  const [products, setProducts] = useState<Product[]>([...productStore]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; id: string; name: string }>({ visible: false, id: "", name: "" });

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: "clamp" });
  const headerTranslate = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, -20], extrapolate: "clamp" });

  // ── Refresh list when screen is focused (after add/edit) ──────────────────
  useFocusEffect(
    useCallback(() => {
      setProducts([...productStore]);
    }, [])
  );

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.stock > 0).length;
  const lowStockCount = products.filter((p) => (p.stock / p.maxStock) * 100 <= 20).length;
  const categoryCount = (cat: Category) => cat === "All" ? products.length : products.filter((p) => p.category === cat).length;

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEdit = (id: string) => router.push(`/farmer/products/edit-product?id=${id}` as any);

  const handleDeletePress = (id: string, name: string) => setDeleteModal({ visible: true, id, name });

  const handleConfirmDelete = () => {
    const idx = productStore.findIndex((p) => p.id === deleteModal.id);
    if (idx !== -1) productStore.splice(idx, 1);
    setProducts([...productStore]);
    setDeleteModal({ visible: false, id: "", name: "" });
  };

  return (
    <View className="flex-1 bg-green-800">
      <DeleteModal
        visible={deleteModal.visible}
        productName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, id: "", name: "" })}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        <View style={{ paddingTop: STATUS_BAR + 16 }} className="bg-green-800 px-5 pb-8">
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}>
            <View className="flex-row items-start justify-between mb-5">
              <View>
                <Text className="text-white font-bold text-[26px] leading-tight">Product Listing</Text>
                <Text className="text-white/60 text-[13px] mt-1">Manage your farm products</Text>
              </View>
              <TouchableOpacity
                className="w-11 h-11 rounded-full bg-white items-center justify-center"
                onPress={() => router.push("/farmer/products/add-product" as any)}
              >
                <FontAwesome5 name="plus" size={16} color="#15803d" />
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-white rounded-2xl p-3">
                <Text className="text-green-800 font-bold text-[22px] leading-tight">{totalProducts}</Text>
                <Text className="text-gray-500 text-[10px] font-medium mt-0.5">Total Products</Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl p-3">
                <Text className="text-green-800 font-bold text-[22px] leading-tight">{activeProducts}</Text>
                <Text className="text-gray-500 text-[10px] font-medium mt-0.5">Active</Text>
              </View>
              <View className="flex-1 bg-white rounded-2xl p-3">
                <Text className="text-amber-500 font-bold text-[22px] leading-tight">{lowStockCount}</Text>
                <Text className="text-amber-400 text-[10px] font-medium mt-0.5">Low Stock</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View className="bg-gray-100 rounded-t-[35px] px-4 pt-5" style={{ minHeight: SCREEN_HEIGHT, marginTop: -20 }}>
          <View className="bg-white rounded-2xl border border-gray-100 flex-row items-center gap-2 px-4 h-11 mb-4">
            <FontAwesome5 name="search" size={13} color="#9BB09E" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search products..."
              placeholderTextColor="#B0C4B4"
              className="flex-1 text-[13px] text-gray-800"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <FontAwesome5 name="times-circle" size={14} color="#9BB09E" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingRight: 4, alignItems: "center" }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, height: 36, borderWidth: 1.5, borderColor: isActive ? "#15803d" : "#e5e7eb", backgroundColor: isActive ? "#15803d" : "#ffffff" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: isActive ? "#ffffff" : "#6b7280" }}>{cat}</Text>
                  <View style={{ borderRadius: 20, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#f0fdf4" }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: isActive ? "#ffffff" : "#15803d" }}>{categoryCount(cat)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                <MaterialCommunityIcons name="package-variant" size={28} color="#15803d" />
              </View>
              <Text className="text-[16px] font-bold text-gray-600 mb-1">No products found</Text>
              <Text className="text-[13px] text-gray-400 text-center">Try a different category or search term.</Text>
            </View>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product.id)}
                onDelete={() => handleDeletePress(product.id, product.name)}
              />
            ))
          )}
          <View className="h-28" />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ProductListingScreen;