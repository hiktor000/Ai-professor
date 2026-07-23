import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AcademicLevel, Language, Quiz, QuizQuestion } from '../types';
import { translations } from '../translations';
import { GraduationCap, Sparkles, CheckCircle2, XCircle, RotateCcw, AlertCircle, Award } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface QuizTabProps {
  language: Language;
  academicLevel: AcademicLevel;
  initialContent?: string;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  language,
  initialContent = '',
}) => {
  const t = translations[language];

  // Generator form state
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState(initialContent);
  const [questionCount, setQuestionCount] = useState(5);
  const [quizType, setQuizType] = useState<'mixed' | 'mcq' | 'true_false' | 'fill_in_blank'>('mixed');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    if (!topic.trim() && !content.trim()) {
      setErrorMessage(t.quiz.topicPlaceholder);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsSubmitted(false);
    setUserAnswers({});

    try {
      const data = await apiFetch('/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          content,
          questionCount,
          quizType,
          difficulty,
          language,
        }),
      });

      if (!data.quiz) {
        throw new Error(t.common.error);
      }

      const generatedQuiz: Quiz = {
        id: Date.now().toString(),
        title: data.quiz.title || topic || 'Quiz',
        createdAt: new Date().toLocaleDateString(),
        questions: data.quiz.questions || [],
      };

      setActiveQuiz(generatedQuiz);
    } catch (err: any) {
      console.error('Quiz error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitAnswers = () => {
    if (!activeQuiz) return;
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      if (userAns === correctAns) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / activeQuiz.questions.length) * 100);
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const calculateScore = () => {
    if (!activeQuiz) return { correctCount: 0, total: 0, percentage: 0 };
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      if (userAns === correctAns) {
        correctCount++;
      }
    });
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return { correctCount, total, percentage };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
              Interactive Assessment Generator
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.quiz.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.quiz.subtitle}</p>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {!activeQuiz ? (
        /* Quiz Generator Form */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.quiz.topicLabel}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.quiz.topicPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              />
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.quiz.countLabel} ({questionCount})
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value={3}>3 {language === 'ar' ? 'أسئلة' : 'Questions'}</option>
                <option value={5}>5 {language === 'ar' ? 'أسئلة' : 'Questions'}</option>
                <option value={8}>8 {language === 'ar' ? 'أسئلة' : 'Questions'}</option>
                <option value={10}>10 {language === 'ar' ? 'أسئلة' : 'Questions'}</option>
              </select>
            </div>
          </div>

          {/* Type and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.quiz.typeLabel}
              </label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value="mixed">{t.quiz.types.mixed}</option>
                <option value="mcq">{t.quiz.types.mcq}</option>
                <option value="true_false">{t.quiz.types.true_false}</option>
                <option value="fill_in_blank">{t.quiz.types.fill_in_blank}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.quiz.difficultyLabel}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value="easy">{t.quiz.difficulties.easy}</option>
                <option value="medium">{t.quiz.difficulties.medium}</option>
                <option value="hard">{t.quiz.difficulties.hard}</option>
              </select>
            </div>
          </div>

          {/* Optional Source Content */}
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

          {/* Error */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t.quiz.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.quiz.generateBtn}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Active Quiz Player */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {activeQuiz.title}
            </h3>
            <button
              onClick={() => setActiveQuiz(null)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3.5 py-2 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.quiz.retakeBtn}</span>
            </button>
          </div>

          {/* Score Header if submitted */}
          {isSubmitted && (
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-700 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-100 block mb-1">
                  {t.quiz.scoreTitle}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {calculateScore().correctCount} / {calculateScore().total} ({calculateScore().percentage}%)
                </span>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                <Award className="w-10 h-10 text-amber-300" />
              </div>
            </div>
          )}

          {/* Question Items */}
          <div className="space-y-4">
            {activeQuiz.questions.map((q: QuizQuestion, index: number) => {
              const userAns = (userAnswers[q.id] || '').trim();
              const isCorrect = userAns.toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();

              return (
                <div
                  key={q.id || index}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-100 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                      {language === 'ar' ? `السؤال ${index + 1}` : `Question ${index + 1}`} ({q.type})
                    </span>

                    {isSubmitted && (
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {t.quiz.correct}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {t.quiz.incorrect}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">{q.question}</p>

                  {/* Render Options according to type */}
                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2 mb-3">
                      {q.options.map((option, optIdx) => {
                        const isSelected = userAns === option;
                        const isOptionCorrect = option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                        let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300';
                        if (isSelected && !isSubmitted) {
                          optionStyle = 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs';
                        }
                        if (isSubmitted) {
                          if (isOptionCorrect) {
                            optionStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleAnswerChange(q.id, option)}
                            className={`w-full text-left rtl:text-right p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${optionStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'true_false' && (
                    <div className="flex gap-3 mb-3">
                      {[(language === 'ar' ? 'صح' : 'True'), (language === 'ar' ? 'خطأ' : 'False')].map((option) => {
                        const isSelected = userAns.toLowerCase() === option.toLowerCase();
                        const isOptionCorrect = option.toLowerCase() === q.correctAnswer.toLowerCase();

                        let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                        if (isSelected && !isSubmitted) {
                          optionStyle = 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs';
                        }
                        if (isSubmitted) {
                          if (isOptionCorrect) {
                            optionStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
                          }
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleAnswerChange(q.id, option)}
                            className={`flex-1 p-3.5 rounded-2xl border text-center text-xs sm:text-sm font-bold transition-all ${optionStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'fill_in_blank' && (
                    <div className="mb-3">
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={userAns}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب الإجابة هنا...' : 'Type your answer here...'}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium"
                      />
                    </div>
                  )}

                  {/* Explanation box on submit */}
                  {isSubmitted && (
                    <div className="mt-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {t.quiz.explanationLabel}
                      </p>
                      <p className="mb-1">
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {language === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}
                        </strong>{' '}
                        {q.correctAnswer}
                      </p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz button */}
          {!isSubmitted && (
            <button
              onClick={handleSubmitAnswers}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-sm"
            >
              {t.quiz.checkAnswersBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
