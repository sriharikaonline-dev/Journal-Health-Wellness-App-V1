import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.tsx";
import { supabase } from "../lib/supabase.ts";
import { Avatar, Button } from "./ui.tsx";
import { Icon } from "./Icon.tsx";
import { AuthModal } from "./AuthModal.tsx";
import { styled, injectGlobal } from "../lib/styled.tsx";

const navCls = styled("header")`
  position: sticky;
  top: 0;
  z-index: 80;
  background: rgba(255, 253, 247, 0.82);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  transition: box-shadow 0.2s ease, background 0.2s ease;
`;
const inner = styled("div")`
  max-width: 1180px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
`;
const brand = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 1.2rem;
  color: #0f172a;
  letter-spacing: -0.01em;
`;
const logo = styled("span")`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.32);
`;
const links = styled("nav")`
  display: flex;
  gap: 4px;
  margin-left: 8px;
  flex: 1;
`;
const linkCls = styled("a")`
  padding: 9px 14px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.94rem;
  color: #475569;
  transition: color 0.15s ease, background 0.15s ease;
  &:hover {
    color: #0f172a;
    background: rgba(241, 245, 249, 0.7);
  }
  &.active {
    color: #0d9488;
    background: #f0fdfa;
  }
`;
const right = styled("div")`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const menuBtn = styled("button")`
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  &:hover {
    background: #f1f5f9;
  }
  @media (max-width: 860px) {
    display: inline-flex;
  }
`;
const mobileNav = styled("nav")`
  display: none;
  flex-direction: column;
  padding: 8px 20px 18px;
  background: #fffdf7;
  border-bottom: 1px solid #e2e8f0;
  animation: fadeUp 0.18s ease;
  @media (max-width: 860px) {
    display: flex;
  }
  a {
    padding: 12px 14px;
    border-radius: 12px;
    color: #334155;
    font-weight: 500;
    &.active {
      color: #0d9488;
      background: #f0fdfa;
    }
  }
`;
const teamBadge = styled("a")`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
  }
`;

const desktopLinks = styled("span")`
  display: inline-flex;
  gap: 4px;
  @media (max-width: 860px) {
    display: none;
  }
`;

injectGlobal(`
.mj-link-active { color:#0d9488 !important; background:#f0fdfa; }
`);

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/founders", label: "Founders" },
  { to: "/explore", label: "Explore" },
  { to: "/blog", label: "Journal" },
  { to: "/check-in", label: "Check-in" },
];

export function Navbar() {
  const { user, isOwner } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <>
      <header className={navCls()}>
        <div className={inner()}>
          <Link to="/" className={brand()}>
            <span className={logo()}>M</span>
            MY Journal
          </Link>
          <nav className={links()}>
            <span className={desktopLinks()}>
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `${linkCls()} ${isActive ? "mj-link-active" : ""}`}
                >
                  {n.label}
                </NavLink>
              ))}
            </span>
          </nav>
          <div className={right()}>
            {isOwner && (
              <Link to="/workspace" className={teamBadge()}>
                <Icon name="Bell" size={16} /> Team Workspace
              </Link>
            )}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link to="/account" aria-label="Account">
                  <Avatar name={user.email} size="38px" />
                </Link>
                <Button variant="ghost" onClick={signOut} style={{ padding: "8px 14px" }}>
                  <Icon name="LogOut" size={16} /> Sign out
                </Button>
              </div>
            ) : (
              <Button variant="primary" onClick={() => setAuthOpen(true)} style={{ padding: "10px 18px" }}>
                Sign in
              </Button>
            )}
            <button className={menuBtn()} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <Icon name={menuOpen ? "Close" : "Menu"} size={22} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className={mobileNav()}>
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? "mj-link-active" : "")}
              >
                {n.label}
              </NavLink>
            ))}
            {isOwner && (
              <Link to="/workspace" onClick={() => setMenuOpen(false)}>
                Team Workspace
              </Link>
            )}
            {user && (
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                My account
              </Link>
            )}
          </nav>
        )}
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
