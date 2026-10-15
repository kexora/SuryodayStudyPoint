import React, { useState, useEffect } from 'react';
import { SEO } from '@/common/components/ui/SEO';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Modal } from '@/common/components/ui/Modal';
import { 
  Bell, Search, Filter, Calendar, FileText, Download, Pin, 
  ChevronRight, ArrowLeft, Tag, AlertTriangle, Sparkles, GraduationCap, ArrowRight, Lock
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmission } from '@/context/AdmissionContext';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

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

export function NoticesPage() {
  const { activeCampaign } = useAdmission();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedNotices: Notice[] = [];
        snapshot.forEach((doc) => {
          fetchedNotices.push({ id: doc.id, ...doc.data() } as Notice);
        });
        
        // Sort pinned first
        fetchedNotices.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        setNotices(fetchedNotices);
      } catch (error) {
        // Fallback to default notices on permission error or offline
        setNotices([
          {
            id: 'default-notice-1',
            title: 'Admission Open for Session 2026-27 (Std. I to XII)',
            date: new Date().toISOString().split('T')[0],
            type: 'Admissions',
            priority: 'Important',
            isPinned: true,
            details: 'Applications for admission to Academic Session 2026-27 are now open for both Offline Physical Classes at Bhawani Chhapar, Deoria campus and Online Live Batches. Visit the admission portal to apply online.'
          },
          {
            id: 'default-notice-2',
            title: 'Suryoday Competition Classes - New Batch Timetable',
            date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            type: 'Examinations',
            priority: 'Normal',
            isPinned: true,
            details: 'New batches for SSC, UP Police, Railway, and Army competitive exams commence from next Monday. Special morning and evening shifts available.'
          },
          {
            id: 'default-notice-3',
            title: 'Computer Training Center - CCC & ADCA Registration',
            date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
            type: 'General',
            priority: 'Normal',
            isPinned: false,
            details: 'Enrollments for NIELIT CCC, ADCA, DCA, and Tally Prime professional computer courses are open with 100% practical lab training.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  // Compute dynamic subject list from notices
  const dynamicSubjects = ['All', ...Array.from(new Set(
    ['Academics', 'Examinations', 'Admissions', 'Events', 'Circulars', 'Sports', 'General',
     ...notices.map(n => n.type).filter(Boolean)]
  ))];

  const filteredNotices = notices.filter(n => {
    const matchesSubject = selectedSubject === 'All' || n.type === selectedSubject;
    const matchesSearch = searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.details && n.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <>
      <SEO 
        title="Notice Board & Circulars" 
        description={`Stay updated with the latest notices, circulars, exam schedules, academic announcements, and events at ${schoolConfig.schoolName}.`}
        keywords={`school notices, ${schoolConfig.schoolShortName} circulars, exam schedule, academic announcements, school board`}
      />

      {/* Hero Section */}
      <div className="bg-crhs-navy text-white py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal direction="up">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-crhs-gold/20 rounded-full flex items-center justify-center">
                <Bell className="w-7 h-7 text-crhs-gold" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-4">
              {t('notices.title', 'Notice Board & Circulars')}
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium">
              {t('notices.desc')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Subject Tabs */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder={t('notices.search', 'Search notices by keyword, title, or circular details...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs py-3"
              />
            </div>
          </div>

          {/* Dynamic Subject Tabs */}
          <div className="flex flex-wrap gap-2 justify-start sm:justify-center overflow-x-auto pb-2">
            {dynamicSubjects.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                  selectedSubject === subj 
                    ? 'bg-crhs-navy text-white border-crhs-navy shadow-md scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-crhs-gold hover:text-crhs-navy'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Admission Status Section */}
        {activeCampaign && activeCampaign.isActive ? (
          <div className="mb-8 p-6 bg-gradient-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl border-2 border-crhs-gold shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-crhs-gold text-crhs-navy px-3 py-1 rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3.5 h-3.5" /> 🔥 ADMISSION OPEN
                </span>
                <span className="text-xs font-bold text-crhs-gold uppercase tracking-wider">
                  Academic Session {activeCampaign.academicYear}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-crhs-gold shrink-0" />
                {activeCampaign.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {activeCampaign.description || `${schoolConfig.schoolName}, ${schoolConfig.location.address} is currently accepting online application forms for the academic session.`}
              </p>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2 pt-1">
                <Calendar className="w-4 h-4 text-crhs-gold" />
                <span>Application Window: {activeCampaign.startDate || 'Started'} to {activeCampaign.endDate || 'Ongoing'}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/admissions')}
              className="bg-crhs-gold hover:bg-white text-crhs-navy font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
            >
              <span>Apply Online Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-5 bg-slate-100 border-2 border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 px-2.5 py-0.5 border border-slate-300 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" /> [CLOSED]
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Status</span>
              </div>
              <h3 className="text-base font-black uppercase text-crhs-navy">
                Admissions Currently Closed
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Online admission applications are currently closed. Check back for upcoming session announcements.
              </p>
            </div>
            <Link to="/contact">
              <Button variant="outline" size="sm" className="text-xs uppercase font-bold border-slate-300">
                Contact Office
              </Button>
            </Link>
          </div>
        )}

        {/* Notice List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading notices & circulars...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border-2 border-slate-200 space-y-3 p-8">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold uppercase text-crhs-navy">No notices match your criteria</h3>
            <p className="text-xs text-slate-500">Try selecting a different subject or clearing your search phrase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`bg-white border-2 p-6 cursor-pointer hover:border-crhs-navy transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group ${
                  notice.isPinned ? 'border-crhs-gold bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-crhs-navy bg-slate-100 px-2.5 py-1 border border-slate-200 group-hover:bg-crhs-navy group-hover:text-white transition-colors">
                        {notice.type}
                      </span>
                      {notice.priority && notice.priority !== 'Normal' && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 ${
                          notice.priority === 'Urgent' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {notice.priority}
                        </span>
                      )}
                      {notice.isPinned && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-crhs-navy bg-crhs-gold px-2.5 py-1 inline-flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {notice.date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-crhs-navy uppercase leading-snug group-hover:text-crhs-gold transition-colors">
                    {notice.title}
                  </h3>

                  {notice.details && (
                    <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                      {notice.details}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-crhs-navy group-hover:text-crhs-gold flex items-center gap-1">
                    Read Notice <ChevronRight className="w-4 h-4" />
                  </span>

                  {notice.pdfUrl && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 border border-rose-200">
                      <FileText className="w-3.5 h-3.5" /> PDF Attached
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title="Notice & Circular"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
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
              <span className="text-xs font-bold text-slate-500 ml-auto flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Published: {selectedNotice.date}
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
                      {selectedNotice.pdfName || 'Official Attached PDF'}
                    </p>
                  </div>
                </div>

                <a
                  href={selectedNotice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy text-xs font-black uppercase tracking-wider transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" /> View / Download PDF
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={() => setSelectedNotice(null)} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
