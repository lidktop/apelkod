import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft, Bot, User } from 'lucide-react';
import { useApp } from '@/AppState';

interface ChatPageProps {
  onBack: () => void;
}

export default function ChatPage({ onBack }: ChatPageProps) {
  const { data, sendMessage, markChatRead } = useApp();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = data.chats.find(c => c.id === activeChat);

  useEffect(() => {
    if (activeChat) markChatRead(activeChat);
  }, [activeChat, data.chats, markChatRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeChat) return;
    sendMessage(activeChat, input.trim());
    setInput('');
  };

  if (data.chats.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-neutral-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Пока нет чатов</h2>
          <p className="text-neutral-400 text-sm mb-6">
            Чаты открываются после подтверждения сделки. Найдите партнёра в каталоге и предложите бартер.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
          >
            <ArrowLeft size={18} />
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen flex">
      {/* Chat list */}
      <div className={`w-full sm:w-80 border-r border-ink-800 flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-ink-800 flex items-center gap-3">
          <button onClick={onBack} className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-white">Чаты</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {data.chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-ink-800 transition-colors text-left ${
                activeChat === chat.id ? 'bg-ink-800' : 'hover:bg-ink-850'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                <span className="text-orange-500 font-semibold text-sm">{chat.businessName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white text-sm truncate">{chat.businessName}</span>
                  {chat.unread && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 animate-pulse" />}
                </div>
                <span className="text-xs text-neutral-500 truncate block">
                  {chat.messages[chat.messages.length - 1]?.text ?? 'Нет сообщений'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
        {activeThread ? (
          <>
            <div className="p-4 border-b border-ink-800 flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="sm:hidden text-neutral-400 hover:text-white">
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                <span className="text-orange-500 font-semibold text-sm">{activeThread.businessName.charAt(0)}</span>
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{activeThread.businessName}</div>
                <div className="text-xs text-orange-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  В сети
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-950/50">
              {activeThread.messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-orange-500/15' : 'bg-ink-700'
                  }`}>
                    {msg.sender === 'user' ? <User size={16} className="text-orange-500" /> : <Bot size={16} className="text-neutral-400" />}
                  </div>
                  <div className={`max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-sm'
                        : 'bg-ink-800 text-neutral-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-neutral-600 mt-1 px-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-ink-800 flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-3 bg-ink-800 border border-ink-700 rounded-xl text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all disabled:bg-ink-700 disabled:text-neutral-600 shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Выберите чат, чтобы начать переписку</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
