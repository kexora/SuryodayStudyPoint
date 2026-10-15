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
      try {
        return decryptData(encryptedData);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore user fetch timeout")), 3500)
      );

      const userSnap = await Promise.race([
        getDoc(userRef),
        timeoutPromise
      ]) as any;

      if (userSnap && userSnap.exists && userSnap.exists()) {
        const data = userSnap.data() as UserData;
        setUserData(data);
        localStorage.setItem('secure_user_data', encryptData(data));
      } else {
        const newUser: UserData = {
          uid: firebaseUser.uid,
          role: '__kx_0x4',
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Student',
          fullName: firebaseUser.displayName || 'Student',
        };
        await setDoc(userRef, newUser).catch(() => {});
        setUserData(newUser);
        localStorage.setItem('secure_user_data', encryptData(newUser));
      }
    } catch (error: any) {
      console.error("Firestore error loading user profile:", error);
      const fallbackData: UserData = {
        uid: firebaseUser.uid,
        role: '__kx_0x4',
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Student',
      };
      setUserData(fallbackData);
      localStorage.setItem('secure_user_data', encryptData(fallbackData));
    }
  };

  useEffect(() => {
    // If there is local secure_user_data already, set user initially for instant load
    const encryptedData = localStorage.getItem('secure_user_data');
    if (encryptedData) {
      try {
        const data = decryptData(encryptedData);
        if (data) {
          setUserData(data);
          setUser({ uid: data.uid || 'local-user', email: data.email, displayName: data.name } as any);
        }
      } catch (e) {
        console.error("Error loading local auth cache", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        // Keep local user if active and offline, or clear if signed out explicitly
        if (!localStorage.getItem('secure_user_data')) {
          setUserData(null);
        }
      }
      setLoading(false);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('secure_user_data');
    localStorage.removeItem('ssp_current_user');
    setUserData(null);
    setUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, role: userData?.role || null, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
