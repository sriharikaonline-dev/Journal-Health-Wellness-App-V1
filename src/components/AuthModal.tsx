import { useState } from "react";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "../lib/auth.tsx";
import { Button, Input, Label, ErrorBox, Spinner } from "./ui.tsx";
import { Icon } from "./Icon.tsx";
import { styled, injectGlobal } from "../lib/styled.tsx";

const overlay = styled("div")`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeUp 0.18s ease;
`;
const panel = styled("div")`
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  padding: 36px;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.3);
  animation: pop 0.2s ease;
  max-height: 92vh;
  overflow-y: auto;
`;
const closeBtn = styled("button")`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;
const tabs = styled("div")`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 999px;
  margin: 22px 0 24px;
`;
const tab = styled("button")`
  flex: 1;
  padding: 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.18s ease;
  &.active {
    background: #fff;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;
const row = styled("div")`
  margin-bottom: 16px;
  position: relative;
`;
const submitRow = styled("div")`
  margin-top: 22px;
`;
const fine = styled("p")`
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 18px;
  text-align: center;
  line-height: 1.5;
`;
const heading = styled("h2")`
  font-size: 1.6rem;
`;
const sub = styled("p")`
  color: #64748b;
  margin-top: 6px;
  font-size: 0.95rem;
`;

injectGlobal(`
.auth-logo {
  width: 46px; height: 46px; border-radius: 14px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-family: "Fraunces", serif; font-weight: 700; font-size: 1.3rem;
  box-shadow: 0 8px 20px rgba(13,148,136,0.3);
}
`);

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { refreshOwner } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || undefined } },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setError("Check your email for a confirmation link, then sign in.");
          setMode("signin");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        await refreshOwner();
        onClose();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.replace(/\. \(.*\)$/, ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={overlay()} onClick={onClose}>
      <div className={panel()} style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button className={closeBtn()} onClick={onClose} aria-label="Close">
          <Icon name="Close" size={20} />
        </button>
        <div className="auth-logo">M</div>
        <h2 className={heading()} style={{ marginTop: 18 }}>
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className={sub()}>
          {mode === "signin"
            ? "Sign in to save your check-ins and message the team."
            : "Join MY Journal to save check-ins and message the team."}
        </p>
        <div className={tabs()}>
          <button className={tab({})} data-active={mode === "signin"} onClick={() => setMode("signin")}>
            Sign in
          </button>
          <button className={tab({})} data-active={mode === "signup"} onClick={() => setMode("signup")}>
            Sign up
          </button>
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <div className={row()}>
              <Label>Display name (optional)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
            </div>
          )}
          <div className={row()}>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className={row()}>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div className={submitRow()}>
            <Button type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? <Spinner size="18px" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </div>
        </form>
        <p className={fine()}>
          By continuing you agree to use MY Journal for general wellness info only — it's not a substitute for medical advice.
        </p>
      </div>
      <style>{`[data-active="true"]{background:#fff;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.08)}`}</style>
    </div>
  );
}
