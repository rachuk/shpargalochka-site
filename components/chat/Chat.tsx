'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAuth, buildWsUrl, getAccessToken } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  is_read: boolean;
  created_at: string;
  file?: { id: number; file_url: string; type_file: string; thumbnail_url?: string } | null;
}

interface ChatProps {
  taskId: number;
  className?: string;
}

export function Chat({ taskId, className = '' }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAuth<{ results: Message[]; has_more: boolean }>(`/chats/${taskId}/messages/`)
      .then(data => {
        setMessages(data.results);
        setHasMore(data.has_more);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskId, scrollToBottom]);

  useEffect(() => {
    const url = buildWsUrl(`/chat/${taskId}/`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'message.new':
          setMessages(prev => [...prev, data.data]);
          setTimeout(scrollToBottom, 50);
          break;
        case 'typing.update':
          if (data.data.user_id !== user?.id) {
            setTyping(data.data.is_typing ? data.data.user_name : null);
          }
          break;
        case 'message.read':
          setMessages(prev => prev.map(m =>
            data.data.message_ids.includes(m.id) ? { ...m, is_read: true } : m
          ));
          break;
      }
    };

    return () => { ws.close(); wsRef.current = null; };
  }, [taskId, user?.id, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setSending(true);
    wsRef.current.send(JSON.stringify({ type: 'message.send', content: text }));
    setInput('');
    setSending(false);
  }, [input]);

  const sendTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'typing.start' }));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wsRef.current?.send(JSON.stringify({ type: 'typing.stop' }));
    }, 2000);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const firstId = messages[0]?.id;
    try {
      const data = await fetchAuth<{ results: Message[]; has_more: boolean }>(`/chats/${taskId}/messages/?before_id=${firstId}`);
      setMessages(prev => [...data.results, ...prev]);
      setHasMore(data.has_more);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  }, [hasMore, loadingMore, messages, taskId]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content', file.name);
      const token = getAccessToken();
      try {
        await fetch(`/miniapp/api/v1/chats/${taskId}/messages/upload/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } catch (e) { console.error('Upload failed:', e); }
    }
  }, [taskId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="w-6 h-6 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col dash-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dash-border)] bg-[var(--dash-accent-bg)]/30">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-sm font-semibold text-[var(--dash-text)]">Чат</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--dash-success)]' : 'bg-gray-300'}`} />
          <span className="text-xs text-[var(--dash-text-muted)]">{connected ? 'Онлайн' : 'Офлайн'}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 chat-scroll">
        {hasMore && (
          <button onClick={loadMore} disabled={loadingMore}
            className="w-full text-center text-xs text-[var(--dash-accent)] hover:underline py-2 disabled:opacity-50">
            {loadingMore ? 'Завантаження...' : '↑ Завантажити попередні'}
          </button>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[var(--dash-text-muted)] text-sm">Повідомлень поки немає</p>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5 opacity-60">Напишіть першими</p>
          </div>
        )}

        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? 'bg-[var(--dash-accent)] text-white rounded-br-lg'
                  : 'bg-[var(--dash-accent-bg)] text-[var(--dash-text)] rounded-bl-lg'
              }`}>
                {!isMine && (
                  <p className="text-[11px] font-semibold mb-0.5 text-[var(--dash-accent)]">
                    {msg.sender_name}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                {msg.file && (
                  <a href={msg.file.file_url} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs mt-1.5 underline ${isMine ? 'text-white/70' : 'text-[var(--dash-accent)]'}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    {msg.file.file_url.split('/').pop()}
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
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-[var(--dash-accent-bg)] rounded-2xl rounded-bl-lg px-4 py-2.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--dash-text-muted)]">{typing}</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--dash-border)] p-3 bg-white">
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2.5 text-[var(--dash-text-muted)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-accent-bg)] rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
          <textarea value={input}
            onChange={e => { setInput(e.target.value); sendTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Написати повідомлення..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--dash-border)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20 focus:border-[var(--dash-accent)] transition-all" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="shrink-0 p-2.5 bg-[var(--dash-accent)] text-white rounded-xl hover:bg-[var(--dash-accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
