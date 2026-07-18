import { useEffect, useState } from 'react';
import { PersonStanding, Lightbulb, Check, ArrowRight } from 'lucide-react';
import type { BodySystem } from '../lib/types';
import { getBodySystems } from '../lib/data';
import { accentClasses } from '../lib/utils';
import { BodyIllustration } from '../components/BodyIllustration';
import { LoadingState, SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

export function BodyPage() {
  const [systems, setSystems] = useState<BodySystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<BodySystem | null>(null);

  useEffect(() => {
    let flag = true;
    getBodySystems().then((s) => {
      if (!flag) return;
      setSystems(s);
      if (s[0]) setActive(s[0]);
      setLoading(false);
    });
    return () => {
      flag = false;
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-hero-grid">
      <Blobs />
      <div className="section relative py-12 sm:py-16">
        <SectionHeader
          eyebrow="Learn about your body"
          title="Meet the systems that make you, you"
          subtitle="Short, illustrated explainers for every body system — written by our team, made to actually make sense."
        />

        {loading ? (
          <LoadingState label="Loading your body map…" />
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            {/* List */}
            <div className="flex flex-col gap-3">
              {systems.map((s) => {
                const a = accentClasses(s.accent);
                const isActive = active?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s)}
                    className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      isActive
                        ? `${a.border} ${a.bgSoft} shadow-soft`
                        : 'border-navy-100 bg-white hover:border-navy-200 hover:-translate-y-0.5'
                    }`}
                  >
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${a.bgSoft} ${a.text}`}
                    >
                      <BodyIllustration slug={s.slug} accent={s.accent} />
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-display text-base font-extrabold ${
                          isActive ? a.text : 'text-navy-900'
                        }`}
                      >
                        {s.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-navy-500 line-clamp-1">
                        {s.short}
                      </span>
                    </span>
                    <ArrowRight
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        isActive ? `${a.text} translate-x-0` : 'text-navy-300 group-hover:translate-x-1'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Detail */}
            {active && <SystemDetail system={active} />}
          </div>
        )}
      </div>
    </div>
  );
}

function SystemDetail({ system }: { system: BodySystem }) {
  const a = accentClasses(system.accent);
  return (
    <div
      key={system.id}
      className="card animate-pop-in overflow-hidden lg:sticky lg:top-24"
    >
      <div className={`relative h-56 bg-gradient-to-br ${a.gradient} sm:h-64`}>
        <div className="absolute inset-0 bg-bubble-fade opacity-40" />
        <div className="absolute inset-0 grid place-items-center p-8">
          <div className="h-32 w-32 text-white sm:h-40 sm:w-40">
            <BodyIllustration slug={system.slug} accent={system.accent} />
          </div>
        </div>
        <span className="absolute left-5 top-5 chip bg-white/90 text-navy-900 shadow-soft">
          <PersonStanding className="h-4 w-4" />
          Body System
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <h2 className={`text-2xl font-extrabold ${a.text} sm:text-3xl`}>
          {system.name}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-navy-700">
          {system.short}
        </p>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-navy-500">
          What it does
        </h3>
        <ul className="mt-3 space-y-2.5">
          {system.what_it_does.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${a.bg} text-white`}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-navy-700">{item}</span>
            </li>
          ))}
        </ul>

        {system.fun_fact && (
          <div className={`mt-6 rounded-2xl ${a.bgSoft} p-5`}>
            <div className={`flex items-center gap-2 ${a.text}`}>
              <Lightbulb className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Fun fact
              </span>
            </div>
            <p className="mt-2 font-semibold text-navy-800">
              {system.fun_fact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
