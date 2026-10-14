import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { encryptData, decryptData } from '@/lib/encryption';
import { UserData, UserRole } from '@/types';

export type { UserRole, UserData };

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  role: UserRole | null;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  role: null,
  signOut: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(() => {
    const encryptedData = localStorage.getItem('secure_user_data');
    if (encryptedData) {
      return decryptData(encryptedData);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        setUserData(data);
        localStorage.setItem('secure_user_data', encryptData(data));
      } else {
        // New user without doc
        const newUser: UserData = {
          uid: firebaseUser.uid,
          role: '__kx_0x4',
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          fullName: firebaseUser.displayName || undefined,
        };
        await setDoc(userRef, newUser);
        setUserData(newUser);
        localStorage.setItem('secure_user_data', encryptData(newUser));
      }
    } catch (error: any) {
      console.error("Firestore error loading user profile:", error);
      const fallbackData: UserData = {
        uid: firebaseUser.uid,
        role: '__kx_0x4',
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      };
      setUserData(fallbackData);
      localStorage.setItem('secure_user_data', encryptData(fallbackData));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
        localStorage.removeItem('secure_user_data');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('secure_user_data');
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, role: userData?.role || null, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
