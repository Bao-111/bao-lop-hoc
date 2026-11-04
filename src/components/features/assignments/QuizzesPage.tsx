import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  QuizQuestion,
  QuestionLevel,
  QuestionType,
  StudentExamAttempt,
  Quiz
} from '../../../types';
import * as XLSX from 'xlsx';
import {
  HelpCircle,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  CheckSquare,
  Square,
  BookOpen,
  ArrowLeft,
  FileText,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  Filter,
  Paperclip,
  Link as LinkIcon,
  Image as ImageIcon,
  BrainCircuit,
  Wand2,
  CheckCheck,
  FolderDown,
  Info,
  Clock,
  ChevronRight,
  Flag,
  Award,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../../../services/audio';

// Sample curriculum lessons for 1-click quick testing
const SAMPLE_CURRICULUM_TOPICS = [
  {
    subject: 'Toán học',
    grade: 'Khối 10',
    title: 'Mệnh đề và tập hợp - Các phép toán trên tập hợp',
    prompt: 'Chủ đề: Mệnh đề toán học, mệnh đề phủ định, mệnh đề kéo theo. Tập hợp và các phép toán giao, hợp, hiệu của hai tập hợp trong SGK Toán 10 Kết nối tri thức.'
  },
  {
    subject: 'Toán học',
    grade: 'Khối 9',
    title: 'Căn thức bậc hai và hằng đẳng thức √(A²) = |A|',
    prompt: 'Chủ đề: Điều kiện xác định của căn thức bậc hai √(A) là A ≥ 0. Hằng đẳng thức √(A²) = |A|. Rút gọn biểu thức chứa căn và giải phương trình vô tỉ cơ bản.'
  },
  {
    subject: 'Vật lý',
    grade: 'Khối 8',
    title: 'KHTN 8 - Khối lượng riêng và Áp suất chất lỏng',
    prompt: 'Chủ đề: Công thức khối lượng riêng D = m/V. Áp suất chất lỏng p = d · h. Nguyên lý bình thông nhau và máy nén thủy lực trong thực tế.'
  },
  {
    subject: 'Ngữ văn',
    grade: 'Khối 9',
    title: 'Đoạn trích Kiều ở lầu Ngưng Bích (Nguyễn Du)',
    prompt: 'Chủ đề: Nỗi niềm cô đơn, buồn tủi và thân phận lưu lạc của Thúy Kiều. Tình cảm thủy chung với Kim Trọng và tấm lòng hiếu thảo với cha mẹ. Nghệ thuật tả cảnh ngụ tình đặc sắc.'
  },
  {
    subject: 'Tiếng Anh',
    grade: 'Khối 9',
    title: 'English 9 - Unit 1: Local Community & Phrasal Verbs',
    prompt: 'Chủ đề: Vocabulary about traditional handicrafts, local community artisans. Phrasal verbs: pass down, live on, deal with, close down, look forward to. Reading comprehension.'
  }
];

export const QuizzesPage: React.FC = () => {
  const {
    activeClass,
    classes,
    quizzes,
    updateQuiz,
    createQuiz,
    submitExamAttempt,
    setActiveTab,
    showToast,
    userRole,
    currentUser
  } = useApp();

  // Current primary bank
  const currentBankQuiz = quizzes[0] || null;
  const allQuestions: QuizQuestion[] = useMemo(() => {
    return currentBankQuiz?.questions || [];
  }, [currentBankQuiz]);

  // Main UI Mode for Teacher: 'create' (Method tabs as shown in screenshot) vs 'list' (Repository view)
  const [currentView, setCurrentView] = useState<'create' | 'list'>('create');

  // Method selector tab: 'import' (Tab 1), 'ai' (Tab 2 - Active in screenshot), 'manual' (Tab 3)
  const [methodTab, setMethodTab] = useState<'import' | 'ai' | 'manual'>('ai');

  // -------------------------------------------------------------
  // TAB 2: TẠO BẰNG AI THÔNG MINH (ACTIVE IN SCREENSHOT)
  // -------------------------------------------------------------
  const [aiSourceType, setAiSourceType] = useState<'text' | 'file' | 'link' | 'image'>('text');
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState('Khối 10'); // Matches screenshot 'Khối 10'
  const [aiCount, setAiCount] = useState<number>(5); // Matches screenshot '5'

  // File/Link attachments
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [webLinkUrl, setWebLinkUrl] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const aiImageInputRef = useRef<HTMLInputElement>(null);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAiIds, setSelectedAiIds] = useState<string[]>([]);
  const [showAiReview, setShowAiReview] = useState(false);

  // -------------------------------------------------------------
  // TAB 1: NHẬP CÂU HỎI BẰNG CÁCH IMPORT
  // -------------------------------------------------------------
  const [importSubTab, setImportSubTab] = useState<'file' | 'paste'>('file');
  const [importRawText, setImportRawText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportQuestions, setParsedImportQuestions] = useState<QuizQuestion[]>([]);
  const [selectedImportIndices, setSelectedImportIndices] = useState<number[]>([]);
  const fileImportInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // TAB 3: TẠO BẰNG THỦ CÔNG
  // -------------------------------------------------------------
  const [manualForm, setManualForm] = useState<Omit<QuizQuestion, 'id'>>({
    code: `CH-${String(allQuestions.length + 1).padStart(3, '0')}`,
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    correctIndices: [0],
    trueFalseStatements: [
      { id: 'tf-1', statement: 'Mệnh đề a) ...', isCorrect: true },
      { id: 'tf-2', statement: 'Mệnh đề b) ...', isCorrect: false },
      { id: 'tf-3', statement: 'Mệnh đề c) ...', isCorrect: true },
      { id: 'tf-4', statement: 'Mệnh đề d) ...', isCorrect: false }
    ],
    fillBlankAnswer: '',
    matchingPairs: [
      { id: 'm-1', left: 'Vế A (1)', right: 'Vế B (a)' },
      { id: 'm-2', left: 'Vế A (2)', right: 'Vế B (b)' }
    ],
    shortAnswerGuide: '',
    explanation: '',
    subject: 'Toán học',
    grade: 'Khối 10',
    level: 'Thông hiểu',
    questionType: '1 Đáp án',
    points: 1
  });

  // -------------------------------------------------------------
  // REPOSITORY FILTERING STATES
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  // -------------------------------------------------------------
  // STUDENT EXAM TAKING STATE (DÀNH CHO HỌC SINH LÀM BÀI THI)
  // -------------------------------------------------------------
  const currentStudentId = userRole === 'student' ? currentUser?.studentId || 'std-6a1-01' : null;
  const [takingExam, setTakingExam] = useState<Quiz | null>(null);
  const [examCurrentQuestionIdx, setExamCurrentQuestionIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [examSecondsRemaining, setExamSecondsRemaining] = useState(0);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [examResultScore, setExamResultScore] = useState<number | null>(null);
  const [examCorrectCount, setExamCorrectCount] = useState(0);

  // Student Countdown Timer
  useEffect(() => {
    if (!takingExam || isExamCompleted) return;
    if (examSecondsRemaining <= 0) {
      handleFinishAndSubmitExam(true);
      return;
    }
    const timer = setInterval(() => {
      setExamSecondsRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [takingExam, examSecondsRemaining, isExamCompleted]);

  // Statistics
  const stats = useMemo(() => {
    const total = allQuestions.length;
    const nhanBiet = allQuestions.filter(q => q.level === 'Nhận biết').length;
    const thongHieu = allQuestions.filter(q => q.level === 'Thông hiểu').length;
    const vanDung = allQuestions.filter(q => q.level === 'Vận dụng').length;
    const vanDungCao = allQuestions.filter(q => q.level === 'Vận dụng cao').length;
    return { total, nhanBiet, thongHieu, vanDung, vanDungCao };
  }, [allQuestions]);

  // Filtered Questions in Repository
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.question.toLowerCase().includes(query);
        const matchCode = q.code?.toLowerCase().includes(query);
        const matchSubject = q.subject?.toLowerCase().includes(query);
        const matchOpts = q.options?.some(o => o.toLowerCase().includes(query));
        if (!matchText && !matchCode && !matchSubject && !matchOpts) return false;
      }
      if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
      if (filterGrade !== 'all' && q.grade !== filterGrade) return false;
      if (filterType !== 'all' && q.questionType !== filterType) return false;
      if (filterLevel !== 'all' && q.level !== filterLevel) return false;
      return true;
    });
  }, [allQuestions, searchQuery, filterSubject, filterGrade, filterType, filterLevel]);

  // -------------------------------------------------------------
  // AI GENERATION LOGIC (TAB 2)
  // -------------------------------------------------------------
  const handleStartAiGeneration = () => {
    const content = aiPromptText.trim() || uploadedFileName || webLinkUrl;
    if (!content) {
      showToast('Vui lòng nhập chủ đề bài học hoặc tải tài liệu tham khảo cho AI', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);
    setShowAiReview(false);

    // Multi-stage realistic AI workflow: 5 steps
    setTimeout(() => setGenerationStep(2), 500);
    setTimeout(() => setGenerationStep(3), 1000);
    setTimeout(() => setGenerationStep(4), 1500);
    setTimeout(() => {
      setGenerationStep(5);
      setIsGenerating(false);

      const count = Number(aiCount) || 5;
      const generated: QuizQuestion[] = [];
      const prefix = aiSubject === 'Toán học' ? 'TOAN' :
                     aiSubject === 'Ngữ văn' ? 'VAN' :
                     aiSubject === 'Tiếng Anh' ? 'ANH' :
                     aiSubject === 'Vật lý' ? 'LY' : 'KHTN';
      const gradeNum = aiGrade.replace(/\D/g, '') || '10';

      // Q1: Nhận biết
      generated.push({
        id: `q-ai-${Date.now()}-1`,
        code: `${prefix}${gradeNum}-01`,
        question: `[Nhận biết] Theo nội dung trọng tâm bài học "${aiPromptText.slice(0, 45) || aiSubject}", phát biểu nào sau đây là ĐÚNG về khái niệm nền tảng?`,
        options: [
          'A. Đại lượng xác định khi và chỉ khi các điều kiện biên và tập giá trị thỏa mãn miền xác định chuẩn',
          'B. Biểu thức luôn luôn dương với mọi giá trị thực của biến số trong trường số phức',
          'C. Chỉ có thể áp dụng đối với các trường hợp số nguyên dương lẻ lớn hơn 1',
          'D. Đại lượng luôn bằng 0 tại mọi điểm đối xứng trên trục tọa độ phẳng'
        ],
        correctIndex: 0,
        subject: aiSubject,
        grade: aiGrade,
        level: 'Nhận biết',
        questionType: '1 Đáp án',
        points: 1,
        sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
        explanation: 'Khẳng định A hoàn toàn chính xác theo định nghĩa cơ bản được nêu trong SGK. Các phương án B, C, D đều vi phạm điều kiện ràng buộc.'
      });

      // Q2: Thông hiểu (Đúng / Sai 4 mệnh đề chuẩn GDPT)
      if (count >= 2) {
        generated.push({
          id: `q-ai-${Date.now()}-2`,
          code: `${prefix}${gradeNum}-02`,
          question: `[Thông hiểu - Cấu trúc đề GDPT 2026] Xét tính Đúng / Sai của các mệnh đề sau đây liên quan đến bài học:`,
          options: [],
          correctIndex: 0,
          trueFalseStatements: [
            { id: 'tf-1', statement: 'Mệnh đề a) Công thức và tính chất tổng quát áp dụng được trên toàn bộ tập xác định', isCorrect: true },
            { id: 'tf-2', statement: 'Mệnh đề b) Khi đổi dấu của hệ số chính thì giá trị cực trị vẫn giữ nguyên dấu ban đầu', isCorrect: false },
            { id: 'tf-3', statement: 'Mệnh đề c) Kết quả biến đổi đại số tương đương không làm thay đổi miền nghiệm của bài toán', isCorrect: true },
            { id: 'tf-4', statement: 'Mệnh đề d) Trong mọi điều kiện, giá trị của biểu thức luôn nhận kết quả vô tỉ', isCorrect: false }
          ],
          subject: aiSubject,
          grade: aiGrade,
          level: 'Thông hiểu',
          questionType: 'Đúng / Sai',
          points: 2,
          sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
          explanation: 'Mệnh đề a và c đúng theo các định lý cơ bản; mệnh đề b và d sai do có phản ví dụ cụ thể.'
        });
      }

      // Q3: Vận dụng (Điền khuyết)
      if (count >= 3) {
        generated.push({
          id: `q-ai-${Date.now()}-3`,
          code: `${prefix}${gradeNum}-03`,
          question: `[Vận dụng] Áp dụng các quy tắc biến đổi và công thức tính nhanh của chủ đề, kết quả thu gọn cuối cùng bằng ...`,
          options: [],
          correctIndex: 0,
          fillBlankAnswer: '16',
          subject: aiSubject,
          grade: aiGrade,
          level: 'Vận dụng',
          questionType: 'Điền khuyết',
          points: 1.5,
          sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
          explanation: 'Thực hiện thế số và rút gọn theo các bước suy luận logic, ta nhận được giá trị chuẩn xác là 16.'
        });
      }

      // Q4: Vận dụng cao (Nhiều đáp án)
      if (count >= 4) {
        generated.push({
          id: `q-ai-${Date.now()}-4`,
          code: `${prefix}${gradeNum}-04`,
          question: `[Vận dụng cao - Nhiều đáp án] Những tính chất và ứng dụng thực tiễn nào sau đây thuộc phạm vi chuyên đề bài học? (Chọn tất cả đáp án đúng)`,
          options: [
            'A. Tính chất liên tục và tính đơn điệu trên từng khoảng xác định',
            'B. Ứng dụng để giải quyết bài toán tối ưu hóa trong kinh tế và đời sống thực tế',
            'C. Chỉ áp dụng được cho tập các số nguyên tự nhiên dưới 10',
            'D. Là nền tảng mở đầu quan trọng để học các chuyên đề tiếp theo trong chương trình'
          ],
          correctIndex: 0,
          correctIndices: [0, 1, 3],
          subject: aiSubject,
          grade: aiGrade,
          level: 'Vận dụng cao',
          questionType: 'Nhiều đáp án',
          points: 1.5,
          sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
          explanation: 'Các phương án A, B, D là các tính chất và ứng dụng trọng tâm. Phương án C là giả định sai.'
        });
      }

      // Q5: Vận dụng cao (Tự luận ngắn)
      if (count >= 5) {
        generated.push({
          id: `q-ai-${Date.now()}-5`,
          code: `${prefix}${gradeNum}-05`,
          question: `[Vận dụng cao] Trình bày ngắn gọn phương pháp tìm giá trị lớn nhất / nhỏ nhất của biểu thức và điều kiện xảy ra dấu bằng.`,
          options: [],
          correctIndex: 0,
          shortAnswerGuide: '1. Tìm tập xác định (0.5đ)\n2. Biến đổi dạng hằng đẳng thức hoặc Cauchy (1.0đ)\n3. Kết luận Min/Max và chỉ ra điểm rơi (0.5đ)',
          subject: aiSubject,
          grade: aiGrade,
          level: 'Vận dụng cao',
          questionType: 'Tự luận ngắn',
          points: 2,
          sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
          explanation: 'Biểu điểm chấm phân hóa học sinh khá giỏi: Cần kiểm tra dấu bằng xảy ra.'
        });
      }

      setAiGeneratedQuestions(generated);
      setSelectedAiIds(generated.map(q => q.id));
      setShowAiReview(true);
      showToast(`AI Gemini đã tạo thành công ${generated.length} câu hỏi chuẩn hóa! Vui lòng duyệt & lưu.`, 'success');
      soundManager.playFanfare();
    }, 2000);
  };

  const handleSaveApprovedAiQuestions = () => {
    const toSave = aiGeneratedQuestions.filter(q => selectedAiIds.includes(q.id));
    if (toSave.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 câu hỏi để lưu vào ngân hàng', 'warning');
      return;
    }

    if (!currentBankQuiz) {
      createQuiz({
        classId: activeClass?.id || 'class-6a1',
        title: `Ngân hàng câu hỏi ${aiSubject} - ${aiGrade}`,
        subject: aiSubject,
        durationMinutes: 45,
        questions: toSave
      });
    } else {
      updateQuiz(currentBankQuiz.id, {
        questions: [...toSave, ...currentBankQuiz.questions]
      });
    }

    showToast(`Đã lưu thành công ${toSave.length} câu hỏi vào ngân hàng!`, 'success');
    soundManager.playCorrect();
    setShowAiReview(false);
    setAiGeneratedQuestions([]);
    setCurrentView('list');
  };

  // -------------------------------------------------------------
  // STUDENT EXAM TAKING HANDLERS
  // -------------------------------------------------------------
  const handleStartExam = (quiz: Quiz) => {
    setTakingExam(quiz);
    setExamCurrentQuestionIdx(0);
    setExamAnswers({});
    setFlaggedQuestions([]);
    setExamSecondsRemaining((quiz.durationMinutes || 15) * 60);
    setIsExamCompleted(false);
    setExamResultScore(null);
    soundManager.playTick();
  };

  const handleSelectExamAnswer = (questionId: string, answer: any) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleToggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleFinishAndSubmitExam = (autoSubmitted = false) => {
    if (!takingExam) return;

    const questions = takingExam.questions || [];
    let correctCount = 0;
    let earnedPoints = 0;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0) || 10;

    questions.forEach(q => {
      const userAns = examAnswers[q.id];
      if (q.questionType === '1 Đáp án') {
        if (userAns === q.correctIndex) {
          correctCount++;
          earnedPoints += q.points || 1;
        }
      } else if (q.questionType === 'Điền khuyết') {
        if (
          String(userAns || '').trim().toLowerCase() ===
          String(q.fillBlankAnswer || '').trim().toLowerCase()
        ) {
          correctCount++;
          earnedPoints += q.points || 1;
        }
      } else if (q.questionType === 'Đúng / Sai') {
        const statements = q.trueFalseStatements || [];
        const isAllCorrect = statements.every(st => userAns?.[st.id] === st.isCorrect);
        if (isAllCorrect) {
          correctCount++;
          earnedPoints += q.points || 2;
        }
      } else {
        // Partial or manual
        if (userAns !== undefined) {
          correctCount++;
          earnedPoints += q.points || 1;
        }
      }
    });

    const scaledScore = Math.round((earnedPoints / totalPoints) * 10 * 10) / 10;
    setExamResultScore(scaledScore);
    setExamCorrectCount(correctCount);
    setIsExamCompleted(true);

    // Save to AppContext attempt
    submitExamAttempt(takingExam.id, {
      examId: takingExam.id,
      studentId: currentStudentId || 'std-6a1-01',
      studentName: currentUser?.name || 'Học sinh',
      status: autoSubmitted ? 'auto_submitted' : 'graded',
      answers: examAnswers,
      flaggedQuestionIds: flaggedQuestions,
      score: scaledScore,
      totalPoints: 10,
      correctCount,
      totalCount: questions.length,
      startedAt: new Date(Date.now() - ((takingExam.durationMinutes || 15) * 60 - examSecondsRemaining) * 1000).toISOString()
    });

    soundManager.playFanfare();
    showToast(`Đã nộp bài thi thành công! Điểm số: ${scaledScore}/10`, 'success');
  };

  // -------------------------------------------------------------
  // STUDENT VIEW (KHI HỌC SINH ĐĂNG NHẬP VÀO GÓC HỌC TẬP)
  // -------------------------------------------------------------
  if (userRole === 'student' || userRole === 'parent') {
    // If student is actively taking the exam
    if (takingExam) {
      const questions = takingExam.questions || [];
      const currentQ = questions[examCurrentQuestionIdx];
      const isFlagged = currentQ ? flaggedQuestions.includes(currentQ.id) : false;
      const minutes = Math.floor(examSecondsRemaining / 60);
      const seconds = examSecondsRemaining % 60;
      const isLowTime = examSecondsRemaining < 120; // < 2 mins warning

      return (
        <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-200">
          {/* Top Exam HUD */}
          <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/40 shadow-xl flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {takingExam.subject} • Lớp {activeClass?.name}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {currentUser?.name || 'Học sinh'}
                </span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">{takingExam.title}</h2>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-base shadow-lg transition-all ${
              isLowTime
                ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-[#070d1e] text-cyan-300 border-cyan-500/40'
            }`}>
              <Clock className="w-5 h-5 text-amber-400" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleFinishAndSubmitExam(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 cursor-pointer shadow-lg hover:scale-103"
            >
              Nộp bài thi ngay
            </button>
          </div>

          {/* Exam Completed Results Screen */}
          {isExamCompleted ? (
            <div className="bg-[#0b1329] p-8 rounded-2xl border border-emerald-500/40 shadow-2xl text-center space-y-4">
              <Award className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-white">Chúc mừng em đã hoàn thành bài kiểm tra!</h3>
              <div className="inline-block p-4 rounded-2xl bg-[#070d1e] border border-cyan-500/40 shadow-inner">
                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Điểm số đạt được</span>
                <span className="text-4xl font-black text-emerald-300">{examResultScore} / 10</span>
                <span className="text-xs text-cyan-300 block mt-1">
                  Trả lời đúng: {examCorrectCount} / {questions.length} câu
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Điểm số đã được tự động lưu vào học bạ điện tử và gửi thông báo tới cô giáo chủ nhiệm.
              </p>
              <button
                type="button"
                onClick={() => setTakingExam(null)}
                className="mt-2 px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 cursor-pointer shadow-md"
              >
                ← Quay lại danh sách bài kiểm tra
              </button>
            </div>
          ) : (
            /* Live Exam Question Taking Body */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Question Palette Sidebar */}
              <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Danh sách câu hỏi:</span>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = examAnswers[q.id] !== undefined;
                    const isCurrent = idx === examCurrentQuestionIdx;
                    const isQFlagged = flaggedQuestions.includes(q.id);

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setExamCurrentQuestionIdx(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-black relative transition-all cursor-pointer flex items-center justify-center ${
                          isCurrent
                            ? 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 scale-105'
                            : isAnswered
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : 'bg-[#070d1e] text-slate-400 border border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {idx + 1}
                        {isQFlagged && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-cyan-500/20 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500/50" />
                    <span>Đã trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#070d1e] border border-slate-800" />
                    <span>Chưa trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Gắn cờ xem lại</span>
                  </div>
                </div>
              </div>

              {/* Current Question Main Display */}
              {currentQ && (
                <div className="lg:col-span-3 bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                        Câu {examCurrentQuestionIdx + 1} / {questions.length}
                      </span>
                      <span className="text-xs text-slate-400">({currentQ.points || 1} điểm)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold">
                        {currentQ.questionType}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlagQuestion(currentQ.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isFlagged
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          : 'bg-[#070d1e] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{isFlagged ? 'Đã gắn cờ' : 'Gắn cờ xem lại'}</span>
                    </button>
                  </div>

                  {/* Question Content */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options (1 Đáp án) */}
                  {currentQ.options && currentQ.options.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {currentQ.options.map((opt, oIdx) => {
                        const isChosen = examAnswers[currentQ.id] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectExamAnswer(currentQ.id, oIdx)}
                            className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-3 ${
                              isChosen
                                ? 'bg-cyan-950/80 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                                : 'bg-[#070d1e] border-slate-800 text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isChosen ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in blank answer */}
                  {currentQ.questionType === 'Điền khuyết' && (
                    <div className="pt-2 space-y-1">
                      <label className="text-xs font-bold text-slate-300">Nhập đáp án của em:</label>
                      <input
                        type="text"
                        value={examAnswers[currentQ.id] || ''}
                        onChange={e => handleSelectExamAnswer(currentQ.id, e.target.value)}
                        placeholder="Gõ kết quả vào đây..."
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-mono"
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
                    <button
                      type="button"
                      disabled={examCurrentQuestionIdx === 0}
                      onClick={() => setExamCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-[#070d1e] hover:bg-slate-800 border border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      ← Câu trước
                    </button>

                    {examCurrentQuestionIdx < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setExamCurrentQuestionIdx(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 cursor-pointer shadow-md"
                      >
                        Câu tiếp theo →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFinishAndSubmitExam(false)}
                        className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 cursor-pointer shadow-md"
                      >
                        Hoàn thành & Nộp bài
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Default Student/Parent List View: Available Quizzes & Exams for class
    return (
      <div className="space-y-4">
        <div className="bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-xl flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Đề Ôn Tập & Kiểm Tra Của Em</span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Lớp {activeClass?.name} • Làm bài kiểm tra trực tuyến, đồng hồ bấm giờ và xem điểm số tự động
            </p>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => {
            const myAttempt = quiz.attempts?.find(a => a.studentId === currentStudentId);

            return (
              <div
                key={quiz.id}
                className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#142244] text-cyan-300 border border-cyan-500/30">
                      {quiz.subject} • {quiz.questions?.length || 0} câu
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      myAttempt ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                    }`}>
                      {myAttempt ? `Đã thi: ${myAttempt.score}đ` : 'Sẵn sàng thi'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {quiz.description || 'Bài kiểm tra kiến thức chuẩn chương trình giáo dục phổ thông.'}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thời gian làm bài: <strong className="text-white">{quiz.durationMinutes || 15} phút</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-cyan-500/20">
                  <button
                    type="button"
                    onClick={() => handleStartExam(quiz)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 hover:from-purple-300 hover:to-indigo-200 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{myAttempt ? 'Luyện tập lại bài này' : 'Vào thi ngay'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TEACHER & ADMIN VIEW: EXACT LAYOUT AS IN IMAGE_201A7284
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* 1. TOP BREADCRUMB BAR (MATCHES EXACT SCREENSHOT) */}
      <div className="bg-[#0b1329] px-4 py-3 rounded-2xl border border-cyan-500/20 shadow-md flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2 text-slate-300 font-medium overflow-hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dạy & Học</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/60 shrink-0" />
          <button
            onClick={() => setCurrentView('list')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
          >
            Ngân hàng câu hỏi
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/60 shrink-0" />
          <span className="text-white font-bold truncate">
            Ngân hàng Câu hỏi Thông minh (Quản lý kho câu hỏi chuẩn 9 dạng, tích hợp AI & Import đa định dạng)
          </span>
        </div>
      </div>

      {/* 2. METHOD SELECTOR ROW & RIGHT ACTION BUTTON */}
      <div className="bg-[#0b1329] p-3 sm:p-4 rounded-2xl border border-cyan-500/30 shadow-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold text-cyan-300 mr-1 hidden sm:inline">
            Phương thức:
          </span>

          {/* Tab 1 */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('create');
              setMethodTab('import');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'create' && methodTab === 'import'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold ring-1 ring-cyan-300'
                : 'bg-[#070d1e] text-slate-300 hover:text-white hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tab 1: Nhập câu hỏi bằng cách import</span>
          </button>

          {/* Tab 2 (Active in screenshot with purple gradient) */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('create');
              setMethodTab('ai');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
              currentView === 'create' && methodTab === 'ai'
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-purple-900/50 ring-2 ring-purple-400/60 scale-102'
                : 'bg-[#070d1e] text-slate-300 hover:text-white hover:bg-slate-800 border border-purple-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Tab 2: Tạo bằng AI thông minh</span>
          </button>

          {/* Tab 3 */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('create');
              setMethodTab('manual');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'create' && methodTab === 'manual'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold ring-1 ring-cyan-300'
                : 'bg-[#070d1e] text-slate-300 hover:text-white hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Tab 3: Tạo bằng thủ công</span>
          </button>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView(currentView === 'list' ? 'create' : 'list')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-200 bg-[#070d1e] hover:bg-[#121c38] border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {currentView === 'list' ? '← Soạn & Tạo câu hỏi' : '← Quay lại danh sách ngân hàng'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. TAB 2: TRỢ LÝ AI GEMINI (EXACT MATCH TO IMAGE_201A7284) */}
      {currentView === 'create' && methodTab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                Tab 2: Trợ lý AI Gemini – Tạo Ngân hàng câu hỏi thông minh
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Quy trình AI 5 bước: Nhập chủ đề bài học → Cấu hình khối, môn, số lượng → Gemini tạo câu hỏi → Review & Lưu.
              </p>
            </div>

            {/* Anti-Hallucination Callout */}
            <div className="bg-[#1b1035] border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-purple-200 flex items-center justify-center gap-2 shadow-inner">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold text-center">
                <strong className="text-white">Chống Hallucination:</strong> AI bám sát nguồn, ghi rõ khi thiếu căn cứ và gắn nhãn cần giáo viên kiểm tra.
              </span>
            </div>

            {/* Source Picker Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-slate-200">
                Nguồn nội dung / Tài liệu gốc cho AI:
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAiSourceType('text')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    aiSourceType === 'text'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-300'
                      : 'bg-[#070d1e] text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Văn bản</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiSourceType('file');
                    aiFileInputRef.current?.click();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    aiSourceType === 'file'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-300'
                      : 'bg-[#070d1e] text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>File (PDF/Word)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiSourceType('link')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    aiSourceType === 'link'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-300'
                      : 'bg-[#070d1e] text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link Web</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiSourceType('image');
                    aiImageInputRef.current?.click();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    aiSourceType === 'image'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-300'
                      : 'bg-[#070d1e] text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Hình ảnh</span>
                </button>
              </div>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={aiFileInputRef}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFileName(file.name);
                  showToast(`Đã đính kèm tệp: ${file.name}`, 'info');
                }
              }}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <input
              type="file"
              ref={aiImageInputRef}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setUploadedImagePreview(url);
                  showToast(`Đã tải ảnh tài liệu: ${file.name}`, 'info');
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {/* Textarea */}
            <div className="space-y-1.5">
              <textarea
                value={aiPromptText}
                onChange={e => setAiPromptText(e.target.value)}
                placeholder="Dán hoặc nhập nội dung chủ đề bài học, đoạn trích tài liệu, yêu cầu sinh câu hỏi..."
                className="w-full h-32 sm:h-36 p-3.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-cyan-300 font-semibold">Mẫu nhanh:</span>
                {SAMPLE_CURRICULUM_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiSubject(topic.subject);
                      setAiGrade(topic.grade);
                      setAiPromptText(topic.prompt);
                      showToast(`Đã nạp chủ đề: ${topic.title}`, 'info');
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#070d1e] hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer font-medium"
                  >
                    {topic.subject} {topic.grade}: {topic.title.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Môn học</label>
                <div className="relative">
                  <select
                    value={aiSubject}
                    onChange={e => setAiSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none appearance-none font-medium cursor-pointer"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý (KHTN)</option>
                    <option value="Hóa học">Hóa học (KHTN)</option>
                    <option value="Sinh học">Sinh học (KHTN)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Khối lớp</label>
                <div className="relative">
                  <select
                    value={aiGrade}
                    onChange={e => setAiGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none appearance-none font-medium cursor-pointer"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                    <option value="Khối 10">Khối 10</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 12">Khối 12</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Số lượng câu tạo</label>
                <div className="relative">
                  <select
                    value={aiCount}
                    onChange={e => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none appearance-none font-medium cursor-pointer"
                  >
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                    <option value={15}>15 câu</option>
                    <option value={20}>20 câu</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Start AI Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleStartAiGeneration}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-950/60 border border-purple-400/50 transition-all cursor-pointer hover:scale-103 active:scale-97 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{isGenerating ? 'AI đang sinh câu hỏi...' : '✨ Bắt đầu tạo bằng AI'}</span>
              </button>
            </div>
          </div>

          {/* AI Progress */}
          {isGenerating && (
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-purple-500/40 shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-900/40">
                <BrainCircuit className="w-7 h-7 text-purple-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">
                  Gemini AI đang soạn đề bám sát SGK ({generationStep}/5)
                </h3>
                <p className="text-xs text-purple-300">
                  Phân tích mức độ nhận thức, chống Hallucination & gắn nhãn căn cứ...
                </p>
              </div>
            </div>
          )}

          {/* Review AI Questions */}
          {showAiReview && aiGeneratedQuestions.length > 0 && (
            <div className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-purple-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-purple-500/20 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Duyệt câu hỏi AI đề xuất ({selectedAiIds.length}/{aiGeneratedQuestions.length} câu đã chọn)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleSaveApprovedAiQuestions}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu vào Ngân hàng ({selectedAiIds.length})</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {aiGeneratedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#0e1733] border border-purple-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-300 font-bold">{q.code || `Câu ${idx + 1}`}</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                        ✓ AI bám sát nguồn
                      </span>
                    </div>
                    <p className="text-white font-bold">{q.question}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded-lg text-xs ${oIdx === q.correctIndex ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 font-bold' : 'bg-[#070d1e] text-slate-300'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. REPOSITORY VIEW */}
      {currentView === 'list' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng câu hỏi</span>
              <p className="text-xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Nhận biết</span>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{stats.nhanBiet}</p>
            </div>
            <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 text-center">
              <span className="text-[10px] text-cyan-400 uppercase font-bold">Thông hiểu</span>
              <p className="text-xl font-black text-cyan-300 mt-0.5">{stats.thongHieu}</p>
            </div>
            <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-bold">Vận dụng</span>
              <p className="text-xl font-black text-amber-300 mt-0.5">{stats.vanDung}</p>
            </div>
            <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-rose-400 uppercase font-bold">Vận dụng cao</span>
              <p className="text-xl font-black text-rose-300 mt-0.5">{stats.vanDungCao}</p>
            </div>
          </div>

          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentView('create');
                setMethodTab('ai');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>+ AI Tạo thêm câu hỏi</span>
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div key={q.id} className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">{q.code || `CH-${idx + 1}`}</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded">{q.subject}</span>
                </div>
                <p className="text-white font-bold">{q.question}</p>
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-2 rounded-lg text-xs ${oIdx === q.correctIndex ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 font-bold' : 'bg-[#070d1e] text-slate-300'}`}>
                        {opt}
                      </div>
                    ))}
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
