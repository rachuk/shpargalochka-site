'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Load initial messages via REST API
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

  // WebSocket connection
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

    return () => {
      ws.close();
      wsRef.current = null;
    };
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
      const data = await fetchAuth<{ results: Message[]; has_more: boolean; next_before_id?: number }>(
        `/chats/${taskId}/messages/?before_id=${firstId}`
      );
      setMessages(prev => [...data.results, ...prev]);
      setHasMore(data.has_more);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
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
      } catch (e) {
        console.error('Upload failed:', e);
      }
    }
  }, [taskId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-medium text-gray-700">Чат</span>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {hasMore && (
          <button onClick={loadMore} disabled={loadingMore}
            className="w-full text-center text-xs text-blue-600 hover:underline py-1 disabled:opacity-50"
          >
            {loadingMore ? 'Завантаження...' : 'Завантажити попередні'}
          </button>
        )}

        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Повідомлень поки немає</p>
        )}

        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id;
          return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              isMine
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}>
              {!isMine && (
                <p className="text-xs font-medium text-blue-600 mb-0.5">{msg.sender_name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.file && (
                <a href={msg.file.file_url} target="_blank" rel="noopener noreferrer"
                  className={`block text-xs mt-1 underline ${isMine ? 'text-blue-200' : 'text-blue-600'}`}
                >
                  {msg.file.file_url.split('/').pop()}
                </a>
              )}
              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMine && (
                  <span className="text-[10px] text-blue-200">{msg.is_read ? '\u2713\u2713' : '\u2713'}</span>
                )}
              </div>
            </div>
          </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
              <p className="text-xs text-gray-500 italic">{typing} друкує...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); sendTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Написати повідомлення..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
