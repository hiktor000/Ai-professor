import React from 'react';
import { AcademicLevel, Language, ThemeMode } from '../types';
import { translations } from '../translations';
import { GraduationCap, Moon, Sun, Languages, ShieldCheck, BookOpen } from 'lucide-react';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  academicLevel,
  setAcademicLevel,
  activeTab,
  setActiveTab,
}) => {
  const t = translations[language];

  const tabs = [
    { id: 'chat', label: t.tabs.chat, icon: GraduationCap },
    { id: 'upload', label: t.tabs.upload, icon: BookOpen },
    { id: 'summary', label: t.tabs.summary, icon: BookOpen },
    { id: 'quiz', label: t.tabs.quiz, icon: GraduationCap },
    { id: 'flashcards', label: t.tabs.flashcards, icon: BookOpen },
    { id: 'studyPlan', label: t.tabs.studyPlan, icon: GraduationCap },
    { id: 'history', label: t.tabs.history, icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                {t.appName}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                AI Professor Pro
              </span>
            </div>
          </div>

          {/* Academic Level & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Academic Level Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">{t.academicLevel.label}:</span>
              {(['beginner', 'intermediate', 'advanced'] as AcademicLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setAcademicLevel(level)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    academicLevel === level
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {t.academicLevel[level].split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
              title="Change Language"
            >
              <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              title={t.common.themeToggle}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Security Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.common.secureBackendNotice.split(':')[0]}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-slate-100 dark:border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
