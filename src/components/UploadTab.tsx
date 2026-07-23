import React, { useState, useRef } from 'react';
import { AcademicLevel, Language } from '../types';
import { translations } from '../translations';
import { Upload, FileText, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { apiFetch } from '../lib/api';

interface UploadTabProps {
  language: Language;
  academicLevel: AcademicLevel;
  onNavigateToQuiz?: (content: string) => void;
  onNavigateToFlashcards?: (content: string) => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  language,
  academicLevel,
  onNavigateToQuiz,
  onNavigateToFlashcards,
}) => {
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        setErrorMessage('File size exceeds 50MB limit.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

        try {
          const data = await apiFetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              fileData: { data: base64Data, mimeType },
              filename: file.name,
              userInstruction: instruction,
              academicLevel,
              language,
            }),
          });

          setAnalysisResult(data.analysis);
        } catch (err: any) {
          console.error('Upload processing error:', err);
          setErrorMessage(err.message || t.common.error);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
              AI Vision & Document OCR
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.upload.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.upload.subtitle}</p>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-200/80 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Upload className="w-8 h-8" />
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{t.upload.dragDropText}</p>
          <p className="text-xs text-slate-400 font-medium">{t.upload.supportedFormats}</p>

          {file && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-xs">
              {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t.upload.instructionPlaceholder}
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={t.upload.instructionPlaceholder}
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none transition-all resize-none font-medium"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUploadAndAnalyze}
          disabled={!file || isLoading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t.upload.analyzing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.upload.analyzeBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Result Output */}
      {analysisResult && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{t.upload.resultTitle}</h3>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.common.copied : t.common.copy}</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-medium">
            <MarkdownRenderer content={analysisResult} />
          </div>

          {/* Action Links: Convert to Quiz or Flashcards */}
          <div className="pt-2 flex flex-wrap gap-3">
            {onNavigateToQuiz && (
              <button
                onClick={() => onNavigateToQuiz(analysisResult)}
                className="flex-1 min-w-[200px] py-3 px-4 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t.quiz.generateBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}

            {onNavigateToFlashcards && (
              <button
                onClick={() => onNavigateToFlashcards(analysisResult)}
                className="flex-1 min-w-[200px] py-3 px-4 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t.flashcards.generateBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
