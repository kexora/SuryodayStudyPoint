import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { schoolConfig } from '@/config/schoolConfig';

export interface MailConfig {
  smtpUser?: string;
  smtpPass?: string;
  smtpHost?: string;
  smtpPort?: string;
  senderName?: string;
}

export interface WebsiteSettings {
  schoolName: string;
  logoUrl: string;
  contactNumber: string;
  contactEmail: string;
  address: string;
  mailConfig?: MailConfig;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
    telegram?: string;
    pinterest?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };
  socialEnabled: {
    youtube?: boolean;
    instagram?: boolean;
    facebook?: boolean;
    twitter?: boolean;
    linkedin?: boolean;
    whatsapp?: boolean;
    telegram?: boolean;
    pinterest?: boolean;
    tiktok?: boolean;
    [key: string]: boolean | undefined;
  };
}

const defaultSettings: WebsiteSettings = {
  schoolName: schoolConfig.schoolName,
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=300",
  contactNumber: "8383884201",
  contactEmail: "kexora@proton.me",
  address: schoolConfig.location.fullAddress,
  mailConfig: {
    smtpUser: "kexora@proton.me",
    smtpPass: "",
    smtpHost: "smtp.protonmail.ch",
    smtpPort: "587",
    senderName: `${schoolConfig.schoolName} Administration`,
  },
  socialLinks: {
    youtube: "https://youtube.com/@suryodaystudypoint",
    instagram: "https://instagram.com/suryodaystudypoint",
    facebook: "https://facebook.com/suryodaystudypoint",
    twitter: "https://twitter.com/suryodaystudy",
    linkedin: "https://linkedin.com",
    whatsapp: "https://wa.me/918383884201",
    telegram: "https://t.me/suryodaystudypoint",
    pinterest: "",
    tiktok: ""
  },
  socialEnabled: {
    youtube: true,
    instagram: true,
    facebook: true,
    twitter: true,
    linkedin: false,
    whatsapp: true,
    telegram: true,
    pinterest: false,
    tiktok: false
  }
};

interface SettingsContextType {
  settings: WebsiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  updateSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        
        // Timeout promise after 3500ms to prevent hanging on network/offline state
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firestore fetch timeout")), 3500)
        );

        const docSnap = await Promise.race([
          getDoc(docRef),
          timeoutPromise
        ]) as any;

        if (docSnap && docSnap.exists && docSnap.exists()) {
          const fetchedData = docSnap.data() as Partial<WebsiteSettings>;
          let name = fetchedData.schoolName;
          let addr = fetchedData.address;
          let updatedNeeded = false;

          if (!name || name.toLowerCase().includes('children') || name.toLowerCase().includes('rise')) {
            name = schoolConfig.schoolName;
            updatedNeeded = true;
          }
          if (!addr || addr.toLowerCase().includes('tarwara') || addr.toLowerCase().includes('siwan') || addr.toLowerCase().includes('sirisiya')) {
            addr = schoolConfig.location.fullAddress;
            updatedNeeded = true;
          }

          if (updatedNeeded) {
            setDoc(docRef, {
              schoolName: schoolConfig.schoolName,
              address: schoolConfig.location.fullAddress,
              contactNumber: schoolConfig.contact.phonePrimary,
              contactEmail: schoolConfig.contact.emailPrimary
            }, { merge: true }).catch(console.error);
          }

          setSettings({
            ...defaultSettings,
            ...fetchedData,
            schoolName: name || schoolConfig.schoolName,
            address: addr || schoolConfig.location.fullAddress,
            socialLinks: {
              ...defaultSettings.socialLinks,
              ...(fetchedData.socialLinks || {})
            },
            socialEnabled: {
              ...defaultSettings.socialEnabled,
              ...(fetchedData.socialEnabled || {})
            },
            mailConfig: {
              ...defaultSettings.mailConfig,
              ...(fetchedData.mailConfig || {})
            }
          });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error: any) {
        console.warn("Using default settings due to offline/network state:", error?.message || error);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, newSettings, { merge: true });
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
