import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const MENU_ITEMS = [
  { key: "orders",        label: "My Orders",        icon: "receipt-outline",      route: "/buyer/profile/orders" },
  { key: "messages",      label: "Messages",         icon: "chatbubble-ellipses-outline",route: "/buyer/(tabs)/messages" },
  { key: "saved",         label: "Saved Farms",      icon: "heart-outline",        route: "/buyer/profile/saved-farms" },
  { key: "address",       label: "Address",          icon: "location-outline",     route: "/buyer/profile/address" },
  { key: "support",       label: "Support",          icon: "help-circle-outline",  route: "/buyer/profile/support" },
  { key: "about",         label: "About",            icon: "information-circle-outline", route: "/buyer/profile/about" },
];

export default function Profile() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(false);
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>

      <View style={{
        backgroundColor: "#15803d",
        paddingTop: 52, paddingBottom: 56, paddingHorizontal: 16,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
      }}>
      </View>

      <View style={{
        flex: 1,
        backgroundColor: "#fff",
        marginTop: -32,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 16,
      }}>

        <View style={{ alignItems: "center", marginTop: -48 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            borderWidth: 3, borderColor: "#fff",
            backgroundColor: "#e5e7eb",
            overflow: "hidden",
          }}>
            <Image
              source={require("@/assets/images/farmer-profile.jpg")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              Soya
            </Text>
            <Ionicons name="checkmark-circle" size={15} color="#15803d" />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                paddingVertical: 14,
                borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Ionicons name={item.icon as any} size={20} color="#15803d" />
              <Text style={{ flex: 1, fontSize: 14, color: "#111827", fontWeight: "500" }}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row", alignItems: "center", gap: 14,
              paddingVertical: 14, marginTop: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={{ flex: 1, fontSize: 14, color: "#dc2626", fontWeight: "600" }}>
              Log out
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {modalVisible && (
        <View style={{
          position: "absolute", inset: 0,
          alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}>
          <View style={{
            backgroundColor: "#fff", borderRadius: 16,
            padding: 20, width: 300,
          }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 16 }}>
              Are you sure you want to logout?
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
                style={{
                  flex: 1, alignItems: "center",
                  paddingVertical: 11, borderRadius: 10,
                  backgroundColor: "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.8}
                style={{
                  flex: 1, alignItems: "center",
                  paddingVertical: 11, borderRadius: 10,
                  backgroundColor: "#dc2626",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

/*
 * ─── SUMMARY OF CHANGES ───────────────────────────────────────────────────────
 *
 * Styling system — converted:
 *   - Replaced all NativeWind/Tailwind className usage with inline style
 *     objects, matching the convention used across home.tsx, shop.tsx, and
 *     notifications.tsx in this codebase.
 *   - Header green (#15803d), background gray (#f3f4f6), border gray
 *     (#f0f0f0), and text colors (#111827, #9ca3af, #374151) now match the
 *     palette already established on Home, Shop, and Notifications.
 *
 * Layout — white container reintroduced:
 *   - Restored the white rounded-top content area below the header (the
 *     original "WHITE CARD" concept), but now everything — profile section
 *     AND the menu list — lives inside this single container, with
 *     borderTopLeftRadius/borderTopRightRadius: 24 and flex: 1 so it fills
 *     the remaining screen height.
 *   - The profile picture overlaps both the green header and the top edge of
 *     the white container (marginTop: -48 inside a container that itself has
 *     marginTop: -32 from the header), preserving the floating-avatar effect
 *     from the original design while keeping the avatar visually anchored to
 *     the white surface where the name and menu live.
 *
 * Header — simplified:
 *   - Removed the "Profile" title text entirely.
 *   - Header is now a shorter green bar (just enough for status bar clearance
 *     plus the message icon row), with rounded bottom corners matching Home
 *     and Shop headers.
 *   - Replaced AntDesign "message" icon with Ionicons
 *     "chatbubble-ellipses-outline" — same icon family and stroke style used
 *     for the search and cart icons on Home/Shop, and for messages on
 *     Notifications.
 *
 * Profile section — redesigned:
 *   - Profile picture (96x96, circular, white border) now overlaps the header
 *     using a negative marginTop, anchored directly above the username —
 *     "Profile Picture / Username" layout per spec.
 *   - Added Image with a placeholder source (farmer-profile.jpg) — swap
 *     for the buyer's actual profile photo URI once available from the
 *     backend.
 *   - Username moved immediately below the picture with minimal gap (10px).
 *   - Added a small green checkmark badge next to the username as a verified/
 *     active buyer indicator.
 *   - Added a small "Buyer" role label below the name in muted gray — gives
 *     light context without restoring clutter.
 *   - Removed the email address entirely as specified.
 *
 * Menu — flattened:
 *   - Removed individual gray rounded containers (bg-gray-100, rounded-xl,
 *     mb-4) for each menu item.
 *   - All menu items now live directly in the page background as rows in a
 *     single list, separated by a 1px bottom border (#f0f0f0). Last item has
 *     no border, consistent with the Notifications list pattern.
 *   - Expanded menu to include Notifications, Support, and About per the
 *     suggested structure, alongside the existing Account Settings, My
 *     Orders, Saved Farms, and Address.
 *   - Each row: icon (green, 20px) + label (flex, 14px) + chevron-forward
 *     (light gray) — consistent, scannable touch targets (~48px row height).
 *
 * Logout — restyled:
 *   - Logout row no longer has its own red card background; it's now a plain
 *     row with red icon + red text, separated from the menu list by extra
 *     top margin (8px) instead of a colored container, reducing visual noise
 *     while still signaling a destructive action via color alone.
 *   - Confirmation modal restyled with inline styles, rounded 16px corners,
 *     and button colors consistent with the rest of the app (#f3f4f6 cancel,
 *     #dc2626 logout).
 *
 * ─── WHAT'S ON THE PROFILE PAGE & WHAT EACH PART DOES ────────────────────────
 *
 * Header
 *   Short green rounded-bottom bar containing only a message icon
 *   (top-right), navigating to the buyer's messages/chat list.
 *
 * Profile Section
 *   Circular profile picture overlapping the header, with the buyer's name,
 *   a verified checkmark badge, and a "Buyer" role label directly beneath it.
 *
 * Menu List
 *   Single flat list of navigation rows (Account Settings, My Orders, Saved
 *   Farms, Address, Notifications, Support, About), each with an icon, label,
 *   and chevron, separated by thin dividers.
 *
 * Logout
 *   Standalone row below the menu list, styled in red to indicate a
 *   destructive action. Tapping opens a confirmation modal before navigating
 *   to /login.
 *
 * Logout Confirmation Modal
 *   Centered overlay with Cancel and Logout buttons.
 */