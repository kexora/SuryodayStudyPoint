import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 bg-slate-950/70 transition-opacity" 
            aria-hidden="true"
          />
          
          {/* Scrollable container capturing outside clicks */}
          <div 
            className="fixed inset-0 overflow-y-auto custom-scrollbar"
            onClick={onClose}
          >
            <div className="min-h-full flex items-center justify-center p-3 sm:p-6 text-center">
              {/* Modal Panel - prevent bubbling click to backdrop */}
              <motion.div 
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn("relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl text-left flex flex-col bg-white shadow-2xl border-2 border-crhs-navy z-10 my-8 mx-auto", className)}
              >
                <div className="flex items-center justify-between border-b-2 border-slate-100 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 shrink-0">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-crhs-navy truncate pr-2">{title}</h2>
                  <button 
                    onClick={onClose}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-crhs-navy hover:bg-slate-200/50 rounded-full transition-colors shrink-0 relative z-[100]"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </button>
                </div>
                <div className="p-4 sm:p-6 overflow-visible">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
