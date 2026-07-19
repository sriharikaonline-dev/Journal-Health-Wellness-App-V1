import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "../lib/auth.tsx";
import { AuthModal } from "./AuthModal.tsx";
import { Button, ErrorBox, Spinner, Textarea } from "./ui.tsx";
import { Icon } from "./Icon.tsx";
import { styled, injectGlobal } from "../lib/styled.tsx";

const fab = styled("button")`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(13, 148, 136, 0.4);
  z-index: 90;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 16px 38px rgba(13, 148, 136, 0.5);
  }
  &.open {
    transform: rotate(90deg);
  }
`;
const panel = styled("div")`
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 360px;
  max-width: calc(100vw - 32px);
  max-height: 70vh;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  z-index: 91;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pop 0.2s ease;
  @media (max-width: 480px) {
    bottom: 88px;
    right: 12px;
    width: calc(100vw - 24px);
  }
`;
const head = styled("div")`
  padding: 18px 20px;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  .title {
    font-family: "Fraunces", serif;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .sub {
    font-size: 0.8rem;
    opacity: 0.85;
  }
`;
const body = styled("div")`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const intro = styled("div")`
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.9rem;
  color: #0f766e;
  line-height: 1.55;
`;
const myMsg = styled("div")`
  align-self: flex-end;
  background: #0d9488;
  color: #fff;
  padding: 10px 14px;
  border-radius: 16px 16px 4px 16px;
  max-width: 80%;
  font-size: 0.92rem;
  line-height: 1.5;
  animation: slideIn 0.2s ease;
  .time {
    font-size: 0.7rem;
    opacity: 0.75;
    margin-top: 4px;
  }
`;
const foot = styled("div")`
  padding: 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;
const sendBtn = styled("button")`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #0d9488;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.18s ease, transform 0.15s ease;
  &:hover {
    background: #0f766e;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const needSignin = styled("div")`
  text-align: center;
  padding: 28px 20px;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.55;
`;

injectGlobal(`
@keyframes slideIn { from { opacity:0; transform: translateX(20px);} to {opacity:1; transform:none;} }
`);

export function ChatBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ message: string; created_at: string }[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) setSent([]);
  }, [user]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    setSending(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("chat_messages")
      .insert({ message: trimmed, user_email: user.email ?? null })
      .select("message, created_at")
      .single();
    setSending(false);
    if (err) {
      setError("Could not send right now. Try again in a moment.");
      return;
    }
    setSent((s) => [...s, { message: data.message, created_at: data.created_at }]);
    setText("");
    taRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      <button className={fab() + (open ? " open" : "")} onClick={() => setOpen((v) => !v)} aria-label="Ask a question">
        <Icon name={open ? "Close" : "ChatBubble"} size={26} />
      </button>
      {open && (
        <div className={panel()}>
          <div className={head()}>
            <Icon name="Message" size={22} />
            <div style={{ flex: 1 }}>
              <div className="title">Ask us anything</div>
              <div className="sub">Questions about the site, your health, or life — we read every one.</div>
            </div>
          </div>
          <div className={body()}>
            <div className={intro()}>
              Hey! This is a quiet space to ask any question. Your message goes to the MY Journal team privately. We'll get back
              to you.
            </div>
            {!user ? (
              <div className={needSignin()}>
                <Icon name="Lock" size={26} color="#94a3b8" />
                <p style={{ marginTop: 12 }}>Sign in to send a message to the team.</p>
                <Button variant="primary" onClick={() => setAuthOpen(true)} style={{ marginTop: 14, padding: "10px 20px" }}>
                  Sign in
                </Button>
              </div>
            ) : (
              <>
                {sent.map((m, i) => (
                  <div key={i} className={myMsg()}>
                    {m.message}
                    <div className="time">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                ))}
                {error && <ErrorBox>{error}</ErrorBox>}
              </>
            )}
          </div>
          {user && (
            <div className={foot()}>
              <Textarea
                ref={taRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your question…"
                rows={1}
                style={{ minHeight: 42, resize: "none", padding: "10px 14px" }}
              />
              <button className={sendBtn()} onClick={send} disabled={sending || !text.trim()} aria-label="Send">
                {sending ? <Spinner size="18px" /> : <Icon name="Send" size={18} />}
              </button>
            </div>
          )}
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
