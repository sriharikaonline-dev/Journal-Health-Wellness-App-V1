import type { Accent } from "./types";

export const ACCENTS: Record<
  Accent,
  {
    name: string;
    base: string;
    soft: string;
    softest: string;
    text: string;
    ring: string;
    gradient: string;
    glow: string;
  }
> = {
  teal: {
    name: "Teal",
    base: "#0d9488",
    soft: "#ccfbf1",
    softest: "#f0fdfa",
    text: "#0f766e",
    ring: "rgba(13, 148, 136, 0.35)",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    glow: "rgba(13, 148, 136, 0.18)",
  },
  hotpink: {
    name: "Pink",
    base: "#db2777",
    soft: "#fce7f3",
    softest: "#fdf2f8",
    text: "#be185d",
    ring: "rgba(219, 39, 119, 0.35)",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    glow: "rgba(219, 39, 119, 0.18)",
  },
  navy: {
    name: "Navy",
    base: "#4338ca",
    soft: "#e0e7ff",
    softest: "#eef2ff",
    text: "#3730a3",
    ring: "rgba(67, 56, 202, 0.35)",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    glow: "rgba(67, 56, 202, 0.18)",
  },
  sunny: {
    name: "Sunny",
    base: "#d97706",
    soft: "#fef3c7",
    softest: "#fffbeb",
    text: "#b45309",
    ring: "rgba(217, 119, 6, 0.35)",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    glow: "rgba(217, 119, 6, 0.18)",
  },
};

export const accent = (a: Accent) => ACCENTS[a] ?? ACCENTS.teal;

export const palette = {
  ink: "#0f172a",
  inkSoft: "#334155",
  muted: "#64748b",
  line: "#e2e8f0",
  lineSoft: "#f1f5f9",
  bg: "#ffffff",
  bgWarm: "#fafaf9",
  bgCream: "#fffdf7",
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
};
