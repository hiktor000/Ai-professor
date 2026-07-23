import React, { useState } from 'react';
import { Flashcard, FlashcardDeck, Language } from '../types';
import { translations } from '../translations';
import { BookOpen, Sparkles, RotateCw, ChevronLeft, ChevronRight, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface FlashcardsTabProps {
  language: Language;
  initialContent?: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  language,
  initialContent = '',
}) => {
  const t = translations[language];

  const [topic, setTopic] = useState('');
  const [content, setContent] = useState(initialContent);
  const [cardCount, setCardCount] = useState(8);

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateDeck = async () => {
    if (!topic.trim() && !content.trim()) {
      setErrorMessage(t.flashcards.topicPlaceholder);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content,
          cardCount,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.deck) {
        throw new Error(data.error || t.common.error);
      }

      const generatedDeck: FlashcardDeck = {
        id: Date.now().toString(),
        title: data.deck.deckTitle || topic || 'Flashcards',
        createdAt: new Date().toLocaleDateString(),
        cards: (data.deck.cards || []).map((c: any, idx: number) => ({
          ...c,
          id: c.id || idx.toString(),
          mastered: false,
        })),
      };

      setDeck(generatedDeck);
    } catch (err: any) {
      console.error('Flashcards error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard: Flashcard | undefined = deck?.cards[currentIndex];

  const handleNext = () => {
    if (!deck) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
  };

  const handlePrev = () => {
    if (!deck) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
  };

  const toggleMastered = () => {
    if (!deck || !currentCard) return;
    setDeck({
      ...deck,
      cards: deck.cards.map((c, idx) =>
        idx === currentIndex ? { ...c, mastered: !c.mastered } : c
      ),
    });
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
              Active Recall Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.flashcards.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.flashcards.subtitle}</p>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {!deck ? (
        /* Generator Form */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.flashcards.topicLabel}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.flashcards.topicPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.flashcards.countLabel} ({cardCount})
              </label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value={5}>5 {language === 'ar' ? 'بطاقات' : 'Cards'}</option>
                <option value={8}>8 {language === 'ar' ? 'بطاقات' : 'Cards'}</option>
                <option value={12}>12 {language === 'ar' ? 'بطاقة' : 'Cards'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.quiz.contentLabel}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.quiz.contentPlaceholder}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all resize-none"
            />
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleGenerateDeck}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t.flashcards.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.flashcards.generateBtn}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Card Viewer */
        <div className="space-y-6">
          {/* Deck Header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{deck.title}</h3>
              <p className="text-xs font-semibold text-slate-400">
                {t.flashcards.progressLabel.replace('{current}', (currentIndex + 1).toString()).replace('{total}', deck.cards.length.toString())}
              </p>
            </div>

            <button
              onClick={() => setDeck(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3.5 py-2 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 transition-all shadow-xs"
            >
              {t.flashcards.generateBtn}
            </button>
          </div>

          {/* Interactive Card Container */}
          {currentCard && (
            <div className="perspective-1000 min-h-[280px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <div
                className={`w-full min-h-[280px] rounded-[2.5rem] p-8 border shadow-lg transition-all duration-500 flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-indigo-700/80'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="uppercase tracking-widest text-[10px]">
                    {isFlipped ? (language === 'ar' ? 'الإجابة / الشرح' : 'Answer / Back') : (language === 'ar' ? 'السؤال / المفهوم' : 'Question / Front')}
                  </span>
                  <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 font-bold">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t.flashcards.flipHint}</span>
                  </div>
                </div>

                <div className="my-8 text-center text-base sm:text-xl font-bold leading-relaxed px-4">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>

                {/* Hint if available */}
                {currentCard.hint && !isFlipped && (
                  <div className="mt-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-900/80 shadow-xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? currentCard.hint : (language === 'ar' ? 'إظهار التلميح' : 'Show Hint')}</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-semibold">{currentCard.category || 'General'}</span>
                  {currentCard.mastered && (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {t.flashcards.mastered}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation and Mastery buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            <button
              onClick={toggleMastered}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 shadow-xs ${
                currentCard?.mastered
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{currentCard?.mastered ? t.flashcards.mastered : t.flashcards.needsReview}</span>
            </button>

            <button
              onClick={handleNext}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
