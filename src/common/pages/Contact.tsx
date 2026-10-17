import React from 'react';
import { ContactForm } from '@/common/components/ContactForm';
import { Card, CardContent } from '@/common/components/ui/Card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Navigation,
  Compass,
  Building2
} from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { useSettings } from '@/context/SettingsContext';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';

export function Contact() {
  const { settings } = useSettings();
  const { t, language } = useLanguage();

  const phone = (settings.contactNumber || schoolConfig.contact.phonePrimary).replace(/\s+/g, '');
  const email = settings.contactEmail || schoolConfig.contact.emailPrimary;
  const address = settings.address || schoolConfig.location.fullAddress;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <SEO 
        title="Contact Us | Suryoday Study Point" 
        description={`Get in touch with ${schoolConfig.schoolName}. We are here to answer all your questions regarding admissions, academics, and facilities.`}
        keywords={`contact ${schoolConfig.schoolShortName}, ${schoolConfig.schoolName.toLowerCase()} contact, school admissions phone number, school email address, school location`}
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
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{language === 'hi' ? 'सहायता एवं संपर्क केंद्र' : 'Help & Counseling Desk'}</span>
            </div>
          </ScrollReveal>

          {/* Heading with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.12} blur={10}>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4 text-white">
              {t('contact.title', 'Contact Us')}
            </h1>
          </ScrollReveal>

          {/* Subtitle with Blur Reveal */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal sm:font-medium leading-relaxed px-2">
              {t('contact.desc', "We're here to help and answer any questions regarding batch timings, course fees, online access, and admissions.")}
            </p>
          </ScrollReveal>

          {/* Quick Contact Chips for Mobile */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
              <a 
                href={`tel:${phone}`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xs text-amber-300 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>8383884201</span>
              </a>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'hi' ? 'भवानी छपार, देवरिया' : 'Bhawani Chhapar, Deoria'}</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>7:00 AM - 7:00 PM</span>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="py-6 sm:py-10 md:py-14 max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Quick Action Cards (4-Grid on Desktop, 2x2 on Mobile with Blur Reveal) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-12">
          {/* Action 1: Call Directly */}
          <ScrollReveal direction="up" delay={0.06} blur={8}>
            <a 
              href={`tel:${phone}`}
              className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group block"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 mb-3 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'कॉल करें' : 'Call Support'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate mt-0.5">
                  {phone}
                </p>
              </div>
              <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                <span>{language === 'hi' ? 'तुरंत बात करें' : 'Tap to Call'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </a>
          </ScrollReveal>

          {/* Action 2: Email Us */}
          <ScrollReveal direction="up" delay={0.12} blur={8}>
            <a 
              href={`mailto:${email}`}
              className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group block"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 mb-3 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'ईमेल भेजें' : 'Official Email'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate mt-0.5">
                  {email}
                </p>
              </div>
              <p className="text-[10px] text-blue-600 font-bold mt-2 flex items-center gap-1">
                <span>{language === 'hi' ? 'ईमेल लिखें' : 'Send Email'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </a>
          </ScrollReveal>

          {/* Action 3: Center Location */}
          <ScrollReveal direction="up" delay={0.18} blur={8}>
            <a 
              href="https://maps.google.com/?q=Bhawani+Chhapar+Deoria+Uttar+Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group block"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 mb-3 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'कैंपस का पता' : 'Campus Location'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate mt-0.5">
                  {schoolConfig.location.address}
                </p>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <span>{language === 'hi' ? 'मैप पर देखें' : 'View on Map'}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </a>
          </ScrollReveal>

          {/* Action 4: Office Timings */}
          <ScrollReveal direction="up" delay={0.24} blur={8}>
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">
                  {language === 'hi' ? 'परामर्श समय' : 'Office Hours'}
                </p>
                <p className="text-xs sm:text-sm font-black text-crhs-navy truncate mt-0.5">
                  7:00 AM - 7:00 PM
                </p>
              </div>
              <p className="text-[10px] text-purple-600 font-bold mt-2">
                {language === 'hi' ? 'सोमवार से शनिवार' : 'Mon - Sat Open'}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Layout: Contact Details & Send Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10 sm:mb-14">
          
          {/* Left Column: Center Highlights & Details */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <ScrollReveal direction="up" delay={0.1} blur={8}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="text-base sm:text-lg font-black text-crhs-navy uppercase tracking-wide">
                    {t('contact.get_in_touch', 'Get In Touch')}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {language === 'hi' 
                    ? 'चाहे आप नए छात्र हों, अभिभावक हों या प्रतियोगी परीक्षा की तैयारी कर रहे हों, आपके किसी भी प्रश्न एवं मार्गदर्शन के लिए हमारी टीम सदैव तत्पर है।'
                    : 'Whether you are a new student, guardian, or preparing for competitive exams, our academic counseling team is always ready to guide you.'}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {language === 'hi' ? 'केंद्र का पता' : 'Center Address'}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-crhs-navy mt-0.5">
                        {address}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'hi' ? '(सिरिसिया बाबू रोड के पास)' : '(Near Sirisiya Babu Road)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {language === 'hi' ? 'सीधा संपर्क / WhatsApp' : 'Direct Helpline'}
                      </p>
                      <a 
                        href={`tel:${phone}`}
                        className="text-xs sm:text-sm font-black text-crhs-navy hover:text-amber-600 mt-0.5 block hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {language === 'hi' ? 'ईमेल' : 'Email Address'}
                      </p>
                      <a 
                        href={`mailto:${email}`}
                        className="text-xs sm:text-sm font-bold text-crhs-navy hover:text-amber-600 mt-0.5 block hover:underline break-all"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {language === 'hi' ? 'ऑफिस समय' : 'Counseling Hours'}
                      </p>
                      <p className="text-xs font-bold text-crhs-navy mt-0.5">
                        {language === 'hi' ? 'सोमवार - शनिवार: सुबह 7:00 से शाम 7:00' : 'Mon - Sat: 7:00 AM - 7:00 PM'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'hi' ? 'रविवार: सुबह 8:00 से दोपहर 1:00 (विशेष बैच काउंसलिंग)' : 'Sunday: 8:00 AM - 1:00 PM (Batch Counseling)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Quick Online Admission Redirect Card */}
            <ScrollReveal direction="up" delay={0.16} blur={8}>
              <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                    {language === 'hi' ? 'नया प्रवेश' : 'Admissions'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-crhs-navy mt-1">
                    {language === 'hi' ? 'ऑनलाइन बैच में प्रवेश लेना चाहते हैं?' : 'Looking to Enroll for Batches?'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {language === 'hi' ? 'सीधे ऑनलाइन प्रवेश फॉर्म भरें।' : 'Fill out the online application form.'}
                  </p>
                </div>
                <Link to="/admissions" className="shrink-0">
                  <button className="px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-crhs-navy font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all">
                    <span>{language === 'hi' ? 'आवेदन करें' : 'Apply'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="up" delay={0.12} blur={8}>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Header Banner */}
                <div className="bg-crhs-navy p-4 sm:p-6 text-white border-b-2 border-amber-500 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>{t('contact.send_message', 'Send us a Message')}</span>
                    </h3>
                    <p className="text-slate-300 text-xs font-normal mt-1">
                      {language === 'hi' 
                        ? 'अपना संदेश नीचे दर्ज करें, हमारी टीम 24 घंटे के भीतर संपर्क करेगी।' 
                        : 'Submit your query below and our team will get back to you shortly.'}
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-4 sm:p-6 md:p-8 bg-white">
                  <ContactForm />
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* Map Section with Blur Reveal */}
        <ScrollReveal direction="up" delay={0.14} blur={8}>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full mb-1 inline-block">
                  {language === 'hi' ? 'गूगल मैप लोकेशन' : 'Google Maps'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-crhs-navy">
                  {t('contact.map_title', 'Find Us on the Map')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {schoolConfig.location.fullAddress}
                </p>
              </div>

              <a 
                href="https://maps.google.com/?q=Bhawani+Chhapar+Deoria+Uttar+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-crhs-navy font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'hi' ? 'दिशा-निर्देश प्राप्त करें' : 'Get Directions'}</span>
              </a>
            </div>

            <div className="w-full h-[280px] sm:h-[380px] rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114022.381335438!2d83.7198759!3d26.5029851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3993c1374c43ee0f%3A0x280e227038e21752!2sDeoria%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1786585000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title={`${schoolConfig.schoolName} Location Map`}
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
