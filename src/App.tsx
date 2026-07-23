import React, { useState, useEffect } from 'react';
import { AcademicLevel, ChatMessage, Language, ThemeMode } from './types';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
import { ChatTab } from './components/ChatTab';
import { UploadTab } from './components/UploadTab';
import { SummaryTab } from './components/SummaryTab';
import { QuizTab } from './components/QuizTab';
import { FlashcardsTab } from './components/FlashcardsTab';
import { StudyPlanTab } from './components/StudyPlanTab';
import { HistoryTab } from './components/HistoryTab';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ai_prof_lang') as Language) || 'ar';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ai_prof_theme') as ThemeMode) || 'dark';
  });

  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(() => {
    return (localStorage.getItem('ai_prof_level') as AcademicLevel) || 'intermediate';
  });

  const [activeTab, setActiveTab] = useState<string>('chat');

  // Shared state for transferring extracted content to Quiz or Flashcards
  const [transferContent, setTransferContent] = useState<string>('');

  // Persisted chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ai_prof_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save state effects
  useEffect(() => {
    localStorage.setItem('ai_prof_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ai_prof_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ai_prof_level', academicLevel);
  }, [academicLevel]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_prof_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages to localStorage:', e);
    }
  }, [messages]);

  const handleNavigateToQuiz = (content: string) => {
    setTransferContent(content);
    setActiveTab('quiz');
  };

  const handleNavigateToFlashcards = (content: string) => {
    setTransferContent(content);
    setActiveTab('flashcards');
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased selection:bg-indigo-500 selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Navbar Header */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        academicLevel={academicLevel}
        setAcademicLevel={setAcademicLevel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' && (
          <ChatTab
            language={language}
            academicLevel={academicLevel}
            messages={messages}
            setMessages={setMessages}
          />
        )}

        {activeTab === 'upload' && (
          <UploadTab
            language={language}
            academicLevel={academicLevel}
            onNavigateToQuiz={handleNavigateToQuiz}
            onNavigateToFlashcards={handleNavigateToFlashcards}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab language={language} />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            language={language}
            academicLevel={academicLevel}
            initialContent={transferContent}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsTab
            language={language}
            initialContent={transferContent}
          />
        )}

        {activeTab === 'studyPlan' && (
          <StudyPlanTab language={language} />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            language={language}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {translations[language].appName} (AI Professor). {translations[language].tagline}.</p>
          <div className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-4 py-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs tracking-wide">
            By Ahmed Grairi
          </div>
        </div>
      </footer>
    </div>
  );
}
