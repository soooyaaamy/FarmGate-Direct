import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Image, ScrollView, Switch, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";

const API_URL = "http://192.168.8.9:5000";
const STATUS_BAR = Constants.statusBarHeight ?? 44;

// ── Info Field ─────────────────────────────────────────────────────────────
const InfoField = ({
  label, value, isEditing, onChange,
}: {
  label: string; value: string; isEditing: boolean; onChange: (t: string) => void;
}) => (
  <View style={{ backgroundColor: "#f9fafb", borderRadius: 10, padding: 10, marginBottom: 8 }}>
    <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "700", marginBottom: 3, letterSpacing: 0.4 }}>
      {label.toUpperCase()}
    </Text>
    {isEditing ? (
      <TextInput
        value={value}
        onChangeText={onChange}
        style={{ fontSize: 13, color: "#111827", padding: 0 }}
      />
    ) : (
      <Text style={{ fontSize: 13, color: "#111827", fontWeight: "500" }}>
        {value || "—"}
      </Text>
    )}
  </View>
);

// ── Section Label ──────────────────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
  <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
    {label.toUpperCase()}
  </Text>
);

// ── Menu Row ───────────────────────────────────────────────────────────────
const MenuRow = ({
  icon, label, sublabel, onPress, iconBg, iconColor, rightElement,
}: {
  icon: any; label: string; sublabel?: string; onPress?: () => void;
  iconBg: string; iconColor: string; rightElement?: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 }}
  >
    <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{label}</Text>
      {sublabel && <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{sublabel}</Text>}
    </View>
    {rightElement ?? <Ionicons name="chevron-forward" size={15} color="#d1d5db" />}
  </TouchableOpacity>
);

const Divider = () => <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 2 }} />;

