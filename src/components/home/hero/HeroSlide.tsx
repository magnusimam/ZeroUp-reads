import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { HeroSlideData } from './heroSlides';
import FloatingDecor from './FloatingDecor';

interface HeroSlideProps {
  slide: HeroSlideData;
  active: boolean;
}

export default function HeroSlide({ slide, active }: HeroSlideProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-bleed illustration — the slide IS the picture, content sits on top of it */}
      <motion.img
        src={slide.illustration}
        alt={slide.illustrationAlt}
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[70%_center]"
        loading={active ? 'eager' : 'lazy'}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: 'easeOut' }}
      />

      {/* Light cream wash so dark text stays legible over the left of the
          illustration, while the artwork itself stays fully bright on the
          right — a dark scrim read as "premium/serious"; this reads warmer
          and more child-friendly (see ENGINEERING_PRINCIPLES_TRACKER.md). */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,251,240,0.97) 0%, rgba(255,251,240,0.88) 32%, rgba(255,251,240,0.55) 55%, rgba(255,251,240,0.15) 72%, rgba(255,251,240,0) 85%)',
        }}
      />
      {/* Decor confined to the picture's own side, clear of the text column */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] sm:block">
        <FloatingDecor />
      </div>

      {/* Content column, overlaid on the picture */}
      <div className="relative z-10 flex h-full items-center px-6 py-10 sm:px-10 lg:px-14">
        <div className="w-full min-w-0 max-w-[560px]">
          <h1 className="font-nunito text-[30px] font-extrabold leading-[1.14] text-navy sm:text-[40px] lg:text-[48px]">
            {slide.headingLines.map((line, i) => (
              <span key={i} className="block">
                {line.map((seg, j) => (
                  <span key={j} className={seg.accent ? 'text-green' : undefined}>
                    {seg.text}{' '}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="mt-4 max-w-md font-nunito-sans text-base text-charcoal/70 sm:mt-5 sm:text-lg">
            {slide.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.04, y: 0 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                to={slide.primaryCta.to}
                tabIndex={active ? 0 : -1}
                className="flex h-[48px] items-center gap-2 rounded-full bg-green px-5 font-nunito text-sm font-bold text-white shadow-card transition hover:shadow-card-hover sm:h-[52px] sm:px-6 sm:text-[15px]"
              >
                <BookOpen size={18} strokeWidth={2.5} />
                {slide.primaryCta.label}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to={slide.secondaryCta.to}
                tabIndex={active ? 0 : -1}
                className="flex h-[48px] items-center gap-2 rounded-full border-2 border-coral/50 bg-white px-5 font-nunito text-sm font-bold text-coral shadow-sm transition hover:border-coral hover:bg-coral/5 sm:h-[52px] sm:px-6 sm:text-[15px]"
              >
                <Search size={18} strokeWidth={2.5} />
                {slide.secondaryCta.label}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
