import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Tab order: Home · Shop · [SCAN] · Alerts · Profile ─────────────────────
// Scanner is index 2 — the exact center of 5 tabs
const TABS = [
  { name: "home",          icon: "home",          label: "Home",    center: false },
  { name: "shop",          icon: "bag",           label: "Shop",    center: false },
  { name: "qr-scanner",    icon: "qr-code",       label: "Scan",    center: true  },
  { name: "notification",  icon: "notifications", label: "Notifications",  center: false },
  { name: "profile",       icon: "person",        label: "Profile", center: false },
] as const;

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function CustomTabBar() {
  const router   = useRouter();
  const segments = useSegments();
  const active   = segments[segments.length - 1] ?? "home";

  return (
    <View style={styles.barWrapper}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const focused = active === tab.name;

          if (tab.center) {
            // ── Center scanner — raised green circle, sits above the bar ──
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => router.push(`/buyer/(tabs)/${tab.name}` as any)}
                style={styles.centerItem}
                activeOpacity={0.8}
              >
                {/* Raised circle */}
                <View style={[styles.scanCircle, focused && styles.scanCircleActive]}>
                  {/* Green QR icon — white fill ring so it pops on green bg */}
                  <Ionicons
                    name="qr-code"
                    size={26}
                    color="#15803d"
                  />
                </View>
                <Text style={[styles.label, focused ? styles.labelActive : styles.labelCenter]}>
                  Scan
                </Text>
              </TouchableOpacity>
            );
          }

          // ── Regular tab ────────────────────────────────────────────────
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(`/buyer/(tabs)/${tab.name}` as any)}
              style={styles.item}
              activeOpacity={0.75}
            >
              <Ionicons
                name={(focused ? tab.icon : `${tab.icon}-outline`) as any}
                size={23}
                color={focused ? "#15803d" : "#9ca3af"}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Sizes ────────────────────────────────────────────────────────────────────
const BAR_H   = Platform.OS === "ios" ? 80 : 64;
const PAD_BOT = Platform.OS === "ios" ? 20 : 0;
const CIRCLE  = 58; // diameter of raised scanner button
const LIFT    = 20; // px the circle rises above the bar top

const styles = StyleSheet.create({
  // Wrapper is taller than the bar so the raised circle has room
  barWrapper: {
    position:      "absolute",
    bottom:        0,
    left:          0,
    right:         0,
    height:        BAR_H + LIFT,
    // Transparent top area passes touches through to screen content
    pointerEvents: "box-none",
  },

  // Visible white bar — anchored to the bottom of the wrapper
  bar: {
    position:        "absolute",
    bottom:          0,
    left:            0,
    right:           0,
    height:          BAR_H,
    paddingBottom:   PAD_BOT,
    backgroundColor: "#ffffff",
    borderTopWidth:  1,
    borderTopColor:  "#e5e7eb",
    flexDirection:   "row",
    alignItems:      "center",
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: -3 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       16,
  },

  // Regular tab item
  item: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    gap:            4,
    paddingTop:     3,
    paddingBottom:  5,
  },

  // Center item — flex-end so label sits at bar baseline,
  // circle overflows upward into the wrapper's extra height
  centerItem: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "flex-end",
    paddingBottom:  PAD_BOT > 0 ? PAD_BOT - 4 : 6,
    gap:            4,
    overflow:       "visible", // critical: allows circle to poke above bar
  },

  // White raised circle with green icon (qr scanner)
  scanCircle: {
    width:           CIRCLE,
    height:          CIRCLE,
    borderRadius:    CIRCLE / 2,
    backgroundColor: "#ffffff",   // white fill so green icon pops
    alignItems:      "center",
    justifyContent:  "center",
    // Push circle up above the bar
    marginBottom:    LIFT - 20, 
    // Green border ring
    borderWidth:     3,
    borderColor:     "#15803d",
  },

  scanCircleActive: {
    backgroundColor: "#f0fdf4", // very light green tint when focused
  },

  label: {
    fontSize:   10,
    color:      "#9ca3af",
    fontWeight: "400",
  },
  labelActive: {
    color:      "#15803d",
    fontWeight: "700",
  },
  // Scanner label is green even when not focused so it pairs with the green circle
  labelCenter: {
    color:      "#15803d",
    fontWeight: "600",
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout() {
  return (
    <Tabs
      // Completely replace the default tab bar with our custom one
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown:         false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Register screens in the SAME order as TABS array */}
      <Tabs.Screen name="home"          />
      <Tabs.Screen name="shop"          />
      <Tabs.Screen name="qr"           />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile"       />
      {/* Cart is opened via the header cart icon, not the tab bar */}
      <Tabs.Screen name="cart" options={{ href: null }} />
    </Tabs>
  );
}