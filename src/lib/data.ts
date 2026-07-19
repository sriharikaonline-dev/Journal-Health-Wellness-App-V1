import { supabase, supabaseAvailable } from './supabase';
import type {
  Blog,
  BodySystem,
  Category,
  ChatMessage,
  Founder,
  MedicalProfession,
  Profile,
  SiteSettings,
  SurveyQuestion,
} from './types';
import { fallback } from './fallbackContent';

async function tryQuery<T>(
  fetcher: () => Promise<{ data: T | null; error: { message: string } | null }>,
  fallbackData: T,
): Promise<T> {
  if (!supabaseAvailable) return fallbackData;
  try {
    const { data, error } = await fetcher();
    if (error || !data) return fallbackData;
    return data;
  } catch {
    return fallbackData;
  }
}

export async function getCategories(): Promise<Category[]> {
  const cats = await tryQuery(
    () =>
      supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true }) as never,
    fallback.categories,
  );
  return cats as Category[];
}

export async function getBlogs(): Promise<Blog[]> {
  const blogs = await tryQuery(
    () =>
      supabase
        .from('blogs')
        .select('*, category:categories(*)')
        .eq('published', true)
        .order('created_at', { ascending: false }) as never,
    fallback.blogs,
  );
  return (blogs as Blog[]).map((b) => ({
    ...b,
    category: (b as Blog & { category?: Category }).category ?? null,
  }));
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const all = await getBlogs();
  return all.find((b) => b.slug === slug) ?? null;
}

export async function getSurveyQuestions(): Promise<SurveyQuestion[]> {
  const rows = await tryQuery(
    () =>
      supabase
        .from('survey_questions')
        .select('*, category:categories(slug)')
        .order('sort_order', { ascending: true }) as never,
    fallback.surveyQuestions,
  );
  return (rows as (SurveyQuestion & { category?: { slug: string } })[]).map(
    (r) => ({
      id: r.id,
      category_id: r.category_id,
      category_slug: r.category?.slug ?? '',
      question: r.question,
      prompt: r.prompt,
      sort_order: r.sort_order,
    }),
  );
}

export async function getBodySystems(): Promise<BodySystem[]> {
  const rows = await tryQuery(
    () =>
      supabase
        .from('body_systems')
        .select('*')
        .order('sort_order', { ascending: true }) as never,
    fallback.bodySystems,
  );
  return rows as BodySystem[];
}

export async function getProfessions(): Promise<MedicalProfession[]> {
  const rows = await tryQuery(
    () =>
      supabase
        .from('medical_professions')
        .select('*')
        .order('sort_order', { ascending: true }) as never,
    fallback.professions,
  );
  return rows as MedicalProfession[];
}

export async function submitSurveyResponse(payload: {
  categories: string[];
  scores: Record<string, number>;
  recommended_blogs: string[];
}): Promise<void> {
  if (!supabaseAvailable) return;
  try {
    await supabase.from('survey_responses').insert(payload);
  } catch {
    // non-blocking — survey still works for the user
  }
}

// --- Site settings (home + about copy) -------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabaseAvailable) return fallback.siteSettings;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return fallback.siteSettings;
    return mergeSettings(fallback.siteSettings, data.data as Partial<SiteSettings>);
  } catch {
    return fallback.siteSettings;
  }
}

export async function adminGetSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // row may not exist yet — return fallback so admin can create it
    return fallback.siteSettings;
  }
  return mergeSettings(fallback.siteSettings, data.data as Partial<SiteSettings>);
}

export async function adminSaveSiteSettings(settings: SiteSettings): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, data: settings as unknown as Record<string, unknown> })
    .eq('id', 1);
  if (error) {
    // upsert with eq filter can complain; fall back to update then insert
    const upd = await supabase
      .from('site_settings')
      .update({ data: settings as unknown as Record<string, unknown> })
      .eq('id', 1);
    if (upd.error) {
      const ins = await supabase
        .from('site_settings')
        .insert({ id: 1, data: settings as unknown as Record<string, unknown> });
      if (ins.error) throw new Error(ins.error.message);
    }
  }
}

// Deep-ish merge so newly added settings keys still appear if an older DB row
// is missing them.
function mergeSettings(base: SiteSettings, patch: Partial<SiteSettings>): SiteSettings {
  return {
    home: { ...base.home, ...(patch.home ?? {}) },
    about: { ...base.about, ...(patch.about ?? {}) },
  };
}

// --- Team passcode gate -----------------------------------------------------

export async function getTeamPasscodeHash(): Promise<string | null> {
  if (!supabaseAvailable) return fallback.teamPasscodeHash;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('team_passcode_hash')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return null;
    return (data.team_passcode_hash as string | null) ?? null;
  } catch {
    return null;
  }
}

export async function adminSetTeamPasscodeHash(hash: string | null): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .update({ team_passcode_hash: hash })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}

// --- Admin: blog CRUD (authenticated only) ---------------------------------

export type BlogInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  author: string;
  category_id: string | null;
  read_minutes: number;
  accent: Blog['accent'];
  cover_url: string | null;
  published: boolean;
  featured: boolean;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function suggestSlug(title: string): string {
  return slugify(title);
}

export async function adminListBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });
  if (error || !data) throw new Error(error?.message ?? 'Failed to load blogs');
  return data as Blog[];
}

export async function adminGetBlog(id: string): Promise<Blog> {
  if (id === 'new') {
    return {
      id: 'new',
      category_id: null,
      slug: '',
      title: '',
      summary: '',
      body: '',
      author: 'MY Journal Team',
      read_minutes: 4,
      cover_url: null,
      accent: 'teal',
      published: false,
      featured: false,
      created_at: new Date().toISOString(),
      category: null,
    };
  }
  const { data, error } = await supabase
    .from('blogs')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Blog not found');
  return data as Blog;
}

