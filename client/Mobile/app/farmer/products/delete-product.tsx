import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DeleteProductScreen = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useLocalSearchParams<{ id: string }>();
  // TODO: use params.id when connecting to your backend API
  const STATUS_BAR = Constants.statusBarHeight ?? 44;

  // TODO: fetch product name from backend using `_id`
  const productName = "Organic Fresh Tomatoes";

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete this product? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel", onPress: () => router.back() },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => {
            // TODO: call your delete API here using `_id`
            Alert.alert("Deleted", "Product has been removed.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  }, [router]);

  // Auto-trigger confirm dialog when screen loads
  useEffect(() => {
    handleDelete();
  }, [handleDelete]);

  return (
    <View className="flex-1 bg-green-800">

      {/* ── GREEN HEADER ─────────────────────────────────────────────────── */}
      <View style={{ paddingTop: STATUS_BAR + 16 }} className="bg-green-800 px-5 pb-8">
        <TouchableOpacity
          className="flex-row items-center gap-2 mb-4"
          onPress={() => router.back()}
        >
          <FontAwesome5 name="chevron-left" size={16} color="white" />
          <Text className="text-white text-[15px] font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-[24px]">Delete Product</Text>
        <Text className="text-white/60 text-[13px] mt-1">
          This action cannot be undone
        </Text>
      </View>

      {/* ── WHITE ROUNDED BODY ───────────────────────────────────────────── */}
      <View className="flex-1 bg-gray-100 rounded-t-[35px] px-5 pt-10 -mt-5 items-center justify-center">

        {/* Warning icon */}
        <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-5">
          <FontAwesome5 name="trash-alt" size={32} color="#ef4444" />
        </View>

        <Text className="text-[20px] font-bold text-gray-900 text-center mb-2">
          Delete Product?
        </Text>
        <Text className="text-[14px] text-gray-500 text-center mb-2 px-6">
          You are about to delete:
        </Text>

        {/* Fixed: curly quotes replaced with HTML entities */}
        <Text className="text-[16px] font-bold text-gray-800 text-center mb-8 px-6">
          &quot;{productName}&quot;
        </Text>

        <Text className="text-[13px] text-gray-400 text-center mb-10 px-6">
          This will permanently remove the product from your listing. This action cannot be undone.
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-500 rounded-2xl h-14 items-center justify-center w-full mb-3"
        >
          <Text className="text-white font-bold text-[16px]">
            Yes, Delete Product
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white rounded-2xl h-14 items-center justify-center w-full border border-gray-200"
        >
          <Text className="text-gray-600 font-bold text-[16px]">Cancel</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default DeleteProductScreen;