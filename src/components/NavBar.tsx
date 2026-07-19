import { useEffect, useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import type { Route } from '../lib/router';
import { routeToHash } from '../lib/router';

const links: { label: string; route: Route }[] = [
  { label: 'Home', route: { name: 'home' } },
  { label: 'Check-In', route: { name: 'survey' } },
  { label: 'Blogs', route: { name: 'blogs' } },
  { label: 'Your Body', route: { name: 'body' } },
  { label: 'Find Your Path', route: { name: 'careers' } },
  { label: 'About', route: { name: 'about' } },
  { label: 'Founders', route: { name: 'founders' } },
];

export function NavBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [route]);

  const isActive = (r: Route) => r.name === route.name;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md shadow-soft'
          : 'bg-white/40 backdrop-blur-sm'
      }`}
    >
      <nav className="section flex h-16 items-center justify-between gap-4 sm:h-18">
        <a
          href={routeToHash({ name: 'home' })}
          className="flex items-center gap-2.5 group"
          aria-label="MY Journal home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 via-hotpink-500 to-sunny-400 text-white shadow-soft transition-transform group-hover:scale-105 group-hover:-rotate-3">
            <Heart className="h-5 w-5" fill="white" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold text-navy-900">
              MY Journal
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-600">
              You Got This
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={routeToHash(l.route)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive(l.route)
                    ? 'bg-navy-900 text-white shadow-soft'
                    : 'text-navy-700 hover:bg-navy-100'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={routeToHash({ name: 'survey' })}
          className="btn btn-pink hidden md:inline-flex !py-2.5 !px-5 text-sm"
        >
          Start Check-In
        </a>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white text-navy-800 shadow-soft md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden">
          <ul className="section flex flex-col gap-1 pb-4 pt-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={routeToHash(l.route)}
                  className={`block rounded-2xl px-4 py-3 text-base font-bold transition-colors ${
                    isActive(l.route)
                      ? 'bg-navy-900 text-white'
                      : 'bg-white text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={routeToHash({ name: 'survey' })}
                className="btn btn-pink mt-2 w-full"
              >
                Start Check-In
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
