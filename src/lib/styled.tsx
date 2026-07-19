import { createContext, useContext } from "react";

type StyleSheet = {
  insert: (css: string, opts?: { global?: boolean }) => string;
};

const SheetContext = createContext<StyleSheet | null>(null);

const GLOBAL = new Set<string>();
const SCOPED = new Map<string, string>();

let mounted = false;
let globalEl: HTMLStyleElement | null = null;
let scopedEl: HTMLStyleElement | null = null;

function ensureMounted() {
  if (mounted || typeof document === "undefined") return;
  globalEl = document.createElement("style");
  globalEl.setAttribute("data-mj-global", "");
  document.head.appendChild(globalEl);
  scopedEl = document.createElement("style");
  scopedEl.setAttribute("data-mj-scoped", "");
  document.head.appendChild(scopedEl);
  mounted = true;
}

const sheet: StyleSheet = {
  insert(cssText, opts) {
    ensureMounted();
    if (opts?.global) {
      if (GLOBAL.has(cssText)) return "";
      GLOBAL.add(cssText);
      if (globalEl) globalEl.textContent += cssText;
      return "";
    }
    const hash = `mj${hashCss(cssText)}`;
    if (SCOPED.has(hash)) return SCOPED.get(hash)!;
    const scoped = cssText.replace(/&/g, `.${hash}`);
    SCOPED.set(hash, scoped);
    if (scopedEl) scopedEl.textContent += scoped;
    return hash;
  },
};

function hashCss(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function StyleSheetProvider({ children }: { children: React.ReactNode }) {
  return <SheetContext.Provider value={sheet}>{children}</SheetContext.Provider>;
}

export function useSheet(): StyleSheet {
  const ctx = useContext(SheetContext);
  return ctx ?? sheet;
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = strings.reduce((acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""), "");
  return raw;
}

export function keyframes(name: string, body: string): string {
  const rule = `@keyframes ${name} ${body}`;
  sheet.insert(rule, { global: true });
  return name;
}

type StyledArg = string | ((props: Record<string, unknown>) => unknown);

export function styled(_tag: string) {
  return (strings: TemplateStringsArray, ...values: StyledArg[]): ((props?: Record<string, unknown>) => string) => {
    const base = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `\u0000${i}\u0000` : ""), "");
    return (props = {}) => {
      const filled = base.replace(/\u0000(\d+)\u0000/g, (_, idx) => {
        const v = values[Number(idx)];
        const out = typeof v === "function" ? v(props!) : v;
        return out === null || out === undefined || out === false ? "" : String(out);
      });
      return sheet.insert(filled);
    };
  };
}

export function injectGlobal(raw: string) {
  sheet.insert(raw, { global: true });
}
