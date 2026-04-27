import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const RegisterFarmer = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // STEP 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // STEP 2
  const [farmName, setFarmName] = useState("");
  const [barangay, setBarangay] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [province, setProvince] = useState("");
  const [farmPhoto, setFarmPhoto] = useState(null);

  // STEP 3
  const [productPhoto, setProductPhoto] = useState(null);
  const [validID, setValidID] = useState(null);
  const [farmerCert, setFarmerCert] = useState(null);
  const [rsbaCert, setRsbaCert] = useState(null);

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setter(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async () => {
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !farmName ||
      !barangay ||
      !municipality ||
      !province ||
      !farmPhoto ||
      !productPhoto ||
      !validID ||
      !farmerCert ||
      !rsbaCert
    ) {
      Alert.alert("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://192.168.8.8:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: "Farmer",
          farmName,
          barangay,
          municipality,
          province,
          farmPhoto,
          productPhoto,
          validID,
          farmerCert,
          rsbaCert,
        }),
      });

      const data = await res.json();
      Alert.alert(data.message);

      if (res.ok) router.push("/login");
    } catch (error) {
      Alert.alert("Something went wrong.");
    }
  };

  const StepIndicator = () => (
    <View className="flex-row justify-center mt-4 mb-6">
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          className={`w-8 h-8 rounded-full mx-5 items-center justify-center ${
            step >= item ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-bold">{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-green-700">
      {/* HEADER */}
      <View className="items-center pt-16 pb-6">
        <Image
          source={require("../assets/Farmgate-logos/farmgate-logo.png")}
          className="w-16 h-16 mb-3"
          resizeMode="contain"
        />
        <Text className="text-white text-[26px] font-bold">
          FARMER REGISTRATION
        </Text>

        <StepIndicator />
      </View>

      {/* WHITE CARD */}
      <View className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-6 justify-between">
        {/* Step 1 & Step 3 scrollable */}
        {step === 1 || step === 3 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  value={fullName}
                  setter={setFullName}
                />
                <Input label="Email" value={email} setter={setEmail} />
                <Input label="Phone No." value={phone} setter={setPhone} />
                <Input
                  label="Password"
                  value={password}
                  setter={setPassword}
                  secure
                />
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  setter={setConfirmPassword}
                  secure
                />
              </>
            )}

            {step === 3 && (
              <>
                <UploadBox
                  label="Product Photo"
                  value={productPhoto}
                  setter={() => pickImage(setProductPhoto)}
                />
                <UploadBox
                  label="Valid ID"
                  value={validID}
                  setter={() => pickImage(setValidID)}
                />
                <UploadBox
                  label="Farmer Certificate"
                  value={farmerCert}
                  setter={() => pickImage(setFarmerCert)}
                />
                <UploadBox
                  label="RSBA Certificate"
                  value={rsbaCert}
                  setter={() => pickImage(setRsbaCert)}
                />
              </>
            )}
          </ScrollView>
        ) : (
          // Step 2: Farm info only, no scroll
          <View>
            <Input label="Farm Name" value={farmName} setter={setFarmName} />
            <Input label="Barangay" value={barangay} setter={setBarangay} />
            <Input
              label="Municipality"
              value={municipality}
              setter={setMunicipality}
            />
            <Input label="Province" value={province} setter={setProvince} />
            <UploadBox
              label="Farm Photo"
              value={farmPhoto}
              setter={() => pickImage(setFarmPhoto)}
            />
          </View>
        )}

        {/* BUTTONS */}
        <View className="items-center mt-4 w-full">
          {step === 1 ? (
            <TouchableOpacity
              onPress={nextStep}
              className="bg-green-700 py-3 rounded-xl w-40"
            >
              <Text className="text-white text-center font-bold text-lg">
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row justify-center items-center">
              <TouchableOpacity
                onPress={prevStep}
                className="border border-green-700 py-3 rounded-xl w-40 mr-4"
              >
                <Text className="text-center text-green-700 font-bold text-lg">
                  Back
                </Text>
              </TouchableOpacity>

              {step < 3 ? (
                <TouchableOpacity
                  onPress={nextStep}
                  className="bg-green-700 py-3 rounded-xl w-40"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Next
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleRegister}
                  className="bg-green-700 py-3 rounded-xl w-40"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Register
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const Input = ({ label, value, setter, secure }) => (
  <>
    <Text className="text-green-700 mb-2">{label}</Text>
    <TextInput
      value={value}
      onChangeText={setter}
      secureTextEntry={secure}
      className="border border-green-700 rounded-lg px-4 py-3 mb-3"
    />
  </>
);

const UploadBox = ({ label, value, setter }) => (
  <>
    <Text className="text-green-700 mb-2">{label}</Text>
    <TouchableOpacity
      onPress={setter}
      className="bg-gray-200 border border-green-700 rounded-lg py-4 px-4 mb-4 flex-row items-center justify-center"
    >
      {value ? (
        <View className="flex-row items-center">
          <Text className="text-green-700 font-semibold mr-2">Uploaded</Text>
          <AntDesign name="check" size={22} color="green" />
        </View>
      ) : (
        <Text className="text-gray-500">Upload {label}</Text>
      )}
    </TouchableOpacity>
  </>
);

export default RegisterFarmer;
