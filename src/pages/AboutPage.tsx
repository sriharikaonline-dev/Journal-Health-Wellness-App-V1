import { Link } from "react-router-dom";
import { useMemberCount, useProfiles } from "../lib/useMembers.ts";
import { useAuth } from "../lib/auth.tsx";
import { Avatar, Card, EmptyState, Pill } from "../components/ui.tsx";
import { Icon } from "../components/Icon.tsx";
import { styled } from "../lib/styled.tsx";

const hero = styled("section")`
  max-width: 880px;
  margin: 0 auto;
  padding: 64px 24px 24px;
  text-align: center;
`;
const lead = styled("p")`
  font-size: 1.18rem;
  color: #475569;
  line-height: 1.65;
  margin-top: 20px;
`;
const section = styled("section")`
  max-width: 1080px;
  margin: 0 auto;
  padding: 48px 24px;
`;
const values = styled("div")`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;
const valCard = styled("div")`
  padding: 26px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  .ic {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: #f0fdfa;
    color: #0d9488;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
  }
  h3 {
    font-size: 1.15rem;
  }
  p {
    color: #64748b;
    margin-top: 8px;
    font-size: 0.94rem;
    line-height: 1.55;
  }
`;
const membersGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 24px;
`;
const memberCard = styled("div")`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  transition: border-color 0.18s ease;
  &:hover {
    border-color: #ccfbf1;
  }
  .info {
    min-width: 0;
  }
  .name {
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .when {
    font-size: 0.8rem;
    color: #94a3b8;
  }
`;
const joinCta = styled("div")`
  margin-top: 28px;
  padding: 26px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f0fdfa, #fdf2f8);
  border: 1px solid #ccfbf1;
  text-align: center;
`;

export function AboutPage() {
  const memberCount = useMemberCount();
  const { user } = useAuth();
  const { profiles, loading } = useProfiles(true);

  return (
    <>
      <section className={hero()}>
        <Pill soft="#f0fdfa" text="#0f766e">
          <Icon name="HeartHand" size={14} /> Our mission
        </Pill>
        <h1 style={{ marginTop: 18 }}>Wellness, without the noise.</h1>
        <p className={lead()}>
          MY Journal was started by students who kept asking the same question: "why does no one teach us this?" We believe
          everyone deserves clear, kind, judgment-free information about their body and mind — written like a friend would
          explain it, not a textbook.
        </p>
      </section>

      <section className={section()}>
        <div className={values()}>
          <div className={valCard()}>
            <div className="ic">
              <Icon name="Heart" size={22} />
            </div>
            <h3>Kindness first</h3>
            <p>No shame, no fear-mongering. Every article assumes you're doing your best — because you are.</p>
          </div>
          <div className={valCard()}>
            <div className="ic" style={{ background: "#fdf2f8", color: "#be185d" }}>
              <Icon name="Sparkles" size={22} />
            </div>
            <h3>Plain language</h3>
            <p>We turn science into sentences a real person would say. If a word feels confusing, we explain it.</p>
          </div>
          <div className={valCard()}>
            <div className="ic" style={{ background: "#eef2ff", color: "#3730a3" }}>
              <Icon name="Shield" size={22} />
            </div>
            <h3>Honesty always</h3>
            <p>Wellness info, not medical advice. We point you to real professionals when something needs more care.</p>
          </div>
        </div>
      </section>

      <section className={section()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Pill soft="#e0f2fe" text="#0369a1">
              <Icon name="Users" size={14} /> Our community
            </Pill>
            <h2 style={{ marginTop: 12 }}>
              {memberCount !== null ? `${memberCount} ${memberCount === 1 ? "member" : "members"}` : "Members"} of MY Journal
            </h2>
            <p style={{ color: "#64748b", marginTop: 8, maxWidth: 560 }}>
              Everyone with an account is part of the team. Here's who's here so far.
            </p>
          </div>
        </div>
        {loading ? (
          <Card style={{ marginTop: 24 }}>
            <p style={{ color: "#64748b" }}>Loading members…</p>
          </Card>
        ) : profiles.length === 0 ? (
          <EmptyState>No members yet — be the first!</EmptyState>
        ) : (
          <div className={membersGrid()}>
            {profiles.map((p) => {
              const name = p.display_name || p.email?.split("@")[0] || "Member";
              const hash = Array.from(name).reduce((h, c) => (h + c.charCodeAt(0)) % 4, 0);
              const bgs = [
                "linear-gradient(135deg,#14b8a6,#0d9488)",
                "linear-gradient(135deg,#ec4899,#db2777)",
                "linear-gradient(135deg,#6366f1,#4338ca)",
                "linear-gradient(135deg,#f59e0b,#d97706)",
              ];
              return (
                <div key={p.id} className={memberCard()}>
                  <Avatar name={name} size="44px" bg={bgs[hash]} />
                  <div className="info">
                    <div className="name">{name}</div>
                    <div className="when">Joined {new Date(p.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!user && (
          <div className={joinCta()}>
            <h3 style={{ fontSize: "1.3rem" }}>Want to join the team?</h3>
            <p style={{ color: "#475569", marginTop: 8, maxWidth: 480, marginInline: "auto" }}>
              Create a free account to save your weekly check-ins and message the team with any questions.
            </p>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                padding: "12px 22px",
                borderRadius: 999,
                background: "#0f172a",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Create an account <Icon name="ArrowRight" size={18} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
