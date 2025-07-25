import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select product size!");
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
      console.log(e);
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
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    try {
      await updateCart(itemId, size, quantity);
    } catch (e) {
      console.log(e);
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
      console.log(error);
      // Don't show toast error for network issues on startup
      if (error.code !== "ERR_NETWORK") {
        toast.error(error.message);
      }
    }
  };

  const getUserCart = async () => {
    try {
      const res = await fetchUserCart();

      if (res && res.data && res.data.success) {
        setCartItems(res.data.cartData || {});
      }
    } catch (error) {
      console.log("Cart error:", error);
      // Don't show cart error if user is not logged in or if it's a CORS/network error
      if (error.response?.status !== 401 && error.code !== "ERR_NETWORK") {
        toast.error("Failed to load cart");
      }
    }
  };

  useEffect(() => {
    getProductsData();
    getUserCart(); // Load cart on app start
  }, []);

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
