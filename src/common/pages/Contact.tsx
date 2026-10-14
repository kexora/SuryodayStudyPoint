import React from 'react';
import { SectionHeading } from '@/common/components/ui/SectionHeading';
import { ContactForm } from '@/common/components/ContactForm';
import { Card, CardContent } from '@/common/components/ui/Card';
import { MapPin, Phone, Mail, Clock, Map, Send, MessageCircle } from 'lucide-react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { SEO } from '@/common/components/ui/SEO';
import { useSettings } from '@/context/SettingsContext';
import { schoolConfig } from '@/config/schoolConfig';
import { useLanguage } from '@/context/LanguageContext';

export function Contact() {
  const { settings } = useSettings();
  const { t, language } = useLanguage();

  return (
    <>
      <SEO 
        title="Contact Us" 
        description={`Get in touch with ${schoolConfig.schoolName}. We are here to answer all your questions regarding admissions, academics, and facilities.`}
        keywords={`contact ${schoolConfig.schoolShortName}, ${schoolConfig.schoolName.toLowerCase()} contact, school admissions phone number, school email address, school location`}
      />
      
      {/* Hero Section */}
      <div className="bg-crhs-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-crhs-gold/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-6">{t('contact.title', 'Contact Us')}</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
              {t('contact.desc')}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <ScrollReveal direction="right">
              <div>
                <h3 className="text-2xl font-black text-crhs-navy uppercase tracking-wider mb-6">{t('contact.get_in_touch', 'Get In Touch')}</h3>
                <p className="text-slate-600 mb-8 font-medium">
                  {language === 'hi' 
                    ? 'चाहे आप नए अभिभावक हों, छात्र हों या पूर्व छात्र, आपके किसी भी प्रश्न के लिए हमारे द्वार सदैव खुले हैं।'
                    : 'Whether you are a prospective parent, a current student, or an alumni, our doors are always open for your queries.'}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 rounded-full bg-crhs-gold/20 flex items-center justify-center shrink-0 group-hover:bg-crhs-gold transition-colors">
                  <MapPin className="h-6 w-6 text-crhs-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-crhs-navy uppercase tracking-wider text-sm mb-1">{t('contact.location', 'Our Location')}</h4>
                  <p className="text-slate-600 text-sm">{t('contact.address', settings.address)}</p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={0.2}>
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                  <Phone className="h-6 w-6 text-crhs-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-crhs-navy uppercase tracking-wider text-sm mb-1">{t('contact.phone', 'Phone Number')}</h4>
                  <a 
                    href={`tel:${(settings.contactNumber || schoolConfig.contact.phonePrimary).replace(/\s+/g, '')}`}
                    className="text-crhs-navy hover:text-amber-600 font-extrabold text-sm mb-1 inline-block hover:underline transition-colors"
                  >
                    {settings.contactNumber || schoolConfig.contact.phonePrimary}
                  </a>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={0.3}>
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                  <Mail className="h-6 w-6 text-crhs-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-crhs-navy uppercase tracking-wider text-sm mb-1">{t('contact.email', 'Email Address')}</h4>
                  <a 
                    href={`mailto:${settings.contactEmail || schoolConfig.contact.emailPrimary}`}
                    className="text-crhs-navy hover:text-amber-600 font-extrabold text-sm mb-1 inline-block hover:underline transition-colors break-all"
                  >
                    {settings.contactEmail || schoolConfig.contact.emailPrimary}
                  </a>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" delay={0.4}>
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                  <Clock className="h-6 w-6 text-crhs-navy" />
                </div>
                <div>
                  <h4 className="font-bold text-crhs-navy uppercase tracking-wider text-sm mb-1">{t('contact.hours_label', 'Counseling & Office Hours')}</h4>
                  <p className="text-slate-600 text-sm mb-1">{t('contact.hours')}</p>
                  <p className="text-slate-600 text-sm">{language === 'hi' ? 'रविवार: सुबह 8:00 से दोपहर 1:00 बजे तक' : 'Sunday: 8:00 AM - 1:00 PM (Batch Counseling)'}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Contact Form */}
          <ScrollReveal direction="up" delay={0.2} className="lg:col-span-2">
            <Card className="h-full border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="bg-crhs-navy p-6 md:p-8 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-wider mb-2 flex items-center gap-3">
                    <Send className="w-6 h-6 text-crhs-gold" />
                    {t('contact.send_message', 'Send us a Message')}
                  </h3>
                  <p className="text-slate-300 text-sm font-medium">Fill out the form below and our team will get back to you within 24 hours.</p>
                </div>
                <div className="p-6 md:p-8 bg-white flex-grow">
                  <ContactForm />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-slate-50 py-16 md:py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase tracking-wider text-crhs-navy mb-4">Find Us on the Map</h2>
              <p className="text-slate-600 font-medium max-w-2xl mx-auto">Visit our campus to experience the environment where your child will grow and learn.</p>
            </div>
            
            <Card className="border-4 border-white shadow-xl overflow-hidden rounded-xl">
              <div className="w-full h-[400px] md:h-[500px] relative">
                {/* Embedded Google Map (Placeholder iframe) */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114022.381335438!2d83.7198759!3d26.5029851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3993c1374c43ee0f%3A0x280e227038e21752!2sDeoria%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1786585000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${schoolConfig.schoolName} Location Map`}
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </div>
      
      {/* FAQ CTA Section */}
      <div className="bg-crhs-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up">
            <MessageCircle className="w-12 h-12 text-crhs-gold mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-4">Have frequently asked questions?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Before reaching out, you might find the answer you're looking for in our comprehensive FAQ section covering admissions, curriculum, and facilities.
            </p>
            <a href="/admissions" className="inline-block bg-crhs-gold text-crhs-navy font-bold uppercase tracking-widest px-8 py-4 text-sm rounded-none hover:bg-white transition-colors border-2 border-transparent">
              View Admissions FAQ
            </a>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
