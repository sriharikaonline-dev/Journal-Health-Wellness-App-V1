import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "../lib/auth.tsx";
import { Avatar, Button, Card, ErrorBox, Input, Label, Pill, Spinner } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const wrap = styled("section")`
  max-width: 620px;
  margin: 0 auto;
  padding: 56px 24px 80px;
`;
const row = styled("div")`
  margin-bottom: 18px;
`;
const profileCard = styled("div")`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0fdfa, #fdf2f8);
  border: 1px solid #ccfbf1;
  margin-bottom: 28px;
`;

export function AccountPage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.display_name ?? "");
          setSavedName(data.display_name);
        }
      });
  }, [user]);

  if (loading)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/" replace />;

  async function save() {
    setSaving(true);
    setError(null);
    setDone(false);
    const { error: err } = await supabase.from("profiles").update({ display_name: name.trim() || null }).eq("id", user!.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSavedName(name.trim() || null);
    setDone(true);
  }

  const displayName = savedName || user.email?.split("@")[0] || "Member";

  return (
    <section className={wrap()}>
      <Pill soft="#f0fdfa" text="#0f766e">
        <Icon name="User" size={14} /> Your account
      </Pill>
      <h1 style={{ marginTop: 16, fontSize: "2rem" }}>Hi, {displayName}</h1>
      <p style={{ color: "#64748b", marginTop: 8 }}>Manage how you appear on MY Journal.</p>

      <div className={profileCard()} style={{ marginTop: 24 }}>
        <Avatar name={displayName} size="56px" />
        <div>
          <strong style={{ fontFamily: "Fraunces, serif", fontSize: "1.2rem" }}>{displayName}</strong>
          <p style={{ color: "#475569", fontSize: "0.9rem", marginTop: 2 }}>{user.email}</p>
        </div>
      </div>

      <Card pad="28px">
        <h2 style={{ fontSize: "1.2rem", marginBottom: 4 }}>Display name</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 16 }}>
          This is the name shown next to your account on the members list.
        </p>
        <div className={row()}>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
        </div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {done && (
          <div style={{ color: "#0d9488", fontSize: "0.9rem", fontWeight: 600, display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
            <Icon name="CheckCircle" size={16} /> Saved!
          </div>
        )}
        <Button onClick={save} disabled={saving}>
          {saving ? <Spinner size="18px" /> : "Save name"}
        </Button>
      </Card>

      <Card pad="24px" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: "1.1rem" }}>Things you can do</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          <Link to="/check-in" style={{ display: "flex", alignItems: "center", gap: 10, color: "#334155", fontWeight: 500 }}>
            <Icon name="Heart" size={18} color="#0d9488" /> Take the weekly check-in
          </Link>
          <Link to="/blog" style={{ display: "flex", alignItems: "center", gap: 10, color: "#334155", fontWeight: 500 }}>
            <Icon name="Book" size={18} color="#0d9488" /> Browse the journal
          </Link>
          <Link to="/founders" style={{ display: "flex", alignItems: "center", gap: 10, color: "#334155", fontWeight: 500 }}>
            <Icon name="Users" size={18} color="#0d9488" /> Meet the founders
          </Link>
        </div>
      </Card>
    </section>
  );
}
