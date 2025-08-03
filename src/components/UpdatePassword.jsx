import React, { useState } from "react";
import { toast } from "react-toastify";
import { updatePassword } from "../utils/passwordApi";
import {
  validatePassword,
  validatePasswordMatch,
  getStrengthColorClass,
  getStrengthPercentage,
} from "../utils/passwordValidation";
import { useAuth } from "../context/AuthContext";
import { sanitizeFormData } from "../utils/sanitizer";
import EyeToggle from "./EyeToggle";

const UpdatePassword = ({ onSuccess, className = "" }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validation, setValidation] = useState({
    currentPassword: { isValid: true, error: null },
    newPassword: { isValid: true, errors: [], strength: "weak", score: 0 },
    confirmPassword: { isValid: true, error: null },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const sanitizedData = sanitizeFormData({ [name]: value });
    const sanitizedValue = sanitizedData[name];

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (name === "currentPassword" && !validation.currentPassword.isValid) {
      setValidation((prev) => ({
        ...prev,
        currentPassword: { isValid: true, error: null },
      }));
    }

    if (name === "newPassword") {
      const passwordValidation = validatePassword(sanitizedValue);
      setValidation((prev) => ({
        ...prev,
        newPassword: passwordValidation,
      }));
    }

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

    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    const confirmValidation = validatePasswordMatch(
      formData.newPassword,
      formData.confirmPassword
    );

    if (!passwordValidation.isValid || !confirmValidation.isValid) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    if (!formData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(
        user._id,
        formData.currentPassword,
        formData.newPassword
      );

      toast.success("Password updated successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setValidation({
        currentPassword: { isValid: true, error: null },
        newPassword: { isValid: true, errors: [], strength: "weak", score: 0 },
        confirmPassword: { isValid: true, error: null },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error.status === 401) {
        if (
          error.message.includes("Current password is incorrect") ||
          error.message.includes("current password")
        ) {
          toast.error("Current password is incorrect. Please try again.");

          setValidation((prev) => ({
            ...prev,
            currentPassword: {
              isValid: false,
              error: "Current password is incorrect",
            },
          }));
        } else {
          toast.error("Authentication failed. Please try again.");
        }
      } else if (error.status === 400) {
        toast.error(
          error.message || "Invalid password data. Please check your input."
        );
      } else if (error.status === 403) {
        toast.error("You don't have permission to update this password.");
      } else {
        toast.error(
          error.message || "Failed to update password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`update-password-container ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Update Password</h3>

      <form onSubmit={handleSubmit} className="password-form space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !validation.currentPassword.isValid
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              required
              disabled={loading}
            />
            <EyeToggle
              showPassword={showPasswords.current}
              toggleVisibility={() => togglePasswordVisibility("current")}
            />
          </div>
          {!validation.currentPassword.isValid && (
            <p className="text-red-500 text-sm mt-1">
              {validation.currentPassword.error}
            </p>
          )}
        </div>

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
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validation.newPassword.isValid
                  ? "border-gray-300"
                  : "border-red-300"
              }`}
              required
              disabled={loading}
            />
            <EyeToggle
              showPassword={showPasswords.new}
              toggleVisibility={() => togglePasswordVisibility("new")}
            />
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
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validation.confirmPassword.isValid
                  ? "border-gray-300"
                  : "border-red-300"
              }`}
              required
              disabled={loading}
            />
            <EyeToggle
              showPassword={showPasswords.confirm}
              toggleVisibility={() => togglePasswordVisibility("confirm")}
            />
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
        <button
          type="submit"
          disabled={
            loading ||
            !validation.newPassword.isValid ||
            !validation.confirmPassword.isValid ||
            !formData.currentPassword.trim()
          }
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            loading ||
            !validation.newPassword.isValid ||
            !validation.confirmPassword.isValid ||
            !formData.currentPassword.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;
