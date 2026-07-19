import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import type { ChatMessage, ChatRead, Profile } from "../lib/types.ts";
import { useAuth } from "../lib/auth.tsx";
import { useProfiles } from "../lib/useMembers.ts";
import { Avatar, Button, Card, EmptyState, Pill, Spinner } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const wrap = styled("section")`
  max-width: 1080px;
  margin: 0 auto;
  padding: 48px 24px 80px;
`;
const head = styled("div")`
  margin-bottom: 28px;
`;
const statGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;
const stat = styled("div")`
  padding: 22px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #f1f5f9;
  .num {
    font-family: "Fraunces", serif;
    font-size: 2rem;
    font-weight: 600;
    color: #0f172a;
  }
  .lbl {
    color: #64748b;
    font-size: 0.88rem;
    margin-top: 2px;
  }
  .ic {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
`;
const twoCol = styled("div")`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
const inboxHead = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;
const msgCard = styled("div")`
  background: #fff;
  border: 1px solid #f1f5f9;
  border-left: 4px solid ${(p) => (p.$new ? "#0d9488" : "#e2e8f0")};
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 12px;
  animation: fadeUp 0.2s ease;
  .top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .email {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.9rem;
  }
  .time {
    color: #94a3b8;
    font-size: 0.78rem;
    margin-left: auto;
  }
  .text {
    color: #334155;
    line-height: 1.55;
    font-size: 0.95rem;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
`;
const tag = styled("span")`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  &.new {
    background: #f0fdfa;
    color: #0f766e;
  }
  &.done {
    background: #f1f5f9;
    color: #64748b;
  }
`;
const miniBtn = styled("button")`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
  &:hover {
    border-color: #0d9488;
    color: #0d9488;
  }
  &.danger:hover {
    border-color: #dc2626;
    color: #dc2626;
  }
`;
const membersList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const memberRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .email {
    font-size: 0.78rem;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
const notice = styled("div")`
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0fdfa, #fdf2f8);
  border: 1px solid #ccfbf1;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
  animation: pop 0.25s ease;
`;
const blocked = styled("div")`
  max-width: 520px;
  margin: 80px auto;
  text-align: center;
  padding: 40px 24px;
  h1 {
    font-size: 1.8rem;
  }
  p {
    color: #64748b;
    margin-top: 12px;
  }
`;

export function WorkspacePage() {
  const { user, isOwner, loading } = useAuth();
  const { profiles } = useProfiles(isOwner);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastRead, setLastRead] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, user_id, user_email, message, handled, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setMessages(data as ChatMessage[]);
    const { data: rd } = await supabase
      .from("chat_reads")
      .select("user_id, last_read_at")
      .maybeSingle();
    setLastRead(rd ? (rd as ChatRead).last_read_at : null);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    void loadMessages();
    const channel = supabase
      .channel("chat-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        void loadMessages();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwner, loadMessages]);

  async function markAllRead() {
    if (!user) return;
    const now = new Date().toISOString();
    await supabase.from("chat_reads").upsert({ user_id: user.id, last_read_at: now });
    setLastRead(now);
  }

  async function toggleHandled(m: ChatMessage) {
    const { error } = await supabase.from("chat_messages").update({ handled: !m.handled }).eq("id", m.id);
    if (error) return;
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, handled: !m.handled } : x)));
  }

  async function removeMsg(m: ChatMessage) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("chat_messages").delete().eq("id", m.id);
    if (error) return;
    setMessages((list) => list.filter((x) => x.id !== m.id));
  }

  if (loading)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/" replace />;
  if (!isOwner)
    return (
      <div className={blocked()}>
        <Icon name="Lock" size={36} color="#94a3b8" />
        <h1 style={{ marginTop: 16 }}>Team workspace is for the site owner.</h1>
        <p>If you're supposed to have access, sign in with the owner account.</p>
        <Link to="/" style={{ color: "#0d9488", fontWeight: 600, marginTop: 16, display: "inline-block" }}>
          Back home
        </Link>
      </div>
    );

  const unread = messages.filter(
    (m) => !m.handled && (!lastRead || new Date(m.created_at) > new Date(lastRead)),
  );

  return (
    <section className={wrap()}>
      <div className={head()}>
        <Pill soft="#0f172a" text="#fff" style={{ background: "#0f172a" }}>
          <Icon name="Bell" size={14} /> Team workspace
        </Pill>
        <h1 style={{ marginTop: 14, fontSize: "2rem" }}>Owner dashboard</h1>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Your private space to see questions from the community, manage the team, and keep track of everyone with an account.
        </p>
      </div>

      <div className={statGrid()}>
        <div className={stat()}>
          <div className="ic" style={{ background: "#f0fdfa", color: "#0d9488" }}>
            <Icon name="Message" size={20} />
          </div>
          <div className="num">{messages.length}</div>
          <div className="lbl">Total questions</div>
        </div>
        <div className={stat()}>
          <div className="ic" style={{ background: "#fef3c7", color: "#b45309" }}>
            <Icon name="Bell" size={20} />
          </div>
          <div className="num">{unread.length}</div>
          <div className="lbl">New since last read</div>
        </div>
        <div className={stat()}>
          <div className="ic" style={{ background: "#eef2ff", color: "#3730a3" }}>
            <Icon name="CheckCircle" size={20} />
          </div>
          <div className="num">{messages.filter((m) => m.handled).length}</div>
          <div className="lbl">Handled</div>
        </div>
        <div className={stat()}>
          <div className="ic" style={{ background: "#fdf2f8", color: "#be185d" }}>
            <Icon name="Users" size={20} />
          </div>
          <div className="num">{profiles.length}</div>
          <div className="lbl">Members with accounts</div>
        </div>
      </div>

      {unread.length > 0 && (
        <div className={notice()}>
          <Icon name="Bell" size={22} color="#0d9488" />
          <div style={{ flex: 1 }}>
            <strong>{unread.length} new {unread.length === 1 ? "question" : "questions"}</strong>
            <p style={{ color: "#475569", fontSize: "0.9rem", marginTop: 2 }}>
              From people using the chat bubble across the site.
            </p>
          </div>
          <Button variant="ghost" onClick={markAllRead} style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
            <Icon name="Check" size={15} /> Mark all read
          </Button>
        </div>
      )}

      <div className={twoCol()}>
        <div>
          <div className={inboxHead()}>
            <h2 style={{ fontSize: "1.4rem" }}>Question inbox</h2>
            {messages.length > 0 && (
              <Button variant="ghost" onClick={markAllRead} style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                Mark all read
              </Button>
            )}
          </div>
          {busy ? (
            <Card>
              <Spinner />
            </Card>
          ) : messages.length === 0 ? (
            <EmptyState>
              <Icon name="Message" size={32} color="#cbd5e1" />
              <p style={{ marginTop: 12 }}>No questions yet. When someone uses the chat bubble, it shows up here.</p>
            </EmptyState>
          ) : (
            messages.map((m) => {
              const isNew = !m.handled && (!lastRead || new Date(m.created_at) > new Date(lastRead));
              return (
                <div key={m.id} className={msgCard({ $new: isNew })}>
                  <div className="top">
                    <Avatar name={m.user_email ?? "?"} size="34px" />
                    <span className="email">{m.user_email ?? "Anonymous"}</span>
                    <span className="time">{new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text">{m.message}</p>
                  <div className="actions">
                    <span className={tag({}) + (m.handled ? " done" : " new")}>{m.handled ? "Handled" : isNew ? "New" : "Open"}</span>
                    <button className={miniBtn()} onClick={() => toggleHandled(m)}>
                      <Icon name={m.handled ? "ArrowLeft" : "Check"} size={14} />
                      {m.handled ? "Reopen" : "Mark handled"}
                    </button>
                    <button className={miniBtn() + " danger"} onClick={() => removeMsg(m)}>
                      <Icon name="Trash" size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div>
          <div className={inboxHead()}>
            <h2 style={{ fontSize: "1.4rem" }}>Members ({profiles.length})</h2>
            <Link to="/about" style={{ fontSize: "0.85rem", color: "#0d9488", fontWeight: 600 }}>
              Public list
            </Link>
          </div>
          <div className={membersList()}>
            {profiles.length === 0 ? (
              <Card>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No members yet.</p>
              </Card>
            ) : (
              profiles.map((p: Profile) => {
                const name = p.display_name || p.email?.split("@")[0] || "Member";
                const hash = Array.from(name).reduce((h, c) => (h + c.charCodeAt(0)) % 4, 0);
                const bgs = [
                  "linear-gradient(135deg,#14b8a6,#0d9488)",
                  "linear-gradient(135deg,#ec4899,#db2777)",
                  "linear-gradient(135deg,#6366f1,#4338ca)",
                  "linear-gradient(135deg,#f59e0b,#d97706)",
                ];
                return (
                  <div key={p.id} className={memberRow()}>
                    <Avatar name={name} size="38px" bg={bgs[hash]} />
                    <div className="info">
                      <div className="name">{name}</div>
                      <div className="email">{p.email}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Card style={{ marginTop: 24, background: "#f0fdfa", borderColor: "#ccfbf1" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Icon name="Users" size={20} color="#0d9488" />
              <div>
                <strong>Manage founders</strong>
                <p style={{ color: "#475569", fontSize: "0.9rem", marginTop: 4 }}>
                  Edit photos, names, and descriptions — or add a 5th founder.
                </p>
                <Link to="/founders" style={{ color: "#0d9488", fontWeight: 600, fontSize: "0.9rem", marginTop: 8, display: "inline-flex", gap: 6, alignItems: "center" }}>
                  Go to founders <Icon name="ArrowRight" size={15} />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
