import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const orders = [
  {
    id: "1",
    name: "Soya",
    product: "Organic Fresh Okra",
    weight: "500g",
    quantity: 1,
    price: 70,
    shipping: 30,
    address: "Purok-1 San Isidro, Hagonoy, Bulacan",
    status: "Pending",
  },
  {
    id: "2",
    name: "Chi",
    product: "Organic Fresh Okra",
    weight: "500g",
    quantity: 2,
    price: 70,
    shipping: 30,
    address: "Hagonoy, Bulacan",
    status: "Accepted",
  },
  {
    id: "3",
    name: "Jaypee",
    product: "Organic Fresh Okra",
    weight: "500g",
    quantity: 1,
    price: 70,
    shipping: 30,
    address: "Bulacan",
    status: "Delivered",
  },
  {
    id: "4",
    name: "Renz",
    product: "Organic Fresh Okra",
    weight: "500g",
    quantity: 3,
    price: 70,
    shipping: 30,
    address: "Bulacan",
    status: "Declined",
  },
  {
    id: "5",
    name: "Lara",
    product: "Organic Fresh Okra",
    weight: "500g",
    quantity: 1,
    price: 70,
    shipping: 30,
    address: "Bulacan",
    status: "Cancelled",
  },
];

const filters = ["All", "Pending", "Accepted", "Delivered", "Declined", "Cancelled"];

const Orders = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return { text: "#D97706", border: "#FACC15" };
      case "Accepted":
        return { text: "#166534", border: "#15803D" };
      case "Delivered":
        return { text: "#1D4ED8", border: "#2563EB" };
      case "Declined":
        return { text: "#B91C1C", border: "#DC2626" };
      case "Cancelled":
        return { text: "#374151", border: "#6B7280" };
      default:
        return { text: "#374151", border: "#9CA3AF" };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#4B8B3B" }}>
      
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: "white", fontSize: 25, fontWeight: "bold" }}>
          Orders
        </Text>
      </View>

      {/* White Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          padding: 20,
        }}
      >

        {/* Filter Tabs */}
        <View
         style={{
          flex: 0   ,
        }}
        >
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: isActive ? "#4B8B3B" : "#E5E5E5",
                }}
              >
                <Text
                  style={{
                    color: isActive ? "white" : "#333",
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        /></View>

        {/* Orders List */}
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          renderItem={({ item }) => {
            const statusColors = getStatusColor(item.status);

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/farmer/orders/[id]",
                    params: {
                      id: item.id,
                      order: JSON.stringify(item),
                    },
                  })
                }
                style={{
                  backgroundColor: "#ECFDF5",
                  padding: 16,
                  borderRadius: 20,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  
                  {/* Avatar */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#34D399",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "bold", color: "#111827", fontSize: 16 }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 14 }}>
                      {item.product} x{item.quantity}
                    </Text>
                  </View>

                  {/* Status */}
                  <View
                    style={{
                      width: 100,
                      paddingVertical: 5,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: statusColors.border,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: statusColors.text,
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>

                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default Orders;