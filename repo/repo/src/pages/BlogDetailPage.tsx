import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Blog } from '../lib/types';
import { getBlogBySlug, getBlogs } from '../lib/data';
import { accentClasses, parseBlogBody } from '../lib/utils';
import { categoryIcon } from '../lib/icons';
import { routeToHash } from '../lib/router';
import { BlogCard } from '../components/BlogCard';
import { LoadingState, ErrorState } from '../components/ui';
import { Blobs } from '../components/Blobs';

export function BlogDetailPage({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    Promise.all([getBlogBySlug(slug), getBlogs()]).then(([b, all]) => {
      if (!active) return;
      if (!b) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setBlog(b);
      setRelated(
        all
          .filter(
            (x) =>
              x.id !== b.id && x.category?.slug === b.category?.slug,
          )
          .slice(0, 3),
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: blog?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // user cancelled — no-op
    }
  };

  if (loading) {
    return (
      <div className="section py-16">
        <LoadingState label="Opening your read…" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="section py-16">
        <ErrorState message="We couldn't find that blog. It may have moved." />
        <div className="mt-6 text-center">
          <a href={routeToHash({ name: 'blogs' })} className="btn btn-pink">
            <ArrowLeft className="h-4 w-4" />
            Back to all blogs
          </a>
        </div>
      </div>
    );
  }

  const a = accentClasses(blog.accent);
  const Icon = blog.category ? categoryIcon(blog.category.icon) : null;
  const sections = parseBlogBody(blog.body);

  return (
    <div>
      {/* Hero band */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${a.gradient}`}>
        <div className="absolute inset-0 bg-bubble-fade opacity-40" />
        <div className="section relative py-12 sm:py-16">
          <a
            href={routeToHash({ name: 'blogs' })}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-navy-800 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            All blogs
          </a>

          <div className="mt-6 max-w-3xl">
            {blog.category && (
              <span className="chip bg-white/90 text-navy-900 shadow-soft">
                {Icon && <Icon className="h-4 w-4" />}
                {blog.category.name}
              </span>
            )}
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {blog.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90">
              {blog.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-white/90">
              <span className="flex items-center gap-1.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                  <Heart className="h-4 w-4" fill="white" />
                </span>
                {blog.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {blog.read_minutes} min read
              </span>
              <button
                onClick={share}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 transition-colors hover:bg-white/30"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Link copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative bg-hero-grid">
        <Blobs />
        <article className="section relative py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            {sections.map((s, i) => (
              <section
                key={i}
                className="mb-8 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {s.heading && (
                  <h2
                    className={`flex items-center gap-2 text-2xl font-extrabold ${a.text}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${a.bgSoft}`}
                    >
                      <Sparkles className="h-4 w-4" />
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
            ))}

            <div
              className={`mt-10 rounded-3xl ${a.bgSoft} p-6 text-center sm:p-8`}
            >
              <p className="font-display text-2xl font-extrabold text-navy-900">
                You Got This.
              </p>
              <p className="mt-1 text-sm text-navy-600">
                Come back any time. We'll keep the light on.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section pb-16 sm:pb-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
              More like this
            </h2>
            <a href={routeToHash({ name: 'blogs' })} className="btn btn-ghost">
              All blogs
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
