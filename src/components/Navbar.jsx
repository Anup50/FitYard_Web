import { Link, NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { sanitizeURL, sanitizeText } from "../utils/sanitizer";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, navigate, setCartItems } =
    useContext(ShopContext);

  const { isAuthenticated, logout: authLogout } = useAuth();

  const logout = () => {
    authLogout();
    navigate("/login");
    setCartItems({});
  };

  return (
    <div className="flex item-center justify-between py-5 font-medium">
      <Link to={"/"}>
        <img
          src={sanitizeURL(assets.logo)}
          className="w-24"
          alt={sanitizeText("FitYard Logo")}
        />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <img
          src={sanitizeURL(assets.search_icon)}
          className="w-5 cursor-pointer"
          onClick={() => setShowSearch(true)}
          alt={sanitizeText("Search")}
        />

        <div className="group relative">
          <img
            src={sanitizeURL(assets.profile_icon)}
            className="w-5 cursor-pointer"
            alt={sanitizeText("Profile")}
            onClick={() => (isAuthenticated() ? null : navigate("/login"))}
          />
          {/* DROPDOWN */}
          {isAuthenticated() && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 ">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:text-black"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black"
                >
                  Orders
                </p>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative">
          <img
            src={sanitizeURL(assets.cart_icon)}
            className="w-5 min-w-5"
            alt={sanitizeText("Shopping Cart")}
          />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <img
          src={sanitizeURL(assets.menu_icon)}
          className="w-5 cursor-pointer sm:hidden"
          onClick={() => setVisible(true)}
          alt={sanitizeText("Menu")}
        />
      </div>

      {/* SIDEBAR MENU FOR SMALL SCREEN */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              src={sanitizeURL(assets.dropdown_icon)}
              className="h-4 rotate-180"
              alt={sanitizeText("Back")}
            />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            to={"/"}
            className="py-2 pl-6 border"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to={"/collection"}
            className="py-2 pl-6 border"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to={"/about"}
            className="py-2 pl-6 border"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to={"/contact"}
            className="py-2 pl-6 border"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
