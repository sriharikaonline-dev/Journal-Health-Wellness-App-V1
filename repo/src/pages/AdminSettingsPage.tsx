import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Home,
  Heart,
  Plus,
  X,
  Trash2,
  LogOut,
} from 'lucide-react';
import type { SiteSettings, FeatureBlurb } from '../lib/types';
import { adminGetSiteSettings, adminSaveSiteSettings } from '../lib/data';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { LoadingState } from '../components/ui';

type Tab = 'home' | 'about';

export function AdminSettingsPage() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminGetSiteSettings();
      setSettings(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateHome = (patch: Partial<SiteSettings['home']>) => {
    setSettings((s) => (s ? { ...s, home: { ...s.home, ...patch } } : s));
    setSaved(false);
  };
  const updateAbout = (patch: Partial<SiteSettings['about']>) => {
    setSettings((s) => (s ? { ...s, about: { ...s.about, ...patch } } : s));
    setSaved(false);
  };

  const save = async () => {
    if (!settings) return;
    setError(null);
    setSaving(true);
    try {
      await adminSaveSiteSettings(settings);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="section py-16">
        <LoadingState label="Loading site copy…" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="section py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-hotpink-500" />
          <p className="mt-4 font-bold text-navy-900">
            {error ?? 'Could not load site settings.'}
          </p>
          <a href={routeToHash({ name: 'admin' })} className="btn btn-pink mt-5">
            Back to dashboard
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
            href={routeToHash({ name: 'admin' })}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-navy-700 shadow-soft transition-transform hover:-translate-y-0.5"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
              Home & About Pages
            </h1>
            <p className="text-sm text-navy-500">
              Edit the words people see on the home and about pages.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => signOut()} className="btn btn-ghost">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <button onClick={save} disabled={saving} className="btn btn-pink disabled:opacity-60">
            {saving ? 'Saving…' : (
              <>
                <Save className="h-5 w-5" />
                Save changes
              </>
            )}
          </button>
        </div>
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
          Saved! Your changes are live on the site.
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex rounded-full bg-navy-100 p-1 sm:w-auto">
        <button
          onClick={() => setTab('home')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-colors sm:flex-none ${
            tab === 'home' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'
          }`}
        >
          <Home className="h-4 w-4" />
          Home Page
        </button>
        <button
          onClick={() => setTab('about')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-colors sm:flex-none ${
            tab === 'about' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'
          }`}
        >
          <Heart className="h-4 w-4" />
          About Page
        </button>
      </div>

      <div className="mt-6 max-w-2xl space-y-5">
        {tab === 'home' ? (
          <HomeEditor settings={settings} onChange={updateHome} />
        ) : (
          <AboutEditor settings={settings} onChange={updateAbout} />
        )}
      </div>
    </div>
  );
}

function HomeEditor({
  settings,
  onChange,
}: {
  settings: SiteSettings;
  onChange: (patch: Partial<SiteSettings['home']>) => void;
}) {
  const h = settings.home;
  return (
    <>
      <SectionLabel>Hero section</SectionLabel>
      <TextField label="Eyebrow" value={h.heroEyebrow} onChange={(v) => onChange({ heroEyebrow: v })} />
      <TextField label="Title (first line)" value={h.heroTitle} onChange={(v) => onChange({ heroTitle: v })} />
      <TextField label="Highlighted word" value={h.heroHighlight} onChange={(v) => onChange({ heroHighlight: v })} hint="Shown in the colorful gradient text." />
      <TextField label="Title (tail)" value={h.heroTail} onChange={(v) => onChange({ heroTail: v })} />
      <TextAreaField label="Subtitle" value={h.heroSubtitle} onChange={(v) => onChange({ heroSubtitle: v })} />

      <SectionLabel>Daily affirmations</SectionLabel>
      <StringListEditor items={h.affirmations} onChange={(arr) => onChange({ affirmations: arr })} placeholder="Add an affirmation…" />

      <SectionLabel>Motto banner</SectionLabel>
      <TextField label="Motto" value={h.motto} onChange={(v) => onChange({ motto: v })} />
      <TextField label="Motto subtitle" value={h.mottoSub} onChange={(v) => onChange({ mottoSub: v })} />

      <SectionLabel>Feature cards</SectionLabel>
      <TextField label="Eyebrow" value={h.featuresEyebrow} onChange={(v) => onChange({ featuresEyebrow: v })} />
      <TextField label="Heading" value={h.featuresTitle} onChange={(v) => onChange({ featuresTitle: v })} />
      <TextField label="Subtitle" value={h.featuresSubtitle} onChange={(v) => onChange({ featuresSubtitle: v })} />
      <BlurbListEditor items={h.features} onChange={(arr) => onChange({ features: arr })} />

      <SectionLabel>Topics section</SectionLabel>
      <TextField label="Eyebrow" value={h.topicsEyebrow} onChange={(v) => onChange({ topicsEyebrow: v })} />
      <TextField label="Heading" value={h.topicsTitle} onChange={(v) => onChange({ topicsTitle: v })} />
      <TextField label="Subtitle" value={h.topicsSubtitle} onChange={(v) => onChange({ topicsSubtitle: v })} />

      <SectionLabel>Featured blogs section</SectionLabel>
      <TextField label="Eyebrow" value={h.featuredEyebrow} onChange={(v) => onChange({ featuredEyebrow: v })} />
      <TextField label="Heading" value={h.featuredTitle} onChange={(v) => onChange({ featuredTitle: v })} />
      <TextField label="Subtitle" value={h.featuredSubtitle} onChange={(v) => onChange({ featuredSubtitle: v })} />

      <SectionLabel>Call-to-action banner</SectionLabel>
      <TextField label="Heading" value={h.ctaTitle} onChange={(v) => onChange({ ctaTitle: v })} />
      <TextField label="Subtitle" value={h.ctaSubtitle} onChange={(v) => onChange({ ctaSubtitle: v })} />
    </>
  );
}

