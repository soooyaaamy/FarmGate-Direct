import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 🔐 If permission not loaded yet
  if (!permission) {
    return <View className="flex-1 bg-white" />;  }

  // 🔐 If permission not granted
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="camera-outline" size={60} color="gray" />
        <Text className="text-center mt-4 text-gray-600">
          We need camera permission to scan QR codes.
        </Text>

        <TouchableOpacity
          onPress={requestPermission}
          className="mt-6 bg-green-700 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 📷 When QR is scanned
  const handleScan = ({ data }: any) => {
    setScanned(true);

    Alert.alert(
      "QR Code Scanned",
      `Scanned Data:\n${data}`,
      [
        {
          text: "Scan Again",
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* Overlay Scanner Box */}
      <View className="absolute inset-0 items-center justify-center">
        <View className="w-64 h-64 border-4 border-green-500 rounded-2xl" />
        <Text className="text-white mt-4">
          Align QR code inside the frame
        </Text>
      </View>

      {/* Scan Again Button */}
      {scanned && (
        <TouchableOpacity
          onPress={() => setScanned(false)}
          className="absolute bottom-10 self-center bg-green-700 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            Scan Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
