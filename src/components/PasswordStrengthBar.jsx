import validator from "validator";

const requirements = [
  { label: "Password too short", test: (pw) => pw.length >= 8 },
  { label: "Add a lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "Add an uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Add a number", test: (pw) => /\d/.test(pw) },
  { label: "Add a special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const getStrength = (pw) => {
  let score = requirements.reduce(
    (acc, req) => acc + (req.test(pw) ? 1 : 0),
    0
  );
  return score;
};

const getBarColor = (score) => {
  if (score <= 2) return "bg-red-500";
  if (score === 3) return "bg-yellow-500";
  if (score === 4) return "bg-blue-500";
  return "bg-green-500";
};

const getStrengthText = (score) => {
  if (score <= 2) return "Weak";
  if (score === 3) return "Fair";
  if (score === 4) return "Good";
  return "Strong";
};

const getTextColor = (score) => {
  if (score <= 2) return "text-red-500";
  if (score === 3) return "text-yellow-500";
  if (score === 4) return "text-blue-500";
  return "text-green-500";
};

export default function PasswordStrengthBar({ password }) {
  const score = getStrength(password);
  const barColor = getBarColor(score);
  const strengthText = getStrengthText(score);
  const textColor = getTextColor(score);

  const failedHints = requirements
    .filter((req) => !req.test(password))
    .map((req) => req.label);

  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!password) return null;

  return (
    <div className="w-full mt-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 flex-1 bg-gray-200 rounded">
          <div
            className={`h-2 rounded transition-all duration-300 ${barColor}`}
            style={{ width: `${(score / requirements.length) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${textColor}`}>
          {strengthText}
        </span>
      </div>

      {/* Hints */}
      {failedHints.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {failedHints.map((hint) => (
            <li key={hint} className="flex items-center gap-1">
              <span className="text-red-500 font-bold">•</span>
              {hint}
            </li>
          ))}
        </ul>
      )}

      {/* Success Message */}
      {isStrong && (
        <div className="text-green-600 text-xs mt-1 flex items-center gap-1">
          <span>✓</span>
          Strong password!
        </div>
      )}
    </div>
  );
}
