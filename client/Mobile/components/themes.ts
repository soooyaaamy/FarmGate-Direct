/**
 * theme.ts — Shared design tokens for FarmGate product management
 * All modals, cards, and form components import from here to stay consistent.
 */

import { StyleSheet } from "react-native";

// ─── Palette ──────────────────────────────────────────────────────────────────
export const C = {
  // Brand greens
  green900: "#14532d",
  green800: "#166534",
  green700: "#15803d",
  green600: "#16a34a",
  green100: "#dcfce7",
  green50:  "#f0fdf4",

  // Ambers (low-stock)
  amber800: "#92400e",
  amber600: "#d97706",
  amber200: "#fde68a",
  amber50:  "#fffbeb",

  // Reds (destructive)
  red600:   "#dc2626",
  red500:   "#ef4444",
  red400:   "#f87171",
  red100:   "#fee2e2",
  red50:    "#fff1f2",

  // Blues (info / edit)
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

// ─── Typography scale ─────────────────────────────────────────────────────────
export const T = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   15,
  lg:   17,
  xl:   20,
  "2xl": 24,
};

// ─── Shared modal sheet styles ────────────────────────────────────────────────
export const sheetStyles = StyleSheet.create({
  // The white pill at the top of every sheet
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.gray200,
    alignSelf: "center",
    marginBottom: 20,
  },

  // Sheet container (white, rounded top)
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  // Section label inside sheet (uppercase, spaced)
  fieldLabel: {
    fontSize: T.xs,
    fontWeight: "700",
    color: C.gray500,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 7,
  },

  // Standard text input box
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

  // Input when focused
  inputFocused: {
    borderColor: C.green700,
    backgroundColor: C.white,
  },

  // Multiline textarea
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

  // Primary (green) full-width button
  btnPrimary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.green800,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: C.white,
    fontSize: T.md,
    fontWeight: "800",
  },

  // Secondary / ghost button
  btnSecondary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.gray200,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  btnSecondaryText: {
    color: C.gray500,
    fontSize: T.md,
    fontWeight: "700",
  },

  // Destructive (light-red) button
  btnDestructive: {
    height: 52,
    borderRadius: 16,
    backgroundColor: C.red100,
    borderWidth: 1.5,
    borderColor: C.red400,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 10,
  },
  btnDestructiveText: {
    color: C.red600,
    fontSize: T.md,
    fontWeight: "800",
  },

  // Disabled button (greyed out)
  btnDisabled: {
    backgroundColor: C.gray200,
    borderWidth: 0,
  },
  btnDisabledText: {
    color: C.gray400,
  },

  // Error message below a field
  errorText: {
    fontSize: T.sm,
    color: C.red500,
    marginTop: 4,
    marginBottom: 4,
  },

  // Success hint (green) below a field
  hintSuccess: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: C.green50,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  hintSuccessText: {
    fontSize: T.sm,
    color: C.green700,
    fontWeight: "600",
    flex: 1,
  },
});