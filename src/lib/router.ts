import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'survey' }
  | { name: 'survey-results'; categories: string[] }
  | { name: 'blogs' }
  | { name: 'blog'; slug: string }
  | { name: 'body' }
  | { name: 'careers' }
  | { name: 'about' }
  | { name: 'privacy' }
  | { name: 'founders' }
  | { name: 'admin' }
  | { name: 'admin-signin' }
  | { name: 'admin-blogs' }
  | { name: 'admin-blog-edit'; id: string }
  | { name: 'admin-content'; type: string }
  | { name: 'admin-content-edit'; type: string; id: string }
  | { name: 'admin-settings' }
  | { name: 'not-found' };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean) return { name: 'home' };

  const [path, query] = clean.split('?');
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'survey') {
    if (segments[1] === 'results') {
      const params = new URLSearchParams(query ?? '');
      const cats = params.get('cats');
      return {
        name: 'survey-results',
        categories: cats ? cats.split(',').filter(Boolean) : [],
      };
    }
    return { name: 'survey' };
  }
  if (segments[0] === 'blogs') {
    if (segments[1]) return { name: 'blog', slug: segments[1] };
    return { name: 'blogs' };
  }
  if (segments[0] === 'body') return { name: 'body' };
  if (segments[0] === 'careers') return { name: 'careers' };
  if (segments[0] === 'about') return { name: 'about' };
  if (segments[0] === 'privacy') return { name: 'privacy' };
  if (segments[0] === 'founders') return { name: 'founders' };
  if (segments[0] === 'admin') {
    if (segments[1] === 'signin') return { name: 'admin-signin' };
    if (segments[1] === 'blogs') {
      if (segments[2] === 'new') return { name: 'admin-blog-edit', id: 'new' };
      if (segments[2]) return { name: 'admin-blog-edit', id: segments[2] };
      return { name: 'admin-blogs' };
    }
    if (segments[1] === 'content') {
      if (segments[2]) {
        if (segments[3] === 'new') return { name: 'admin-content-edit', type: segments[2], id: 'new' };
        if (segments[3]) return { name: 'admin-content-edit', type: segments[2], id: segments[3] };
        return { name: 'admin-content', type: segments[2] };
      }
    }
    if (segments[1] === 'settings') return { name: 'admin-settings' };
    return { name: 'admin' };
  }
  return { name: 'not-found' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'survey':
      return '#/survey';
    case 'survey-results':
      return `#/survey/results?cats=${route.categories.join(',')}`;
    case 'blogs':
      return '#/blogs';
    case 'blog':
      return `#/blogs/${route.slug}`;
    case 'body':
      return '#/body';
    case 'careers':
      return '#/careers';
    case 'about':
      return '#/about';
    case 'privacy':
      return '#/privacy';
    case 'founders':
      return '#/founders';
    case 'admin':
      return '#/admin';
    case 'admin-signin':
      return '#/admin/signin';
    case 'admin-blogs':
      return '#/admin/blogs';
    case 'admin-blog-edit':
      return `#/admin/blogs/${route.id}`;
    case 'admin-content':
      return `#/admin/content/${route.type}`;
    case 'admin-content-edit':
      return `#/admin/content/${route.type}/${route.id}`;
    case 'admin-settings':
      return '#/admin/settings';
    case 'not-found':
      return '#/404';
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: Route) => {
    const hash = routeToHash(to);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(parseHash(hash));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
