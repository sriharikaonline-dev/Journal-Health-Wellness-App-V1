import { useEffect } from 'react';
import { useRouter } from './lib/router';
import { useAuth } from './lib/auth';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SurveyPage } from './pages/SurveyPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { BodyPage } from './pages/BodyPage';
import { CareersPage } from './pages/CareersPage';
import { AboutPage } from './pages/AboutPage';
import { FoundersPage } from './pages/FoundersPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminSignInPage } from './pages/AdminSignInPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminBlogsPage } from './pages/AdminBlogsPage';
import { AdminBlogEditPage } from './pages/AdminBlogEditPage';
import { AdminContentListPage } from './pages/AdminContentListPage';
import { AdminContentEditPage } from './pages/AdminContentEditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ChatBubble } from './components/ChatBubble';

const ADMIN_ROUTES = new Set([
  'admin',
  'admin-blogs',
  'admin-blog-edit',
  'admin-content',
  'admin-content-edit',
  'admin-settings',
]);

function App() {
  const { route, navigate } = useRouter();
  const { user, loading } = useAuth();

  const isAdminRoute = ADMIN_ROUTES.has(route.name);
  const isSignInRoute = route.name === 'admin-signin';

  useEffect(() => {
    if (!loading && isAdminRoute && !isSignInRoute && !user) {
      navigate({ name: 'admin-signin' });
    }
    if (!loading && isSignInRoute && user) {
      navigate({ name: 'admin' });
    }
  }, [loading, isAdminRoute, isSignInRoute, user, navigate]);

  if (isAdminRoute || isSignInRoute) {
    if (loading) {
      return (
        <div className="grid min-h-dvh place-items-center bg-navy-50">
          <div className="relative h-14 w-14">
            <span className="absolute inset-0 animate-ping rounded-full bg-teal-300 opacity-60" />
            <span className="absolute inset-2 rounded-full bg-gradient-to-br from-teal-500 via-hotpink-500 to-sunny-400" />
          </div>
        </div>
      );
    }
    if (isSignInRoute) {
      return <AdminSignInPage />;
    }
    if (!user) {
      return null;
    }
    return (
      <div className="min-h-dvh bg-navy-50">
        {route.name === 'admin' && <AdminDashboardPage />}
        {route.name === 'admin-blogs' && <AdminBlogsPage />}
        {route.name === 'admin-blog-edit' && (
          <AdminBlogEditPage id={route.id} />
        )}
        {route.name === 'admin-content' && (
          <AdminContentListPage type={route.type} />
        )}
        {route.name === 'admin-content-edit' && (
          <AdminContentEditPage type={route.type} id={route.id} />
        )}
        {route.name === 'admin-settings' && <AdminSettingsPage />}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-navy-50">
      <NavBar route={route} />
      <main className="flex-1">
        {route.name === 'home' && <HomePage />}
        {route.name === 'survey' && <SurveyPage />}
        {route.name === 'survey-results' && <SurveyPage />}
        {route.name === 'blogs' && <BlogsPage />}
        {route.name === 'blog' && <BlogDetailPage slug={route.slug} />}
        {route.name === 'body' && <BodyPage />}
        {route.name === 'careers' && <CareersPage />}
        {route.name === 'about' && <AboutPage />}
        {route.name === 'founders' && <FoundersPage />}
        {route.name === 'not-found' && <NotFoundPage />}
      </main>
      <ChatBubble />
      <Footer />
    </div>
  );
}

export default App;
