/**
 * Password validation utility
 * Provides client-side password strength validation
 */

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SYMBOL: true,
};

export const PASSWORD_STRENGTH = {
  WEAK: "weak",
  MEDIUM: "medium",
  STRONG: "strong",
};

/**
 * Validate password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors and strength
 */
export const validatePassword = (password) => {
  const errors = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ["Password is required"],
      strength: PASSWORD_STRENGTH.WEAK,
      score: 0,
    };
  }

  // Length validation
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`
    );
  } else {
    score += 1;
  }

  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    errors.push(
      `Password must be less than ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters long`
    );
  }

  // Character type validation
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE) {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE) {
    score += 1;
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER) {
    score += 1;
  }

  if (
    PASSWORD_REQUIREMENTS.REQUIRE_SYMBOL &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  } else if (PASSWORD_REQUIREMENTS.REQUIRE_SYMBOL) {
    score += 1;
  }

  // Common password patterns
  if (password.toLowerCase().includes("password")) {
    errors.push('Password cannot contain the word "password"');
    score = Math.max(0, score - 1);
  }

  if (/^(.)\1+$/.test(password)) {
    errors.push("Password cannot be all the same character");
    score = 0;
  }

  // Sequential characters
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i.test(
      password
    )
  ) {
    errors.push("Password cannot contain sequential characters");
    score = Math.max(0, score - 1);
  }

  // Determine strength
  let strength;
  if (score <= 2) {
    strength = PASSWORD_STRENGTH.WEAK;
  } else if (score <= 3) {
    strength = PASSWORD_STRENGTH.MEDIUM;
  } else {
    strength = PASSWORD_STRENGTH.STRONG;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

/**
 * Check if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} Match validation result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: "Please confirm your password",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Get password strength color class
 * @param {string} strength - Password strength level
 * @returns {string} CSS class name
 */
export const getStrengthColorClass = (strength) => {
  switch (strength) {
    case PASSWORD_STRENGTH.WEAK:
      return "strength-weak";
    case PASSWORD_STRENGTH.MEDIUM:
      return "strength-medium";
    case PASSWORD_STRENGTH.STRONG:
      return "strength-strong";
    default:
      return "strength-weak";
  }
};

/**
 * Get password strength percentage
 * @param {number} score - Password strength score
 * @returns {number} Percentage (0-100)
 */
export const getStrengthPercentage = (score) => {
  return Math.min(100, (score / 5) * 100);
};
