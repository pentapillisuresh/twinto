
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../constants";
import { useAuth } from "../../context";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "ANIL");
  const [mobile] = useState(
    user?.mobile || "+91 98490 12345"
  );

  const [photo, setPhoto] = useState(
    user?.photo || user?.avatar || null
  );

  const [saving, setSaving] = useState(false);

  const topInset =
    Platform.OS === "ios" ||
    (Platform.OS === "android" && Platform.Version >= 35)
      ? insets.top
      : 0;

  // OPEN CAMERA
  async function openCamera() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera access to take a profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Camera Error",
        error?.message || "Could not open the camera."
      );
    }
  }

  // OPEN GALLERY
  async function openGallery() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Gallery Error",
        error?.message || "Could not select a photo."
      );
    }
  }

  // PROFILE PHOTO OPTIONS
  function choosePhoto() {
    Alert.alert(
      "Profile Photo",
      "Choose how you want to add your photo.",
      [
        {
          text: "Take Photo",
          onPress: openCamera,
        },
        {
          text: "Choose from Gallery",
          onPress: openGallery,
        },
        ...(photo
          ? [
              {
                text: "Remove Photo",
                style: "destructive",
                onPress: () => setPhoto(null),
              },
            ]
          : []),
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }

  // ORIGINAL SAVE LOGIC + PHOTO
  async function saveProfile() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = {
        ...user,
        name: trimmedName,
        mobile,
        photo,
      };

      await setUser(updatedUser);

      Alert.alert(
        "Success",
        "Profile updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      {/* WHITE HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 10 },
        ]}
      >
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Edit Profile
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>

        <View style={styles.headerTrailing}>
          <Ionicons
            name="person-outline"
            size={21}
            color={COLORS.primary}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* PROFILE PHOTO */}
          <View style={styles.profileSection}>
            <Pressable
              style={styles.avatarContainer}
              onPress={choosePhoto}
            >
              <View style={styles.avatar}>
                {photo ? (
                  <Image
                    source={{ uri: photo }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {name?.charAt(0)?.toUpperCase() || "A"}
                  </Text>
                )}
              </View>

              <View style={styles.camera}>
                <Ionicons
                  name="camera"
                  size={17}
                  color={COLORS.white}
                />
              </View>
            </Pressable>

            <Text style={styles.profileName}>
              {name || "Your Profile"}
            </Text>

            <Text style={styles.profileMobile}>
              {mobile}
            </Text>

            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={choosePhoto}
              activeOpacity={0.8}
            >
              <Ionicons
                name="camera-outline"
                size={17}
                color={COLORS.primary}
              />
              <Text style={styles.changePhotoText}>
                {photo ? "Change Photo" : "Add Profile Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* PERSONAL INFORMATION */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heading}>
                  Personal Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Update your profile details
                </Text>
              </View>
            </View>

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
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>
              MOBILE NUMBER
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.disabledInput,
              ]}
            >
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

            <View style={styles.noteRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={COLORS.muted}
              />
              <Text style={styles.note}>
                Your mobile number is linked to your
                TWINTO account.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.saveButton,
              saving && styles.saveDisabled,
            ]}
            onPress={saveProfile}
            disabled={saving}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color={COLORS.white}
            />

            <Text style={styles.saveText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={COLORS.white}
            />
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

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  headerTrailing: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 55,
  },

  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.white,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: "900",
  },

  camera: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },

  profileMobile: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
  },

  changePhotoButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.pinkSoft,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
  },

  changePhotoText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 24,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  disabledInput: {
    backgroundColor: "#F5F5F7",
  },

  input: {
    flex: 1,
    marginLeft: 11,
    fontSize: 14,
    color: COLORS.text,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: -7,
  },

  note: {
    flex: 1,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 17,
  },

  saveButton: {
    marginTop: 25,
    height: 54,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
  },

  saveDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
});
