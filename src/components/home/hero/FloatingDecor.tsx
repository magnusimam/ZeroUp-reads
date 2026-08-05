import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

type DecorKind = 'book' | 'sparkle' | 'butterfly' | 'bird' | 'firefly' | 'plane' | 'letter' | 'star';

interface DecorItem {
  className: string;
  size: number;
  kind: DecorKind;
  floatDelay: number;
  floatDuration: number;
  letter?: string;
}

// Small extra motion accents layered on top of the slide illustrations —
// deliberately kept outside the photo's own artwork (corners/edges only) so
// they read as "premium polish" instead of colliding with the baked-in
// birds/books/sparkles already in the image. Expanded beyond the original
// book/sparkle/butterfly trio (item 6 of the homepage brief: birds, leaves,
// fireflies, sunlight rays, paper airplanes, floating alphabet letters).
const items: DecorItem[] = [
  { className: 'left-[6%] top-[4%]', size: 22, kind: 'sparkle', floatDelay: 0, floatDuration: 2.6 },
  { className: 'right-[4%] top-[10%]', size: 26, kind: 'book', floatDelay: 0.6, floatDuration: 4.2 },
  { className: 'right-[10%] bottom-[8%]', size: 18, kind: 'sparkle', floatDelay: 1.2, floatDuration: 3 },
  { className: 'left-[2%] bottom-[14%]', size: 24, kind: 'butterfly', floatDelay: 0.3, floatDuration: 3.6 },
  { className: 'left-[14%] top-[16%]', size: 20, kind: 'bird', floatDelay: 0.2, floatDuration: 5.5 },
  { className: 'right-[18%] top-[6%]', size: 16, kind: 'bird', floatDelay: 1.4, floatDuration: 6.2 },
  { className: 'left-[22%] bottom-[6%]', size: 14, kind: 'firefly', floatDelay: 0.5, floatDuration: 2.2 },
  { className: 'right-[26%] bottom-[18%]', size: 12, kind: 'firefly', floatDelay: 1.1, floatDuration: 2.8 },
  { className: 'right-[2%] bottom-[30%]', size: 22, kind: 'plane', floatDelay: 0.8, floatDuration: 4.8 },
  { className: 'left-[36%] top-[6%]', size: 18, kind: 'letter', floatDelay: 0.4, floatDuration: 4, letter: 'A' },
  { className: 'right-[38%] top-[14%]', size: 16, kind: 'letter', floatDelay: 1.6, floatDuration: 4.6, letter: 'B' },
  { className: 'left-[46%] bottom-[10%]', size: 16, kind: 'letter', floatDelay: 0.9, floatDuration: 3.8, letter: 'C' },
  { className: 'left-[30%] top-[10%]', size: 12, kind: 'star', floatDelay: 0.2, floatDuration: 2.4 },
  { className: 'right-[14%] top-[22%]', size: 10, kind: 'star', floatDelay: 1, floatDuration: 3.1 },
];

export default function FloatingDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft sunlight rays, top-right */}
      <motion.div
        className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-amber/40 to-transparent blur-2xl"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {items.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute text-amber drop-shadow ${item.className}`}
          animate={
            item.kind === 'sparkle' || item.kind === 'star'
              ? { opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }
              : item.kind === 'firefly'
              ? { opacity: [0.2, 1, 0.2], scale: [0.9, 1.2, 0.9], y: [0, -6, 0] }
              : item.kind === 'bird'
              ? { x: [0, 16, 0], y: [0, -10, 0] }
              : item.kind === 'plane'
              ? { x: [0, 20, 0], y: [0, -16, 0], rotate: [-6, 4, -6] }
              : { y: [0, -10, 0], rotate: item.kind === 'butterfly' ? [-6, 6, -6] : [0, 4, 0] }
          }
          transition={{
            duration: item.floatDuration,
            delay: item.floatDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.kind === 'book' && <BookOpen size={item.size} strokeWidth={2} />}
          {item.kind === 'sparkle' && <Sparkles size={item.size} strokeWidth={2} />}
          {item.kind === 'butterfly' && <span style={{ fontSize: item.size }}>🦋</span>}
          {item.kind === 'bird' && <span style={{ fontSize: item.size }}>🐦</span>}
          {item.kind === 'firefly' && (
            <span style={{ fontSize: item.size, filter: 'drop-shadow(0 0 4px rgba(232,160,32,0.9))' }}>✨</span>
          )}
          {item.kind === 'plane' && <span style={{ fontSize: item.size }}>✈️</span>}
          {item.kind === 'star' && <span style={{ fontSize: item.size }}>⭐</span>}
          {item.kind === 'letter' && (
            <span
              className="flex items-center justify-center rounded-full bg-white/70 font-nunito font-extrabold text-navy shadow-sm"
              style={{ width: item.size + 12, height: item.size + 12, fontSize: item.size * 0.6 }}
            >
              {item.letter}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
