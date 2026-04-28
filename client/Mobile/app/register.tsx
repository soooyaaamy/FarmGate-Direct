import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const Register = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-green-700">
      {/* Header */}
      <View className="items-center justify-center pt-28 pb-20">
        <Image
          source={require("../assets/Farmgate-logos/farmgate-logo.png")}
          className="w-16 h-16 mb-3"
          resizeMode="contain"
        />
        <Text className="text-white text-[30px] font-bold text-center">
          FARMGATE DIRECT
        </Text>
      </View>

      {/* Push white card to bottom */}
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-[40px] px-6 pt-10 pb-10 items-center">
          <View className="w-full items-center">
            <Text className="text-[22px] font-bold text-green-700 text-center mb-8">
              Register As
            </Text>

            {/* Buyer */}
            <TouchableOpacity
              className="mb-6 w-full"
              activeOpacity={0.8}
              onPress={() => router.push("./register-buyer")}
            >
              <Image
                source={require("../assets/Farmgate-logos/register-buyer.jpg")}
                className="w-full h-40 rounded-2xl"
                resizeMode="cover"
              />
              <Text className="text-center text-green-700 font-semibold text-lg mt-3">
                Buyer
              </Text>
            </TouchableOpacity>

            {/* Farmer */}
            <TouchableOpacity
              className="w-full"
              activeOpacity={0.8}
              onPress={() => router.push("./register-farmer")}
            >
              <Image
                source={require("../assets/Farmgate-logos/register-farmer.jpg")}
                className="w-full h-40 rounded-2xl"
                resizeMode="cover"
              />
              <Text className="text-center text-green-700 font-semibold text-lg mt-3">
                Farmer
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-500 mt-10 mb-4">
              Already have an account?{" "}
              <Text
                className="text-green-700 font-semibold"
                onPress={() => router.push("./login")}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Register;
