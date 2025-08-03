import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { fetchProducts } from "../api/products";
import {
  addToCart as addToCartApi,
  updateCart,
  getUserCart as fetchUserCart,
} from "../api/cart";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select product size!");
      return;
    }

    if (!isAuthenticated()) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};

      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    try {
      await addToCartApi(itemId, size);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (e) {}
      }
    }

    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (!isAuthenticated()) {
      toast.error("Please login to update cart");
      navigate("/login");
      return;
    }

    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    try {
      await updateCart({ itemId, size, quantity });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);

      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (e) {}
      }
    }

    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await fetchProducts();

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.code !== "ERR_NETWORK") {
        toast.error(error.message);
      }
    }
  };

  const getUserCart = async () => {
    if (!isAuthenticated() || user?.role === "admin") {
      return;
    }

    try {
      const res = await fetchUserCart();

      if (res && res.data && res.data.success) {
        setCartItems(res.data.cartData || {});
      }
    } catch (error) {
      if (error.response?.status !== 401 && error.code !== "ERR_NETWORK") {
        toast.error("Failed to load cart");
      }
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated() && user?.role !== "admin") {
      getUserCart();
    } else if (!loading && (!isAuthenticated() || user?.role === "admin")) {
      setCartItems({});
    }
  }, [loading, isAuthenticated, user]);

  useEffect(() => {
    if (!loading && isAuthenticated() && user?.role !== "admin") {
      const pendingPayment = localStorage.getItem("pendingPaymentSuccess");
      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);

          const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

          if (paymentData.success && paymentData.timestamp > thirtyMinutesAgo) {
            setCartItems({});

            toast.success(
              <div>
                <p>
                  🎉 Order placed successfully! Thank you for your purchase.
                </p>
                <button
                  onClick={() => {
                    try {
                      navigate("/orders");
                    } catch (error) {
                      toast.info(
                        "Please click on 'My Orders' in the menu to view your orders."
                      );
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  View Orders
                </button>
              </div>,
              {
                autoClose: 10000,
                closeOnClick: false,
              }
            );

            localStorage.removeItem("pendingPaymentSuccess");
          } else {
            localStorage.removeItem("pendingPaymentSuccess");
          }
        } catch (error) {
          localStorage.removeItem("pendingPaymentSuccess");
        }
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setCartItems,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
