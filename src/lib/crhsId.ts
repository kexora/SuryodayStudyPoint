/**
 * Automated CRHS ID Generation Strategy
 * Format:
 * - First 6 digits: Registration Date in DDMMYY format (e.g., 221026 for 22nd Oct 2026)
 * - Last 6 digits: Unique 6-digit random number (100000 - 999999)
 * - Total 12 digits (e.g., 221026123456)
 */
export function generateCrhsId(registrationDate: Date = new Date()): string {
  const day = String(registrationDate.getDate()).padStart(2, '0');
  const month = String(registrationDate.getMonth() + 1).padStart(2, '0');
  const year = String(registrationDate.getFullYear()).slice(-2); // e.g., '26' for 2026

  const datePrefix = `${day}${month}${year}`; // 6 digits

  // Generate a random 6-digit number
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();

  return `${datePrefix}${randomSuffix}`;
}

/**
 * Real-time validation helper functions
 */
export const validateMobileNumber = (mobile: string): boolean => {
  return /^[0-9]{10}$/.test(mobile.trim());
};

export const validatePincode = (pincode: string): boolean => {
  return /^[0-9]{6}$/.test(pincode.trim());
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
