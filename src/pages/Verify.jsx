import { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Verify = () => {
  const { setCartItems } = useContext(ShopContext);
  const { checkAuthState } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const handleVerification = async () => {
      try {
        await checkAuthState();
        // console.log("Authentication state checked after Stripe redirect");
      } catch (error) {
        // console.log("Auth state recovery failed:", error);
      }

      if (success === "true" && orderId) {
        localStorage.setItem(
          "pendingPaymentSuccess",
          JSON.stringify({
            success: true,
            orderId: orderId,
            timestamp: Date.now(),
          })
        );

        setCartItems({});

        toast.success(
          "Order placed successfully! Thank you for your purchase."
        );

        navigate("/", { replace: true });
      } else {
        toast.error("Payment failed. Please try again.");

        navigate("/cart", { replace: true });
      }
    };

    handleVerification();
  }, [success, orderId, setCartItems, navigate, checkAuthState]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          Processing Order...
        </h2>
        <p className="text-gray-600">
          Please wait while we process your order.
        </p>
      </div>
    </div>
  );
};

export default Verify;
