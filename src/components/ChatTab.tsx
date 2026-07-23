import React, { useState, useRef, useEffect } from 'react';
import { AcademicLevel, ChatMessage, Language } from '../types';
import { translations } from '../translations';
import { Send, Paperclip, Trash2, Bot, User, FileText, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { apiFetch } from '../lib/api';

interface ChatTabProps {
  language: Language;
  academicLevel: AcademicLevel;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  language,
  academicLevel,
  messages,
  setMessages,
}) => {
  const t = translations[language];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    mimeType: string;
    data: string; // base64
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds 50MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedFile({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        data: base64Data,
      });
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend && !attachedFile) return;

    setErrorMessage(null);
    const userMessageId = Date.now().toString();

    const newMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttachment: attachedFile
        ? {
            name: attachedFile.name,
            type: attachedFile.type,
            mimeType: attachedFile.mimeType,
          }
        : undefined,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          academicLevel,
          language,
          fileData: currentFile ? { mimeType: currentFile.mimeType, data: currentFile.data } : undefined,
        }),
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setAttachedFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.appName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.academicLevel.label}: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t.academicLevel[academicLevel]}</span>
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl transition-all border border-rose-100 dark:border-rose-900/50 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.chat.clearChat}</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.chat.welcomeTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{t.chat.welcomeSubtitle}</p>

            <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-left rtl:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t.chat.quickSuggestionsTitle}</p>
              <div className="space-y-2">
                {t.chat.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="w-full text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-left rtl:text-right transition-all flex items-center justify-between group font-medium"
                  >
                    <span>{s}</span>
                    <Send className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs rtl:rounded-bl-xs rtl:rounded-br-3xl font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60 rounded-bl-xs rtl:rounded-br-xs rtl:rounded-bl-3xl'
                }`}
              >
                {msg.fileAttachment && (
                  <div className="mb-2 p-2.5 bg-black/10 dark:bg-white/10 rounded-xl flex items-center gap-2 text-xs font-semibold">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{msg.fileAttachment.name}</span>
                  </div>
                )}
                {msg.role === 'model' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>
                )}
                <div className="mt-2 pt-1.5 border-t border-slate-100/80 dark:border-slate-700/50 flex items-center justify-between text-[10px]">
                  <span
                    className={
                      msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }
                  >
                    {msg.timestamp}
                  </span>
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg transition-all ${
                      msg.role === 'user'
                        ? 'hover:bg-indigo-700 text-indigo-100'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    title={t.common.copy}
                  >
                    {copiedMessageId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-500 dark:text-emerald-400">{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="font-medium">{t.chat.aiTyping}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-100 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Input container */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {attachedFile && (
          <div className="mb-2.5 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{attachedFile.name}</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.txt"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            title={t.chat.attachFile}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={isLoading}
            className="flex-1 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 px-5 py-3 rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm outline-none transition-all font-medium"
          />

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center shrink-0"
            title={t.chat.send}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
