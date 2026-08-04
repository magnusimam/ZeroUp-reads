import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/* ── PROMO BANNER SLIDES ──────────────────────────────────── */
 const bannerSlides = [
  {
    id: 1, 
    tag: "Launch Announcement",
    headline: "ZeroUp Reads is HERE",
    subtext: "African language books for every child - free, online, and growing every week.",
    cta:"Start Reading",
    ctaLink:"/library",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80",
  },
   {
    id: 2, 
    tag: "📚 New This Month",
    headline: "6 New Books Added in Yoruba, Igbo and Swahili",
    subtext: "Fresh stories for beginner, intermediate, and advanced readers- go explore!",
    cta:"Browse the Library",
    ctaLink:"/library",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
  },
   {
    id: 3, 
    tag: "Our Mission",
    headline: "ZeroUp Reads is HERE",
    subtext: "Every Child Deserves a Book in their Language.",
    cta:"We are closing Africa's literacy gap - one mother-tongue story at a time",
    ctaLink:"/about",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
  },
   {
    id: 4, 
    tag: "AI Translation",
    headline: "Any Book. Any African Language, Instantly",
    subtext: "Our Ai translation tool can convert any book into Hausa, Yoruba, Igbo, and Swahili and more.",
    cta:"See How it Works",
    ctaLink:"/register",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
  },
];

export default function AnnouncementSlider() {
  return (
    <div className="w-full relative">
      <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation={true}
      loop={true}
      className="w-full"
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-72 md:h-96 overflow-hidden">
              {/* BACKGROUND IMAGE */}
              <img
               src={slide.image} 
               alt={slide.headline}
               className="absolute inset-0  w-full h-full object-cover" />
               {/*Dark overlay so text is readable*/}
               <div className="absolute inset-0 bg-black/55" />

               {/* Content */}
                <div className='relative z-10 h-full flex items-center px-8 md:px-16'>
                  <div className='max-w-2xl'>
                    {/* TAG */}
                    <span className="inline-block bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                      {slide.tag}
                    </span>

                    {/* HEADLINE */}
                    <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
                      {slide.headline}
                    </h2>


                    {/* SUBTEXT */}
                    <p className="text-slate-200 text-sm md:text-base mb-6 max-w-lg">
                      {slide.subtext}
                    </p>


                    {/* CTA BUTTON */}
                    <Link
                      to={slide.ctaLink}
                      className="inline-block px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-lg transition-colors text-sm"       
                    >
                      {slide.cta} 
                    </Link>
                  </div>
                </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom dot styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #ffffff !important;
          background: rgba(0,0,0,0.3);
          width: 36px !important;
          height: 36px !important;
          border-radius: 50%;
          padding: 8px;
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: bold;
        }
        .swiper-pagination-bullet-active {
          background: #f59e0b !important;
        }
        .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}
