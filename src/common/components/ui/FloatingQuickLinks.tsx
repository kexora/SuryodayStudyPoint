import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Phone, GraduationCap, X, Mail, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingQuickLinks() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const links = [
    { icon: GraduationCap, label: 'Admissions', to: '/admissions', color: 'bg-crhs-navy text-white hover:bg-crhs-navy/90 border border-crhs-navy/20' },
    { icon: Phone, label: 'Call Us', to: '/contact', color: 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700/20' },
    { icon: Mail, label: 'Enquire', to: '/contact', color: 'bg-crhs-gold text-crhs-navy hover:bg-yellow-400 border border-crhs-gold/50' }
  ];

  // Hide the floating button completely on these structural routes
  const isHiddenRoute = location.pathname.startsWith('/dashboard') || 
                        location.pathname.startsWith('/admin') || 
                        location.pathname === '/login';

  useEffect(() => {
    const handleScroll = () => {
      // Close the menu automatically whenever the user scrolls
      setIsOpen(false);

      // Only show after scrolling down 150px
      const isPastTop = window.scrollY > 150;
      
      // Hide if near bottom to prevent overlapping with footer
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 350;

      if (isPastTop && !isNearBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  if (isHiddenRoute) return null;

  return (
    <>
      {/* Background Overlay for Premium Feel */}
      <AnimatePresence>
        {isVisible && isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] bg-crhs-navy/5"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-end gap-3"
          >
          {/* Main Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="group relative w-14 h-14 bg-crhs-navy rounded-full text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-crhs-gold/30"
          >
            {/* Subtle pulse effect to draw attention when closed */}
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-crhs-navy opacity-40 animate-ping" style={{ animationDuration: '3s' }}></span>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? "close" : "menu"}
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-crhs-gold" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Links Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-3 items-end mb-2"
              >
                {links.map((link, idx) => {
                  const Icon = link.icon;
                  // Reverse index for staggering from bottom to top
                  const delayIdx = links.length - 1 - idx; 
                  return (
                    <motion.div
                      key={idx}
                      custom={delayIdx}
                      variants={{
                        hidden: { opacity: 0, x: 40, y: 20, scale: 0.8 },
                        visible: (i) => ({
                          opacity: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          transition: {
                            delay: i * 0.08,
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        })
                      }}
                    >
                      <Link
                        to={link.to}
                        className="group flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="opacity-0 blur-md translate-x-4 pointer-events-none px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[11px] font-black uppercase tracking-widest text-crhs-navy rounded shadow-md border border-slate-200 transform transition-all duration-500 ease-out group-hover:opacity-100 group-hover:blur-none group-hover:scale-105 group-hover:-translate-x-1 group-hover:bg-white group-hover:text-crhs-gold z-10">
                          {link.label}
                        </span>
                        <div className={cn("w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110", link.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
