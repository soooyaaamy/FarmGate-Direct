import { Image, Text, View } from "react-native";

const items = [
  { name: "Eggs & Poultry", img: require("../assets/images/egg.jpg") },
  { name: "Vegetables", img: require("../assets/images/vegetable.jpg") },
  { name: "Fruits", img: require("../assets/images/fruits.jpg") },
  { name: "Rice & Grains", img: require("../assets/images/rice.jpg") },
];

export default function Categories() {
  return (
    <View className="flex-row justify-between mx-6 mt-6">
      {items.map((item, index) => (
        <View key={index} className="items-center w-[22%]">
          <View className="bg-white rounded-xl w-full items-center py-4">
            <Image source={item.img} className="w-10 h-10" />
          </View>

          <Text className="mt-2 text-[12px] text-center mb-5">
            {item.name}
          </Text>
        </View>
      ))}
    </View>
  );
}
