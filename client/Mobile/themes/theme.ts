/**
 * theme.ts
 * Shared design tokens consumed by every product-management component.
 * Single source of truth → change once, reflects everywhere.
 */

import { StyleSheet } from "react-native";

// ─── Color palette ────────────────────────────────────────────────────────────

export const C = {
  // Brand greens
  green900: "#14532d",
  green800: "#166534",
  green700: "#15803d",
  green100: "#dcfce7",
  green50:  "#f0fdf4",

  // Ambers  (low-stock)
  amber800: "#92400e",
  amber600: "#d97706",
  amber200: "#fde68a",
  amber50:  "#fffbeb",

  // Reds  (destructive / errors)
  red600:   "#dc2626",
  red500:   "#ef4444",
  red400:   "#f87171",
  red100:   "#fee2e2",
  red50:    "#fff1f2",

  // Blues  (edit / info)
  blue700:  "#1d4ed8",
  blue100:  "#dbeafe",
  blue50:   "#eff6ff",

  // Grays
  gray900:  "#111827",
  gray700:  "#374151",
  gray600:  "#4b5563",
  gray500:  "#6b7280",
  gray400:  "#9ca3af",
  gray300:  "#d1d5db",
  gray200:  "#e5e7eb",
  gray100:  "#f3f4f6",
  gray50:   "#f9fafb",

  white:    "#ffffff",
  overlay:  "rgba(0,0,0,0.50)",
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const T = {
  xs:    10,
  sm:    12,
  base:  14,
  md:    15,
  lg:    17,
  xl:    20,
  "2xl": 24,
  "3xl": 26,
};

// ─── Reusable StyleSheet fragments used in every modal/card ───────────────────

export const shared = StyleSheet.create({
  // ── Sheet anatomy ──────────────────────────────────────────────────────────
  /** Draggable handle pill */
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.gray200,
    alignSelf: "center",
    marginBottom: 20,
  },

  // ── Field labels ───────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: T.xs,
    fontWeight: "700",
    color: C.gray500,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  requiredStar: {
    color: C.red500,
    fontWeight: "700",
  },

  // ── Input boxes ────────────────────────────────────────────────────────────
  /** Default single-line input */
  input: {
    height: 50,
    backgroundColor: C.gray50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.gray200,
    paddingHorizontal: 14,
    fontSize: T.base,
    color: C.gray900,
  },
  inputFocused: {
    borderColor: C.green700,
    backgroundColor: C.white,
  },
  inputError: {
    borderColor: C.red400,
    backgroundColor: C.red50,
  },
  /** Multiline textarea */
  textarea: {
    backgroundColor: C.gray50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.gray200,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: T.base,
    color: C.gray900,
    minHeight: 90,
    textAlignVertical: "top",
  },

  // ── Error / hint text ──────────────────────────────────────────────────────
  errorText: {
    fontSize: T.sm,
    color: C.red500,
    marginTop: 4,
    marginBottom: 2,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.green50,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.green100,
  },
  hintText: {
    flex: 1,
    fontSize: T.sm,
    color: C.green700,
    fontWeight: "600",
  },

  // ── Buttons ────────────────────────────────────────────────────────────────
  /** Full-width green primary */
  btnPrimary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.green800,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: C.white,
    fontSize: T.md,
    fontWeight: "800",
  },

  /** Full-width outlined secondary / cancel */
  btnSecondary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.gray200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  btnSecondaryText: {
    color: C.gray700,
    fontSize: T.md,
    fontWeight: "800",
  },

  /** Light-red destructive (NOT solid red — per design requirement) */
  btnDestructive: {
    height: 48,
    borderRadius: 14,
    backgroundColor: C.red100,
    borderWidth: 1.5,
    borderColor: C.red400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  btnDestructiveText: {
    color: C.red600,
    fontSize: T.base,
    fontWeight: "700",
  },

  /** Disabled state override */
  btnDisabled: {
    backgroundColor: C.gray200,
    borderWidth: 0,
  },
  btnDisabledText: {
    color: C.gray400,
  },
});