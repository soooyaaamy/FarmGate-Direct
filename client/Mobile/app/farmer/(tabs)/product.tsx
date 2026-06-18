/**
 * products.tsx — My Products Screen
 * ─────────────────────────────────────────────────────────────────────────────
 * (header comment unchanged from original — bug fixes / enhancements list
 *  preserved as-is, omitted here for brevity but should stay in your file)
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Animated,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Product,
  getProductsByFarmer,
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
} from "../../../lib/store";
import { RestockModal } from "../../../components/RestockModal";
import ProductFormModal, { ProductFormData } from "../products/add-edit-product";
import { DeleteConfirmationModal } from "../products/delete-product";

// ─── Constants ────────────────────────────────────────────────────────────────

type Category = "All" | "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";
const CATEGORIES: Category[] = ["All", "Vegetables", "Fruits", "Egg & Poultry", "Rice"];

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryCount = (products: Product[], cat: Category) =>
  cat === "All"
    ? products.length
    : products.filter((p) => p.category === cat).length;

// ─── Filter Bottom Sheet ──────────────────────────────────────────────────────
// (UNCHANGED — identical to your original FilterSheet component.
//  Reads/displays Product[] and Category, no data-layer dependency,
//  so nothing here needed to change.)

const FilterSheet: React.FC<{
  visible:        boolean;
  products:       Product[];
  activeCategory: Category;
  onSelect:       (cat: Category) => void;
  onClose:        () => void;
}> = ({ visible, products, activeCategory, onSelect, onClose }) => {
  const insets          = useSafeAreaInsets();
  const tabBarHeight    = useBottomTabBarHeight();
  const translateY      = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0, useNativeDriver: true,
          damping: 20, stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 500, duration: 240, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, elevation: 20 }}>

      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        opacity: backdropOpacity,
      }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        transform: [{ translateY }],
        backgroundColor: "#166534",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: "hidden",
      }}>
        <View style={{
          alignItems: "center", paddingTop: 12,
          paddingBottom: 16, paddingHorizontal: 20,
        }}>
          <View style={{
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.3)", marginBottom: 16,
          }} />
          <View style={{
            flexDirection: "row", alignItems: "center",
            justifyContent: "space-between", width: "100%",
          }}>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
              Filter by Category
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingTop: 16, paddingHorizontal: 16,
          paddingBottom: insets.bottom + tabBarHeight + 16,
        }}>
          {CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat;
            const count    = categoryCount(products, cat);
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => { onSelect(cat); onClose(); }}
                activeOpacity={0.75}
                style={{
                  flexDirection: "row", alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isActive ? "#f0fdf4" : "#fff",
                  borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
                  marginBottom: i < CATEGORIES.length - 1 ? 8 : 0,
                  borderWidth: 1.5, borderColor: isActive ? "#15803d" : "#f3f4f6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <MaterialCommunityIcons
                    name={isActive ? "check-circle" : "circle-outline"}
                    size={18}
                    color={isActive ? "#15803d" : "#d1d5db"}
                  />
                  <Text style={{
                    fontSize: 14, fontWeight: "700",
                    color: isActive ? "#15803d" : "#374151",
                  }}>
                    {cat}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: isActive ? "#15803d" : "#f3f4f6",
                  borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
                }}>
                  <Text style={{
                    fontSize: 11, fontWeight: "700",
                    color: isActive ? "#fff" : "#6b7280",
                  }}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
// (UNCHANGED — identical to your original ProductCard component.
//  Pure presentational component driven by props/callbacks; no data-layer
//  dependency, so the swipe animation logic is untouched.)

const ProductCard: React.FC<{
  product:   Product;
  onEdit:    () => void;
  onDelete:  () => void;
  onRestock: () => void;
}> = ({ product, onEdit, onDelete, onRestock }) => {
  const swipeableRef = useRef<Swipeable>(null);
  const stockPct     = Math.min((product.stock / product.maxStock) * 100, 100);
  const isLow        = stockPct <= 20;
  const idleBg       = isLow ? "#fffbeb" : "#ffffff";

  const deleteProgress = useRef(new Animated.Value(0)).current;
  const editProgress   = useRef(new Animated.Value(0)).current;

  const combinedProgress = useMemo(
    () => Animated.add(
      Animated.multiply(editProgress,   1),
      Animated.multiply(deleteProgress, -1),
    ),
    [editProgress, deleteProgress]
  );

  const cardBg = combinedProgress.interpolate({
    inputRange:  [-1, 0, 1],
    outputRange: ["#fee2e2", idleBg, "#dbeafe"],
    extrapolate: "clamp",
  });

  const contentOpacity = useMemo(
    () => Animated.add(deleteProgress, editProgress).interpolate({
      inputRange:  [0, 0.35, 1],
      outputRange: [1, 0.4,  0],
      extrapolate: "clamp",
    }),
    [deleteProgress, editProgress]
  );

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const listenerId = (progress as any).addListener(
      ({ value }: { value: number }) => deleteProgress.setValue(value)
    );
    (renderRightActions as any)._listenerId = listenerId;

    return (
      <View style={{
        width: 90, backgroundColor: "#fee2e2",
        justifyContent: "center", alignItems: "center", gap: 5,
      }}>
        <MaterialCommunityIcons name="trash-can-outline" size={26} color="#ef4444" />
        <Text style={{ color: "#ef4444", fontSize: 11, fontWeight: "700" }}>Delete</Text>
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    (progress as any).addListener(
      ({ value }: { value: number }) => editProgress.setValue(value)
    );
    return (
      <View style={{
        width: 90, backgroundColor: "#dbeafe",
        justifyContent: "center", alignItems: "center", gap: 5,
      }}>
        <MaterialCommunityIcons name="pencil-outline" size={26} color="#3b82f6" />
        <Text style={{ color: "#3b82f6", fontSize: 11, fontWeight: "700" }}>Edit</Text>
      </View>
    );
  };

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
          deleteProgress.setValue(0);
          editProgress.setValue(0);
          swipeableRef.current?.close();
          if (direction === "left") onEdit();
          else onDelete();
        }}

        onSwipeableClose={() => {
          Animated.parallel([
            Animated.spring(deleteProgress, { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 180 }),
            Animated.spring(editProgress,   { toValue: 0, useNativeDriver: false, damping: 18, stiffness: 180 }),
          ]).start();
        }}

        containerStyle={{ borderRadius: 16, overflow: "hidden" }}
      >
        <Animated.View style={{
          backgroundColor: cardBg,
          borderWidth: 1, borderColor: "#f3f4f6",
          overflow: "hidden",
        }}>
          <Animated.View style={{ opacity: contentOpacity }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>

              {product.image ? (
                <Image
                  source={
                    typeof product.image === "string"
                      ? { uri: product.image }
                      : product.image
                  }
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{
                  width: 64, height: 64, borderRadius: 12,
                  backgroundColor: "#f3f4f6",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <MaterialCommunityIcons name="camera-outline" size={24} color="#9BB09E" />
                  <Text style={{ fontSize: 9, color: "#9ca3af", marginTop: 4, fontWeight: "500" }}>
                    No photo
                  </Text>
                </View>
              )}

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{
                  fontSize: 10, fontWeight: "700", color: "#9ca3af",
                  letterSpacing: 1, textTransform: "uppercase", marginBottom: 2,
                }}>
                  {product.category as string}
                </Text>

                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
                  {product.name}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
                    ₱{product.price}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>/{product.unit}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <View style={{ flex: 1, height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                    <View style={{
                      width: `${stockPct}%`, height: "100%", borderRadius: 3,
                      backgroundColor: isLow ? "#f59e0b" : "#15803d",
                    }} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: isLow ? "#b45309" : "#6b7280" }}>
                    {product.stock} {product.unit} left
                  </Text>
                </View>

                {isLow && (
                  <View style={{
                    flexDirection: "row", alignItems: "center",
                    justifyContent: "space-between", marginTop: 8,
                  }}>
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 4,
                      borderWidth: 1, borderColor: "#fed7aa",
                      borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
                    }}>
                      <MaterialCommunityIcons name="alert-outline" size={10} color="#b45309" />
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#b45309" }}>
                        Restock needed
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={onRestock}
                      activeOpacity={0.75}
                      style={{
                        backgroundColor: "#fffbeb", borderRadius: 10,
                        paddingHorizontal: 12, paddingVertical: 5,
                        borderWidth: 1, borderColor: "#fde68a",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#b45309" }}>Restock</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={{
              flexDirection: "row", alignItems: "center",
              justifyContent: "center", paddingBottom: 9, gap: 4,
            }}>
              <MaterialCommunityIcons name="gesture-swipe" size={12} color="#9ca3af" />
              <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "600" }}>
                Swipe right to edit · Swipe left to delete
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Swipeable>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ProductListingScreen = () => {
        
  const { height: SCREEN_HEIGHT }  = useWindowDimensions();

  const [products,           setProducts]           = useState<Product[]>([]);
  const [loading,             setLoading]            = useState(true);
  const [farmerId,            setFarmerId]           = useState<string | null>(null);
  const [farmName,            setFarmName]           = useState<string>("");
  const [activeCategory,     setActiveCategory]     = useState<Category>("All");
  const [search,             setSearch]             = useState("");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean; id: string; name: string;
  }>({ visible: false, id: "", name: "" });

  const [restockTarget, setRestockTarget] = useState<Product | null>(null);

  const [formModal, setFormModal] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    product?: Product;
  }>({ visible: false, mode: "add" });

  const scrollY        = useRef(new Animated.Value(0)).current;
  const headerOpacity  = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: "clamp" });
  const headerTranslate= scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, -20], extrapolate: "clamp" });

  // Load the logged-in farmer's id/name once, then reload their products
  // every time this screen gains focus — same refresh-on-focus behavior
  // as before, just async now.
  const loadProducts = useCallback(async (id: string) => {
    setLoading(true);
    const farmerProducts = await getProductsByFarmer(id);
    setProducts(farmerProducts);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          if (!userString) return;
          const user = JSON.parse(userString);
          if (cancelled) return;
          setFarmerId(user.userId);
          setFarmName(user.farmName ?? user.fullName ?? "My Farm");
          await loadProducts(user.userId);
        } catch (e) {
          console.log(e);
        }
      })();
      return () => { cancelled = true; };
    }, [loadProducts])
  );

  const filtered = products.filter((p) => {
    const matchCat    = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEdit = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setFormModal({ visible: true, mode: "edit", product });
    }
  };

  const handleDeletePress = (id: string, name: string) =>
    setDeleteModal({ visible: true, id, name });

  const handleConfirmDelete = async () => {
    await deleteProduct(deleteModal.id);
    if (farmerId) await loadProducts(farmerId);
    setDeleteModal({ visible: false, id: "", name: "" });
  };

  const handleRestockConfirm = useCallback(async (id: string, newTotal: number) => {
    await restockProduct(id, newTotal);
    if (farmerId) await loadProducts(farmerId);
  }, [farmerId, loadProducts]);

  const handleFormSubmit = useCallback(async (data: ProductFormData) => {
    if (!farmerId) return;

    if (formModal.mode === "add") {
      await createProduct(farmerId, farmName, data as any);
    } else if (formModal.mode === "edit" && formModal.product) {
      await updateProduct(formModal.product.id, data as Partial<Product>);
    }

    await loadProducts(farmerId);
    setFormModal({ visible: false, mode: "add" });
  }, [formModal, farmerId, farmName, loadProducts]);

  const isFiltered = activeCategory !== "All";

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      <DeleteConfirmationModal
        visible={deleteModal.visible}
        productName={deleteModal.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ visible: false, id: "", name: "" })}
      />
      <RestockModal
        visible={!!restockTarget}
        product={restockTarget as any}
        onClose={() => setRestockTarget(null)}
        onConfirm={handleRestockConfirm}
      />
      <ProductFormModal
        visible={formModal.visible}
        mode={formModal.mode}
        initial={formModal.mode === "edit" && formModal.product ? {
          name:        formModal.product.name,
          category:    formModal.product.category as any,
          unit:        formModal.product.unit as any,
          stock:       formModal.product.stock,
          maxStock:    formModal.product.maxStock,
          price:       formModal.product.price,
          status:      (formModal.product.status as any) ?? "Available",
          freshness:   (formModal.product.freshness as any) ?? "Freshly Harvested",
          description: formModal.product.description ?? "",
          image:       formModal.product.image ?? null,
        } : undefined}
        onClose={() => setFormModal({ visible: false, mode: "add" })}
        onSubmit={handleFormSubmit}
      />

      <FilterSheet
        visible={filterSheetVisible}
        products={products}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onClose={() => setFilterSheetVisible(false)}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={{
          paddingTop: STATUS_BAR + 16, paddingHorizontal: 20,
          paddingBottom: 28, backgroundColor: "#166534",
        }}>
          <Animated.View style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 26, lineHeight: 32 }}>
              My Products
            </Text>
          </Animated.View>
        </View>

        <View style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          paddingHorizontal: 16, paddingTop: 20,
          minHeight: SCREEN_HEIGHT, marginTop: -18,
        }}>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <View style={{
              flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "#fff", borderRadius: 14,
              paddingHorizontal: 14, height: 44,
              borderWidth: 1, borderColor: "#f3f4f6",
            }}>
              <MaterialCommunityIcons name="magnify" size={16} color="#9BB09E" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search products..."
                placeholderTextColor="#B0C4B4"
                style={{ flex: 1, fontSize: 13, color: "#111827", padding: 0 }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#9BB09E" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.8}
              style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: isFiltered ? "#166534" : "#fff",
                alignItems: "center", justifyContent: "center",
                borderWidth: 1, borderColor: isFiltered ? "#166534" : "#f3f4f6",
              }}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={20}
                color={isFiltered ? "#fff" : "#6b7280"}
              />
              {isFiltered && (
                <View style={{
                  position: "absolute", top: 6, right: 6,
                  width: 7, height: 7, borderRadius: 4,
                  backgroundColor: "#facc15",
                  borderWidth: 1.5, borderColor: "#166534",
                }} />
              )}
            </TouchableOpacity>
          </View>

          {isFiltered && (
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: "#f0fdf4", borderRadius: 20,
                paddingHorizontal: 12, paddingVertical: 5,
                borderWidth: 1, borderColor: "#bbf7d0",
              }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#15803d" }}>
                  {activeCategory}
                </Text>
                <TouchableOpacity onPress={() => setActiveCategory("All")}>
                  <MaterialCommunityIcons name="close-circle" size={14} color="#15803d" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {loading ? (
            <View style={{ alignItems: "center", paddingTop: 64 }}>
              <Text style={{ color: "#9ca3af", fontSize: 13 }}>Loading your products…</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={{
              alignItems: "center", paddingTop: 64, paddingBottom: 32, gap: 10,
            }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: "#f0fdf4",
                alignItems: "center", justifyContent: "center",
                marginBottom: 4,
              }}>
                <MaterialCommunityIcons name="package-variant-closed" size={32} color="#15803d" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#374151" }}>
                No products found
              </Text>
              <Text style={{
                fontSize: 13, color: "#9ca3af",
                textAlign: "center", lineHeight: 20,
              }}>
                {search
                  ? `No results for &ldquo;${search}&rdquo;`
                  : `No products in &ldquo;${activeCategory}&rdquo;`}
              </Text>
              {(search || isFiltered) && (
                <TouchableOpacity
                  onPress={() => { setSearch(""); setActiveCategory("All"); }}
                  style={{
                    marginTop: 8, backgroundColor: "#166534",
                    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                    Clear filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product.id)}
                onDelete={() => handleDeletePress(product.id, product.name)}
                onRestock={() => setRestockTarget(product)}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      <TouchableOpacity
        onPress={() => setFormModal({ visible: true, mode: "add" })}
        activeOpacity={0.88}
        style={{
          position: "absolute",
          bottom: 90,
          right: 20,
          width: 58, height: 58, borderRadius: 29,
          backgroundColor: "#166534",
          alignItems: "center", justifyContent: "center",
          shadowColor: "#14532d",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 12,
          zIndex: 100,
        }}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

ProductListingScreen.options = {
  headerShown: false,
};

export default ProductListingScreen;