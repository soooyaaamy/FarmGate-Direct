import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(false);
    router.replace("/login"); // redirect sa login page
  };

  return (
    <View className="flex-1 bg-green-700">
      {/* GREEN HEADER */}
      <View className="h-44 bg-green-700 justify-center px-6">
        <Text className="text-white text-2xl font-bold text-center">
          Profile
        </Text>

        <TouchableOpacity
          className="absolute right-8 top-16"
          //onPress={() => router.push("/messages")}
        >
          <AntDesign name="message" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* WHITE CARD */}
      <View className="flex-1 bg-white rounded-t-[40px] items-center px-6 pt-24">
        {/* NAME */}
        <Text className="text-xl font-bold text-gray-800">Soya ✓</Text>

        {/* EMAIL */}
        <Text className="text-gray-400 text-sm mb-6">soyamy@gmail.com</Text>

        {/* OPTIONS */}
        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4"
          onPress={() => router.push("/buyer/profile/account-setting")}
        >
          <Text className="text-green-700 font-semibold">My Account</Text>
          <Ionicons name="person-outline" size={20} color="#15803d" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4"
          onPress={() => router.push("/buyer/profile/address")}
        >
          <Text className="text-green-700 font-semibold">Address</Text>
          <Ionicons name="location-outline" size={20} color="#15803d" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4"
          onPress={() => router.push("/buyer/profile/orders")}
        >
          <Text className="text-green-700 font-semibold">My Orders</Text>
          <Ionicons name="time-outline" size={20} color="#15803d" />
        </TouchableOpacity>

        {/* SAVED FARMS (fixed route) */}
        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4"
          onPress={() => router.push("/buyer/profile/saved-farms")}
        >
          <Text className="text-green-700 font-semibold">Saved Farms</Text>
          <Ionicons name="heart-outline" size={20} color="#15803d" />
        </TouchableOpacity>

        {/* LOG OUT */}
        <TouchableOpacity
          className="w-full flex-row items-center justify-between bg-red-50 p-4 rounded-xl mt-2"
          onPress={() => setModalVisible(true)} // show modal instead of push
        >
          <Text className="text-red-600 font-semibold">Log out</Text>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* FLOATING PROFILE IMAGE */}
      <View className="absolute top-28 self-center items-center">
        <View className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
          <Image
            //source={require("../assets/images/profile-pic.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* LOGOUT CONFIRMATION MODAL */}
      {modalVisible && (
        <View className="absolute inset-0 justify-center items-center bg-black/40">
          <View className="bg-white rounded-2xl p-6 w-80">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Are you sure you want to logout?
            </Text>

            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-gray-200 px-4 py-2 rounded-2xl flex-1 mr-2 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-600 px-4 py-2 rounded-2xl flex-1 ml-2 items-center"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Profile;