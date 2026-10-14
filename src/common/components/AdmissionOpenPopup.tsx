import React, { useState, useEffect } from 'react';
import { useAdmission } from '@/context/AdmissionContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, X, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/common/components/ui/Button';
import { schoolConfig } from '@/config/schoolConfig';

export function AdmissionOpenPopup() {
  const { activeCampaign } = useAdmission();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only trigger popup if an active campaign exists
    if (!activeCampaign || !activeCampaign.isActive) {
      setIsOpen(false);
      return;
    }

    // Check if popup was already dismissed in this browser session
    const hasBeenDismissed = sessionStorage.getItem(`crhs_admission_popup_dismissed_${activeCampaign.id}`);
    if (!hasBeenDismissed) {
      // Small delay for smooth entry experience after preloader
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeCampaign]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDismiss = () => {
    if (activeCampaign) {
      sessionStorage.setItem(`crhs_admission_popup_dismissed_${activeCampaign.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleApplyNow = () => {
    handleDismiss();
    navigate('/admissions');
  };

  if (!activeCampaign || !activeCampaign.isActive) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-none max-w-md w-full shadow-2xl border-0 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-crhs-navy p-5 relative flex items-start gap-4">
              <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-none hover:bg-white/10 transition-colors"
                title="Close Notice"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 rounded-none bg-crhs-gold text-crhs-navy flex items-center justify-center shrink-0 shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="pt-0.5 pr-8">
                <div className="text-[10px] text-crhs-gold font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Admission Update
                </div>
                <h3 className="text-white font-black leading-tight text-lg">
                  {activeCampaign.title}
                </h3>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="text-sm text-slate-600 font-medium leading-relaxed">
                Academic Session <strong>{activeCampaign.academicYear}</strong> is now accepting online applications. Secure your seat today!
              </div>
              
              <div className="flex items-center gap-4 text-xs font-semibold bg-slate-50 p-4 rounded-none border border-slate-200">
                 <div className="flex-1">
                   <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Start Date</div>
                   <div className="text-crhs-navy flex items-center gap-1.5 text-sm">
                     <Calendar className="w-4 h-4 text-crhs-gold" /> {activeCampaign.startDate || 'Started'}
                   </div>
                 </div>
                 <div className="w-px h-10 bg-slate-200 shrink-0"></div>
                 <div className="flex-1">
                   <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">End Date</div>
                   <div className="text-rose-600 flex items-center gap-1.5 text-sm">
                     <Calendar className="w-4 h-4 text-rose-500" /> {activeCampaign.endDate || 'Ongoing'}
                   </div>
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleApplyNow}
                  className="flex-[2] bg-crhs-navy hover:bg-slate-800 text-white text-sm font-black uppercase tracking-wider py-3.5 rounded-none shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 text-crhs-gold group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-[1] px-4 py-3.5 text-sm font-bold uppercase tracking-wider rounded-none border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Later
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
