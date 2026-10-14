import React, { useState, useRef, useEffect, ReactNode, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { getRadiusClass } from '@/theme.config';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface SelectOption {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  icon,
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useOnClickOutside(containerRef, () => {
    setIsOpen(false);
  }, isOpen);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      const initialIndex = filteredOptions.findIndex(opt => opt.value === value);
      setFocusedIndex(initialIndex >= 0 ? initialIndex : 0);
      
      // Scroll to center when opened
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (options.length > 5) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          onChange(filteredOptions[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const activeItem = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left border-2 transition-all cursor-pointer select-none",
          "bg-white text-slate-900 shadow-xs",
          isOpen
            ? "border-crhs-navy ring-4 ring-crhs-navy/15 bg-white text-slate-900 shadow-md"
            : "border-slate-200 hover:border-slate-400 text-slate-900",
          disabled && "opacity-50 cursor-not-allowed",
          getRadiusClass()
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
          <span className={cn("truncate font-semibold text-sm", !selectedOption && "text-slate-400 font-normal")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
        </motion.div>
      </button>

      {/* Popover Menu & Blur Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 right-0 z-[999999] bg-white border-2 border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[280px]",
              "top-full mt-2",
              getRadiusClass()
            )}
          >
              {/* Search Filter (if > 5 options) */}
              {options.length > 5 && (
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className={cn(
                        "w-full pl-9 pr-3 py-1.5 bg-white text-sm text-slate-900 border border-slate-200 focus:outline-none focus:border-crhs-navy focus:ring-1 focus:ring-crhs-navy",
                        getRadiusClass()
                      )}
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div ref={listboxRef} className="overflow-y-auto flex-1 p-1.5 no-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-xs font-semibold text-slate-400">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = value === opt.value;
                    const isFocused = focusedIndex === idx;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setFocusedIndex(idx)}
                        className={cn(
                          "w-full text-left flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors my-0.5 cursor-pointer",
                          getRadiusClass(),
                          isSelected
                            ? "bg-crhs-navy text-white font-bold"
                            : isFocused
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span className="truncate pr-2">{opt.label}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                      </button>
                    );
                  })
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
