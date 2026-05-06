/**
 * ProductCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Product card with:
 *
 * Stock status styling (requirement §4)
 * ──────────────────────────────────────
 *   Available     — default white card, no special border
 *   Low Stock     — amber/yellow border (1.5 pt), white background
 *   Out of Stock  — gray background (#f3f4f6), reduced opacity (0.72)
 *
 * Swipe gestures (left/right)
 * ────────────────────────────
 *   Swipe right → Edit  (blue action panel)
 *   Swipe left  → Delete (red action panel)
 *   Content (image + text) fades to 0 as drag reaches ±80 pt so only
 *   the action background is visible at full extension.
 *
 * Restock button
 * ───────────────
 *   Amber-styled button shown only when status === "Low Stock".
 *   Triggers the parent's `onRestock` callback.
 */

import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { C, T } from "./theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id:           string;
  name:         string;
  category:     string;
  unit:         string;
  stock:        number;
  maxStock:     number;
  price:        number;
  status:       "Available" | "Low Stock" | "Out of Stock";
  freshness?:   string;
  description?: string;
  image?:       string | number | null;
}

interface ProductCardProps {
  product:   Product;
  onEdit:    () => void;
  onDelete:  () => void;
  onRestock: () => void;
}

// ─── Stock-status visual config ───────────────────────────────────────────────

