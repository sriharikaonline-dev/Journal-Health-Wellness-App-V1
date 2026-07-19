import { Link } from "react-router-dom";
import { Icon } from "./Icon.tsx";
import { styled } from "../lib/styled.tsx";

const wrap = styled("footer")`
  background: #0f172a;
  color: #cbd5e1;
  padding: 64px 24px 32px;
  margin-top: 80px;
`;
const inner = styled("div")`
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 40px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
`;
const col = styled("div")`
  h4 {
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    margin-bottom: 16px;
  }
  a {
    display: block;
    padding: 6px 0;
    color: #cbd5e1;
    font-size: 0.95rem;
    transition: color 0.15s ease;
    &:hover {
      color: #fff;
    }
  }
`;
const brand = styled("div")`
  h3 {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  p {
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 320px;
  }
`;
const bottom = styled("div")`
  max-width: 1180px;
  margin: 48px auto 0;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: #64748b;
`;

export function Footer() {
  return (
    <footer className={wrap()}>
      <div className={inner()}>
        <div className={brand()}>
          <h3>MY Journal</h3>
          <p>
            A friendly wellness library for teens and young adults. Body systems, mind tools, and stories that help you feel a
            little more like yourself.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, color: "#0d9488" }}>
            <Icon name="Leaf" size={20} />
            <Icon name="Heart" size={20} />
            <Icon name="Moon" size={20} />
          </div>
        </div>
        <div className={col()}>
          <h4>Explore</h4>
          <Link to="/explore">Categories</Link>
          <Link to="/explore?tab=body">Body Systems</Link>
          <Link to="/explore?tab=careers">Health Careers</Link>
          <Link to="/check-in">Weekly Check-in</Link>
        </div>
        <div className={col()}>
          <h4>Read</h4>
          <Link to="/blog">Journal</Link>
          <Link to="/about">About</Link>
          <Link to="/founders">Founders</Link>
        </div>
        <div className={col()}>
          <h4>Remember</h4>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6 }}>
            MY Journal is for general wellness info. If you're struggling, please reach out to a trusted adult or healthcare
            professional.
          </p>
        </div>
      </div>
      <div className={bottom()}>
        <span>© {new Date().getFullYear()} MY Journal. Made with care.</span>
        <span>You got this.</span>
      </div>
    </footer>
  );
}
