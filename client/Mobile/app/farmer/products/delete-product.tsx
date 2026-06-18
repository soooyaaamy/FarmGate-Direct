import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { C, shared, T } from "../../../themes/theme";

interface DeleteConfirmationModalProps {
  visible:     boolean;
  productName: string;
  onConfirm:   () => void;
  onCancel:    () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  productName,
  onConfirm,
  onCancel,
}) => {
  // ── Animation ──────────────────────────────────────────────────────────────
  const slideY    = useRef(new Animated.Value(500)).current;
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
        Animated.timing(slideY, { toValue: 500, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]); // eslint-disable-line

  // ── Two-step state ─────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);

  // Always reset to step 1 when modal opens
  useEffect(() => {
    if (visible) setStep(1);
  }, [visible]);

  const handlePrimaryAction = () => {
    if (step === 1) setStep(2); // first tap: advance to final warning
    else            onConfirm();  // second tap: actually delete
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      {/* Backdrop */}
      <Animated.View style={[d.backdrop, { opacity: bgOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
        
        {/* Sheet */}
        <Animated.View style={[d.sheetWrapper, { transform: [{ translateY: slideY }] }]}>
          <View style={d.sheet}>
          {/* Handle */}
          <View style={shared.handle} />

          {/* Trash icon circle */}
          <View style={d.iconWrapper}>
            <View style={d.iconCircle}>
              <Ionicons name="trash-outline" size={30} color={C.red500} />
            </View>
          </View>

          {/* Title changes between steps */}
          <Text style={d.title}>
            {step === 1 ? "Are you sure?" : "This is permanent"}
          </Text>

          {/* Body text */}
          {step === 1 ? (
            <Text style={d.body}>
              You are about to delete{"\n"}
              <Text style={d.productName}>&ldquo;{productName}&rdquo;</Text>
            </Text>
          ) : (
            <Text style={d.body}>
              Deleting{" "}
              <Text style={d.productName}>&ldquo;{productName}&rdquo;</Text>
              {" "}cannot be undone.
            </Text>
          )}

          {/* Warning box — always visible */}
          <View style={d.warningBox}>
            <Ionicons name="warning-outline" size={15} color={C.red500} />
            <Text style={d.warningText}>
              This product and{" "}
              <Text style={{ fontWeight: "700" }}>all associated reviews</Text>
              {" "}will be permanently deleted and cannot be recovered.
            </Text>
          </View>

          {/* ── Buttons ────────────────────────────────────────────────── */}
          {/*
            Cancel is taller + heavier border = more prominent tap target.
            Delete sits below with a lighter light-red style.
          */}

          {/* Cancel — large + prominent */}
          <TouchableOpacity
            onPress={onCancel}
            style={d.cancelBtn}
            activeOpacity={0.8}
          >
            <Text style={d.cancelText}>Keep Product</Text>
          </TouchableOpacity>

          {/* 8 pt gap to avoid misclicks */}
          <View style={{ height: 8 }} />

          {/* Destructive — light-red, clearly labelled */}
          <TouchableOpacity
            onPress={handlePrimaryAction}
            style={shared.btnDestructive}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trash-outline"
              size={14}
              color={C.red600}
              style={{ marginRight: 6 }}
            />
            <Text style={shared.btnDestructiveText}>
              {step === 1 ? "Yes, I'm sure" : "Delete Permanently"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const d = StyleSheet.create({
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
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
  },

  // Icon
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.red100,
    alignItems: "center",
    justifyContent: "center",
  },

  // Copy
  title: {
    fontSize: T.xl,
    fontWeight: "800",
    color: C.gray900,
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: T.base,
    color: C.gray500,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 14,
  },
  productName: {
    fontWeight: "700",
    color: C.gray700,
  },

  // Warning box
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.red50,
    borderRadius: 12,
    padding: 13,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  warningText: {
    flex: 1,
    fontSize: T.sm,
    color: "#b91c1c",
    lineHeight: 18,
  },

  // Cancel — intentionally bigger for prominence
  cancelBtn: {
    height: 56,                // taller than the delete button
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: T.md,
    fontWeight: "800",
    color: C.gray700,
  },
});
