import CryptoJS from 'crypto-js';

// @ts-ignore
const env = import.meta.env || process.env;
const SECRET_KEY = env.VITE_ENCRYPTION_KEY || 'kexora_secure_key_123';

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (decryptedString) {
      return JSON.parse(decryptedString);
    }
  } catch (error) {
    console.error('Error decrypting data:', error);
  }
  return null;
};
