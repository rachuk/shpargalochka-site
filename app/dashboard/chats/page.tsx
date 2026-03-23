'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAuth, buildWsUrl, getAccessToken } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';

interface ChatItem {
  id: number;
  task_id: number;
  task_subject: string;
  client: { id: number; name: string; avatar?: string } | null;
  executor: { id: number; name: string; avatar?: string } | null;
  last_message: { content: string; created_at: string; sender_id: number } | null;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  is_read: boolean;
  created_at: string;
  file?: { id: number; file_url: string; type_file: string } | null;
}

export default function MessengerPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAuth<ChatItem[]>('/chats/')
      .then(setChats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const openChat = useCallback(async (chat: ChatItem) => {
    setSelectedChat(chat);
    setMsgLoading(true);
    setMessages([]);

    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }

    try {
      const data = await fetchAuth<{ results: Message[]; has_more: boolean }>(`/chats/${chat.task_id}/messages/`);
      setMessages(data.results);
      setTimeout(scrollToBottom, 100);
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }

    const ws = new WebSocket(buildWsUrl(`/chat/${chat.task_id}/`));
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message.new') {
        setMessages(prev => [...prev, data.data]);
        setTimeout(scrollToBottom, 50);
      } else if (data.type === 'message.read') {
        setMessages(prev => prev.map(m =>
          data.data.message_ids.includes(m.id) ? { ...m, is_read: true } : m
        ));
      }
    };

    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread_count: 0 } : c));
  }, [scrollToBottom]);

  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setSending(true);
    wsRef.current.send(JSON.stringify({ type: 'message.send', content: text }));
    setInput('');
    setSending(false);
  }, [input]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!selectedChat) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content', file.name);
      const token = getAccessToken();
      try {
        await fetch(`/miniapp/api/v1/chats/${selectedChat.task_id}/messages/upload/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (e) { console.error('Upload failed:', e); }
    }
  }, [selectedChat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredChats = search
    ? chats.filter(c => c.task_subject?.toLowerCase().includes(search.toLowerCase()))
    : chats;

  function getOtherUser(chat: ChatItem): { name: string; avatar?: string | null } {
    if (!user) return { name: '?' };
    if (chat.executor && chat.executor.id !== user.id) return { name: chat.executor.name || '?', avatar: chat.executor.avatar };
    if (chat.client && chat.client.id !== user.id) return { name: chat.client.name || '?', avatar: chat.client.avatar };
    if (chat.executor) return { name: chat.executor.name || '?', avatar: chat.executor.avatar };
    if (chat.client) return { name: chat.client.name || '?', avatar: chat.client.avatar };
    return { name: '?' };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="messenger-layout">
        {/* Left — Chat list */}
        <div className={`messenger-sidebar ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-3 border-b border-[var(--dash-border)]">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Пошук чатів..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="dash-input pl-9 text-sm"
              />
            </div>
          </div>

          {/* Chat items */}
          <div className="flex-1 overflow-y-auto chat-scroll">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[var(--dash-text-muted)]">
                  {chats.length === 0 ? 'Немає активних чатів' : 'Нічого не знайдено'}
                </p>
              </div>
            ) : (
              filteredChats.map(chat => {
                const other = getOtherUser(chat);
                const isActive = selectedChat?.id === chat.id;
                return (
                  <div
                    key={chat.id}
                    className={`messenger-chat-item ${isActive ? 'active' : ''}`}
                    onClick={() => openChat(chat)}
                  >
                    {other.avatar ? (
                      <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--dash-accent-bg)] flex items-center justify-center text-[var(--dash-accent)] font-semibold text-sm shrink-0">
                        {(other.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{other.name}</p>
                        {chat.last_message && (
                          <span className="text-[10px] text-[var(--dash-text-muted)] shrink-0">
                            {new Date(chat.last_message.created_at).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--dash-text-muted)] truncate mt-0.5">
                        {chat.task_subject}
                      </p>
                      {chat.last_message && (
                        <p className="text-xs text-[var(--dash-text-muted)] truncate mt-0.5">
                          {chat.last_message.content}
                        </p>
                      )}
                    </div>
                    {chat.unread_count > 0 && (
                      <span className="bg-[var(--dash-accent)] text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shrink-0">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Chat area */}
        <div className={`messenger-chat ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--dash-accent-bg)] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--dash-text)] mb-1">Оберіть переписку</h3>
              <p className="text-sm text-[var(--dash-text-muted)]">Щоб почати спілкування, оберіть чат зі списку</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--dash-border)] bg-white shrink-0">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 text-[var(--dash-text-muted)]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{selectedChat.task_subject}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--dash-success)]' : 'bg-gray-300'}`} />
                    <span className="text-xs text-[var(--dash-text-muted)]">{connected ? 'Онлайн' : 'Офлайн'}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scroll">
                {msgLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-[var(--dash-text-muted)] text-sm">Повідомлень поки немає</p>
                    <p className="text-xs text-[var(--dash-text-muted)] mt-1 opacity-60">Напишіть першими</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-[var(--dash-accent)] text-white rounded-br-lg'
                            : 'bg-[var(--dash-accent-bg)] text-[var(--dash-text)] rounded-bl-lg'
                        }`}>
                          {!isMine && (
                            <p className="text-[11px] font-semibold mb-0.5 text-[var(--dash-accent)]">{msg.sender_name}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          {msg.file && (
                            <a href={msg.file.file_url || '#'} target="_blank" rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-xs mt-1.5 underline ${isMine ? 'text-white/70' : 'text-[var(--dash-accent)]'}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                              </svg>
                              {(msg.file.file_url || '').split('/').pop() || 'файл'}
                            </a>
                          )}
                          <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : ''}`}>
                            <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-[var(--dash-text-muted)]'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              <span className={`text-[10px] ${msg.is_read ? 'text-white/80' : 'text-white/40'}`}>
                                {msg.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[var(--dash-border)] p-3 bg-white shrink-0">
                <div className="flex items-end gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 p-2.5 text-[var(--dash-text-muted)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-accent-bg)] rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                  </button>
                  <input ref={fileInputRef} type="file" multiple className="hidden"
                    onChange={e => e.target.files && handleFileUpload(e.target.files)} />
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написати повідомлення..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-[var(--dash-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20 focus:border-[var(--dash-accent)] transition-all"
                  />
                  <button onClick={sendMessage} disabled={!input.trim() || sending}
                    className="shrink-0 p-2.5 bg-[var(--dash-accent)] text-white rounded-xl hover:bg-[var(--dash-accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
