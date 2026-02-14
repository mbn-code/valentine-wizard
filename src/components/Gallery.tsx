"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isTrackUnlocked, getTimeUntil } from '@/utils/date';
import { Clock } from 'lucide-react';
import ScratchOffImage from './ScratchOffImage';
import Lightbox from './Lightbox';
import { useValentine } from '@/utils/ValentineContext';

const LiveCountdown = ({ day, hour = 0 }: { day: number, hour?: number }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(day, hour));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntil(day, hour));
    }, 1000);
    return () => clearInterval(timer);
  }, [day, hour]);

  return (
    <div className="flex gap-1 text-[10px] font-mono font-bold text-valentine-soft">
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
};

const Gallery = () => {
  const { config } = useValentine();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!config) return null;

  const imagesDay12 = config.galleryImages?.day12 || [
    "IMG_1254.JPEG", "IMG_1290.JPEG", "IMG_1292.JPEG", "IMG_1307.JPEG", "IMG_2104.JPG", 
    "IMG_2139.JPG", "IMG_2140.JPEG", "IMG_3117.JPEG", "IMG_3119.JPG", "IMG_3122.JPEG", 
    "IMG_3436.JPEG", "IMG_5365.JPG", "IMG_5383.JPG", "IMG_6995.JPG", "IMG_8156.JPG", 
    "IMG_8161.JPG", "IMG_8165.JPG", "IMG_8172.JPG", "IMG_8183.JPG", "IMG_8190.JPG", 
    "lp_image-1.JPEG", "lp_image-2.JPEG", "lp_image.JPEG"
  ];
  const imagesDay13 = config.galleryImages?.day13 || [
    "IMG_0638.jpeg", "IMG_0639.jpeg", "IMG_0643.jpeg", "IMG_0647.jpeg", "IMG_0663.jpeg", 
    "IMG_0665.jpeg", "IMG_0712.jpeg", "IMG_0724.jpeg", "IMG_0746.jpeg", "IMG_0799.jpeg", 
    "IMG_0807.jpeg", "IMG_0929.jpeg", "IMG_0948.jpeg", "IMG_1004.jpeg", "IMG_1019.jpeg", 
    "IMG_1134.jpeg", "IMG_1135.jpeg", "IMG_1137.jpeg", "IMG_1140.jpeg", "IMG_1250.jpeg", 
    "IMG_1257.jpeg", "IMG_2527.jpeg", "lp_image.jpeg"
  ];
  const imagesDay14 = config.galleryImages?.day14 || [
    "IMG_0666.jpeg", "IMG_0746.jpeg", "IMG_0767.jpeg", "IMG_0785.jpeg", "IMG_0929.jpeg", 
    "IMG_0961.jpeg", "IMG_0987.jpeg", "IMG_1023.jpeg", "IMG_1135.jpeg", "IMG_1140.jpeg", 
    "IMG_1225.jpeg", "IMG_1239.jpeg", "IMG_1395.jpeg", "IMG_1410.jpeg", "IMG_1725.jpeg", 
    "IMG_1727.jpeg", "IMG_1970.jpeg", "IMG_2461.jpeg"
  ];

  const allSections = [
    { day: 12, images: imagesDay12, label: "Part 1: The Beginning", folder: "day1" },
    { day: 13, images: imagesDay13, label: "Part 2: Our Journey", folder: "day2" },
    { day: 14, images: imagesDay14, label: "Part 3: Today & Forever", folder: "day3" },
  ];

  const unlockedImages: { src: string; id: string }[] = allSections.flatMap((section) => 
    isTrackUnlocked(section.day) 
      ? section.images.map((src, idx) => ({ 
          src: src.startsWith('http') ? src : `/assets/images/${section.folder}/${src}`,
          id: `gallery_${section.day}_${idx}`
        })) 
      : []
  );

  const handleImageClick = (id: string) => {
    const index = unlockedImages.findIndex(img => img.id === id);
    if (index !== -1) setLightboxIndex(index);
  };

  return (
    <div className="mt-12 space-y-12">
      <h2 className="text-4xl md:text-5xl font-bold text-valentine-red text-center font-sacramento">Our Memories</h2>
      
      {allSections.map((section) => {
        const unlocked = isTrackUnlocked(section.day);
        if (section.images.length === 0 && unlocked) return null;

        return (
          <div key={section.day} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-valentine-pink/30" />
              <h3 className="text-valentine-soft text-sm font-bold uppercase tracking-widest">{section.label}</h3>
              <div className="h-[1px] flex-grow bg-valentine-pink/30" />
            </div>

            {unlocked ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {section.images.map((src, index) => {
                  const fullSrc = src.startsWith('http') ? src : `/assets/images/${section.folder}/${src}`;
                  const id = `gallery_${section.day}_${index}`;
                  return (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="break-inside-avoid cursor-pointer"
                      onClick={() => handleImageClick(id)}
                    >
                      <ScratchOffImage
                        src={fullSrc}
                        alt={`Memory ${index + 1}`}
                        id={id}
                        borderRadius="12px"
                        chromeColor="#F7CAC9"
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 bg-white/30 backdrop-blur-sm border-2 border-dashed border-valentine-pink/30 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <Clock size={48} className="text-valentine-soft animate-pulse" />
                <div>
                  <p className="text-lg font-bold text-valentine-red">Locked</p>
                  <LiveCountdown day={section.day} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Lightbox
        images={unlockedImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(prev => prev !== null ? (prev - 1 + unlockedImages.length) % unlockedImages.length : null)}
        onNext={() => setLightboxIndex(prev => prev !== null ? (prev + 1) % unlockedImages.length : null)}
      />
    </div>
  );
};

export default Gallery;
