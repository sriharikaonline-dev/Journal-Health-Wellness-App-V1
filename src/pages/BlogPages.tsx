import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import type { Blog, Category } from "../lib/types.ts";
import { accent } from "../lib/theme.ts";
import { Card, EmptyState, Input, Pill } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
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
const search = styled("div")`
  margin: 22px 0 28px;
  max-width: 480px;
`;
const chips = styled("div")`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
`;
const grid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;
const blogCard = styled("a")`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.25s ease;
  min-height: 220px;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  }
  h3 {
    font-size: 1.25rem;
  }
  p {
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.55;
  }
`;
const meta = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: auto;
`;
const postWrap = styled("article")`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
`;
const postBody = styled("div")`
  margin-top: 28px;
  font-size: 1.08rem;
  line-height: 1.8;
  color: #334155;
  p {
    margin-bottom: 18px;
  }
  strong {
    color: #0f172a;
  }
`;

export function BlogIndexPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("id, slug, title, summary, author, read_minutes, accent, featured, published, category_id, cover_url, created_at, body")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBlogs(data as Blog[]);
        setLoading(false);
      });
    supabase
      .from("categories")
      .select("id, slug, name, icon, accent, tagline, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => data && setCats(data as Category[]));
  }, []);

  const filtered = blogs.filter((b) => {
    if (filter && b.category_id !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <section className={hero()}>
        <Pill soft="#eef2ff" text="#3730a3">
          <Icon name="Book" size={14} /> The journal
        </Pill>
        <h1 style={{ marginTop: 16 }}>Stories & guides</h1>
        <p style={{ color: "#475569", marginTop: 10, maxWidth: 560, fontSize: "1.08rem" }}>
          Short, kind reads on the stuff that actually comes up — sleep, stress, focus, food, and feeling okay about yourself.
        </p>
        <div className={search()}>
          <Input placeholder="Search articles…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>
      <section className={section()}>
        <div className={chips()}>
          <button className={!filter ? "active" : ""} onClick={() => setFilter(null)}>
            All
          </button>
          {cats.map((c) => (
            <button key={c.id} className={filter === c.id ? "active" : ""} onClick={() => setFilter(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState>No articles match your search yet.</EmptyState>
        ) : (
          <div className={grid()}>
            {filtered.map((b) => {
              const a = accent(b.accent);
              const cat = cats.find((c) => c.id === b.category_id);
              return (
                <Link key={b.id} to={`/blog/${b.slug}`} className={blogCard()}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill soft={a.soft} text={a.text}>
                      {cat?.name ?? "Article"}
                    </Pill>
                    {b.featured && (
                      <Pill soft="#fef3c7" text="#b45309">
                        <Icon name="Star" size={12} /> Featured
                      </Pill>
                    )}
                  </div>
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
          </div>
        )}
      </section>
    </>
  );
}

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Blog | null>(null);
  const [cat, setCat] = useState<Category | null>(null);
  const [more, setMore] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("blogs")
      .select("id, slug, title, summary, body, author, read_minutes, accent, featured, published, category_id, cover_url, created_at")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as Blog | null;
        setPost(p);
        if (p?.category_id) {
          supabase
            .from("categories")
            .select("id, slug, name, icon, accent, tagline, sort_order")
            .eq("id", p.category_id)
            .maybeSingle()
            .then(({ data: c }) => setCat(c as Category | null));
          supabase
            .from("blogs")
            .select("id, slug, title, summary, author, read_minutes, accent, featured, published, category_id, cover_url, created_at, body")
            .eq("published", true)
            .eq("category_id", p.category_id)
            .neq("slug", slug)
            .limit(3)
            .then(({ data: m }) => m && setMore(m as Blog[]));
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;
  if (!post)
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <EmptyState>That article isn't here.</EmptyState>
      </div>
    );

  const a = accent(post.accent);
  const paragraphs = post.body.split(/\n+/).filter(Boolean);

  return (
    <article className={postWrap()}>
      <Link to="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontWeight: 500, fontSize: "0.9rem" }}>
        <Icon name="ArrowLeft" size={16} /> Back to journal
      </Link>
      <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
        {cat && (
          <Pill soft={a.soft} text={a.text}>
            {cat.name}
          </Pill>
        )}
        {post.featured && (
          <Pill soft="#fef3c7" text="#b45309">
            <Icon name="Star" size={12} /> Featured
          </Pill>
        )}
      </div>
      <h1 style={{ marginTop: 18, fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>{post.title}</h1>
      <p style={{ color: "#64748b", marginTop: 12, fontSize: "1.05rem", lineHeight: 1.6 }}>{post.summary}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, color: "#94a3b8", fontSize: "0.88rem" }}>
        <span>{post.author}</span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="Clock" size={14} /> {post.read_minutes} min read
        </span>
      </div>
      <div className={postBody()}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <Card style={{ marginTop: 40, background: a.softest, borderColor: a.soft, textAlign: "center" }}>
        <Icon name="HeartHand" size={28} color={a.text} />
        <p style={{ fontFamily: "Fraunces, serif", fontSize: "1.3rem", marginTop: 8, color: "#0f172a" }}>You got this.</p>
      </Card>
      {more.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 18 }}>Keep reading</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18 }}>
            {more.map((b) => (
              <Link
                key={b.id}
                to={`/blog/${b.slug}`}
                style={{ display: "block", padding: 22, borderRadius: 18, background: "#fff", border: "1px solid #f1f5f9" }}
              >
                <h3 style={{ fontSize: "1.1rem" }}>{b.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 6 }}>{b.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
