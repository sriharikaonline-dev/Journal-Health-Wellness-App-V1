import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { Blog, Category } from '../lib/types';
import { getBlogs, getCategories } from '../lib/data';
import { accentClasses } from '../lib/utils';
import { categoryIcon } from '../lib/icons';
import { BlogCard } from '../components/BlogCard';
import { LoadingState, SectionHeader } from '../components/ui';
import { Blobs } from '../components/Blobs';

export function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let activeFlag = true;
    Promise.all([getBlogs(), getCategories()]).then(([b, c]) => {
      if (!activeFlag) return;
      setBlogs(b);
      setCategories(c);
      setLoading(false);
    });
    return () => {
      activeFlag = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = blogs;
    if (active !== 'all') {
      list = list.filter((b) => b.category?.slug === active);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q),
      );
    }
    return list;
  }, [blogs, active, query]);

  return (
    <div className="relative overflow-hidden bg-hero-grid">
      <Blobs />
      <div className="section relative py-12 sm:py-16">
        <SectionHeader
          eyebrow="The blog"
          title="Reads to lift you up"
          subtitle="Honest, doable advice from the MY Journal team. Pick a topic or search for what you need."
        />

        {/* Search */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs…"
              className="w-full rounded-full border-2 border-navy-100 bg-white py-3 pl-11 pr-4 font-semibold text-navy-800 shadow-soft outline-none transition-colors placeholder:text-navy-400 focus:border-teal-300"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <FilterChip
            label="All"
            active={active === 'all'}
            onClick={() => setActive('all')}
            accent="navy"
            icon={BookOpen}
          />
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon);
            return (
              <FilterChip
                key={c.id}
                label={c.name}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
                accent={c.accent}
                icon={Icon}
              />
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-12">
          {loading ? (
            <LoadingState label="Loading blogs…" />
          ) : filtered.length === 0 ? (
            <div className="card mx-auto max-w-md p-10 text-center">
              <p className="font-display text-lg font-extrabold text-navy-900">
                No blogs match that yet.
              </p>
              <p className="mt-2 text-sm text-navy-600">
                Try another topic or clear your search.
              </p>
              <button
                onClick={() => {
                  setActive('all');
                  setQuery('');
                }}
                className="btn btn-ghost mt-5"
              >
                Reset
              </button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm font-bold text-navy-500">
                {filtered.length} read{filtered.length === 1 ? '' : 's'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((b, i) => (
                  <BlogCard key={b.id} blog={b} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: 'teal' | 'hotpink' | 'sunny' | 'navy';
  icon: React.ComponentType<{ className?: string }>;
}) {
  const a = accentClasses(accent);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all duration-200 ${
        active
          ? `${a.border} ${a.bg} text-white shadow-soft`
          : `${a.border} ${a.bgSoft} ${a.text} hover:-translate-y-0.5`
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
