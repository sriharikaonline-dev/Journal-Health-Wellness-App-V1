import { LogOut, ArrowRight, BookOpen, ClipboardList, Tag, PersonStanding, Compass, Home, type LucideIcon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { CONTENT_TYPES } from '../lib/contentConfig';

const ICONS: Record<string, LucideIcon> = {
  blogs: BookOpen,
  survey_questions: ClipboardList,
  categories: Tag,
  body_systems: PersonStanding,
  medical_professions: Compass,
  site_settings: Home,
};

const ACCENT_CLASS: Record<string, { bg: string; text: string }> = {
  blogs: { bg: 'bg-hotpink-100', text: 'text-hotpink-600' },
  survey_questions: { bg: 'bg-teal-100', text: 'text-teal-600' },
  categories: { bg: 'bg-sunny-100', text: 'text-sunny-600' },
  body_systems: { bg: 'bg-navy-100', text: 'text-navy-700' },
  medical_professions: { bg: 'bg-hotpink-100', text: 'text-hotpink-600' },
  site_settings: { bg: 'bg-teal-100', text: 'text-teal-600' },
};

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();

  const hrefFor = (type: string) => {
    if (type === 'blogs') return routeToHash({ name: 'admin-blogs' });
    if (type === 'site_settings') return routeToHash({ name: 'admin-settings' });
    return routeToHash({ name: 'admin-content', type });
  };

  return (
    <div className="section py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="chip bg-navy-100 text-navy-700">Team Workspace</span>
          <h1 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl">
            What do you want to edit?
          </h1>
          <p className="mt-1 text-sm text-navy-600">
            Signed in as {user?.email}. Pick a section to manage.
          </p>
        </div>
        <button onClick={() => signOut()} className="btn btn-ghost shrink-0">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_TYPES.map((c) => {
          const Icon = ICONS[c.type] ?? BookOpen;
          const ac = ACCENT_CLASS[c.type];
          return (
            <a
              key={c.type}
              href={hrefFor(c.type)}
              className="card group flex items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(16,23,70,0.25)]"
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${ac.bg} ${ac.text} transition-transform group-hover:scale-110 group-hover:-rotate-6`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg font-extrabold text-navy-900">
                  {c.label}
                </h3>
                <p className="mt-1 text-sm text-navy-600">{c.description}</p>
              </div>
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-navy-500" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
