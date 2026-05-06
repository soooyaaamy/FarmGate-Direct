import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";           // ← Expo Router, not React Navigation
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

const SCHEME = "farmgate://farmer/profile/";

export default function QRScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isNavigating = useRef(false);

  if (!permission) return <View style={{ flex: 1, backgroundColor: "#fff" }} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionBody}>
          FarmGate needs camera permission to scan farmer QR codes.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.allowBtn}>
          <Text style={styles.allowBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = ({ data }: { data: string }) => {
    if (isNavigating.current || scanned) return;

    if (!data.startsWith(SCHEME)) {
      setScanned(true);
      setErrorMsg("Invalid QR code. Please scan a FarmGate QR.");
      return;
    }

    const farmerId = data.replace(SCHEME, "").trim();
    if (!farmerId) {
      setScanned(true);
      setErrorMsg("QR code is missing farmer data.");
      return;
    }

    isNavigating.current = true;
    setScanned(true);
    setErrorMsg(null);
    Vibration.vibrate(80);

    // ✅ Replace the pathname with wherever your farm profile file lives
    // e.g. if the file is app/buyer/farm-profile.tsx → "/buyer/farm-profile"
    router.push({
      pathname: "/buyer/farmer-profile/farm-profile" as any,
      params: { farmerId },
    });
  };

  const handleScanAgain = () => {
    setScanned(false);
    setErrorMsg(null);
    isNavigating.current = false;
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* Dimmed overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.dimTop} />
        <View style={styles.dimRow}>
          <View style={styles.dimSide} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.dimSide} />
        </View>
        <View style={styles.dimBottom} />
      </View>

      {/* Label / Error */}
      <View style={styles.labelContainer} pointerEvents="none">
        <Ionicons name="qr-code-outline" size={16} color="#fff" />
        <Text style={styles.labelText}>
          {errorMsg ?? "Align the farmer's QR code inside the frame"}
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity onPress={handleScanAgain} style={styles.scanAgainBtn}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const FRAME = 240;
const CORNER = 28;
const BORDER = 4;
const GREEN = "#16A34A";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: {
    flex: 1, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 32, gap: 12,
  },
  permissionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 8 },
  permissionBody: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20 },
  allowBtn: {
    marginTop: 12, backgroundColor: GREEN,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  allowBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  overlay: { ...StyleSheet.absoluteFillObject },
  dimTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  dimRow: { flexDirection: "row", height: FRAME },
  dimSide: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  dimBottom: { flex: 1.5, backgroundColor: "rgba(0,0,0,0.6)" },

  scanFrame: { width: FRAME, height: FRAME, position: "relative" },
  corner: { position: "absolute", width: CORNER, height: CORNER, borderColor: GREEN },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderBottomRightRadius: 6 },

  labelContainer: {
    position: "absolute", bottom: "36%", alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, maxWidth: "80%",
  },
  labelText: { color: "#fff", fontSize: 13, textAlign: "center", flexShrink: 1 },

  scanAgainBtn: {
    position: "absolute", bottom: 48, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: GREEN, paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 14,
  },
  scanAgainText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});