import { useEffect, useState } from 'react';
import {
  Heart,
  Sparkles,
  ClipboardList,
  BookOpen,
  PersonStanding,
  Compass,
  ArrowRight,
  Star,
  Smile,
  Quote,
} from 'lucide-react';
import type { Blog, Category, SiteSettings } from '../lib/types';
import { getBlogs, getCategories, getSiteSettings } from '../lib/data';
import { accentClasses } from '../lib/utils';
import { categoryIcon } from '../lib/icons';
import { routeToHash } from '../lib/router';
import { BlogCard } from '../components/BlogCard';
import { SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

const features = [
  {
    icon: ClipboardList,
    accent: 'hotpink' as const,
    route: { name: 'survey' as const },
    cta: 'Take the check-in',
  },
  {
    icon: BookOpen,
    accent: 'teal' as const,
    route: { name: 'blogs' as const },
    cta: 'Read the blog',
  },
  {
    icon: PersonStanding,
    accent: 'sunny' as const,
    route: { name: 'body' as const },
    cta: 'Explore your body',
  },
  {
    icon: Compass,
    accent: 'navy' as const,
    route: { name: 'careers' as const },
    cta: 'Find your path',
  },
];

export function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getBlogs(), getCategories(), getSiteSettings()]).then(
      ([b, c, s]) => {
        if (!active) return;
        setBlogs(b.filter((x) => x.featured).slice(0, 3));
        setCategories(c);
        setSettings(s);
        const list = s.home.affirmations;
        setAffirmation(list[Math.floor(Math.random() * list.length)] ?? '');
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const h = settings?.home;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-grid">
        <Blobs />
        <div className="section relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div className="animate-fade-up">
            <span className="chip bg-white/80 text-navy-800 shadow-soft backdrop-blur">
              <Sparkles className="h-4 w-4 text-sunny-500" />
              {h?.heroEyebrow ?? 'Welcome to MY Journal'}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-navy-900 sm:text-5xl lg:text-6xl">
              {h?.heroTitle ?? 'Your wellness'}
              <br />
              <span className="gradient-text">{h?.heroHighlight ?? 'cheerleader'}</span>
              <span className="text-navy-900"> {h?.heroTail ?? 'in your pocket.'}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-700">
              {h?.heroSubtitle ??
                "Check in with how you're feeling, get blogs that actually help, learn how your body works, and explore a future in medicine. Built by young people, for young people."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={routeToHash({ name: 'survey' })} className="btn btn-pink">
                <ClipboardList className="h-5 w-5" />
                Start Your Check-In
              </a>
              <a href={routeToHash({ name: 'blogs' })} className="btn btn-ghost">
                <BookOpen className="h-5 w-5 text-teal-600" />
                Browse Blogs
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-soft backdrop-blur sm:max-w-md">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-hotpink-100 text-hotpink-600">
                <Quote className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-navy-700">
                <span className="text-navy-500">Today's reminder:</span>{' '}
                {affirmation}
              </p>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-pop-in lg:justify-self-end">
            <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
              <div className="card mt-8 rotate-[-4deg] p-5 transition-transform hover:rotate-0">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-600">
                  <Smile className="h-6 w-6" />
                </div>
                <p className="mt-3 font-display text-sm font-extrabold text-navy-900">
                  Feeling overwhelmed?
                </p>
                <p className="mt-1 text-xs text-navy-600">
                  We'll point you to the calm.
                </p>
              </div>
              <div className="card p-5 rotate-[3deg] transition-transform hover:rotate-0">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-hotpink-100 text-hotpink-600">
                  <Heart className="h-6 w-6" fill="currentColor" />
                </div>
                <p className="mt-3 font-display text-sm font-extrabold text-navy-900">
                  You belong here.
                </p>
                <p className="mt-1 text-xs text-navy-600">No judgement, ever.</p>
              </div>
              <div className="card rotate-[5deg] p-5 transition-transform hover:rotate-0">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-sunny-100 text-sunny-600">
                  <Star className="h-6 w-6" fill="currentColor" />
                </div>
                <p className="mt-3 font-display text-sm font-extrabold text-navy-900">
                  Small steps win.
                </p>
                <p className="mt-1 text-xs text-navy-600">Progress, not perfect.</p>
              </div>
              <div className="card mt-8 rotate-[-3deg] p-5 transition-transform hover:rotate-0">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy-100 text-navy-700">
                  <Compass className="h-6 w-6" />
                </div>
                <p className="mt-3 font-display text-sm font-extrabold text-navy-900">
                  Dream medical?
                </p>
                <p className="mt-1 text-xs text-navy-600">Find your role here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* motto banner */}
        <div className="section relative pb-12">
          <div className="rounded-3xl bg-navy-900 px-6 py-6 text-center shadow-soft sm:px-10 sm:py-8">
            <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              {h?.motto ?? 'You Got This. We mean it.'}
            </p>
            <p className="mt-1 text-sm text-navy-200">
              {h?.mottoSub ??
                "Whatever you're carrying, you don't have to carry it alone."}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section py-16 sm:py-20">
        <SectionHeader
          eyebrow={h?.featuresEyebrow ?? "What's inside"}
          title={h?.featuresTitle ?? 'Four ways MY Journal has your back'}
          subtitle={
            h?.featuresSubtitle ??
            'Pick a starting point — or let the check-in choose one for you.'
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const a = accentClasses(f.accent);
            const blurb = h?.features?.[i];
            return (
              <a
                key={i}
                href={routeToHash(f.route)}
                className="card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl ${a.bgSoft} ${a.text} transition-transform group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <f.icon className="h-7 w-7" strokeWidth={2.2} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-navy-900">
                  {blurb?.title ?? `Feature ${i + 1}`}
                </h3>
                <p className="mt-2 flex-1 text-sm text-navy-600">
                  {blurb?.desc ?? ''}
                </p>
                <span
                  className={`mt-4 flex items-center gap-1.5 text-sm font-bold ${a.text}`}
                >
                  {f.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Topics */}
      {categories.length > 0 && (
        <section className="section py-4 sm:py-8">
          <SectionHeader
            eyebrow={h?.topicsEyebrow ?? 'We talk about'}
            title={h?.topicsTitle ?? 'Topics we cover'}
            subtitle={
              h?.topicsSubtitle ??
              "Whatever you're working through, there's a place to start here."
            }
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((c) => {
              const a = accentClasses(c.accent);
              const Icon = categoryIcon(c.icon);
              return (
                <a
                  key={c.id}
                  href={routeToHash({ name: 'blogs' })}
                  className={`group flex items-center gap-2.5 rounded-full border-2 ${a.border} ${a.bgSoft} px-4 py-2.5 font-bold ${a.text} transition-all hover:-translate-y-0.5 hover:shadow-soft`}
                >
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {c.name}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured blogs */}
      {blogs.length > 0 && (
        <section className="section py-16 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeader
              align="left"
              eyebrow={h?.featuredEyebrow ?? 'From our team'}
              title={h?.featuredTitle ?? 'Featured reads'}
              subtitle={h?.featuredSubtitle ?? 'Hand-picked articles to lift your day.'}
            />
            <a
              href={routeToHash({ name: 'blogs' })}
              className="btn btn-ghost shrink-0"
            >
              See all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-500 via-hotpink-500 to-sunny-400 p-8 text-center shadow-soft sm:p-14">
          <div className="absolute inset-0 bg-bubble-fade opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              {h?.ctaTitle ?? 'One small step is still a step.'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              {h?.ctaSubtitle ??
                'Take the 2-minute check-in and get personalized reads for where you are right now.'}
            </p>
            <a
              href={routeToHash({ name: 'survey' })}
              className="btn btn-navy mt-7 !bg-white !text-navy-900 hover:!bg-navy-50"
            >
              <ClipboardList className="h-5 w-5" />
              I'm ready — take me to the check-in
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
