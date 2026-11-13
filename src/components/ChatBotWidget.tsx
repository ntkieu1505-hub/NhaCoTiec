// src/components/ChatBotWidget.tsx
import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/geminiChatService';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Xin chào anh/chị! 👋 Em là trợ lý ảo của Nhà Có Tiệc. Anh/chị cần em hỗ trợ tư vấn mẫu thiệp cưới, báo giá hay tính năng nào ạ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Gửi kèm lịch sử cuộc trò chuyện
      const reply = await sendMessage(trimmed, messages);
      setMessages([...newHistory, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: `⚠️ ${e?.message || 'Có lỗi xảy ra khi kết nối trợ lý AI.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // Tự động chuyển đổi định dạng markdown links [Text](URL) thành thẻ <a>
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 underline font-semibold hover:text-amber-800 break-all"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-line leading-relaxed">
        {parts.map((p, i) => (typeof p === 'string' ? p : <React.Fragment key={i}>{p}</React.Fragment>))}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {isOpen && (
        <div className="bg-white border border-rose-100 rounded-2xl shadow-2xl flex flex-col h-[500px] w-80 sm:w-96 mb-3 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                💍
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý AI Nhà Có Tiệc</h3>
                <p className="text-xs text-rose-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Sẵn sàng giải đáp 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Thu nhỏ chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white rounded-br-sm'
                      : 'bg-white text-stone-800 border border-stone-100 rounded-bl-sm'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1.5 text-stone-500 text-xs">
                  <span>Trợ lý đang soạn câu trả lời</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input box */}
          <div className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              className="flex-1 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-stone-400"
              placeholder="Nhập câu hỏi cần tư vấn…"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white p-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow transition-all duration-150 flex items-center justify-center shrink-0"
              title="Gửi tin nhắn"
            >
              <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-xl hover:shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
        title="Trợ lý tư vấn Nhà Có Tiệc"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};