// ── Main Screen ───────────────────────────────────────────────────────────
const Profile = () => {
  const router = useRouter();

  const [user, setUser] = useState<any>({
    fullName: "Mario Santos",
    email: "mario.santos@email.com",
    phone: "09123456789",
    location: "Hagonoy, Bulacan",
  });
  const [productsCount, setProductsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);

        const userRes = await fetch(`${API_URL}/users/${parsedUser.userId}`);
        const userData = await userRes.json();
        setUser(userData);

        const productRes = await fetch(`${API_URL}/products`);
        const allProducts = await productRes.json();
        const myProducts = allProducts.filter(
          (p: any) => p.userId?.toString() === parsedUser.id?.toString()
        );
        setProductsCount(myProducts.length);
      } catch (error) {
        console.log("PROFILE ERROR:", error);
      }
    };

    loadProfile();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing && user) {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);

        const response = await fetch(`${API_URL}/users/${parsedUser.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            location: user.location,
          }),
        });

        const data = await response.json();
        setUser(data);
        Alert.alert("Saved", "Profile updated successfully.");
      } catch (error) {
        console.log("UPDATE ERROR:", error);
        Alert.alert("Error", "Failed to save changes.");
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/login" as any);
          },
        },
      ]
    );
  };

  return (
  <View style={{ flex: 1, backgroundColor: "#166534" }}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* ── Green Header ── */}
      <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 20, paddingBottom: 48, backgroundColor: "#166534" }}>

        {/* Avatar + name */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../../assets/images/farmer-profile.jpg")}
            style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: "white" }}
            resizeMode="cover"
          />
          <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginTop: 10 }}>
            {user?.fullName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 3 }}>
            {user?.location}
          </Text>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8,
          }}>
            <Ionicons name="checkmark-circle" size={14} color="#4ade80" />
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
              Registered Farmer
            </Text>
          </View>
        </View>
      </View>

      {/* ── White Body ── */}
      <View style={{
        backgroundColor: "#f3f4f6",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        marginTop: -24,
        padding: 16,
        paddingBottom: 60,
      }}>

        {/* ── Personal Information ── */}
        <SectionLabel label="Account" />
        <View style={{ backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
              Personal Information
            </Text>
            <TouchableOpacity
              onPress={handleEditToggle}
              style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                backgroundColor: "#f0fdf4", borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 5,
              }}
            >
              <AntDesign name={isEditing ? "check" : "edit"} size={13} color="#15803d" />
              <Text style={{ fontSize: 11, color: "#15803d", fontWeight: "700" }}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <InfoField label="Full Name"  value={user?.fullName ?? ""} isEditing={isEditing} onChange={(t) => setUser({ ...user, fullName: t })} />
          <InfoField label="Email"      value={user?.email ?? ""}    isEditing={isEditing} onChange={(t) => setUser({ ...user, email: t })} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <InfoField label="Phone"    value={user?.phone ?? ""}    isEditing={isEditing} onChange={(t) => setUser({ ...user, phone: t })} />
            </View>
            <View style={{ flex: 1 }}>
              <InfoField label="Location" value={user?.location ?? ""} isEditing={isEditing} onChange={(t) => setUser({ ...user, location: t })} />
            </View>
          </View>
        </View>

        {/* ── Farm ── */}
        <SectionLabel label="Farm" />
        <View style={{ backgroundColor: "white", borderRadius: 16, paddingHorizontal: 14, marginBottom: 16 }}>
          <MenuRow
            icon="leaf-outline"
            iconBg="#f0fdf4"
            iconColor="#15803d"
            label="Farm Profile"
            sublabel="Edit farm info & photos"
            onPress={() => router.push("/farmer/profile/farm-profile" as any)}
          />
          <Divider />
          <MenuRow
            icon="qr-code-outline"
            iconBg="#f0fdf4"
            iconColor="#15803d"
            label="My QR Code"
            sublabel="Download & share your farm QR"
            onPress={() => router.push("/farmer/profile/qr" as any)}
          />
        </View>

        {/* ── Notifications ── */}
        <SectionLabel label="Notifications" />
        <View style={{ backgroundColor: "white", borderRadius: 16, paddingHorizontal: 14, marginBottom: 16 }}>
          <MenuRow
            icon="bag-check-outline"
            iconBg="#fef3c7"
            iconColor="#b45309"
            label="Order Alerts"
            sublabel="Get notified when a new order arrives"
            rightElement={
              <Switch
                value={orderNotifs}
                onValueChange={setOrderNotifs}
                trackColor={{ false: "#e5e7eb", true: "#bbf7d0" }}
                thumbColor={orderNotifs ? "#16a34a" : "#9ca3af"}
              />
            }
          />
          <Divider />
          <MenuRow
            icon="chatbubble-outline"
            iconBg="#fef3c7"
            iconColor="#b45309"
            label="Message Alerts"
            sublabel="Get notified when buyers message you"
            rightElement={
              <Switch
                value={messageNotifs}
                onValueChange={setMessageNotifs}
                trackColor={{ false: "#e5e7eb", true: "#bbf7d0" }}
                thumbColor={messageNotifs ? "#16a34a" : "#9ca3af"}
              />
            }
          />
        </View>

        {/* ── Support ── */}
        <SectionLabel label="Support" />
        <View style={{ backgroundColor: "white", borderRadius: 16, paddingHorizontal: 14, marginBottom: 16 }}>
          <MenuRow
            icon="help-circle-outline"
            iconBg="#eff6ff"
            iconColor="#1d4ed8"
            label="Help & FAQ"
            sublabel="How to use FarmGate"
            onPress={() => Alert.alert("Help", "Coming soon.")}
          />
          <Divider />
          <MenuRow
            icon="shield-checkmark-outline"
            iconBg="#eff6ff"
            iconColor="#1d4ed8"
            label="Privacy Policy"
            onPress={() => Alert.alert("Privacy", "Coming soon.")}
          />
          <Divider />
          <MenuRow
            icon="information-circle-outline"
            iconBg="#eff6ff"
            iconColor="#1d4ed8"
            label="App Version"
            sublabel="v1.0.0"
            rightElement={
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>v1.0.0</Text>
            }
          />
        </View>

        {/* ── Log Out ── */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#fff1f2",
            borderRadius: 16,
            padding: 10,
            marginBottom: 30,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#ef4444" }}>
            Log Out
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  </View>
);
};

export default Profile;

// TODO: Farmer Profile picture upload
// TODO: Add bio/description field in user model and display in profile
// TODO: Add contents for Help & FAQ and Privacy Policy sections
// FIXME: While in edit mode, if you navigate to another screen and come back, the changes are lost and edit mode is still on. Need to reset edit mode when screen is focused.
// 