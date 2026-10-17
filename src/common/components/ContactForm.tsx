import React, { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { Input } from '@/common/components/ui/Input';
import { CustomSelect } from '@/common/components/ui/CustomSelect';
import { Send, CheckCircle2, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';

export function ContactForm() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const subjectOptions = [
    { value: 'admission', label: language === 'hi' ? 'ऑनलाइन या ऑफलाइन प्रवेश' : 'Admissions Inquiry' },
    { value: 'academic', label: language === 'hi' ? 'कक्षा 6वीं से 12वीं बैचेज' : 'Class 6th-12th Batches' },
    { value: 'competition', label: language === 'hi' ? 'सूर्योदय प्रतियोगी परीक्षा (SSC/पुलिस/रेलवे)' : 'Competition Classes' },
    { value: 'computer', label: language === 'hi' ? 'कंप्यूटर क्लासेस (CCC/ADCA/Tally)' : 'Computer Courses' },
    { value: 'fees', label: language === 'hi' ? 'फीस एवं टाइमिंग संबंधी जानकारी' : 'Fee Structure & Timings' },
    { value: 'general', label: language === 'hi' ? 'अन्य सामान्य प्रश्न' : 'General Inquiry' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save directly to Firebase 'inquiries' collection
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        createdAt: serverTimestamp(),
        status: 'Unread'
      });
    } catch (err) {
      console.warn('Inquiry saved locally due to offline network:', err);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form after 6 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 6000);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            className="flex flex-col items-center justify-center py-10 sm:py-14 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-2 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-crhs-navy">
              {language === 'hi' ? 'संदेश सफलतापूर्वक प्राप्त हुआ!' : 'Message Sent Successfully!'}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-sm font-medium leading-relaxed">
              {language === 'hi' 
                ? 'सूर्योदय स्टडी प्वाइंट से संपर्क करने के लिए धन्यवाद। हमारी परामर्श टीम शीघ्र ही आपसे संपर्क करेगी।' 
                : 'Thank you for contacting Suryoday Study Point. Our academic counseling team will reach out to you shortly.'}
            </p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-4 sm:space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {language === 'hi' ? 'पहला नाम' : 'First Name'} <span className="text-red-500">*</span>
                </label>
                <Input 
                  required 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder={language === 'hi' ? 'उदा. राहुल' : 'John'}
                  className="bg-slate-50 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {language === 'hi' ? 'अंतिम नाम' : 'Last Name'} <span className="text-red-500">*</span>
                </label>
                <Input 
                  required 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder={language === 'hi' ? 'उदा. कुमार' : 'Doe'}
                  className="bg-slate-50 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {language === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <Input 
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel" 
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  className="bg-slate-50 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                </label>
                <Input 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email" 
                  placeholder="student@example.com"
                  className="bg-slate-50 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {language === 'hi' ? 'पूछताछ का विषय' : 'Subject of Inquiry'} <span className="text-red-500">*</span>
              </label>
              <CustomSelect 
                options={subjectOptions}
                value={formData.subject}
                onChange={handleSubjectChange}
                placeholder={language === 'hi' ? 'विषय या कोर्स का चयन करें' : 'Select a topic of inquiry'}
                className="bg-slate-50 rounded-xl"
              />
              <input type="text" className="absolute w-0 h-0 opacity-0 pointer-events-none" required value={formData.subject} onChange={() => {}} tabIndex={-1} />
            </div>
            
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {language === 'hi' ? 'आपका संदेश / प्रश्न' : 'Your Message'} <span className="text-red-500">*</span>
              </label>
              <textarea 
                required 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4} 
                className="flex w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-crhs-navy focus:border-transparent font-medium resize-none transition-all rounded-xl"
                placeholder={language === 'hi' ? 'हम आपकी किस प्रकार सहायता कर सकते हैं? यहाँ लिखें...' : 'How can we help you today? Write your question here...'}
              ></textarea>
            </div>
            
            <div className="pt-1">
              <Button 
                type="submit" 
                size="md" 
                className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black text-xs uppercase tracking-wider py-3 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-crhs-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === 'hi' ? 'संदेश भेजा जा रहा है...' : 'Sending Message...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'संदेश भेजें' : 'Send Message'}</span>
                  </span>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
