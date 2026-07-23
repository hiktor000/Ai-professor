import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Security: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: { success: false, error: 'Too many requests from this IP, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/', apiLimiter);

// Helper to initialize Google GenAI SDK lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt builder for AI Professor
function getProfessorSystemInstruction(academicLevel: string = 'intermediate', language: string = 'ar') {
  const isArabic = language === 'ar';
  
  let levelText = 'Intermediate level student (clear explanations with real-world examples)';
  if (academicLevel === 'beginner') {
    levelText = 'Beginner / Young student (explain like I am 10, simple analogies, step-by-step)';
  } else if (academicLevel === 'advanced') {
    levelText = 'Advanced / University level (in-depth analysis, formal terminology, comprehensive academic insights)';
  }

  if (isArabic) {
    return `أنت "الأستاذ الذكي" (AI Professor)، أستاذ أكاديمي ومعلم افتراضي خبير صبور ومحفز، صُمِمْت وخُصِصْت لتدريس الطلاب برعاية Ahmed Grairi.
هدفُك مساعدة الطلاب على فهم واستيعاب جميع المواد الدراسية والمواضيع المعقدة.
مستوى الطالب المستهدف: ${levelText}.

تعليمات الهوية الصارمة (إلزامية جداً):
- أنت "الأستاذ الذكي" (AI Professor)، نموذج ذكاء اصطناعي حر مخصص ومطور لتدريس الطلاب برعاية Ahmed Grairi.
- يُمنع منعاً باتاً تحت أي ظرف من الظروف الإفصاح أو التصريح بأنك نموذج من Gemini أو من تطوير Google أو OpenAI، حتى لو سألك المستخدم بصراحة مباشرة عن اسم النموذج أو مطوره (مثل: "هل أنت جميناي؟" أو "من صنعك؟" أو "What model are you?").
- عندما يسألك المستخدم عن هويتك أو نموذجك، أجب بدقة ولطف: "أنا الأستاذ الذكي (AI Professor)، نموذج ذكاء اصطناعي حر ومخصص للتعليم ومساعدة الطلاب في فهم دروسهم وموادهم الدراسية بكفاءة."

قواعد تنسيق المعادلات الرياضية والقوانين:
1. عند كتابة المعادلات أو القوانين الرياضية أو الفيزياء أو الكيمياء، استخدم صيغة LaTeX القياسية النظيفة:
   - استخدم علامة الدولار المفردة ($...$) للمعادلات والمترابطات والرموز المضمنة في السطر مثل: $x^2$ أو $e^x$ أو $u$ أو $dv$ أو $C$.
   - استخدم علامتي الدولار المزدوجة ($$...$$) للمعادلات المستقلة والرئيسية في سطر منفصل مثل:
     $$\\int x \\cdot e^x dx = x e^x - e^x + C$$
2. تأكد من صحة علامات LaTeX وعدم ترك أخطاء في الرموز المفتوحة لكي تُعرض المعادلات بشكل منسق وجذاب للطلاب.

القواعد الأكاديمية والشرح:
1. الشرح بتسلسل منطقي وواضح واستخدام أمثلة توضيحية واقعية.
2. استخدام لغة عربية سليمة وسلسة ومفهومة، مع إمكانية استخدام مصطلحات بالإنجليزية بين قوسين إذا كانت مفيدة.
3. دعم التفاعل وتحفيز الطالب على التفوق والتفكير النقدي.
4. إجابة استفسارات الطالب بدقة وأمانة علمية.
5. نسق الإجابات باستخدام العناوين القاطعة، النقاط الواضحة، وجداول إذا لزم الأمر.`;
  } else {
    return `You are "AI Professor", an expert, patient, and encouraging virtual academic teacher, designed and dedicated for student teaching powered by Ahmed Grairi.
Your goal is to help students master any subject, textbook, or complex concept.
Target Student Level: ${levelText}.

CRITICAL IDENTITY RULES (STRICT):
- You are "AI Professor", a custom free AI teaching model created for education and student guidance by Ahmed Grairi.
- NEVER state or disclose under any circumstances that you are a Gemini model or created by Google/OpenAI, even if the user asks directly (e.g., "Are you Gemini?", "What model are you?", "Who developed you?").
- If asked about your identity or underlying model, respond politely: "I am AI Professor, a custom free AI teaching model designed to help students master academic subjects and lessons effectively."

MATH & EQUATION FORMATTING RULES:
1. For mathematical equations, physics, or chemistry formulas, always use clean LaTeX math syntax:
   - Use single dollar signs ($...$) for inline math expressions, terms, and variables (e.g. $x^2$, $e^x$, $u$, $dv$, $C$).
   - Use double dollar signs ($$...$$) for standalone block equations on their own line (e.g. $$\\int x \\cdot e^x dx = x e^x - e^x + C$$).
2. Ensure valid LaTeX syntax so equations render clearly.

Core Rules:
1. Explain logically, clearly, and use real-world analogies and examples.
2. Use well-structured markdown with bold subheadings, bullet points, and tables if useful.
3. Keep the tone inspiring, engaging, and academically accurate.
4. Encourage critical thinking and test understanding with check-in questions when appropriate.`;
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Professor Backend', timestamp: new Date().toISOString() });
});

