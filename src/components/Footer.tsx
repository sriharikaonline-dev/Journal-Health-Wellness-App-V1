import { useEffect, useState } from 'react';
import { Heart, Mail, Instagram, HeartHandshake } from 'lucide-react';
import type { Route } from '../lib/router';
import { routeToHash } from '../lib/router';
import { getSiteSettings } from '../lib/data';
import type { SiteSettings } from '../lib/types';

const cols: { heading: string; links: { label: string; route: Route }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', route: { name: 'home' } },
      { label: 'Wellness Check-In', route: { name: 'survey' } },
      { label: 'Blogs', route: { name: 'blogs' } },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Your Body', route: { name: 'body' } },
      { label: 'Find Your Path', route: { name: 'careers' } },
      { label: 'About Us', route: { name: 'about' } },
      { label: 'Privacy Policy', route: { name: 'privacy' } },
      { label: 'Team Sign-In', route: { name: 'admin-signin' } },
    ],
  },
];

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((s) => active && setSettings(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const email = settings?.contact.email ?? 'hello@myjournal.org';
  const instagram = (settings?.contact.instagram ?? '').trim();
  return (
    <footer className="mt-20 bg-navy-900 text-navy-100">
      <div className="section py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 via-hotpink-500 to-sunny-400 text-white">
                <Heart className="h-5 w-5" fill="white" />
              </span>
              <div className="leading-tight">
                <div className="font-display text-lg font-extrabold text-white">
                  MY Journal
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  You Got This
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-navy-200">
              An uplifting wellness companion built by the Medical Youth Journal
              team — helping young minds check in, learn, and grow.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.heading}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sunny-300">
                {c.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={routeToHash(l.route)}
                      className="text-sm font-semibold text-navy-200 transition-colors hover:text-white hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-hotpink-300">
              Stay Connected
            </h4>
            <p className="mt-4 text-sm text-navy-200">
              Reach out — we read every message.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={`mailto:${email}`}
                className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-white transition-colors hover:bg-teal-500"
                aria-label="Email us"
              >
                <Mail className="h-5 w-5" />
              </a>
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-white transition-colors hover:bg-hotpink-500"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
              <a
                href={routeToHash({ name: 'about' })}
                className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-white transition-colors hover:bg-sunny-400 hover:text-navy-900"
                aria-label="About"
              >
                <HeartHandshake className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-navy-800 pt-6 text-sm text-navy-300 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Medical Youth Journal. Made with care
            for young minds.
          </p>
          <p className="flex items-center gap-1.5">
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
