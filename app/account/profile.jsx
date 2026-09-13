import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AppHeader from "../../components/common/AppHeader";
import { COLORS } from "../../constants";
import { useAuth } from "../../context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "ANIL");
  const [mobile, setMobile] = useState(
    user?.mobile || "+91 98490 12345"
  );

  async function saveProfile() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    const updatedUser = {
      ...user,
      name: trimmedName,
      mobile,
    };

    await setUser(updatedUser);

    Alert.alert("Success", "Profile updated successfully.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Edit Profile" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name?.charAt(0)?.toUpperCase() || "A"}
              </Text>
            </View>

            <View style={styles.camera}>
              <Ionicons
                name="camera"
                size={16}
                color={COLORS.white}
              />
            </View>
          </View>

          <Text style={styles.heading}>Personal Information</Text>

          <Text style={styles.label}>FULL NAME</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={19}
              color={COLORS.muted}
            />

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>MOBILE NUMBER</Text>

          <View style={[styles.inputContainer, styles.disabledInput]}>
            <Ionicons
              name="call-outline"
              size={19}
              color={COLORS.muted}
            />

            <TextInput
              value={mobile}
              editable={false}
              style={styles.input}
            />

            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={COLORS.muted}
            />
          </View>

          <Text style={styles.note}>
            Your mobile number is linked to your TWINTO account.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.saveButton}
            onPress={saveProfile}
          >
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginTop: 15,
    marginBottom: 30,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "900",
  },

  camera: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 3,
    borderColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 22,
  },

  label: {
    marginBottom: 8,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.muted,
  },

  inputContainer: {
    height: 54,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },

  disabledInput: {
    backgroundColor: "#F1F4F2",
  },

  input: {
    flex: 1,
    marginLeft: 11,
    fontSize: 14,
    color: COLORS.text,
  },

  note: {
    marginTop: -8,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 17,
  },

  saveButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
});