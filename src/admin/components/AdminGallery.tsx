import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect } from 'react';
import { Button } from '@/common/components/ui/Button';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { Input } from '@/common/components/ui/Input';
import { Modal } from '@/common/components/ui/Modal';
import { ImageWithLoader } from '@/common/components/ui/ImageWithLoader';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, Plus, Trash2, Edit, Save, Loader2, X, Upload, 
  Search, Filter, FolderPlus, Tag, Check, AlertCircle, HardDrive, Images
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const DEFAULT_CATEGORIES = ['Campus', 'Sports', 'Events', 'Classrooms', 'Extracurricular'];

interface GalleryPhoto {
  id: string;
  url: string;
  cat: string;
  title: string;
  desc: string;
}

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  desc: string;
  cat: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export function AdminGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  // Form State (for edit or single add)
  const [formData, setFormData] = useState({ title: '', cat: DEFAULT_CATEGORIES[0], desc: '', url: '' });
  const [isCustomCatMode, setIsCustomCatMode] = useState(false);

  // Bulk Upload State
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [globalCategory, setGlobalCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);

  // Notifications
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched: GalleryPhoto[] = [];
      const cats = new Set<string>(DEFAULT_CATEGORIES);

      snapshot.forEach(doc => {
        const data = doc.data() as Omit<GalleryPhoto, 'id'>;
        fetched.push({ id: doc.id, ...data });
        if (data.cat) cats.add(data.cat);
      });
      
      setPhotos(fetched);
      setDynamicCategories(Array.from(cats));
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setMessage({ text: 'Failed to load gallery photos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleOpenAddModal = () => {
    setEditingPhoto(null);
    setFormData({ title: '', cat: DEFAULT_CATEGORIES[0], desc: '', url: '' });
    setIsCustomCatMode(false);
    setPendingUploads([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || '',
      cat: photo.cat || DEFAULT_CATEGORIES[0],
      desc: photo.desc || '',
      url: photo.url || ''
    });
    
    if (!dynamicCategories.includes(photo.cat)) {
      setIsCustomCatMode(true);
      setFormData(prev => ({ ...prev, customCat: photo.cat }));
    } else {
      setIsCustomCatMode(false);
    }
    setPendingUploads([]);
    setIsModalOpen(true);
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        setMessage({ text: 'Photo deleted successfully', type: 'success' });
        fetchPhotos();
      } catch (error) {
        setMessage({ text: 'Failed to delete photo', type: 'error' });
      }
    }
  };

  // --- Bulk Upload Handlers ---
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newPending = files.map((file, index) => {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        return {
          id: `${Date.now()}_${index}`,
          file,
          previewUrl: URL.createObjectURL(file),
          title: titleWithoutExt,
          desc: '',
          cat: globalCategory,
          progress: 0,
          status: 'pending' as const
        };
      });
      setPendingUploads(prev => [...prev, ...newPending]);
    }
  };

  const removePendingUpload = (id: string) => {
    setPendingUploads(prev => prev.filter(p => p.id !== id));
  };

  const updatePendingUpload = (id: string, field: string, value: string) => {
    setPendingUploads(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const applyGlobalCategory = (val: string) => {
    setGlobalCategory(val);
    setPendingUploads(prev => prev.map(p => ({ ...p, cat: val })));
  };

  const handleBulkUpload = async () => {
    const pendingToUpload = pendingUploads.filter(p => p.status === 'pending' || p.status === 'error');
    if (pendingToUpload.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let item of pendingToUpload) {
      try {
        // update status to uploading
        setPendingUploads(prev => prev.map(p => p.id === item.id ? { ...p, status: 'uploading', progress: 10 } : p));
        
        const storageRef = ref(storage, `gallery/${Date.now()}_${item.file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, item.file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setPendingUploads(prev => prev.map(p => p.id === item.id ? { ...p, progress } : p));
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Add to firestore
                const photoPayload = {
                  title: item.title.trim(),
                  cat: item.cat,
                  desc: item.desc.trim(),
                  url: downloadURL,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                };
                
                await addDoc(collection(db, 'gallery'), photoPayload);
                successCount++;
                setPendingUploads(prev => prev.map(p => p.id === item.id ? { ...p, status: 'success', progress: 100 } : p));
                resolve();
              } catch (e) {
                reject(e);
              }
            }
          );
        });

      } catch (error: any) {
        setPendingUploads(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', errorMsg: error.message } : p));
      }
    }

    setIsUploading(false);
    setMessage({ text: `Successfully uploaded ${successCount} photos!`, type: 'success' });
    if (successCount > 0) {
      fetchPhotos();
      // Remove successful uploads from list
      setPendingUploads(prev => prev.filter(p => p.status !== 'success'));
      if (pendingToUpload.length === successCount && !editingPhoto) {
        setIsModalOpen(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    
    if (!formData.title.trim() || !formData.url.trim()) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

    const finalCategory = isCustomCatMode ? (formData as any).customCat?.trim() : formData.cat;
    if (!finalCategory) {
      setMessage({ text: 'Please select a category', type: 'error' });
      return;
    }

    try {
      const photoPayload = {
        title: formData.title.trim(),
        cat: finalCategory,
        desc: formData.desc.trim(),
        url: formData.url.trim(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'gallery', editingPhoto.id), photoPayload);
      setMessage({ text: 'Gallery photo updated successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchPhotos();
    } catch (error: any) {
      setMessage({ text: 'Error saving photo', type: 'error' });
    }
  };


  // Filtering
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         photo.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'All' || photo.cat === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-center gap-3 animate-fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-crhs-navy flex items-center gap-3">
              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-crhs-gold" />
              Gallery Management
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-2">
              Organize campus photo albums, add bulk photos and assign categories.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button onClick={handleOpenAddModal} variant="primary" size="md" className="gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload Photos</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search photos by title or description..." 
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {['All', ...dynamicCategories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all rounded-full ${
                    activeCategory === cat 
                      ? 'border-crhs-navy bg-crhs-navy text-white' 
                      : 'border-slate-200 text-slate-600 hover:border-crhs-gold hover:text-crhs-navy'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-crhs-gold mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Gallery...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 mb-1">No photos found</h3>
              <p className="text-xs text-slate-500 font-medium">Try adjusting your filters or add new photos.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {filteredPhotos.map((photo) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    key={photo.id} 
                    className="group relative rounded-xl border-2 border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    <ImageWithLoader 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[9px] font-black uppercase tracking-widest text-crhs-navy shadow-sm">
                      {photo.cat}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 truncate mb-1" title={photo.title}>{photo.title}</h3>
                    <p className="text-[10px] text-slate-500 truncate" title={photo.desc}>{photo.desc || 'No description'}</p>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <Button
                        onClick={() => handleOpenEditModal(photo)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-[11px] text-slate-600 hover:text-crhs-navy hover:bg-slate-100"
                        title="Edit Photo"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePhoto(photo.id, photo.title)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add / Edit Photo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPhoto ? "Edit Gallery Photo" : "Upload New Photos"}
        className={editingPhoto ? "" : "max-w-4xl md:max-w-5xl w-[95vw]"}
      >
        {editingPhoto ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Photo Title *
              </label>
              <Input
                type="text"
                placeholder="e.g. Science Exhibition 2026, Annual Sports Meet"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              {!isCustomCatMode ? (
                <div className="space-y-2">
                  <CustomSelect
                    value={formData.cat}
                    onChange={(val) => {
                      if (val === '__NEW__') {
                        setIsCustomCatMode(true);
                        setFormData(prev => ({ ...prev, customCat: '' } as any));
                      } else {
                        setFormData(prev => ({ ...prev, cat: val }));
                      }
                    }}
                    options={[
                      ...dynamicCategories.map(cat => ({ label: cat, value: cat })),
                      { label: '+ Create New Category...', value: '__NEW__' }
                    ]}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter new category name..."
                      value={(formData as any).customCat || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCat: e.target.value } as any))}
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCustomCatMode(false);
                        setFormData(prev => ({ ...prev, cat: dynamicCategories[0] }));
                      }}
                      className="shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-crhs-navy focus:ring-1 focus:ring-crhs-navy bg-white min-h-[80px]"
                placeholder="Brief details about this event or photo..."
                value={formData.desc}
                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Image URL *
              </label>
              <Input
                type="text"
                placeholder="Direct image URL"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" className="gap-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Bulk Upload UI */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors">
              <Images className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-black text-crhs-navy uppercase tracking-widest mb-1">Select Photos to Upload</h3>
              <p className="text-xs font-medium text-slate-500 mb-4">You can select multiple files at once.</p>
              
              <div className="flex justify-center">
                <label className="cursor-pointer inline-flex items-center justify-center font-black uppercase tracking-widest px-6 py-2.5 text-xs bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy border-2 border-crhs-navy transition-all rounded-xl gap-2">
                  <FolderPlus className="w-4 h-4" />
                  Browse Files
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFilesSelect}
                  />
                </label>
              </div>
            </div>

            {pendingUploads.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{pendingUploads.length} Photos Selected</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Review titles and categories before uploading.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-48">
                      <CustomSelect
                        value={globalCategory}
                        onChange={applyGlobalCategory}
                        options={dynamicCategories.map(cat => ({ label: cat, value: cat }))}
                      />
                    </div>
                    <Button 
                      onClick={handleBulkUpload} 
                      disabled={isUploading} 
                      variant="primary"
                      className="gap-2 shrink-0"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload All
                    </Button>
                  </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {pendingUploads.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-3 border-2 border-slate-200 rounded-xl bg-white items-start">
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Title</label>
                            <Input 
                              value={item.title} 
                              onChange={(e) => updatePendingUpload(item.id, 'title', e.target.value)}
                              className="h-8 text-xs"
                              disabled={isUploading}
                            />
                          </div>
                          <div className="w-full sm:w-1/3">
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                            <select 
                              className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg focus:border-crhs-navy focus:outline-none"
                              value={item.cat}
                              onChange={(e) => updatePendingUpload(item.id, 'cat', e.target.value)}
                              disabled={isUploading}
                            >
                              {dynamicCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description (SEO)</label>
                          <textarea 
                            value={item.desc}
                            onChange={(e) => updatePendingUpload(item.id, 'desc', e.target.value)}
                            className="w-full h-10 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:border-crhs-navy focus:outline-none resize-none"
                            placeholder="Optional description..."
                            disabled={isUploading}
                          />
                        </div>

                        {item.status !== 'pending' && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${item.status === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 w-16 text-right">
                              {item.status === 'error' ? 'Failed' : `${Math.round(item.progress)}%`}
                            </span>
                          </div>
                        )}
                        {item.errorMsg && <p className="text-xs text-rose-600 mt-1">{item.errorMsg}</p>}
                      </div>

                      <div className="sm:self-stretch flex sm:flex-col justify-center sm:justify-start">
                        <Button 
                          onClick={() => removePendingUpload(item.id)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                          disabled={isUploading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
