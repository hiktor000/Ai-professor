import React, { useState } from 'react';
import { Language, StudyPlan } from '../types';
import { translations } from '../translations';
import { Calendar, Sparkles, CheckSquare, Square, Lightbulb, AlertCircle } from 'lucide-react';

interface StudyPlanTabProps {
  language: Language;
}

export const StudyPlanTab: React.FC<StudyPlanTabProps> = ({ language }) => {
  const t = translations[language];

  const [subject, setSubject] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [dailyHours, setDailyHours] = useState(2);
  const [goals, setGoals] = useState('');

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!subject.trim()) {
      setErrorMessage(t.studyPlan.subjectPlaceholder);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          durationDays,
          dailyHours,
          goals,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.studyPlan) {
        throw new Error(data.error || t.common.error);
      }

      const generatedPlan: StudyPlan = {
        id: Date.now().toString(),
        subject: data.studyPlan.subject || subject,
        createdAt: new Date().toLocaleDateString(),
        durationDays,
        dailyHours,
        overview: data.studyPlan.overview || '',
        dailyPlans: data.studyPlan.dailyPlans || [],
      };

      setStudyPlan(generatedPlan);
      setCompletedTaskIds({});
    } catch (err: any) {
      console.error('Study plan error:', err);
      setErrorMessage(err.message || t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
              Personalized Curriculum Roadmap
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.studyPlan.title}</h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-lg mt-0.5">{t.studyPlan.subtitle}</p>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      </div>

      {!studyPlan ? (
        /* Form */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.studyPlan.subjectLabel}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.studyPlan.subjectPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.studyPlan.daysLabel}
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value={3}>3 {language === 'ar' ? 'أيام' : 'Days'}</option>
                <option value={5}>5 {language === 'ar' ? 'أيام' : 'Days'}</option>
                <option value={7}>7 {language === 'ar' ? 'أيام (أسبوع)' : 'Days (1 Week)'}</option>
                <option value={14}>14 {language === 'ar' ? 'يوم (أسبوعين)' : 'Days (2 Weeks)'}</option>
                <option value={30}>30 {language === 'ar' ? 'يوم (شهر)' : 'Days (1 Month)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.studyPlan.hoursLabel}
              </label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-xs sm:text-sm outline-none font-medium transition-all"
              >
                <option value={1}>1 {language === 'ar' ? 'ساعة يومياً' : 'Hour / day'}</option>
                <option value={2}>2 {language === 'ar' ? 'ساعات يومياً' : 'Hours / day'}</option>
                <option value={4}>4 {language === 'ar' ? 'ساعات يومياً' : 'Hours / day'}</option>
                <option value={6}>6 {language === 'ar' ? 'ساعات يومياً' : 'Hours / day'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.studyPlan.goalsLabel}
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder={t.studyPlan.goalsPlaceholder}
              rows={3}
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
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t.studyPlan.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.studyPlan.generateBtn}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Roadmap Display */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{studyPlan.subject}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{studyPlan.overview}</p>
            </div>
            <button
              onClick={() => setStudyPlan(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3.5 py-2 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 transition-all shadow-xs shrink-0"
            >
              {t.studyPlan.generateBtn}
            </button>
          </div>

          <div className="space-y-4">
            {studyPlan.dailyPlans.map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">
                    {t.studyPlan.dayHeader
                      .replace('{day}', day.dayNumber.toString())
                      .replace('{topic}', day.topic)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{day.summary}</span>
                </div>

                <div className="space-y-2.5">
                  {day.tasks.map((task, idx) => {
                    const taskId = `${day.dayNumber}-${idx}`;
                    const isCompleted = !!completedTaskIds[taskId];

                    return (
                      <div
                        key={taskId}
                        onClick={() => toggleTask(taskId)}
                        className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 cursor-pointer transition-all ${
                          isCompleted
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-slate-400 line-through'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <button className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                          {isCompleted ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold">{task.title}</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                              {task.durationMinutes} min ({task.type})
                            </span>
                          </div>
                          {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{task.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {day.keyTip && (
                  <div className="mt-3 p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 font-medium">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{t.studyPlan.tipHeader} </span>
                      <span>{day.keyTip}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
