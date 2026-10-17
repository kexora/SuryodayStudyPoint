import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';
import { getRadiusClass } from '@/theme.config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ImageWithLoader } from './ui/ImageWithLoader';
import { schoolConfig } from '@/config/schoolConfig';

const categories = ['All', 'Campus', 'Sports', 'Events', 'Classrooms', 'Extracurricular'];

interface GalleryImage {
  id: string;
  url: string;
  cat: string;
  title: string;
  desc: string;
  createdAt?: string;
}

export function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedImages: GalleryImage[] = [];
        snapshot.forEach((doc) => {
          fetchedImages.push({ id: doc.id, ...doc.data() } as GalleryImage);
        });
        setImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Compute dynamic categories: 'All' + all unique categories found in Firestore images
  const dynamicCategories = ['All', ...Array.from(new Set([
    'Campus', 'Sports', 'Events', 'Classrooms', 'Extracurricular',
    ...images.map(img => img.cat).filter(Boolean)
  ]))];

  const filtered = activeCat === 'All' ? images : images.filter(img => img.cat === activeCat);

  return (
    <div itemScope itemType="https://schema.org/ImageGallery">
      {/* Category Filter Pills - Compact, Rounded-Full & Mobile-Friendly */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 px-1">
        {dynamicCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={cn(
              "px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95",
              activeCat === cat 
                ? "border border-crhs-navy bg-crhs-navy text-white shadow-xs ring-1 sm:ring-2 ring-crhs-navy/15" 
                : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-crhs-navy shadow-2xs"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 py-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="aspect-[4/3] rounded-2xl bg-white border border-slate-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-bold text-crhs-navy">No images found for this category.</p>
          <p className="text-xs text-slate-400 mt-1">Switch to 'All' to view other campus photos.</p>
        </div>
      )}

      {/* Image Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6"
      >
        <AnimatePresence>
          {filtered.map(img => (
            <motion.figure
              layout
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              key={img.id}
              itemProp="image" 
              itemScope 
              itemType="https://schema.org/ImageObject"
              onClick={() => setSelectedImage(img)}
              className="relative m-0 aspect-[4/3] overflow-hidden group rounded-2xl border border-slate-200/80 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 bg-slate-100"
            >
              <meta itemProp="name" content={img.title || `${schoolConfig.schoolName} Gallery Image`} />
              <meta itemProp="description" content={img.desc || `A picture from ${schoolConfig.schoolName} campus.`} />
              
              <ImageWithLoader 
                src={img.url} 
                alt={`${img.title} - ${schoolConfig.schoolName}`}
                itemProp="contentUrl"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                containerClassName="w-full h-full bg-slate-100"
              />
              
              {/* Overlay */}
              <figcaption className="absolute inset-0 bg-gradient-to-t from-crhs-navy/90 via-crhs-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-crhs-gold text-xs font-black uppercase tracking-widest">{img.cat}</span>
                    <ZoomIn className="text-white w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight" itemProp="caption">{img.title}</h3>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/90 p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              onClick={() => setSelectedImage(null)}
              aria-label="Close Lightbox"
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn("bg-white overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-2xl relative", getRadiusClass())}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-2/3 h-[40vh] md:h-[70vh] bg-slate-100 relative">
                <ImageWithLoader 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-contain md:object-cover"
                  containerClassName="w-full h-full"
                />
              </div>
              <div className="w-full md:w-1/3 p-6 md:p-10 flex flex-col justify-center bg-crhs-navy text-white overflow-y-auto max-h-[40vh] md:max-h-[70vh] custom-scrollbar">
                <span className="text-crhs-gold text-xs font-black uppercase tracking-widest mb-2 inline-block">
                  {selectedImage.cat}
                </span>
                <h3 className="text-2xl md:text-3xl font-black mb-4">{selectedImage.title}</h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  {selectedImage.desc || `Image related to ${selectedImage.cat} at ${schoolConfig.schoolName}.`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
