import React, { useState } from "react";
import { Alert, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = { primary: "#C9004F", background: "#FFF9FB", white: "#FFFFFF", text: "#172033", muted: "#858B95", border: "#E9DDE2", soft: "#FFF0F5" };
// Replace these with TWINTO's verified customer-support details before publishing.
const SUPPORT_EMAIL = "";
const SUPPORT_PHONE = "";
const FAQS = [
  { q: "How can I track my order?", a: "Open My Account > My Orders to view your order and its latest available status." },
  { q: "Can I change my delivery address?", a: "You can manage saved addresses in My Account > My Addresses. If an order has already been placed, contact support to ask whether a change is possible." },
  { q: "What if an item is missing or damaged?", a: "Contact support with your order number and a description of the issue. Include photos where helpful. Resolution depends on the order details and applicable policy." },
  { q: "When will I receive my refund?", a: "Refund eligibility and processing time depend on the payment method, issue, and payment provider. Contact support with your order number for an update." },
  { q: "How do I cancel an order?", a: "Check your order details for available cancellation options. Once packing or delivery has started, cancellation may not be possible." },
];

function Header({ title }) {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "ios" || (Platform.OS === "android" && Platform.Version >= 35) ? insets.top : 0;
  return <View style={[styles.header, { paddingTop: top + 10 }]}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={C.text} /></TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text><View style={styles.back} />
  </View>;
}
function ContactItem({ icon, title, detail, onPress }) {
  return <TouchableOpacity onPress={onPress} style={styles.contactItem} activeOpacity={0.75}>
    <View style={styles.contactIcon}><Ionicons name={icon} size={20} color={C.primary} /></View>
    <View style={{ flex: 1 }}><Text style={styles.contactTitle}>{title}</Text><Text style={styles.detail}>{detail}</Text></View>
    <Ionicons name="chevron-forward" size={18} color={C.muted} />
  </TouchableOpacity>;
}
export default function HelpSupport() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(-1);
  async function contact(type) {
    const value = type === "email" ? SUPPORT_EMAIL : SUPPORT_PHONE;
    if (!value) { Alert.alert("Support details coming soon", "TWINTO has not configured this contact method yet."); return; }
    const url = type === "email" ? `mailto:${value}?subject=${encodeURIComponent("TWINTO Customer Support")}` : `tel:${value}`;
    try { await Linking.openURL(url); } catch { Alert.alert("Unable to open", "Please check that a compatible app is installed."); }
  }
  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={C.white} translucent={Platform.OS === "android" && Platform.Version >= 35} />
    <Header title="Help & Support" />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 28 }]}>
      <View style={styles.intro}><Ionicons name="headset-outline" size={26} color={C.primary} /><Text style={styles.title}>How can we help?</Text><Text style={styles.description}>Find answers to common questions or get in touch about your TWINTO orders.</Text></View>
      <Text style={styles.section}>CONTACT SUPPORT</Text>
      <View style={styles.card}>
        <ContactItem icon="mail-outline" title="Email Support" detail={SUPPORT_EMAIL || "Contact email not configured"} onPress={() => contact("email")} />
        <View style={styles.line} />
        <ContactItem icon="call-outline" title="Call Support" detail={SUPPORT_PHONE || "Phone number not configured"} onPress={() => contact("phone")} />
      </View>
      <Text style={styles.section}>FREQUENTLY ASKED QUESTIONS</Text>
      <View style={styles.card}>{FAQS.map((item, index) => <View key={item.q}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open === index }} onPress={() => setOpen(open === index ? -1 : index)} style={styles.faqButton}>
          <Text style={styles.question}>{item.q}</Text><Ionicons name={open === index ? "chevron-up" : "chevron-down"} size={18} color={C.primary} />
        </TouchableOpacity>
        {open === index && <Text style={styles.answer}>{item.a}</Text>}
        {index < FAQS.length - 1 && <View style={styles.line} />}
      </View>)}</View>
      <View style={styles.note}><Ionicons name="information-circle-outline" size={18} color={C.primary} /><Text style={styles.noteText}>For faster assistance, keep your order number ready when contacting support.</Text></View>
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background }, header: { backgroundColor: C.white, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.border }, back: { width: 38, height: 38, alignItems: "center", justifyContent: "center" }, headerTitle: { fontSize: 17, fontWeight: "800", color: C.text }, content: { padding: 16 }, intro: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 20, alignItems: "flex-start" }, title: { marginTop: 12, fontSize: 22, fontWeight: "900", color: C.text }, description: { marginTop: 7, fontSize: 13, color: C.muted, lineHeight: 20 }, section: { fontSize: 11, fontWeight: "900", letterSpacing: 1, color: C.text, marginTop: 25, marginBottom: 10 }, card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: "hidden" }, contactItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 }, contactIcon: { width: 40, height: 40, borderRadius: 9, backgroundColor: C.soft, alignItems: "center", justifyContent: "center" }, contactTitle: { fontSize: 13, fontWeight: "800", color: C.text }, detail: { fontSize: 11, color: C.muted, marginTop: 4 }, line: { height: 1, backgroundColor: C.border, marginHorizontal: 15 }, faqButton: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 15, paddingVertical: 12 }, question: { flex: 1, color: C.text, fontSize: 13, fontWeight: "700", lineHeight: 19 }, answer: { color: C.muted, fontSize: 12, lineHeight: 19, paddingHorizontal: 15, paddingBottom: 16 }, note: { flexDirection: "row", gap: 10, backgroundColor: C.soft, borderRadius: 10, padding: 14, marginTop: 20 }, noteText: { flex: 1, color: C.text, fontSize: 12, lineHeight: 19 }
});
