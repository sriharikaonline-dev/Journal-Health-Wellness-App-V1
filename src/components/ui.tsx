import React from "react";
import { css } from "../lib/styled.tsx";
import { styled } from "../lib/styled.tsx";

const btnBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 999px;
  padding: 12px 22px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
  border: 1.5px solid transparent;
  line-height: 1.2;
`;
const btnPrimary = styled("button")`
  ${btnBase}
  background: #0f172a;
  color: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.1);
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
const btnAccent = styled("button")`
  ${btnBase}
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  background: ${(p) => (p.$color ? p.$color : "#0d9488")};
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 26px ${(p) => (p.$glow ? p.$glow : "rgba(13,148,136,0.3)")};
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;
const btnGhost = styled("button")`
  ${btnBase}
  background: transparent;
  color: #0f172a;
  border-color: #e2e8f0;
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const btnSoft = styled("button")`
  ${btnBase}
  background: #f1f5f9;
  color: #334155;
  &:hover {
    background: #e2e8f0;
  }
`;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "ghost" | "soft";
  color?: string;
  glow?: string;
};

export function Button({ variant = "primary", color, glow, className, ...rest }: ButtonProps) {
  const fn =
    variant === "accent"
      ? btnAccent
      : variant === "ghost"
        ? btnGhost
        : variant === "soft"
          ? btnSoft
          : btnPrimary;
  const cls = fn({ $color: color, $glow: glow });
  return <button className={`${cls} ${className ?? ""}`} {...rest} />;
}

const pillCls = styled("span")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  background: ${(p) => p.$soft ?? "#f0fdfa"};
  color: ${(p) => p.$text ?? "#0f766e"};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;
export function Pill({
  soft,
  text,
  children,
  className,
  style,
}: {
  soft?: string;
  text?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`${pillCls({ $soft: soft, $text: text })} ${className ?? ""}`} style={style}>
      {children}
    </span>
  );
}

const cardCls = styled("div")`
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 22px;
  padding: ${(p) => (p.$pad ?? "28px")};
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease;
  ${(p) => (p.$hoverable ? "&:hover { transform: translateY(-4px); box-shadow: 0 18px 44px rgba(15,23,42,0.1); }" : "")}
`;
export function Card({
  pad,
  hoverable,
  className,
  children,
  style,
}: {
  pad?: string;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`${cardCls({ $pad: pad, $hoverable: hoverable })} ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

const inputCls = styled("input")`
  width: 100%;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &::placeholder {
    color: #94a3b8;
  }
  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.15);
  }
`;
const textareaCls = styled("textarea")`
  ${inputCls}
  resize: vertical;
  min-height: 110px;
  line-height: 1.6;
`;
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls()} ${props.className ?? ""}`} {...props} />;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return <textarea ref={ref} className={`${textareaCls()} ${props.className ?? ""}`} {...props} />;
  },
);

const labelCls = styled("label")`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 7px;
`;
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`${labelCls()} ${className ?? ""}`}>{children}</label>;
}

const spinnerCls = styled("div")`
  width: ${(p) => (p.$size ?? "22px")};
  height: ${(p) => (p.$size ?? "22px")};
  border-radius: 50%;
  border: 2.5px solid rgba(13, 148, 136, 0.18);
  border-top-color: #0d9488;
  animation: spin 0.7s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
export function Spinner({ size, className }: { size?: string; className?: string }) {
  return <div className={`${spinnerCls({ $size: size })} ${className ?? ""}`} />;
}

const avatarWrap = styled("div")`
  width: ${(p) => p.$size ?? "40px"};
  height: ${(p) => p.$size ?? "40px"};
  border-radius: 50%;
  background: ${(p) => p.$bg ?? "linear-gradient(135deg, #14b8a6, #0d9488)"};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${(p) => (p.$size === "56px" ? "1.2rem" : "0.9rem")};
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;
export function Avatar({
  name,
  src,
  size = "40px",
  bg,
}: {
  name?: string | null;
  src?: string | null;
  size?: string;
  bg?: string;
}) {
  const initial = name && name.trim() ? name.trim()[0]!.toUpperCase() : "?";
  if (src) {
    return (
      <div className={avatarWrap({ $size: size, $bg: bg })} style={{ padding: 0 }}>
        <img src={src} alt={name ?? "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return <div className={avatarWrap({ $size: size, $bg: bg })}>{initial}</div>;
}

const errorCls = styled("div")`
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
`;
export function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div className={errorCls()}>{children}</div>;
}

const emptyCls = styled("div")`
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
`;
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className={emptyCls()}>{children}</div>;
}
