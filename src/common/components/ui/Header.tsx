import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, LogOut, User as UserIcon, X, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useAdmission } from '@/context/AdmissionContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { SocialIcons } from './SocialIcons';
import { ImageWithLoader } from './ImageWithLoader';
import { schoolConfig } from '@/config/schoolConfig';

import { useLanguage, LanguageSwitcher } from '@/context/LanguageContext';

export function Header() {
  const { t, language, toggleLanguage } = useLanguage();

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.about', 'About'), path: '/about' },
    { name: t('nav.academics', 'Academics'), path: '/academics' },
    { name: t('nav.facilities', 'Facilities'), path: '/facilities' },
    { name: t('nav.gallery', 'Gallery'), path: '/gallery' },
    { name: t('nav.notices', 'Notices'), path: '/notices' },
    { name: t('nav.contact', 'Contact'), path: '/contact' },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { activeCampaign } = useAdmission();
  const { user, userData, signOut } = useAuth();
  
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else if (window.scrollY < 20) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Social platforms config list
  const socialList = [
    { key: 'youtube', label: 'YouTube', Component: SocialIcons.youtube },
    { key: 'instagram', label: 'Instagram', Component: SocialIcons.instagram },
    { key: 'facebook', label: 'Facebook', Component: SocialIcons.facebook },
    { key: 'twitter', label: 'Twitter / X', Component: SocialIcons.twitter },
    { key: 'linkedin', label: 'LinkedIn', Component: SocialIcons.linkedin },
    { key: 'whatsapp', label: 'WhatsApp', Component: SocialIcons.whatsapp },
    { key: 'telegram', label: 'Telegram', Component: SocialIcons.telegram },
    { key: 'pinterest', label: 'Pinterest', Component: SocialIcons.pinterest },
    { key: 'tiktok', label: 'TikTok', Component: SocialIcons.tiktok },
  ];

  const activeSocials = socialList.filter(item => {
    const isEnabled = settings.socialEnabled?.[item.key] ?? false;
    const url = settings.socialLinks?.[item.key];
    return isEnabled && url && url.trim().length > 0;
  });

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full flex-none transition-all duration-300",
      isScrolled ? "shadow-md bg-white/95 backdrop-blur-md" : "bg-white"
    )}>
      {/* Top Bar - Hides on scroll */}
      <div className={cn(
        "bg-crhs-navy text-white text-[10px] sm:text-[11px] font-bold tracking-wider transition-all duration-500 overflow-hidden",
        isScrolled ? "max-h-0 opacity-0" : "max-h-12 py-1.5 opacity-100 border-b border-white/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full gap-2">
          <div className="hidden sm:flex items-center gap-4 md:gap-6 shrink-0">
            <a href={`tel:${(settings.contactNumber || schoolConfig.contact.phonePrimary).replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-amber-300 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1" title="Call Us">
              <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{settings.contactNumber || schoolConfig.contact.phonePrimary}</span>
            </a>
            <a href={`mailto:${settings.contactEmail || schoolConfig.contact.emailPrimary}`} className="flex items-center gap-1.5 hover:text-amber-300 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1" title="Email Us">
              <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{settings.contactEmail || schoolConfig.contact.emailPrimary}</span>
            </a>
          </div>
          <div className="flex gap-3 uppercase w-full sm:w-auto justify-between sm:justify-end items-center shrink-0">
            {/* Language Switcher in Top Bar */}
            <LanguageSwitcher variant="compact" />

            {activeCampaign && (
              <span className="text-amber-400 font-bold tracking-wider text-[10px] hidden md:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" /> {activeCampaign.title}
              </span>
            )}

            {/* Social Media Vector Icons */}
            {activeSocials.length > 0 && (
              <div className="flex gap-2.5 items-center">
                {activeSocials.map(({ key, label, Component }) => {
                  const url = settings.socialLinks[key]!;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="text-amber-400/90 hover:text-amber-300 transition-transform hover:scale-125 flex items-center justify-center p-0.5"
                    >
                      <Component className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center transition-all duration-300 gap-4",
        isScrolled ? "py-1.5" : "py-2.5 border-b border-gray-100"
      )}>
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-crhs-navy shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Sun className="w-4 h-4 sm:w-6 sm:h-6 text-crhs-navy fill-crhs-navy" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="font-black text-xs sm:text-base md:text-lg tracking-tight uppercase m-0 leading-tight truncate">
              <span className="text-crhs-navy group-hover:text-amber-600 transition-colors truncate">{settings.schoolName}</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] tracking-wider font-bold text-amber-600 m-0 mt-0.5 leading-none uppercase truncate max-w-[160px] sm:max-w-none">{t('nav.tagline')}</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "py-2 transition-colors relative group whitespace-nowrap",
                location.pathname === link.path ? "text-amber-600 font-extrabold" : "text-crhs-navy hover:text-amber-600"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 transform origin-left transition-transform duration-300",
                location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )} />
            </Link>
          ))}
          
          <div className="flex items-center gap-2.5 xl:gap-3 border-l border-gray-200 pl-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2">
                <Link to={userData?.role === '__kx_0x2' || userData?.role === '__kx_0x1' ? "/admin" : "/dashboard"} className="text-crhs-navy hover:text-amber-600 transition-colors tracking-wider text-[10px] font-black uppercase flex items-center gap-1 whitespace-nowrap">
                  <UserIcon className="w-3 h-3 text-amber-500" />
                  {userData?.role === '__kx_0x2' || userData?.role === '__kx_0x1' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-crhs-navy hover:text-amber-600 transition-colors tracking-wider text-[10px] font-black uppercase whitespace-nowrap">
                {t('nav.login')}
              </Link>
            )}
            
            {activeCampaign && (
              <Link to="/admissions" className="shrink-0">
                <Button className="shadow-sm hover:shadow transition-all py-1.5 px-3 h-auto text-[10px] bg-amber-500 hover:bg-amber-600 text-crhs-navy font-black whitespace-nowrap">
                  {t('nav.apply_online')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2 relative z-[60]">
          <LanguageSwitcher variant="compact" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-transparent text-crhs-navy transition-all focus:outline-none relative w-10 h-10 flex flex-col justify-center items-center gap-[5px]"
            aria-label="Toggle Menu"
          >
            <span className={cn("block h-[2px] bg-current transition-all duration-300 ease-in-out", isMobileMenuOpen ? "w-6 translate-y-[7px] rotate-45" : "w-6")} />
            <span className={cn("block h-[2px] bg-current transition-all duration-300 ease-in-out", isMobileMenuOpen ? "w-0 opacity-0" : "w-6")} />
            <span className={cn("block h-[2px] bg-current transition-all duration-300 ease-in-out", isMobileMenuOpen ? "w-6 -translate-y-[7px] -rotate-45" : "w-4 self-end")} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-crhs-navy/50 backdrop-blur-md z-[100] lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-[285px] max-w-[85vw] h-[100dvh] bg-white z-[110] lg:hidden shadow-2xl flex flex-col"
              >
                {/* Drawer Header with Title, Language Switcher on side, and Close Button */}
                <div className="px-5 py-4 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-amber-400/20 text-crhs-navy rounded-full flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="font-black text-base text-crhs-navy tracking-tight uppercase truncate">
                      {schoolConfig.schoolShortName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Compact Language Toggle Icon Button on the side */}
                    <LanguageSwitcher variant="icon" />

                    <button 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="text-slate-400 p-1.5 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      aria-label="Close Menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Nav Links with unified sizing and unbroken Devanagari styling */}
                <div className="px-4 py-5 flex flex-col space-y-1.5 flex-grow overflow-y-auto">
                  {navLinks.map((link, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + (i * 0.03) }}
                      key={link.name}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center text-[15px] py-2.5 px-3 rounded-lg transition-all duration-200",
                          language === 'hi' 
                            ? "font-bold tracking-normal leading-normal" 
                            : "font-bold uppercase tracking-wider leading-none",
                          location.pathname === link.path
                            ? "text-amber-600 bg-amber-50/80 font-black"
                            : "text-crhs-navy hover:text-amber-600 hover:bg-slate-50"
                        )}
                      >
                        <span 
                          className={cn(
                            "rounded-full bg-amber-500 transition-all duration-200 shrink-0", 
                            location.pathname === link.path 
                              ? "w-2 h-2 mr-2.5 opacity-100 scale-100" 
                              : "w-0 h-2 mr-0 opacity-0 scale-0"
                          )} 
                        />
                        <span className="truncate">{link.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Action Buttons - Clean & Simple */}
                <div className="p-4 border-t border-gray-100 flex flex-col gap-2.5 bg-slate-50/60 mt-auto shrink-0">
                  {user ? (
                    <>
                      <Link to={userData?.role === '__kx_0x2' || userData?.role === '__kx_0x1' ? "/admin" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center text-xs font-bold py-2.5">
                          <UserIcon className="w-4 h-4 mr-2" />
                          {userData?.role === '__kx_0x2' || userData?.role === '__kx_0x1' ? 'Admin Portal' : userData?.role === '__kx_0x4' ? 'Student Portal' : userData?.role === '__kx_0x3' ? 'Teacher Portal' : userData?.role === '__kx_0x5' ? 'Guardian Portal' : 'Dashboard'}
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => { signOut(); setIsMobileMenuOpen(false); }} 
                        variant="outline" 
                        className="w-full justify-center text-xs font-bold py-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> {t('nav.logout', 'Sign Out')}
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-xs font-bold py-2.5 border-slate-300">
                        <UserIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {t('nav.login', 'Sign In')}
                      </Button>
                    </Link>
                  )}
                  {activeCampaign && activeCampaign.isActive && (
                    <Link to="/admissions" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center text-xs font-bold py-2.5 shadow-sm bg-amber-500 hover:bg-amber-600 text-crhs-navy">
                        {t('nav.apply_online', 'Apply Online')}
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
