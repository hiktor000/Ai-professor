import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { BookOpen, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SummaryTabProps {
  language: Language;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ language }) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [summaryType, setSummaryType] = useState<'detailed' | 'concise' | 'bullet-points'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSummary(null);

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          summaryType,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t.common.error);
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error('Summary error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
              AI Academic Summarizer
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.summary.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.summary.subtitle}</p>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        {/* Style Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            {t.summary.typeLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['detailed', 'concise', 'bullet-points'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSummaryType(type)}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                  summaryType === type
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {t.summary.types[type === 'bullet-points' ? 'bulletPoints' : type]}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t.summary.textPlaceholder}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.summary.textPlaceholder}
            rows={8}
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none transition-all resize-y font-medium"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSummarize}
          disabled={!text.trim() || isLoading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t.summary.generating}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.summary.summarizeBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Output */}
      {summary && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{t.summary.resultTitle}</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.common.copied : t.common.copy}</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium">
            <MarkdownRenderer content={summary} />
          </div>
        </div>
      )}
    </div>
  );
};
