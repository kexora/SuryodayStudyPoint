import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/common/components/ui/Card';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Users, CheckCircle, Clock, Search, Eye, Check, X, FileText, Filter, UserCheck, UserX, Loader2, Edit2, Save } from 'lucide-react';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Application {
  id: string; // Firestore document ID
  enrollmentNo: string;
  firstName: string;
  lastName: string;
  prevClass: string;
  fatherPhone: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  bloodGroup?: string;
  aadhaarNumber?: string;
  fatherName?: string;
  city?: string;
  [key: string]: any;
}

export function AdminApplications() {
  const { userData } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Application>>({});
  const [saving, setSaving] = useState(false);

  // Allow admin and super admin to edit
  const canEdit = userData?.role === '__kx_0x1' || userData?.role === '__kx_0x2';

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'applications'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const appsData: Application[] = [];
      querySnapshot.forEach((doc) => {
        appsData.push({ id: doc.id, ...doc.data() } as Application);
      });
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching applications: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  
  const handleStatusChange = async (id: string, newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      const appRef = doc(db, 'applications', id);
      const updates: any = { status: newStatus };
      
      let generatedCrhsId = '';
      if (newStatus === 'Approved') {
        generatedCrhsId = `221026${Math.floor(100000 + Math.random() * 900000)}`;
        updates.crhsId = generatedCrhsId;
      }
      
      await updateDoc(appRef, updates);
      
      const updatedApps = applications.map(app => 
         app.id === id ? { ...app, ...updates } : app
      );
      setApplications(updatedApps);
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, ...updates });
      }
      
      if (newStatus === 'Approved') {
         alert(`Application Approved! Generated CRHS ID for student: ${generatedCrhsId}`);
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdits = async () => {
    if (!selectedApp) return;
    setSaving(true);
    try {
      const appRef = doc(db, 'applications', selectedApp.id);
      await updateDoc(appRef, editForm);
      
      const updatedApp = { ...selectedApp, ...editForm };
      
      setApplications(applications.map(app => app.id === selectedApp.id ? updatedApp : app));
      setSelectedApp(updatedApp);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving edits: ", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><X className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-crhs-navy" />
        <p className="font-medium tracking-wide">Loading Applications...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Applications</h1>
          <p className="text-slate-500 font-medium text-sm">Manage student admission requests and enrollment processing.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar shrink-0 w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "flex-1 sm:flex-initial px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap",
                statusFilter === filter 
                  ? "bg-white text-crhs-navy shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Received', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Approved', value: stats.approved, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Rejected', value: stats.rejected, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        ].map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 0.1}>
            <div className={cn("p-6 rounded-2xl border transition-all duration-300 hover:shadow-md", stat.bg, stat.border)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                  <h3 className={cn("text-3xl font-black", stat.color)}>{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl bg-white shadow-sm", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal direction="up" delay={0.2}>
        <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-white">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or enrollment no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-slate-200 focus-visible:ring-crhs-navy rounded-xl h-11"
              />
            </div>
            <div className="text-sm font-semibold text-slate-500">
              Showing <span className="text-crhs-navy">{filteredApps.length}</span> application(s)
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-6 font-bold">Applicant Details</th>
                  <th className="py-4 px-6 font-bold">Class</th>
                  <th className="py-4 px-6 font-bold">Submitted</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Filter className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-bold text-slate-600">No applications found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: index * 0.05 }}
                      key={app.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-crhs-navy font-bold text-sm shrink-0">
                            {app.firstName?.charAt(0)}{app.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{app.firstName} {app.lastName}</div>
                            <div className="text-xs text-slate-500 font-medium">ID: {app.enrollmentNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          Class {app.classApplied || app.prevClass || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-slate-700">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setEditForm(app);
                            setIsEditing(false);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm hover:bg-slate-100 text-crhs-navy"
                        >
                          <Eye className="w-4 h-4 mr-2" /> Review
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>

      {/* Modern Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-crhs-navy font-bold text-lg">
                    {selectedApp.firstName?.charAt(0)}{selectedApp.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedApp.firstName} {selectedApp.lastName}</h3>
                    <p className="text-sm text-slate-500 font-medium">App ID: <span className="text-slate-700">{selectedApp.enrollmentNo}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedApp.status} />
                  <div className="w-px h-8 bg-slate-200"></div>
                  
                  {canEdit && (
                    <Button 
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={isEditing ? saveEdits : () => setIsEditing(true)}
                      className={cn("gap-2", isEditing ? "bg-crhs-navy text-white hover:bg-crhs-navy/90" : "")}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      {isEditing ? 'Save Changes' : 'Edit Application'}
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full" onClick={() => setSelectedApp(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-8">
                {selectedApp.status === 'Pending' && !isEditing && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Application Review Pending</h4>
                      <p className="text-sm text-slate-500">Review the details below and make a decision on this application.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => handleStatusChange(selectedApp.id, 'Rejected')}
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => handleStatusChange(selectedApp.id, 'Approved')}
                      >
                        <Check className="w-4 h-4 mr-2" /> Approve Application
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-crhs-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Student Information
                      </h4>
                      <div className="bg-white border border-slate-100 rounded-xl shadow-sm divide-y divide-slate-100">
                        {selectedApp.crhsId && (
                           <div className="p-4 flex flex-col bg-emerald-50 border-b border-emerald-100">
                             <span className="text-emerald-700 text-sm mb-1 font-bold">Generated CRHS ID</span>
                             <span className="font-black text-emerald-900 text-lg">{selectedApp.crhsId}</span>
                           </div>
                        )}
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">First Name</span>
                          {isEditing ? (
                            <Input name="firstName" value={editForm.firstName || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.firstName}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Last Name</span>
                          {isEditing ? (
                            <Input name="lastName" value={editForm.lastName || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.lastName}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Class Applied For</span>
                          {isEditing ? (
                            <Input name="classApplied" value={editForm.classApplied || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.classApplied || selectedApp.prevClass || 'N/A'}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Blood Group</span>
                          {isEditing ? (
                            <Input name="bloodGroup" value={editForm.bloodGroup || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.bloodGroup || 'N/A'}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Aadhaar No.</span>
                          {isEditing ? (
                            <Input name="aadhaarNumber" value={editForm.aadhaarNumber || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.aadhaarNumber || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-crhs-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Guardian Information
                      </h4>
                      <div className="bg-white border border-slate-100 rounded-xl shadow-sm divide-y divide-slate-100">
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Father's Name</span>
                          {isEditing ? (
                            <Input name="fatherName" value={editForm.fatherName || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.fatherName || 'N/A'}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Contact Number</span>
                          {isEditing ? (
                            <Input name="fatherPhone" value={editForm.fatherPhone || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.fatherPhone || 'N/A'}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">City</span>
                          {isEditing ? (
                            <Input name="city" value={editForm.city || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.city || 'N/A'}</span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-slate-500 text-sm mb-1">Street Address</span>
                          {isEditing ? (
                            <Input name="streetAddress" value={editForm.streetAddress || ''} onChange={handleEditChange} className="h-8" />
                          ) : (
                            <span className="font-bold text-slate-900">{selectedApp.streetAddress || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Developer / Raw Data
                  </h4>
                  <pre className="text-xs text-slate-500 overflow-x-auto p-4 bg-slate-900 text-slate-300 rounded-lg shadow-inner">
                    {JSON.stringify(selectedApp, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
