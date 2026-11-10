import React from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = { primary: "#C9004F", background: "#FFF9FB", white: "#FFFFFF", text: "#172033", muted: "#858B95", border: "#E9DDE2", soft: "#FFF0F5" };
// Draft content: confirm actual data practices, processors, retention, rights, and contacts before publishing.
const SECTIONS = [
  { title: "1. Introduction", text: "This draft describes how TWINTO may handle personal information when you use its grocery ordering application. The final policy should identify the legal business operating TWINTO and its contact details." },
  { title: "2. Information We Collect", text: "Depending on your use of the app, information may include your name, mobile number, saved delivery addresses, selected service location, orders, customer-support messages, and technical information required to operate and secure the service." },
  { title: "3. OTP and Account Verification", text: "Your mobile number is used to send one-time verification codes and to help protect access to your account. Do not share OTPs with others." },
  { title: "4. How Information Is Used", text: "Information may be used to manage your account, confirm orders, coordinate delivery, provide customer support, prevent misuse, maintain service security, and meet applicable legal obligations." },
  { title: "5. Location and Delivery Addresses", text: "TWINTO uses your selected location and delivery address to check service availability, show applicable delivery charges, and fulfill orders. If precise device location is requested, the app should explain why and ask for the required permission." },
  { title: "6. Payments", text: "Online payments may be processed by a third-party payment provider. The final policy should name relevant processors and explain which payment and transaction details TWINTO receives or retains. Never enter a card PIN or banking OTP into a support conversation." },
  { title: "7. Sharing Information", text: "Order and contact details may need to be shared with relevant sellers, delivery partners, payment processors, and technical service providers to provide the service. Information may also be disclosed where legally required. Actual sharing arrangements must be verified before publication." },
  { title: "8. Security", text: "TWINTO should use reasonable organizational and technical safeguards to protect customer information. No internet-connected service can guarantee absolute security." },
  { title: "9. Data Retention and Deletion", text: "The final policy should state how long account, order, payment-related, and support records are retained and how users can request deletion or correction, subject to legal record-keeping requirements." },
  { title: "10. Your Choices and Rights", text: "You may be able to review and update your profile or saved addresses in the app. Requests to access, correct, or delete personal information should be handled through the published privacy contact, consistent with applicable law." },
  { title: "11. Children's Privacy", text: "The final policy should explain whether minors may use TWINTO, any age restrictions, and how parental consent is handled when required." },
  { title: "12. Policy Updates", text: "The policy may be revised when TWINTO changes its services or data practices. An updated effective date and any required notices should accompany the final version." },
  { title: "13. Contact Us", text: "For privacy-related questions or requests, visit My Account > Help & Support. A verified privacy contact and business identity should be added before publishing." },
];
export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "ios" || (Platform.OS === "android" && Platform.Version >= 35) ? insets.top : 0;
  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={C.white} translucent={Platform.OS === "android" && Platform.Version >= 35} />
    <View style={[styles.header, { paddingTop: top + 10 }]}><TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={21} color={C.text} /></TouchableOpacity><Text style={styles.headerTitle}>Privacy Policy</Text><View style={styles.back} /></View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 28 }]}>
      <View style={styles.intro}><Ionicons name="shield-checkmark-outline" size={26} color={C.primary} /><Text style={styles.title}>Your Privacy Matters</Text><Text style={styles.description}>Learn how personal information may be used to provide TWINTO grocery services.</Text><Text style={styles.draft}>Draft — effective date to be confirmed</Text></View>
      <View style={styles.card}>{SECTIONS.map((section, index) => <View key={section.title} style={[styles.section, index > 0 && styles.divider]}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.body}>{section.text}</Text></View>)}</View>
      <View style={styles.note}><Ionicons name="information-circle-outline" size={18} color={C.primary} /><Text style={styles.noteText}>This draft must be aligned with TWINTO's actual collection, sharing, retention, deletion, and payment practices before release. The public Play Store privacy-policy URL also needs a finalized version.</Text></View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: C.background }, header: { backgroundColor: C.white, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.border }, back: { width: 38, height: 38, alignItems: "center", justifyContent: "center" }, headerTitle: { fontSize: 17, fontWeight: "800", color: C.text }, content: { padding: 16 }, intro: { padding: 20, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginBottom: 14 }, title: { marginTop: 12, fontSize: 22, fontWeight: "900", color: C.text }, description: { marginTop: 7, fontSize: 13, lineHeight: 20, color: C.muted }, draft: { marginTop: 12, fontSize: 11, fontWeight: "700", color: C.primary }, card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16 }, section: { paddingVertical: 17 }, divider: { borderTopWidth: 1, borderTopColor: C.border }, sectionTitle: { color: C.text, fontSize: 14, fontWeight: "800", marginBottom: 8 }, body: { color: "#59606D", fontSize: 12.5, lineHeight: 21 }, note: { flexDirection: "row", gap: 10, backgroundColor: C.soft, borderRadius: 10, padding: 14, marginTop: 16 }, noteText: { flex: 1, color: C.text, fontSize: 11.5, lineHeight: 18 } });
