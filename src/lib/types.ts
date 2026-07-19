export type Accent = "teal" | "hotpink" | "navy" | "sunny";

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  accent: Accent;
  tagline: string | null;
  sort_order: number;
}

export interface BodySystem {
  id: string;
  slug: string;
  name: string;
  short: string;
  what_it_does: string[];
  fun_fact: string | null;
  accent: Accent;
  sort_order: number;
}

export interface Profession {
  id: string;
  slug: string;
  name: string;
  summary: string;
  years: string;
  skills: string[];
  day_in_life: string;
  accent: Accent;
  sort_order: number;
}

export type MedicalProfession = Profession;

export interface Blog {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  read_minutes: number;
  cover_url: string | null;
  accent: Accent;
  published: boolean;
  featured: boolean;
  category_id: string | null;
  category?: Category | null;
  created_at: string | null;
}

export interface SurveyQuestion {
  id: string;
  category_id: string | null;
  category_slug?: string;
  question: string;
  prompt: string | null;
  sort_order: number;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  description: string;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface ChatRead {
  user_id: string;
  last_read_at: string;
}

export interface FeatureBlurb {
  title: string;
  desc: string;
}

export interface BlogSection {
  heading: string;
  text: string;
}

export interface SiteSettings {
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroHighlight: string;
    heroTail: string;
    heroSubtitle: string;
    affirmations: string[];
    motto: string;
    mottoSub: string;
    features: FeatureBlurb[];
    featuresEyebrow: string;
    featuresTitle: string;
    featuresSubtitle: string;
    topicsEyebrow: string;
    topicsTitle: string;
    topicsSubtitle: string;
    featuredEyebrow: string;
    featuredTitle: string;
    featuredSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
  about: {
    eyebrow: string;
    title: string;
    highlight: string;
    paragraph: string;
    whatWeDoEyebrow: string;
    whatWeDoTitle: string;
    whatWeDoSubtitle: string;
    whatWeDo: FeatureBlurb[];
    valuesEyebrow: string;
    valuesTitle: string;
    values: FeatureBlurb[];
    noteText: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
}
