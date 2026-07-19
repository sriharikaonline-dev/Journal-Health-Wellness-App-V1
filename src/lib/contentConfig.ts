import type { Accent, Category } from './types';
import type { ContentType } from './data';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'color'
  | 'array'
  | 'relation'
  | 'image';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** For array fields: newlines split items. */
  arrayLines?: boolean;
  required?: boolean;
}

export interface ContentConfig {
  type: ContentType;
  singular: string;
  plural: string;
  titleKey: string;
  subtitleKey?: string;
  fields: FieldConfig[];
}

export const ACCENTS: { value: Accent; label: string }[] = [
  { value: 'teal', label: 'Teal' },
  { value: 'hotpink', label: 'Hot Pink' },
  { value: 'sunny', label: 'Yellow' },
  { value: 'navy', label: 'Navy' },
];

export const ICON_OPTIONS = [
  { value: 'Brain', label: 'Brain' },
  { value: 'Wind', label: 'Wind' },
  { value: 'Moon', label: 'Moon' },
  { value: 'Activity', label: 'Activity' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Target', label: 'Target' },
  { value: 'Users', label: 'Users' },
];

const accentField: FieldConfig = {
  key: 'accent',
  label: 'Accent color',
  type: 'color',
  hint: 'Sets the card and header color on the site.',
};

export const CONTENT_CONFIGS: Record<ContentType, ContentConfig> = {
  categories: {
    type: 'categories',
    singular: 'Topic',
    plural: 'Topics',
    titleKey: 'name',
    subtitleKey: 'tagline',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Mental Health' },
      { key: 'slug', label: 'URL slug', type: 'text', hint: 'Auto-generated from name if blank.', placeholder: 'mental-health' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Tools for a kinder, calmer mind.' },
      {
        key: 'icon',
        label: 'Icon',
        type: 'select',
        hint: 'The icon shown on topic chips and cards.',
        options: ICON_OPTIONS,
      },
      accentField,
      { key: 'sort_order', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first.' },
    ],
  },
  survey_questions: {
    type: 'survey_questions',
    singular: 'Question',
    plural: 'Check-In Questions',
    titleKey: 'question',
    subtitleKey: 'prompt',
    fields: [
      { key: 'question', label: 'Question', type: 'text', required: true, placeholder: 'How has your mood been feeling lately?' },
      { key: 'prompt', label: 'Helper prompt', type: 'text', hint: 'Shown under the question.', placeholder: 'Pick the face that matches your week.' },
      { key: 'category_id', label: 'Topic', type: 'relation', hint: 'Which wellness topic this question maps to.' },
      { key: 'sort_order', label: 'Sort order', type: 'number', hint: 'Order in the check-in flow.' },
    ],
  },
  body_systems: {
    type: 'body_systems',
    singular: 'Body System',
    plural: 'Body Systems',
    titleKey: 'name',
    subtitleKey: 'short',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Nervous System' },
      { key: 'slug', label: 'URL slug', type: 'text', hint: 'Auto from name if blank.', placeholder: 'nervous' },
      { key: 'short', label: 'Short description', type: 'textarea', required: true, placeholder: 'One-sentence summary.' },
      { key: 'what_it_does', label: 'What it does', type: 'array', arrayLines: true, hint: 'One bullet per line.' },
      { key: 'fun_fact', label: 'Fun fact', type: 'textarea', placeholder: 'A surprising, kid-friendly fact.' },
      accentField,
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  medical_professions: {
    type: 'medical_professions',
    singular: 'Profession',
    plural: 'Medical Professions',
    titleKey: 'name',
    subtitleKey: 'summary',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Pediatrician' },
      { key: 'slug', label: 'URL slug', type: 'text', hint: 'Auto from name if blank.', placeholder: 'pediatrician' },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true, placeholder: 'One or two sentences.' },
      { key: 'years', label: 'Years of training', type: 'text', placeholder: '11–15 years' },
      { key: 'skills', label: 'Key skills', type: 'array', arrayLines: true, hint: 'One skill per line.' },
      { key: 'day_in_life', label: 'A day in the life', type: 'textarea', placeholder: 'Describe a typical day.' },
      accentField,
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  founders: {
    type: 'founders',
    singular: 'Founder',
    plural: 'Founders',
    titleKey: 'name',
    subtitleKey: 'role',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { key: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Co-Founder & Editor' },
      { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'A short bio about this founder.' },
      { key: 'photo_url', label: 'Photo', type: 'image', hint: 'Upload a photo or paste an image URL. Leave blank for a placeholder.', placeholder: 'https://…' },
      { key: 'sort_order', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first.' },
    ],
  },
};

export const CONTENT_TYPES: {
  type: ContentType | 'blogs' | 'site_settings';
  label: string;
  description: string;
}[] = [
  { type: 'blogs', label: 'Blogs', description: 'Articles your team writes to help readers.' },
  { type: 'survey_questions', label: 'Check-In Questions', description: 'The questions in the wellness survey.' },
  { type: 'categories', label: 'Topics', description: 'Wellness topics that tag blogs and questions.' },
  { type: 'body_systems', label: 'Body Systems', description: 'The "Learn About Your Body" tab entries.' },
  { type: 'medical_professions', label: 'Medical Professions', description: 'The "Find Your Path" tab entries.' },
  { type: 'founders', label: 'Founders', description: 'The founders shown on the Founders tab.' },
  { type: 'site_settings', label: 'Home & About Pages', description: 'The wording on the home and about pages.' },
];

export function getRowTitle(row: Record<string, unknown>, cfg: ContentConfig): string {
  return String(row[cfg.titleKey] ?? 'Untitled');
}

export function getRowSubtitle(row: Record<string, unknown>, cfg: ContentConfig): string {
  if (!cfg.subtitleKey) return '';
  return String(row[cfg.subtitleKey] ?? '');
}

export function categoriesToOptions(cats: Category[]): { value: string; label: string }[] {
  return cats.map((c) => ({ value: c.id, label: c.name }));
}
