import React from 'react';

// Reuses the Library page's "Order a Book" illustration as a stand-in — no
// dedicated closing-banner artwork has been supplied for Profile yet.
export default function ProfileCTA() {
  return (
    <section className="max-w-content mx-auto w-full px-4 sm:px-6 py-10">
      <div className="relative overflow-hidden rounded-[32px] min-h-[220px] flex items-center">
        <img
          src="/images/order-a-book-illustration.jpg"
          alt="A child happily reading beside a stack of storybooks"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '75% center' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(100deg, #FFE9C7 0%, rgba(255,233,199,0.85) 40%, rgba(255,233,199,0.15) 65%, rgba(255,233,199,0) 80%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 px-8 py-10 max-w-sm">
          <h2 className="font-nunito font-extrabold text-2xl sm:text-3xl leading-tight">
            <span style={{ color: 'var(--navy)' }}>Keep Reading,</span><br />
            <span style={{ color: 'var(--hero-orange)' }}>Keep Dreaming!</span>
          </h2>
          <p className="font-nunito-sans mt-3 text-sm" style={{ color: 'var(--hero-ink)', opacity: 0.75 }}>
            More stories. More languages. A brighter tomorrow. <span aria-hidden="true">♥</span>
          </p>
        </div>
      </div>
    </section>
  );
}
