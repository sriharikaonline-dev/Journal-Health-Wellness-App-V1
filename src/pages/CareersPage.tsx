import { useEffect, useState } from 'react';
import { Compass, GraduationCap, Sparkles, X, Clock } from 'lucide-react';
import type { MedicalProfession } from '../lib/types';
import { getProfessions } from '../lib/data';
import { accentClasses } from '../lib/utils';
import { LoadingState, SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

const professionEmojis: Record<string, string> = {
  pediatrician: '🧸',
  psychiatrist: '🧠',
  nurse: '🩺',
  surgeon: '🔬',
  'physical-therapist': '💪',
  pharmacist: '💊',
  veterinarian: '🐾',
  paramedic: '🚑',
  'medical-researcher': '🧫',
  nutritionist: '🥗',
};

export function CareersPage() {
  const [professions, setProfessions] = useState<MedicalProfession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MedicalProfession | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let flag = true;
    getProfessions().then((p) => {
      if (!flag) return;
      setProfessions(p);
      setLoading(false);
    });
    return () => {
      flag = false;
    };
  }, []);

  const allSkills = Array.from(
    new Set(professions.flatMap((p) => p.skills)),
  ).sort();

  const filtered =
    filter === 'all'
      ? professions
      : professions.filter((p) => p.skills.includes(filter));

  return (
    <div className="relative overflow-hidden bg-hero-grid">
      <Blobs />
      <div className="section relative py-12 sm:py-16">
        <SectionHeader
          eyebrow="Find your path"
          title="Your future in medicine starts here"
          subtitle="Know you want to help people, but not sure how? Explore medical careers and find the one that fits your spark."
        />

        {/* Skill filter */}
        {!loading && (
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'border-navy-800 bg-navy-800 text-white shadow-soft'
                  : 'border-navy-100 bg-white text-navy-600 hover:-translate-y-0.5'
              }`}
            >
              All paths
            </button>
            {allSkills.slice(0, 10).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-all ${
                  filter === s
                    ? 'border-teal-500 bg-teal-500 text-white shadow-soft'
                    : 'border-teal-200 bg-teal-50 text-teal-700 hover:-translate-y-0.5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-12">
          {loading ? (
            <LoadingState label="Loading careers…" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => {
                const a = accentClasses(p.accent);
                const emoji = professionEmojis[p.slug] ?? '✨';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
                    className="card group flex flex-col p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`grid h-16 w-16 place-items-center rounded-2xl ${a.bgSoft} text-3xl transition-transform group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      {emoji}
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-navy-900">
                      {p.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-navy-600 line-clamp-3">
                      {p.summary}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-navy-500">
                      <GraduationCap className="h-4 w-4" />
                      {p.years} of training
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Encouragement */}
        <div className="mt-16 rounded-3xl bg-navy-900 px-6 py-8 text-center shadow-soft sm:px-10">
          <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Not sure yet? <span className="text-sunny-400">That's okay.</span>
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-navy-200 sm:text-base">
            Most medical professionals changed their minds more than once. Curiosity
            counts more than certainty.
          </p>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <ProfessionModal
          profession={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ProfessionModal({
  profession,
  onClose,
}: {
  profession: MedicalProfession;
  onClose: () => void;
}) {
  const a = accentClasses(profession.accent);
  const emoji = professionEmojis[profession.slug] ?? '✨';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-up" />
      <div
        className="card relative z-10 max-h-[88dvh] w-full max-w-lg animate-pop-in overflow-y-auto px-safe pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative h-32 bg-gradient-to-br ${a.gradient}`}>
          <div className="absolute inset-0 bg-bubble-fade opacity-40" />
          <span className="absolute left-5 top-5 text-5xl">{emoji}</span>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-navy-800 shadow-soft transition-transform hover:scale-110"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <span className={`chip ${a.bgSoft} ${a.text}`}>
            <Compass className="h-4 w-4" />
            Medical Career
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-navy-900 sm:text-3xl">
            {profession.name}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-navy-700">
            {profession.summary}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl ${a.bgSoft} p-4`}>
              <div className={`flex items-center gap-2 ${a.text}`}>
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Training
                </span>
              </div>
              <p className="mt-1 font-display text-lg font-extrabold text-navy-900">
                {profession.years}
              </p>
            </div>
            <div className={`rounded-2xl ${a.bgSoft} p-4`}>
              <div className={`flex items-center gap-2 ${a.text}`}>
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Key skills
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profession.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-navy-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
              <Sparkles className={`h-4 w-4 ${a.text}`} />
              A day in the life
            </h3>
            <p className="mt-2 leading-relaxed text-navy-700">
              {profession.day_in_life}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost mt-7 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
