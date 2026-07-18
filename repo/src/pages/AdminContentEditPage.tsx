import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Wand2,
  Plus,
  X,
} from 'lucide-react';
import type { Category, Accent } from '../lib/types';
import {
  adminGetContent,
  adminSaveContent,
  getCategories,
  suggestSlug,
  type ContentType,
} from '../lib/data';
import {
  CONTENT_CONFIGS,
  ACCENTS,
  type FieldConfig,
} from '../lib/contentConfig';
import { routeToHash, useRouter } from '../lib/router';
import { LoadingState } from '../components/ui';

export function AdminContentEditPage({ type, id }: { type: string; id: string }) {
  const cfg = CONTENT_CONFIGS[type as ContentType];
  const { navigate } = useRouter();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!cfg) {
      setError('Unknown content type.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [item, cats] = await Promise.all([
        adminGetContent<Record<string, unknown>>(cfg.type, id),
        getCategories(),
      ]);
      setRow(item);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [cfg, id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key: string, value: unknown) => {
    setRow((r) => (r ? { ...r, [key]: value } : r));
    setSaved(false);
  };

  const save = async () => {
    if (!cfg || !row) return;
    setError(null);
    setSaving(true);
    try {
      for (const f of cfg.fields) {
        if (f.required && !String(row[f.key] ?? '').trim()) {
          throw new Error(`Please fill in: ${f.label}`);
        }
      }
      const savedRow = await adminSaveContent(cfg.type, id, row);
      setSaved(true);
      if (id === 'new') {
        navigate({ name: 'admin-content-edit', type, id: String(savedRow.id) });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="section py-16">
        <LoadingState label="Loading editor…" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="section py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-hotpink-500" />
          <p className="mt-4 font-bold text-navy-900">
            {error ?? 'Could not load this item.'}
          </p>
          <a href={routeToHash({ name: 'admin-content', type })} className="btn btn-pink mt-5">
            Back to list
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href={routeToHash({ name: 'admin-content', type })}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-navy-700 shadow-soft transition-transform hover:-translate-y-0.5"
            aria-label="Back to list"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {id === 'new' ? `New ${cfg.singular}` : `Edit ${cfg.singular}`}
            </h1>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-pink disabled:opacity-60">
          {saving ? 'Saving…' : (
            <>
              <Save className="h-5 w-5" />
              Save
            </>
          )}
        </button>
      </div>

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

      <div className="mt-6 max-w-2xl space-y-5">
        {cfg.fields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            value={row[f.key]}
            onChange={(v) => update(f.key, v)}
            categories={categories}
            onAutoSlug={() => update('slug', suggestSlug(String(row['name'] ?? '')))}
          />
        ))}
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  categories,
  onAutoSlug,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  categories: Category[];
  onAutoSlug?: () => void;
}) {
  const labelEl = (
    <label className="mb-1.5 block text-sm font-bold text-navy-800">
      {field.label}
      {field.required && <span className="text-hotpink-500"> *</span>}
    </label>
  );
  const hintEl = field.hint ? (
    <p className="mt-1.5 text-xs text-navy-400">{field.hint}</p>
  ) : null;

  if (field.type === 'textarea') {
    return (
      <div>
        {labelEl}
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={field.placeholder}
          className="w-full resize-y rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
        />
        {hintEl}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        {labelEl}
        <input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
        />
        {hintEl}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {labelEl}
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
        >
          <option value="">Choose…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {hintEl}
      </div>
    );
  }

  if (field.type === 'color') {
    return (
      <div>
        {labelEl}
        <div className="flex gap-2 pt-1">
          {ACCENTS.map((ac) => {
            const sel = value === ac.value;
            const grad = accentGradient(ac.value);
            return (
              <button
                key={ac.value}
                type="button"
                onClick={() => onChange(ac.value)}
                className={`h-10 w-10 rounded-full bg-gradient-to-br ${grad} transition-transform ${
                  sel ? 'scale-110 ring-4 ring-navy-200' : 'hover:scale-105'
                }`}
                aria-label={ac.label}
                title={ac.label}
              />
            );
          })}
        </div>
        {hintEl}
      </div>
    );
  }

  if (field.type === 'array') {
    const items = Array.isArray(value) ? value as string[] : [];
    return (
      <div>
        {labelEl}
        <ArrayEditor items={items} onChange={(arr) => onChange(arr)} placeholder={field.placeholder ?? 'One item per line'} />
        {hintEl}
      </div>
    );
  }

  if (field.type === 'relation') {
    return (
      <div>
        {labelEl}
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
        >
          <option value="">Choose a topic…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {hintEl}
      </div>
    );
  }

  // text (with auto-slug helper when key === 'slug')
  return (
    <div>
      {labelEl}
      {field.key === 'slug' && onAutoSlug ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="flex-1 rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-mono text-sm text-navy-800 outline-none focus:border-teal-300"
          />
          <button type="button" onClick={onAutoSlug} className="btn btn-ghost shrink-0 !py-2">
            <Wand2 className="h-4 w-4" />
            Auto
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
        />
      )}
      {hintEl}
    </div>
  );
}

function ArrayEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (arr: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-xl border-2 border-navy-100 bg-white px-3 py-2"
            >
              <span className="flex-1 text-sm font-semibold text-navy-800">
                {item}
              </span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="grid h-7 w-7 place-items-center rounded-lg bg-hotpink-50 text-hotpink-600 transition-colors hover:bg-hotpink-100"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border-2 border-navy-100 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-teal-300"
        />
        <button type="button" onClick={add} className="btn btn-ghost shrink-0 !py-2">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function accentGradient(a: Accent): string {
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