function AboutEditor({
  settings,
  onChange,
}: {
  settings: SiteSettings;
  onChange: (patch: Partial<SiteSettings['about']>) => void;
}) {
  const a = settings.about;
  return (
    <>
      <SectionLabel>Hero section</SectionLabel>
      <TextField label="Eyebrow" value={a.eyebrow} onChange={(v) => onChange({ eyebrow: v })} />
      <TextField label="Title" value={a.title} onChange={(v) => onChange({ title: v })} />
      <TextField label="Highlighted phrase" value={a.highlight} onChange={(v) => onChange({ highlight: v })} hint="Shown in the colorful gradient text." />
      <TextAreaField label="Paragraph" value={a.paragraph} onChange={(v) => onChange({ paragraph: v })} />

      <SectionLabel>What we do</SectionLabel>
      <TextField label="Eyebrow" value={a.whatWeDoEyebrow} onChange={(v) => onChange({ whatWeDoEyebrow: v })} />
      <TextField label="Heading" value={a.whatWeDoTitle} onChange={(v) => onChange({ whatWeDoTitle: v })} />
      <TextField label="Subtitle" value={a.whatWeDoSubtitle} onChange={(v) => onChange({ whatWeDoSubtitle: v })} />
      <BlurbListEditor items={a.whatWeDo} onChange={(arr) => onChange({ whatWeDo: arr })} />

      <SectionLabel>Values</SectionLabel>
      <TextField label="Eyebrow" value={a.valuesEyebrow} onChange={(v) => onChange({ valuesEyebrow: v })} />
      <TextField label="Heading" value={a.valuesTitle} onChange={(v) => onChange({ valuesTitle: v })} />
      <BlurbListEditor items={a.values} onChange={(arr) => onChange({ values: arr })} />

      <SectionLabel>Kind heads-up note</SectionLabel>
      <TextAreaField label="Note text" value={a.noteText} onChange={(v) => onChange({ noteText: v })} rows={5} />

      <SectionLabel>Call-to-action banner</SectionLabel>
      <TextField label="Heading" value={a.ctaTitle} onChange={(v) => onChange({ ctaTitle: v })} />
      <TextField label="Subtitle" value={a.ctaSubtitle} onChange={(v) => onChange({ ctaSubtitle: v })} />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
        {children}
      </p>
      <div className="mt-1 h-px bg-navy-100" />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy-800">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
      />
      {hint && <p className="mt-1.5 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy-800">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 font-semibold text-navy-800 outline-none focus:border-teal-300"
      />
    </div>
  );
}

function StringListEditor({
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
              <span className="flex-1 text-sm font-semibold text-navy-800">{item}</span>
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

function BlurbListEditor({
  items,
  onChange,
}: {
  items: FeatureBlurb[];
  onChange: (arr: FeatureBlurb[]) => void;
}) {
  const update = (i: number, patch: Partial<FeatureBlurb>) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { title: '', desc: '' }]);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border-2 border-navy-100 bg-navy-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-400">
              Card {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-7 w-7 place-items-center rounded-lg bg-hotpink-50 text-hotpink-600 transition-colors hover:bg-hotpink-100"
              aria-label="Remove card"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            value={item.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Card title"
            className="mt-2 w-full rounded-xl border-2 border-navy-100 bg-white px-3 py-2 font-bold text-navy-800 outline-none focus:border-teal-300"
          />
          <textarea
            value={item.desc}
            onChange={(e) => update(i, { desc: e.target.value })}
            rows={2}
            placeholder="Card description"
            className="mt-2 w-full resize-y rounded-xl border-2 border-navy-100 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-teal-300"
          />
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-ghost">
        <Plus className="h-4 w-4" />
        Add card
      </button>
    </div>
  );
}
