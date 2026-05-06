/**
 * ProductFormModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Add / Edit product form as a scrollable bottom-sheet modal.
 *
 * Design decisions
 * ─────────────────
 * • Bottom-sheet chosen over centred modal: more natural on mobile, leaves
 *   context visible, easier thumb reach on large phones.
 * • Animated.spring entrance / Animated.timing exit for polished feel.
 * • KeyboardAvoidingView wraps the sheet so inputs are never hidden.
 * • ScrollView inside the sheet lets all fields be reachable on small screens.
 * • Per-field inline error messages — no Alert popups.
 * • Price ceiling per category prevents absurd values.
 * • Units are derived from the selected category so the picker is always
 *   contextually relevant.
 * • "mode" prop: "add" | "edit" — form resets or pre-fills accordingly.
 */

import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { C, shared, T } from "../../../themes/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductCategory  = "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";
export type ProductUnit      = "kg" | "g" | "pc" | "bundle" | "pack" | "liter" | "tray" | "sack";
export type ProductStatus    = "Available" | "Low Stock" | "Out of Stock";
export type ProductFreshness = "Freshly Harvested" | "1-2 Days" | "3-5 Days" | "1 Week+";

export interface ProductFormData {
  name:        string;
  category:    ProductCategory;
  unit:        ProductUnit;
  stock:       number;
  maxStock:    number;
  price:       number;
  status:      ProductStatus;
  freshness:   ProductFreshness;
  description: string;
  image:       string | null;
}

interface ProductFormModalProps {
  visible:   boolean;
  mode:      "add" | "edit";
  initial?:  Partial<ProductFormData>;
  onClose:   () => void;
  onSubmit:  (data: ProductFormData) => void;
}

// ─── Lookup tables ────────────────────────────────────────────────────────────

const CATEGORIES: ProductCategory[] = ["Vegetables", "Fruits", "Egg & Poultry", "Rice"];

const UNITS_BY_CAT: Record<ProductCategory, ProductUnit[]> = {
  Vegetables:      ["kg", "g", "bundle", "pc", "pack"],
  Fruits:          ["kg", "g", "pc", "pack"],
  "Egg & Poultry": ["pc", "tray", "pack"],
  Rice:            ["kg", "sack", "pack"],
};

// Max reasonable price per unit per category (₱)
const MAX_PRICE: Record<ProductCategory, number> = {
  Vegetables:      500,
  Fruits:          800,
  "Egg & Poultry": 1000,
  Rice:            200,
};

const FRESHNESS_OPTIONS: ProductFreshness[] = [
  "Freshly Harvested", "1-2 Days", "3-5 Days", "1 Week+",
];

const STATUSES: ProductStatus[] = ["Available", "Low Stock", "Out of Stock"];

const STATUS_STYLE: Record<ProductStatus, { dot: string; activeBg: string; activeBorder: string; activeText: string }> = {
  Available:      { dot: C.green700,  activeBg: C.green50,  activeBorder: C.green700, activeText: C.green700  },
  "Low Stock":    { dot: C.amber600,  activeBg: C.amber50,  activeBorder: C.amber600, activeText: C.amber800  },
  "Out of Stock": { dot: C.gray400,   activeBg: C.gray100,  activeBorder: C.gray400,  activeText: C.gray600   },
};

// ─── Default form ─────────────────────────────────────────────────────────────

