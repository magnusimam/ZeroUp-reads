import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Globe, LogIn, Menu, Star, User, X } from 'lucide-react';
import { useAuth } from '../../../modules/auth/AuthContext';
import { PRIMARY_NAV_LINKS, EXPLORE_MEGA_MENU } from '../../../config/navigation';

const heroNavLinks = PRIMARY_NAV_LINKS;

function ExploreMegaMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex items-center gap-1 py-1 font-nunito text-[15px] font-semibold text-charcoal transition-colors hover:text-green"
      >
        Explore
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute left-1/2 top-[calc(100%+14px)] z-50 w-[480px] max-w-[90vw] -translate-x-1/2 rounded-[20px] border border-charcoal/10 bg-white p-4 shadow-card-hover"
          >
            <div className="grid grid-cols-2 gap-2">
              {EXPLORE_MEGA_MENU.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-2xl p-2.5 transition hover:bg-cream"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-xl">
                    {item.icon}
                  </span>
                  <span>
                    <span className="block font-nunito text-sm font-extrabold text-navy">{item.label}</span>
                    <span className="mt-0.5 block font-nunito-sans text-xs text-charcoal/55">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LANGUAGE_OPTIONS = [
  { code: 'EN', name: 'English' },
  { code: 'YO', name: 'Yoruba' },
  { code: 'IG', name: 'Igbo' },
  { code: 'HA', name: 'Hausa' },
  { code: 'SW', name: 'Swahili' },
];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 rounded-full border border-charcoal/15 bg-white px-3.5 text-sm font-bold text-charcoal transition hover:border-charcoal/30"
      >
        <Globe size={16} strokeWidth={2.25} className="text-sky-blue" />
        {language.code}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close language menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[150px] overflow-hidden rounded-2xl bg-white py-1.5 shadow-card-hover"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={option.code === language.code}
                onClick={() => {
                  setLanguage(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold transition hover:bg-cream ${
                  option.code === language.code ? 'text-green' : 'text-charcoal'
                }`}
              >
                {option.name}
                <span className="text-xs text-charcoal/40">{option.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  if (!user) return null;

  const initial = user.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-full bg-green pl-1.5 pr-3.5 text-sm font-bold text-white transition hover:brightness-95"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-green">
          {initial}
        </span>
        {user.name?.split(' ')[0]}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-2xl bg-white py-1.5 shadow-card-hover">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-cream"
            >
              My Profile
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-charcoal hover:bg-cream"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
                navigate('/');
              }}
              className="block w-full border-t border-cream px-4 py-2.5 text-left text-sm font-semibold text-coral hover:bg-cream"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function HeroNavbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ opacity: 0, y: -16 }}
        animate={{
          opacity: 1,
          y: 0,
          height: scrolled ? 64 : 76,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="sticky top-3 z-40 mx-3 flex items-center justify-between rounded-[28px] bg-white px-4 shadow-nav transition-shadow duration-300 sm:px-6"
        style={{ boxShadow: scrolled ? '0 12px 32px rgba(11,21,38,0.18)' : '0 2px 16px rgba(31,61,110,0.08)' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream">
            <BookOpen size={22} className="text-green" strokeWidth={2.25} />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-nunito text-lg font-extrabold text-navy">
              ZeroUp <span className="text-navy">Reads</span>
            </span>
            <span className="mt-0.5 font-nunito-sans text-[11px] font-medium text-charcoal/50">
              Every Child. Every Language. Every Book.
            </span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden items-center gap-7 lg:flex">
          {heroNavLinks.map((link) =>
            link.mega ? (
              <ExploreMegaMenu key={link.key} />
            ) : link.key === 'home' ? (
              <Link
                key={link.key}
                to={link.to}
                className="relative py-1 font-nunito text-[15px] font-semibold text-green transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-green" />
              </Link>
            ) : (
              <Link
                key={link.key}
                to={link.to}
                className="relative py-1 font-nunito text-[15px] font-semibold text-charcoal transition-colors hover:text-green"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSelector />
          {user ? (
            <AccountMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="flex h-10 items-center gap-1.5 rounded-full border-2 border-charcoal/15 px-4 text-sm font-bold text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-white"
              >
                <User size={16} strokeWidth={2.25} />
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="flex h-10 items-center gap-1.5 rounded-full bg-green px-4 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  <Star size={16} className="text-white" strokeWidth={2.25} fill="currentColor" />
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-cream lg:hidden"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-charcoal"
          >
            <X size={24} />
          </button>
          {heroNavLinks.map((link) => (
            <React.Fragment key={link.key}>
              <Link
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`font-nunito text-2xl font-bold hover:text-green ${
                  link.key === 'home' ? 'text-green' : 'text-navy'
                }`}
              >
                {link.label}
              </Link>
              {link.mega && (
                <div className="flex max-w-xs flex-wrap justify-center gap-2 -mt-3 mb-1">
                  {EXPLORE_MEGA_MENU.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-white px-3 py-1.5 font-nunito-sans text-xs font-bold text-charcoal/75 shadow-sm"
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
          <div className="h-px w-16 bg-charcoal/15" />
          {user ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="font-nunito text-xl font-bold text-green">
              My Profile
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="font-nunito text-xl font-bold text-navy">
                <LogIn size={18} className="mr-2 inline" strokeWidth={2.25} />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-green px-8 py-3 font-nunito text-lg font-bold text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      )}
    </>
  );
}
