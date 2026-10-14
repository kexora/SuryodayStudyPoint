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
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-12">
        {dynamicCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-2",
              getRadiusClass(),
              activeCat === cat 
                ? "border-crhs-navy bg-crhs-navy text-white shadow-md scale-105" 
                : "border-slate-200 bg-white text-slate-600 hover:border-crhs-gold hover:text-crhs-navy"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-slate-500 py-12">Loading gallery...</div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-slate-500 py-12">No images found for this category.</div>
      )}

      {/* Image Grid */}
      <motion.div 
        layout 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
      >
        <AnimatePresence>
          {filtered.map(img => (
            <motion.figure
              layout
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key={img.id}
              itemProp="image" 
              itemScope 
              itemType="https://schema.org/ImageObject"
              onClick={() => setSelectedImage(img)}
              className={cn(
                "relative m-0 aspect-[4/3] overflow-hidden group border border-slate-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300",
                getRadiusClass()
              )}
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
