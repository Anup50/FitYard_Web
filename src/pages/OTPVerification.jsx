import { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import {
  verifyOTP as verifyOTPApi,
  verifyLoginOTP as verifyLoginOTPApi,
  resendRegistrationOTP as resendRegistrationOTPApi,
  resendLoginOTP as resendLoginOTPApi,
} from "../api/auth";

const OTPVerification = ({
  email,
  onVerifySuccess,
  onResendOTP,
  onBack,
  isLogin = false,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef([]);
  const { backendUrl } = useContext(ShopContext);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit, idx) => !digit && idx < 6);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      // Use appropriate API based on whether it's login or registration
      const apiFunction = isLogin ? verifyLoginOTPApi : verifyOTPApi;
      const response = await apiFunction({
        email,
        otp: otpCode,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully!");
        onVerifySuccess(response.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      // Use appropriate API based on whether it's login or registration
      console.log("OTP Resend Debug:", { isLogin, email });
      const resendApiFunction = isLogin
        ? resendLoginOTPApi
        : resendRegistrationOTPApi;

      console.log(
        "Using resend function:",
        isLogin ? "resendLoginOTPApi" : "resendRegistrationOTPApi"
      );

      const response = await resendApiFunction({
        email,
      });

      if (response.data.success) {
        toast.success("New OTP sent to your email!");
        setTimeLeft(300); // Reset timer
        setOtp(["", "", "", "", "", ""]); // Clear current OTP
        inputRefs.current[0]?.focus(); // Focus first input
        onResendOTP && onResendOTP();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Verify OTP</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600 mb-2">We've sent a verification code to</p>
        <p className="font-medium text-gray-800">{email}</p>
        <p className="text-sm text-gray-500 mt-2">
          Enter the 6-digit code below
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="w-full">
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-colors"
              disabled={loading}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in{" "}
              <span className="font-medium text-gray-800">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-red-600">Code has expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-black text-white font-light px-8 py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resendLoading || timeLeft > 240} // Allow resend after 1 minute
          className="text-sm font-medium text-gray-800 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed underline transition-colors"
        >
          {resendLoading
            ? "Sending..."
            : timeLeft > 240
            ? `Resend in ${formatTime(timeLeft - 240)}`
            : "Resend OTP"}
        </button>
      </div>

      {/* Back to Registration */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onBack || (() => window.history.back())}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to registration
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
