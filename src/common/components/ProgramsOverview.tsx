import React, { useState, useEffect } from 'react';
import { ScrollReveal } from '@/common/components/ui/ScrollReveal';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseItem } from '@/types';

export function ProgramsOverview() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const list: CourseItem[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as CourseItem);
      });
      list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      setCourses(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching courses in ProgramsOverview:', err);
      setCourses([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const defaultImages = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
  ];

  // Strictly display only real courses existing in Firebase
  const displayList = courses.slice(0, 4).map((c, i) => ({
    id: c.id,
    level: c.title,
    grades: c.target || (c.modes ? c.modes.join(' & ') : ''),
    img: c.imageUrl || defaultImages[i % defaultImages.length],
    desc: (c.highlights && c.highlights[0]) || c.description || c.target,
    isAdmissionOpen: c.isAdmissionOpen
  }));

  // If loading or no courses exist in Firebase, do not render fake items
  if (!loading && displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-white relative border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" delay={0.08} blur={8}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
            <div>
              <span className="text-amber-600 font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-2 sm:mb-3 block">{t('prog.badge')}</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-crhs-navy">{t('prog.title')}</h2>
            </div>
            <Link to="/academics" className="group inline-flex items-center text-amber-600 font-bold uppercase tracking-wider text-xs sm:text-sm hover:text-crhs-navy transition-colors mb-2">
              {t('nav.academics')} <ArrowRight className="ml-1.5 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayList.map((prog, idx) => (
            <ScrollReveal key={prog.id || idx} direction="up" delay={0.08 * (idx + 1)} blur={8}>
              <div className="group block relative overflow-hidden bg-slate-900 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] border-t-4 border-amber-500 shadow-md">
                <img src={prog.img} alt={prog.level} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-crhs-navy/95 via-crhs-navy/50 to-transparent" />
                
                {prog.isAdmissionOpen && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-2.5 py-1 bg-amber-400 text-crhs-navy text-[10px] font-black uppercase tracking-wider rounded shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-crhs-navy" /> Open
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 block opacity-90 line-clamp-1">{prog.grades}</span>
                    <h3 className="text-xl font-black text-white mb-2 leading-tight line-clamp-2">{prog.level}</h3>
                    <p className="text-white/80 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed line-clamp-3 mb-3">
                      {prog.desc}
                    </p>
                    
                    {prog.isAdmissionOpen ? (
                      <Link 
                        to={`/admissions?courseId=${prog.id}&course=${encodeURIComponent(prog.level)}`}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-400 hover:text-white"
                      >
                        <span>Apply Online</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link 
                        to="/academics" 
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
