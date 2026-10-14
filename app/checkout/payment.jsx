import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS } from "../../constants";
import { useCart } from "../../context";

export default function Payment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    itemTotal = 0,
    platformFee = 0,
    deliveryFee = 0,
    tip = 0,
    total = 0,
  } = useCart();

  const [selectedPayment, setSelectedPayment] = useState("cash");

  const paymentMethods = [
    {
      id: "cash",
      title: "Cash on Delivery",
      subtitle: "Pay when your order arrives",
      icon: "cash-outline",
    },
  ];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>
            Choose your payment method
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 150 + insets.bottom },
        ]}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Select Payment Method
              </Text>
              <Text style={styles.sectionSubtitle}>
                Choose how you want to pay for your order
              </Text>
            </View>
          </View>

          <View style={styles.methods}>
            {paymentMethods.map((method) => {
              const selected = selectedPayment === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedPayment(method.id)}
                  style={({ pressed }) => [
                    styles.paymentCard,
                    selected && styles.paymentCardSelected,
                    pressed && styles.paymentCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      selected && styles.paymentIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={21}
                      color={
                        selected ? COLORS.white : COLORS.primary
                      }
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text
                        style={styles.paymentTitle}
                        numberOfLines={1}
                      >
                        {method.title}
                      </Text>
                    </View>
                    <Text
                      style={styles.paymentSubtitle}
                      numberOfLines={2}
                    >
                      {method.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.securityContent}>
            <View style={styles.securityTitleRow}>
              <Text style={styles.securityTitle}>
                Safe & Secure
              </Text>
              <View style={styles.secureBadge}>
                <Ionicons
                  name="lock-closed"
                  size={9}
                  color={COLORS.primary}
                />
                <Text style={styles.secureText}>SECURE</Text>
              </View>
            </View>
            <Text style={styles.securityText}>
              Your information is encrypted and securely
              processed.
            </Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>
                Payment Summary
              </Text>
              <Text style={styles.summarySubtitle}>
                Review your final payable amount
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="basket-outline"
                  size={13}
                  color={COLORS.muted}
                />
              </View>
              <Text style={styles.summaryLabel}>Item Total</Text>
            </View>
            <Text style={styles.summaryValue}>
              ₹{itemTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="grid-outline"
                  size={13}
                  color={COLORS.muted}
                />
              </View>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
            </View>
            <Text style={styles.summaryValue}>
              ₹{platformFee.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <View style={styles.summarySmallIcon}>
                <Ionicons
                  name="bicycle-outline"
                  size={13}
                  color={COLORS.muted}
                />
              </View>
              <Text style={styles.summaryLabel}>
                Delivery Partner Fee
              </Text>
            </View>
            <Text
              style={[
                styles.summaryValue,
                deliveryFee === 0 && styles.freeText,
              ]}
            >
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          {tip > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelRow}>
                <View style={styles.summarySmallIcon}>
                  <Ionicons
                    name="heart-outline"
                    size={13}
                    color={COLORS.muted}
                  />
                </View>
                <Text style={styles.summaryLabel}>Tip</Text>
              </View>
              <Text style={styles.summaryValue}>
                ₹{tip.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>
              <Text style={styles.totalSubtitle}>
                Inclusive of all applicable charges
              </Text>
            </View>
            <Text style={styles.totalValue}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(
              insets.bottom + 10,
              18
            ),
          },
        ]}
      >
        <View style={styles.bottomAmount}>
          <Text style={styles.bottomLabel}>Payable Amount</Text>
          <Text style={styles.bottomTotal}>
            ₹{total.toFixed(2)}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          onPress={() => router.push("/checkout/review")}
        >
          <Text style={styles.continueText}>Continue</Text>
          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={17}
              color={COLORS.primary}
            />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  header: {
    height: 66,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E5EA",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 8.5,
    fontWeight: "600",
  },
  headerSpacer: { width: 42 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEDFE5",
  },
  sectionHeader: { flexDirection: "row", alignItems: "center" },
  sectionIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: { flex: 1, marginLeft: 10 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9.5,
  },
  methods: { marginTop: 15 },
  paymentCard: {
    minHeight: 73,
    marginBottom: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E9DDE3",
    flexDirection: "row",
    alignItems: "center",
  },
  paymentCardSelected: {
    backgroundColor: "#FFF0F6",
    borderColor: COLORS.primary,
    borderWidth: 1.4,
  },
  paymentCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconSelected: { backgroundColor: COLORS.primary },
  paymentInfo: { flex: 1, marginLeft: 11, marginRight: 8 },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  paymentTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "900",
  },
  paymentSubtitle: {
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 4,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D9CDD3",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  securityCard: {
    marginTop: 12,
    padding: 13,
    minHeight: 69,
    borderRadius: 17,
    backgroundColor: "#FFF0F6",
    borderWidth: 1,
    borderColor: "#F2D5E1",
    flexDirection: "row",
    alignItems: "center",
  },
  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  securityContent: { flex: 1, marginLeft: 10 },
  securityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  securityTitle: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "900",
  },
  secureBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },
  secureText: {
    marginLeft: 3,
    color: COLORS.primary,
    fontSize: 6.5,
    fontWeight: "900",
  },
  securityText: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },
  summarySection: {
    marginTop: 20,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEDFE5",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 3,
  },
  summaryIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#FFE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  summarySmallIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#F8F5F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 10.5,
    fontWeight: "600",
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },
  freeText: { color: COLORS.primary, fontWeight: "900" },
  divider: {
    height: 1,
    backgroundColor: "#F0E5EA",
    marginTop: 8,
    marginBottom: 13,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  totalSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 8.5,
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 11,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#EEDFE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 12,
  },
  bottomAmount: { flex: 1, paddingLeft: 2 },
  bottomLabel: {
    color: COLORS.muted,
    fontSize: 9.5,
    fontWeight: "700",
  },
  bottomTotal: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },
  continueButton: {
    width: 151,
    height: 50,
    paddingLeft: 19,
    paddingRight: 7,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
});