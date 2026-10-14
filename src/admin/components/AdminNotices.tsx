import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { CustomDatePicker } from '@/common/components/ui/CustomDatePicker';
import { Input } from '@/common/components/ui/Input';
import { Modal } from '@/common/components/ui/Modal';
import { 
  Bell, Plus, Trash2, Edit, Save, Loader2, X, Upload, 
  Search, Filter, FileText, Download, Check, AlertCircle, HardDrive,
  Pin, Calendar, ExternalLink, AlertTriangle, Info, Bookmark
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getGlobalDriveToken, getOrCreateDriveFolder, checkGlobalDriveStatus, signInWithGoogleDrive, disconnectGoogleDrive } from '@/lib/driveAuth';

const DEFAULT_SUBJECTS = ['Academics', 'Examinations', 'Admissions', 'Events', 'Circulars', 'Sports', 'General'];

interface NoticeItem {
  id: string;
  title: string;
  type: string; // Subject / Category
  date: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  details: string;
  pdfUrl?: string;
  pdfName?: string;
  isPinned?: boolean;
  createdAt?: any;
}

export function AdminNotices() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Circulars',
    customType: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Normal' as 'Normal' | 'Important' | 'Urgent',
    details: '',
    pdfUrl: '',
    pdfName: '',
    isPinned: false
  });
  const [isCustomSubjectMode, setIsCustomSubjectMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Google Drive Upload State
  const [driveConnected, setDriveConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);

  // Notifications
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchNotices();
    checkGlobalDriveStatus().then(status => setDriveConnected(status));
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const items: NoticeItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as NoticeItem);
      });
      setNotices(items);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setMessage({ text: 'Failed to load notices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Derive all dynamic subjects / categories created
  const dynamicSubjects = Array.from(
    new Set([...DEFAULT_SUBJECTS, ...notices.map(n => n.type).filter(Boolean)])
  );

  const handleConnectDrive = async () => {
    try {
      const result = await signInWithGoogleDrive();
      if (result?.accessToken) {
        setDriveConnected(true);
        setMessage({ text: 'Google Drive connected successfully!', type: 'success' });
      }
    } catch (error: any) {
      setMessage({ text: `Drive connection failed: ${error.message || 'Error'}`, type: 'error' });
    }
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDrive();
    setDriveConnected(false);
    setMessage({ text: 'Google Drive disconnected.', type: 'success' });
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setMessage({ text: 'Please select a valid PDF document (.pdf)', type: 'error' });
        return;
      }
      setPendingPdfFile(file);
      setFormData(prev => ({ ...prev, pdfName: file.name }));
    }
  };

  const handleUploadPdfToDrive = async () => {
    if (!pendingPdfFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(20);

      let token = await getGlobalDriveToken();
      if (!token) {
        throw new Error('Global Google Drive is not configured. Please ask Super Admin to link Drive in Technical Settings.');
      }

      setUploadProgress(40);

      // Folder "CRHS_Notices_PDFs"
      const folderId = await getOrCreateDriveFolder(token, `${schoolConfig.schoolAbbreviation}_Notices_PDFs`);

      setUploadProgress(60);

      const metadata = {
        name: `${formData.title.trim().replace(/[^a-zA-Z0-9]/g, '_')}_${pendingPdfFile.name}`,
        mimeType: 'application/pdf',
        parents: [folderId]
      };

      const uploadBody = new FormData();
      uploadBody.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      uploadBody.append('file', pendingPdfFile);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadBody
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Drive PDF upload failed');
      }

      const fileData = await response.json();
      const fileId = fileData.id;

      setUploadProgress(80);

      // Make permission public read
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' })
      }).catch(() => {});

      // Use direct Drive view / download link
      const pdfDriveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      setFormData(prev => ({ ...prev, pdfUrl: pdfDriveUrl, pdfName: pendingPdfFile.name }));
      setUploadProgress(100);
      setPendingPdfFile(null);
      setMessage({ text: 'PDF attachment uploaded successfully to Google Drive!', type: 'success' });
    } catch (error: any) {
      console.error('PDF upload error:', error);
      setMessage({ text: `Upload failed: ${error.message}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      type: dynamicSubjects[0] || 'Circulars',
      customType: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'Normal',
      details: '',
      pdfUrl: '',
      pdfName: '',
      isPinned: false
    });
    setIsCustomSubjectMode(false);
    setPendingPdfFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    const isCustom = !dynamicSubjects.includes(notice.type);
    setFormData({
      title: notice.title,
      type: isCustom ? '__NEW__' : notice.type,
      customType: isCustom ? notice.type : '',
      date: notice.date || new Date().toISOString().split('T')[0],
      priority: notice.priority || 'Normal',
      details: notice.details || '',
      pdfUrl: notice.pdfUrl || '',
      pdfName: notice.pdfName || (notice.pdfUrl ? 'Attached_Notice.pdf' : ''),
      isPinned: !!notice.isPinned
    });
    setIsCustomSubjectMode(isCustom);
    setPendingPdfFile(null);
    setIsModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ text: 'Please enter a notice title', type: 'error' });
      return;
    }

    const finalSubject = isCustomSubjectMode ? formData.customType.trim() : formData.type;
    if (!finalSubject) {
      setMessage({ text: 'Please select or enter a subject/category', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const noticePayload = {
        title: formData.title.trim(),
        type: finalSubject,
        date: formData.date,
        priority: formData.priority,
        details: formData.details.trim(),
        pdfUrl: formData.pdfUrl.trim(),
        pdfName: formData.pdfName.trim(),
        isPinned: formData.isPinned,
        updatedAt: serverTimestamp()
      };

      if (editingNotice) {
        await updateDoc(doc(db, 'notices', editingNotice.id), noticePayload);
        setMessage({ text: 'Notice updated successfully!', type: 'success' });
      } else {
        await addDoc(collection(db, 'notices'), {
          ...noticePayload,
          createdAt: serverTimestamp()
        });
        setMessage({ text: 'New notice published successfully!', type: 'success' });
      }

      setIsModalOpen(false);
      fetchNotices();
    } catch (error: any) {
      console.error('Error saving notice:', error);
      setMessage({ text: `Failed to save notice: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'notices', id));
      setMessage({ text: 'Notice deleted.', type: 'success' });
      fetchNotices();
    } catch (error: any) {
      setMessage({ text: `Delete failed: ${error.message}`, type: 'error' });
    }
  };

  const handleTogglePin = async (notice: NoticeItem) => {
    try {
      await updateDoc(doc(db, 'notices', notice.id), {
        isPinned: !notice.isPinned
      });
      fetchNotices();
    } catch (error: any) {
      console.error('Error toggling pin:', error);
    }
  };

  // Filter notices
  const filteredNotices = notices.filter(n => {
    const matchesSubject = subjectFilter === 'All' || n.type === subjectFilter;
    const matchesPriority = priorityFilter === 'All' || n.priority === priorityFilter;
    const matchesSearch = searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.details && n.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-2 border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-crhs-navy uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-6 h-6 text-crhs-gold" />
            <span>Notice & Circulars Management System</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Publish announcements, attach official PDF circulars via Google Drive, and control notice priorities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Drive status button */}
          <button
            onClick={driveConnected ? handleDisconnectDrive : handleConnectDrive}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all ${
              driveConnected 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                : 'border-crhs-navy text-crhs-navy hover:bg-crhs-navy hover:text-white'
            }`}
            title={driveConnected ? "Google Drive Connected" : "Connect Google Drive for direct PDF uploads"}
          >
            <HardDrive className="w-4 h-4" />
            <span>{driveConnected ? 'Drive Connected' : 'Connect Drive'}</span>
          </button>

          <Button onClick={handleOpenAddModal} variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Notice</span>
          </Button>
        </div>
      </div>

      {/* Alert Notifications */}
      {message && (
        <div className={`p-4 border-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <Card className="border-2 border-slate-200 shadow-none">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search notices by title, subject, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Subject / Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-black uppercase text-slate-400 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Subject:
              </span>
              <button
                onClick={() => setSubjectFilter('All')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 shrink-0 transition-all ${
                  subjectFilter === 'All' 
                    ? 'bg-crhs-navy text-white border-crhs-navy' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-crhs-gold'
                }`}
              >
                All
              </button>
              {dynamicSubjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 shrink-0 transition-all ${
                    subjectFilter === subj 
                      ? 'bg-crhs-navy text-white border-crhs-navy' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-crhs-gold'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notice List */}
      {loading ? (
        <div className="text-center py-16 bg-white border-2 border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-crhs-navy mx-auto mb-2" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Loading notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-slate-200 space-y-3 p-6">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600 uppercase">No notices found</p>
          <p className="text-xs text-slate-400">Publish a new notice or clear filters.</p>
          <Button onClick={handleOpenAddModal} variant="outline" size="sm" className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Create Notice
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white border-2 p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                notice.isPinned ? 'border-crhs-gold bg-amber-50/30' : 'border-slate-200 hover:border-crhs-navy'
              }`}
            >
              {/* Left Column: Subject Badge, Title, Date & Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pin Indicator */}
                  {notice.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-crhs-navy bg-crhs-gold/30 px-2 py-0.5 border border-crhs-gold">
                      <Pin className="w-3 h-3 text-crhs-navy" /> Pinned
                    </span>
                  )}

                  {/* Priority Badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border ${
                    notice.priority === 'Urgent' 
                      ? 'bg-rose-100 border-rose-300 text-rose-700' 
                      : notice.priority === 'Important' 
                      ? 'bg-amber-100 border-amber-300 text-amber-800' 
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}>
                    {notice.priority}
                  </span>

                  {/* Subject Tag */}
                  <span className="text-[10px] font-black uppercase tracking-wider text-crhs-navy bg-slate-100 px-2.5 py-0.5 border border-slate-200">
                    {notice.type}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1 ml-auto md:ml-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {notice.date}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-crhs-navy uppercase leading-snug">
                  {notice.title}
                </h3>

                {notice.details && (
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    {notice.details}
                  </p>
                )}

                {/* PDF Attachment Indicator */}
                {notice.pdfUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={notice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-crhs-navy hover:text-crhs-gold bg-slate-100 px-3 py-1.5 border border-slate-200 hover:border-crhs-gold transition-colors"
                    >
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span className="truncate max-w-[200px]">{notice.pdfName || 'Download Notice PDF'}</span>
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                <Button
                  onClick={() => handleTogglePin(notice)}
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2.5 text-[11px] ${notice.isPinned ? 'text-crhs-navy font-black' : 'text-slate-400'}`}
                  title={notice.isPinned ? "Unpin Notice" : "Pin Notice to Top"}
                >
                  <Pin className="w-3.5 h-3.5" />
                </Button>

                <Button
                  onClick={() => handleOpenEditModal(notice)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[11px]"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>

                <Button
                  onClick={() => handleDeleteNotice(notice.id, notice.title)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? "Edit Notice / Circular" : "Publish New Notice / Circular"}
      >
        <form onSubmit={handleSaveNotice} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Notice Title *
            </label>
            <Input
              type="text"
              placeholder="e.g. Schedule for Final Examinations 2026, Parent-Teacher Meeting"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Subject & Priority in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject / Category */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Subject / Category *
              </label>
              {!isCustomSubjectMode ? (
                <CustomSelect
                  value={formData.type}
                  onChange={(val) => {
                    if (val === '__NEW__') {
                      setIsCustomSubjectMode(true);
                      setFormData(prev => ({ ...prev, customType: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, type: val }));
                    }
                  }}
                  options={[
                    ...dynamicSubjects.map(subj => ({ label: subj, value: subj })),
                    { label: '+ Create New Subject...', value: '__NEW__' }
                  ]}
                />
              ) : (
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Type new subject (e.g. Sports Day)"
                    value={formData.customType}
                    onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                    className="text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSubjectMode(false);
                      setFormData(prev => ({ ...prev, type: dynamicSubjects[0] || 'Circulars' }));
                    }}
                    className="text-[10px] font-bold uppercase text-crhs-navy underline"
                  >
                    Select Existing Subject
                  </button>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Priority Level
              </label>
              <CustomSelect
                value={formData.priority}
                onChange={(val) => setFormData(prev => ({ ...prev, priority: val as any }))}
                options={[
                  { label: "Normal", value: "Normal" },
                  { label: "Important", value: "Important" },
                  { label: "Urgent", value: "Urgent" }
                ]}
              />
            </div>
          </div>

          {/* Date & Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Notice Date
              </label>
              <CustomDatePicker
                selectedDate={formData.date ? new Date(formData.date) : new Date()}
                onChange={(date) => {
                  const d = new Date(date);
                  // format YYYY-MM-DD avoiding timezone offset issues
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
                }}
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="w-4 h-4 text-crhs-navy focus:ring-crhs-navy border-2 border-slate-300 rounded-none"
              />
              <label htmlFor="isPinned" className="text-xs font-black uppercase text-slate-700 cursor-pointer">
                Pin Notice to Top of Board
              </label>
            </div>
          </div>

          {/* Notice Details Content */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
              Notice Details / Description
            </label>
            <textarea
              rows={4}
              placeholder="Write complete circular details, guidelines, or instructions..."
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              className="w-full border-2 border-slate-200 bg-white p-3 text-xs font-medium focus:border-crhs-navy focus:outline-none"
            />
          </div>

          {/* PDF Document Upload / Google Drive Integration */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Attach PDF Document (Google Drive Upload or PDF Link)
            </label>

            {/* Direct File Selector & Upload to Drive */}
            <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfFileSelect}
                  className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:border-2 file:border-crhs-navy file:bg-crhs-navy file:text-white file:font-black file:uppercase file:text-[10px] hover:file:bg-crhs-gold hover:file:text-crhs-navy cursor-pointer flex-1"
                />

                {pendingPdfFile && (
                  <Button
                    type="button"
                    onClick={handleUploadPdfToDrive}
                    disabled={isUploading}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload PDF to Drive</span>
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 h-2 rounded-none overflow-hidden">
                    <div 
                      className="bg-crhs-gold h-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase text-center">Uploading PDF to Google Drive... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* PDF Link Input */}
            <div>
              <Input
                type="text"
                placeholder="Or paste direct PDF URL / Google Drive view link"
                value={formData.pdfUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                className="text-xs"
              />
            </div>

            {formData.pdfUrl && (
              <div className="p-2 bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">{formData.pdfName || 'Attached PDF Document'}</span>
                </span>
                <a
                  href={formData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crhs-navy hover:underline font-black uppercase text-[10px] shrink-0"
                >
                  Test PDF Link
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving || isUploading}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingNotice ? 'Save Changes' : 'Publish Notice'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
