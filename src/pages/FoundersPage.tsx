import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.ts";
import type { Founder } from "../lib/types.ts";
import { useAuth } from "../lib/auth.tsx";
import { Avatar, Button, Card, EmptyState, ErrorBox, Input, Label, Pill, Spinner, Textarea } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const hero = styled("section")`
  max-width: 880px;
  margin: 0 auto;
  padding: 64px 24px 16px;
  text-align: center;
`;
const lead = styled("p")`
  font-size: 1.12rem;
  color: #475569;
  line-height: 1.65;
  margin-top: 18px;
  max-width: 620px;
  margin-inline: auto;
`;
const section = styled("section")`
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 24px 64px;
`;
const grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
`;
const card = styled("div")`
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  }
  display: flex;
  flex-direction: column;
`;
const photoArea = styled("div")`
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f0fdfa, #fdf2f8);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;
const photoImg = styled("img")`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const body = styled("div")`
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  h3 {
    font-size: 1.2rem;
    margin: 0;
  }
  .role {
    color: #0d9488;
    font-weight: 600;
    font-size: 0.88rem;
  }
  .desc {
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.55;
  }
`;
const editBtn = styled("button")`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  &:hover {
    background: #fff;
  }
`;
const addCard = styled("button")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  border-radius: 22px;
  border: 2px dashed #cbd5e1;
  background: transparent;
  color: #64748b;
  min-height: 280px;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  &:hover {
    border-color: #0d9488;
    color: #0d9488;
    background: #f0fdfa;
  }
`;
const editPanel = styled("div")`
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
const editCard = styled("div")`
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  padding: 32px;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.3);
  animation: pop 0.2s ease;
  max-height: 92vh;
  overflow-y: auto;
`;
const fieldRow = styled("div")`
  margin-bottom: 16px;
`;
const editPhoto = styled("div")`
  width: 110px;
  height: 110px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0fdfa, #fdf2f8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;
const btnRow = styled("div")`
  display: flex;
  gap: 10px;
  margin-top: 22px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

export function FoundersPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Founder | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Founder>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("founders")
      .select("id, name, role, description, photo_url, sort_order, created_at")
      .order("sort_order", { ascending: true });
    if (!error && data) setFounders(data as Founder[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openEdit(f: Founder) {
    setEditing(f);
    setCreating(false);
    setDraft({ name: f.name, role: f.role, description: f.description, photo_url: f.photo_url });
    setError(null);
  }
  function openCreate() {
    setEditing(null);
    setCreating(true);
    setDraft({ name: "", role: "", description: "", photo_url: "" });
    setError(null);
  }
  function closeEdit() {
    setEditing(null);
    setCreating(false);
    setDraft({});
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: (draft.name ?? "").trim() || "Founder Name",
        role: (draft.role ?? "").trim() || "Role",
        description: (draft.description ?? "").trim() || "Add a short description about this founder here.",
        photo_url: (draft.photo_url ?? "").trim() || null,
      };
      if (creating) {
        const nextSort = founders.length > 0 ? Math.max(...founders.map((f) => f.sort_order)) + 1 : 1;
        const { error: err } = await supabase.from("founders").insert({ ...payload, sort_order: nextSort });
        if (err) throw err;
      } else if (editing) {
        const { error: err } = await supabase.from("founders").update(payload).eq("id", editing.id);
        if (err) throw err;
      }
      await load();
      closeEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(f: Founder) {
    if (!confirm(`Remove ${f.name}? This can't be undone.`)) return;
    const { error: err } = await supabase.from("founders").delete().eq("id", f.id);
    if (err) {
      setError(err.message);
      return;
    }
    await load();
  }

  return (
    <>
      <section className={hero()}>
        <Pill soft="#fdf2f8" text="#be185d">
          <Icon name="Users" size={14} /> The team behind it
        </Pill>
        <h1 style={{ marginTop: 18 }}>Meet the founders</h1>
        <p className={lead()}>
          The people who started MY Journal and keep it running. They care about making wellness information feel human.
        </p>
      </section>

      <section className={section()}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spinner />
          </div>
        ) : founders.length === 0 ? (
          <EmptyState>No founders yet.</EmptyState>
        ) : (
          <div className={grid()}>
            {founders.map((f) => (
              <div key={f.id} className={card()}>
                <div className={photoArea()}>
                  {f.photo_url ? (
                    <img src={f.photo_url} alt={f.name} className={photoImg()} />
                  ) : (
                    <Avatar name={f.name} size="88px" bg="linear-gradient(135deg,#14b8a6,#0d9488)" />
                  )}
                  {isOwner && (
                    <>
                      <button className={editBtn()} onClick={() => openEdit(f)} aria-label={`Edit ${f.name}`}>
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        className={editBtn()}
                        style={{ right: 56 }}
                        onClick={() => remove(f)}
                        aria-label={`Remove ${f.name}`}
                      >
                        <Icon name="Trash" size={16} />
                      </button>
                    </>
                  )}
                </div>
                <div className={body()}>
                  <h3>{f.name}</h3>
                  <span className="role">{f.role}</span>
                  <p className="desc">{f.description}</p>
                </div>
              </div>
            ))}
            {isOwner && (
              <button className={addCard()} onClick={openCreate}>
                <Icon name="Plus" size={28} />
                <span style={{ fontWeight: 600 }}>Add another founder</span>
                <span style={{ fontSize: "0.85rem" }}>Need a 5th? Add them here.</span>
              </button>
            )}
          </div>
        )}

        {!authLoading && isOwner && (
          <Card style={{ marginTop: 28, background: "#f0fdfa", borderColor: "#ccfbf1" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Icon name="Settings" size={20} color="#0d9488" />
              <div>
                <strong>Owner tools</strong>
                <p style={{ color: "#475569", fontSize: "0.9rem", marginTop: 4 }}>
                  You can edit any founder's photo, name, role, and description, or add more. Changes show up instantly for
                  everyone.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      {(editing || creating) && (
        <div className={editPanel()} onClick={closeEdit}>
          <div className={editCard()} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: "1.4rem" }}>{creating ? "Add founder" : "Edit founder"}</h2>
              <button onClick={closeEdit} aria-label="Close" style={{ color: "#64748b", padding: 6 }}>
                <Icon name="Close" size={22} />
              </button>
            </div>
            <div className={editPhoto()}>
              {draft.photo_url ? (
                <img src={draft.photo_url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Icon name="User" size={40} color="#94a3b8" />
              )}
            </div>
            <div className={fieldRow()}>
              <Label>Photo URL</Label>
              <Input
                value={draft.photo_url ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, photo_url: e.target.value }))}
                placeholder="https://images.pexels.com/…/photo.jpg"
              />
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 6 }}>
                Paste a direct image link. Leave blank to show initials.
              </p>
            </div>
            <div className={fieldRow()}>
              <Label>Name</Label>
              <Input value={draft.name ?? ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Their full name" />
            </div>
            <div className={fieldRow()}>
              <Label>Role</Label>
              <Input value={draft.role ?? ""} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Co-founder & Editor" />
            </div>
            <div className={fieldRow()}>
              <Label>Description</Label>
              <Textarea
                value={draft.description ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="A short, warm description about this person."
                rows={4}
              />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <div className={btnRow()}>
              <Button variant="ghost" onClick={closeEdit}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Spinner size="18px" /> : creating ? "Add founder" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
