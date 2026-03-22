'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchAuth, buildWsUrl } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';

interface PreviewMessage {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
}

interface PreviewChatProps {
  feedbackId: number;
  className?: string;
}

export function PreviewChat({ feedbackId, className = '' }: PreviewChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAuth<{ results: PreviewMessage[] }>(`/feedbacks/${feedbackId}/messages/`)
      .then(data => {
        setMessages(data.results || []);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [feedbackId, scrollToBottom]);

  useEffect(() => {
    const url = buildWsUrl(`/feedback/${feedbackId}/`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message.new') {
        setMessages(prev => [...prev, data.data]);
        setTimeout(scrollToBottom, 50);
      }
    };

    return () => { ws.close(); wsRef.current = null; };
  }, [feedbackId, scrollToBottom]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'message.send', content: text }));
    setInput('');
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-medium text-gray-700">Обговорення</span>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[350px]">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-xs py-6">Повідомлень поки немає</p>
        )}

        {messages.map(msg => {
          const isMine = msg.sender_id === user?.id;
          return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
              isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
              {!isMine && (
                <p className="text-xs font-medium text-blue-600 mb-0.5">{msg.sender_name}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-0.5 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написати..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="shrink-0 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
