import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DELIVERY_PARTNER_FEE,
  FREE_DELIVERY_MAX_ITEMS,
  PLATFORM_FEE,
} from "../constants";
import { setToken, clearToken } from "../services/api";

const AuthContext = createContext(null);
const LocationContext = createContext(null);
const CartContext = createContext(null);

/* =========================
   AUTH CONTEXT
========================= */

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedUser = await AsyncStorage.getItem("twinto_user");
        const savedToken = await AsyncStorage.getItem("twinto_token_v2");
        if (savedUser && savedToken) {
          setUserState(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log("Load user error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * login accepts:
   *   - { user, token }   ← from verifyOtp (RECOMMENDED)
   *   - plain user object (backward compat, no token stored)
   */
  async function login(payload) {
    const userObj = payload?.user || payload;
    const token = payload?.token || null;

    console.log(
      "[AUTH] login() called. token present:",
      Boolean(token),
      "user:",
      userObj?.mobile || userObj?.name
    );

    try {
      if (token) {
        await setToken(token);
        await AsyncStorage.setItem("twinto_token_v2", token);
      }

      await AsyncStorage.setItem(
        "twinto_user",
        JSON.stringify(userObj)
      );

      setUserState(userObj);
      return userObj;
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem("twinto_user");
      await AsyncStorage.removeItem("twinto_token_v2");
      await clearToken();
      setUserState(null);
    } catch (error) {
      console.log("Logout error:", error);
    }
  }

  async function updateUser(data) {
    const updatedUser = { ...user, ...data };
    try {
      await AsyncStorage.setItem(
        "twinto_user",
        JSON.stringify(updatedUser)
      );
      setUserState(updatedUser);
    } catch (error) {
      console.log("Update user error:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/* =========================
   LOCATION CONTEXT
========================= */

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}

/* =========================
   CART CONTEXT  (LOCAL)
========================= */

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [tip, setTip] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const savedCart = await AsyncStorage.getItem("twinto_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch (error) {
        console.log("Load cart error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      "twinto_cart",
      JSON.stringify(cart)
    ).catch(() => {});
  }, [cart]);

  function add(product) {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function increase(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        String(item.id) === String(productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decrease(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          String(item.id) === String(productId)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clear() {
    setCart([]);
  }

  const itemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const itemTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const freeDelivery =
    itemCount > 0 && itemCount <= FREE_DELIVERY_MAX_ITEMS;

  const deliveryFee =
    itemCount === 0 || freeDelivery ? 0 : DELIVERY_PARTNER_FEE;

  const total = itemTotal + PLATFORM_FEE + deliveryFee + tip;

  return (
    <CartContext.Provider
      value={{
        cart,
        add,
        addToCart: add,
        increase,
        decrease,
        clear,
        itemCount,
        itemTotal,
        freeDelivery,
        deliveryFee,
        platformFee: PLATFORM_FEE,
        tip,
        setTip,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}