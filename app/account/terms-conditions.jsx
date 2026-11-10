import React from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = { primary: "#C9004F", background: "#FFF9FB", white: "#FFFFFF", text: "#172033", muted: "#858B95", border: "#E9DDE2", soft: "#FFF0F5" };
// Draft content: review and replace with approved legal terms before publication.
const SECTIONS = [
  { title: "1. About TWINTO", text: "TWINTO is a grocery ordering platform that may facilitate purchases from third-party sellers and delivery partners. Product availability and service coverage depend on the selected delivery location." },
  { title: "2. Using the App", text: "You agree to provide accurate account, contact, and delivery details and to use the service lawfully. You are responsible for activity conducted through your account and for keeping verification codes confidential." },
  { title: "3. Products and Availability", text: "Product descriptions, prices, and availability are shown in the app. Availability may change before an order is confirmed. If an item becomes unavailable, the order may need to be adjusted or cancelled with an appropriate refund where applicable." },
  { title: "4. Prices and Charges", text: "The checkout screen displays the applicable item prices, delivery fees, platform charges, discounts, and final payable amount. Review the order summary before placing an order." },
  { title: "5. Payments", text: "Available payment methods may include supported online payment options and Cash on Delivery where offered. An online order may remain pending until payment is successfully confirmed. Do not share your payment credentials or OTP with anyone." },
  { title: "6. Order Processing and Delivery", text: "Delivery availability, timing estimates, and order status depend on the selected location, seller, and delivery partner. Estimated delivery times are not guaranteed. Please ensure someone is available to receive the order." },
  { title: "7. Cancellations, Returns and Refunds", text: "Cancellation, replacement, return, and refund eligibility depend on the order stage, item type, applicable law, and the policy shown at purchase. Perishable items may have special restrictions. Contact support promptly if an order is incorrect, damaged, or incomplete." },
  { title: "8. Third-Party Sellers and Services", text: "Some groceries or delivery services may be provided by independent third parties. The relevant seller or service provider may be responsible for fulfillment or product-specific issues, subject to applicable law." },
  { title: "9. Acceptable Use", text: "Do not misuse promotions, attempt fraudulent transactions, interfere with the app, or provide misleading information. Access may be restricted where necessary to protect users and the service, subject to applicable law." },
  { title: "10. Changes to These Terms", text: "These terms may be updated as the service changes. Material changes should be communicated as required by law. The applicable version should be made available in the app." },
  { title: "11. Contact", text: "For questions about an order or these terms, open My Account > Help & Support. Verified business contact details should be published before launch." },
];
export default function TermsConditions() {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "ios" || (Platform.OS === "android" && Platform.Version >= 35) ? insets.top : 0;
  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={C.white} translucent={Platform.OS === "android" && Platform.Version >= 35} />
    <View style={[styles.header, { paddingTop: top + 10 }]}><TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={21} color={C.text} /></TouchableOpacity><Text style={styles.headerTitle}>Terms & Conditions</Text><View style={styles.back} /></View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 28 }]}>
      <View style={styles.intro}><Ionicons name="document-text-outline" size={26} color={C.primary} /><Text style={styles.title}>Terms & Conditions</Text><Text style={styles.description}>Please review the conditions for using TWINTO and placing grocery orders.</Text><Text style={styles.draft}>Draft — effective date to be confirmed</Text></View>
      <View style={styles.card}>{SECTIONS.map((section, index) => <View key={section.title} style={[styles.section, index > 0 && styles.divider]}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.body}>{section.text}</Text></View>)}</View>
      <View style={styles.note}><Ionicons name="information-circle-outline" size={18} color={C.primary} /><Text style={styles.noteText}>This is template wording, not a finalized legal policy. Review seller responsibilities, refund rules, contact details, and applicable Indian consumer requirements before publishing.</Text></View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: C.background }, header: { backgroundColor: C.white, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.border }, back: { width: 38, height: 38, alignItems: "center", justifyContent: "center" }, headerTitle: { fontSize: 17, fontWeight: "800", color: C.text }, content: { padding: 16 }, intro: { padding: 20, borderRadius: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginBottom: 14 }, title: { marginTop: 12, fontSize: 22, fontWeight: "900", color: C.text }, description: { marginTop: 7, fontSize: 13, lineHeight: 20, color: C.muted }, draft: { marginTop: 12, fontSize: 11, fontWeight: "700", color: C.primary }, card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16 }, section: { paddingVertical: 17 }, divider: { borderTopWidth: 1, borderTopColor: C.border }, sectionTitle: { color: C.text, fontSize: 14, fontWeight: "800", marginBottom: 8 }, body: { color: "#59606D", fontSize: 12.5, lineHeight: 21 }, note: { flexDirection: "row", gap: 10, backgroundColor: C.soft, borderRadius: 10, padding: 14, marginTop: 16 }, noteText: { flex: 1, color: C.text, fontSize: 11.5, lineHeight: 18 } });
