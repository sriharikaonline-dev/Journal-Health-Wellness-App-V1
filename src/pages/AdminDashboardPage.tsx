import { useEffect, useState } from 'react';
import {
  LogOut,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Tag,
  PersonStanding,
  Compass,
  Home,
  Users,
  MessageCircle,
  CheckCircle2,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { routeToHash } from '../lib/router';
import { CONTENT_TYPES } from '../lib/contentConfig';
import {
  fetchAllChatMessages,
  fetchProfiles,
  markChatHandled,
  markChatRead,
  getUnreadCount,
  type ChatMessage,
  type Profile,
} from '../lib/data';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [msgs, profs, count] = await Promise.all([
      fetchAllChatMessages(),
      fetchProfiles(),
      getUnreadCount(),
    ]);
    setMessages(msgs);
    setProfiles(profs);
    setUnread(count);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const clearUnread = async () => {
    if (!user) return;
    await markChatRead(user.id);
    setUnread(0);
  };

  const handle = async (id: string) => {
    await markChatHandled(id);
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, handled: true } : x)));
  };

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

      {/* Chat inbox + members */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Chat inbox */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-extrabold text-navy-900">Questions inbox</h2>
              {unread > 0 && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-hotpink-500 px-2 py-0.5 text-xs font-bold text-white">
                  <Bell className="h-3 w-3" /> {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={clearUnread} className="text-xs font-bold text-teal-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-navy-500">
            Messages sent from the chat bubble by team members.
          </p>

          <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-navy-500">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-navy-500">No questions yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl border-2 p-3.5 ${
                    m.handled
                      ? 'border-navy-100 bg-navy-50/50'
                      : 'border-teal-200 bg-teal-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-navy-700">
                      {m.user_email ?? 'A team member'}
                    </p>
                    <span className="shrink-0 text-[10px] text-navy-400">
                      {new Date(m.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-navy-800">
                    {m.message}
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    {m.handled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Handled
                      </span>
                    ) : (
                      <button
                        onClick={() => handle(m.id)}
                        className="rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-200"
                      >
                        Mark handled
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Members list */}
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-hotpink-600" />
            <h2 className="text-xl font-extrabold text-navy-900">Team members</h2>
            <span className="ml-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-bold text-navy-700">
              {profiles.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-500">
            Everyone with an account on MY Journal.
          </p>

          <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-navy-500">Loading…</p>
            ) : profiles.length === 0 ? (
              <p className="text-sm text-navy-500">No members yet.</p>
            ) : (
              profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-navy-100 bg-white p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-400 via-hotpink-400 to-sunny-300 text-sm font-extrabold text-white">
                    {(p.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-800">
                      {p.email ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-navy-400">
                      Joined {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
