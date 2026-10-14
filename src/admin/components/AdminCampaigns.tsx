import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomDatePicker } from '@/common/components/ui/CustomDatePicker';
import { Settings, Save, Plus, Trash2, Edit2, Play, Square, FileText } from 'lucide-react';
import { useAdmission, AdmissionCampaign } from '@/context/AdmissionContext';
import { cn } from '@/lib/utils';
import { getRadiusClass } from '@/theme.config';

export function AdminCampaigns() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign, toggleCampaignStatus } = useAdmission();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdmissionCampaign>>({
    title: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    description: '',
    isActive: false
  });

  const resetForm = () => {
    setFormData({
      title: '',
      academicYear: '',
      startDate: '',
      endDate: '',
      description: '',
      isActive: false
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (campaign: AdmissionCampaign) => {
    setFormData(campaign);
    setEditingId(campaign.id);
    setIsCreating(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    if (editingId) {
      updateCampaign(editingId, formData);
    } else {
      addCampaign(formData as Omit<AdmissionCampaign, 'id' | 'createdAt'>);
    }
    resetForm();
  };

  if (isCreating) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-white border-b border-slate-100 py-5 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-crhs-navy" />
            {editingId ? 'Edit Admission Campaign' : 'Create New Campaign'}
          </CardTitle>
          <Button variant="ghost" onClick={resetForm}>Cancel</Button>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleChange}
              className="w-5 h-5 accent-crhs-navy cursor-pointer"
            />
            <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer text-lg">
              Set as Active Campaign (Deactivates others)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Campaign Title</label>
              <Input 
                name="title" 
                value={formData.title || ''} 
                onChange={handleChange} 
                className="bg-slate-50"
                placeholder="e.g. Online Admissions 2026-27"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Year</label>
              <Input 
                name="academicYear" 
                value={formData.academicYear || ''} 
                onChange={handleChange} 
                className="bg-slate-50"
                placeholder="e.g. 2026-2027"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
              <CustomDatePicker
                selectedDate={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(date) => {
                  const d = new Date(date);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData(prev => ({ ...prev, startDate: `${year}-${month}-${day}` }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
              <CustomDatePicker
                selectedDate={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date) => {
                  const d = new Date(date);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData(prev => ({ ...prev, endDate: `${year}-${month}-${day}` }));
                }}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description / Instructions</label>
              <textarea 
                name="description" 
                value={formData.description || ''} 
                onChange={handleChange} 
                className={cn("w-full min-h-[100px] p-3 text-sm border-2 border-slate-200 bg-slate-50 focus:border-crhs-navy focus:outline-none transition-colors", getRadiusClass())}
                placeholder="Instructions shown on the admission page..."
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-white border-b border-slate-100 py-5 px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-5 h-5 text-crhs-navy" />
          Admission Campaigns
        </CardTitle>
        <Button onClick={handleCreateNew} size="sm" className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No admission campaigns found. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-crhs-navy">{campaign.title}</h3>
                    {campaign.isActive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-black uppercase tracking-wider rounded-full">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{campaign.academicYear} • {campaign.startDate} to {campaign.endDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={campaign.isActive ? "outline" : "primary"}
                    size="sm"
                    onClick={() => toggleCampaignStatus(campaign.id, !campaign.isActive)}
                    className="flex items-center gap-2"
                  >
                    {campaign.isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {campaign.isActive ? 'Stop' : 'Start'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(campaign)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteCampaign(campaign.id)} className="text-red-600 hover:bg-red-50 hover:border-red-200">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
