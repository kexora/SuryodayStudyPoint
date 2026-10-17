import React, { useState, useEffect } from 'react';
import { SEO } from '@/common/components/ui/SEO';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { Modal } from '@/common/components/ui/Modal';
import { 
  Bell, 
  Search, 
  Calendar, 
  FileText, 
  Download, 
  Pin, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Phone,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Real-time synchronization directly with Firestore 'notices' collection
  useEffect(() => {
    const noticesRef = collection(db, 'notices');
    const unsubscribe = onSnapshot(
      noticesRef,
      (snapshot) => {
        const fetchedNotices: Notice[] = [];
        snapshot.forEach((docSnap) => {
          fetchedNotices.push({ id: docSnap.id, ...docSnap.data() } as Notice);
        });

        // Sort pinned first, then by date descending
        fetchedNotices.sort((a, b) => {
          if (Boolean(b.isPinned) !== Boolean(a.isPinned)) {
            return b.isPinned ? 1 : -1;
          }
          return (b.date || '').localeCompare(a.date || '');
        });

        setNotices(fetchedNotices);
        setLoading(false);
      },
      (error) => {
        console.warn('NoticesPage listener notice:', error?.message || error);
        setNotices([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute dynamic subject list from actual notices
  const dynamicSubjects = ['All', ...Array.from(new Set(
    ['Academics', 'Examinations', 'Admissions', 'Events', 'Circulars', 'General',
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
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title="Notice Board & Circulars | Suryoday Study Point" 
        description={`Stay updated with the latest notices, circulars, exam schedules, academic announcements, and events at ${schoolConfig.schoolName}.`}
        keywords={`school notices, ${schoolConfig.schoolShortName} circulars, exam schedule, academic announcements, school board`}
      />

      {/* Hero Section - Sleek, Theme-Consistent & Mobile-Optimized */}
      <div className="bg-crhs-navy text-white py-10 sm:py-16 md:py-20 relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Top Badge with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.05} blur={10}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3 sm:mb-4">
              <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{language === 'hi' ? 'आधिकारिक सूचनाएं' : 'Official Circulars & Updates'}</span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white">
              {t('notices.title', 'Notice Board & Circulars')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('notices.desc', 'Official announcements, examination schedules, batch timetables, and academic circulars.')}
            </p>
          </ScrollReveal>

          {/* Quick Category Chips for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <span className="bg-white/10 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? 'परीक्षा समय-सारणी' : 'Exam Schedules'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'बैच एवं कक्षा सूचनाएं' : 'Batch Notices'}
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                {language === 'hi' ? 'आधिकारिक परिपत्र' : 'Circulars'}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Search & Subject Tabs Container */}
        <ScrollReveal direction="up" delay={0.08} blur={8}>
          <div className="space-y-4 mb-6 sm:mb-8 max-w-3xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('notices.search', 'Search notices by keyword, title, or circular details...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-full pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-crhs-navy focus:border-transparent shadow-xs font-medium placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dynamic Subject Filter Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center pt-1">
              {dynamicSubjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
                    selectedSubject === subj 
                      ? 'bg-crhs-navy text-white border border-crhs-navy shadow-xs ring-1 sm:ring-2 ring-crhs-navy/15' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-crhs-navy shadow-2xs'
                  }`}
                >
                  {subj === 'All' ? (language === 'hi' ? 'सभी सूचनाएं' : 'All') : subj}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Dedicated Admission Status Section - If active in Firestore */}
        {activeCampaign && activeCampaign.isActive && (
          <ScrollReveal direction="up" delay={0.1} blur={8}>
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-linear-to-r from-crhs-navy via-slate-900 to-crhs-navy text-white rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-crhs-navy px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3" /> ADMISSION OPEN
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    Session {activeCampaign.academicYear}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{activeCampaign.title}</span>
                </h2>
                <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                  {activeCampaign.description || `${schoolConfig.schoolName} is currently accepting online application forms for the session.`}
                </p>
              </div>

              <Button
                onClick={() => navigate('/admissions')}
                className="bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-full shadow-xs flex items-center justify-center gap-1.5 shrink-0 w-full md:w-auto"
              >
                <span>{language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </ScrollReveal>
        )}

        {/* Notice List Container */}
        {loading ? (
          <ScrollReveal direction="up" blur={8}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 py-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-10 w-full bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        ) : filteredNotices.length === 0 ? (
          <ScrollReveal direction="up" blur={8}>
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-2.5 max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-crhs-navy">
                {notices.length === 0 
                  ? (language === 'hi' ? 'अभी कोई सूचना जारी नहीं है' : 'No notices published yet') 
                  : (language === 'hi' ? 'चयनित श्रेणी में कोई सूचना नहीं मिली' : 'No notices match your filter')}
              </h3>
              <p className="text-xs text-slate-500">
                {notices.length === 0 
                  ? (language === 'hi' ? 'नई आधिकारिक सूचनाएं जारी होते ही यहां लाइव दिखाई देंगी।' : 'Official announcements will appear here in real time as published.') 
                  : (language === 'hi' ? 'कृपया अन्य श्रेणी चुनें या सर्च बॉक्स को खाली करें।' : 'Try selecting a different subject or clearing your search phrase.')}
              </p>
              {selectedSubject !== 'All' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedSubject('All')} 
                  className="rounded-full text-xs font-bold mt-2"
                >
                  {language === 'hi' ? 'सभी सूचनाएं देखें' : 'View All Notices'}
                </Button>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {filteredNotices.map((notice, idx) => (
              <ScrollReveal direction="up" delay={idx * 0.06} blur={8} key={notice.id || idx}>
                <div
                  onClick={() => setSelectedNotice(notice)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 cursor-pointer border transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group ${
                    notice.isPinned 
                      ? 'border-amber-300/90 bg-amber-50/20 hover:border-amber-400' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Chips & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-crhs-navy bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 group-hover:bg-crhs-navy group-hover:text-white transition-colors">
                          {notice.type}
                        </span>
                        {notice.priority && notice.priority !== 'Normal' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            notice.priority === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-crhs-navy'
                          }`}>
                            {notice.priority}
                          </span>
                        )}
                        {notice.isPinned && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Pin className="w-3 h-3 text-amber-800" />
                            <span>{language === 'hi' ? 'पिन' : 'Pinned'}</span>
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {notice.date}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <h3 className="text-sm sm:text-base font-black text-crhs-navy leading-snug group-hover:text-amber-600 transition-colors">
                      {notice.title}
                    </h3>

                    {/* Notice Details Preview */}
                    {notice.details && (
                      <p className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed">
                        {notice.details}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Row: Action button / PDF */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600 group-hover:text-amber-700 flex items-center gap-1 text-[11px] sm:text-xs">
                      <span>{language === 'hi' ? 'पूरा विवरण पढ़ें' : 'Read Notice'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>

                    {notice.pdfUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>PDF</span>
                      </span>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

      </div>

      {/* Notice Detail Modal - Mobile Optimized with Blur Backdrop */}
      {selectedNotice && (
        <Modal
          isOpen={Boolean(selectedNotice)}
          onClose={() => setSelectedNotice(null)}
          title={selectedNotice.title}
        >
          <div className="space-y-4 text-slate-800">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-crhs-navy font-bold text-[11px] border border-slate-200">
                  {selectedNotice.type}
                </span>
                {selectedNotice.priority && selectedNotice.priority !== 'Normal' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedNotice.priority === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-crhs-navy'
                  }`}>
                    {selectedNotice.priority}
                  </span>
                )}
              </div>
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {selectedNotice.date}
              </span>
            </div>

            {/* Notice Details Content */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line py-2">
              {selectedNotice.details || (language === 'hi' ? 'विस्तृत परिपत्र कार्यालय में उपलब्ध है।' : 'Details available at center administration desk.')}
            </div>

            {/* Attached PDF / Document Download if present */}
            {selectedNotice.pdfUrl && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 truncate">
                    {selectedNotice.pdfName || 'Official Circular Document.pdf'}
                  </span>
                </div>
                <a
                  href={selectedNotice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-crhs-navy text-white text-xs font-bold rounded-lg hover:bg-slate-900 shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                </a>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {schoolConfig.schoolName}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedNotice(null)}
                className="rounded-full text-xs font-bold"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
