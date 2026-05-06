import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import Categories from "@/components/Categories";
import { images } from "@/constants/image";
import { API_CONFIG } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/interfaces/product"; // import interface

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_CONFIG.PRODUCTS.LIST);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log("FETCH ERROR:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Image source={images.bg} className="absolute w-full h-full z-0" />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View className="bg-green-600 rounded-b-3xl pb-10">
              <TouchableOpacity className="absolute right-6 top-12">
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <Image
                source={require("../../../assets/Farmgate-logos/farmgate-logo.png")}
                className="w-14 h-14 mt-20 mb-5 mx-auto"
              />

              <Text className="text-white text-center font-bold text-3xl">
                FARMGATE DIRECT
              </Text>

              <Text className="text-green-100 text-center font-semibold text-md">
                A Hyperlocal Farm-to-Table Platform
              </Text>
            </View>

            <View className="mx-6 mt-6 bg-green-600 rounded-2xl p-4 flex-row items-center">
              <View style={{ flex: 1 }}>
                <Text className="text-white font-bold text-xl mb-1">
                  Fresh from Local Farmers
                </Text>

                <Text className="text-green-100 text-md mb-3">
                  100% organic & freshly harvested
                </Text>
              </View>
            </View>

            <Categories />
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/buyer/products/[id]",
                params: { id: item.id }, // only pass id
              })
            }
            style={{
              width: "48%",
              backgroundColor: "#fff",
              borderRadius: 16,
              marginBottom: 16,
              elevation: 3,
            }}
          >
            <View style={{ padding: 10 }}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", height: 120, borderRadius: 10 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 120,
                    backgroundColor: "#eee",
                    borderRadius: 10,
                  }}
                />
              )}

              {/* Name & Freshness */}
              <View className="flex-row items-center mt-2">
                {item.createdAt &&
                  item.freshness &&
                  (() => {
                    const days = parseInt(item.freshness); // "5 days" -> 5
                    const expireTime = days * 86400000; // convert days to milliseconds
                    const isFresh = Date.now() - item.createdAt < expireTime;

                    return isFresh ? (
                      <View className="bg-green-500 px-2 py-1 rounded-md mr-2">
                        <Text className="text-white text-xs font-bold">
                          Fresh
                        </Text>
                      </View>
                    ) : null;
                  })()}

                <Text
                  className="font-semibold text-gray-800 text-sm flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              {/* Farm info & price */}
              <Text className="text-xs text-gray-500 mt-1">
                {item.farmName}
              </Text>
              <Text className="font-bold text-green-700 mt-1">
                ₱{item.price}.00
              </Text>
              <Text className="text-xs text-gray-500 mt-1">{item.stock}</Text>
              <Text className="text-xs text-gray-500 mt-1">{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
