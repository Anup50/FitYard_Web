import { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import OTPVerification from "./OTPVerification";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { register, resendOTP } from "../api/auth";

const Login = () => {
  const { navigate } = useContext(ShopContext);
  const { login, isAuthenticated } = useAuth();
  const [currentState, setCurrentState] = useState("Login");
  const [showOTP, setShowOTP] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  const captchaRef = useRef(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Check CAPTCHA
    if (!captchaValue) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    try {
      if (currentState === "Sign Up") {
        const res = await register({
          name,
          email,
          password,
          captcha: captchaValue,
        });
        if (res.data.success) {
          // Always show OTP page after successful registration
          setShowOTP(true);
          setPendingRegistration({ name, email, password });
          toast.success("OTP sent to your email!");
          // Reset captcha
          setCaptchaValue(null);
          captchaRef.current?.reset();
        } else {
          toast.error(res.data.message);
          // Reset captcha on error
          setCaptchaValue(null);
          captchaRef.current?.reset();
        }
      } else {
        const result = await login(email, password, false, captchaValue);
        if (result.success) {
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(result.message);
          // Reset captcha on error
          setCaptchaValue(null);
          captchaRef.current?.reset();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      // Reset captcha on error
      setCaptchaValue(null);
      captchaRef.current?.reset();
    }
  };

  // Handle successful OTP verification
  const handleOTPVerifySuccess = (otpData) => {
    // Show success message and redirect to login
    toast.success(
      "Registration completed successfully! Please login with your credentials."
    );
    setShowOTP(false);
    setPendingRegistration(null);
    setCurrentState("Login");
    // Clear form fields
    setName("");
    setEmail("");
    setPassword("");
  };

  // Handle OTP resend
  const handleOTPResend = async () => {
    try {
      const res = await resendOTP({ email: pendingRegistration.email });
      if (res.data.success) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Go back to registration form
  const handleBackToRegistration = () => {
    setShowOTP(false);
    setPendingRegistration(null);
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Show OTP verification if needed
  if (showOTP && pendingRegistration) {
    return (
      <OTPVerification
        email={pendingRegistration.email}
        onVerifySuccess={handleOTPVerifySuccess}
        onResendOTP={handleOTPResend}
        onBack={handleBackToRegistration}
      />
    );
  }

  // Show login/registration form
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Login" ? (
        ""
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      )}
      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      {currentState === "Sign Up" && (
        <PasswordStrengthBar password={password} />
      )}

      {/* reCAPTCHA */}
      <div className="w-full flex justify-center">
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(value) => setCaptchaValue(value)}
          onExpired={() => setCaptchaValue(null)}
        />
      </div>

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login Here{" "}
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
