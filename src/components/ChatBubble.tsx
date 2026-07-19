import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  fetchMyChatMessages,
  sendChatMessage,
  type ChatMessage,
} from '../lib/data';

export function ChatBubble() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetchMyChatMessages().then((m) => {
      if (!active) return;
      setMessages(m);
    });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user) return null;

  const send = async () => {
    const v = draft.trim();
    if (!v || sending) return;
    setSending(true);
    setError(null);
    const msg = await sendChatMessage(v);
    setSending(false);
    if (!msg) {
      setError('Could not send. Please try again.');
      return;
    }
    setMessages((m) => [...m, msg]);
    setDraft('');
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-hotpink-500 via-teal-500 to-sunny-400 text-white shadow-[0_10px_30px_-5px_rgba(16,23,70,0.4)] transition-transform hover:scale-105 hover:-translate-y-0.5"
        aria-label="Ask a question"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-96 w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border-2 border-navy-100 bg-white shadow-[0_20px_50px_-10px_rgba(16,23,70,0.35)] animate-pop-in">
          <div className="flex items-center gap-3 bg-navy-900 px-4 py-3 text-white">
            <MessageCircle className="h-5 w-5 text-teal-300" />
            <div>
              <p className="text-sm font-extrabold">Questions? Ask away.</p>
              <p className="text-xs text-navy-200">
                The team sees your messages in the Team Workspace.
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-navy-50/40 p-4">
            {messages.length === 0 ? (
              <p className="mt-8 text-center text-sm text-navy-500">
                No messages yet. Say hi — we're listening.
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.user_id === user.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                        mine
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                          : 'bg-white text-navy-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                      <p
                        className={`mt-1 text-[10px] ${mine ? 'text-teal-100' : 'text-navy-400'}`}
                      >
                        {new Date(m.created_at).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {m.handled && (
                          <span className="ml-1 inline-flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" /> seen
                          </span>
                        )}
                      </p>
                    </div>
                    {m.replies && m.replies.length > 0 && (
                      <div className="mt-1 w-full max-w-[80%] space-y-1">
                        {m.replies.map((r, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-white px-3.5 py-2 text-sm shadow-soft"
                          >
                            <p className="whitespace-pre-wrap break-words text-navy-800">
                              {r.text}
                            </p>
                            <p className="mt-1 text-[10px] text-teal-600">
                              {r.by_email ?? 'Team'} ·{' '}
                              {new Date(r.at).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <p className="px-4 py-1 text-xs font-semibold text-hotpink-600">{error}</p>
          )}

          <div className="flex items-center gap-2 border-t-2 border-navy-100 bg-white p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your question…"
              className="flex-1 rounded-xl border-2 border-navy-100 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-teal-300"
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-hotpink-500 to-teal-500 text-white transition-transform hover:scale-105 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
