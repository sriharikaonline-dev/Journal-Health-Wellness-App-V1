import type { Accent, BlogSection } from './types';

type ClassMap = Record<string, string>;

export const accentBg: ClassMap = {
  teal: 'bg-teal-500',
  hotpink: 'bg-hotpink-500',
  sunny: 'bg-sunny-400',
  navy: 'bg-navy-800',
};

export const accentBgSoft: ClassMap = {
  teal: 'bg-teal-100',
  hotpink: 'bg-hotpink-100',
  sunny: 'bg-sunny-100',
  navy: 'bg-navy-100',
};

export const accentText: ClassMap = {
  teal: 'text-teal-600',
  hotpink: 'text-hotpink-600',
  sunny: 'text-sunny-600',
  navy: 'text-navy-800',
};

export const accentBorder: ClassMap = {
  teal: 'border-teal-300',
  hotpink: 'border-hotpink-300',
  sunny: 'border-sunny-300',
  navy: 'border-navy-300',
};

export const accentRing: ClassMap = {
  teal: 'focus-visible:ring-teal-300',
  hotpink: 'focus-visible:ring-hotpink-300',
  sunny: 'focus-visible:ring-sunny-300',
  navy: 'focus-visible:ring-navy-300',
};

export const accentGradient: ClassMap = {
  teal: 'from-teal-400 to-teal-600',
  hotpink: 'from-hotpink-400 to-hotpink-600',
  sunny: 'from-sunny-300 to-sunny-500',
  navy: 'from-navy-600 to-navy-900',
};

export function accentClasses(a: Accent) {
  return {
    bg: accentBg[a],
    bgSoft: accentBgSoft[a],
    text: accentText[a],
    border: accentBorder[a],
    ring: accentRing[a],
    gradient: accentGradient[a],
  };
}

// Parse the blog body format: "## Heading\n text" segments.
export function parseBlogBody(body: string): BlogSection[] {
  return body
    .split('## ')
    .slice(1)
    .map((chunk) => {
      const nl = chunk.indexOf('\n');
      const heading = chunk.slice(0, nl).trim();
      const text = chunk.slice(nl + 1).trim();
      return { heading, text };
    });
}
