// src/components/PasswordStrengthIndicator.tsx
import React from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const calculateStrength = (): {
    score: number;
    label: string;
    color: string;
    checks: { [key: string]: boolean };
  } => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks === 5) {
      return {
        score: 100,
        label: "Strong",
        color: "bg-green-500",
        checks,
      };
    } else if (passedChecks >= 3) {
      return {
        score: 60,
        label: "Medium",
        color: "bg-yellow-500",
        checks,
      };
    } else {
      return {
        score: 30,
        label: "Weak",
        color: "bg-red-500",
        checks,
      };
    }
  };

  const strength = calculateStrength();

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`${strength.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${strength.score}%` }}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            strength.label === "Strong"
              ? "text-green-600"
              : strength.label === "Medium"
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-1">
          <span className={strength.checks.length ? "text-green-600" : ""}>
            {strength.checks.length ? "✓" : "○"}
          </span>
          <span>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={strength.checks.uppercase ? "text-green-600" : ""}>
            {strength.checks.uppercase ? "✓" : "○"}
          </span>
          <span>One uppercase letter</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={strength.checks.lowercase ? "text-green-600" : ""}>
            {strength.checks.lowercase ? "✓" : "○"}
          </span>
          <span>One lowercase letter</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={strength.checks.number ? "text-green-600" : ""}>
            {strength.checks.number ? "✓" : "○"}
          </span>
          <span>One number</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={strength.checks.special ? "text-green-600" : ""}>
            {strength.checks.special ? "✓" : "○"}
          </span>
          <span>One special character (@$!%*?&#)</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
