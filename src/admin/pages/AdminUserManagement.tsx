import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Search,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const roleLabels: Record<UserRole, string> = {
  '__kx_0x1': 'Super Admin',
  '__kx_0x2': 'Admin',
  '__kx_0x3': 'Teacher/Staff',
  '__kx_0x4': 'Student',
  '__kx_0x5': 'Parent'
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  '__kx_0x1': <ShieldAlert className="w-4 h-4 text-rose-500" />,
  '__kx_0x2': <ShieldCheck className="w-4 h-4 text-indigo-500" />,
  '__kx_0x3': <Briefcase className="w-4 h-4 text-amber-500" />,
  '__kx_0x4': <GraduationCap className="w-4 h-4 text-emerald-500" />,
  '__kx_0x5': <Users className="w-4 h-4 text-purple-500" />
};

export function AdminUserManagement() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserRole | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit state
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserData[] = [];
      snap.forEach(doc => {
        list.push({ uid: doc.id, ...doc.data() } as UserData);
      });
      // Sort by creation date or name
      list.sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''));
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setEditForm(user);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
    setMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser?.uid) return;
    setSaving(true);
    setMessage(null);
    try {
      const userRef = doc(db, 'users', editingUser.uid);
      
      // Clean up undefined fields
      const updateData = { ...editForm };
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UserData] === undefined) {
          delete updateData[key as keyof UserData];
        }
      });

      await setDoc(userRef, updateData, { merge: true });
      
      // Update local storage users cache if present
      try {
        const localUsers = JSON.parse(localStorage.getItem('ssp_local_users') || '[]');
        const idx = localUsers.findIndex((u: any) => u.uid === editingUser.uid);
        if (idx >= 0) {
          localUsers[idx] = { ...localUsers[idx], ...updateData };
          localStorage.setItem('ssp_local_users', JSON.stringify(localUsers));
        }
      } catch (cacheErr) {
        console.warn("Local storage cache update error:", cacheErr);
      }

      setMessage({ type: 'success', text: 'User details updated successfully!' });
      
      // Update local state
      setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, ...updateData } as UserData : u));
      
      setTimeout(() => {
        handleCancelEdit();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating user:", err);
      setMessage({ type: 'error', text: err.message || 'Failed to update user' });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'All' || user.role === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.fullName || user.name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.mobileNumber || '').includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  if (userData?.role !== '__kx_0x1') {
    return (
      <div className="p-8 text-center text-rose-600 font-bold">
        Access Denied: Super Admin privileges required.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-crhs-navy rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border-4 border-crhs-navy">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-crhs-gold/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-crhs-gold text-crhs-navy text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm mb-3">
            <Users className="w-3.5 h-3.5" /> User Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-2">
            System Users Directory
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            Manage all registered accounts across the platform. Update user roles, modify contact details, and oversee administrative access.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg border-2 border-slate-200">
        <CardHeader className="bg-slate-50 border-b-2 border-slate-100 py-4 px-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          <div className="flex flex-wrap gap-2">
            {(['All', '__kx_0x1', '__kx_0x2', '__kx_0x3', '__kx_0x4', '__kx_0x5'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? 'bg-crhs-navy text-white shadow-md' 
                    : 'bg-white text-slate-500 hover:bg-slate-200 border-2 border-slate-200'
                }`}
              >
                {tab === 'All' ? 'All Users' : roleLabels[tab as UserRole]}
                <span className="ml-2 opacity-70">
                  ({tab === 'All' ? users.length : users.filter(u => u.role === tab).length})
                </span>
              </button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs font-medium"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b-2 border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-black tracking-wider">User</th>
                  <th className="px-6 py-4 font-black tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-black tracking-wider">Role</th>
                  <th className="px-6 py-4 font-black tracking-wider">Class/Details</th>
                  <th className="px-6 py-4 font-black tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading Users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                      transition={{ duration: 0.3 }}
                      key={user.uid} 
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-crhs-navy text-crhs-gold flex items-center justify-center font-black uppercase text-xs shrink-0">
                            {(user.fullName || user.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.fullName || user.name || 'Unnamed User'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{user.uid?.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-900 font-medium">{user.email || 'No email'}</div>
                        <div className="text-[10px] text-slate-500">{user.mobileNumber || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 bg-slate-100 w-max px-2.5 py-1 rounded-sm border border-slate-200">
                          {roleIcons[user.role]}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                            {roleLabels[user.role] || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {user.crhsId && <div><span className="font-bold text-slate-400">ID:</span> {user.crhsId}</div>}
                        {user.classApplied && <div><span className="font-bold text-slate-400">Class:</span> {user.classApplied}</div>}
                        {!user.crhsId && !user.classApplied && '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditClick(user)}
                          className="h-8 text-[10px] uppercase font-bold tracking-wider"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-50 border-b-2 border-slate-100 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-crhs-navy">
                Edit User Profile
              </CardTitle>
              <button onClick={handleCancelEdit} className="text-slate-400 hover:text-rose-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {message && (
                <div className={`p-3 text-xs font-bold flex items-center gap-2 rounded-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
                  <Input 
                    value={editForm.fullName || editForm.name || ''} 
                    onChange={e => setEditForm({...editForm, fullName: e.target.value, name: e.target.value})}
                    className="h-9 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">System Role</label>
                  <CustomSelect 
                    value={editForm.role || ''}
                    onChange={val => setEditForm({...editForm, role: val as UserRole})}
                    options={[
                      { label: "Student", value: "__kx_0x4" },
                      { label: "Parent", value: "__kx_0x5" },
                      { label: "Teacher / Staff", value: "__kx_0x3" },
                      { label: "Administrator", value: "__kx_0x2" },
                      { label: "Super Admin", value: "__kx_0x1" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Mobile Number</label>
                  <Input 
                    value={editForm.mobileNumber || ''} 
                    onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})}
                    className="h-9 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">CRHS ID (Optional)</label>
                  <Input 
                    value={editForm.crhsId || ''} 
                    onChange={e => setEditForm({...editForm, crhsId: e.target.value})}
                    className="h-9 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Class</label>
                  <Input 
                    value={editForm.classApplied || ''} 
                    onChange={e => setEditForm({...editForm, classApplied: e.target.value})}
                    className="h-9 font-medium"
                    placeholder="e.g. Class 1"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-slate-100 mt-4">
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="bg-crhs-navy text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
