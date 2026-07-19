import { useEffect, useState } from 'react';
import { Users, Sparkles } from 'lucide-react';
import type { Founder } from '../lib/types';
import { getFounders } from '../lib/data';
import { SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

const PLACEHOLDER_AVATARS = [
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function FoundersPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFounders().then((f) => {
      if (!active) return;
      setFounders(f);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-grid">
        <Blobs />
        <div className="section relative py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip bg-teal-100 text-teal-700 mx-auto">
              <Users className="h-4 w-4" />
              Meet the team
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-navy-900 sm:text-5xl">
              The <span className="gradient-text">founders</span> behind MY Journal
            </h1>
            <p className="mt-5 text-lg text-navy-700">
              The young people who built this — and keep it kind, honest, and real.
            </p>
          </div>
        </div>
      </section>

      <section className="section py-16 sm:py-20">
        {loading ? (
          <p className="text-center text-navy-500">Loading founders…</p>
        ) : founders.length === 0 ? (
          <p className="text-center text-navy-500">Founders coming soon.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <div
                key={f.id}
                className="card group flex flex-col items-center p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-teal-100 via-hotpink-100 to-sunny-100 ring-4 ring-white shadow-soft">
                  {f.photo_url ? (
                    <img
                      src={f.photo_url}
                      alt={f.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={PLACEHOLDER_AVATARS[i % PLACEHOLDER_AVATARS.length]}
                      alt={f.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-navy-900">
                  {f.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-teal-600">{f.role}</p>
                <p className="mt-3 text-sm text-navy-600">{f.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mx-auto mt-14 max-w-2xl rounded-3xl bg-navy-900 p-8 text-center shadow-soft">
          <Sparkles className="mx-auto h-8 w-8 text-sunny-400" />
          <p className="mt-3 font-display text-xl font-extrabold text-white">
            Built by young people, for young people.
          </p>
          <p className="mt-2 text-sm text-navy-200">
            Want to join the team? Keep an eye on our careers page — we're always
            looking for kind voices.
          </p>
        </div>
      </section>
    </div>
  );
}
