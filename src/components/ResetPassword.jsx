import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../utils/passwordApi";
import {
  validatePassword,
  validatePasswordMatch,
  getStrengthColorClass,
  getStrengthPercentage,
} from "../utils/passwordValidation";
import { sanitizeFormData } from "../utils/sanitizer";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const [validation, setValidation] = useState({
    newPassword: { isValid: true, errors: [], strength: "weak", score: 0 },
    confirmPassword: { isValid: true, error: null },
  });

  useEffect(() => {
    // Validate that we have the required URL parameters
    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new password reset.");
      setTokenValid(false);
      setTimeout(() => {
        navigate("/forgot-password");
      }, 3000);
    }

    // Basic token format validation (you can make this more sophisticated)
    if (token && (token.length < 10 || !/^[a-zA-Z0-9]+$/.test(token))) {
      toast.error("Invalid reset token format.");
      setTokenValid(false);
    }
  }, [token, email, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input data
    const sanitizedData = sanitizeFormData({ [name]: value });
    const sanitizedValue = sanitizedData[name];

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Validate password strength
    if (name === "newPassword") {
      const passwordValidation = validatePassword(sanitizedValue);
      setValidation((prev) => ({
        ...prev,
        newPassword: passwordValidation,
      }));
    }

    // Validate password confirmation
    if (
      name === "confirmPassword" ||
      (name === "newPassword" && formData.confirmPassword)
    ) {
      const confirmValidation = validatePasswordMatch(
        name === "newPassword" ? sanitizedValue : formData.newPassword,
        name === "confirmPassword" ? sanitizedValue : formData.confirmPassword
      );
      setValidation((prev) => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tokenValid) {
      toast.error("Invalid reset token");
      return;
    }

    // Final validation
    const passwordValidation = validatePassword(formData.newPassword);
    const confirmValidation = validatePasswordMatch(
      formData.newPassword,
      formData.confirmPassword
    );

    if (!passwordValidation.isValid || !confirmValidation.isValid) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, token, formData.newPassword);

      toast.success(
        "Password reset successfully! You can now log in with your new password."
      );

      // Clear any stored password expiry flags
      localStorage.removeItem("passwordExpired");

      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successful. Please log in with your new password.",
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.status === 400) {
        toast.error(
          "Invalid or expired reset token. Please request a new password reset."
        );
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      } else if (error.status === 429) {
        toast.error(
          "Too many reset attempts. Please wait before trying again."
        );
      } else {
        toast.error(
          error.message || "Failed to reset password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
                    This password reset link is invalid or has expired. You will
                    be redirected to request a new reset link.
                  </p>
                </div>
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
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
          {email && (
            <p className="mt-1 text-center text-xs text-gray-500">
              Resetting password for: {email}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validation.newPassword.isValid
                    ? "border-gray-300"
                    : "border-red-300"
                }`}
                required
                disabled={loading}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Password Strength</span>
                  <span className="capitalize">
                    {validation.newPassword.strength}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColorClass(
                      validation.newPassword.strength
                    )}`}
                    style={{
                      width: `${getStrengthPercentage(
                        validation.newPassword.score
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Password Errors */}
            {!validation.newPassword.isValid &&
              validation.newPassword.errors.length > 0 && (
                <div className="mt-1">
                  {validation.newPassword.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validation.confirmPassword.isValid
                    ? "border-gray-300"
                    : "border-red-300"
                }`}
                required
                disabled={loading}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Confirmation Error */}
            {!validation.confirmPassword.isValid &&
              validation.confirmPassword.error && (
                <p className="mt-1 text-xs text-red-600">
                  {validation.confirmPassword.error}
                </p>
              )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={
                loading ||
                !validation.newPassword.isValid ||
                !validation.confirmPassword.isValid ||
                !formData.newPassword.trim() ||
                !formData.confirmPassword.trim()
              }
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ||
                !validation.newPassword.isValid ||
                !validation.confirmPassword.isValid ||
                !formData.newPassword.trim() ||
                !formData.confirmPassword.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword;
