/**
 * Weapon utility functions
 */

/**
 * Parse a date that may be ISO (from backend) or already formatted as DD/MM/YYYY.
 * Returns a Date object or null if invalid.
 */
export const parseWeaponDate = (value?: string): Date | null => {
  if (!value || value === "--") return null;

  // If it's already DD/MM/YYYY, parse safely
  const m = value.match(/^\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);

    // Validate (Date will autocorrect invalid days)
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) return d;
    return null;
  }

  // Fallback: let JS parse ISO strings
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format date string to display format (DD/MM/YYYY)
 */
export const formatWeaponDate = (dateString?: string): string => {
  if (!dateString) return "--";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "--";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return "--";
  }
};

/**
 * Check if a weapon return is overdue.
 * Accepts ISO or DD/MM/YYYY.
 */
export const isWeaponOverdue = (dueDate?: string): boolean => {
  const due = parseWeaponDate(dueDate);
  if (!due) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  } catch {
    return false;
  }
};

/**
 * Get weapon status color class
 */
export const getWeaponStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case "AVAILABLE":
      return "text-green-400";
    case "ISSUED":
      return "text-red-400";
    case "MAINTENANCE":
      return "text-yellow-400";
    case "RETIRED":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
};
