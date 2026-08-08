import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MAP_LANGUAGES, MAP_COPY } from './highlightsConfig';

// Illustration asset: a jigsaw-piece map of Africa with per-region location
// pins and a storybook child character, sourced from the design reference
// screenshot with its baked-in text painted out (see the reference's own
// "Languages Map" / "See the languages..." copy — reproduced below as real,
// live text rather than pixels, so it stays screen-reader accessible and
// editable in one place instead of trapped inside an image).
const MAP_ILLUSTRATION = '/images/languages-map-illustration.png';

export default function LanguagesMapHighlightCard() {
  return (
    <div className="home-card-lift" style={{
      background: '#FFF3C4', borderRadius: 20, padding: 28,
      display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden',
    }}>
      <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: 'var(--navy)', margin: '0 0 12px' }}>
        {MAP_COPY.title}
      </h3>
      <p style={{ fontFamily: 'Nunito Sans', fontWeight: 700, fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, color: 'var(--navy)', margin: '0 0 10px' }}>
        {MAP_COPY.tagline}
      </p>
      <p style={{ fontFamily: 'Nunito Sans', fontSize: 15, lineHeight: 1.7, color: '#4B5A72', margin: '0 0 14px' }}>
        {MAP_COPY.body}
      </p>
      <Link
        to="/library"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--sky-blue)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', marginBottom: 20,
        }}
      >
        Explore map <ArrowRight size={14} />
      </Link>

      {/* Real illustration (jigsaw-piece Africa map + pins + character),
          not a decorative emoji/shape substitute — sourced language list
          (highlightsConfig → BOOK_LANGUAGES) still drives the alt text so
          the image stays truthful to what the Library page actually supports. */}
      <img
        src={MAP_ILLUSTRATION}
        alt={`Illustrated map of Africa with location pins marking supported languages, including ${MAP_LANGUAGES.slice(0, 6).join(', ')}, and a child pointing at the map`}
        style={{
          marginTop: 'auto', width: '100%', aspectRatio: '798 / 513',
          objectFit: 'cover', objectPosition: 'center 30%',
          borderRadius: 16, display: 'block',
        }}
      />
    </div>
  );
}
