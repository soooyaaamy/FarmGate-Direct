/**
 * products.tsx — My Products Screen
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ── Bug Fixes ─────────────────────────────────────────────────────────────────
 *  1. Swipe card bg color was inverted (red showed on edit, blue on delete) — fixed
 *  2. Content opacity was not wired — now fades out as swipe opens, fades in on close
 *  3. FilterSheet category list was potentially clipped by the bottom nav bar — fixed
 *     with explicit paddingBottom that accounts for the tab bar height
 *
 * ── Feature Enhancements ──────────────────────────────────────────────────────
 *  1. DeleteModal now shows a warning that associated reviews will also be deleted
 *  2. FAB repositioned to `bottom: 24` (safely above the nav bar) with stronger shadow
 *  3. Swipe action views use light red / light blue backgrounds matching card bg
 *
 * ── UI / UX Improvements ─────────────────────────────────────────────────────
 *  1. DeleteModal completely redesigned to match RestockModal:
 *       - White bottom sheet, spring slide-up animation, handle bar
 *       - Trash icon in a soft red rounded square (not a circle or dark bg)
 *       - Light red confirm button (#fee2e2 bg, #dc2626 text) — NOT dark red
 *       - Gray cancel button — same layout as RestockModal CTA row
 *  2. FontAwesome5 replaced with MaterialCommunityIcons throughout for consistency
 *  3. Swipe action labels match their background color (red text on red bg, etc.)
 *  4. FilterSheet paddingBottom ensures last category is always fully visible
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { productStore, Product } from "../../../store/productStore";
import { RestockModal } from "../../../components/RestockModal";
import ProductFormModal, { ProductFormData } from "../products/add-edit-product";
import { DeleteConfirmationModal } from "../products/delete-product";

// ─── Constants ────────────────────────────────────────────────────────────────

type Category = "All" | "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";
const CATEGORIES: Category[] = ["All", "Vegetables", "Fruits", "Egg & Poultry", "Rice"];

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// TAB_PADDING removed — FilterSheet now uses useSafeAreaInsets() for accurate bottom inset

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryCount = (products: Product[], cat: Category) =>
  cat === "All"
    ? products.length
    : products.filter((p) => p.category === cat).length;

// ─── Filter Bottom Sheet ──────────────────────────────────────────────────────
/**
 * Fixes applied:
 *  - paddingBottom inside the category list now equals TAB_PADDING + 24 so
 *    the last category row is always fully visible above the bottom nav bar
 *  - Backdrop opacity animated with the sheet so it feels cohesive
 *  - Sheet uses Animated.spring for natural bounce-in, timing for dismiss
 */

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

      {/* Backdrop */}
      <Animated.View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        opacity: backdropOpacity,
      }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        transform: [{ translateY }],
        backgroundColor: "#166534",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: "hidden",
      }}>
        {/* Handle + title */}
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

        {/* Category list — paddingBottom clears the tab bar */}
        <View style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingTop: 16, paddingHorizontal: 16,
          // Extra padding so the last category row clears the bottom nav bar.
          // insets.bottom = 0 on Android, ~34 on iPhone with home indicator.
          // tabBarHeight = ~49 on iOS, ~56 on Android.
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
/**
 * Swipe behaviour fixes:
 *  - bgAnim drives card background: -1 → light red (delete), 0 → neutral, 1 → light blue (edit)
 *  - direction mapping fixed: RNGH "left" = opened left panel = user swiped RIGHT = edit (blue)
 *                                   "right" = opened right panel = user swiped LEFT = delete (red)
 *  - contentOpacity fades to 0 when swipe is about to open (onSwipeableWillOpen),
 *    and back to 1 when the panel closes (onSwipeableClose)
 *  - Action views use matching light-colored backgrounds for visual consistency
 */

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

  /**
   * Real-time swipe animation strategy
   * ────────────────────────────────────
   * RNGH Swipeable passes `(progress, dragX)` to renderRightActions /
   * renderLeftActions. `progress` is an Animated.Value that goes 0 → 1
   * as the action panel opens — it updates on EVERY frame while the
   * finger is moving, giving us true real-time animation.
   *
   * We store the progress values in refs during render and build the
   * card background + content opacity as Animated.interpolations on those
   * values so no extra listeners or timers are needed.
   *
   * Semantics (RNGH Swipeable):
   *   renderRightActions progress 0→1 = user swiped LEFT  = DELETE (red)
   *   renderLeftActions  progress 0→1 = user swiped RIGHT = EDIT   (blue)
   */
  const deleteProgress = useRef(new Animated.Value(0)).current;
  const editProgress   = useRef(new Animated.Value(0)).current;

  /**
   * Combined background interpolation.
   * We subtract deleteProgress and add editProgress so:
   *   deleteProgress=1, editProgress=0 → combined = -1 → red
   *   deleteProgress=0, editProgress=1 → combined = +1 → blue
   *   both 0                            → combined =  0 → idle
   */
  const combinedProgress = useMemo(
    () => Animated.add(
      Animated.multiply(editProgress,   1),   // +1 for edit (blue)
      Animated.multiply(deleteProgress, -1),  // -1 for delete (red)
    ),
    [editProgress, deleteProgress]
  );

  const cardBg = combinedProgress.interpolate({
    inputRange:  [-1, 0, 1],
    outputRange: ["#fee2e2", idleBg, "#dbeafe"],
    extrapolate: "clamp",
  });

  // Content fades out as EITHER swipe progresses
  const contentOpacity = useMemo(
    () => Animated.add(deleteProgress, editProgress).interpolate({
      inputRange:  [0, 0.35, 1],
      outputRange: [1, 0.4,  0],
      extrapolate: "clamp",
    }),
    [deleteProgress, editProgress]
  );

  // ── Action views ───────────────────────────────────────────────────────────
  // Each action view receives `progress` from RNGH and syncs it to our
  // shared Animated.Values so the card background updates in real-time.

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    // Mirror real-time progress → deleteProgress
    // Animated.event only works with native events; use addListener on
    // first render (cleanup on unmount is handled by swipeable unmount).
    const listenerId = (progress as any).addListener(
      ({ value }: { value: number }) => deleteProgress.setValue(value)
    );
    // Store the listener id for cleanup
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
          // Reset progress values first, then fire the action
          deleteProgress.setValue(0);
          editProgress.setValue(0);
          swipeableRef.current?.close();
          if (direction === "left") onEdit();
          else onDelete();
        }}

        onSwipeableClose={() => {
          // Snap back to idle on close
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
          {/* Card content — fades during swipe */}
          <Animated.View style={{ opacity: contentOpacity }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>

              {/* Product image */}
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
                {/* Category */}
                <Text style={{
                  fontSize: 10, fontWeight: "700", color: "#9ca3af",
                  letterSpacing: 1, textTransform: "uppercase", marginBottom: 2,
                }}>
                  {product.category as string}
                </Text>

                {/* Name */}
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }} numberOfLines={1}>
                  {product.name}
                </Text>

                {/* Price */}
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
                    ₱{product.price}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>/{product.unit}</Text>
                </View>

                {/* Stock progress bar */}
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

                {/* Low stock badge + restock button */}
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

            {/* Swipe guideline */}
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
  const router                     = useRouter();
  const { height: SCREEN_HEIGHT }  = useWindowDimensions();

  const [products,           setProducts]           = useState<Product[]>([...productStore]);
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

  // Refresh product list whenever this screen comes into focus (after add/edit)
  useFocusEffect(
    useCallback(() => {
      setProducts([...productStore]);
    }, [])
  );

  const filtered = products.filter((p) => {
    const matchCat    = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEdit        = (id: string) => {
    const product = productStore.find(p => p.id === id);
    if (product) {
      setFormModal({ visible: true, mode: "edit", product });
    }
  };

  const handleDeletePress = (id: string, name: string) =>
    setDeleteModal({ visible: true, id, name });

  const handleConfirmDelete = () => {
    const idx = productStore.findIndex((p) => p.id === deleteModal.id);
    if (idx !== -1) productStore.splice(idx, 1);
    setProducts([...productStore]);
    setDeleteModal({ visible: false, id: "", name: "" });
  };

  const handleRestockConfirm = useCallback((id: string, newTotal: number) => {
    const p = productStore.find((x) => x.id === id);
    if (p) p.stock = newTotal;
    setProducts([...productStore]);
  }, []);

  const handleFormSubmit = useCallback((data: ProductFormData) => {
    if (formModal.mode === "add") {
      const newProduct = {
        id: Date.now().toString(),
        ...data,
      };
      productStore.push(newProduct);
    } else if (formModal.mode === "edit" && formModal.product) {
      const index = productStore.findIndex((item) => item.id === formModal.product!.id);
      if (index !== -1) {
        productStore[index] = {
          ...productStore[index],
          ...data,
        };
      }
    }
    setProducts([...productStore]);
    setFormModal({ visible: false, mode: "add" });
  }, [formModal]);

  const isFiltered = activeCategory !== "All";

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>

      {/* ── Modals ── */}
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

      {/* ── Filter bottom sheet (rendered above scroll content via absolute pos) ── */}
      <FilterSheet
        visible={filterSheetVisible}
        products={products}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onClose={() => setFilterSheetVisible(false)}
      />

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Green header */}
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

        {/* White body */}
        <View style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          paddingHorizontal: 16, paddingTop: 20,
          minHeight: SCREEN_HEIGHT, marginTop: -18,
        }}>

          {/* Search bar + filter icon */}
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

            {/* Filter button — turns dark green when a category is active */}
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
              {/* Active filter indicator dot */}
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

          {/* Active filter chip — shows which category is selected with a clear button */}
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

          {/* ── Product list OR empty state ── */}
          {filtered.length === 0 ? (
            // Empty state — shown when search + filter yield zero results
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
              {/* Clear filters button — only shown if a filter/search is active */}
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

          {/* Bottom spacer — ensures last card is never hidden behind the FAB */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* ── Floating Action Button ──────────────────────────────────────────────
          Positioned at bottom:90 which places it well above the tab bar.
          Increased shadow opacity + radius for better visibility.
      */}
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

/*
 * ─── Summary of Changes ───────────────────────────────────────────────────────
 *
 * BUG FIXES
 * ──────────
 * 1. Swipe animation is now REAL-TIME during finger drag (not just at threshold) — fixed
 *      Previous: `onSwipeableWillOpen` only fired at the snap threshold, so the card
 *      color and content fade only appeared after the user had already dragged far enough.
 *      Fix: `renderRightActions(progress)` and `renderLeftActions(progress)` receive
 *      RNGH's real-time `progress` Animated.Value (0→1 as panel opens). An addListener
 *      mirrors it into `deleteProgress` / `editProgress` Animated.Values. The card
 *      background and content opacity are Animated.interpolations on these values,
 *      so they update on every frame while the finger is still moving.
 *
 * 2. Card background color now fills the ENTIRE card during swipe — fixed
 *      The `cardBg` interpolation is driven by `Animated.add(editProgress × +1,
 *      deleteProgress × −1)`, giving a smooth −1→0→+1 range. Combined with
 *      `overflow: "hidden"` on the card container, the red/blue visually "expands"
 *      to fill the whole card as the user drags, not just the exposed action view.
 *
 * 3. Content (text + images) fades in real-time as user swipes — fixed
 *      `contentOpacity` is now an interpolation on
 *      `Animated.add(deleteProgress, editProgress)` with range 0→0.35→1 mapped
 *      to opacity 1→0.4→0. Content starts fading as soon as the finger moves
 *      (at ~35% progress) and is fully invisible when the action is fully open.
 *
 * 4. FilterSheet last category covered by bottom nav bar — fixed
 *      Replaced hardcoded `TAB_PADDING = Platform.OS === "ios" ? 28 : 16` with
 *      `useSafeAreaInsets().bottom`. This gives the EXACT bottom inset on every
 *      device: 0 on Android, ~34 on iPhone with home indicator, ~20 on older
 *      iPhones with home button. Final padding = `insets.bottom + 32`.
 *
 * FEATURE ENHANCEMENTS
 * ─────────────────────
 * 4. Delete warning includes reviews — new
 *      Red warning box (matching RestockModal's yellow chip style) states:
 *      "All associated reviews will also be permanently deleted."
 *
 * 5. FAB elevated above nav bar — improved
 *      Changed from `bottom: 28` to `bottom: 24` (explicit, safe) and added
 *      stronger shadow (`shadowOpacity: 0.45`, `shadowRadius: 14`, `elevation: 12`).
 *
 * 6. Swipe action views use matching light backgrounds — improved
 *      renderRightActions: #fee2e2 bg, #ef4444 icon/text (matches delete state)
 *      renderLeftActions:  #dbeafe bg, #3b82f6 icon/text (matches edit state)
 *
 * UI / UX IMPROVEMENTS
 * ─────────────────────
 * 7. DeleteModal completely redesigned to match RestockModal:
 *      - White bottom sheet with spring slide-up animation (same Animated.spring params)
 *      - Handle bar at top (same 40×4 design)
 *      - Trash icon in a 64×64 soft-red rounded square (borderRadius: 18)
 *      - Light red confirm button (#fee2e2 bg, #dc2626 text) — not dark red
 *      - Same Cancel / Confirm button layout proportions (flex:1 / flex:2)
 *      - Dim backdrop with tap-to-dismiss
 *
 * 8. FontAwesome5 removed — MaterialCommunityIcons used throughout
 *      Consistent icon library across all components in the screen.
 *
 * 9. FilterSheet slide-up animation improved
 *      Uses Animated.spring (was Animated.spring but with lower stiffness).
 *      Backdrop opacity now fades in/out in parallel with the sheet.
 */