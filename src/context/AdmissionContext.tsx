import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addCampaign: (campaign: Omit<AdmissionCampaign, 'id' | 'createdAt'>) => void;
  updateCampaign: (id: string, updates: Partial<AdmissionCampaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string, isActive: boolean) => void;
}

const AdmissionContext = createContext<AdmissionContextType>({
  campaigns: [],
  activeCampaign: null,
  addCampaign: () => {},
  updateCampaign: () => {},
  deleteCampaign: () => {},
  toggleCampaignStatus: () => {},
});

export const AdmissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [campaigns, setCampaigns] = useState<AdmissionCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('crhs_admission_campaigns');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse admission campaigns from localStorage", e);
    }
    const defaultCampaign: AdmissionCampaign = {
      id: 'campaign-2026-2027',
      isActive: true,
      title: 'Online Admissions 2026-27',
      academicYear: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2026-08-31',
      description: '${schoolConfig.schoolName}, ${schoolConfig.location.address} (${schoolConfig.location.state}) invites online applications for Std I to Std XII for the academic session 2026-2027.',
      createdAt: Date.now()
    };
    localStorage.setItem('crhs_admission_campaigns', JSON.stringify([defaultCampaign]));
    return [defaultCampaign];
  });

  const saveCampaigns = (newCampaigns: AdmissionCampaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('crhs_admission_campaigns', JSON.stringify(newCampaigns));
  };

  const addCampaign = (campaignData: Omit<AdmissionCampaign, 'id' | 'createdAt'>) => {
    const newCampaign: AdmissionCampaign = {
      ...campaignData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isActive: campaignData.isActive
    };
    
    let updatedCampaigns = [...campaigns, newCampaign];
    if (newCampaign.isActive) {
      // Deactivate all others
      updatedCampaigns = updatedCampaigns.map(c => 
        c.id === newCampaign.id ? c : { ...c, isActive: false }
      );
    }
    
    saveCampaigns(updatedCampaigns);
  };

  const updateCampaign = (id: string, updates: Partial<AdmissionCampaign>) => {
    let updatedCampaigns = campaigns.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    
    if (updates.isActive) {
      // Deactivate all others if this one is made active
      updatedCampaigns = updatedCampaigns.map(c => 
        c.id === id ? c : { ...c, isActive: false }
      );
    }
    
    saveCampaigns(updatedCampaigns);
  };

  const deleteCampaign = (id: string) => {
    saveCampaigns(campaigns.filter(c => c.id !== id));
  };

  const toggleCampaignStatus = (id: string, isActive: boolean) => {
    let updatedCampaigns = campaigns;
    if (isActive) {
      updatedCampaigns = updatedCampaigns.map(c => ({
        ...c,
        isActive: c.id === id
      }));
    } else {
      updatedCampaigns = updatedCampaigns.map(c => 
        c.id === id ? { ...c, isActive: false } : c
      );
    }
    saveCampaigns(updatedCampaigns);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'crhs_admission_campaigns' && e.newValue) {
        try {
          setCampaigns(JSON.parse(e.newValue));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeCampaign = campaigns.find(c => c.isActive) || null;

  return (
    <AdmissionContext.Provider value={{ 
      campaigns, 
      activeCampaign, 
      addCampaign, 
      updateCampaign, 
      deleteCampaign,
      toggleCampaignStatus
    }}>
      {children}
    </AdmissionContext.Provider>
  );
};

export const useAdmission = () => useContext(AdmissionContext);
