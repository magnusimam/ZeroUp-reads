import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Gift, Globe, MessageCircle, BookOpen, LucideIcon } from 'lucide-react';
import { heroStats, HeroStat } from './heroSlides';

const ICONS: Record<HeroStat['icon'], LucideIcon> = {
  chat: MessageCircle,
  book: BookOpen,
  globe: Globe,
  ai: Bot,
  gift: Gift,
};

// Each stat gets its own flat icon colour (not a uniform badge) — a distinct
// hue per icon helps early/pre-literate readers tell the stats apart at a
// glance, matching the light multicolor treatment picked over the dark
// navy/gold skin for being more child-friendly (see ENGINEERING_PRINCIPLES_TRACKER.md).
const ICON_COLORS: Record<HeroStat['icon'], string> = {
  chat: 'text-sky-blue',
  book: 'text-green',
  globe: 'text-sky-blue',
  ai: 'text-sky-blue',
  gift: 'text-amber',
};

// Persistent across all hero slides (matches the reference design, where this
// bar stays put while the slide content behind it changes).
export default function HeroStatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      className="relative z-30 mx-3 -mt-8 flex flex-wrap items-center justify-around gap-x-2 gap-y-4 rounded-[24px] border border-charcoal/5 bg-white px-4 py-5 shadow-card-hover sm:-mt-9 sm:px-8 md:mx-8"
    >
      {heroStats.map((stat, i) => {
        const Icon = ICONS[stat.icon];
        return (
          <React.Fragment key={stat.label}>
            {i > 0 && <div className="hidden h-9 w-px bg-charcoal/10 sm:block" />}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
              className="flex items-center gap-2.5 px-1"
            >
              <Icon size={26} className={`shrink-0 ${ICON_COLORS[stat.icon]}`} strokeWidth={2.1} />
              <span className="leading-tight">
                <span className="block font-nunito text-sm font-extrabold text-navy sm:text-base">{stat.value}</span>
                <span className="block font-nunito-sans text-xs text-charcoal/60">{stat.label}</span>
              </span>
            </motion.div>
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
