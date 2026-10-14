import React, { useState, useEffect } from 'react';
import { useSettings, WebsiteSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Settings, Save, Loader2, Link as LinkIcon, Phone, Mail, MapPin, Upload, Share2, Send, CheckCircle2, AlertCircle, Key, Eye, EyeOff, Users, Sparkles } from 'lucide-react';
import { getGlobalDriveToken, getOrCreateDriveFolder, checkGlobalDriveStatus, disconnectGoogleDrive } from '@/lib/driveAuth';
import { SocialIcons } from '@/common/components/ui/SocialIcons';
import { ImageWithLoader } from '@/common/components/ui/ImageWithLoader';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/types';
import { schoolConfig } from '@/config/schoolConfig';

const SOCIAL_PLATFORMS = [
  { key: 'youtube', label: 'YouTube', defaultUrl: 'https://youtube.com/@...' },
  { key: 'instagram', label: 'Instagram', defaultUrl: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook', defaultUrl: 'https://facebook.com/...' },
  { key: 'twitter', label: 'Twitter / X', defaultUrl: 'https://x.com/...' },
  { key: 'linkedin', label: 'LinkedIn', defaultUrl: 'https://linkedin.com/...' },
  { key: 'whatsapp', label: 'WhatsApp', defaultUrl: 'https://wa.me/...' },
  { key: 'telegram', label: 'Telegram', defaultUrl: 'https://t.me/...' },
  { key: 'pinterest', label: 'Pinterest', defaultUrl: 'https://pinterest.com/...' },
  { key: 'tiktok', label: 'TikTok', defaultUrl: 'https://tiktok.com/@...' },
];

export function AdminSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState<WebsiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Google Drive states
  const [driveConnected, setDriveConnected] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check global drive status
  useEffect(() => {
    checkGlobalDriveStatus().then(status => setDriveConnected(status));
  }, []);

  // Update formData when settings change
  useEffect(() => {
    setFormData({
      ...settings,

      socialLinks: {
        youtube: "https://youtube.com/@childrensrisehighschool",
        instagram: "https://instagram.com/childrensrisehighschool",
        facebook: "https://facebook.com/childrensrisehighschool",
        twitter: "https://twitter.com/crhs_school",
        linkedin: "https://linkedin.com",
        whatsapp: "https://wa.me/911234567890",
        telegram: "https://t.me/crhs_school",
        pinterest: "",
        tiktok: "",
        ...(settings.socialLinks || {})
      },
      socialEnabled: {
        youtube: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: false,
        whatsapp: true,
        telegram: false,
        pinterest: false,
        tiktok: false,
        ...(settings.socialEnabled || {})
      }
    });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialToggle = (platformKey: string) => {
    setFormData(prev => ({
      ...prev,
      socialEnabled: {
        ...prev.socialEnabled,
        [platformKey]: !(prev.socialEnabled?.[platformKey] ?? false)
      }
    }));
  };

  const handleSocialUrlChange = (platformKey: string, urlValue: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platformKey]: urlValue
      }
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPendingFile(file);
    setCustomFileName(file.name);
  };

  const executeUpload = async () => {
    if (!pendingFile) return;

    setIsUploading(true);
    setUploadProgress(20);
    setMessage({ text: '', type: '' });

    try {
      let token = await getGlobalDriveToken();
      if (!token) {
        throw new Error('Global Google Drive is not configured. Please ask Super Admin to link Drive in Technical Settings.');
      }

      setUploadProgress(40);

      // Create CRHS folder
      const rootFolderId = await getOrCreateDriveFolder(token, 'crhs');
      // Create logo subfolder inside CRHS
      const targetFolderId = await getOrCreateDriveFolder(token, 'logo', rootFolderId);

      setUploadProgress(60);

      // Upload directly to Google Drive via multipart POST
      const metadata = {
        name: customFileName || pendingFile.name,
        mimeType: pendingFile.type,
        parents: [targetFolderId]
      };

      const formDataUpload = new FormData();
      formDataUpload.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formDataUpload.append('file', pendingFile);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to upload to Google Drive');
      }

      const fileData = await response.json();
      const fileId = fileData.id;

      setUploadProgress(80);

      // Make file public read so logo image displays on website
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }).catch(() => {});

      const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;

      setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
      setUploadProgress(100);
      setMessage({ text: 'Logo uploaded successfully to Google Drive!', type: 'success' });
      setPendingFile(null);
    } catch (error: any) {
      console.error('Error uploading to Google Drive:', error);
      if (error.message?.includes('401') || error.message?.toLowerCase().includes('unauthorized') || error.message?.toLowerCase().includes('expired')) {
        disconnectGoogleDrive();
        setDriveConnected(false);
        setMessage({ text: 'Drive session expired. Please connect Google Drive again.', type: 'error' });
      } else {
        setMessage({ 
          text: `Upload failed: ${error.message || 'Unknown error'}`, 
          type: 'error' 
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await updateSettings(formData);
      setMessage({ text: 'Website Settings, Admin Mail Credentials & Social Links updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (error) {
      setMessage({ text: 'Failed to update settings. Check console for details.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crhs-navy" /></div>;
  }

  return (
    <div className="space-y-8">
      
      {/* 1. GENERAL WEBSITE SETTINGS CARD */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-white border-b border-slate-100 py-5 px-6">
          <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-crhs-navy" />
            Website Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {message.text && (
            <div className={`p-4 mb-6 rounded-md font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Information */}
            <div>
              <h3 className="text-sm font-bold text-crhs-navy uppercase tracking-widest mb-4 border-b pb-2">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">School Name</label>
                  <Input 
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder={`e.g. ${schoolConfig.schoolName}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Logo URL (Square Image Recommended)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <div className="flex gap-3 items-center flex-1">
                        <ImageWithLoader 
                          src={formData.logoUrl || "https://placehold.co/100x100"} 
                          alt="Logo Preview" 
                          className="max-w-full max-h-full object-contain p-1" 
                          containerClassName="w-12 h-12 bg-slate-100 rounded-md border shrink-0"
                        />
                        <Input 
                          name="logoUrl"
                          value={formData.logoUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                          required
                          className="flex-1"
                        />
                      </div>
                      
                      {driveConnected ? (
                        <div className="flex items-center gap-2 justify-between sm:justify-start">
                          <div className="relative overflow-hidden inline-block shrink-0 flex-1 sm:flex-none">
                            <Button type="button" variant="outline" className="bg-slate-100 h-9 w-full sm:w-auto" disabled={isUploading}>
                              <Upload className="w-4 h-4 mr-2" />
                              Select Image
                            </Button>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileSelect} 
                              disabled={isUploading}
                              className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-600 font-bold flex items-center bg-red-50 p-2 rounded-md border border-red-200">
                          <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                          Global Drive not linked. Please configure in Technical Settings to upload logos.
                        </div>
                      )}
                    </div>

                    {pendingFile && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full items-stretch sm:items-end bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="flex-1">
                          <label className="text-xs text-blue-800 font-medium mb-1 block">Rename logo file before upload (optional):</label>
                          <Input 
                            value={customFileName}
                            onChange={(e) => setCustomFileName(e.target.value)}
                            className="h-8 bg-white"
                          />
                        </div>
                        <Button type="button" onClick={executeUpload} disabled={isUploading} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-8 text-sm">
                          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Upload Logo to Drive
                        </Button>
                      </div>
                    )}

                    {isUploading && (
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-crhs-navy h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-bold text-crhs-navy uppercase tracking-widest mb-4 border-b pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <Input 
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <Input 
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="info@school.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Physical Address
                  </label>
                  <Input 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 School Lane, City, State, ZIP"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links & Controls */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-md font-bold text-crhs-navy uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-crhs-gold" /> Social Media Management
              </h3>
              <p className="text-xs text-slate-500">
                Enable or disable social media platforms. Disabled platforms will be hidden from the website header and footer.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const platformKey = platform.key;
                  const isEnabled = formData.socialEnabled?.[platformKey] ?? false;
                  const currentUrl = formData.socialLinks?.[platformKey] || '';

                  return (
                    <div key={platform.key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          {SocialIcons[platformKey as keyof typeof SocialIcons] && 
                            React.createElement(SocialIcons[platformKey as keyof typeof SocialIcons], { 
                              className: "w-4 h-4 text-crhs-navy stroke-[2]" 
                            })
                          }
                          <span>{platform.label}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSocialToggle(platformKey)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span className="sr-only">Enable {platform.label}</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input 
                          value={currentUrl}
                          onChange={(e) => handleSocialUrlChange(platformKey, e.target.value)}
                          placeholder={platform.defaultUrl}
                          disabled={!isEnabled}
                          className={!isEnabled ? 'opacity-50 bg-slate-100' : 'bg-white'}
                        />
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-md shrink-0 text-center ${
                          isEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-500 border border-slate-300'
                        }`}>
                          {isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSaving} className="bg-crhs-navy text-white min-w-32">
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      

    </div>
  );
}

