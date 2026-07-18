import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import type { Category } from '../lib/types';
import {
  adminListContent,
  adminDeleteContent,
  getCategories,
  type ContentType,
} from '../lib/data';
import {
  CONTENT_CONFIGS,
  getRowTitle,
  getRowSubtitle,
} from '../lib/contentConfig';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { LoadingState } from '../components/ui';

export function AdminContentListPage({ type }: { type: string }) {
  const cfg = CONTENT_CONFIGS[type as ContentType];
  const { signOut } = useAuth();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cfg) {
      setError('Unknown content type.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [list, cats] = await Promise.all([
        adminListContent<Record<string, unknown>>(cfg.type),
        getCategories(),
      ]);
      setRows(list);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [cfg]);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async (id: string) => {
    setConfirmId(null);
    try {
      await adminDeleteContent(cfg.type, id);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  if (!cfg) {
    return (
      <div className="section py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-hotpink-500" />
          <p className="mt-4 font-bold text-navy-900">Unknown content type.</p>
          <a href={routeToHash({ name: 'admin' })} className="btn btn-pink mt-5">
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  const subtitleFor = (row: Record<string, unknown>) => {
    if (cfg.type === 'survey_questions') {
      const cat = categories.find((c) => c.id === row.category_id);
      return cat ? `Topic: ${cat.name}` : 'No topic set';
    }
    return getRowSubtitle(row, cfg);
  };

  return (
    <div className="section py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href={routeToHash({ name: 'admin' })}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-navy-700 shadow-soft transition-transform hover:-translate-y-0.5"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {cfg.plural}
            </h1>
            <p className="text-sm text-navy-500">
              {rows.length} item{rows.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={routeToHash({ name: 'admin-content-edit', type, id: 'new' })}
            className="btn btn-pink"
          >
            <Plus className="h-5 w-5" />
            New {cfg.singular}
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

      <div className="mt-8">
        {loading ? (
          <LoadingState label={`Loading ${cfg.plural.toLowerCase()}…`} />
        ) : rows.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-lg font-extrabold text-navy-900">
              Nothing here yet.
            </p>
            <p className="mt-2 text-sm text-navy-600">
              Click "New {cfg.singular}" to add your first one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((row) => {
              const accent = String(row.accent ?? 'teal');
              return (
                <div
                  key={String(row.id)}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <GripVertical className="hidden h-5 w-5 shrink-0 text-navy-300 sm:block" />
                  <span
                    className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${accentGradient(accent)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-extrabold text-navy-900">
                      {getRowTitle(row, cfg) || 'Untitled'}
                    </h3>
                    <p className="mt-1 truncate text-sm text-navy-600">
                      {subtitleFor(row)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={routeToHash({ name: 'admin-content-edit', type, id: String(row.id) })}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => setConfirmId(String(row.id))}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-hotpink-50 text-hotpink-600 transition-colors hover:bg-hotpink-100"
                      aria-label="Delete"
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
              Delete this {cfg.singular.toLowerCase()}?
            </h3>
            <p className="mt-2 text-sm text-navy-600">This can't be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmId(null)} className="btn btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={() => doDelete(confirmId)} className="btn btn-pink flex-1">
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

function accentGradient(a: string): string {
  switch (a) {
    case 'hotpink':
      return 'from-hotpink-400 to-hotpink-600';
    case 'sunny':
      return 'from-sunny-300 to-sunny-500';
    case 'navy':
      return 'from-navy-600 to-navy-900';
    default:
      return 'from-teal-400 to-teal-600';
  }
}
