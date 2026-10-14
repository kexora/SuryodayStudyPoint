import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function StatsCounter({ bordered = false, className = '' }: { bordered?: boolean, className?: string }) {
  const { t } = useLanguage();

  const stats = [
    { id: 1, label: t('stats.s1_label'), value: t('stats.s1_num') },
    { id: 2, label: t('stats.s2_label'), value: t('stats.s2_num') },
    { id: 3, label: t('stats.s3_label'), value: t('stats.s3_num') },
    { id: 4, label: t('stats.s4_label'), value: t('stats.s4_num') },
  ];

  return (
    <div className={`${bordered ? 'border-t border-b border-gray-100 bg-white' : ''} ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
        {stats.map((stat, i) => (
          <div 
            key={stat.id} 
            className={`text-center px-4 ${i !== stats.length - 1 && i !== 1 ? 'md:border-r border-current/10' : i === 1 ? 'md:border-r border-current/10' : ''}`}
          >
            <p className="text-4xl sm:text-5xl font-black mb-2">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest font-bold opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
