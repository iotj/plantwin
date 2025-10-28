import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isRegisterPromptVisible: boolean;
  onRegistrationChoice: (choice: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isRegisterPromptVisible, onRegistrationChoice }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 animate-fade-in">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-100">AI 식물 집사에게 더 물어보기</h3>
      </div>
      <div className="p-4 h-80 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
                    <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.44 6.44 0 014.271.572 7.94 7.94 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.94 7.94 0 00-5.48-1.504 6.44 6.44 0 01-4.271-.572L3.5 2.75z" />
                </svg>
              </div>
            )}
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
                    <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.44 6.44 0 014.271.572 7.94 7.94 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.94 7.94 0 00-5.48-1.504 6.44 6.44 0 01-4.271-.572L3.5 2.75z" />
                </svg>
            </div>
            <div className="max-w-xs md:max-w-md p-3 rounded-lg rounded-bl-none bg-zinc-800 text-zinc-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isRegisterPromptVisible && (
        <div className="p-4 pt-0 flex justify-end items-center gap-3 border-b border-zinc-800">
            <button
                onClick={() => onRegistrationChoice(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                Yes
            </button>
             <button
                onClick={() => onRegistrationChoice(false)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-600 transition-colors text-sm"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                No
            </button>
        </div>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
            disabled={isLoading || isRegisterPromptVisible}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isRegisterPromptVisible}
            className="p-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Send chat message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.534l4.267-1.528a.75.75 0 01.95.95l-1.528 4.267a.75.75 0 00.534.95l4.949 1.414a.75.75 0 00.95-.826l-2.289-8.01a.75.75 0 00-.95-.95l-8.01-2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;