const DEFAULT: ProductFormData = {
  name:        "",
  category:    "Vegetables",
  unit:        "kg",
  stock:       0,
  maxStock:    0,
  price:       0,
  status:      "Available",
  freshness:   "Freshly Harvested",
  description: "",
  image:       null,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Horizontal wrappable pill selector */
function PillSelector<T extends string>({
  options,
  value,
  onChange,
  wrap = false,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  wrap?: boolean;
}) {
  return (
    <View style={[f.pillRow, wrap && { flexWrap: "wrap" }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[f.pill, active && f.pillActive]}
            activeOpacity={0.75}
          >
            <Text style={[f.pillText, active && f.pillTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Status selector with colour-coded dot indicators */
function StatusSelector({
  value,
  onChange,
}: {
  value: ProductStatus;
  onChange: (v: ProductStatus) => void;
}) {
  return (
    <View style={[f.pillRow, { flexWrap: "wrap" }]}>
      {STATUSES.map((s) => {
        const active = s === value;
        const cfg    = STATUS_STYLE[s];
        return (
          <TouchableOpacity
            key={s}
            onPress={() => onChange(s)}
            style={[
              f.pill,
              active
                ? { backgroundColor: cfg.activeBg, borderColor: cfg.activeBorder }
                : {},
            ]}
            activeOpacity={0.75}
          >
            <View style={[f.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[f.pillText, active && { color: cfg.activeText, fontWeight: "700" }]}>
              {s}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Labelled section divider */
function SectionDivider({ label }: { label: string }) {
  return (
    <View style={f.dividerRow}>
      <View style={f.dividerLine} />
      <Text style={f.dividerLabel}>{label}</Text>
      <View style={f.dividerLine} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  mode,
  initial,
  onClose,
  onSubmit,
}) => {
  // ── Animation refs ─────────────────────────────────────────────────────────
  const slideY    = useRef(new Animated.Value(700)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, tension: 68, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 700, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm]   = useState<ProductFormData>(DEFAULT);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [focused, setFocused] = useState<string | null>(null);

  // Seed / reset whenever the modal opens
  useEffect(() => {
    if (visible) {
      setForm(mode === "edit" && initial ? { ...DEFAULT, ...initial } : DEFAULT);
      setErrors({});
      setFocused(null);
    }
  }, [visible, mode, initial]);

  // Units derived from current category
  const validUnits = useMemo(() => UNITS_BY_CAT[form.category] ?? ["kg"], [form.category]);

  // When category changes, reset unit to first valid option
  const handleCatChange = useCallback((cat: ProductCategory) => {
    const units = UNITS_BY_CAT[cat];
    setForm((p) => ({ ...p, category: cat, unit: units[0] }));
    setErrors((e) => ({ ...e, category: undefined }));
  }, []);

  // Generic setter + error clear
  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ── Image picker ───────────────────────────────────────────────────────────
  const handlePickImage = () =>
    Alert.alert("Product Photo", "Choose source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const r = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.85,
          });
          if (!r.canceled) set("image", r.assets[0].uri);
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.85,
          });
          if (!r.canceled) set("image", r.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())
      e.name  = "Product name is required.";
    if (form.stock <= 0)
      e.stock = "Quantity must be greater than zero.";
    if (form.price <= 0)
      e.price = "Price must be greater than zero.";
    else if (form.price > MAX_PRICE[form.category])
      e.price = `Max price for ${form.category} is ₱${MAX_PRICE[form.category].toLocaleString()}/${form.unit}.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, maxStock: Math.max(form.stock, form.maxStock) });
  };

  const canSubmit = form.name.trim().length > 0 && form.stock > 0 && form.price > 0;

  // ── Scroll-to-focused-field ────────────────────────────────────────────────
  const scrollRef = useRef<ScrollView>(null);
  const fieldY    = useRef<Record<string, number>>({});

  const onFocus = (key: string) => {
    setFocused(key);
    const y = fieldY.current[key];
    if (y !== undefined) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: y - 16, animated: true }), 80);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const inputStyle = (key: string) => [
    shared.input,
    focused === key   && shared.inputFocused,
    errors[key as keyof ProductFormData] && shared.inputError,
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dimmed backdrop */}
      <Animated.View style={[f.backdrop, { opacity: bgOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        
        {/* Animated sheet */}
        <Animated.View style={[f.sheetWrapper, { transform: [{ translateY: slideY }] }]}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={f.sheet}>
            {/* Handle */}
            <View style={shared.handle} />

            {/* Title row */}
            <View style={f.titleRow}>
              <Text style={f.title}>
                {mode === "add" ? "Add Product" : "Edit Product"}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={C.gray400} />
              </TouchableOpacity>
            </View>

            {/* ── Scrollable form body ── */}
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 520 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* ── 1. PRODUCT IMAGE ──────────────────────────────────── */}
              <SectionDivider label="Photo" />

              <TouchableOpacity onPress={handlePickImage} style={f.imageBox} activeOpacity={0.8}>
                {form.image ? (
                  <Image source={{ uri: form.image }} style={f.imagePreview} resizeMode="cover" />
                ) : (
                  <View style={f.imagePlaceholder}>
                    <View style={f.imagePlaceholderIcon}>
                      <Ionicons name="camera-outline" size={26} color={C.green700} />
                    </View>
                    <Text style={f.imagePlaceholderText}>Tap to add product photo</Text>
                    <Text style={f.imagePlaceholderSub}>Camera or gallery</Text>
                  </View>
                )}
              </TouchableOpacity>
              {form.image && (
                <TouchableOpacity onPress={handlePickImage} style={f.changePhotoBtn}>
                  <Text style={f.changePhotoText}>Change photo</Text>
                </TouchableOpacity>
              )}

              {/* ── 2. PRODUCT DETAILS ───────────────────────────────── */}
              <SectionDivider label="Product Details" />

              {/* Name */}
              <View
                onLayout={(e) => { fieldY.current.name = e.nativeEvent.layout.y; }}
                style={f.fieldGroup}
              >
                <View style={f.labelRow}>
                  <Text style={shared.fieldLabel}>Product Name</Text>
                  <Text style={shared.requiredStar}> *</Text>
                </View>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => set("name", v)}
                  placeholder="e.g. Organic Fresh Tomatoes"
                  placeholderTextColor={C.gray300}
                  style={inputStyle("name")}
                  returnKeyType="next"
                  onFocus={() => onFocus("name")}
                  onBlur={() => setFocused(null)}
                />
                {errors.name && <Text style={shared.errorText}>{errors.name}</Text>}
              </View>

              {/* Category */}
              <View
                onLayout={(e) => { fieldY.current.category = e.nativeEvent.layout.y; }}
                style={f.fieldGroup}
              >
                <Text style={shared.fieldLabel}>Category <Text style={shared.requiredStar}>*</Text></Text>
                <PillSelector options={CATEGORIES} value={form.category} onChange={handleCatChange} wrap />
              </View>

              {/* Unit */}
              <View style={f.fieldGroup}>
                <Text style={shared.fieldLabel}>Unit</Text>
                <PillSelector options={validUnits} value={form.unit} onChange={(v) => set("unit", v)} />
              </View>

              {/* ── 3. INVENTORY ─────────────────────────────────────── */}
              <SectionDivider label="Inventory & Pricing" />

              {/* Quantity + Price side by side */}
              <View style={f.twoCol}>
                {/* Quantity */}
                <View
                  style={{ flex: 1 }}
                  onLayout={(e) => { fieldY.current.stock = e.nativeEvent.layout.y; }}
                >
                  <View style={f.labelRow}>
                    <Text style={shared.fieldLabel}>Quantity</Text>
                    <Text style={shared.requiredStar}> *</Text>
                  </View>
                  <View style={[inputStyle("stock") as object, f.numericRow]}>
                    <Ionicons name="cube-outline" size={14} color={C.gray400} style={{ marginRight: 6 }} />
                    <TextInput
                      value={form.stock > 0 ? String(form.stock) : ""}
                      onChangeText={(v) => set("stock", parseInt(v.replace(/[^0-9]/g, ""), 10) || 0)}
                      placeholder={`0 ${form.unit}`}
                      placeholderTextColor={C.gray300}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      style={f.numericInput}
                      onFocus={() => onFocus("stock")}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                  {errors.stock && <Text style={shared.errorText}>{errors.stock}</Text>}
                </View>

                <View style={{ width: 10 }} />

                {/* Price */}
                <View
                  style={{ flex: 1 }}
                  onLayout={(e) => { fieldY.current.price = e.nativeEvent.layout.y; }}
                >
                  <View style={f.labelRow}>
                    <Text style={shared.fieldLabel}>Price / {form.unit}</Text>
                    <Text style={shared.requiredStar}> *</Text>
                  </View>
                  <View style={[inputStyle("price") as object, f.numericRow]}>
                    <Text style={f.currencySymbol}>₱</Text>
                    <TextInput
                      value={form.price > 0 ? String(form.price) : ""}
                      onChangeText={(v) =>
                        set("price", parseFloat(v.replace(/[^0-9.]/g, "")) || 0)
                      }
                      placeholder="0.00"
                      placeholderTextColor={C.gray300}
                      keyboardType="decimal-pad"
                      returnKeyType="next"
                      style={f.numericInput}
                      onFocus={() => onFocus("price")}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                  {errors.price
                    ? <Text style={shared.errorText}>{errors.price}</Text>
                    : <Text style={f.priceHint}>Max ₱{MAX_PRICE[form.category].toLocaleString()}/{form.unit}</Text>
                  }
                </View>
              </View>

              {/* Status */}
              <View style={f.fieldGroup}>
                <Text style={shared.fieldLabel}>Status</Text>
                <StatusSelector value={form.status} onChange={(v) => set("status", v)} />
              </View>

              {/* ── 4. QUALITY ───────────────────────────────────────── */}
              <SectionDivider label="Quality" />

              {/* Freshness */}
              <View style={f.fieldGroup}>
                <Text style={shared.fieldLabel}>Freshness</Text>
                <PillSelector
                  options={FRESHNESS_OPTIONS}
                  value={form.freshness}
                  onChange={(v) => set("freshness", v)}
                  wrap
                />
              </View>

              {/* Description */}
              <View
                onLayout={(e) => { fieldY.current.description = e.nativeEvent.layout.y; }}
                style={f.fieldGroup}
              >
                <Text style={shared.fieldLabel}>Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(v) => set("description", v)}
                  placeholder="Harvest date, farming method, quality notes…"
                  placeholderTextColor={C.gray300}
                  style={[
                    shared.textarea,
                    focused === "description" && shared.inputFocused,
                  ]}
                  multiline
                  numberOfLines={3}
                  onFocus={() => onFocus("description")}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </ScrollView>

            {/* ── Action buttons ── */}
            <View style={f.actions}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={[shared.btnPrimary, !canSubmit && shared.btnDisabled]}
                activeOpacity={0.85}
              >
                <Text style={[shared.btnPrimaryText, !canSubmit && shared.btnDisabledText]}>
                  {mode === "add" ? "Add Product" : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={shared.btnSecondary}
                activeOpacity={0.75}
              >
                <Text style={shared.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const f = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
  },
  sheetWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontSize: T.lg,
    fontWeight: "800",
    color: C.gray900,
  },
  actions: {
    marginTop: 14,
  },

  // ── Image picker ──────────────────────────────────────────────────────────
  imageBox: {
    height: 148,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: C.gray50,
    borderWidth: 1.5,
    borderColor: C.gray200,
    borderStyle: "dashed",
    marginBottom: 8,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imagePlaceholderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.green50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  imagePlaceholderText: {
    fontSize: T.base,
    fontWeight: "700",
    color: C.gray500,
  },
  imagePlaceholderSub: {
    fontSize: T.sm,
    color: C.gray400,
  },
  changePhotoBtn: {
    alignItems: "center",
    marginBottom: 14,
  },
  changePhotoText: {
    fontSize: T.sm,
    color: C.green700,
    fontWeight: "700",
  },

  // ── Section divider ───────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    marginTop: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.gray100,
  },
  dividerLabel: {
    fontSize: T.xs,
    fontWeight: "700",
    color: C.gray400,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Field groups ──────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  // ── Two-column layout ─────────────────────────────────────────────────────
  twoCol: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  numericRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  numericInput: {
    flex: 1,
    fontSize: T.base,
    color: C.gray900,
    padding: 0,
  },
  currencySymbol: {
    fontSize: T.md,
    color: C.gray400,
    marginRight: 4,
  },
  priceHint: {
    fontSize: 10,
    color: C.gray400,
    marginTop: 3,
  },

  // ── Pill selector ─────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: C.gray200,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pillActive: {
    backgroundColor: C.green800,
    borderColor: C.green800,
  },
  pillText: {
    fontSize: T.sm,
    fontWeight: "600",
    color: C.gray500,
  },
  pillTextActive: {
    color: C.white,
    fontWeight: "700",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

export default ProductFormModal;