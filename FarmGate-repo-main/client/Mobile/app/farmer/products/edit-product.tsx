import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useState } from "react";
import {
  Alert, Image, ScrollView, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { productStore } from "../../../store/productStore";

type Category = "Vegetables" | "Fruits" | "Egg & Poultry" | "Rice";
type Unit = "kg" | "pc" | "bundle" | "pack" | "liter";
type Status = "Available" | "Out of Stock";
type Freshness = "Freshly Harvested" | "1-2 Days" | "3-5 Days" | "1 Week+";

const CATEGORIES: Category[] = ["Vegetables", "Fruits", "Egg & Poultry", "Rice"];
const UNITS: Unit[] = ["kg", "pc", "bundle", "pack", "liter"];
const FRESHNESS_OPTIONS: Freshness[] = ["Freshly Harvested", "1-2 Days", "3-5 Days", "1 Week+"];

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
    {required && <Text style={{ fontSize: 11, color: "#ef4444", marginLeft: 3, fontWeight: "700" }}>*</Text>}
  </View>
);

const EditProductScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  // ── Load existing product from store ──
  const existing = productStore.find((p) => p.id === id);

  const [image, setImage]             = useState<any>(existing?.image ?? null);
  const [name, setName]               = useState(existing?.name ?? "");
  const [category, setCategory]       = useState<Category>((existing?.category as Category) ?? "Vegetables");
  const [unit, setUnit]               = useState<Unit>((existing?.unit as Unit) ?? "kg");
  const [price, setPrice]             = useState(existing?.price?.toString() ?? "");
  const [stock, setStock]             = useState(existing?.stock?.toString() ?? "");
  const [status, setStatus]           = useState<Status>((existing?.status as Status) ?? "Available");
  const [freshness, setFreshness]     = useState<Freshness>((existing?.freshness as Freshness) ?? "Freshly Harvested");
  const [description, setDescription] = useState(existing?.description ?? "");

  const handleImagePick = () => {
    Alert.alert("Product Photo", "Choose how to update the photo", [
      {
        text: "Take Photo", onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
          if (!result.canceled) setImage(result.assets[0].uri);
        }
      },
      {
        text: "Choose from Gallery", onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
          if (!result.canceled) setImage(result.assets[0].uri);
        }
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    if (!name.trim())  { Alert.alert("Missing Info", "Please enter a product name."); return; }
    if (!price.trim()) { Alert.alert("Missing Info", "Please enter a price."); return; }
    if (!stock.trim()) { Alert.alert("Missing Info", "Please enter stock quantity."); return; }

    // ── Update product in shared store ──
    const idx = productStore.findIndex((p) => p.id === id);
    if (idx !== -1) {
      productStore[idx] = {
        ...productStore[idx],
        name: name.trim(),
        category,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock),
        image,
        description,
        freshness,
        status,
      };
    }

    Alert.alert("Success", "Product updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const ChipSelector = <T extends string>({ options, value, onChange, wrap }: { options: T[]; value: T; onChange: (v: T) => void; wrap?: boolean }) => (
    <View style={{ flexDirection: "row", flexWrap: wrap ? "wrap" : "nowrap", gap: 8, marginBottom: 20 }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: value === opt ? "#15803d" : "#e5e7eb", backgroundColor: value === opt ? "#15803d" : "#ffffff" }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: value === opt ? "#fff" : "#6b7280" }}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#166534" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: STATUS_BAR + 16, paddingHorizontal: 20, paddingBottom: 32, backgroundColor: "#166534" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 10 }} onPress={() => router.back()}>
              <FontAwesome5 name="chevron-left" size={16} color="white" />
              <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 20, marginRight: 16 }}>Edit Product</Text>
          </View>
        </View>

        <View style={{ backgroundColor: "#f3f4f6", borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingHorizontal: 20, paddingTop: 28, marginTop: -20 }}>

          <FieldLabel label="Product Image" />
          <TouchableOpacity onPress={handleImagePick} style={{ backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center", height: 160, overflow: "hidden", marginBottom: image ? 8 : 20 }}>
            {image ? (
              <Image source={typeof image === "string" ? { uri: image } : image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <View style={{ alignItems: "center", gap: 8 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
                  <MaterialCommunityIcons name="camera-plus-outline" size={28} color="#15803d" />
                </View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#6b7280" }}>Tap to update photo</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>Camera or gallery</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onPress={handleImagePick} style={{ alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: "#15803d", fontSize: 12, fontWeight: "700" }}>Change photo</Text>
            </TouchableOpacity>
          )}

          <FieldLabel label="Product Name" required />
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 48, marginBottom: 20 }}>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Organic Fresh Tomatoes" placeholderTextColor="#B0C4B4" style={{ flex: 1, fontSize: 14, color: "#111827" }} />
          </View>

          <FieldLabel label="Category" required />
          <ChipSelector options={CATEGORIES} value={category} onChange={setCategory} wrap />

          <FieldLabel label="Unit" required />
          <ChipSelector options={UNITS} value={unit} onChange={setUnit} />

          <FieldLabel label="Price (₱)" required />
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 48, marginBottom: 20 }}>
            <Text style={{ color: "#9ca3af", fontSize: 16, marginRight: 4 }}>₱</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder={`0.00 per ${unit}`} placeholderTextColor="#B0C4B4" keyboardType="numeric" style={{ flex: 1, fontSize: 14, color: "#111827" }} />
          </View>

          <FieldLabel label="Stock Quantity" required />
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 48, marginBottom: 20 }}>
            <MaterialCommunityIcons name="package-variant-closed" size={16} color="#9BB09E" style={{ marginRight: 8 }} />
            <TextInput value={stock} onChangeText={setStock} placeholder={`How many ${unit} available?`} placeholderTextColor="#B0C4B4" keyboardType="numeric" style={{ flex: 1, fontSize: 14, color: "#111827" }} />
          </View>

          <FieldLabel label="Status" required />
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {(["Available", "Out of Stock"] as Status[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={{ flex: 1, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: status === s ? (s === "Available" ? "#15803d" : "#ef4444") : "#e5e7eb", backgroundColor: status === s ? (s === "Available" ? "#f0fdf4" : "#fef2f2") : "#fff", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s === "Available" ? "#15803d" : "#ef4444" }} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: status === s ? (s === "Available" ? "#15803d" : "#ef4444") : "#6b7280" }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FieldLabel label="Freshness" required />
          <ChipSelector options={FRESHNESS_OPTIONS} value={freshness} onChange={setFreshness} wrap />

          <FieldLabel label="Description" />
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 14, paddingVertical: 12, marginBottom: 28 }}>
            <TextInput value={description} onChangeText={setDescription} placeholder="Describe your product — harvest date, farming method, quality..." placeholderTextColor="#B0C4B4" multiline numberOfLines={4} style={{ fontSize: 14, color: "#111827", minHeight: 90, textAlignVertical: "top" }} />
          </View>

          <TouchableOpacity onPress={handleSave} style={{ backgroundColor: "#15803d", borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProductScreen;