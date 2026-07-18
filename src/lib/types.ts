export type Accent = 'teal' | 'hotpink' | 'sunny' | 'navy';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  accent: Accent;
  tagline: string | null;
  sort_order: number;
}

export interface Blog {
  id: string;
  category_id: string | null;
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
  created_at: string;
  category?: Category | null;
}

export interface SurveyQuestion {
  id: string;
  category_id: string;
  category_slug?: string;
  question: string;
  prompt: string | null;
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

export interface MedicalProfession {
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

export interface BlogSection {
  heading: string;
  text: string;
}

export interface FeatureBlurb {
  title: string;
  desc: string;
}

export interface SiteHomeCopy {
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
}

export interface SiteAboutCopy {
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
}

export interface SiteSettings {
  home: SiteHomeCopy;
  about: SiteAboutCopy;
}
