/*
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-w-[90px] min-h-[60px] mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
};

const _layout = () => {
  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarItemStyle: {
            width: '100%',
            height: "100%",
            justifyContent: 'center',
            alignItems: 'center'
          },
          tabBarStyle: {
            backgroundColor: 'green',
            paddingBottom: 50,
            position: 'absolute',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'darkgreen'
          }
        }}
      >
        <Tabs.Screen name="index" options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          )
        }} />

        <Tabs.Screen name="search" options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          )
        }} />

        <Tabs.Screen name="qrscanner" options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.scanner} title="Scanner" />
          )
        }} />

        <Tabs.Screen name="cart" options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Cart" />
          )
        }} />

        <Tabs.Screen name="profile" options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          )
        }} />
      </Tabs>
    
  );
};

export default _layout;
*/
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
// Tab Icon
const TabIcon = ({ focused, icon, title }: any) => {
  return (
    <View
      className={`flex flex-row w-full h-full flex-1 min-w-[80px] min-h-[50px]  justify-center
         items-center rounded-full overflow-hidden
      ${focused ? "bg-green-800 px-4" : ""}`}
    >
      <Ionicons
        name={focused ? icon : `${icon}-outline`}
        size={22}
        color={focused ? "#ffffff" : "#9ca3af"}
      />

      {focused && (
        <Text className="ml-1 text-white font-semibold text-sm">{title}</Text>
      )}
    </View>
  );
};

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 10
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" title="Home" />
          ),
        }}
      />

      {/* Shop */}
      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="bag" title="Shop" />
          ),
        }}
      />

      {/* QR */}
      <Tabs.Screen
        name="qr"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="qr-code" title="QR" />
          ),
        }}
      />

      {/* Cart */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="cart" title="Cart" />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person" title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;