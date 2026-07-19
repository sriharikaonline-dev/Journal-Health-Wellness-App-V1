import { useEffect, useState } from 'react';
import { Shield, Lock, Database, Eye, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { SiteSettings } from '../lib/types';
import { getSiteSettings } from '../lib/data';
import { routeToHash } from '../lib/router';
import { SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

export function PrivacyPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((s) => active && setSettings(s));
    return () => {
      active = false;
    };
  }, []);

  const p = settings?.privacy;

  const cards = [
    {
      icon: Eye,
      title: 'What we collect',
      body: p?.whatWeCollect ?? '',
      accent: 'teal' as const,
    },
    {
      icon: CheckCircle2,
      title: 'How we use it',
      body: p?.howWeUseIt ?? '',
      accent: 'hotpink' as const,
    },
    {
      icon: Database,
      title: 'Where it lives',
      body: p?.storage ?? '',
      accent: 'sunny' as const,
    },
    {
      icon: Lock,
      title: 'Your rights',
      body: p?.yourRights ?? '',
      accent: 'navy' as const,
    },
  ];

  const accentMap: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-600',
    hotpink: 'bg-hotpink-100 text-hotpink-600',
    sunny: 'bg-sunny-100 text-sunny-600',
    navy: 'bg-navy-100 text-navy-700',
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-grid">
        <Blobs />
        <div className="section relative py-14 sm:py-20">
          <a
            href={routeToHash({ name: 'home' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-500 transition-colors hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </a>
          <div className="mt-6 max-w-2xl">
            <span className="chip bg-white/80 text-navy-800 shadow-soft backdrop-blur">
              <Shield className="h-4 w-4 text-teal-600" />
              Your privacy
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-navy-900 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-navy-700">
              {p?.intro ??
                'We keep things simple: we only collect what we need to make the site helpful, and we never sell your information.'}
            </p>
            {p?.lastUpdated && (
              <p className="mt-3 text-sm font-semibold text-navy-500">
                Last updated: {p.lastUpdated}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.title} className="card p-6">
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${accentMap[c.accent]}`}
              >
                <c.icon className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <h2 className="mt-4 text-lg font-extrabold text-navy-900">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border-2 border-navy-100 bg-navy-50/50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-hotpink-100 text-hotpink-600">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-navy-900">Questions about your privacy?</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {p?.contactNote ??
                  'Send a message through the Questions chat on any page, or email the address listed in the footer.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section pb-16">
        <SectionHeader
          eyebrow="Not a substitute"
          title="A quick note on medical advice"
          subtitle="MY Journal is a wellness companion, not a replacement for professional medical care. If you are in crisis or need urgent help, please contact a trusted adult or a local emergency service."
        />
      </section>
    </div>
  );
}
