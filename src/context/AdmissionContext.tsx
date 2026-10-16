import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdmissionCampaign {
  id: string;
  isActive: boolean;
  title: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: number;
}

interface AdmissionContextType {
  campaigns: AdmissionCampaign[];
  activeCampaign: AdmissionCampaign | null;
  loading: boolean;
  addCampaign: (campaign: Omit<AdmissionCampaign, 'id' | 'createdAt'>) => Promise<void> | void;
  updateCampaign: (id: string, updates: Partial<AdmissionCampaign>) => Promise<void> | void;
  deleteCampaign: (id: string) => Promise<void> | void;
  toggleCampaignStatus: (id: string, isActive: boolean) => Promise<void> | void;
}

const AdmissionContext = createContext<AdmissionContextType>({
  campaigns: [],
  activeCampaign: null,
  loading: true,
  addCampaign: () => {},
  updateCampaign: () => {},
  deleteCampaign: () => {},
  toggleCampaignStatus: () => {},
});

export const AdmissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [campaigns, setCampaigns] = useState<AdmissionCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for admission campaigns in Firebase Firestore
  useEffect(() => {
    // Clean up any legacy dummy campaigns from localStorage
    try {
      localStorage.removeItem('crhs_admission_campaigns');
    } catch (e) {
      // ignore
    }

    const campaignsRef = collection(db, 'campaigns');
    const unsubscribe = onSnapshot(
      campaignsRef,
      (snapshot) => {
        const items: AdmissionCampaign[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            isActive: Boolean(data.isActive),
            title: data.title || '',
            academicYear: data.academicYear || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            description: data.description || '',
            createdAt: Number(data.createdAt) || 0
          });
        });

        // Sort descending by creation date
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setCampaigns(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error in real-time campaigns listener:', error);
        setCampaigns([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCampaign = async (campaignData: Omit<AdmissionCampaign, 'id' | 'createdAt'>) => {
    try {
      if (campaignData.isActive) {
        // Deactivate all existing active campaigns first
        const activeSnap = await getDocs(query(collection(db, 'campaigns'), where('isActive', '==', true)));
        if (!activeSnap.empty) {
          const batch = writeBatch(db);
          activeSnap.forEach((d) => {
            batch.update(doc(db, 'campaigns', d.id), { isActive: false });
          });
          await batch.commit();
        }
      }

      await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error('Failed to add campaign to Firebase:', e);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<AdmissionCampaign>) => {
    try {
      if (updates.isActive) {
        // Deactivate any other active campaigns
        const activeSnap = await getDocs(query(collection(db, 'campaigns'), where('isActive', '==', true)));
        if (!activeSnap.empty) {
          const batch = writeBatch(db);
          activeSnap.forEach((d) => {
            if (d.id !== id) {
              batch.update(doc(db, 'campaigns', d.id), { isActive: false });
            }
          });
          await batch.commit();
        }
      }

      await updateDoc(doc(db, 'campaigns', id), updates);
    } catch (e) {
      console.error('Failed to update campaign in Firebase:', e);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'campaigns', id));
    } catch (e) {
      console.error('Failed to delete campaign from Firebase:', e);
    }
  };

  const toggleCampaignStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        // If activating, deactivate others
        const activeSnap = await getDocs(query(collection(db, 'campaigns'), where('isActive', '==', true)));
        if (!activeSnap.empty) {
          const batch = writeBatch(db);
          activeSnap.forEach((d) => {
            if (d.id !== id) {
              batch.update(doc(db, 'campaigns', d.id), { isActive: false });
            }
          });
          await batch.commit();
        }
      }

      await updateDoc(doc(db, 'campaigns', id), { isActive });
    } catch (e) {
      console.error('Failed to toggle campaign status in Firebase:', e);
    }
  };

  const activeCampaign = campaigns.find((c) => c.isActive) || null;

  return (
    <AdmissionContext.Provider
      value={{
        campaigns,
        activeCampaign,
        loading,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        toggleCampaignStatus,
      }}
    >
      {children}
    </AdmissionContext.Provider>
  );
};

export const useAdmission = () => useContext(AdmissionContext);
