import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import type { Category, SurveyQuestion } from "../lib/types.ts";
import { accent } from "../lib/theme.ts";
import { useAuth } from "../lib/auth.tsx";
import { Button, EmptyState, Pill } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const hero = styled("section")`
  max-width: 880px;
  margin: 0 auto;
  padding: 56px 24px 16px;
  text-align: center;
`;
const section = styled("section")`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 24px 80px;
`;
const qCard = styled("div")`
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 22px;
  padding: 28px;
  margin-bottom: 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  animation: fadeUp 0.25s ease;
  .q {
    font-family: "Fraunces", serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
  }
  .hint {
    color: #64748b;
    font-size: 0.92rem;
    margin-top: 6px;
  }
`;
const faces = styled("div")`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: space-between;
  flex-wrap: wrap;
`;
const face = styled("button")`
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: #fff;
  transition: all 0.18s ease;
  color: #94a3b8;
  &:hover {
    border-color: #0d9488;
    color: #0d9488;
    transform: translateY(-2px);
  }
  &.selected {
    border-color: ${(p) => p.$color};
    background: ${(p) => p.$soft};
    color: ${(p) => p.$color};
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${(p) => p.$glow};
  }
  .lbl {
    font-size: 0.75rem;
    font-weight: 600;
  }
`;
const progress = styled("div")`
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  margin: 24px 0 6px;
  .bar {
    height: 100%;
    background: linear-gradient(90deg, #14b8a6, #0d9488);
    border-radius: 999px;
    transition: width 0.3s ease;
  }
`;
const doneCard = styled("div")`
  text-align: center;
  padding: 56px 32px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  animation: pop 0.3s ease;
`;

const FACE_SCALE = [
  { label: "Rough", icon: "Frown", value: 1 },
  { label: "Meh", icon: "Meh", value: 2 },
  { label: "Okay", icon: "Smile", value: 3 },
  { label: "Good", icon: "Smile", value: 4 },
  { label: "Great", icon: "Smile", value: 5 },
];

export function CheckInPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("survey_questions")
      .select("id, category_id, question, prompt, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => data && setQuestions(data as SurveyQuestion[]));
    supabase
      .from("categories")
      .select("id, slug, name, icon, accent, tagline, sort_order")
      .order("sort_order", { ascending: true })
      .then(({ data }) => data && setCats(data as Category[]));
    setLoading(false);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? (answeredCount / questions.length) * 100 : 0;

  function pick(qid: string, v: number) {
    setAnswers((a) => ({ ...a, [qid]: v }));
  }

  function submit() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;

  return (
    <>
      <section className={hero()}>
        <Pill soft="#f0fdfa" text="#0f766e">
          <Icon name="Heart" size={14} /> Weekly check-in
        </Pill>
        <h1 style={{ marginTop: 18 }}>How are you, really?</h1>
        <p style={{ color: "#475569", marginTop: 12, fontSize: "1.08rem", maxWidth: 560, marginInline: "auto" }}>
          A quick, honest check across the parts of life that matter. No wrong answers — just a snapshot to notice how you're
          doing.
        </p>
      </section>

      <section className={section()}>
        {submitted ? (
          <div className={doneCard()}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdfa", color: "#0d9488", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon name="CheckCircle" size={36} />
            </div>
            <h2 style={{ fontSize: "1.8rem" }}>Thanks for checking in.</h2>
            <p style={{ color: "#475569", marginTop: 10, maxWidth: 420, marginInline: "auto" }}>
              Noticing how you're doing is the first step. Be kind to yourself this week — you showed up, and that counts.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <Link to="/blog">
                <Button variant="primary">
                  Read something <Icon name="ArrowRight" size={16} />
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => setSubmitted(false)}>
                Check in again
              </Button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <EmptyState>Check-in questions are loading.</EmptyState>
        ) : (
          <>
            <div className={progress()}>
              <div className="bar" style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.82rem", marginBottom: 20 }}>
              <span>{answeredCount} of {questions.length} answered</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            {questions.map((q) => {
              const cat = cats.find((c) => c.id === q.category_id);
              const a = cat ? accent(cat.accent) : accent("teal");
              const sel = answers[q.id];
              return (
                <div key={q.id} className={qCard()}>
                  {cat && (
                    <Pill soft={a.soft} text={a.text} style={{ marginBottom: 10 }}>
                      {cat.name}
                    </Pill>
                  )}
                  <div className="q">{q.question}</div>
                  {q.prompt && <div className="hint">{q.prompt}</div>}
                  <div className={faces()}>
                    {FACE_SCALE.map((f) => (
                      <button
                        key={f.value}
                        className={face({ $color: a.base, $soft: a.soft, $glow: a.glow }) + (sel === f.value ? " selected" : "")}
                        onClick={() => pick(q.id, f.value)}
                      >
                        <Icon name={f.icon} size={26} color={sel === f.value ? a.text : undefined} />
                        <span className="lbl">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Button onClick={submit} disabled={answeredCount === 0} style={{ padding: "14px 32px" }}>
                {answeredCount === questions.length ? "Finish check-in" : `Submit (${answeredCount}/${questions.length})`}
              </Button>
              {!user && (
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 14 }}>
                  Sign in to save your check-ins over time.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
