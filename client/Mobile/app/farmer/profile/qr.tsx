import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";

const QR = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDownload = () => {
    Alert.alert("Download", "QR Code saved to your device.");
  };

  return (
    <View className="flex-1 bg-green-700">
      {/* Header */}
      <View className="bg-green-700 px-6 py-4 pt-16 flex-row items-center justify-between">
        {/* Left Side (Back + Title) */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-[25px] font-bold ml-3">QR Code</Text>
        </View>

        {/* Right Side (Help Icon) */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="help-circle-outline" size={35} color="white" />
        </TouchableOpacity>
      </View>

      {/* White container */}
      <View className="flex-1 bg-white rounded-t-[40px] px-6 justify-center items-center">
        {/* QR Image Placeholder */}
        <View className="border-4 border-green-600 p-4 rounded-2xl">
          <Image
            source={{
              uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FarmerQRCode",
            }}
            style={{ width: 200, height: 200 }}
          />
        </View>

        {/* Download Button */}
        <TouchableOpacity
          onPress={handleDownload}
          className="bg-green-700 px-10 py-3 rounded-xl mt-8"
        >
          <Text className="text-white font-semibold">Download</Text>
        </TouchableOpacity>

        {/* Instruction Text */}
        <Text className="text-center text-gray-600 mt-6 px-4">
          Download your QR code and place it at your farm gate or stall so
          buyers can easily scan and connect with you.
        </Text>
      </View>

      {/* Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-green-700 mb-4">
              How to Use QR Code
            </Text>

            <Text className="text-gray-600 mb-2">
              1. Tap the &quot;Download&quot; button.
            </Text>
            <Text className="text-gray-600 mb-2">
              2. Save the QR code to your device.
            </Text>
            <Text className="text-gray-600 mb-2">3. Print the QR code.</Text>
            <Text className="text-gray-600 mb-4">
              4. Place it at your farm gate or selling area for buyers to scan.
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-green-700 py-2 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default QR;
// TODO: Implement actual QR code generation and downloading functionality using libraries like 'react-native-qrcode-svg' and 'expo-file-system'.
// TODO: Add error handling for download failures and provide user feedback.
// TODO: Consider adding sharing options for the QR code to allow farmers to share it directly with buyers via messaging apps.
// TODO: Once the QR is scanned, implement functionality to display the farm profile.
// TODO: Change the guide text to be more informative and user-friendly, possibly with step-by-step instructions or tips for maximizing the use of the QR code.