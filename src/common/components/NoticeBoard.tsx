import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Download, Calendar, Tag, AlertCircle, X, Bell, Sparkles, GraduationCap, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/common/components/ui/Button';
import { Modal } from '@/common/components/ui/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmission } from '@/context/AdmissionContext';

interface Notice {
  id: string;
  title: string;
  date: string;
  type: string;
  priority?: 'Normal' | 'Important' | 'Urgent';
  details?: string;
  pdfUrl?: string;
  pdfName?: string;
  isPinned?: boolean;
}

export function NoticeBoard() {
  const { activeCampaign } = useAdmission();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(collection(db, 'notices'), orderBy('date', 'desc'), limit(6));
        const snapshot = await getDocs(q);
        const fetchedNotices: Notice[] = [];
        snapshot.forEach((doc) => {
          fetchedNotices.push({ id: doc.id, ...doc.data() } as Notice);
        });
        
        // Sort pinned notices first
        fetchedNotices.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        setNotices(fetchedNotices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white p-6 sm:p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-crhs-navy font-black text-lg uppercase tracking-widest border-l-4 border-crhs-gold pl-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-crhs-gold" /> Notice Board
        </h3>
        <Link to="/notices" className="text-xs font-bold text-crhs-gold uppercase tracking-wider hover:text-crhs-navy transition-colors hidden sm:flex items-center">
          View All Notices <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-4 mb-8 flex-grow">
        {/* Dynamic Dedicated Admission Status Section */}
        {activeCampaign && activeCampaign.isActive ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 sm:p-5 border-l-4 border-crhs-gold bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-r-xl shadow-md space-y-3 relative overflow-hidden group"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-crhs-gold text-crhs-navy px-2.5 py-0.5 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-crhs-navy" /> ADMISSION OPEN
                </span>
                <span className="text-[10px] font-bold text-crhs-gold uppercase tracking-wider">
                  Session {activeCampaign.academicYear}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-crhs-gold" /> {activeCampaign.startDate || 'Started'} to {activeCampaign.endDate || 'Ongoing'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-crhs-gold shrink-0" />
                {activeCampaign.title}
              </h4>
              <p className="text-xs text-slate-300 font-medium mt-1 line-clamp-2 leading-relaxed">
                {activeCampaign.description || "Online admission applications are currently open for Std. I to XII. Submit your application online now."}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-crhs-gold uppercase tracking-wider">
                {schoolConfig.location.campusName}
              </span>
              <Button 
                onClick={() => navigate('/admissions')}
                size="sm"
                className="bg-crhs-gold hover:bg-white text-crhs-navy font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 py-1.5 px-3 h-auto"
              >
                <span>Apply Online Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="p-3.5 border-l-4 border-slate-300 bg-slate-100/90 text-slate-700 rounded-r-lg space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 px-2 py-0.5 border border-slate-300 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> [CLOSED]
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Admission Notice</span>
            </div>
            <p className="text-xs font-bold uppercase text-slate-800">
              Admissions Currently Closed
            </p>
            <p className="text-[11px] text-slate-500">
              Online admission applications are currently closed. Updates regarding the next session will be posted here.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-8 font-bold text-xs uppercase tracking-wider">
            Loading recent notices...
          </div>
        ) : notices.length > 0 ? (
          notices.map((notice, index) => (
            <motion.div 
              key={notice.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setSelectedNotice(notice)}
              className={`p-4 border-l-4 cursor-pointer group transition-all duration-200 shadow-sm hover:shadow ${
                notice.priority === 'Urgent'
                  ? 'border-rose-500 bg-rose-50/50 hover:bg-rose-50'
                  : notice.priority === 'Important'
                  ? 'border-crhs-gold bg-amber-50/50 hover:bg-amber-50'
                  : 'border-crhs-navy bg-slate-50 hover:bg-crhs-navy'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-crhs-gold bg-crhs-navy px-2 py-0.5 group-hover:bg-crhs-gold group-hover:text-crhs-navy transition-colors">
                    {notice.type || 'Notice'}
                  </span>
                  {notice.priority && notice.priority !== 'Normal' && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${
                      notice.priority === 'Urgent' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {notice.priority}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {notice.date}
                </span>
              </div>

              <p className="text-sm font-bold leading-snug uppercase text-crhs-navy group-hover:text-white transition-colors line-clamp-2">
                {notice.title}
              </p>

              {notice.pdfUrl && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-rose-600 group-hover:text-crhs-gold transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase tracking-wider">PDF Circular Attached</span>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-8 text-xs font-bold uppercase">No recent notices available.</div>
        )}
      </div>
      
      <div className="mt-auto sm:hidden">
        <Link to="/notices">
          <Button variant="outline" className="w-full text-xs tracking-widest py-3">
            View All Notices <ChevronRight className="h-4 w-4 ml-1 inline" />
          </Button>
        </Link>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title="Notice Details"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase text-crhs-navy bg-slate-100 px-3 py-1 border border-slate-200">
                {selectedNotice.type}
              </span>
              {selectedNotice.priority && (
                <span className={`text-xs font-black uppercase px-3 py-1 ${
                  selectedNotice.priority === 'Urgent' ? 'bg-rose-600 text-white' : selectedNotice.priority === 'Important' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {selectedNotice.priority} Priority
                </span>
              )}
              <span className="text-xs font-bold text-slate-400 ml-auto flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Published: {selectedNotice.date}
              </span>
            </div>

            <h3 className="text-xl font-black text-crhs-navy uppercase leading-snug">
              {selectedNotice.title}
            </h3>

            {selectedNotice.details && (
              <div className="p-4 bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedNotice.details}
              </div>
            )}

            {selectedNotice.pdfUrl && (
              <div className="p-4 bg-crhs-navy/5 border-2 border-crhs-navy/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-xs uppercase text-crhs-navy">Official PDF Circular Document</h4>
                    <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[220px]">
                      {selectedNotice.pdfName || 'Download or view official document'}
                    </p>
                  </div>
                </div>

                <a
                  href={selectedNotice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy text-xs font-black uppercase tracking-wider transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" /> Download / View PDF
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedNotice(null)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
