import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  LogOut,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import type { Blog } from '../lib/types';
import { adminListBlogs, adminDeleteBlog } from '../lib/data';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { LoadingState } from '../components/ui';
import { accentClasses } from '../lib/utils';

export function AdminBlogsPage() {
  const { user, signOut } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListBlogs();
      setBlogs(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async (id: string) => {
    setConfirmId(null);
    try {
      await adminDeleteBlog(id);
      setBlogs((b) => b.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete blog');
    }
  };

  return (
    <div className="section py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="chip bg-navy-100 text-navy-700">
            Team Workspace
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl">
            Manage Blogs
          </h1>
          <p className="mt-1 text-sm text-navy-600">
            Signed in as {user?.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={routeToHash({ name: 'admin-blog-edit', id: 'new' })}
            className="btn btn-pink"
          >
            <Plus className="h-5 w-5" />
            New Blog
          </a>
          <button onClick={() => signOut()} className="btn btn-ghost">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-hotpink-200 bg-hotpink-50 px-4 py-3 text-sm font-semibold text-hotpink-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      <div className="mt-8">
        {loading ? (
          <LoadingState label="Loading your blogs…" />
        ) : blogs.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-lg font-extrabold text-navy-900">
              No blogs yet.
            </p>
            <p className="mt-2 text-sm text-navy-600">
              Click "New Blog" to write your first one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {blogs.map((b) => {
              const a = accentClasses(b.accent);
              return (
                <div
                  key={b.id}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <span
                    className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${a.gradient}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-lg font-extrabold text-navy-900">
                        {b.title || 'Untitled'}
                      </h3>
                      {b.featured && (
                        <span className="chip bg-sunny-100 text-sunny-700">
                          <Star className="h-3 w-3" fill="currentColor" />
                          Featured
                        </span>
                      )}
                      {b.published ? (
                        <span className="chip bg-teal-100 text-teal-700">
                          <Eye className="h-3 w-3" />
                          Published
                        </span>
                      ) : (
                        <span className="chip bg-navy-100 text-navy-600">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-navy-600">
                      {b.summary || 'No summary yet.'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-navy-400">
                      {b.category?.name ?? 'Uncategorized'} · {b.author} ·{' '}
                      {b.read_minutes} min
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {b.published && b.slug && (
                      <a
                        href={routeToHash({ name: 'blog', slug: b.slug })}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-10 w-10 place-items-center rounded-xl bg-navy-50 text-navy-600 transition-colors hover:bg-navy-100"
                        aria-label="View blog"
                        title="View on site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <a
                      href={routeToHash({ name: 'admin-blog-edit', id: b.id })}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
                      aria-label="Edit blog"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => setConfirmId(b.id)}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-hotpink-50 text-hotpink-600 transition-colors hover:bg-hotpink-100"
                      aria-label="Delete blog"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setConfirmId(null)}
          />
          <div className="card relative z-10 max-w-sm animate-pop-in p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-hotpink-100 text-hotpink-600">
              <Trash2 className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-navy-900">
              Delete this blog?
            </h3>
            <p className="mt-2 text-sm text-navy-600">
              This can't be undone. The article will be removed from your site.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete(confirmId)}
                className="btn btn-pink flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
