import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroNavbar from './HeroNavbar';
import HeroSlide from './HeroSlide';
import HeroStatsBar from './HeroStatsBar';
import { heroSlides } from './heroSlides';
import { HERO_SLIDER_AUTOPLAY_MS } from '../../../config/rules';

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function HeroSection() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setSlide(([current]) => {
      const dir = next > current || (current === heroSlides.length - 1 && next === 0) ? 1 : -1;
      return [(next + heroSlides.length) % heroSlides.length, dir];
    });
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return undefined;
    timerRef.current = setInterval(goNext, HERO_SLIDER_AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, goNext]);

  const slide = heroSlides[index];

  return (
    <section className="bg-cream pb-14 pt-3 sm:pb-16">
      <div
        className="mx-auto max-w-[1400px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* Big rounded card floating on the cream backdrop */}
        <div className="relative overflow-hidden rounded-[32px] bg-white shadow-card-hover">
          <HeroNavbar />

          <div className="relative h-[640px] sm:h-[560px] lg:h-[500px] xl:h-[540px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <HeroSlide slide={slide} active />
              </motion.div>
            </AnimatePresence>

            {/* Slider arrows */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-card transition hover:scale-105 hover:bg-cream sm:flex sm:left-5"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-card transition hover:scale-105 hover:bg-cream sm:flex sm:right-5"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>

            {/* Pagination dots */}
            <div className="absolute bottom-11 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm backdrop-blur-sm">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-green' : 'w-2 bg-charcoal/20 hover:bg-charcoal/35'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <HeroStatsBar />
      </div>
    </section>
  );
}
