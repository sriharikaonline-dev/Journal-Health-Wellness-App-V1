import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import type { Blog, Category } from "../lib/types.ts";
import { accent } from "../lib/theme.ts";
import { useMemberCount } from "../lib/useMembers.ts";
import { useAuth } from "../lib/auth.tsx";
import { Card, Pill } from "../components/ui.tsx";
import { Icon, iconForCategory } from "../components/Icon.tsx";
import { styled, injectGlobal } from "../lib/styled.tsx";

const hero = styled("section")`
  position: relative;
  padding: 72px 24px 40px;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding-top: 48px;
    gap: 32px;
  }
`;
const h1 = styled("h1")`
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  line-height: 1.05;
  .accent {
    background: linear-gradient(120deg, #14b8a6, #0d9488 60%, #0f766e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;
const lead = styled("p")`
  font-size: 1.12rem;
  color: #475569;
  line-height: 1.65;
  margin-top: 22px;
  max-width: 560px;
`;
const ctaRow = styled("div")`
  display: flex;
  gap: 14px;
  margin-top: 30px;
  flex-wrap: wrap;
`;
const statRow = styled("div")`
  display: flex;
  gap: 28px;
  margin-top: 36px;
  flex-wrap: wrap;
`;
const section = styled("section")`
  max-width: 1180px;
  margin: 0 auto;
  padding: 56px 24px;
`;
const sectionHead = styled("div")`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
  h2 {
    margin: 0;
  }
  a {
    color: #0d9488;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    &:hover {
      gap: 10px;
    }
    transition: gap 0.18s ease;
  }
`;
const grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
`;
const catCard = styled("a")`
  display: flex;
  flex-direction: column;
  gap: 14px;
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
`;
const catIcon = styled("div")`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$soft};
  color: ${(p) => p.$text};
`;
const blogCard = styled("a")`
  display: block;
  padding: 26px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  }
  h3 {
    margin-top: 14px;
    font-size: 1.25rem;
  }
  p {
    color: #64748b;
    margin-top: 8px;
    font-size: 0.95rem;
    line-height: 1.55;
  }
`;
const meta = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 16px;
`;
const membersStrip = styled("div")`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f0fdfa, #e0f2fe);
  border: 1px solid #ccfbf1;
  border-radius: 20px;
  flex-wrap: wrap;
`;
const avatarsWrap = styled("div")`
  display: flex;
  & > * {
    margin-left: -10px;
    border: 2px solid #f0fdfa;
  }
  & > *:first-child {
    margin-left: 0;
  }
`;
const stat = styled("div")`
  .num {
    font-family: "Fraunces", serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: #0f172a;
  }
  .lbl {
    font-size: 0.82rem;
    color: #64748b;
    font-weight: 500;
    margin-top: 2px;
  }
`;
const heroArt = styled("div")`
  position: relative;
  aspect-ratio: 1;
  border-radius: 32px;
  background: linear-gradient(135deg, #f0fdfa 0%, #fdf2f8 100%);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(13, 148, 136, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 900px) {
    max-width: 420px;
    margin: 0 auto;
  }
