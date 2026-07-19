import { useEffect, useState, useCallback, useRef } from 'react';
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
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Mail,
  Instagram,
} from 'lucide-react';
import type { SiteSettings, FeatureBlurb } from '../lib/types';
import {
  adminGetSiteSettings,
  adminSaveSiteSettings,
  getTeamPasscodeHash,
  adminSetTeamPasscodeHash,
  uploadImage,
  getSiteOwnerId,
} from '../lib/data';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { LoadingState } from '../components/ui';
import {
  PASSCODE_LENGTH,
  normalizePasscode,
  isValidPasscodeFormat,
  hashPasscode,
} from '../lib/passcode';

type Tab = 'home' | 'about' | 'contact';

export function AdminSettingsPage() {
  const { signOut, user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Team passcode management
  const [hasPasscode, setHasPasscode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminGetSiteSettings();
      setSettings(s);
      const ownerId = await getSiteOwnerId();
      setIsOwner(Boolean(user && ownerId && user.id === ownerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    getTeamPasscodeHash().then((h) => setHasPasscode(Boolean(h)));
  }, [load]);

  const updateHome = (patch: Partial<SiteSettings['home']>) => {
    setSettings((s) => (s ? { ...s, home: { ...s.home, ...patch } } : s));
    setSaved(false);
  };
  const updateAbout = (patch: Partial<SiteSettings['about']>) => {
    setSettings((s) => (s ? { ...s, about: { ...s.about, ...patch } } : s));
    setSaved(false);
  };
  const updateContact = (patch: Partial<SiteSettings['contact']>) => {
    setSettings((s) => (s ? { ...s, contact: { ...s.contact, ...patch } } : s));
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

  const savePasscode = async () => {
    setCodeError(null);
    setCodeMsg(null);
    const trimmed = newCode.trim();
    if (trimmed && !isValidPasscodeFormat(trimmed)) {
      setCodeError(`Code must be exactly ${PASSCODE_LENGTH} digits.`);
      return;
    }
    setCodeSaving(true);
    try {
      const hash = trimmed ? await hashPasscode(trimmed) : null;
      await adminSetTeamPasscodeHash(hash);
      setHasPasscode(Boolean(hash));
      setNewCode('');
      setCodeMsg(hash ? 'Team code updated. Share it with your team.' : 'Team code removed.');
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : 'Failed to update team code');
    } finally {
      setCodeSaving(false);
    }
  };

  const removePasscode = async () => {
    setCodeError(null);
    setCodeMsg(null);
    setCodeSaving(true);
    try {
      await adminSetTeamPasscodeHash(null);
      setHasPasscode(false);
      setNewCode('');
      setCodeMsg('Team code removed. The sign-in page will now reject access.');
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : 'Failed to remove team code');
    } finally {
      setCodeSaving(false);
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
        <button
          onClick={() => setTab('contact')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-colors sm:flex-none ${
            tab === 'contact' ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500'
          }`}
        >
          <Mail className="h-4 w-4" />
          Contact & Social
        </button>
      </div>

      {isOwner && (
        <TeamPasscodeSection
          hasPasscode={hasPasscode}
        newCode={newCode}
        setNewCode={(v) => {
          setNewCode(normalizePasscode(v));
          setCodeMsg(null);
          setCodeError(null);
        }}
        showCode={showCode}
        setShowCode={setShowCode}
        codeSaving={codeSaving}
        codeMsg={codeMsg}
        codeError={codeError}
          onSave={savePasscode}
          onRemove={removePasscode}
        />
      )}

      <div className="mt-6 max-w-2xl space-y-5">
        {tab === 'home' ? (
          <HomeEditor settings={settings} onChange={updateHome} />
        ) : tab === 'about' ? (
          <AboutEditor settings={settings} onChange={updateAbout} />
        ) : (
          <ContactEditor settings={settings} onChange={updateContact} />
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
      <ImageField label="Hero photo" value={a.heroImage ?? ''} onChange={(v) => onChange({ heroImage: v || null })} hint="A photo of you and the team, shown under the hero text on the About page." />

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

function ContactEditor({
  settings,
  onChange,
}: {
  settings: SiteSettings;
  onChange: (patch: Partial<SiteSettings['contact']>) => void;
}) {
  const c = settings.contact;
  const normalizedIg = c.instagram.trim().replace(/\/$/, '');
  const igHandle = normalizedIg
    ? '@' + normalizedIg.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '')
    : '';
  return (
    <>
      <SectionLabel>Email</SectionLabel>
      <TextField
        label="Contact email"
        value={c.email}
        onChange={(v) => onChange({ email: v })}
        hint="The address visitors reach when they tap the email icon in the footer. Use an inbox you actually check."
      />

      <SectionLabel>Instagram</SectionLabel>
      <TextField
        label="Instagram URL"
        value={c.instagram}
        onChange={(v) => onChange({ instagram: v })}
        hint="Paste your full profile link, e.g. https://instagram.com/yourhandle. Leave blank to hide the Instagram icon."
      />
      {igHandle && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-navy-100 bg-navy-50/50 px-4 py-2.5 text-sm font-semibold text-navy-700">
          <Instagram className="h-4 w-4 text-hotpink-500" />
          Preview: {igHandle}
        </div>
      )}
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

function TeamPasscodeSection({
  hasPasscode,
  newCode,
  setNewCode,
  showCode,
  setShowCode,
  codeSaving,
  codeMsg,
  codeError,
  onSave,
  onRemove,
}: {
  hasPasscode: boolean;
  newCode: string;
  setNewCode: (v: string) => void;
  showCode: boolean;
  setShowCode: (v: boolean) => void;
  codeSaving: boolean;
  codeMsg: string | null;
  codeError: string | null;
  onSave: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="max-w-2xl rounded-2xl border-2 border-navy-100 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy-700">
          <KeyRound className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-extrabold text-navy-900">
            Team Sign-In Code
          </h3>
          <p className="mt-1 text-sm text-navy-600">
            A 4-digit code that gates the Team Sign-In page. Only people with this
            code can reach the login form.
          </p>
          <p className="mt-2 text-xs font-semibold text-navy-400">
            Status: {hasPasscode ? 'Code is set' : 'No code set — sign-in is locked'}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-500">
          {hasPasscode ? 'Set a new code (replaces current)' : 'Set a code'}
        </label>
        <div className="relative max-w-[200px]">
          <input
            type={showCode ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="off"
            maxLength={PASSCODE_LENGTH}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="••••"
            className="w-full rounded-xl border-2 border-navy-100 bg-white py-2.5 pl-4 pr-10 text-center text-xl font-extrabold tracking-[0.4em] text-navy-800 outline-none transition-colors placeholder:tracking-[0.4em] placeholder:text-navy-300 focus:border-teal-300"
          />
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700"
            aria-label={showCode ? 'Hide code' : 'Show code'}
          >
            {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={codeSaving}
            className="btn btn-primary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {codeSaving ? 'Saving…' : 'Save code'}
          </button>
          {hasPasscode && (
            <button
              type="button"
              onClick={onRemove}
              disabled={codeSaving}
              className="btn btn-ghost text-hotpink-600 hover:bg-hotpink-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>

        {codeError && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-hotpink-200 bg-hotpink-50 px-4 py-2.5 text-sm font-semibold text-hotpink-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {codeError}
          </div>
        )}
        {codeMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {codeMsg}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageField({
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
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    setErr(null);
    const url = await uploadImage(file, 'about');
    setUploading(false);
    if (!url) {
      setErr('Upload failed. Try a smaller image.');
      return;
    }
    onChange(url);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy-800">{label}</label>
      <div className="space-y-3">
        {value && (
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-navy-100"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-hotpink-500 text-white shadow-soft"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-navy-100 bg-white px-3 py-2 text-sm font-bold text-navy-700 transition-colors hover:border-teal-300 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          <span className="text-xs text-navy-400">or paste a URL below</span>
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-xl border-2 border-navy-100 bg-white px-3.5 py-2.5 text-sm text-navy-800 outline-none focus:border-teal-300"
        />
        {err && <p className="text-xs font-semibold text-hotpink-600">{err}</p>}
      </div>
      {hint && <p className="mt-1.5 text-xs text-navy-500">{hint}</p>}
    </div>
  );
}
