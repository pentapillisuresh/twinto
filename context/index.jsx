
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DELIVERY_PARTNER_FEE,
  FREE_DELIVERY_MAX_ITEMS,
  PLATFORM_FEE,
} from "../constants";

import {
  setToken,
  getToken,
  clearToken,
} from "../services/api";

import { getMe } from "../services/authService";

// ==========================================
// STORAGE KEYS
// ==========================================

const USER_KEY = "twinto_user";
const CART_KEY = "twinto_cart";

// ==========================================
// CONTEXTS
// ==========================================

const AuthContext = createContext(null);
const LocationContext = createContext(null);
const CartContext = createContext(null);

// ==========================================
// AUTH CONTEXT
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const authVersionRef = useRef(0);

  // ========================================
  // RESTORE LOGIN SESSION
  // ========================================

  useEffect(() => {
    let mounted = true;
    const version = authVersionRef.current;

    async function restoreSession() {
      try {
        const token = await getToken();

        if (!token) {
          if (mounted && version === authVersionRef.current) {
            setUserState(null);
          }
          return;
        }

        // Validate stored JWT with the backend.
        const response = await getMe();

        // Support common profile response shapes.
        const verifiedUser =
          response?.user ??
          response?.data?.user ??
          response?.data ??
          response;

        if (
          !verifiedUser ||
          typeof verifiedUser !== "object" ||
          verifiedUser.id == null
        ) {
          throw new Error("Invalid profile response.");
        }

        if (!mounted || version !== authVersionRef.current) {
          return;
        }

        setUserState(verifiedUser);

        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(verifiedUser)
        );
      } catch (error) {
        console.log(
          "[AUTH] Restore session error:",
          error?.message
        );

        if (!mounted || version !== authVersionRef.current) {
          return;
        }

        // Only remove the session when the server
        // explicitly rejects authentication.
        if (
          error?.status === 401 ||
          error?.status === 403
        ) {
          try {
            await clearToken();
            await AsyncStorage.removeItem(USER_KEY);
          } catch (storageError) {
            console.log(
              "[AUTH] Session cleanup error:",
              storageError?.message
            );
          }

          if (mounted && version === authVersionRef.current) {
            setUserState(null);
          }
        } else {
          // Network failures should not delete a
          // previously authenticated user's token.
          try {
            const savedUser = await AsyncStorage.getItem(
              USER_KEY
            );

            if (
              savedUser &&
              mounted &&
              version === authVersionRef.current
            ) {
              const parsedUser = JSON.parse(savedUser);

              if (
                parsedUser &&
                typeof parsedUser === "object" &&
                parsedUser.id != null
              ) {
                setUserState(parsedUser);
              }
            }
          } catch (storageError) {
            console.log(
              "[AUTH] Cached user error:",
              storageError?.message
            );
          }
        }
      } finally {
        if (mounted && version === authVersionRef.current) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ========================================
  // LOGIN
  // ========================================

  async function login(payload) {
    const authData = payload?.data?.token
      ? payload.data
      : payload;

    const userObj = authData?.user;
    const token = authData?.token;

    if (
      !userObj ||
      typeof userObj !== "object" ||
      userObj.id == null
    ) {
      throw new Error(
        "Login failed: invalid user information."
      );
    }

    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      throw new Error(
        "Login failed: authentication token missing."
      );
    }

    authVersionRef.current += 1;

    console.log(
      "[AUTH] Saving verified user session."
    );

    try {
      await setToken(token);

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(userObj)
      );

      setUserState(userObj);
      setLoading(false);

      return userObj;
    } catch (error) {
      console.log(
        "[AUTH] Login error:",
        error?.message
      );

      try {
        await clearToken();
        await AsyncStorage.removeItem(USER_KEY);
      } catch (cleanupError) {
        console.log(
          "[AUTH] Login cleanup error:",
          cleanupError?.message
        );
      }

      setUserState(null);
      throw error;
    }
  }

  // ========================================
  // LOGOUT
  // ========================================

  async function logout() {
    authVersionRef.current += 1;

    try {
      await clearToken();

      await AsyncStorage.removeItem(USER_KEY);

      setUserState(null);

      console.log("[AUTH] Logged out.");
    } catch (error) {
      console.log(
        "[AUTH] Logout error:",
        error?.message
      );

      // Avoid presenting a logged-out state when
      // the persistent token could not be removed.
      throw error;
    }
  }

  // ========================================
  // UPDATE USER PROFILE
  // ========================================

  async function updateUser(data) {
    if (!user) {
      throw new Error(
        "You must be logged in to update your profile."
      );
    }

    if (!data || typeof data !== "object") {
      throw new Error("Invalid profile data.");
    }

    const updatedUser = {
      ...user,
      ...data,
      id: user.id,
    };

    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    setUserState(updatedUser);

    return updatedUser;
  }

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser: updateUser,
      updateUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

// ==========================================
// LOCATION CONTEXT
// ==========================================

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);

  const value = useMemo(
    () => ({
      location,
      setLocation,
    }),
    [location]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocation must be used inside LocationProvider."
    );
  }

  return context;
}

// ==========================================
// CART CONTEXT (LOCAL)
// ==========================================

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [tip, setTip] = useState(10);

  const [cartLoaded, setCartLoaded] = useState(false);

  // ========================================
  // LOAD SAVED CART
  // ========================================

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      try {
        const savedCart = await AsyncStorage.getItem(
          CART_KEY
        );

        if (!mounted) {
          return;
        }

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);

          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }
      } catch (error) {
        console.log(
          "[CART] Load error:",
          error?.message
        );
      } finally {
        if (mounted) {
          setCartLoaded(true);
        }
      }
    }

    loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  // ========================================
  // SAVE CART
  // ========================================

  useEffect(() => {
    if (!cartLoaded) {
      return;
    }

    AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    ).catch((error) => {
      console.log(
        "[CART] Save error:",
        error?.message
      );
    });
  }, [cart, cartLoaded]);

  // ========================================
  // ADD PRODUCT
  // ========================================

  function add(product) {
    if (!product || product.id == null) {
      return;
    }

    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  // ========================================
  // INCREASE QUANTITY
  // ========================================

  function increase(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        String(item.id) === String(productId)
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + 1,
            }
          : item
      )
    );
  }

  // ========================================
  // DECREASE QUANTITY
  // ========================================

  function decrease(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          String(item.id) === String(productId)
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter(
          (item) => Number(item.quantity) > 0
        )
    );
  }

  // ========================================
  // CLEAR CART
  // ========================================

  function clear() {
    setCart([]);
  }

  // ========================================
  // CART CALCULATIONS
  // ========================================

  const itemCount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const itemTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [cart]);

  const freeDelivery =
    itemCount > 0 &&
    itemCount <= FREE_DELIVERY_MAX_ITEMS;

  const deliveryFee =
    itemCount === 0 || freeDelivery
      ? 0
      : DELIVERY_PARTNER_FEE;

  // Keep the original TWINTO total formula.
  const total =
    itemTotal +
    PLATFORM_FEE +
    deliveryFee +
    tip;

  // ========================================
  // CART CONTEXT VALUE
  // ========================================

  const value = {
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
    cartLoaded,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}
