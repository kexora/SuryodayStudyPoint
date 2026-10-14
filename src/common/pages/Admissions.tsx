import React, { useState, useEffect } from 'react';
import { SectionHeading } from '@/common/components/ui/SectionHeading';
import { AdmissionForm } from '@/common/components/AdmissionForm';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { Card, CardContent } from '@/common/components/ui/Card';
import { Button } from '@/common/components/ui/Button';
import { Check, AlertCircle, FileText, Info, CalendarX, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getRadiusClass } from '@/theme.config';
import { useAdmission } from '@/context/AdmissionContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function Admissions() {
  const { t, language } = useLanguage();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const { activeCampaign } = useAdmission();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hasAgreed]);

  return (
    <>
      <SEO 
        title="Online Admissions" 
        description={`Apply for admission at ${schoolConfig.schoolName} (${schoolConfig.schoolAbbreviation}), ${schoolConfig.location.address}. Read the admission criteria and submit your application online.`}
        keywords={`${schoolConfig.schoolShortName} admissions, school admission form, apply online school, ${schoolConfig.location.address} school admission`}
      />
      
      <div className="bg-crhs-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-6">{activeCampaign?.title || "Admissions"}</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium whitespace-pre-line">
              {activeCampaign?.description || "Admissions are currently closed."}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        {!activeCampaign ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-t-4 border-t-amber-500 shadow-xl overflow-hidden">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <CalendarX className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">Admissions Closed</h2>
                <p className="text-slate-600 font-medium text-lg max-w-lg mb-8 leading-relaxed">
                  The online admission process for the academic year is currently closed. 
                  Please check back later or contact the school administration for more information.
                </p>
                <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : !user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-t-4 border-t-crhs-navy shadow-xl overflow-hidden">
              <CardContent className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-crhs-navy" />
                </div>
                <h2 className="text-3xl font-black text-crhs-navy uppercase tracking-wider mb-4">Authentication Required</h2>
                <p className="text-slate-600 font-medium text-lg max-w-lg mb-8 leading-relaxed">
                  You must be logged in to access the admission form. Please log in or create an account to proceed.
                </p>
                <div className="flex gap-4">
                  <Link to="/login?redirect=/admissions">
                    <Button size="lg" className="bg-crhs-navy text-white px-8">
                      Log In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
        <AnimatePresence mode="wait">
          {!hasAgreed ? (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="border-t-4 border-t-crhs-navy shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-crhs-navy" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-crhs-navy uppercase tracking-wider">Admission Criteria & Instructions</h2>
                      <p className="text-slate-500 font-medium text-sm mt-1">Please read carefully before proceeding</p>
                    </div>
                  </div>

                  <div className="space-y-8 text-slate-700 leading-relaxed font-medium">
                    <div>
                      <p className="mb-4">
                        {language === 'hi'
                          ? `सूर्योदय स्टडी प्वाइंट (${schoolConfig.location.address}) में कक्षा 6वीं से 12वीं (CBSE एवं UP बोर्ड), कॉम्पिटिशन एवं कंप्यूटर बैचेज के लिए प्रवेश प्रारंभ हैं। छात्र ऑनलाइन लाइव बैचेज या भवानी छपार स्थित ऑफलाइन क्लासरूम बैचेज चुन सकते हैं।`
                          : `Batch enrollment is open for Class 6th to 12th (CBSE & UP Board), JEE/NEET, Competition & Computer Classes at Suryoday Study Point (${schoolConfig.location.address}). Students can select between Online Live Interactive Batches or Offline Physical Classroom Batches.`}
                      </p>
                      <p className="mb-4">
                        {language === 'hi'
                          ? `नवीनतम शैक्षणिक सत्र के लिए प्रवेश प्रारंभ हैं। शीघ्र पंजीकरण से निःशुल्क डेमो क्लास और स्कॉलरशिप टेस्ट की सुविधा मिलती है।`
                          : `Admissions for the new academic session 2026-27 are currently open. Early registration provides access to free demo classes, diagnostic scholarship tests, and early batch orientation.`}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm">
                      <h3 className="text-lg font-bold text-crhs-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-crhs-gold" />
                        Documents to be Submitted
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 font-semibold">At the time of admission, the following documents are required:</p>
                      <ul className="space-y-3">
                        {[
                          "School leaving/transfer certificate and previous year's Report Card (without this no student from class II onwards will be admitted).",
                          "Medical Certificate in the given format.",
                          "Birth Certificate, in original, to be brought for verification only.",
                          "Recent passport size, color photograph of the candidate and both parents.",
                          "Admission will be cancelled if any variance is found between the particulars filled in the Registration Form and the documents submitted for admission.",
                          "Copy of Aadhar Card of the candidate."
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Keep scanned copies of the required documents ready before you start filling the online application form.
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-200">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center shrink-0 mt-1">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={isCheckboxChecked}
                          onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                        />
                        <div className={cn(
                          "w-6 h-6 border-2 flex items-center justify-center transition-colors",
                          getRadiusClass(),
                          isCheckboxChecked 
                            ? "bg-crhs-navy border-crhs-navy" 
                            : "border-slate-300 bg-white group-hover:border-crhs-navy"
                        )}>
                          <Check className={cn(
                            "w-4 h-4 text-white transition-transform duration-200",
                            isCheckboxChecked ? "scale-100" : "scale-0"
                          )} />
                        </div>
                      </div>
                      <span className="text-sm text-slate-700 font-semibold select-none group-hover:text-slate-900 transition-colors">
                        I have read and understood the admission criteria and have all the required documents ready for submission. I agree to the terms and conditions.
                      </span>
                    </label>
                    <div className="mt-8 flex justify-end">
                      <Button 
                        size="lg" 
                        variant="primary"
                        disabled={!isCheckboxChecked}
                        onClick={() => setHasAgreed(true)}
                        className="w-full md:w-auto"
                      >
                        Proceed to Application Form
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-6 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setHasAgreed(false)}
                  className="text-slate-500 font-bold hover:text-crhs-navy"
                >
                  ← Back to Instructions
                </Button>
              </div>
              <AdmissionForm />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </>
  );
}
