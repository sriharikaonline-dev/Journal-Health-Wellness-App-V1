import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { Blog, SurveyQuestion } from '../lib/types';
import { getBlogs, getSurveyQuestions, submitSurveyResponse } from '../lib/data';
import { accentClasses } from '../lib/utils';
import { routeToHash } from '../lib/router';
import { BlogCard } from '../components/BlogCard';
import { Blobs } from '../components/Blobs';
import { LoadingState } from '../components/ui';

const FACES = [
  { value: 1, emoji: '😣', label: 'Really tough', color: 'hotpink' as const },
  { value: 2, emoji: '😕', label: 'Not great', color: 'hotpink' as const },
  { value: 3, emoji: '😐', label: 'Okay', color: 'sunny' as const },
  { value: 4, emoji: '🙂', label: 'Pretty good', color: 'teal' as const },
  { value: 5, emoji: '😄', label: 'Great!', color: 'teal' as const },
];

export function SurveyPage() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getSurveyQuestions(), getBlogs()]).then(([q, b]) => {
      if (!active) return;
      setQuestions(q);
      setBlogs(b);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const total = questions.length;
  const current = questions[step];
  const progress = total ? Math.round((step / total) * 100) : 0;

  const pick = (qid: string, value: number) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
  };

  const next = () => {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const recommended = useMemo(() => {
    if (!done) return [];
    // rank categories by answer (lower score => higher need, but also surface
    // any category the user engaged with)
    const scored = questions
      .map((q) => ({
        slug: q.category_slug ?? '',
        score: answers[q.id] ?? 0,
      }))
      .filter((x) => x.slug);

    // sort by ascending score (most-needed first), tie-break by question order
    scored.sort((a, b) => a.score - b.score);

    const orderedSlugs = scored.map((s) => s.slug);

    // map blogs to categories, preserving need order, then dedupe
    const byCat = new Map<string, Blog[]>();
    for (const b of blogs) {
      const slug = b.category?.slug;
      if (!slug) continue;
      if (!byCat.has(slug)) byCat.set(slug, []);
      byCat.get(slug)!.push(b);
    }

    const picks: Blog[] = [];
    for (const slug of orderedSlugs) {
      const list = byCat.get(slug);
      if (!list) continue;
      for (const b of list) {
        if (picks.length >= 6) break;
        if (!picks.find((p) => p.id === b.id)) picks.push(b);
      }
      if (picks.length >= 6) break;
    }
    // fill remaining with featured if needed
    if (picks.length < 4) {
      for (const b of blogs) {
        if (picks.length >= 6) break;
        if (!picks.find((p) => p.id === b.id) && b.featured) picks.push(b);
      }
    }
    return picks;
  }, [done, answers, questions, blogs]);

  const finish = () => {
    const cats = questions
      .map((q) => ({
        slug: q.category_slug ?? '',
        score: answers[q.id] ?? 0,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map((x) => x.slug)
      .filter(Boolean);

    setDone(true);
    submitSurveyResponse({
      categories: cats,
      scores: answers,
      recommended_blogs: recommended.map((b) => b.id),
    }).catch(() => {});
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  if (loading) {
    return (
      <div className="section py-16">
        <LoadingState label="Getting your check-in ready…" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="relative overflow-hidden bg-hero-grid">
        <Blobs />
        <div className="section relative py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip bg-sunny-100 text-sunny-700 mx-auto">
              <Sparkles className="h-4 w-4" />
              You did it
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-navy-900 sm:text-5xl">
              Here's what we picked <span className="gradient-text">for you</span>
            </h1>
            <p className="mt-4 text-lg text-navy-700">
              Based on your check-in, these reads are a gentle place to start.
              Pick whatever calls to you — there's no wrong order.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-navy-700 shadow-soft backdrop-blur">
              <Check className="h-4 w-4 text-teal-600" />
              Remember: You Got This.
            </div>
          </div>

          {recommended.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((b, i) => (
                <BlogCard key={b.id} blog={b} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-navy-600">
              Explore all blogs while we gather more picks for you.
            </p>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <button onClick={restart} className="btn btn-ghost">
              <RotateCcw className="h-4 w-4" />
              Retake check-in
            </button>
            <a href={routeToHash({ name: 'blogs' })} className="btn btn-pink">
              Browse all blogs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="section py-16">
        <p className="text-center text-navy-600">
          No survey questions found yet.
        </p>
      </div>
    );
  }

  const answered = answers[current.id] !== undefined;
  const a = accentClasses('teal');

  return (
    <div className="relative overflow-hidden bg-hero-grid">
      <Blobs />
      <div className="section relative py-12 sm:py-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip bg-hotpink-100 text-hotpink-700 mx-auto">
            <ClipboardList className="h-4 w-4" />
            Wellness Check-In
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-navy-900 sm:text-4xl">
            Let's check in with you
          </h1>
          <p className="mt-3 text-navy-600">
            A few gentle questions. No right answers. About 2 minutes.
          </p>
        </div>

        {/* Progress */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex items-center justify-between text-xs font-bold text-navy-500">
            <span>
              Question {step + 1} of {total}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-navy-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-hotpink-500 to-sunny-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          key={current.id}
          className="card mx-auto mt-8 max-w-2xl animate-pop-in p-6 sm:p-8"
        >
          <h2 className="text-center text-2xl font-extrabold text-navy-900 sm:text-3xl">
            {current.question}
          </h2>
          {current.prompt && (
            <p className="mt-2 text-center text-navy-500">{current.prompt}</p>
          )}

          <div className="mt-7 grid grid-cols-5 gap-2 sm:gap-3">
            {FACES.map((f) => {
              const picked = answers[current.id] === f.value;
              const fa = accentClasses(f.color);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => pick(current.id, f.value)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border-2 px-1 py-4 transition-all duration-200 ${
                    picked
                      ? `${fa.border} ${fa.bgSoft} scale-105 shadow-soft`
                      : 'border-navy-100 bg-white hover:border-navy-200 hover:-translate-y-0.5'
                  }`}
                  aria-pressed={picked}
                  aria-label={f.label}
                >
                  <span
                    className={`text-3xl transition-transform duration-200 sm:text-4xl ${
                      picked ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {f.emoji}
                  </span>
                  <span
                    className={`text-center text-[10px] font-bold leading-tight sm:text-xs ${
                      picked ? fa.text : 'text-navy-500'
                    }`}
                  >
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-xs font-bold text-navy-400">
              {answered ? 'Got it!' : 'Pick a face to continue'}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={!answered}
              className={`btn btn-primary ${a.ring} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {step === total - 1 ? (
                <>
                  See my picks
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-navy-400">
          Your answers stay anonymous. We only use them to suggest reads and spot
          what topics young people need most.
        </p>
      </div>
    </div>
  );
}
