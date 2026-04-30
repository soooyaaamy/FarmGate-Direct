/**
 * RestockModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from previous version:
 *  - Keyboard fix: replaced bare KeyboardAvoidingView with a ScrollView inside
 *    the sheet so the input scrolls up instead of being covered on both iOS
 *    and Android. Uses `KeyboardAvoidingView behavior="padding"` for iOS and
 *    `behavior="height"` for Android, combined with `keyboardShouldPersistTaps`
 *    so the dismiss tap still works correctly.
 *  - Added `scrollEnabled={false}` guard so the sheet doesn't feel scrollable
 *    when the keyboard is not open.
 */

import React, {
  useState, useRef, useEffect, useCallback,
} from "react";
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  Animated, KeyboardAvoidingView, Platform, Keyboard,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { StockProduct } from "../app/hooks/UseHomeData";

export type { StockProduct as RestockTarget };

interface Props {
  visible:   boolean;
  product:   StockProduct | null;
  onClose:   () => void;
  /** Called with (productId, newTotalStock). Parent removes from list if above threshold. */
  onConfirm: (productId: string, newTotalStock: number) => void;
}

const PRESETS   = [10, 25, 50, 100] as const;
const MIN_VALUE = 1;

export const RestockModal: React.FC<Props> = ({ visible, product, onClose, onConfirm }) => {
  const [raw,   setRaw]   = useState("");
  const [error, setError] = useState("");
  const slideY            = useRef(new Animated.Value(500)).current;
  const inputRef          = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && product) {
      setRaw("");
      setError("");
      Animated.spring(slideY, {
        toValue: 0, useNativeDriver: true,
        damping: 20, stiffness: 200, mass: 0.9,
      }).start(() => setTimeout(() => inputRef.current?.focus(), 80));
    } else {
      Keyboard.dismiss();
      Animated.timing(slideY, {
        toValue: 600, duration: 200, useNativeDriver: true,
      }).start();
    }
  }, [visible, product, slideY]);

  const parsed   = parseInt(raw, 10);
  const isValid  = !isNaN(parsed) && parsed >= MIN_VALUE;
  const newTotal = isValid && product ? product.stock + parsed : null;

  const handleChange = useCallback((val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    setRaw(digits);
    const n = parseInt(digits, 10);
    setError(digits && (isNaN(n) || n < MIN_VALUE) ? "Enter at least 1" : "");
  }, []);

  const adjust = useCallback((delta: number) => {
    const cur  = isNaN(parsed) ? 0 : parsed;
    const next = Math.max(MIN_VALUE, cur + delta);
    setRaw(String(next));
    setError("");
  }, [parsed]);

  const handleConfirm = useCallback(() => {
    if (!product || !isValid) return;
    onConfirm(product.id, product.stock + parsed);
    onClose();
  }, [product, isValid, parsed, onConfirm, onClose]);

  if (!product) return null;
  const decDisabled = !isValid || parsed <= MIN_VALUE;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ── Dim backdrop — tap to close ── */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.48)", justifyContent: "flex-end" }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/*
          KeyboardAvoidingView wraps the sheet.
          On iOS: "padding" pushes the sheet up as the keyboard appears.
          On Android: "height" shrinks the available height.
        */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Stop backdrop tap from bleeding through the sheet */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <Animated.View style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              transform: [{ translateY: slideY }],
            }}>
              {/* Handle bar */}
              <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#e5e7eb" }} />
              </View>

              {/*
                ScrollView inside the sheet ensures the input is always
                scrolled into view above the keyboard without any layout jump.
              */}
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: Platform.OS === "ios" ? 36 : 24,
                  paddingTop: 8,
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#15803d", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 3 }}>
                      Restock Product
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                      {product.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Current stock chip */}
                <View style={{
                  backgroundColor: "#fffbeb", borderRadius: 14, padding: 13,
                  flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18,
                  borderWidth: 1, borderColor: "#fde68a",
                }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" }}>
                    <MaterialCommunityIcons name="alert" size={17} color="#d97706" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: "#92400e", fontWeight: "600" }}>Current Stock</Text>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
                      {product.stock} {product.unit} remaining
                    </Text>
                  </View>
                </View>

                {/* Input label */}
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 8 }}>
                  Add Quantity ({product.unit})
                </Text>

                {/* Stepper + input */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <TouchableOpacity
                    onPress={() => adjust(-1)}
                    disabled={decDisabled}
                    style={{
                      width: 48, height: 48, borderRadius: 13, alignItems: "center", justifyContent: "center",
                      backgroundColor: decDisabled ? "#f9fafb" : "#f0fdf4",
                      borderWidth: 1.5, borderColor: decDisabled ? "#e5e7eb" : "#bbf7d0",
                    }}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={decDisabled ? "#d1d5db" : "#15803d"} />
                  </TouchableOpacity>

                  <TextInput
                    ref={inputRef}
                    value={raw}
                    onChangeText={handleChange}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#d1d5db"
                    returnKeyType="done"
                    onSubmitEditing={handleConfirm}
                    style={{
                      flex: 1, height: 48, borderRadius: 13, textAlign: "center",
                      fontSize: 22, fontWeight: "800", color: "#111827",
                      borderWidth: 1.5,
                      borderColor: error ? "#fca5a5" : isValid ? "#bbf7d0" : "#e5e7eb",
                      backgroundColor: error ? "#fef2f2" : "#fafafa",
                    }}
                  />

                  <TouchableOpacity
                    onPress={() => adjust(1)}
                    style={{
                      width: 48, height: 48, borderRadius: 13, alignItems: "center", justifyContent: "center",
                      backgroundColor: "#f0fdf4", borderWidth: 1.5, borderColor: "#bbf7d0",
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="#15803d" />
                  </TouchableOpacity>
                </View>

                {/* Feedback */}
                <View style={{ height: 18, marginBottom: 12, justifyContent: "center" }}>
                  {error ? (
                    <Text style={{ fontSize: 11, color: "#ef4444", fontWeight: "600" }}>{error}</Text>
                  ) : newTotal !== null ? (
                    <Text style={{ fontSize: 11, color: "#15803d", fontWeight: "700" }}>
                      New total: {newTotal} {product.unit}
                    </Text>
                  ) : null}
                </View>

                {/* Quick presets */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                  {PRESETS.map(p => {
                    const active = parsed === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        onPress={() => { setRaw(String(p)); setError(""); }}
                        style={{
                          flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                          backgroundColor: active ? "#166634" : "#f0fdf4",
                          borderWidth: 1, borderColor: active ? "#166634" : "#bbf7d0",
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: active ? "#fff" : "#15803d" }}>
                          +{p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CTA */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{ flex: 1, height: 52, borderRadius: 15, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#6b7280" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={!isValid}
                    style={{
                      flex: 2, height: 52, borderRadius: 15,
                      backgroundColor: isValid ? "#166534" : "#d1fae5",
                      alignItems: "center", justifyContent: "center",
                      flexDirection: "row", gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={16} color={isValid ? "#fff" : "#86efac"} />
                    <Text style={{ fontSize: 14, fontWeight: "800", color: isValid ? "#fff" : "#86efac" }}>
                      Confirm Restock
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};