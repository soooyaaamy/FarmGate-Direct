/**
 * orders/[id].tsx — Order Details Screen
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * UI/UX IMPROVEMENTS
 * ──────────────────
 * [UI-1]  Back button: white background + black arrow (visible, consistent)
 * [UI-2]  Removed status indicator badge from top-right of header
 * [UI-3]  Removed order date row below customer name
 * [UI-4]  Removed total price row below customer name (price lives in summary)
 * [UI-5]  Product images added to order items (emoji fallback if no image URI)
 *
 * LAYOUT SIMPLIFICATIONS
 * ───────────────────────
 * [LAY-1] All content placed inside ONE unified white rounded container
 *         instead of multiple separate white cards
 * [LAY-2] Sections separated by simple divider lines — no nested containers
 * [LAY-3] Clean typography hierarchy throughout
 *
 * FEATURE ENHANCEMENTS
 * ─────────────────────
 * [ENH-1] "Order Complete" button for Delivered orders
 *         → removes order from list, stores in history (lifted to parent)
 * [ENH-2] Confirmation sheets before status transitions
 *         (Accept → Packing, Packing → Ready, Ready → Delivered)
 * [ENH-3] Animated status timeline with staggered entrance animations
 */

import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Order, OrderStatus } from "../(tabs)/order";
import { MOCK_ORDERS, STATUS_STYLE } from "../(tabs)/order";

const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ─── Status step icons ────────────────────────────────────────────────────────

const STEP_ICONS: Record<OrderStatus, string> = {
  New:       "clipboard-check-outline",
  Packing:   "cube-outline",
  Ready:     "checkmark-circle-outline",
  Delivered: "bicycle-outline",
  Cancelled: "close-circle-outline",
};

// ─── Confirmation config ──────────────────────────────────────────────────────

const CONFIRM: Record<
  string,
  { title: string; body: string; label: string; color: string; icon: string }
