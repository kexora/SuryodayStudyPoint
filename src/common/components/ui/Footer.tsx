import { schoolConfig } from '@/config/schoolConfig';
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ExternalLink, GraduationCap, Sun } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { SocialIcons } from './SocialIcons';
import { ImageWithLoader } from './ImageWithLoader';

import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();

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
    <footer className="bg-crhs-navy text-white pt-16 pb-8 border-t-4 border-amber-500 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Col 1: School Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-crhs-navy shadow-md shrink-0">
                <Sun className="w-5 h-5 text-crhs-navy fill-crhs-navy" />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase leading-none text-white">{settings.schoolName}</h3>
                <p className="text-[10px] text-amber-400 tracking-widest font-bold uppercase mt-1">{t('nav.tagline')}</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Academic Coaching (Std 6th-12th), Evening Batches, Competitive Exam Preparation & Computer Training Center in Bhawani Chhapar, Deoria.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-amber-400 mb-4 border-b border-white/10 pb-2">{t('footer.quick_links')}</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <li><Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-amber-400" /> {t('nav.about')}</Link></li>
              <li><Link to="/academics" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-amber-400" /> {t('nav.academics')}</Link></li>
              <li><Link to="/facilities" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-amber-400" /> {t('nav.facilities')}</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-amber-400" /> {t('nav.gallery')}</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-amber-400" /> {t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-amber-400 mb-4 border-b border-white/10 pb-2">{t('footer.portals')}</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <li><Link to="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-amber-400" /> {t('nav.login')}</Link></li>
              <li><Link to="/admissions" className="hover:text-amber-400 transition-colors flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-amber-400" /> {t('nav.apply_online')}</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-amber-400 mb-4 border-b border-white/10 pb-2">{t('footer.contact')}</h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-crhs-gold shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-crhs-gold shrink-0" />
                <span>{settings.contactNumber || schoolConfig.contact.phonePrimary}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-crhs-gold shrink-0" />
                <span>{settings.contactEmail || schoolConfig.contact.emailPrimary}</span>
              </div>
            </div>

            {/* Social Icons in Footer (Outline SVG, No Background) */}
            {activeSocials.length > 0 && (
              <div className="pt-2">
                <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 mb-2">Follow Our Channels</h5>
                <div className="flex flex-wrap gap-3 items-center">
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
                        className="p-1 text-slate-300 hover:text-crhs-gold transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
                      >
                        <Component className="w-5 h-5 stroke-[2]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {settings.schoolName}. All Rights Reserved.</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Designed & Maintained for Academic Excellence</p>
        </div>
      </div>
    </footer>
  );
}

