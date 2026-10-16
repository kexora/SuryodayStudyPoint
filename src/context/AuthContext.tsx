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
  updateUserData: (newFields: Partial<UserData>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  role: null,
  signOut: async () => {},
  refreshUserData: async () => {},
  updateUserData: async () => false,
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
        const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();
        const isAdmin = cleanEmail === 'kexorastudio@gmail.com' || cleanEmail === 'admin@kexora.in' || cleanEmail.startsWith('admin@');
        const newUser: UserData = {
          uid: firebaseUser.uid,
          role: isAdmin ? '__kx_0x1' : '__kx_0x4',
          email: firebaseUser.email,
          name: firebaseUser.displayName || (isAdmin ? 'Admin' : 'Student'),
          fullName: firebaseUser.displayName || (isAdmin ? 'Admin' : 'Student'),
        };
        await setDoc(userRef, newUser).catch(() => {});
        setUserData(newUser);
        localStorage.setItem('secure_user_data', encryptData(newUser));
      }
    } catch (error: any) {
      console.error("Firestore error loading user profile:", error);
      const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();
      const isAdmin = cleanEmail === 'kexorastudio@gmail.com' || cleanEmail === 'admin@kexora.in' || cleanEmail.startsWith('admin@');
      const fallbackData: UserData = {
        uid: firebaseUser.uid,
        role: isAdmin ? '__kx_0x1' : '__kx_0x4',
        email: firebaseUser.email,
        name: firebaseUser.displayName || (isAdmin ? 'Admin' : 'Student'),
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

  const updateUserData = async (newFields: Partial<UserData>): Promise<boolean> => {
    try {
      const current = userData || ({} as UserData);
      const updated: UserData = {
        ...current,
        ...newFields,
        fullName: newFields.fullName || newFields.name || current.fullName || current.name || '',
        name: newFields.fullName || newFields.name || current.fullName || current.name || '',
      };

      // 1. Immediately update local state
      setUserData(updated);

      // 2. Encrypt & save to localStorage session
      localStorage.setItem('secure_user_data', encryptData(updated));

      // 3. Update ssp_local_users cache
      try {
        const localUsers = JSON.parse(localStorage.getItem('ssp_local_users') || '[]');
        const idx = localUsers.findIndex((u: any) => 
          (updated.uid && u.uid === updated.uid) || 
          (updated.email && u.email === updated.email) ||
          (updated.mobileNumber && u.mobileNumber === updated.mobileNumber)
        );
        if (idx >= 0) {
          localUsers[idx] = { ...localUsers[idx], ...updated };
        } else {
          localUsers.push(updated);
        }
        localStorage.setItem('ssp_local_users', JSON.stringify(localUsers));
      } catch (cacheErr) {
        console.warn("Local users update error:", cacheErr);
      }

      // 4. Persist to Firestore with timeout so UI never hangs
      const targetUid = user?.uid || updated.uid;
      if (targetUid) {
        try {
          const userRef = doc(db, 'users', targetUid);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore write timeout")), 4000)
          );
          await Promise.race([
            setDoc(userRef, updated, { merge: true }),
            timeoutPromise
          ]);
        } catch (dbErr) {
          console.warn("Firestore save details notice:", dbErr);
        }
      }

      return true;
    } catch (err) {
      console.error("Error in updateUserData:", err);
      return false;
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
    <AuthContext.Provider value={{ user, userData, loading, role: userData?.role || null, signOut, refreshUserData, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
