import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";

const PREMIUM = {
  primary: "#C9004F",
  navy: "#172033",
  white: "#FFFFFF",
  background: "#FFF9FB",
  pinkSoft: "#FFF0F5", 
  pinkLight: "#FDE3EC",
  border: "#E9DDE2",
  muted: "#858B95",
};

import { categories } from "../../data";

export default function CategoryRow() {
  const router = useRouter();

  const visibleCategories = categories
    .filter((category) => category.id !== "all")
    .slice(0, 8);

  return (
    <View style={styles.section}>
     
     

      {/* Category Grid */}
      <View style={styles.gridContainer}>
        {visibleCategories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => router.push(`/category/${category.id}`)}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            {/* Image Card with Pink Background */}
            <View style={styles.imageBox}>
              <Image
                source={category.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            {/* Name */}
            <Text numberOfLines={1} style={styles.name}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    // 1. REDUCED PADDING: Changed from 18 to 12 to give more room for larger images
    paddingHorizontal: 12, 
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    // Add a little padding back just for the header text so it doesn't touch the edge
    paddingHorizontal: 6, 
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: PREMIUM.navy,
    letterSpacing: -0.4,
  },

  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  seeAll: {
    color: PREMIUM.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  /* Grid Layout */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16, 
  },

  item: {
    // 2. WIDTH ADJUSTED: Slightly increased to 24% to accommodate the larger image
    width: "24%", 
    alignItems: "center",
  },

  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  /* Image Box with Soft Pink Background */
  imageBox: {
    // 3. IMAGE SIZE INCREASED
    width: 85,        
    height: 85,       
    borderRadius: 18, 
    backgroundColor: PREMIUM.pinkSoft, 
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  image: {
    // 4. INNER IMAGE SCALE
    width: "75%", 
    height: "75%",
  },

  /* Name */
  name: {
    color: PREMIUM.navy,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});