`;
const blob = styled("div")`
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  animation: floatY 7s ease-in-out infinite;
`;
void avatarsWrap;

injectGlobal(`
@keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
`);

export function HomePage() {
  const { user } = useAuth();
  const memberCount = useMemberCount();
  const [featured, setFeatured] = useState<Blog[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("id, slug, title, summary, author, read_minutes, accent, featured, published, category_id, cover_url, created_at, body")
      .eq("published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => data && setFeatured(data as Blog[]));
    supabase
      .from("categories")
      .select("id, slug, name, icon, accent, tagline, sort_order")
      .order("sort_order", { ascending: true })
      .limit(4)
      .then(({ data }) => data && setCats(data as Category[]));
  }, []);

  return (
    <>
      <section className={hero()}>
        <div>
          <Pill soft="#f0fdfa" text="#0f766e">
            <Icon name="Sparkles" size={14} /> Wellness for real life
          </Pill>
          <h1 className={h1()} style={{ marginTop: 20 }}>
            Your body and mind,{" "}
            <span className="accent">explained kindly.</span>
          </h1>
          <p className={lead()}>
            MY Journal is a friendly wellness library for teens and young adults. Explore how your body works, pick up simple
            mind tools, and read stories that make you feel a little more like yourself.
          </p>
          <div className={ctaRow()}>
            <Link
              to="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 24px",
                borderRadius: 999,
                background: "#0f172a",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Start exploring <Icon name="ArrowRight" size={18} />
            </Link>
            <Link
              to="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 24px",
                borderRadius: 999,
                background: "transparent",
                color: "#0f172a",
                border: "1.5px solid #e2e8f0",
                fontWeight: 600,
              }}
            >
              Read the journal
            </Link>
          </div>
          <div className={statRow()}>
            <div className={stat()}>
              <div className="num">8</div>
              <div className="lbl">Wellness topics</div>
            </div>
            <div className={stat()}>
              <div className="num">8</div>
              <div className="lbl">Body systems</div>
            </div>
            <div className={stat()}>
              <div className="num">{memberCount ?? "—"}</div>
              <div className="lbl">Members</div>
            </div>
            <div className={stat()}>
              <div className="num">10+</div>
              <div className="lbl">Health careers</div>
            </div>
          </div>
        </div>
        <div className={heroArt()}>
          <div className={blob()} style={{ width: 220, height: 220, background: "rgba(20,184,166,0.35)", top: 40, left: 30 }} />
          <div className={blob()} style={{ width: 160, height: 160, background: "rgba(236,72,153,0.28)", bottom: 60, right: 50, animationDelay: "1.5s" }} />
          <div className={blob()} style={{ width: 110, height: 110, background: "rgba(245,158,11,0.3)", top: 120, right: 100, animationDelay: "0.8s" }} />
          <div style={{ position: "relative", textAlign: "center", color: "#0f766e" }}>
            <Icon name="HeartHand" size={64} strokeWidth={1.6} />
            <p style={{ fontFamily: "Fraunces, serif", fontSize: "1.4rem", marginTop: 12, color: "#0f172a" }}>
              You got this.
            </p>
          </div>
        </div>
      </section>

      <section className={section()}>
        <div className={membersStrip()}>
          <Icon name="Users" size={26} color="#0d9488" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <strong style={{ fontFamily: "Fraunces, serif", fontSize: "1.15rem" }}>
              {memberCount !== null ? `${memberCount} ${memberCount === 1 ? "person has" : "people have"}` : "People are"} joined MY
              Journal
            </strong>
            <p style={{ color: "#475569", fontSize: "0.9rem", marginTop: 2 }}>
              {user
                ? "Thanks for being part of the community."
                : "Create an account to save your check-ins and message the team."}
            </p>
          </div>
          {!user && (
            <Link
              to="/about"
              style={{ color: "#0f766e", fontWeight: 600, fontSize: "0.9rem", display: "inline-flex", gap: 6, alignItems: "center" }}
            >
              Meet the community <Icon name="ArrowRight" size={16} />
            </Link>
          )}
        </div>
      </section>

      <section className={section()} style={{ paddingTop: 8 }}>
        <div className={sectionHead()}>
          <div>
            <Pill soft="#fdf2f8" text="#be185d">
              <Icon name="Compass" size={14} /> Where to start
            </Pill>
            <h2 style={{ marginTop: 12 }}>Explore by topic</h2>
          </div>
          <Link to="/explore">
            See all topics <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className={grid()}>
          {cats.map((c) => {
            const a = accent(c.accent);
            return (
              <Link key={c.id} to={`/explore/${c.slug}`} className={catCard({ $soft: a.soft })}>
                <div className={catIcon({ $soft: a.soft, $text: a.text })}>
                  <Icon name={iconForCategory(c.icon)} size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem" }}>{c.name}</h3>
                  <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: 6 }}>{c.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={section()}>
        <div className={sectionHead()}>
          <div>
            <Pill soft="#eef2ff" text="#3730a3">
              <Icon name="Book" size={14} /> From the journal
            </Pill>
            <h2 style={{ marginTop: 12 }}>Featured reads</h2>
          </div>
          <Link to="/blog">
            All articles <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
        <div className={grid()}>
          {featured.map((b) => {
            const a = accent(b.accent);
            return (
              <Link key={b.id} to={`/blog/${b.slug}`} className={blogCard()}>
                <Pill soft={a.soft} text={a.text}>
                  <Icon name="Star" size={12} /> Featured
                </Pill>
                <h3>{b.title}</h3>
                <p>{b.summary}</p>
                <div className={meta()}>
                  <span>{b.author}</span>
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name="Clock" size={13} /> {b.read_minutes} min
                  </span>
                </div>
              </Link>
            );
          })}
          {featured.length === 0 && (
            <Card>
              <p style={{ color: "#64748b" }}>Featured stories are on the way.</p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
