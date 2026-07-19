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
  accent: Accent;
}

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
  created_at: string | null;
}

export interface SurveyQuestion {
  id: string;
  category_id: string | null;
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
