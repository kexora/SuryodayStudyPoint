import { schoolConfig } from "@/config/schoolConfig";
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/common/components/ui/Button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatGoogleDriveUrl } from './ui/ImageWithLoader';
import { useAdmission } from '@/context/AdmissionContext';
import { Sparkles, GraduationCap } from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  order: number;
}

export function HeroSlider() {
  const { activeCampaign } = useAdmission();
  const [dbSlides, setDbSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'hero_slides'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedSlides: HeroSlide[] = [];
        snapshot.forEach((doc) => {
          fetchedSlides.push({ id: doc.id, ...doc.data() } as HeroSlide);
        });
        setDbSlides(fetchedSlides);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to hero slides:', error);
        setDbSlides([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const defaultSlides: HeroSlide[] = [
    {
      id: 'default-slide-1',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1600',
      title: "SURYODAY STUDY POINT\nONLINE & OFFLINE BATCHES",
      subtitle: "CLASS 6TH TO 12TH (CBSE & UP BOARD) • EVENING BATCHES",
      cta: "ENROLL FOR BATCHES",
      link: "/admissions",
      order: 1
    },
    {
      id: 'default-slide-2',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1600',
      title: "SURYODAY COMPETITION CLASSES\nGOVT EXAM PREPARATION",
      subtitle: "SSC • UP POLICE • RAILWAY • ARMY • STATE COMPETITIONS",
      cta: "EXPLORE COMPETITION COURSES",
      link: "/academics",
      order: 2
    },
    {
      id: 'default-slide-3',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1600',
      title: "SURYODAY COMPUTER CLASSES\nPRACTICAL DIGITAL TRAINING",
      subtitle: "CCC CERTIFICATION • ADCA DIPLOMA • TALLY ACCOUNTING",
      cta: "VIEW COMPUTER COURSES",
      link: "/facilities",
      order: 3
    }
  ];

  // Compute final slides list - automatically prepends Admission Open slide if active campaign exists
  const slides = useMemo(() => {
    let list: HeroSlide[] = dbSlides.length > 0 ? [...dbSlides] : defaultSlides;

    if (activeCampaign && activeCampaign.isActive) {
      const admissionSlide: HeroSlide = {
        id: `auto-admission-banner-${activeCampaign.id}`,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600',
        title: activeCampaign.title ? `${activeCampaign.title.toUpperCase()}\nSESSION ${activeCampaign.academicYear}` : `ADMISSIONS OPEN FOR SESSION\n${activeCampaign.academicYear}`,
        subtitle: `OFFICIAL ANNOUNCEMENT • ONLINE APPLICATIONS OPEN`,
        cta: `APPLY ONLINE NOW`,
        link: '/admissions',
        order: -1
      };
      list = [admissionSlide, ...list];
    }

    return list;
  }, [dbSlides, activeCampaign]);

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);


  return (
    <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] w-full overflow-hidden bg-slate-900 flex-none border-b border-gray-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-10"
        >
          <div className="absolute inset-0 bg-crhs-navy/60 mix-blend-multiply z-10" />
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            src={formatGoogleDriveUrl(slides[current].image)}
            alt="Hero"
            className="h-full w-full object-cover grayscale opacity-80"
          />
          <div className="absolute inset-0 z-20 flex items-center px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-crhs-gold font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] mb-4 block drop-shadow-md"
              >
                {slides[current].subtitle}
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight uppercase text-white mb-6 sm:mb-8 whitespace-pre-line drop-shadow-lg break-words max-w-full"
              >
                {slides[current].title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Link to={slides[current].link} className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="shadow-lg w-full sm:w-auto py-4 sm:py-3 text-sm sm:text-base h-auto">
                    {slides[current].cta} <span className="ml-2 text-crhs-navy">→</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
