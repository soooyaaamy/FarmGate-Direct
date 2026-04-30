/**
 * QuickActions.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact quick-action buttons with badge counts.
 * Uses ONLY MaterialCommunityIcons for consistency.
 * Reduced padding + tighter gap for a denser, more polished layout.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { BadgeCounts } from "../app/hooks/UseHomeData";

interface Action {
  label:    string;
  icon:     string;
  bg:       string;
  iconColor: string;
  route:    string;
  badgeKey?: keyof BadgeCounts;
}

const ACTIONS: Action[] = [
  {
    label: "Products",  icon: "sprout",
    bg: "#f0fdf4", iconColor: "#15803d",
    route: "/farmer/(tabs)/product",
  },
  {
    label: "Orders",    icon: "clipboard-list-outline",
    bg: "#fef9ec", iconColor: "#b45309",
    route: "/farmer/(tabs)/order",
    badgeKey: "orders",
  },
  {
    label: "Messages",  icon: "message-text-outline",
    bg: "#eff6ff", iconColor: "#1d4ed8",
    route: "/farmer/(tabs)/message",
    badgeKey: "messages",
  },
  {
    label: "Deliveries", icon: "truck-delivery-outline",
    bg: "#f5f3ff", iconColor: "#7c3aed",
    route: "/farmer/deliveries/delivery",
    badgeKey: "deliveries",
  },
];

interface Props { badges: BadgeCounts }

export const QuickActions: React.FC<Props> = ({ badges }) => {
  const router = useRouter();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {ACTIONS.map(action => {
        const count = action.badgeKey ? badges[action.badgeKey] : 0;
        return (
          <TouchableOpacity
            key={action.label}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.72}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 4,
              alignItems: "center",
              // subtle card shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Icon container + badge */}
            <View style={{ position: "relative", marginBottom: 7 }}>
              <View style={{
                width: 38, height: 38, borderRadius: 11,
                backgroundColor: action.bg,
                alignItems: "center", justifyContent: "center",
              }}>
                <MaterialCommunityIcons name={action.icon as any} size={20} color={action.iconColor} />
              </View>

              {count > 0 && (
                <View style={{
                  position: "absolute", top: -4, right: -5,
                  backgroundColor: "#ef4444",
                  borderRadius: 8,
                  minWidth: 16, height: 16,
                  alignItems: "center", justifyContent: "center",
                  paddingHorizontal: 3,
                  borderWidth: 1.5, borderColor: "#f3f4f6",
                }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
                    {count > 9 ? "9+" : count}
                  </Text>
                </View>
              )}
            </View>

            <Text style={{
              fontSize: 10, fontWeight: "700", color: "#4b5563", textAlign: "center",
            }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};