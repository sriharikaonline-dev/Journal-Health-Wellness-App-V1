import { useEffect, useState } from 'react';
import {
  Heart,
  Sparkles,
  Users,
  BookOpen,
  Compass,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import type { Founder, SiteSettings } from '../lib/types';
import { getSiteSettings, getFounders } from '../lib/data';
import { routeToHash } from '../lib/router';
import { SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

const valueIcons = [Heart, ShieldCheck, Users, Sparkles];

export function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getSiteSettings(), getFounders()]).then(([s, f]) => {
      if (!active) return;
      setSettings(s);
      setFounders(f);
    });
    return () => {
      active = false;
    };
  }, []);

  const a = settings?.about;
  return (
    <div>
      <section className="relative overflow-hidden bg-hero-grid">
        <Blobs />
        <div className="section relative py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip bg-hotpink-100 text-hotpink-700 mx-auto">
              <Heart className="h-4 w-4" fill="currentColor" />
              {a?.eyebrow ?? 'About MY Journal'}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-navy-900 sm:text-5xl">
              {a?.title ?? "We're here to remind you"}{' '}
              <span className="gradient-text">
                {a?.highlight ?? 'You Got This.'}
              </span>
            </h1>
            <p className="mt-5 text-lg text-navy-700">
              {a?.paragraph ??
                "Medical Youth Journal (MY Journal, for short) is a nonprofit built by young people who believe wellness should feel welcoming — not intimidating. We write about the stuff that actually matters at your age: mood, sleep, food, focus, friendships, and the big question of what to do with your life."}
            </p>
          </div>
          {a?.heroImage && (
            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl shadow-soft">
              <img
                src={a.heroImage}
                alt="Our team"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* What we do */}
      <section className="section py-16 sm:py-20">
        <SectionHeader
          eyebrow={a?.whatWeDoEyebrow ?? 'What we do'}
          title={
            a?.whatWeDoTitle ??
            'A wellness companion, not another thing to stress about'
          }
          subtitle={
            a?.whatWeDoSubtitle ??
            'Four ways we show up for you — all free, all friendly.'
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(a?.whatWeDo ?? []).map((f, i) => {
            const Icon = [Sparkles, BookOpen, Heart, Compass][i] ?? Sparkles;
            return (
              <div key={i} className="card p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-100 text-navy-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-navy-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-navy-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-900 py-16 text-navy-100 sm:py-20">
        <div className="section">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-sunny-400 text-navy-900 mx-auto">
              {a?.valuesEyebrow ?? 'What we believe'}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
              {a?.valuesTitle ?? 'The values behind every page'}
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(a?.values ?? []).map((v, i) => {
              const Icon = valueIcons[i] ?? Heart;
              return (
                <div
                  key={i}
                  className="rounded-3xl bg-navy-800 p-6 transition-transform hover:-translate-y-1"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-white">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-navy-200">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important note */}
      <section className="section py-16 sm:py-20">
        <div className="card mx-auto max-w-2xl border-teal-200 bg-teal-50 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-teal-600" />
          <h2 className="mt-4 text-xl font-extrabold text-navy-900">
            A kind heads-up
          </h2>
          <p className="mt-2 text-navy-700">
            {a?.noteText ??
              "MY Journal shares supportive information and stories — it's not a replacement for professional medical advice, diagnosis, or treatment. If you're struggling, please reach out to a trusted adult, a doctor, or a local support line. Asking for help is one of the bravest things you can do."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-hotpink-500 via-teal-500 to-sunny-400 p-8 text-center shadow-soft sm:p-14">
          <div className="absolute inset-0 bg-bubble-fade opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              {a?.ctaTitle ?? 'Come as you are.'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              {a?.ctaSubtitle ??
                "Start with a check-in, browse a blog, or just look around. There's no wrong first step."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href={routeToHash({ name: 'survey' })}
                className="btn !bg-white !text-navy-900 hover:!bg-navy-50"
              >
                Take the check-in
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={routeToHash({ name: 'blogs' })}
                className="btn !bg-navy-900 !text-white hover:!bg-navy-800"
              >
                Read a blog
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      {founders.length > 0 && (
        <section className="section pb-20">
          <SectionHeader
            eyebrow="The team"
            title="Meet the founders"
            subtitle="The young people who built MY Journal — and keep it kind, honest, and real."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <div
                key={f.id}
                className="card group flex flex-col items-center p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-teal-100 via-hotpink-100 to-sunny-100 ring-4 ring-white shadow-soft">
                  {f.photo_url ? (
                    <img
                      src={f.photo_url}
                      alt={f.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-gradient-to-br from-teal-400 via-hotpink-400 to-sunny-300 text-2xl font-extrabold text-white">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-extrabold text-navy-900">{f.name}</h3>
                <p className="mt-0.5 text-xs font-bold text-teal-600">{f.role}</p>
                <p className="mt-2 text-sm text-navy-600">{f.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <a
              href={routeToHash({ name: 'founders' })}
              className="btn btn-ghost"
            >
              See the founders page
              <ArrowRight className="h-4 w-4" />
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