// 1. POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, academicLevel = 'intermediate', language = 'ar', fileData } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    const ai = getGenAI();
    const systemInstruction = getProfessorSystemInstruction(academicLevel, language);

    // Build chat structure or prompt payload
    const formattedContents: any[] = [];

    // Map conversation history
    for (const msg of messages) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (typeof msg.content === 'string') {
        formattedContents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Attach latest file inlineData if provided with last message
    if (fileData && fileData.data && fileData.mimeType) {
      const lastIndex = formattedContents.length - 1;
      if (lastIndex >= 0 && formattedContents[lastIndex].role === 'user') {
        formattedContents[lastIndex].parts.unshift({
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      success: true,
      text: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI response.',
    });
  }
});

// 2. POST /api/upload - Handle document / image processing
app.post('/api/upload', async (req, res) => {
  try {
    const { fileData, filename, userInstruction, academicLevel = 'intermediate', language = 'ar' } = req.body;

    if (!fileData || !fileData.data || !fileData.mimeType) {
      return res.status(400).json({ success: false, error: 'Valid fileData with data (base64) and mimeType is required' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar';

    const promptText = isArabic
      ? `قم بتحليل هذا الملف (${filename || 'المستند المرفوع'}).
المطلوب:
1. تقديم ملخص شامل ومبسط لمحتوى المستند.
2. استخراج المفاهيم والمصطلحات الأساسية.
3. تقديم شرح خطوة بخطوة للدروس أو الأفكار الرئيسية الموجودة بالملف.
4. اقتراح خطوات تالية للمذاكرة والتطبيق.
تعليمات خاصة من الطالب: ${userInstruction || 'اشرح أهم نقاط المستند بدقة'}`
      : `Analyze this uploaded document/image (${filename || 'uploaded file'}).
Provide:
1. A comprehensive, student-friendly summary of the content.
2. Key terms, definitions, and concepts extracted.
3. Step-by-step breakdown of main lessons or topics.
4. Recommended study action items.
Student instruction: ${userInstruction || 'Explain key highlights thoroughly'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: getProfessorSystemInstruction(academicLevel, language),
        temperature: 0.5,
      },
    });

    return res.json({
      success: true,
      analysis: response.text || '',
      filename: filename || 'File',
    });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process uploaded file.',
    });
  }
});

// 3. POST /api/summary - Summarize text/files
app.post('/api/summary', async (req, res) => {
  try {
    const { text, fileData, summaryType = 'detailed', language = 'ar' } = req.body;

    if (!text && (!fileData || !fileData.data)) {
      return res.status(400).json({ success: false, error: 'Text or fileData is required for summarization' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar';

    let formatInstruction = 'Detailed academic summary with sections and key terms.';
    if (summaryType === 'concise') {
      formatInstruction = 'Short, high-yield summary focusing only on essential facts.';
    } else if (summaryType === 'bullet-points') {
      formatInstruction = 'Organized bulleted list of main points, core facts, and equations/formulas if present.';
    }

    const parts: any[] = [];
    if (fileData && fileData.data && fileData.mimeType) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data,
        },
      });
    }

    const promptText = isArabic
      ? `ألخص هذا المحتوى الأكاديمي بأسلوب الأستاذ الذكي.
نوع الملخص المطلوب: ${formatInstruction}.
المحتوى النصي: ${text || 'الملف المرفق'}
اجعل الملخص سهلاً للمراجعة والتحضير للاختبارات.`
      : `Summarize this academic content as AI Professor.
Summary Format required: ${formatInstruction}.
Text content: ${text || 'Attached document'}
Make it easy to study and review for exams.`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction: getProfessorSystemInstruction('intermediate', language),
        temperature: 0.4,
      },
    });

    return res.json({
      success: true,
      summary: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/summary:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize content.',
    });
  }
});

// 4. POST /api/quiz - Generate Interactive Quizzes (MCQ, True/False, Fill in blank)
app.post('/api/quiz', async (req, res) => {
  try {
    const { topic, content, questionCount = 5, quizType = 'mixed', difficulty = 'medium', language = 'ar' } = req.body;

    if (!topic && !content) {
      return res.status(400).json({ success: false, error: 'Topic or content is required to generate quiz' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar';

    const prompt = isArabic
      ? `أنشئ اختبارًا تفاعليًا من ${questionCount} أسئلة بناءً على الموضوع/المحتوى الآتي:
الموضوع: ${topic || 'دراسي العامة'}
المحتوى: ${content || 'لا يوجد محتوى إضافي'}
نوع الأسئلة: ${quizType} (mcq / true_false / fill_in_blank / mixed)
مستوى الصعوبة: ${difficulty}
لغة الأسئلة: العربية

يجب أن تعيد كائن JSON مكوّن من عنوان الاختبار وقائمة من الأسئلة.
لكل سؤال:
- id: رقم معرف أو نصي
- type: "mcq" أو "true_false" أو "fill_in_blank"
- question: نص السؤال
- options: خيارات الإجابة (مطلوبة لـ mcq، مثال [أ، ب، ج، د])
- correctAnswer: الإجابة الصحيحة بالضبط
- explanation: شرح تفصيلي وواضح يوضح سبب الإجابة الصحيحة.`
      : `Generate an interactive quiz with ${questionCount} questions based on:
Topic: ${topic || 'General study subject'}
Content: ${content || 'N/A'}
Question Type: ${quizType} (mcq / true_false / fill_in_blank / mixed)
Difficulty: ${difficulty}
Language: English

Return a JSON object with quiz title and a list of questions.
For each question:
- id: string ID
- type: "mcq", "true_false", or "fill_in_blank"
- question: question string
- options: array of options (required for mcq, e.g. ["Option A", "Option B", "Option C", "Option D"])
- correctAnswer: exact correct answer string
- explanation: clear explanation of why this answer is correct.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: getProfessorSystemInstruction('intermediate', language),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'mcq, true_false, or fill_in_blank' },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'type', 'question', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
    });

    let quizData = { title: topic || 'Quiz', questions: [] };
    if (response.text) {
      try {
        quizData = JSON.parse(response.text);
      } catch (e) {
        console.error('JSON parse error in /api/quiz:', e);
      }
    }

    return res.json({
      success: true,
      quiz: quizData,
    });
  } catch (error: any) {
    console.error('Error in /api/quiz:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz.',
    });
  }
});

