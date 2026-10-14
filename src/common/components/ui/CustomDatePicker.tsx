import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { getRadiusClass } from '@/theme.config';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  setYear,
  setMonth,
  getYear,
  getMonth,
} from 'date-fns';

export interface CustomDatePickerProps {
  selectedDate?: Date | null;
  selected?: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  placeholderText?: string;
  className?: string;
  disabled?: boolean;
}

type ViewMode = 'days' | 'months' | 'years';

export function CustomDatePicker({
  selectedDate,
  selected,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = "Select a date...",
  placeholderText,
  className,
  disabled = false,
}: CustomDatePickerProps) {
  const actualSelectedDate = selectedDate !== undefined ? selectedDate : (selected !== undefined ? selected : null);
  const actualPlaceholder = placeholderText || placeholder;
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('days');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useOnClickOutside(containerRef, () => {
    setIsOpen(false);
  }, isOpen);

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(actualSelectedDate || new Date());
      setViewMode('days');
    }
  }, [isOpen]);

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (viewMode === 'days') setViewMode('months');
            else if (viewMode === 'months') setViewMode('years');
          }}
          className="font-black text-xs uppercase tracking-wider text-crhs-navy hover:underline transition-colors flex items-center gap-1 cursor-pointer"
        >
          {viewMode === 'days' && format(currentMonth, 'MMMM yyyy')}
          {viewMode === 'months' && format(currentMonth, 'yyyy')}
          {viewMode === 'years' && `${getYear(currentMonth) - 5} - ${getYear(currentMonth) + 6}`}
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDaysHeader = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider py-1.5">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 px-2 mt-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            className="p-0.5 flex items-center justify-center relative aspect-square"
            key={day.toString()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateClick(cloneDay);
              }}
              className={cn(
                "w-8 h-8 flex items-center justify-center text-xs font-semibold transition-all relative z-10 rounded-full cursor-pointer",
                !isCurrentMonth && "text-slate-300",
                isCurrentMonth && !isSelected && "text-slate-700 hover:bg-slate-100",
                isSelected && "bg-crhs-navy text-white font-bold shadow-xs"
              )}
            >
              {formattedDate}
            </button>
            {isToday && !isSelected && (
              <div className="absolute bottom-1 w-1 h-1 bg-crhs-navy rounded-full z-10" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 px-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-2">{rows}</div>;
  };

  const renderMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = setMonth(new Date(), i);
      const isSelectedMonth = selectedDate && getMonth(selectedDate) === i && getYear(selectedDate) === getYear(currentMonth);
      months.push(
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentMonth(setMonth(currentMonth, i));
            setViewMode('days');
          }}
          className={cn(
            "py-2.5 px-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-center cursor-pointer",
            isSelectedMonth
              ? "bg-crhs-navy text-white"
              : "hover:bg-slate-100 text-slate-700"
          )}
        >
          {format(monthDate, 'MMM')}
        </button>
      );
    }
    return <div className="grid grid-cols-3 gap-2 p-3">{months}</div>;
  };

  const renderYears = () => {
    const currentY = getYear(currentMonth);
    const years = [];
    for (let i = currentY - 50; i <= currentY + 50; i++) {
      const isSelectedYear = selectedDate && getYear(selectedDate) === i;
      years.push(
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCurrentMonth(setYear(currentMonth, i));
            setViewMode('months');
          }}
          className={cn(
            "py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer",
            isSelectedYear
              ? "bg-crhs-navy text-white"
              : "hover:bg-slate-100 text-slate-700"
          )}
        >
          {i}
        </button>
      );
    }
    return <div className="grid grid-cols-3 gap-2 p-3 max-h-[250px] overflow-y-auto no-scrollbar">{years}</div>;
  };

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
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left border-2 transition-all cursor-pointer select-none",
          "bg-white text-slate-900 shadow-xs",
          isOpen
            ? "border-crhs-navy ring-4 ring-crhs-navy/15 bg-white text-slate-900 shadow-md"
            : "border-slate-200 hover:border-slate-400 text-slate-900",
          disabled && "opacity-50 cursor-not-allowed",
          getRadiusClass()
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={cn("truncate font-semibold text-sm", !actualSelectedDate && "text-slate-400 font-normal")}>
            {actualSelectedDate ? format(actualSelectedDate, 'PPP') : actualPlaceholder}
          </span>
        </span>
      </button>

      {/* Date Picker Popover & Blur Backdrop */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute left-0 z-50 bg-white border-2 border-slate-200 shadow-2xl flex flex-col overflow-hidden w-full sm:w-80",
                "top-full mt-2",
                getRadiusClass()
              )}
            >
              {renderHeader()}

              <div className="p-1 min-h-[240px] flex flex-col justify-between bg-transparent">
                {viewMode === 'days' && (
                  <div>
                    {renderDaysHeader()}
                    {renderCells()}
                  </div>
                )}
                {viewMode === 'months' && renderMonths()}
                {viewMode === 'years' && renderYears()}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDateClick(new Date());
                  }}
                  className={cn(
                    "w-full py-2 font-bold text-xs uppercase tracking-wider text-crhs-navy bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer",
                    getRadiusClass()
                  )}
                >
                  Select Today
                </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
