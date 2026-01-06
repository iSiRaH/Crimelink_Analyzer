/**
 * Weapon utility functions
 */

/**
 * Format date string to display format
 * @param dateString - ISO date string from backend
 * @returns Formatted date string (DD/MM/YYYY) or fallback text
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
 * Check if a weapon return is overdue
 * @param dueDate - Due date string
 * @returns true if overdue, false otherwise
 */
export const isWeaponOverdue = (dueDate?: string): boolean => {
  if (!dueDate || dueDate === "--") return false;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return due < today;
  } catch {
    return false;
  }
};

/**
 * Get weapon status color class
 * @param status - Weapon status
 * @returns Tailwind color class
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
