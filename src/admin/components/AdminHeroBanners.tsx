import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getGlobalDriveToken, getOrCreateDriveFolder, checkGlobalDriveStatus, signInWithGoogleDrive, disconnectGoogleDrive } from '@/lib/driveAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Image as ImageIcon, Plus, Trash2, Edit, Save, Loader2, X, Upload } from 'lucide-react';
import { ImageWithLoader } from '@/common/components/ui/ImageWithLoader';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  order: number;
}

export function AdminHeroBanners() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  
  const initialFormState = {
    image: '',
    title: '',
    subtitle: '',
    cta: 'Learn More',
    link: '/',
    order: 0
  };
  const [formData, setFormData] = useState<Partial<HeroSlide>>(initialFormState);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    fetchSlides();
    checkGlobalDriveStatus().then(status => setDriveConnected(status));
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'hero_slides'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const fetchedSlides: HeroSlide[] = [];
      snapshot.forEach((document) => {
        fetchedSlides.push({ id: document.id, ...document.data() } as HeroSlide);
      });
      setSlides(fetchedSlides);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      setMessage({ text: 'Error loading banners.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDrive = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setMessage({ text: 'Authenticating with Google Drive...', type: 'info' });
      const authResult = await signInWithGoogleDrive();
      if (authResult) {
         setDriveConnected(true);
         setMessage({ text: 'Google Drive connected. You can now upload images.', type: 'success' });
      }
    } catch (error: any) {
      console.error('Error connecting to Drive:', error);
      setMessage({ text: `Auth failed: ${error.message || 'Unknown error'}`, type: 'error' });
    }
  };

  const handleDisconnectDrive = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    disconnectGoogleDrive();
    setDriveConnected(false);
    setMessage({ text: 'Disconnected from Google Drive.', type: 'info' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
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
      // Create hero_banners folder inside CRHS
      const targetFolderId = await getOrCreateDriveFolder(token, 'hero_banners', rootFolderId);

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

      // Make file public read so banner image displays on website
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

      setFormData(prev => ({ ...prev, image: imageUrl }));
      setUploadProgress(100);
      setMessage({ text: 'Uploaded successfully to Google Drive!', type: 'success' });
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

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setIsAdding(false);
    setFormData(slide);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ ...initialFormState, order: slides.length });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
    setPendingFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      if (editingId) {
        const slideRef = doc(db, 'hero_slides', editingId);
        await updateDoc(slideRef, formData);
        setMessage({ text: 'Banner updated successfully!', type: 'success' });
      } else {
        await addDoc(collection(db, 'hero_slides'), formData);
        setMessage({ text: 'Banner added successfully!', type: 'success' });
      }
      handleCancel();
      fetchSlides();
    } catch (error) {
      console.error('Error saving banner:', error);
      setMessage({ text: 'Failed to save banner.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'hero_slides', id));
      fetchSlides();
      setMessage({ text: 'Banner deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting banner:', error);
      setMessage({ text: 'Failed to delete banner.', type: 'error' });
    }
  };

  if (loading && slides.length === 0) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crhs-navy" /></div>;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-white border-b border-slate-100 py-5 px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-crhs-navy" />
          Hero Banners
        </CardTitle>
        {!isAdding && !editingId && (
          <Button onClick={handleAddNew} className="bg-crhs-navy text-white h-9 px-4">
            <Plus className="w-4 h-4 mr-2" /> Add Banner
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {message.text && (
          <div className={`p-4 mb-6 rounded-md font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h3 className="font-bold text-crhs-navy uppercase tracking-wider">
                {isAdding ? 'Add New Banner' : 'Edit Banner'}
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Image URL or Upload</label>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="w-full sm:w-20 h-24 sm:h-12 bg-slate-200 rounded overflow-hidden shrink-0 border">
                    {formData.image ? (
                      <ImageWithLoader src={formData.image} alt="Preview" className="w-full h-full object-cover" containerClassName="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Input 
                          name="image" 
                          value={formData.image} 
                          onChange={handleChange} 
                          placeholder="https://... or upload below" 
                          required 
                          className="flex-1"
                        />
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
                            <Button 
                              type="button" 
                              variant="ghost" 
                              className="h-9 text-xs text-slate-500 hover:text-red-600 px-2 shrink-0"
                              onClick={handleDisconnectDrive}
                              title="Disconnect Google Drive"
                            >
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button type="button" variant="outline" className="bg-slate-100 h-9 w-full sm:w-auto shrink-0" onClick={handleConnectDrive}>
                            <Upload className="w-4 h-4 mr-2" />
                            Connect Drive to Upload
                          </Button>
                        )}
                      </div>

                      {pendingFile && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full items-stretch sm:items-end bg-blue-50 p-3 rounded-md border border-blue-100 mt-2">
                          <div className="flex-1">
                            <label className="text-xs text-blue-800 font-medium mb-1 block">Rename file before upload (optional):</label>
                            <Input 
                              value={customFileName}
                              onChange={(e) => setCustomFileName(e.target.value)}
                              className="h-8 bg-white"
                            />
                          </div>
                          <Button type="button" onClick={executeUpload} disabled={isUploading} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-8 text-sm">
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Upload to Drive
                          </Button>
                        </div>
                      )}
                    </div>
                    {isUploading && (
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                        <div className="bg-crhs-navy h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Title</label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Main heading..." 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subtitle</label>
                <Input 
                  name="subtitle" 
                  value={formData.subtitle} 
                  onChange={handleChange} 
                  placeholder="Small text above title..." 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CTA Button Text</label>
                <Input 
                  name="cta" 
                  value={formData.cta} 
                  onChange={handleChange} 
                  placeholder="e.g. Learn More" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CTA Link</label>
                <Input 
                  name="link" 
                  value={formData.link} 
                  onChange={handleChange} 
                  placeholder="e.g. /about" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Order</label>
                <Input 
                  name="order" 
                  type="number"
                  value={formData.order} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-3" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-crhs-navy text-white min-w-32">
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map(slide => (
            <div key={slide.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="h-40 bg-slate-200 relative overflow-hidden">
                <ImageWithLoader src={slide.image} alt={slide.title} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-20">
                  Order: {slide.order}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-crhs-gold text-[10px] font-bold uppercase tracking-wider mb-1">{slide.subtitle}</div>
                <h4 className="font-bold text-crhs-navy leading-tight mb-3 flex-1">{slide.title}</h4>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(slide)}>
                    <Edit className="w-3 h-3 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 flex-none" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {slides.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
              No hero banners found. Click "Add Banner" to create one.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