> = {
  accept: {
    title: "Accept Order?",
    body:  "Accepting means you'll begin preparing this order.",
    label: "Accept Order",
    color: "#166534",
    icon:  "checkmark-circle-outline",
  },
  decline: {
    title: "Decline Order?",
    body:  "The buyer will be notified that this order was declined.",
    label: "Yes, Decline",
    color: "#dc2626",
    icon:  "close-circle-outline",
  },
  Packing: {
    title: "Start Packing?",
    body:  "Mark this order as now being packed.",
    label: "Start Packing",
    color: "#1d4ed8",
    icon:  "cube-outline",
  },
  Ready: {
    title: "Mark as Ready?",
    body:  "This order is packed and ready for pickup or delivery.",
    label: "Mark as Ready",
    color: "#7c3aed",
    icon:  "checkmark-done-outline",
  },
  Delivered: {
    title: "Confirm Delivery?",
    body:  "Mark this order as successfully delivered.",
    label: "Confirm Delivery",
    color: "#166534",
    icon:  "bicycle-outline",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// [ENH-2] Animated bottom-sheet confirmation
// Same green-header / white-body aesthetic as the rest of the app
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmSheetProps {
  visible:      boolean;
  actionKey:    string | null;
  onConfirm:    () => void;
  onCancel:     () => void;
}

const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  visible, actionKey, onConfirm, onCancel,
}) => {
  const slideY   = useRef(new Animated.Value(400)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 400, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line

  if (!actionKey) return null;
  const cfg = CONFIRM[actionKey];
  if (!cfg) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <Animated.View style={[cs.backdrop, { opacity: bgOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
      </Animated.View>

      <Animated.View style={[cs.sheetWrapper, { transform: [{ translateY: slideY }] }]}>
        {/* Green header */}
        <View style={cs.greenHeader}>
          <View style={cs.iconCircle}>
            <Ionicons name={cfg.icon as any} size={24} color="#fff" />
          </View>
          <Text style={cs.sheetTitle}>{cfg.title}</Text>
          <Text style={cs.sheetBody}>{cfg.body}</Text>
        </View>

        {/* White body */}
        <View style={cs.whiteBody}>
          <TouchableOpacity
            onPress={onConfirm}
            style={[cs.confirmBtn, { backgroundColor: cfg.color }]}
            activeOpacity={0.85}
          >
            <Text style={cs.confirmBtnText}>{cfg.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={cs.cancelBtn} activeOpacity={0.75}>
            <Text style={cs.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const cs = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  sheetWrapper: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#166534",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  greenHeader: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  sheetBody: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  whiteBody: {
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 10,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelBtnText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "700",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// [ENH-3] Animated timeline step
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineStepProps {
  status: OrderStatus;
  time:   string;
  done:   boolean;
  isLast: boolean;
  delay:  number;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  status, time, done, isLast, delay,
}) => {
  const scale   = useRef(new Animated.Value(done ? 0.6 : 1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 160 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, [delay]); // eslint-disable-line

  const sc = STATUS_STYLE[status] ?? STATUS_STYLE.New;

  return (
    <View style={d.stepRow}>
      {/* Dot + connector */}
      <View style={d.stepLeft}>
        <Animated.View
          style={[
            d.stepDot,
            done
              ? { backgroundColor: sc.bg, borderColor: sc.border }
              : { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" },
            { opacity, transform: [{ scale }] },
          ]}
        >
          <Ionicons
            name={STEP_ICONS[status] as any}
            size={13}
            color={done ? sc.text : "#d1d5db"}
          />
        </Animated.View>
        {!isLast && (
          <View style={[d.stepLine, { backgroundColor: done ? sc.border : "#e5e7eb" }]} />
        )}
      </View>

      {/* Label + time */}
      <View style={[d.stepContent, !isLast && { paddingBottom: 20 }]}>
        <Text style={[d.stepLabel, done && { color: "#111827", fontWeight: "700" }]}>
          {status}
        </Text>
        <Text style={d.stepTime}>{time}</Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORDER DETAILS SCREEN
// ─────────────────────────────────────────────────────────────────────────────

interface OrderDetailsProps {
  /** Called after user completes a Delivered order */
  onOrderComplete?: (order: Order) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ onOrderComplete }) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; orderData?: string }>();

  // Parse order — from params or fall back to mock data
  const [order, setOrder] = useState<Order | null>(() => {
    try {
      if (params.orderData) return JSON.parse(params.orderData);
    } catch { /* fall through */ }
    return MOCK_ORDERS.find((o) => o.id === params.id) ?? null;
  });

  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // Header fade-in
  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, []); // eslint-disable-line

  const updateTimeline = useCallback((newStatus: OrderStatus): Order["timeline"] => {
    const flow: OrderStatus[] = ["New", "Packing", "Ready", "Delivered"];
    const now = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) +
                ", " + new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" });
    return flow.map((s) => ({
      status: s,
      time:   s === newStatus ? now : (order?.timeline.find((t) => t.status === s)?.time ?? "—"),
      done:   flow.indexOf(s) <= flow.indexOf(newStatus),
    }));
  }, [order]);

  const applyAction = useCallback((actionKey: string) => {
    setConfirmAction(null);
    setOrder((prev) => {
      if (!prev) return prev;
      let nextStatus: OrderStatus = prev.status;
      if      (actionKey === "accept")    nextStatus = "Packing";
      else if (actionKey === "decline")   nextStatus = "Cancelled";
      else if (actionKey === "Packing")   nextStatus = "Packing";
      else if (actionKey === "Ready")     nextStatus = "Ready";
      else if (actionKey === "Delivered") nextStatus = "Delivered";
      return { ...prev, status: nextStatus, timeline: updateTimeline(nextStatus) };
    });
  }, [updateTimeline]);

  // [ENH-1] Order complete → remove from list
  const handleOrderComplete = useCallback(() => {
    if (!order) return;
    onOrderComplete?.(order);
    router.back();
  }, [order, onOrderComplete, router]);

  if (!order) {
    return (
      <View style={d.notFoundRoot}>
        <Text style={d.notFoundText}>Order not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={d.notFoundBack}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const total    = subtotal + order.shippingFee;

  return (
    <View style={d.root}>

      {/* [ENH-2] Confirmation sheet */}
      <ConfirmSheet
        visible={!!confirmAction}
        actionKey={confirmAction}
        onConfirm={() => confirmAction && applyAction(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />

      {/* ── Green header ── */}
      <Animated.View style={[d.header, { opacity: headerFade }]}>
        <View style={d.headerRow}>
          {/* [UI-1] Back button: white bg + black arrow */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={d.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            {/* [UI-2] No status badge in header — removed */}
            <Text style={d.headerSub}>Order #{order.id}</Text>
            <Text style={d.headerTitle}>Order Details</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── [LAY-1] Single unified white scrollable body ── */}
      <View style={d.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={d.scrollContent}
        >

          {/* ── Customer info ── */}
          <View style={d.avatarRow}>
            <View style={[d.avatarCircle, { backgroundColor: order.avatarColor + "1A" }]}>
              <Text style={[d.avatarInitials, { color: order.avatarColor }]}>
                {order.initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {/* [UI-3] No order date here */}
              {/* [UI-4] No total price here */}
              <Text style={d.customerName}>{order.customerName}</Text>
              {order.phone && <Text style={d.customerSub}>{order.phone}</Text>}
            </View>
            {/* Status lives here — beside the name, not in the header */}
            <View style={[d.statusPill, { backgroundColor: STATUS_STYLE[order.status]?.bg }]}>
              <Text style={[d.statusPillText, { color: STATUS_STYLE[order.status]?.text }]}>
                {order.status}
              </Text>
            </View>
          </View>

          {/* Address */}
          {order.address && (
            <View style={d.addressRow}>
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={d.addressText}>{order.address}</Text>
            </View>
          )}

          <View style={d.divider} />

          {/* ── [UI-5] Order items with product images ── */}
          <Text style={d.sectionLabel}>Order Items</Text>
          {order.items.map((item, i) => (
            <View
              key={item.id}
              style={[d.itemRow, i < order.items.length - 1 && d.itemRowBorder]}
            >
              {/* Product image — [UI-5] emoji if no URI */}
              {item.image ? (
                <Image source={{ uri: item.image }} style={d.itemImage} resizeMode="cover" />
              ) : (
                <View style={d.itemImagePlaceholder}>
                  <Text style={{ fontSize: 24 }}>{item.emoji ?? "🌿"}</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={d.itemName}>{item.name}</Text>
                <Text style={d.itemMeta}>
                  {item.qty} {item.unit} × ₱{item.price.toLocaleString()}
                </Text>
              </View>
              <Text style={d.itemTotal}>
                ₱{(item.qty * item.price).toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Special instructions */}
          {order.specialInstructions ? (
            <View style={d.instructionsBox}>
              <Ionicons name="document-text-outline" size={14} color="#b45309" />
              <View style={{ flex: 1 }}>
                <Text style={d.instructionsLabel}>Special Instructions</Text>
                <Text style={d.instructionsText}>{order.specialInstructions}</Text>
              </View>
            </View>
          ) : null}

          <View style={d.divider} />

          {/* ── Pricing summary ── */}
          <Text style={d.sectionLabel}>Payment</Text>
          <View style={d.priceRow}>
            <Text style={d.priceLabel}>Subtotal</Text>
            <Text style={d.priceValue}>₱{subtotal.toLocaleString()}</Text>
          </View>
          <View style={d.priceRow}>
            <Text style={d.priceLabel}>
              {order.shippingFee === 0 ? "Pickup (free)" : "Shipping fee"}
            </Text>
            <Text style={[d.priceValue, order.shippingFee === 0 && { color: "#15803d" }]}>
              {order.shippingFee === 0 ? "Free" : `₱${order.shippingFee.toLocaleString()}`}
            </Text>
          </View>
          <View style={[d.priceRow, d.totalRow]}>
            <Text style={d.totalLabel}>Total</Text>
            <Text style={d.totalValue}>₱{total.toLocaleString()}</Text>
          </View>

          <View style={d.divider} />

          {/* ── [ENH-3] Animated status timeline ── */}
          <Text style={d.sectionLabel}>Order Progress</Text>
          {order.timeline.map((step, i) => (
            <TimelineStep
              key={step.status}
              status={step.status}
              time={step.time}
              done={step.done}
              isLast={i === order.timeline.length - 1}
              delay={i * 130}
            />
          ))}

          {/* Bottom padding for footer */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* ── Sticky action footer ── */}
      <View style={d.footer}>

        {/* New → Accept / Decline */}
        {order.status === "New" && (
          <View style={d.footerRow}>
            <TouchableOpacity
              onPress={() => setConfirmAction("decline")}
              style={d.declineBtn}
              activeOpacity={0.8}
            >
              <Text style={d.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmAction("accept")}
              style={d.acceptBtn}
              activeOpacity={0.85}
            >
              <Text style={d.acceptBtnText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Packing → Mark as Ready */}
        {order.status === "Packing" && (
          <TouchableOpacity
            onPress={() => setConfirmAction("Ready")}
            style={[d.singleBtn, { backgroundColor: "#7c3aed" }]}
            activeOpacity={0.85}
          >
            <Text style={d.singleBtnText}>Mark as Ready for Pickup</Text>
          </TouchableOpacity>
        )}

        {/* Ready → Confirm Delivery */}
        {order.status === "Ready" && (
          <TouchableOpacity
            onPress={() => setConfirmAction("Delivered")}
            style={[d.singleBtn, { backgroundColor: "#166534" }]}
            activeOpacity={0.85}
          >
            <Text style={d.singleBtnText}>Confirm Delivery</Text>
          </TouchableOpacity>
        )}

        {/* [ENH-1] Delivered → Order Complete */}
        {order.status === "Delivered" && (
          <TouchableOpacity
            onPress={handleOrderComplete}
            style={[d.singleBtn, { backgroundColor: "#166534" }]}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={d.singleBtnText}>Order Complete</Text>
          </TouchableOpacity>
        )}

        {/* Cancelled / no actions */}
        {order.status === "Cancelled" && (
          <View style={d.completedBanner}>
            <Text style={d.completedBannerText}>Order Cancelled</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const d = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#166534",
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    paddingTop: STATUS_BAR + 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // [UI-1] White bg + black arrow
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  // ── [LAY-1] Single white body ──────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -14,
    overflow: "hidden",
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 18,
  },

  // ── Customer info ────────────────────────────────────────────────────────────
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "800",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  customerSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },

  // ── Section label ─────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // ── [UI-5] Order items ────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 11,
    color: "#9ca3af",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 0,
  },

  // ── Special instructions ────────────────────────────────────────────────────
  instructionsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  instructionsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
    marginBottom: 3,
  },
  instructionsText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
  },

  // ── Pricing ─────────────────────────────────────────────────────────────────
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  totalRow: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },

  // ── Timeline step ────────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    gap: 14,
  },
  stepLeft: {
    alignItems: "center",
    width: 32,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9ca3af",
  },
  stepTime: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
  },
  acceptBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  singleBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  singleBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  completedBanner: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  completedBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },

  // ── Not found ────────────────────────────────────────────────────────────────
  notFoundRoot: {
    flex: 1,
    backgroundColor: "#166634",
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  notFoundBack: {
    color: "#bbf7d0",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default OrderDetails;

/*
 * ─── SUMMARY OF CHANGES ──────────────────────────────────────────────────────
 *
 * ORDER LIST (order.tsx)
 * ──────────────────────
 * [UI-1]  "Farmer Hub" subtitle removed from header — only "Orders" shown
 * [UI-2]  "X new" badge removed from header top-right
 * [UI-3]  Results count label removed
 * [UI-4]  Right chevron arrow removed from every order row
 * [LAY-1] Single flat white body — no nested FlatList container wrappers
 * [LAY-2] FlatList renders directly inside the white body, minimal container
 * [LAY-3] Order row: avatar + name/item + price/status — focused, clean
 * [LAY-4] Header-to-body gap eliminated (marginTop: -2)
 * [ENH-1] Pulsing skeleton placeholders (SkeletonCard) shown while loading
 * [ENH-2] Pull-to-refresh with RefreshControl
 * [ENH-4] handleOrderComplete: removes from list, pushes to history state
 *
 * ORDER DETAILS (order-details.tsx)
 * ────────────────────────────────────
 * [UI-1]  Back button: white background + black Ionicons arrow-back
 * [UI-2]  Header status badge removed — status now shown inline beside name
 * [UI-3]  Order date row below customer name removed
 * [UI-4]  Total price row below customer name removed (visible in pricing section)
 * [UI-5]  Product images added to items — emoji fallback when no image URI
 * [LAY-1] All sections inside ONE white rounded container (borderTopRadius 28)
 *         instead of multiple separate white cards with individual shadows
 * [LAY-2] Sections separated by simple 1 pt divider lines — no box wrappers
 * [LAY-3] Clean typography: consistent fontSize, color, fontWeight throughout
 * [ENH-1] "Order Complete" button on Delivered orders → calls onOrderComplete
 *         prop to remove from active list and store in history for Profile page
 * [ENH-2] ConfirmSheet: animated bottom-sheet for all status transitions
 *         (Accept, Decline, Packing→Ready, Ready→Delivered)
 *         Green header + white body matches app-wide modal aesthetic
 * [ENH-3] Animated timeline: spring entrance + staggered delay per step
 *         Each step: coloured dot matching status colour, connector line,
 *         label + timestamp
 */