const STOCK_VISUAL = {
  Available: {
    cardBg:      C.white,
    borderColor: "transparent",
    borderWidth: 0,
    opacity:     1,
    barColor:    C.green700,
    labelColor:  C.gray500,
  },
  "Low Stock": {
    cardBg:      C.white,
    borderColor: C.amber600,   // yellow/amber border
    borderWidth: 1.5,
    opacity:     1,
    barColor:    C.amber600,
    labelColor:  C.amber800,
  },
  "Out of Stock": {
    cardBg:      C.gray100,    // muted grey background
    borderColor: C.gray300,
    borderWidth: 1,
    opacity:     0.72,         // reduced visual emphasis
    barColor:    C.gray300,
    labelColor:  C.gray400,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  product, onEdit, onDelete, onRestock,
}) => {
  const swipeRef = useRef<Swipeable>(null);
  const dragX    = useRef(new Animated.Value(0)).current;

  const vis     = STOCK_VISUAL[product.status] ?? STOCK_VISUAL.Available;
  const stockPct = Math.min((product.stock / Math.max(product.maxStock, 1)) * 100, 100);
  const isLow    = product.status === "Low Stock";
  const isOut    = product.status === "Out of Stock";

  // ── Content fades out during swipe so only action colour shows ─────────────
  const contentOpacity = dragX.interpolate({
    inputRange: [-120, -40, 0, 40, 120],
    outputRange: [0,    0.15, 1, 0.15, 0],
    extrapolate: "clamp",
  });

  // ── Swipe action panels ───────────────────────────────────────────────────
  const renderRightActions = () => (
    <View style={[p.actionPanel, { backgroundColor: C.red500 }]}>
      <Ionicons name="trash-outline" size={24} color={C.white} />
      <Text style={p.actionLabel}>Delete</Text>
    </View>
  );

  const renderLeftActions = () => (
    <View style={[p.actionPanel, { backgroundColor: "#3b82f6", justifyContent: "center" }]}>
      <Ionicons name="pencil-outline" size={22} color={C.white} />
      <Text style={p.actionLabel}>Edit</Text>
    </View>
  );

  return (
    <View style={p.wrapper}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableOpen={(dir) => {
          swipeRef.current?.close();
          if (dir === "left")  onEdit();
          if (dir === "right") onDelete();
        }}
        onSwipeableWillOpen={(dir) => {
          Animated.spring(dragX, {
            toValue: dir === "left" ? 120 : -120,
            useNativeDriver: false,
          }).start();
        }}
        onSwipeableClose={() => {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: false }).start();
        }}
        containerStyle={{ borderRadius: 14, overflow: "hidden" }}
      >
        {/* ── Card shell — dynamic border/bg per status ── */}
        <View
          style={[
            p.card,
            {
              backgroundColor: vis.cardBg,
              borderColor:     vis.borderColor,
              borderWidth:     vis.borderWidth,
              opacity:         vis.opacity,
            },
          ]}
        >
          {/* Fading content wrapper */}
          <Animated.View style={{ opacity: contentOpacity }}>

            {/* Main content row */}
            <View style={p.mainRow}>
              {/* Product image */}
              {product.image ? (
                <Image
                  source={
                    typeof product.image === "string"
                      ? { uri: product.image }
                      : (product.image as any)
                  }
                  style={[p.thumb, isOut && { opacity: 0.55 }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[p.thumbPlaceholder, isOut && p.thumbOut]}>
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={22}
                    color={isOut ? C.gray300 : "#9BB09E"}
                  />
                  <Text style={[p.thumbLabel, isOut && { color: C.gray300 }]}>
                    No photo
                  </Text>
                </View>
              )}

              {/* Text info */}
              <View style={p.info}>
                {/* Category label */}
                <Text style={[p.category, isOut && { color: C.gray300 }]}>
                  {product.category}
                </Text>

                {/* Product name */}
                <Text
                  style={[p.name, isOut && { color: C.gray400 }]}
                  numberOfLines={1}
                >
                  {product.name}
                </Text>

                {/* Price */}
                <View style={p.priceRow}>
                  <Text style={[p.price, isOut && { color: C.gray400 }]}>
                    ₱{product.price.toLocaleString()}
                  </Text>
                  <Text style={p.unit}>/{product.unit}</Text>
                </View>

                {/* Stock progress bar */}
                <View style={p.stockRow}>
                  <View style={p.stockTrack}>
                    <View
                      style={[
                        p.stockFill,
                        { width: `${stockPct}%`, backgroundColor: vis.barColor },
                      ]}
                    />
                  </View>
                  <Text style={[p.stockLabel, { color: vis.labelColor }]}>
                    {isOut ? "Out of stock" : `${product.stock} ${product.unit} left`}
                  </Text>
                </View>

                {/* Low-stock row: badge + Restock button */}
                {(isLow || isOut) && (
                  <View style={p.statusRow}>
                    {/* Badge */}
                    <View
                      style={[
                        p.badge,
                        isLow  ? p.badgeLow  : p.badgeOut,
                      ]}
                    >
                      <Ionicons
                        name={isLow ? "warning-outline" : "close-circle-outline"}
                        size={10}
                        color={isLow ? C.amber800 : C.gray500}
                      />
                      <Text
                        style={[
                          p.badgeText,
                          isLow ? p.badgeLowText : p.badgeOutText,
                        ]}
                      >
                        {isLow ? "Low Stock" : "Out of Stock"}
                      </Text>
                    </View>

                    {/* Restock button — only when low */}
                    {isLow && (
                      <TouchableOpacity
                        onPress={onRestock}
                        style={p.restockBtn}
                        activeOpacity={0.75}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={p.restockText}>Restock</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Swipe hint — improved contrast */}
            <View style={p.swipeHint}>
              <MaterialCommunityIcons name="gesture-swipe" size={11} color={C.gray400} />
              <Text style={p.swipeHintText}>
                Swipe right to edit · Swipe left to delete
              </Text>
            </View>
          </Animated.View>
        </View>
      </Swipeable>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const p = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },

  // Thumbnail
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: C.gray100,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: 4,
  },
  thumbOut: {
    backgroundColor: C.gray200,
  },
  thumbLabel: {
    fontSize: 9,
    color: C.gray400,
    fontWeight: "500",
  },

  // Info column
  info: { flex: 1, minWidth: 0 },
  category: {
    fontSize: T.xs,
    fontWeight: "700",
    color: C.gray400,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  name: {
    fontSize: T.base,
    fontWeight: "700",
    color: C.gray900,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 8,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: C.gray900,
  },
  unit: {
    fontSize: T.sm,
    color: C.gray400,
  },

  // Stock bar
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  stockTrack: {
    flex: 1,
    height: 6,
    backgroundColor: C.gray100,
    borderRadius: 3,
    overflow: "hidden",
  },
  stockFill: {
    height: "100%",
    borderRadius: 3,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Status badge + restock row
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeLow: {
    backgroundColor: C.amber50,
    borderColor: C.amber200,
  },
  badgeOut: {
    backgroundColor: C.gray100,
    borderColor: C.gray200,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeLowText: { color: C.amber800 },
  badgeOutText: { color: C.gray500  },

  // Restock button
  restockBtn: {
    backgroundColor: C.amber50,
    borderWidth: 1,
    borderColor: C.amber200,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  restockText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.amber800,
  },

  // Swipe hint
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 9,
    gap: 4,
  },
  swipeHintText: {
    fontSize: 10,
    color: C.gray400,
    fontWeight: "600",
  },

  // Action panels
  actionPanel: {
    width: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    overflow: "hidden",
  },
  actionLabel: {
    color: C.white,
    fontSize: 11,
    fontWeight: "700",
  },
});

export default ProductCard;