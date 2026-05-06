import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { API_CONFIG } from "../constants/api";

const RegisterBuyer = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validID, setValidID] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setValidID(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword || !validID) {
      Alert.alert("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(API_CONFIG.AUTH.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: "Buyer",
          photo: validID,
        }),
      });

      const data = await res.json();
      Alert.alert(data.message);

      if (res.ok) router.push("/login");
    } catch (error) {
      Alert.alert("Something went wrong.");
    }
  };

  return (
    <View className="flex-1 bg-green-700">
      {/* HEADER */}
      <View className="items-center pt-16 pb-8">
        <Image
          source={require("../assets/Farmgate-logos/farmgate-logo.png")}
          className="w-16 h-16 mb-3"
          resizeMode="contain"
        />
        <Text className="text-white text-[26px] font-bold">
          FARMGATE DIRECT
        </Text>
      </View>

      {/* WHITE CARD */}
      <View className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-6 justify-between">
        <View>
          <Text className="text-green-700 mb-2">Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            className="border border-green-700 rounded-lg px-4 py-3 mb-3"
          />

          <Text className="text-green-700 mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            className="border border-green-700 rounded-lg px-4 py-3 mb-3"
          />

          
          <Text className="text-green-700 mb-2">Phone No.</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="border border-green-700 rounded-lg px-4 py-3 mb-3"
          />

          <Text className="text-green-700 mb-2">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-green-700 rounded-lg px-4 py-3 mb-3"
          />

          <Text className="text-green-700 mb-2">Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="border border-green-700 rounded-lg px-4 py-3 mb-3"
          />

          <Text className="text-green-700 mb-2">Upload Valid ID</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="bg-gray-200 border border-green-700 rounded-lg py-4 px-4 mb-6 flex-row items-center justify-center"
          >
            {validID ? (
              <View className="flex-row items-center">
                <Text className="text-green-700 font-semibold mr-2">
                  Image Uploaded 
                </Text>
                <AntDesign name="check" size={24} color="green" />
              </View>
            ) : (
              <Text className="text-gray-500">Upload Image</Text>
            )}
          </TouchableOpacity> 
        </View>

        {/* BUTTON + FOOTER */}
        <View className="flex-1 items-center mt-2">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-green-700 py-3 rounded-xl w-40 mb-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-gray-500">
            Already have an account?{" "}
            <Text
              className="text-green-700 font-semibold"
              onPress={() => router.push("/login")}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RegisterBuyer;