export async function adminSaveBlog(
  id: string,
  input: BlogInput,
): Promise<Blog> {
  const payload = {
    ...input,
    slug: input.slug || slugify(input.title),
    read_minutes: Number(input.read_minutes) || 3,
  };
  if (id === 'new') {
    const { data, error } = await supabase
      .from('blogs')
      .insert(payload)
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as Blog;
  }
  const { data, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Blog not found after save');
  return data as Blog;
}

export async function adminDeleteBlog(id: string): Promise<void> {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Admin: generic content CRUD ------------------------------------------
// These power the check-in questions, categories, body systems, and
// professions editors. Each content type has its own table + list/get/save.

export type ContentType =
  | 'categories'
  | 'survey_questions'
  | 'body_systems'
  | 'medical_professions'
  | 'founders';

type ContentRow = Partial<Category> & Partial<SurveyQuestion> & Partial<BodySystem> & Partial<MedicalProfession> & { id?: string };

const ORDER_COL: Record<ContentType, string> = {
  categories: 'sort_order',
  survey_questions: 'sort_order',
  body_systems: 'sort_order',
  medical_professions: 'sort_order',
  founders: 'sort_order',
};

export async function adminListContent<T extends ContentRow>(
  type: ContentType,
): Promise<T[]> {
  const { data, error } = await supabase
    .from(type)
    .select('*')
    .order(ORDER_COL[type], { ascending: true });
  if (error || !data) throw new Error(error?.message ?? 'Failed to load');
  return data as T[];
}

export async function adminGetContent<T extends ContentRow>(
  type: ContentType,
  id: string,
): Promise<T> {
  if (id === 'new') {
    return newContent(type) as T;
  }
  const { data, error } = await supabase
    .from(type)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Item not found');
  return data as T;
}

export async function adminSaveContent<T extends ContentRow>(
  type: ContentType,
  id: string,
  input: Record<string, unknown>,
): Promise<T> {
  const payload = sanitizeInput(type, input);
  if (id === 'new') {
    const { data, error } = await supabase
      .from(type)
      .insert(payload)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as T;
  }
  const { data, error } = await supabase
    .from(type)
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Item not found after save');
  return data as T;
}

export async function adminDeleteContent(
  type: ContentType,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(type).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function newContent(type: ContentType): Record<string, unknown> {
  switch (type) {
    case 'categories':
      return {
        slug: '',
        name: '',
        icon: 'Heart',
        accent: 'teal',
        tagline: '',
        sort_order: 99,
      };
    case 'survey_questions':
      return { category_id: null, question: '', prompt: '', sort_order: 99 };
    case 'body_systems':
      return {
        slug: '',
        name: '',
        short: '',
        what_it_does: [],
        fun_fact: '',
        accent: 'teal',
        sort_order: 99,
      };
    case 'medical_professions':
      return {
        slug: '',
        name: '',
        summary: '',
        years: '',
        skills: [],
        day_in_life: '',
        accent: 'teal',
        sort_order: 99,
      };
    case 'founders':
      return {
        name: '',
        role: '',
        description: '',
        photo_url: null,
        sort_order: 99,
      };
  }
}

function sanitizeInput(
  type: ContentType,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };
  // slug auto from name if blank
  if (('slug' in out) && !out.slug && 'name' in out) {
    out.slug = slugify(String(out.name ?? ''));
  }
  if ('sort_order' in out) out.sort_order = Number(out.sort_order) || 99;
  // ensure arrays are arrays
  for (const arrField of ['what_it_does', 'skills']) {
    if (arrField in out && !Array.isArray(out[arrField])) {
      const v = String(out[arrField] ?? '');
      out[arrField] = v
        ? v.split('\n').map((s) => s.trim()).filter(Boolean)
        : [];
    }
  }
  // null out empty category_id so FK is happy
  if ('category_id' in out && out.category_id === '') out.category_id = null;
  // founders: null out empty photo_url
  if ('photo_url' in out && (out.photo_url === '' || out.photo_url === undefined)) {
    out.photo_url = null;
  }
  return out;
}

// ===== Founders (public read, owner write) =====

export async function getFounders(): Promise<Founder[]> {
  if (!supabaseAvailable) return [];
  const { data, error } = await supabase
    .from('founders')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('getFounders error', error.message);
    return [];
  }
  return (data ?? []) as Founder[];
}

// ===== Chat inbox (signed-in members ask, owner reads) =====

export async function fetchMyChatMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchMyChatMessages error', error.message);
    return [];
  }
  return (data ?? []) as ChatMessage[];
}

export async function fetchAllChatMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('fetchAllChatMessages error', error.message);
    return [];
  }
  return (data ?? []) as ChatMessage[];
}

export async function sendChatMessage(message: string): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ message })
    .select()
    .single();
  if (error) {
    console.warn('sendChatMessage error', error.message);
    return null;
  }
  return data as ChatMessage;
}

export async function markChatHandled(id: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ handled: true })
    .eq('id', id);
  if (error) console.warn('markChatHandled error', error.message);
}

export async function markChatRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_reads')
    .upsert({ user_id: userId, last_read_at: new Date().toISOString() });
  if (error) console.warn('markChatRead error', error.message);
}

export async function getUnreadCount(): Promise<number> {
  const { data, error } = await supabase.rpc('chat_unread_count');
  if (error) {
    console.warn('getUnreadCount error', error.message);
    return 0;
  }
  return Number(data ?? 0);
}

// ===== Profiles (members list, owner-only) =====

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('fetchProfiles error', error.message);
    return [];
  }
  return (data ?? []) as Profile[];
}
