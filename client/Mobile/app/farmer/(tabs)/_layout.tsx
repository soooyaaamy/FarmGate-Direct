import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

// Tab Icon
const TabIcon = ({ focused, icon, title }: any) => {
  return (
    <View
      className={`flex flex-row w-full h-full flex-1 min-w-[90px] min-h-[50px]  justify-center
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
          paddingTop: 10,
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

      {/* Add Product */}
      <Tabs.Screen
        name="product"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="add-circle" title="Product" />
          ),
        }}
      />

      {/* Orders */}
      <Tabs.Screen
        name="order"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="cube" title="Orders" />
          ),
        }}
      />

      {/* Messages */}
      <Tabs.Screen
        name="message"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="chatbubble-ellipses"
              title="Message"
            />
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
