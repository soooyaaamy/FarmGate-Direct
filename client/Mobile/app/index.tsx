import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Index = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-green-700">
      {/* background */}
      <ImageBackground
        //source={require("../assets/images/starting-page-background.jpg")}
        resizeMode="cover"
        className="flex-1 justify-end"
      >
        {/* Container */}
        <View className="bg-white rounded-t-[50%] px-6 pt-10 pb-12 items-center">
          {/* App logo */}
          <Image
            //source={require("../assets/images/farmgate-logo.png")}
            className="w-14 h-14 mb-4"
            resizeMode="contain"
          />

          {/* Title*/}
          <Text className="text-[#407709] text-[30px] font-bold mb-2">
            FARMGATE DIRECT
          </Text>

          {/* Short description */}
          <Text className="text-center text-[#234a00] text-[15px] mb-8 px-4">
            From the hands of farmers to the homes of buyers.
          </Text>

          {/* Started button */}
          <TouchableOpacity
            className="bg-green-700 px-10 py-4 rounded-xl"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white font-bold text-lg">Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Index;