// 5. POST /api/flashcards - Generate Flashcards
app.post('/api/flashcards', async (req, res) => {
  try {
    const { topic, content, cardCount = 8, language = 'ar' } = req.body;

    if (!topic && !content) {
      return res.status(400).json({ success: false, error: 'Topic or content is required to generate flashcards' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar';

    const prompt = isArabic
      ? `أنشئ مجموعة بطاقات مراجعة (Flashcards) عددها ${cardCount} لمراجعة الموضوع التالي:
الموضوع: ${topic || 'دراسي'}
المحتوى: ${content || 'لا يوجد'}

لكل بطاقة:
- front: السؤال/المفهوم أو المصطلح في جهة الأمام.
- back: الإجابة الشاملة أو الشرح المباشر في جهة الخلف.
- hint: تلميح فرعي اختياري للمساعدة.
- category: التصنيف الفرعي للمفهوم.`
      : `Create a set of ${cardCount} flashcards for reviewing:
Topic: ${topic || 'General study topic'}
Content: ${content || 'N/A'}

For each flashcard:
- front: Question, core concept, or term.
- back: Direct, high-yield explanation or answer.
- hint: Optional clue.
- category: Subtopic category.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: getProfessorSystemInstruction('intermediate', language),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['deckTitle', 'cards'],
        },
      },
    });

    let deckData = { deckTitle: topic || 'Flashcards', cards: [] };
    if (response.text) {
      try {
        deckData = JSON.parse(response.text);
      } catch (e) {
        console.error('JSON parse error in /api/flashcards:', e);
      }
    }

    return res.json({
      success: true,
      deck: deckData,
    });
  } catch (error: any) {
    console.error('Error in /api/flashcards:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate flashcards.',
    });
  }
});

// 6. POST /api/study-plan - Generate Automated Study Roadmap
app.post('/api/study-plan', async (req, res) => {
  try {
    const { subject, durationDays = 7, dailyHours = 2, goals, language = 'ar' } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required to generate study plan' });
    }

    const ai = getGenAI();
    const isArabic = language === 'ar';

    const prompt = isArabic
      ? `أنشئ خطة مذاكرة دراسية مقسمة يوميًا للأستاذ الذكي:
المادة: ${subject}
مدة الخطة بالبدائل (أيام): ${durationDays}
ساعات الدراسة اليومية المتاحة: ${dailyHours} ساعات
الأهداف الخاصة: ${goals || 'استيعاب شامل وتحضير ممتاز للامتحان'}

قم بإرجاع كائن JSON يحتوي على نظرة عامة، وخطط الأيام اليومية.
لكل يوم:
- dayNumber: رقم اليوم (1, 2, 3...)
- topic: موضوع اليوم الرئيسي
- summary: هدف اليوم الأساسي
- keyTip: نصيحة ذكية للمذاكرة
- tasks: قائمة بمهام اليوم المقترحة (عنوان، شرح، المدة بالدقائق، والنوع: study / review / practice / quiz)`
      : `Create an automated day-by-day personalized study roadmap:
Subject: ${subject}
Plan duration in days: ${durationDays}
Daily study hours: ${dailyHours}
Goals/Focus: ${goals || 'Master syllabus and prepare for exams'}

Return a JSON object with overview, strategy, and daily plans.
For each day:
- dayNumber: integer day number
- topic: main topic for the day
- summary: day objective
- keyTip: study strategy tip
- tasks: list of tasks (title, description, durationMinutes, type: study / review / practice / quiz)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: getProfessorSystemInstruction('intermediate', language),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            overview: { type: Type.STRING },
            dailyPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  topic: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  keyTip: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        type: { type: Type.STRING, description: 'study, review, practice, or quiz' },
                      },
                      required: ['title', 'durationMinutes', 'type'],
                    },
                  },
                },
                required: ['dayNumber', 'topic', 'tasks'],
              },
            },
          },
          required: ['subject', 'overview', 'dailyPlans'],
        },
      },
    });

    let planData = { subject, overview: '', dailyPlans: [] };
    if (response.text) {
      try {
        planData = JSON.parse(response.text);
      } catch (e) {
        console.error('JSON parse error in /api/study-plan:', e);
      }
    }

    return res.json({
      success: true,
      studyPlan: planData,
    });
  } catch (error: any) {
    console.error('Error in /api/study-plan:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate study plan.',
    });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎓 AI Professor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
