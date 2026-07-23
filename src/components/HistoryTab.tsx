import React, { useState } from 'react';
import { ChatMessage, Language } from '../types';
import { translations } from '../translations';
import { BookOpen, Printer, Trash2, ShieldCheck, Download, Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface HistoryTabProps {
  language: Language;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  language,
  messages,
  setMessages,
}) => {
  const t = translations[language];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AI_Professor_History_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
              Secure Learning Archive
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.history.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.history.subtitle}</p>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-all shadow-md shadow-black/10"
            >
              <Printer className="w-4 h-4" />
              <span>{t.history.exportPdf}</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2.5 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-300/30 text-rose-100 hover:bg-rose-500/30 transition-all"
              title={t.history.clearAll}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Security Architecture Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>{t.common.secureBackendNotice}</span>
        </div>
        <p className="leading-relaxed font-medium">
          {language === 'ar'
            ? 'تم تصميم هذا التطبيق بحيث تمر جميع الطلبات عبر الخادم الآمن (Express / Node.js) دون أي إمكانية لكشف مفتاح Gemini API للمستخدم في المتصفح أو تطبيق الـ APK.'
            : 'This app is architected with complete server-side proxies (Express / Node.js). Gemini API keys are completely isolated in server environment variables and never bundled inside client JavaScript or APK builds.'}
        </p>
      </div>

      {/* History Log Display */}
      {messages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.history.empty}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 print:p-0 print:border-none">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {language === 'ar' ? `السجل الحالي (${messages.length} رسائل)` : `Current Conversation Log (${messages.length} messages)`}
            </h3>
          </div>

          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className={m.role === 'model' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-bold'}>
                    {m.role === 'model' ? t.appName : (language === 'ar' ? 'الطالب' : 'Student')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                    <button
                      onClick={() => handleCopyMessage(m.id, m.content)}
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs"
                      title={t.common.copy}
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">{t.common.copied}</span>
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
                {m.role === 'model' ? (
                  <MarkdownRenderer content={m.content} />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-sans font-medium">{m.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
