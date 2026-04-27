import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.8.26:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log("LOGIN SUCCESS:", data);

      // ✅ Save EXACT user object
      await AsyncStorage.setItem("user", JSON.stringify(data));

      // ✅ Role based redirect
      if (data.role === "farmer") {
        router.replace("/farmer/(tabs)/home");
      } else if (data.role === "buyer") {
        router.replace("/buyer/(tabs)/home");
      } else {
        Alert.alert("Unknown role");
      }

    } catch (error) {
      console.log("LOGIN ERROR:", error);
      Alert.alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-green-700">
      {/* Header */}
      <View className="flex-1 items-center justify-center mb-10">
        <Image
          className="w-16 h-16 mb-3"
          resizeMode="contain"
        />
        <Text className="text-white text-[30px] font-bold">
          FARMGATE DIRECT
        </Text>
      </View>

      {/* Welcome Text */}
      <Text className="text-[20px] font-bold text-white ml-10">Hello!</Text>
      <Text className="text-[15px] text-white mb-6 ml-10">
        Welcome to FarmGate Direct
      </Text>

      {/* White Card */}
      <View className="bg-white rounded-t-[40px] px-6 pt-10 pb-10">
        {/* Email */}
        <Text className="text-[20px] text-green-700 mb-5">Email</Text>
        <TextInput
          className="border border-green-700 rounded-lg px-4 py-5 mb-4"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text className="text-[20px] text-green-700 mb-5">Password</Text>
        <TextInput
          className="border border-green-700 rounded-lg px-4 py-5 mb-7"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <View className="items-center justify-center">
          <TouchableOpacity
            className="bg-green-700 py-3 rounded-xl w-40 items-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Login
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text className="text-center text-gray-500 mt-7">
          Don’t have an account yet?{" "}
          <Text
            className="text-green-700 font-semibold"
            onPress={() => router.push("./register")}
          >
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Login;