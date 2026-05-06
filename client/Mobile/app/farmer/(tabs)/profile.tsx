import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const API_URL    = "http://192.168.8.7:5000";
const STATUS_BAR = Constants.statusBarHeight ?? 44;

const C = {
  green800: "#166534",
  green700: "#15803d",
  green100: "#dcfce7",
  green50:  "#f0fdf4",
  gray900:  "#111827",
  gray700:  "#374151",
  gray500:  "#6b7280",
  gray400:  "#9ca3af",
  gray200:  "#e5e7eb",
  gray100:  "#f3f4f6",
  gray50:   "#f9fafb",
  amber600: "#d97706",
  amber800: "#92400e",
  red500:   "#ef4444",
  blue50:   "#eff6ff",
  blue700:  "#1d4ed8",
  white:    "#ffffff",
};

const SALES_SUMMARY = {
  todayEarnings: 2200,
  weekTotal:     18900,
  pendingOrders: 3,
};

// ─── Info Field ───────────────────────────────────────────────────────────────
const InfoField = ({
  label, value, isEditing, onChange,
}: {
  label: string; value: string; isEditing: boolean; onChange: (t: string) => void;
}) => (
  <View style={p.infoField}>
    <Text style={p.infoFieldLabel}>{label.toUpperCase()}</Text>
    {isEditing ? (
      <TextInput
        value={value}
        onChangeText={onChange}
        style={p.infoFieldInput}
        placeholderTextColor={C.gray400}
      />
    ) : (
      <Text style={p.infoFieldValue}>{value || "—"}</Text>
    )}
  </View>
);

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
  <Text style={p.sectionLabel}>{label.toUpperCase()}</Text>
);

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({
  icon, label, sublabel, onPress, iconBg, iconColor, rightElement, isLast,
}: {
  icon: any; label: string; sublabel?: string; onPress?: () => void;
  iconBg: string; iconColor: string; rightElement?: React.ReactNode; isLast?: boolean;
}) => (
  <>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={p.menuRow}
    >
      <View style={[p.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={p.menuLabel}>{label}</Text>
        {sublabel ? <Text style={p.menuSublabel}>{sublabel}</Text> : null}
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={15} color={C.gray200} />}
    </TouchableOpacity>
    {!isLast && <View style={p.menuDivider} />}
  </>
);

// ─── QR Modal ─────────────────────────────────────────────────────────────────
const QRModal = ({
  visible, userId, farmerName, onClose,
}: {
  visible: boolean; userId: string; farmerName: string; onClose: () => void;
}) => {
  const qrValue = `farmgate://farmer/profile/${userId}`;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={p.qrOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={p.qrSheet}>
          <View style={p.qrHeader}>
            <Text style={p.qrTitle}>My Farm QR Code</Text>
            <TouchableOpacity onPress={onClose} style={p.qrCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color={C.gray500} />
            </TouchableOpacity>
          </View>
          <Text style={p.qrSubtitle}>Let buyers scan this code to view your farm profile</Text>
          <View style={p.qrBox}>
            <QRCode value={qrValue} size={200} color={C.gray900} backgroundColor={C.white} />
          </View>
          <Text style={p.qrName}>{farmerName}</Text>
          <Text style={p.qrHint}>farmgate:// · Farmer Profile</Text>
          <View style={p.qrInstructions}>
            <Ionicons name="information-circle-outline" size={15} color={C.green700} />
            <Text style={p.qrInstructionText}>
              Place this QR code at your farm stall or gate so buyers can easily find your products.
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={p.qrDoneBtn}>
            <Text style={p.qrDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Profile = () => {
  const router = useRouter();

  const [user, setUser] = useState({
    fullName: "Mario Santos",
    email:    "mario.santos@email.com",
    phone:    "09123456789",
    location: "Hagonoy, Bulacan",
    userId:   "farmer-001",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        const res  = await fetch(`${API_URL}/users/${parsedUser.userId}`);
        const data = await res.json();
        setUser((prev) => ({ ...prev, ...data, userId: parsedUser.userId ?? "farmer-001" }));
      } catch {
        // fall back to defaults silently
      }
    };
    loadProfile();
  }, []);

  useFocusEffect(useCallback(() => { setIsEditing(false); }, []));

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          await fetch(`${API_URL}/users/${parsedUser.userId}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              fullName: user.fullName,
              email:    user.email,
              phone:    user.phone,
              location: user.location,
            }),
          });
          Alert.alert("Saved", "Profile updated successfully.");
        }
      } catch {
        Alert.alert("Error", "Failed to save changes. Please try again.");
      }
    }
    setIsEditing((v) => !v);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  return (
    <View style={p.root}>
      <QRModal
        visible={qrVisible}
        userId={user.userId}
        farmerName={user.fullName}
        onClose={() => setQrVisible(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Green Header ── */}
        <View style={p.header}>
          {/* LEFT: avatar */}
          <View style={p.avatarWrapper}>
            <Image
              source={require("../../../assets/images/farmer-profile.jpg")}
              style={p.avatar}
              resizeMode="cover"
            />
            {isEditing && (
              <View style={p.avatarEditBadge}>
                <Ionicons name="camera" size={12} color={C.white} />
              </View>
            )}
          </View>

          {/* RIGHT: name, location, badge */}
          <View style={{ flex: 1, paddingLeft: 14 }}>
            <Text style={p.headerName} numberOfLines={2} adjustsFontSizeToFit>
              {user.fullName}
            </Text>
            <View style={p.headerLocationRow}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.65)" />
              <Text style={p.headerLocation} numberOfLines={1}>{user.location}</Text>
            </View>
            <View style={p.registeredBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#4ade80" />
              <Text style={p.registeredText}>Registered Farmer</Text>
            </View>
          </View>
        </View>

        {/* ── White Body — ONE unified container ── */}
        <View style={p.body}>
          <View style={p.unifiedCard}>

            {/* ── Personal Information ── */}
            <View style={p.cardInner}>
              <View style={p.cardInnerHeader}>
                <SectionLabel label="Personal Information" />
                <TouchableOpacity onPress={handleEditToggle} style={p.editBtn}>
                  <AntDesign name={isEditing ? "check" : "edit"} size={13} color={C.green700} />
                  <Text style={p.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
                </TouchableOpacity>
              </View>
              <InfoField
                label="Full Name" value={user.fullName} isEditing={isEditing}
                onChange={(t) => setUser((u) => ({ ...u, fullName: t }))}
              />
              <InfoField
                label="Email" value={user.email} isEditing={isEditing}
                onChange={(t) => setUser((u) => ({ ...u, email: t }))}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <InfoField
                    label="Phone" value={user.phone} isEditing={isEditing}
                    onChange={(t) => setUser((u) => ({ ...u, phone: t }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InfoField
                    label="Location" value={user.location} isEditing={isEditing}
                    onChange={(t) => setUser((u) => ({ ...u, location: t }))}
                  />
                </View>
              </View>
            </View>

            <View style={p.groupDivider} />

            {/* ── Sales Summary ── */}
            <View style={p.cardInner}>
              <View style={p.cardInnerHeader}>
                <SectionLabel label="Sales Summary" />
                <TouchableOpacity
                  onPress={() => router.push("/farmer/(tabs)/home" as any)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: C.green700 }}>Full Report</Text>
                  <Ionicons name="arrow-forward" size={11} color={C.green700} />
                </TouchableOpacity>
              </View>
              <View style={p.salesRow}>
                <View style={p.salesStatBox}>
                  <Ionicons name="cash-outline" size={16} color={C.green700} />
                  <Text style={p.salesStatValue}>₱{SALES_SUMMARY.todayEarnings.toLocaleString()}</Text>
                  <Text style={p.salesStatLabel}>Today</Text>
                </View>
                <View style={p.salesStatDivider} />
                <View style={p.salesStatBox}>
                  <Ionicons name="trending-up" size={16} color={C.amber600} />
                  <Text style={[p.salesStatValue, { color: C.amber800 }]}>₱{SALES_SUMMARY.weekTotal.toLocaleString()}</Text>
                  <Text style={p.salesStatLabel}>This Week</Text>
                </View>
                <View style={p.salesStatDivider} />
                <View style={p.salesStatBox}>
                  <Ionicons name="receipt-outline" size={16} color={C.blue700} />
                  <Text style={[p.salesStatValue, { color: C.blue700 }]}>{SALES_SUMMARY.pendingOrders}</Text>
                  <Text style={p.salesStatLabel}>Pending</Text>
                </View>
              </View>
            </View>

            <View style={p.groupDivider} />

            {/* ── Account ── */}
            <View style={p.cardInner}>
              <SectionLabel label="Account" />
              <MenuRow
                icon="person-outline" iconBg={C.green50} iconColor={C.green700}
                label="Farm Profile" sublabel="Edit farm info & photos"
                onPress={() => router.push("/farmer/profile/farm-profile" as any)}
              />
              <MenuRow
                icon="qr-code-outline" iconBg={C.green50} iconColor={C.green700}
                label="My QR Code" sublabel="Show buyers how to find you"
                onPress={() => setQrVisible(true)}
                isLast
              />
            </View>

            <View style={p.groupDivider} />

            {/* ── Farm ── */}
            <View style={p.cardInner}>
              <SectionLabel label="Farm" />
              <MenuRow
                icon="leaf-outline" iconBg={C.green50} iconColor={C.green700}
                label="My Products" sublabel="View and manage your listings"
                onPress={() => router.push("/farmer/(tabs)/product" as any)}
              />
              <MenuRow
                icon="bar-chart-outline" iconBg={C.green50} iconColor={C.green700}
                label="Sales Report" sublabel="View earnings and order history"
                onPress={() => router.push("/farmer/(tabs)/home" as any)}
                isLast
              />
            </View>

            <View style={p.groupDivider} />

            {/* ── Support ── */}
            <View style={p.cardInner}>
              <SectionLabel label="Support" />
              <MenuRow
                icon="help-circle-outline" iconBg={C.blue50} iconColor={C.blue700}
                label="Help & FAQ" sublabel="Common questions and guides"
                onPress={() => Alert.alert("Help & FAQ", "Visit farmgate.ph/help or email support@farmgate.ph")}
              />
              <MenuRow
                icon="mail-outline" iconBg={C.blue50} iconColor={C.blue700}
                label="Contact Support" sublabel="support@farmgate.ph"
                onPress={() => Linking.openURL("mailto:support@farmgate.ph")}
              />
              <MenuRow
                icon="shield-checkmark-outline" iconBg={C.blue50} iconColor={C.blue700}
                label="Privacy Policy"
                onPress={() => Alert.alert("Privacy Policy", "Your data is kept private and never sold.")}
              />
              <MenuRow
                icon="information-circle-outline" iconBg={C.blue50} iconColor={C.blue700}
                label="App Version" sublabel="FarmGate v1.0.0"
                rightElement={<Text style={{ fontSize: 12, color: C.gray400 }}>v1.0.0</Text>}
                isLast
              />
            </View>

          </View>

          {/* ── Logout ── */}
          <TouchableOpacity onPress={handleLogout} style={p.logoutBtn} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={C.white} />
            <Text style={p.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

// ─── Styles ───────────────────────────────────────────────────────────────────
const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.green800 },

  // Header — avatar LEFT, text RIGHT
  header: {
    paddingTop: STATUS_BAR + 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    backgroundColor: C.green800,
    flexDirection: "row",       // ← horizontal
    alignItems: "center",
  },
  avatarWrapper: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: C.white,
  },
  avatarEditBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.green700,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: C.white,
  },
  headerName: {
    color: C.white, fontSize: 20, fontWeight: "800", lineHeight: 26, marginBottom: 5,
  },
  headerLocationRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8,
  },
  headerLocation: {
    color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "500", flex: 1,
  },
  registeredBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: "flex-start",
  },
  registeredText: { color: C.white, fontSize: 11, fontWeight: "600" },

  // Body
  body: {
    backgroundColor: C.gray100,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    marginTop: -20, padding: 14,
  },

  // ONE unified white card
  unifiedCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardInner: { paddingHorizontal: 16, paddingVertical: 14 },
  cardInnerHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  groupDivider: { height: 1, backgroundColor: C.gray100 },

  // Section label
  sectionLabel: {
    fontSize: 10, fontWeight: "700", color: C.gray400,
    letterSpacing: 0.8, textTransform: "uppercase",
  },

  // Edit button
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.green50, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  editBtnText: { fontSize: 11, color: C.green700, fontWeight: "700" },

  // Info fields
  infoField: {
    backgroundColor: C.gray50, borderRadius: 10,
    padding: 10, marginBottom: 8,
  },
  infoFieldLabel: {
    fontSize: 10, color: C.gray400, fontWeight: "700",
    marginBottom: 3, letterSpacing: 0.4,
  },
  infoFieldInput: { fontSize: 13, color: C.gray900, padding: 0 },
  infoFieldValue: { fontSize: 13, color: C.gray900, fontWeight: "500" },

  // Sales
  salesRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.gray50, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, marginTop: 10,
  },
  salesStatBox: { flex: 1, alignItems: "center", gap: 5 },
  salesStatValue: { fontSize: 17, fontWeight: "800", color: C.green700, lineHeight: 20 },
  salesStatLabel: {
    fontSize: 10, color: C.gray400, fontWeight: "600",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  salesStatDivider: { width: 1, height: 36, backgroundColor: C.gray200 },

  // Menu rows
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 11, gap: 12,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  menuLabel: { fontSize: 13, fontWeight: "600", color: C.gray900 },
  menuSublabel: { fontSize: 11, color: C.gray400, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: C.gray100, marginLeft: 50 },

  // Logout
  logoutBtn: {
    backgroundColor: C.red500, borderRadius: 16, height: 52,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 8,
    shadowColor: C.red500, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: C.white },



  // QR Modal
  qrOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  qrSheet: {
    backgroundColor: C.white, borderRadius: 24, padding: 24,
    width: "100%", maxWidth: 360, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  qrHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", width: "100%", marginBottom: 6,
  },
  qrTitle: { fontSize: 18, fontWeight: "800", color: C.gray900 },
  qrCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.gray100, alignItems: "center", justifyContent: "center",
  },
  qrSubtitle: {
    fontSize: 12, color: C.gray400, textAlign: "center",
    marginBottom: 20, lineHeight: 18,
  },
  qrBox: {
    padding: 14, borderRadius: 16, borderWidth: 3,
    borderColor: C.green700, backgroundColor: C.white, marginBottom: 14,
  },
  qrName: { fontSize: 15, fontWeight: "700", color: C.gray900, marginBottom: 3 },
  qrHint: { fontSize: 11, color: C.gray400, marginBottom: 18 },
  qrInstructions: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: C.green50, borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: C.green100, width: "100%",
  },
  qrInstructionText: { flex: 1, fontSize: 12, color: C.green700, lineHeight: 18 },
  qrDoneBtn: {
    backgroundColor: C.green800, borderRadius: 14,
    height: 50, width: "100%", alignItems: "center", justifyContent: "center",
  },
  qrDoneBtnText: { color: C.white, fontSize: 15, fontWeight: "800" },
});

/*
 * ─── SUMMARY OF CHANGES — profile.tsx ────────────────────────────────────────
 *
 * BUG FIXES
 * ─────────
 * [FIX-1] BLANK PAGE RESOLVED
 *         Removed unused `Switch` and `Platform` imports from React Native.
 *         These dangling imports were causing a silent render crash that
 *         displayed a blank screen instead of a proper error message.
 *
 * [FIX-2] USER STATE TYPING
 *         `user` state was previously typed as `any`, which masked potential
 *         runtime errors. Now typed as a proper object shape with explicit
 *         fields: fullName, email, phone, location, userId.
 *
 * [FIX-3] EDIT MODE RESET
 *         useFocusEffect now resets `isEditing` to false whenever the screen
 *         regains focus, preventing stale edit state from persisting after
 *         navigating away and coming back.
 *
 * UI / LAYOUT CHANGES
 * ────────────────────
 * [UI-1]  HEADER — AVATAR MOVED TO LEFT
 *         Profile picture moved from RIGHT → LEFT.
 *         Name, location, and "Registered Farmer" badge moved from LEFT → RIGHT.
 *         Header is now flexDirection: "row" with the avatar as the first child
 *         and the text stack beside it with paddingLeft: 14.
 *
 * [UI-2]  UNIFIED CONTAINER
 *         Previously: Personal Info, Sales Summary, Account, Farm, and Support
 *         were each rendered as separate floating cards.
 *         Now: All 5 sections live inside ONE single `unifiedCard` container,
 *         separated by thin `groupDivider` lines. Reduces visual clutter and
 *         gives the page a cleaner two-section feel: header → body card.
 *
 * [UI-3]  SECTION HEADERS
 *         Each section now uses a `cardInnerHeader` row so the section label
 *         (e.g. "PERSONAL INFORMATION") and its action button (Edit / Full
 *         Report) sit on the same line instead of being stacked vertically.
 *
 * [UI-4]  LOGOUT BUTTON
 *         Changed from light-pink background (#fff1f2) to solid red (#ef4444)
 *         with white text and icon. Universally recognized as a destructive
 *         action and stands out clearly at the bottom of the screen.
 *
 * FEATURE CHANGES
 * ────────────────
 * [ENH-1] QR CODE MODAL
 *         QRModal encodes "farmgate://farmer/profile/[userId]" using
 *         react-native-qrcode-svg. Displayed in a centered bottom sheet with
 *         a green-bordered QR, farmer name, instructions, and a Done button.
 *         Tapping outside the modal dismisses it.
 *
 * [ENH-2] SALES SUMMARY (replaces Notification toggles)
 *         Notification toggle switches removed. Replaced with a Sales Summary
 *         section showing: Today's Earnings, This Week Total, and Pending
 *         Orders count. Links to the full sales/home screen via "Full Report".
 *
 * [ENH-3] SUPPORT SECTION — REAL CONTENT
 *         Support section now contains actionable rows:
 *         - Help & FAQ    → Alert with support email
 *         - Contact Support → opens mailto:support@farmgate.ph via Linking
 *         - Privacy Policy  → Alert with privacy summary
 *         - App Version     → displays v1.0.0 as rightElement
 *
 * CODE CLEANUP
 * ─────────────
 * [CLN-1] Removed unused imports: Switch, Platform
 * [CLN-2] SalesSummaryCard standalone component inlined into unified card body
 * [CLN-3] Three separate card components collapsed into one unifiedCard with
 *         cardInner sections and groupDivider separators
 * [CLN-4] menuDivider marginLeft: 50 so the divider line aligns under the text,
 *         not the icon — matches standard iOS/Android list conventions
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */