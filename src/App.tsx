import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./lib/auth.tsx";
import { StyleSheetProvider, injectGlobal } from "./lib/styled.tsx";
import { base } from "./lib/base-styles.ts";
import { Navbar } from "./components/Navbar.tsx";
import { Footer } from "./components/Footer.tsx";
import { ChatBubble } from "./components/ChatBubble.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { AboutPage } from "./pages/AboutPage.tsx";
import { FoundersPage } from "./pages/FoundersPage.tsx";
import { ExplorePage, CategoryDetailPage, BodySystemDetailPage, ProfessionDetailPage } from "./pages/ExplorePage.tsx";
import { BlogIndexPage, BlogPostPage } from "./pages/BlogPages.tsx";
import { CheckInPage } from "./pages/CheckInPage.tsx";
import { WorkspacePage } from "./pages/WorkspacePage.tsx";
import { AccountPage } from "./pages/AccountPage.tsx";

injectGlobal(base);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div style={{ maxWidth: 560, margin: "100px auto", textAlign: "center", padding: 24 }}>
      <h1 style={{ fontSize: "2.4rem" }}>404</h1>
      <p style={{ color: "#64748b", marginTop: 10 }}>That page wandered off. Let's get you back.</p>
      <a href="/" style={{ color: "#0d9488", fontWeight: 600, marginTop: 18, display: "inline-block" }}>
        Back home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <StyleSheetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/founders" element={<FoundersPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/explore/body/:slug" element={<BodySystemDetailPage />} />
              <Route path="/explore/careers/:slug" element={<ProfessionDetailPage />} />
              <Route path="/explore/:slug" element={<CategoryDetailPage />} />
              <Route path="/blog" element={<BlogIndexPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ChatBubble />
        </BrowserRouter>
      </AuthProvider>
    </StyleSheetProvider>
  );
}
