import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Pencil,
  Wand2,
  Star,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Blog, Category, Accent } from '../lib/types';
import {
  adminGetBlog,
  adminSaveBlog,
  getCategories,
  suggestSlug,
  type BlogInput,
} from '../lib/data';
import { routeToHash, useRouter } from '../lib/router';
import { LoadingState } from '../components/ui';
import { accentClasses, parseBlogBody } from '../lib/utils';
import { categoryIcon } from '../lib/icons';

const accents: Accent[] = ['teal', 'hotpink', 'sunny', 'navy'];

const sampleBody = `Intro paragraph goes here — set up the reader with what this is about.
## First heading
Write your advice under each heading. Use ## to start a new section.
## Second heading
Each ## becomes a titled section in the final article.
## You Got This
End with an encouraging note.`;

export function AdminBlogEditPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([adminGetBlog(id), getCategories()]).then(
      ([b, c]) => {
        if (!active) return;
        setBlog(b);
        setCategories(c);
        setLoading(false);
      },
    ).catch((e) => {
      if (!active) return;
      setError(e instanceof Error ? e.message : 'Failed to load blog');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const update = (patch: Partial<Blog>) => {
    setBlog((b) => (b ? { ...b, ...patch } : b));
    setSaved(false);
  };

  const autoSlug = () => {
    if (!blog) return;
    update({ slug: suggestSlug(blog.title) });
  };

  const save = async () => {
    if (!blog) return;
    setError(null);
    setSaving(true);
    try {
      const input: BlogInput = {
        title: blog.title.trim(),
        slug: blog.slug.trim() || suggestSlug(blog.title),
        summary: blog.summary.trim(),
        body: blog.body,
        author: blog.author.trim() || 'MY Journal Team',
        category_id: blog.category_id,
        read_minutes: blog.read_minutes,
        accent: blog.accent,
        cover_url: blog.cover_url,
        published: blog.published,
        featured: blog.featured,
      };
      if (!input.title) throw new Error('Please add a title.');
      if (!input.summary) throw new Error('Please add a short summary.');
      if (!input.body.trim()) throw new Error('Please write some content.');
      const savedBlog = await adminSaveBlog(id, input);
      setSaved(true);
      if (id === 'new') {
        navigate({ name: 'admin-blog-edit', id: savedBlog.id });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section py-16">
        <LoadingState label="Loading editor…" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="section py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-hotpink-500" />
          <p className="mt-4 font-bold text-navy-900">
            {error ?? 'Could not load this blog.'}
          </p>
          <a href={routeToHash({ name: 'admin-blogs' })} className="btn btn-pink mt-5">
            Back to blogs
          </a>
        </div>
      </div>
    );
  }

  const a = accentClasses(blog.accent);

  return (
    <div className="section py-8 sm:py-10">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href={routeToHash({ name: 'admin-blogs' })}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-navy-700 shadow-soft transition-transform hover:-translate-y-0.5"
            aria-label="Back to blogs"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {id === 'new' ? 'New Blog' : 'Edit Blog'}
            </h1>
            <p className="text-sm text-navy-500">
              {blog.published ? 'Published' : 'Draft'} ·{' '}
              {blog.category?.name ?? 'Uncategorized'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-full bg-navy-100 p-1">
            <button
              onClick={() => setView('edit')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                view === 'edit' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'
              }`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setView('preview')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                view === 'preview' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="btn btn-pink disabled:opacity-60"
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-hotpink-200 bg-hotpink-50 px-4 py-3 text-sm font-semibold text-hotpink-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Saved! Your changes are live.
        </div>
      )}

      {/* Body */}
      {view === 'edit' ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <div className="card space-y-5 p-6 sm:p-7">
            <Field label="Title">
              <input
                type="text"
                value={blog.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Give your blog a warm, clear title"
                className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
              />
            </Field>

            <Field label="URL slug" hint="The web address for this article.">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={blog.slug}
                  onChange={(e) => update({ slug: e.target.value })}
                  placeholder="auto-from-title"
                  className="flex-1 rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-mono text-sm text-navy-800 outline-none focus:border-teal-300"
                />
                <button
                  onClick={autoSlug}
                  type="button"
                  className="btn btn-ghost shrink-0 !py-2"
                  title="Generate from title"
                >
                  <Wand2 className="h-4 w-4" />
                  Auto
                </button>
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <select
                  value={blog.category_id ?? ''}
                  onChange={(e) =>
                    update({ category_id: e.target.value || null })
                  }
                  className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => {
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Author">
                <input
                  type="text"
                  value={blog.author}
                  onChange={(e) => update({ author: e.target.value })}
                  placeholder="MY Journal Team"
                  className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
                />
              </Field>
            </div>

            <Field label="Summary" hint="One or two sentences shown on cards and at the top.">
              <textarea
                value={blog.summary}
                onChange={(e) => update({ summary: e.target.value })}
                rows={2}
                placeholder="A short, inviting summary."
                className="w-full resize-none rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
              />
            </Field>

            <Field
              label="Content"
              hint="Use ## to start a new section heading. Each section has a heading + paragraph."
            >
              <textarea
                value={blog.body}
                onChange={(e) => update({ body: e.target.value })}
                rows={14}
                placeholder={sampleBody}
                className="w-full resize-y rounded-xl border-2 border-navy-100 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-navy-800 outline-none focus:border-teal-300"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Read time (minutes)">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={blog.read_minutes}
                  onChange={(e) =>
                    update({ read_minutes: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
                />
              </Field>

              <Field label="Accent color" hint="Sets the card and header color.">
                <div className="flex gap-2 pt-1">
                  {accents.map((ac) => {
                    const acCls = accentClasses(ac);
                    const sel = blog.accent === ac;
                    return (
                      <button
                        key={ac}
                        type="button"
                        onClick={() => update({ accent: ac })}
                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${acCls.gradient} transition-transform ${
                          sel ? 'scale-110 ring-4 ring-navy-200' : 'hover:scale-105'
                        }`}
                        aria-label={ac}
                        title={ac}
                      />
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Toggle
                checked={blog.published}
                onChange={(v) => update({ published: v })}
                label="Published"
                hint="Visible on the public site"
              />
              <Toggle
                checked={blog.featured}
                onChange={(v) => update({ featured: v })}
                label="Featured"
                hint="Shown on the home page"
                icon={<Star className="h-3.5 w-3.5" fill="currentColor" />}
              />
            </div>
          </div>

          {/* Live mini preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy-400">
              Quick preview
            </p>
            <div className="card overflow-hidden">
              <div className={`relative h-28 bg-gradient-to-br ${a.gradient}`}>
                {blog.category && (() => {
                  const Icon = categoryIcon(blog.category.icon);
                  return (
                    <Icon className="absolute right-4 top-4 h-9 w-9 text-white/90" />
                  );
                })()}
                {blog.featured && (
                  <span className="absolute left-4 top-4 chip bg-white/90 text-navy-900">
                    <Star className="h-3 w-3" fill="currentColor" />
                    Featured
                  </span>
                )}
              </div>
              <div className="p-5">
                {blog.category && (
                  <span className={`chip ${a.bgSoft} ${a.text} mb-3`}>
                    {blog.category.name}
                  </span>
                )}
                <h3 className="font-display text-lg font-extrabold text-navy-900">
                  {blog.title || 'Your title appears here'}
                </h3>
                <p className="mt-2 text-sm text-navy-600 line-clamp-3">
                  {blog.summary || 'Your summary appears here.'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-navy-400">
              Switch to Preview to see the full article.
            </p>
          </div>
        </div>
      ) : (
        <BlogPreview blog={blog} />
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy-800">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
        checked
          ? 'border-teal-300 bg-teal-50'
          : 'border-navy-100 bg-white'
      }`}
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-teal-500' : 'bg-navy-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span>
        <span className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
          {icon}
          {label}
        </span>
        {hint && <span className="block text-xs text-navy-500">{hint}</span>}
      </span>
    </button>
  );
}

function BlogPreview({ blog }: { blog: Blog }) {
  const a = accentClasses(blog.accent);
  const sections = useMemo(() => parseBlogBody(blog.body), [blog.body]);
  const Icon = blog.category ? categoryIcon(blog.category.icon) : null;

  return (
    <div className="mt-6">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${a.gradient} px-6 py-10 sm:px-10`}>
        <div className="absolute inset-0 bg-bubble-fade opacity-40" />
        <div className="relative max-w-2xl">
          {blog.category && (
            <span className="chip bg-white/90 text-navy-900">
              {Icon && <Icon className="h-4 w-4" />}
              {blog.category.name}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            {blog.title || 'Untitled'}
          </h1>
          <p className="mt-3 text-lg text-white/90">
            {blog.summary || 'No summary yet.'}
          </p>
          <p className="mt-4 text-sm font-bold text-white/80">
            {blog.author} · {blog.read_minutes} min read
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        {sections.length === 0 ? (
          <p className="text-center text-navy-500">
            Your article sections will appear here as you write.
          </p>
        ) : (
          sections.map((s, i) => (
            <section key={i} className="mb-8">
              {s.heading && (
                <h2 className={`flex items-center gap-2 text-2xl font-extrabold ${a.text}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${a.bgSoft}`}>
                    <Eye className="h-4 w-4" />
                  </span>
                  {s.heading}
                </h2>
              )}
              {s.text && (
                <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-navy-700">
                  {s.text}
                </p>
              )}
            </section>
          ))
        )}
        <div className={`mt-10 rounded-3xl ${a.bgSoft} p-6 text-center`}>
          <p className="font-display text-2xl font-extrabold text-navy-900">
            You Got This.
          </p>
        </div>
      </div>
    </div>
  );
}
