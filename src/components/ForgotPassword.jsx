import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../utils/passwordApi";
import { sanitizeFormData } from "../utils/sanitizer";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    if (isExpired) {
      toast.warning("Your password has expired. Please reset it to continue.");
    }

    const storedAttempts = localStorage.getItem("forgotPasswordAttempts");
    const storedTimestamp = localStorage.getItem("forgotPasswordTimestamp");

    if (storedAttempts && storedTimestamp) {
      const now = Date.now();
      const timeElapsed = now - parseInt(storedTimestamp);
      const fifteenMinutes = 15 * 60 * 1000;

      if (timeElapsed < fifteenMinutes && parseInt(storedAttempts) >= 3) {
        setRateLimited(true);
        setCooldownTime(Math.ceil((fifteenMinutes - timeElapsed) / 1000));
      } else if (timeElapsed >= fifteenMinutes) {
        localStorage.removeItem("forgotPasswordAttempts");
        localStorage.removeItem("forgotPasswordTimestamp");
      }
    }
  }, [isExpired]);

  useEffect(() => {
    if (rateLimited && cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setRateLimited(false);
            localStorage.removeItem("forgotPasswordAttempts");
            localStorage.removeItem("forgotPasswordTimestamp");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [rateLimited, cooldownTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rateLimited) {
      toast.error(
        `Please wait ${Math.ceil(
          cooldownTime / 60
        )} minutes before trying again`
      );
      return;
    }

    const sanitizedData = sanitizeFormData({
      email: email.trim().toLowerCase(),
    });
    const sanitizedEmail = sanitizedData.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(sanitizedEmail);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("forgotPasswordAttempts", newAttempts.toString());
      localStorage.setItem("forgotPasswordTimestamp", Date.now().toString());

      if (newAttempts >= 3) {
        setRateLimited(true);
        setCooldownTime(15 * 60);
      }

      setSubmitted(true);
      toast.success("Password reset instructions have been sent to your email");
    } catch (error) {
      if (error.status === 429) {
        setRateLimited(true);
        setCooldownTime(15 * 60);
        toast.error(
          "Too many attempts. Please wait 15 minutes before trying again."
        );
      } else {
        toast.error(
          "If an account with that email exists, we have sent password reset instructions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    We've sent password reset instructions to your email
                    address. Please check your inbox and follow the link to
                    reset your password.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Didn't receive the email? Try again
              </button>
              <div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isExpired ? "Password Expired" : "Forgot your password?"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isExpired
              ? "Your password has expired. Enter your email to receive reset instructions."
              : "No worries! Enter your email and we'll send you reset instructions."}
          </p>
        </div>

        {isExpired && (
          <div className="password-expired">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Your password has expired for security reasons. Please reset
                  it to continue using your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {rateLimited && (
          <div className="password-warning">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Too many password reset attempts. Please wait{" "}
                  {formatTime(cooldownTime)} before trying again.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
              disabled={loading || rateLimited}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || rateLimited || !email.trim()}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || rateLimited || !email.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
