export const categories = [
  {
    id: "all",
    name: "All",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=85",
  },

  {
    id: "vegetables",
    name: "Vegetables",
    image: require("../assets/images/veg.png"),
    
  },

  {
    id: "fruits",
    name: "Fruits",
   image: require("../assets/images/frut.png"),
  },

  {
    id: "fast-food",
    name: "Fast Food",
    image: require("../assets/images/vegan.png"),
  },

  {
    id: "cool-drinks",
    name: "Cool Drinks",
     image: require("../assets/images/drinks.png"),
  },

  {
    id: "fresh-milk",
    name: "Fresh Milk",
       image: require("../assets/images/milk.png"),
  },

  {
    id: "non-veg",
    name: "Non Veg",
     image: require("../assets/images/non.png"),
  },

  {
    id: "dairy",
    name: "Dairy",
 image: require("../assets/images/dairy.png"),
  },

  {
    id: "bakery",
    name: "Bakery",
  image: require("../assets/images/bak.png"),
  },

  {
    id: "snacks",
    name: "Snacks",
    image: require("../assets/images/snacks.png"),
  },

  {
    id: "beverages",
    name: "Beverages",
     image: require("../assets/images/cool.png"),
  },

  {
    id: "household",
    name: "Household",
   image: require("../assets/images/house.png"),
  },
];


export const products = [
  {
    id: "1",
    name: "Aashirvaad Atta",
    category: "Grocery",
    cats: ["all", "household"],
   image: require("../assets/images/product1.png"),
    weight: "5 kg",
    mrp: 320,
    price: 285,
    discount: 11,
    rating: 4.7,
    reviews: 142,
    delivery: "15 mins",
    description:
      "Premium quality whole wheat flour suitable for soft and healthy rotis.",
  },

  {
    id: "2",
    name: "Fresh Tomato",
    category: "Vegetables",
    cats: ["all", "vegetables"],
      image: require("../assets/images/product2.png"),
    weight: "1 kg",
    mrp: 60,
    price: 45,
    discount: 25,
    rating: 4.8,
    reviews: 86,
    delivery: "12 mins",
    description:
      "Fresh farm-picked tomatoes with natural taste and vibrant colour.",
  },

  {
    id: "3",
    name: "Fresh Red Onion",
    category: "Vegetables",
    cats: ["all", "vegetables"],
     image: require("../assets/images/product3.png"),
    weight: "1 kg",
    mrp: 70,
    price: 52,
    discount: 26,
    rating: 4.6,
    reviews: 74,
    delivery: "13 mins",
    description:
      "Fresh red onions sourced directly from selected farms.",
  },

  {
    id: "4",
    name: "Fresh Potato",
    category: "Vegetables",
    cats: ["all", "vegetables"],
      image: require("../assets/images/product4.png"),
    weight: "1 kg",
    mrp: 55,
    price: 40,
    discount: 27,
    rating: 4.5,
    reviews: 61,
    delivery: "12 mins",
    description:
      "Fresh and carefully selected potatoes for everyday cooking.",
  },

  {
    id: "5",
    name: "Fresh Banana",
    category: "Fruits",
    cats: ["all", "fruits"],
    image: require("../assets/images/product5.png"),
    weight: "1 dozen",
    mrp: 90,
    price: 68,
    discount: 24,
    rating: 4.8,
    reviews: 118,
    delivery: "10 mins",
    description:
      "Naturally sweet bananas selected for freshness.",
  },

  {
    id: "6",
    name: "Amul Taaza Milk",
    category: "Fresh Milk",
    cats: ["all", "fresh-milk", "dairy"],
   image: require("../assets/images/product6.png"),
    weight: "1 L",
    mrp: 66,
    price: 62,
    discount: 6,
    rating: 4.9,
    reviews: 231,
    delivery: "8 mins",
    description:
      "Fresh and nutritious milk perfect for everyday consumption.",
  },

  {
    id: "7",
    name: "Coca-Cola",
    category: "Cool Drinks",
    cats: ["all", "cool-drinks", "beverages"],
  image: require("../assets/images/product7.png"),
    weight: "750 ml",
    mrp: 50,
    price: 45,
    discount: 10,
    rating: 4.6,
    reviews: 91,
    delivery: "9 mins",
    description:
      "Refreshing chilled soft drink for any occasion.",
  },

  {
    id: "8",
    name: "Classic Veg Burger",
    category: "Fast Food",
    cats: ["all", "fast-food"],
    image: require("../assets/images/product8.png"),
    weight: "1 pc",
    mrp: 149,
    price: 119,
    discount: 20,
    rating: 4.7,
    reviews: 154,
    delivery: "18 mins",
    description:
      "Crispy vegetable patty layered with fresh vegetables and sauce.",
  },

  {
    id: "9",
    name: "Chocolate Chip Cookies",
    category: "Bakery",
    cats: ["all", "bakery", "snacks"],
    image: require("../assets/images/product9.png"),
    weight: "200 g",
    mrp: 120,
    price: 95,
    discount: 21,
    rating: 4.7,
    reviews: 97,
    delivery: "14 mins",
    description:
      "Crunchy chocolate chip cookies baked for a delicious snack.",
  },
];

export const addresses = [
  {
    id: "1",
    type: "HOME",
    name: "SURESH",
    address:
      "Hyderabad Bus Stand, Khaja Nagar, tg 515001",
    phone: "+91 98490 12345",
  },
];

export const locations = [
  {
    id: "1",
    name: "Hyderabad",
    available: true,
    deliveryTime: "17 mins",
  },
  {
    id: "2",
    name: "vizag",
    available: true,
    deliveryTime: "25 mins",
  },
  {
    id: "3",
    name: "madhapur",
    available: false,
    deliveryTime: null,
  },
];

export const dummyOrders = [
  {
    id: "TW100245",
    status: "Out for delivery",
    date: "09 Sep 2026",
    total: 428,
    items: [
      {
        productId: "2",
        quantity: 2,
      },
      {
        productId: "6",
        quantity: 1,
      },
    ],
  },
];