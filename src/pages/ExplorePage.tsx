import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import type { Blog, BodySystem, Category, Profession, SurveyQuestion } from "../lib/types.ts";
import { accent } from "../lib/theme.ts";
import { Card, EmptyState, Pill } from "../components/ui.tsx";
import { Icon, iconForCategory } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const hero = styled("section")`
  max-width: 1080px;
  margin: 0 auto;
  padding: 56px 24px 16px;
`;
const section = styled("section")`
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 24px 64px;
`;
const tabs = styled("div")`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 999px;
  width: fit-content;
  margin: 24px 0 28px;
  flex-wrap: wrap;
`;
const grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;
const tile = styled("a")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    border-color: ${(p) => p.$soft};
  }
  min-height: 150px;
`;
const tileIcon = styled("div")`
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$soft};
  color: ${(p) => p.$text};
`;
const detailHero = styled("section")`
  max-width: 900px;
  margin: 0 auto;
  padding: 56px 24px 16px;
`;
const back = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
  &:hover {
    color: #0f172a;
  }
`;
const listBullet = styled("li")`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  &:last-child {
    border-bottom: none;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => p.$color};
    margin-top: 9px;
    flex-shrink: 0;
  }
`;

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") ?? "topics") as "topics" | "body" | "careers";
  const [cats, setCats] = useState<Category[]>([]);
  const [systems, setSystems] = useState<BodySystem[]>([]);
  const [profs, setProfs] = useState<Profession[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, slug, name, icon, accent, tagline, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => data && setCats(data as Category[]));
    supabase
      .from("body_systems")
      .select("id, slug, name, short, what_it_does, fun_fact, accent, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => data && setSystems(data as BodySystem[]));
    supabase
      .from("medical_professions")
      .select("id, slug, name, accent")
      .order("name", { ascending: true })
      .then(({ data }) => data && setProfs(data as Profession[]));
  }, []);

  function setTab(t: "topics" | "body" | "careers") {
    setParams(t === "topics" ? {} : { tab: t });
  }

  return (
    <>
      <section className={hero()}>
        <Pill soft="#f0fdfa" text="#0f766e">
          <Icon name="Compass" size={14} /> Explore
        </Pill>
        <h1 style={{ marginTop: 16 }}>Find your way in.</h1>
        <p style={{ color: "#475569", marginTop: 10, maxWidth: 560, fontSize: "1.08rem" }}>
          Three ways to explore: wellness topics, how your body works, and the people who make health their life's work.
        </p>
      </section>
      <section className={section()}>
        <div className={tabs()}>
          <button className={tab === "topics" ? "active" : ""} onClick={() => setTab("topics")}>
            Wellness topics
          </button>
          <button className={tab === "body" ? "active" : ""} onClick={() => setTab("body")}>
            Body systems
          </button>
          <button className={tab === "careers" ? "active" : ""} onClick={() => setTab("careers")}>
            Health careers
          </button>
        </div>

        {tab === "topics" && (
          <div className={grid()}>
            {cats.map((c) => {
              const a = accent(c.accent);
              return (
                <Link key={c.id} to={`/explore/${c.slug}`} className={tile({ $soft: a.soft })}>
                  <div className={tileIcon({ $soft: a.soft, $text: a.text })}>
                    <Icon name={iconForCategory(c.icon)} size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem" }}>{c.name}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: 6 }}>{c.tagline}</p>
                  </div>
                  <span style={{ marginTop: "auto", color: a.text, fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Explore <Icon name="ArrowRight" size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "body" && (
          <div className={grid()}>
            {systems.map((s) => {
              const a = accent(s.accent);
              return (
                <Link key={s.id} to={`/explore/body/${s.slug}`} className={tile({ $soft: a.soft })}>
                  <div className={tileIcon({ $soft: a.soft, $text: a.text })}>
                    <Icon name="Body" size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem" }}>{s.name}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 6, lineHeight: 1.5 }}>{s.short}</p>
                  </div>
                  <span style={{ marginTop: "auto", color: a.text, fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Learn more <Icon name="ArrowRight" size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "careers" && (
          <div className={grid()}>
            {profs.map((p) => {
              const a = accent(p.accent);
              return (
                <Link key={p.id} to={`/explore/careers/${p.slug}`} className={tile({ $soft: a.soft })}>
                  <div className={tileIcon({ $soft: a.soft, $text: a.text })}>
                    <Icon name="Stethoscope" size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem" }}>{p.name}</h3>
                  </div>
                  <span style={{ marginTop: "auto", color: a.text, fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Learn more <Icon name="ArrowRight" size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export function CategoryDetailPage() {
  const { slug = "" } = useParams();
  const [cat, setCat] = useState<Category | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("categories")
      .select("id, slug, name, icon, accent, tagline, sort_order")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setCat(data as Category | null);
        if (data) {
          const id = (data as Category).id;
          supabase
            .from("blogs")
            .select("id, slug, title, summary, author, read_minutes, accent, featured, published, category_id, cover_url, created_at, body")
            .eq("published", true)
            .eq("category_id", id)
            .order("created_at", { ascending: false })
            .then(({ data: b }) => b && setBlogs(b as Blog[]));
          supabase
            .from("survey_questions")
            .select("id, category_id, question, prompt, sort_order")
            .eq("category_id", id)
            .order("sort_order", { ascending: true })
            .then(({ data: q }) => q && setQuestions(q as SurveyQuestion[]));
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;
  if (!cat)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <EmptyState>That topic wasn't found.</EmptyState>
      </div>
    );

  const a = accent(cat.accent);

  return (
    <>
      <section className={detailHero()}>
        <Link to="/explore" className={back()}>
          <Icon name="ArrowLeft" size={16} /> All topics
        </Link>
        <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: a.soft, color: a.text, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={iconForCategory(cat.icon)} size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.2rem" }}>{cat.name}</h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: "1.05rem" }}>{cat.tagline}</p>
          </div>
        </div>
      </section>
      <section className={section()}>
        {questions.length > 0 && (
          <Card style={{ marginBottom: 28, background: a.softest, borderColor: a.soft }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Icon name="Smile" size={24} color={a.text} />
              <div>
                <strong>Quick check-in for {cat.name.toLowerCase()}</strong>
                <p style={{ color: "#475569", fontSize: "0.92rem", marginTop: 2 }}>{questions[0].prompt}</p>
              </div>
              <Link
                to="/check-in"
                style={{ marginLeft: "auto", color: a.text, fontWeight: 600, fontSize: "0.9rem", display: "inline-flex", gap: 6, alignItems: "center" }}
              >
                Check in <Icon name="ArrowRight" size={15} />
              </Link>
            </div>
          </Card>
        )}
        <h2 style={{ marginBottom: 18 }}>Articles in {cat.name}</h2>
        {blogs.length === 0 ? (
          <EmptyState>No articles here yet — check back soon.</EmptyState>
        ) : (
          <div className={grid()}>
            {blogs.map((b) => (
              <Link key={b.id} to={`/blog/${b.slug}`} className={tile({ $soft: a.soft })}>
                <Pill soft={a.soft} text={a.text}>
                  {cat.name}
                </Pill>
                <h3 style={{ fontSize: "1.15rem" }}>{b.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 6, lineHeight: 1.5 }}>{b.summary}</p>
                <span style={{ marginTop: "auto", color: "#94a3b8", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="Clock" size={13} /> {b.read_minutes} min · {b.author}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function BodySystemDetailPage() {
  const { slug = "" } = useParams();
  const [sys, setSys] = useState<BodySystem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("body_systems")
      .select("id, slug, name, short, what_it_does, fun_fact, accent, sort_order")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setSys(data as BodySystem | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;
  if (!sys)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <EmptyState>That body system wasn't found.</EmptyState>
      </div>
    );

  const a = accent(sys.accent);
  return (
    <>
      <section className={detailHero()}>
        <Link to="/explore?tab=body" className={back()}>
          <Icon name="ArrowLeft" size={16} /> All body systems
        </Link>
        <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: a.soft, color: a.text, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Body" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.2rem" }}>{sys.name}</h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: "1.05rem" }}>{sys.short}</p>
          </div>
        </div>
      </section>
      <section className={section()}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }} className="bs-grid">
          <Card pad="32px">
            <h2 style={{ fontSize: "1.4rem", marginBottom: 8 }}>What it does</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {sys.what_it_does.map((w, i) => (
                <li key={i} className={listBullet({ $color: a.base })}>
                  <span className="dot" />
                  <span style={{ color: "#334155", lineHeight: 1.55 }}>{w}</span>
                </li>
              ))}
            </ul>
          </Card>
          {sys.fun_fact && (
            <Card pad="32px" style={{ background: a.softest, borderColor: a.soft }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: a.text, marginBottom: 12 }}>
                <Icon name="Sparkles" size={20} />
                <strong>Fun fact</strong>
              </div>
              <p style={{ fontFamily: "Fraunces, serif", fontSize: "1.15rem", color: "#0f172a", lineHeight: 1.5 }}>{sys.fun_fact}</p>
            </Card>
          )}
        </div>
        <style>{`@media(max-width:760px){.bs-grid{grid-template-columns:1fr !important}}`}</style>
      </section>
    </>
  );
}

export function ProfessionDetailPage() {
  const { slug = "" } = useParams();
  const [prof, setProf] = useState<Profession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("medical_professions")
      .select("id, slug, name, accent")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setProf(data as Profession | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;
  if (!prof)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <EmptyState>That career wasn't found.</EmptyState>
      </div>
    );

  const a = accent(prof.accent);
  return (
    <>
      <section className={detailHero()}>
        <Link to="/explore?tab=careers" className={back()}>
          <Icon name="ArrowLeft" size={16} /> All careers
        </Link>
        <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: a.soft, color: a.text, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Stethoscope" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: "2.2rem" }}>{prof.name}</h1>
            <p style={{ color: "#64748b", marginTop: 4, fontSize: "1.05rem" }}>One of the many people who make health their life's work.</p>
          </div>
        </div>
      </section>
      <section className={section()}>
        <Card pad="32px">
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <Icon name="Heart" size={22} color={a.text} />
            <p style={{ color: "#334155", lineHeight: 1.65, fontSize: "1.02rem" }}>
              {prof.name}s help people stay healthy, recover from illness, and understand their bodies. They spend years training
              to care for others — and they're part of why wellness info like what you read on MY Journal matters so much.
            </p>
          </div>
        </Card>
      </section>
    </>
  );
}
