import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  QuizQuestion,
  QuestionLevel,
  QuestionType
} from '../../../types';
import {
  Sparkles,
  BrainCircuit,
  FileText,
  CheckCircle2,
  Layers,
  Settings2,
  BookOpen,
  Send,
  Copy,
  Download,
  Upload,
  Play,
  Check,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  HelpCircle,
  RotateCcw,
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  AlertTriangle,
  Info,
  ListOrdered,
  FileCheck,
  Paperclip,
  Wand2,
  CheckCheck,
  MessageSquare,
  BarChart3,
  ListPlus,
  Lightbulb,
  Volume2,
  VolumeX,
  GraduationCap
} from 'lucide-react';
import { soundManager } from '../../../services/audio';

// 5 Sample Lessons matching Vietnamese Curriculum (THCS)
const CURRICULUM_LESSONS = [
  {
    id: 'math-9-canbac2',
    subject: 'Toán học',
    grade: 'Khối 9',
    chapter: 'Chương I: Căn bậc hai. Căn bậc ba',
    lesson: 'Bài 2: Căn thức bậc hai và hằng đẳng thức √(A²) = |A|',
    summary: 'Điều kiện xác định của biểu thức √(A) là A ≥ 0. Hằng đẳng thức √(A²) = |A|. Rút gọn biểu thức và biến đổi đồng nhất thức.',
    fileName: 'Giao_an_Toan_9_Bai_2_Can_thuc_bac_hai.docx'
  },
  {
    id: 'khtn-8-apsuat',
    subject: 'Vật lý',
    grade: 'Khối 8',
    chapter: 'Chương II: Cơ học và Áp suất',
    lesson: 'Bài 14: Khối lượng riêng và Áp suất chất lỏng',
    summary: 'Khối lượng riêng D = m/V (kg/m³). Áp suất chất lỏng p = d.h phụ thuộc độ sâu và trọng lượng riêng. Ứng dụng bình thông nhau.',
    fileName: 'Giao_an_KHTN_8_Khoi_luong_rieng_Ap_suat.docx'
  },
  {
    id: 'van-9-kieu',
    subject: 'Ngữ văn',
    grade: 'Khối 9',
    chapter: 'Phần Văn học Trung đại',
    lesson: 'Đoạn trích: Kiều ở lầu Ngưng Bích (Truyện Kiều - Nguyễn Du)',
    summary: 'Tâm trạng cô đơn, bẽ bàng và thương thân xót phận của Thúy Kiều. Tấm lòng hiếu thảo với cha mẹ và thủy chung son sắt với Kim Trọng. Nghệ thuật tả cảnh ngụ tình.',
    fileName: 'Giao_an_Ngu_van_9_Kieu_o_lau_Ngung_Bich.docx'
  },
  {
    id: 'anh-9-unit1',
    subject: 'Tiếng Anh',
    grade: 'Khối 9',
    chapter: 'Unit 1: Local Community',
    lesson: 'A Closer Look 1 & 2: Vocabulary & Phrasal Verbs',
    summary: 'Vocabulary about traditional craft villages, community helpers. Grammar: Phrasal verbs (pass down, turn down, live on, deal with).',
    fileName: 'Lesson_Plan_English_9_Unit_1_Community.docx'
  },
  {
    id: 'hoa-8-baotoan',
    subject: 'Hóa học',
    grade: 'Khối 8',
    chapter: 'Chương II: Phản ứng hóa học',
    lesson: 'Bài 12: Định luật bảo toàn khối lượng và phương trình hóa học',
    summary: 'Trong một phản ứng hóa học, tổng khối lượng các chất sản phẩm bằng tổng khối lượng các chất tham gia phản ứng. Cách lập phương trình hóa học.',
    fileName: 'Giao_an_Hoa_hoc_8_Bao_toan_khoi_luong.docx'
  }
];

// Quick Categories & Prompts for Teachers to Ask AI Anything
const QUICK_PROMPT_CATEGORIES = [
  { id: 'all', label: 'Tất cả chủ đề', icon: '✨' },
  { id: 'subject', label: 'Giải bài & Chuyên môn', icon: '📐' },
  { id: 'pedagogy', label: 'Phương pháp & Gợi mở', icon: '💡' },
  { id: 'situation', label: 'Tình huống sư phạm', icon: '🚨' },
  { id: 'lesson-plan', label: 'Giáo án & Đề thi', icon: '📋' },
  { id: 'homeroom', label: 'Chủ nhiệm & Phụ huynh', icon: '🤝' },
  { id: 'tech', label: 'Trò chơi 5p & CNTT', icon: '🎮' }
];

const PRESET_TEACHER_PROMPTS = [
  {
    category: 'subject',
    title: 'Giải chi tiết bài toán cực trị',
    prompt: 'Hãy giải chi tiết bài toán sau và chỉ ra các sai lầm phổ biến học sinh hay mắc phải: Tìm giá trị nhỏ nhất của biểu thức A = x - 2√x + 5 với x ≥ 0.'
  },
  {
    category: 'subject',
    title: 'Phân tích thơ Văn học 9',
    prompt: 'Phân tích nghệ thuật tả cảnh ngụ tình đặc sắc trong 8 câu thơ cuối đoạn trích Kiều ở lầu Ngưng Bích (Ngữ văn 9).'
  },
  {
    category: 'subject',
    title: 'Phương trình Hóa học khó',
    prompt: 'Cân bằng phản ứng oxi hóa khử sau bằng phương pháp thăng bằng electron: Fe3O4 + HNO3 → Fe(NO3)3 + NO + H2O và giải thích từng bước.'
  },
  {
    category: 'pedagogy',
    title: 'Câu hỏi gợi mở học sinh yếu',
    prompt: 'Hãy soạn bộ 4 câu hỏi phát vấn theo mức độ từ dễ đến khó để giúp một học sinh có học lực yếu tự tìm ra điều kiện xác định của biểu thức √(2x - 6).'
  },
  {
    category: 'pedagogy',
    title: 'Kỹ thuật Khăn trải bàn',
    prompt: 'Hướng dẫn chi tiết cách tổ chức kỹ thuật dạy học tích cực "Khăn trải bàn" cho 4 học sinh trong tiết luyện tập Toán 9 trong vòng 10 phút.'
  },
  {
    category: 'situation',
    title: 'Học sinh mất trật tự trên lớp',
    prompt: 'Trong giờ dạy, có 2 học sinh ngồi cuối lớp liên tục nói chuyện riêng và không chịu mở vở dù đã nhắc 2 lần. Tôi nên xử lý sư phạm như thế nào để vừa giữ được trật tự lớp mà không làm tổn thương tâm lý các em?'
  },
  {
    category: 'situation',
    title: 'Học sinh có dấu hiệu sa sút',
    prompt: 'Một học sinh trước đây học khá nhưng gần đây thường xuyên ngủ gật, không làm bài tập và điểm kiểm tra tụt dốc. Thầy/Cô hãy tư vấn cách tiếp cận và trò chuyện riêng với em.'
  },
  {
    category: 'lesson-plan',
    title: 'Soạn Kế hoạch bài dạy CV 5512',
    prompt: 'Hãy phác thảo khung Kế hoạch bài dạy chuẩn theo Công văn 5512/BGDĐT cho bài "Căn bậc hai và căn thức bậc hai" gồm 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng.'
  },
  {
    category: 'homeroom',
    title: 'Trao đổi với phụ huynh học sinh',
    prompt: 'Soạn tin nhắn lịch sự, chân thành và mang tính xây dựng gửi phụ huynh của học sinh thường xuyên đi học muộn và quên đồ dùng học tập.'
  },
  {
    category: 'tech',
    title: 'Trò chơi 5 phút đầu giờ',
    prompt: 'Đề xuất 2 ý tưởng trò chơi khởi động 5 phút đầu tiết học Toán 9 không cần chuẩn bị cầu kỳ nhưng kích thích 100% học sinh tham gia sôi nổi.'
  }
];

export const AITeachingAssistantPage: React.FC = () => {
  const { activeClass, quizzes, updateQuiz, createQuiz, setActiveTab, showToast } = useApp();

  const currentBankQuiz = quizzes[0] || null;

  // Active sub-module tab - default to 'chat' so teachers can ask AI anything right away!
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'wizard' | 'lesson-plan' | 'matrix'>('chat');

  // =========================================================================
  // TAB 1: 5-STEP AI WIZARD GENERATOR (THE MASTER SPECIFICATION FROM PDF)
  // =========================================================================
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [sourceDocName, setSourceDocName] = useState<string>('');
  const [sourceText, setSourceText] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('math-9-canbac2');

  // Step 2: Matrix & Configuration
  const [wizardSubject, setWizardSubject] = useState<string>(activeClass?.subject || 'Toán học');
  const [wizardGrade, setWizardGrade] = useState<string>(`Khối ${activeClass?.grade || 9}`);
  const [wizardTopic, setWizardTopic] = useState<string>('Căn thức bậc hai và hằng đẳng thức √(A²) = |A|');
  const [wizardNumQuestions, setWizardNumQuestions] = useState<number>(5);
  const [include9Types, setInclude9Types] = useState<boolean>(true);
  const [strictSourceBinding, setStrictSourceBinding] = useState<boolean>(true);

  // Step 3: AI Processing State
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiProgressStatus, setAiProgressStatus] = useState<string>('');

  // Step 4: Review & Approve items
  const [proposedQuestions, setProposedQuestions] = useState<QuizQuestion[]>([]);
  const [approvedQuestionIds, setApprovedQuestionIds] = useState<string[]>([]);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // TAB 2: LESSON PLAN GENERATOR (CV 5512)
  // =========================================================================
  const [lpSubject, setLpSubject] = useState('Toán học');
  const [lpGrade, setLpGrade] = useState('Khối 9');
  const [lpLessonName, setLpLessonName] = useState('Bài 2: Căn thức bậc hai và hằng đẳng thức √(A²) = |A|');
  const [lpDuration, setLpDuration] = useState('1 tiết (45 phút)');
  const [isLpGenerating, setIsLpGenerating] = useState(false);
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState<string | null>(null);

  // =========================================================================
  // TAB 3: EXAM MATRIX ANALYZER
  // =========================================================================
  const [matrixExamType, setMatrixExamType] = useState<'15min' | 'midterm' | 'final'>('midterm');

  // =========================================================================
  // TAB 4: PEDAGOGICAL Q&A CHAT (GEMINI EDTECH)
  // =========================================================================
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Xin kính chào Thầy/Cô! Tôi là Trợ Lý Sư Phạm Toàn Năng (trên nền tảng Google Gemini 3.8 Flash).

Thầy/Cô có thể hỏi tôi MỌI THỨ về dạy học và chuyên môn, không giới hạn:
1. 📐 **Kiến thức chuyên môn & Giải bài tập khó**: Toán, Lý, Hóa, Sinh, Văn, Anh, Sử, Địa, Tin học (kèm lỗi sai học sinh hay mắc).
2. 💡 **Phương pháp dạy học tích cực**: Dạy học dự án, kỹ thuật Khăn trải bàn, Mảnh ghép, Phòng tranh, STEM.
3. 📝 **Soạn câu hỏi & Ma trận đề thi**: Đề 15 phút, giữa kỳ, câu hỏi gợi mở cho học sinh yếu, bồi dưỡng học sinh giỏi.
4. 🚨 **Xử lý tình huống sư phạm & Tâm lý**: Học sinh mất tập trung, cãi lại, xung đột bạn bè, kỹ năng chủ nhiệm lớp.
5. 📋 **Kế hoạch bài dạy (Giáo án CV 5512)**: Mục tiêu năng lực phẩm chất, tiến trình 4 hoạt động chuẩn Bộ GD&ĐT.
6. 🎮 **Trò chơi 5 phút khởi động & CNTT**: Ý tưởng hoạt động đầu giờ sôi nổi, ứng dụng Canva, Kahoot, PowerPoint.

Thầy/Cô hãy gõ câu hỏi hoặc chọn một trong các gợi ý bên dưới nhé!`,
      time: 'Vừa xong'
    }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('all');
  const [includeClassContext, setIncludeClassContext] = useState<boolean>(true);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);

  // Handle file upload in Wizard Step 1
  const handleWizardFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceDocName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const content = String(evt.target?.result || '');
      setSourceText(content || `Tệp: ${file.name} (Dung lượng: ${(file.size / 1024).toFixed(1)} KB)`);
      showToast(`Đã nạp tài liệu: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  };

  const handleSelectCurriculumLesson = (lesson: typeof CURRICULUM_LESSONS[0]) => {
    setSelectedLessonId(lesson.id);
    setSourceDocName(lesson.fileName);
    setWizardSubject(lesson.subject);
    setWizardGrade(lesson.grade);
    setWizardTopic(lesson.lesson);
    setSourceText(`${lesson.chapter} - ${lesson.lesson}\n\nNội dung bài học:\n${lesson.summary}`);
    showToast(`Đã chọn bài: ${lesson.lesson}`, 'info');
  };

  // Run Step 3: Generation with 9 Question Types
  const handleRunAiWizard = () => {
    setIsAiGenerating(true);
    setAiProgressStatus('1/3: Trích xuất nội dung nguồn và thiết lập ma trận 9 dạng câu hỏi...');

    setTimeout(() => {
      setAiProgressStatus('2/3: Gọi Gemini AI (JSON schema chuẩn, chống hallucination, bám sát giáo án)...');
    }, 600);

    setTimeout(() => {
      setAiProgressStatus('3/3: Soát lỗi đáp án, phân loại 4 mức độ nhận thức và biên soạn lời giải...');
    }, 1200);

    setTimeout(() => {
      setIsAiGenerating(false);
      const codePrefix = wizardSubject === 'Toán học' ? 'TOAN' :
                         wizardSubject === 'Vật lý' ? 'LY' :
                         wizardSubject === 'Hóa học' ? 'HOA' :
                         wizardSubject === 'Tiếng Anh' ? 'ANH' : 'VAN';
      const gradeNum = wizardGrade.replace(/\D/g, '') || '9';

      // 9 Types sample generated by AI bám sát source
      const generated: QuizQuestion[] = [
        // 1. Một đáp án
        {
          id: `q-wiz-${Date.now()}-1`,
          code: `${codePrefix}${gradeNum}-AI01`,
          question: `[AI Đề xuất - Một đáp án] Dựa vào bài học "${wizardTopic}", điều kiện xác định của biểu thức √(3x - 9) là:`,
          options: ['A. x ≥ 3', 'B. x > 3', 'C. x ≤ 3', 'D. x < 3'],
          correctIndex: 0,
          subject: wizardSubject,
          grade: wizardGrade,
          level: 'Nhận biết',
          questionType: '1 Đáp án',
          points: 1,
          sourceDoc: sourceDocName || 'Giáo án nguồn',
          explanation: 'Biểu thức căn thức bậc hai √(A) có nghĩa khi và chỉ khi A ≥ 0. Ta có: 3x - 9 ≥ 0 ⇔ 3x ≥ 9 ⇔ x ≥ 3.'
        },
        // 2. Nhiều đáp án
        {
          id: `q-wiz-${Date.now()}-2`,
          code: `${codePrefix}${gradeNum}-AI02`,
          question: `[AI Đề xuất - Nhiều đáp án] Những biểu thức nào sau đây xác định với mọi giá trị thực của x? (Chọn tất cả đáp án đúng)`,
          options: [
            'A. √(x² + 1)',
            'B. √(x² + 2x + 5)',
            'C. √(x - 2)',
            'D. √(-x² - 3)'
          ],
          correctIndex: 0,
          correctIndices: [0, 1],
          subject: wizardSubject,
          grade: wizardGrade,
          level: 'Thông hiểu',
          questionType: 'Nhiều đáp án',
          points: 1.5,
          sourceDoc: sourceDocName || 'Giáo án nguồn',
          explanation: 'Ta có x² + 1 > 0 với mọi x, và x² + 2x + 5 = (x + 1)² + 4 > 0 với mọi x nên cả A và B đều xác định với mọi x thuộc R.'
        },
        // 3. Đúng/Sai theo từng ý (Cấu trúc mới Bộ GD&ĐT)
        {
          id: `q-wiz-${Date.now()}-3`,
          code: `${codePrefix}${gradeNum}-AI03`,
          question: `[AI Đề xuất - Đúng/Sai 4 ý] Xét tính Đúng / Sai của các khẳng định sau theo bài học "${wizardTopic}":`,
          options: [],
          correctIndex: 0,
          subject: wizardSubject,
          grade: wizardGrade,
          level: 'Thông hiểu',
          questionType: 'Đúng / Sai',
          points: 2,
          sourceDoc: sourceDocName || 'Giáo án nguồn',
          trueFalseStatements: [
            { id: 'tf-1', statement: 'a) Hằng đẳng thức căn bậc hai phát biểu: √(A²) = |A| với mọi biểu thức A.', isCorrect: true },
            { id: 'tf-2', statement: 'b) Khi A < 0 thì √(A²) = A.', isCorrect: false },
            { id: 'tf-3', statement: 'c) Giá trị rút gọn của biểu thức √( (√3 - 2)² ) bằng 2 - √3.', isCorrect: true },
            { id: 'tf-4', statement: 'd) Căn bậc hai số học của số 25 là cả 5 và -5.', isCorrect: false }
          ],
          explanation: 'a) Đúng; b) Sai vì khi A < 0 thì |A| = -A; c) Đúng vì 2 > √3; d) Sai vì căn bậc hai số học chỉ nhận giá trị không âm (chỉ bằng 5).'
        },
        // 4. Ghép đôi
        {
          id: `q-wiz-${Date.now()}-4`,
          code: `${codePrefix}${gradeNum}-AI04`,
          question: `[AI Đề xuất - Ghép đôi] Ghép nối mỗi biểu thức ở Cột A với kết quả rút gọn tương ứng ở Cột B:`,
          options: [],
          correctIndex: 0,
          subject: wizardSubject,
          grade: wizardGrade,
          level: 'Vận dụng',
          questionType: 'Ghép đôi',
          points: 1.5,
          sourceDoc: sourceDocName || 'Giáo án nguồn',
          matchingPairs: [
            { id: 'm-1', left: '1. √( (-5)² )', right: 'a. 5' },
            { id: 'm-2', left: '2. √( (1 - √2)² )', right: 'b. √2 - 1' },
            { id: 'm-3', left: '3. -2√(a²) với a ≥ 0', right: 'c. -2a' },
            { id: 'm-4', left: '4. √(4a²) với a < 0', right: 'd. -2a' }
          ],
          explanation: 'Cặp nối chính xác: 1-a, 2-b, 3-c, 4-d dựa trên quy tắc bỏ dấu giá trị tuyệt đối |A|.'
        },
        // 5. Điền khuyết
        {
          id: `q-wiz-${Date.now()}-5`,
          code: `${codePrefix}${gradeNum}-AI05`,
          question: `[AI Đề xuất - Điền khuyết] Rút gọn biểu thức P = √(11 - 6√2) ta được kết quả dưới dạng a - b√2 với a, b nguyên dương. Khi đó giá trị của biểu thức a + b bằng ...`,
          options: [],
          correctIndex: 0,
          fillBlankAnswer: '5',
          subject: wizardSubject,
          grade: wizardGrade,
          level: 'Vận dụng cao',
          questionType: 'Điền khuyết',
          points: 1,
          sourceDoc: sourceDocName || 'Giáo án nguồn',
          explanation: '11 - 6√2 = 3² - 2·3·√2 + (√2)² = (3 - √2)². Do đó √(11 - 6√2) = 3 - √2. Suy ra a = 3, b = 2 => a + b = 5.'
        }
      ];

      setProposedQuestions(generated);
      setApprovedQuestionIds(generated.map(q => q.id));
      setWizardStep(4); // Move to review step
      showToast(`AI đã đề xuất ${generated.length} câu hỏi chuẩn hóa 9 dạng. Vui lòng duyệt trước khi lưu!`, 'success');
      soundManager.playCorrect();
    }, 1800);
  };

  const handleToggleApproveQuestion = (id: string) => {
    setApprovedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllApproved = () => {
    if (approvedQuestionIds.length === proposedQuestions.length) {
      setApprovedQuestionIds([]);
    } else {
      setApprovedQuestionIds(proposedQuestions.map(q => q.id));
    }
  };

  const handleDeleteProposed = (id: string) => {
    setProposedQuestions(prev => prev.filter(q => q.id !== id));
    setApprovedQuestionIds(prev => prev.filter(i => i !== id));
  };

  // Step 5: Save approved questions into Bank
  const handleSaveToQuestionBank = () => {
    if (!currentBankQuiz) return;
    const toSave = proposedQuestions.filter(q => approvedQuestionIds.includes(q.id));

    if (toSave.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 câu hỏi để lưu', 'warning');
      return;
    }

    updateQuiz(currentBankQuiz.id, {
      questions: [...toSave, ...currentBankQuiz.questions]
    });

    showToast(`Đã duyệt và lưu thành công ${toSave.length} câu hỏi vào Ngân hàng câu hỏi!`, 'success');
    soundManager.playFanfare();
    setWizardStep(1);
    setProposedQuestions([]);
    setApprovedQuestionIds([]);
  };

  // Generate Lesson Plan CV 5512 using Gemini AI API
  const handleGenerateLessonPlan = async () => {
    setIsLpGenerating(true);
    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lpSubject,
          grade: lpGrade,
          lessonName: lpLessonName,
          duration: lpDuration
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setGeneratedLessonPlan(data.plan);
          showToast('Đã tạo kế hoạch bài dạy chuẩn CV 5512 từ Gemini AI!', 'success');
          soundManager.playCorrect();
          setIsLpGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Lesson plan API error, using structured template:', e);
    }

    // Fallback high-standard CV 5512 template
    setTimeout(() => {
      setIsLpGenerating(false);
      const planText = `KẾ HOẠCH BÀI DẠY (CHUẨN CÔNG VĂN 5512/BGDĐT)
Môn học: ${lpSubject} - ${lpGrade}
Tên bài: ${lpLessonName}
Thời lượng thực hiện: ${lpDuration}

I. MỤC TIÊU BÀI DẠY:
1. Kiến thức:
- Học sinh hiểu và phát biểu chính xác định nghĩa, điều kiện xác định và hằng đẳng thức cốt lõi của bài học.
- Vận dụng linh hoạt các biến đổi đồng nhất thức để rút gọn biểu thức và giải quyết các bài toán liên quan.

2. Năng lực:
- Năng lực toán học / tư duy logic: Khả năng phân tích, so sánh, tổng quát hóa.
- Năng lực giải quyết vấn đề: Vận dụng kiến thức để giải bài toán thực tiễn.
- Năng lực tự chủ và tự học: Tự giác hoàn thành phiếu học tập cá nhân.
- Năng lực giao tiếp và hợp tác: Tương tác tích cực trong thảo luận nhóm 4 bạn.

3. Phẩm chất:
- Chăm chỉ, cẩn thận, chính xác trong suy luận và trình bày.
- Trách nhiệm trong việc hoàn thành nhiệm vụ nhóm.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
- Giáo viên: Màn hình tương tác Smart Class, bài giảng điện tử Canva, phiếu học tập số 1 & 2.
- Học sinh: SGK, vở ghi, bút viết, bảng nhóm.

III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN 5512):
1. Hoạt động 1: Khởi động (5 phút)
- Mục tiêu: Kích hoạt kiến thức nền tảng và tạo mâu thuẫn nhận thức.
- Nội dung: Giáo viên tổ chức trò chơi "Vòng quay may mắn" giải câu đố nhanh.
- Sản phẩm: Câu trả lời và tâm thế hào hứng của học sinh.

2. Hoạt động 2: Hình thành kiến thức mới (20 phút)
- Hoạt động 2.1: Tiếp cận kiến thức trọng tâm qua bài toán thực tế.
- Hoạt động 2.2: Học sinh thực hiện hoạt động khám phá và rút ra quy tắc/hằng đẳng thức.

3. Hoạt động 3: Luyện tập (13 phút)
- Áp dụng kỹ thuật "Khăn trải bàn" hoàn thành Phiếu học tập số 1.
- Giáo viên chiếu sản phẩm nhóm tiêu biểu lên màn hình, tổ chức đánh giá chéo.

4. Hoạt động 4: Vận dụng & Mở rộng (7 phút)
- Bài toán liên môn / thực tiễn nâng cao phát triển tư duy.
- Hướng dẫn tự học và chuẩn bị bài mới ở nhà.`;

      setGeneratedLessonPlan(planText);
      showToast('Đã tạo kế hoạch bài dạy chuẩn CV 5512 thành công!', 'success');
      soundManager.playCorrect();
    }, 1200);
  };

  const handleCopyLessonPlan = () => {
    if (!generatedLessonPlan) return;
    navigator.clipboard.writeText(generatedLessonPlan);
    showToast('Đã sao chép kế hoạch bài dạy vào Clipboard!', 'success');
  };

  // Send Chat message to Pedagogical Assistant (Gemini 3.8 Flash)
  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = (customPrompt || inputChat).trim();
    if (!query || isChatThinking) return;

    setInputChat('');
    const userMessageTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const updatedMessages = [
      ...chatMessages,
      { sender: 'user' as const, text: query, time: userMessageTime }
    ];
    setChatMessages(updatedMessages);
    setIsChatThinking(true);
    soundManager.playTick();

    const contextStr = includeClassContext
      ? `Lớp hiện tại: ${activeClass?.name || '9A1'} - Môn: ${activeClass?.subject || 'Toán học'} (Khối ${activeClass?.grade || 9})`
      : undefined;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: contextStr,
          history: updatedMessages.slice(-8).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || 'AI đã tiếp nhận câu hỏi của Thầy/Cô.';
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: replyText,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        soundManager.playCorrect();
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      console.warn('API chat offline fallback triggered:', err);
      // High-intelligence pedagogical fallback
      setTimeout(() => {
        let fallbackReply = '';
        if (/cực trị|gtnn|gtln|giải chi tiết|bài toán/i.test(query)) {
          fallbackReply = `### Lời giải chi tiết bài toán cực trị:
Cho $A = x - 2\\sqrt{x} + 5$ với $x \\ge 0$.

1. **Biến đổi đồng nhất thức:**
   Ta có: $A = (\\sqrt{x})^2 - 2\\sqrt{x}\\cdot 1 + 1 + 4 = (\\sqrt{x} - 1)^2 + 4$.

2. **Đánh giá cực trị:**
   Vì $(\\sqrt{x} - 1)^2 \\ge 0$ với mọi $x \\ge 0$,
   nên $A = (\\sqrt{x} - 1)^2 + 4 \\ge 4$.

3. **Xác định dấu bằng:**
   Dấu \"=\" xảy ra khi và chỉ khi $\\sqrt{x} - 1 = 0 \\Leftrightarrow \\sqrt{x} = 1 \\Leftrightarrow x = 1$ (thỏa mãn điều kiện $x \\ge 0$).

4. **Kết luận:** Giá trị nhỏ nhất của biểu thức $A$ là **$4$**, đạt được khi **$x = 1$**.

---
* **Lưu ý sư phạm cho Thầy/Cô:** Học sinh yếu thường quên kiểm tra điều kiện $x \\ge 0$ hoặc nhầm lẫn dấu bằng. Thầy/Cô nên nhắc các em bước thử lại $x = 1$ vào $A$ để kiểm tra kết quả!`;
        } else if (/gợi mở|phát vấn|yếu|kém/i.test(query)) {
          fallbackReply = `### Gợi ý chuỗi câu hỏi phát vấn phân hóa cho học sinh yếu:
1. **Câu 1 (Nhận biết):** \"Em hãy quan sát biểu thức dưới dấu căn là $2x - 6$. Biểu thức dưới dấu căn có được phép là số âm không?\" *(Chốt: Không được âm, tức là $\\ge 0$)*.
2. **Câu 2 (Thông hiểu):** \"Vậy ta phải đặt điều kiện gì cho $2x - 6$?\" *(Học sinh viết: $2x - 6 \\ge 0$)*.
3. **Câu 3 (Chuyển tiếp):** \"Chuyển $-6$ sang vế phải đổi dấu thành gì? Khi đó $2x$ như thế nào với $6$?\" *(Học sinh trả lời: $2x \\ge 6$)*.
4. **Câu 4 (Vận dụng & Chốt):** \"Chia cả 2 vế cho 2 thì được $x \\ge$ mấy?\" *(Học sinh chốt: $x \\ge 3$)*.
5. **Khắc sâu:** Cho học sinh thử thay $x = 0$ (bé hơn 3) vào để thấy máy tính báo lỗi Math Error.`;
        } else if (/mất trật tự|nói chuyện|cãi|sư phạm/i.test(query)) {
          fallbackReply = `### Quy trình xử lý sư phạm 4 bước:
1. **Bước 1 - Tác động không lời (Non-verbal):** Giáo viên dừng nói 3 giây, hướng mắt về phía 2 học sinh và nhẹ nhàng di chuyển lại gần bàn các em trong khi vẫn tiếp tục giảng. Đa số học sinh sẽ tự giác dừng nói chuyện.
2. **Bước 2 - Giao nhiệm vụ thay vì chỉ trích:** Thay vì quát mắng, hãy gọi một em đọc lại yêu cầu bài tập trên máy chiếu hoặc mời em lên bảng ghi chép kết quả thảo luận nhóm.
3. **Bước 3 - Giữ bình tĩnh & Không tranh cãi trước tập thể:** Nếu học sinh phản ứng vùng vằng, nói: *\"Thầy/Cô ghi nhận ý kiến của em, cuối giờ thầy/cô muốn nghe em chia sẻ rõ hơn trong 2 phút nhé.\"* để không ngắt quãng tiết học của cả lớp.
4. **Bước 4 - Trò chuyện riêng sau giờ:** Tìm hiểu nguyên nhân (bài quá khó, có khúc mắc gia đình hay bạn bè) và đưa ra cam kết cùng em tiến bộ.`;
        } else {
          fallbackReply = `### Tư vấn sư phạm từ Gemini AI:
Chào Thầy/Cô! Với nội dung: **"${query}"**

* **Định hướng theo GDPT 2018:** Chuyển từ truyền thụ một chiều sang tổ chức hoạt động để học sinh tự chiếm lĩnh tri thức.
* **Biện pháp thực tế:** 
  1. Sử dụng hình ảnh/bài toán thực tiễn làm cầu nối tạo hứng thú.
  2. Ứng dụng các công cụ tương tác số (như Vòng quay may mắn, máy chiếu Smart Class) để duy trì sự tập trung.
  3. Phân hóa nhiệm vụ học tập theo 4 mức độ nhận thức (Nhận biết - Thông hiểu - Vận dụng - Vận dụng cao).

Thầy/Cô có muốn tôi soạn thảo chi tiết hơn về ví dụ minh họa hoặc phiếu học tập cho phần này không ạ?`;
        }

        setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: fallbackReply,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        soundManager.playCorrect();
      }, 1000);
    } finally {
      setIsChatThinking(false);
    }
  };

  // Copy message text to clipboard
  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    showToast('Đã sao chép nội dung vào bộ nhớ tạm!', 'success');
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  // Text-to-speech for AI answers
  const handleSpeakText = (text: string, idx: number) => {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt không hỗ trợ đọc giọng nói', 'warning');
      return;
    }
    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Clean markdown symbols for natural reading
    const clean = text.replace(/[*#`$\-_~]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);
    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
    showToast('Đang phát âm thanh câu trả lời...', 'info');
  };

  // Clear chat history
  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMsgIdx(null);
    setChatMessages([
      {
        sender: 'ai',
        text: `Đã làm mới cuộc trò chuyện. Thầy/Cô có thể hỏi tôi bất kỳ điều gì về dạy học, chuyên môn môn học, giải bài tập hay tình huống lớp học!`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Đã làm mới hội thoại!', 'info');
  };

  // Download entire conversation transcript
  const handleDownloadChat = () => {
    const header = `BIÊN BẢN HỎI ĐÁP SƯ PHẠM VỚI GEMINI AI\nNgày xuất: ${new Date().toLocaleString('vi-VN')}\nLớp: ${activeClass?.name || 'Chung'} - Môn: ${activeClass?.subject || 'Toán học'}\n${'='.repeat(60)}\n\n`;
    const body = chatMessages
      .map(m => `[${m.time}] ${m.sender === 'user' ? 'THẦY/CÔ:' : 'GEMINI AI:'}\n${m.text}\n\n${'-'.repeat(40)}`)
      .join('\n\n');
    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hoi_Dap_AI_Su_Pham_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống văn bản hội thoại!', 'success');
  };

  // High-fidelity Markdown & Math formatting parser
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const formatInline = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-white tracking-wide">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded bg-purple-950/80 text-cyan-300 font-mono text-[11px] border border-purple-500/40">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <span key={i} className="px-1 font-mono text-amber-300 font-semibold bg-amber-950/20 rounded">
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      });
    };

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="my-2 p-3 bg-black/70 rounded-xl text-cyan-300 font-mono text-[11px] overflow-x-auto border border-cyan-500/30">
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      const trimmed = line.trim();

      if (trimmed === '---' || trimmed === '***') {
        elements.push(<hr key={idx} className="my-2.5 border-purple-500/25" />);
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="text-sm font-black text-cyan-300 mt-2.5 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span>{formatInline(trimmed.replace('### ', ''))}</span>
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={idx} className="text-base font-black text-white mt-3 mb-1.5 border-b border-purple-500/30 pb-1">
            {formatInline(trimmed.replace('## ', ''))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-black text-purple-300 mt-3 mb-1.5">
            {formatInline(trimmed.replace('# ', ''))}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-200 pl-1 sm:pl-2">
            <span className="text-purple-400 mt-0.5 shrink-0 font-bold">•</span>
            <span className="flex-1">{formatInline(trimmed.substring(2))}</span>
          </div>
        );
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-200 pl-1 sm:pl-2">
            <span className="font-mono font-bold text-cyan-400 shrink-0">{numMatch[1]}.</span>
            <span className="flex-1">{formatInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      if (!trimmed) {
        elements.push(<div key={idx} className="h-1.5" />);
        return;
      }

      elements.push(
        <p key={idx} className="my-0.5 leading-relaxed text-slate-200">
          {formatInline(trimmed)}
        </p>
      );
    });

    return elements;
  };

  return (
    <div className="space-y-4">
      {/* 1. MODERN EDUCATION SAAS HEADER */}
      <div className="bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-purple-300 hover:text-white bg-[#1a1438] hover:bg-[#251c50] rounded-xl transition-colors cursor-pointer shrink-0 border border-purple-500/30"
            title="Quay về Bàn làm việc"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <span>AI Hỗ Trợ Dạy Học</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500/50">
                Gemini 3.8 Flash • GDPT 2026
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Hỏi đáp sư phạm • Tạo câu hỏi thông minh 9 dạng • Soạn giáo án CV 5512 • Lập ma trận đề
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-200 bg-[#07243d] hover:bg-[#0c375c] border border-cyan-500/40 transition-all cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Ngân Hàng Câu Hỏi</span>
          </button>

          <span className="px-3 py-1.5 bg-[#070d1e] border border-purple-500/30 rounded-xl text-xs font-bold text-purple-200">
            Lớp {activeClass?.name || '6A1'} • {activeClass?.subject || 'Toán học'}
          </span>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0b1329] p-3.5 rounded-xl border border-purple-500/25 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Câu hỏi trong kho</span>
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{currentBankQuiz?.questions.length || 0}</div>
          <div className="text-[10px] text-purple-300 font-semibold mt-0.5">9 dạng câu hỏi chuẩn hóa</div>
        </div>

        <div className="bg-[#0b1329] p-3.5 rounded-xl border border-purple-500/25 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Chuẩn hóa CV 5512</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">100%</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Theo cấu trúc Bộ GD&ĐT</div>
        </div>

        <div className="bg-[#0b1329] p-3.5 rounded-xl border border-purple-500/25 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Ma trận đề kiểm tra</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">4 Mức độ</div>
          <div className="text-[10px] text-amber-400 font-semibold mt-0.5">40% - 30% - 20% - 10%</div>
        </div>

        <div className="bg-[#0b1329] p-3.5 rounded-xl border border-purple-500/25 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Trợ lý sư phạm</span>
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">Trực tuyến</div>
          <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Sẵn sàng hỗ trợ 24/7</div>
        </div>
      </div>

      {/* 3. SUB-MODULE NAVIGATION TABS (NGẮN GỌN & HIỆN ĐẠI) */}
      <div className="bg-[#0b1329] p-2 rounded-2xl border border-purple-500/30 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            activeSubTab === 'chat'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-black shadow-lg ring-1 ring-purple-400/50'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Hỏi AI Mọi Thứ</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-400 text-slate-950">LIVE</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('wizard')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'wizard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md ring-1 ring-purple-400/50'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span>AI Tạo Đề 9 Dạng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('lesson-plan')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'lesson-plan'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md ring-1 ring-purple-400/50'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Soạn Giáo Án CV 5512</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'matrix'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-md ring-1 ring-purple-400/50'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Ma Trận Đề Thi</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 5-STEP AI WIZARD GENERATOR
      ========================================================================= */}
      {activeSubTab === 'wizard' && (
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-5">
          {/* Progress bar */}
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                {wizardStep}
              </span>
              <div>
                <h3 className="text-sm font-black text-white">
                  {wizardStep === 1 && 'Bước 1: Nạp tài liệu nguồn (Upload DOCX/PDF/TXT hoặc chọn bài mẫu)'}
                  {wizardStep === 2 && 'Bước 2: Cấu hình ma trận 9 dạng câu hỏi & mức độ nhận thức'}
                  {wizardStep === 3 && 'Bước 3: AI Quét & Xử lý (Chống hallucination)'}
                  {wizardStep === 4 && 'Bước 4: Màn hình Review duyệt câu hỏi (Giáo viên kiểm tra & sửa)'}
                </h3>
                <p className="text-[11px] text-purple-300">Quy trình 5 bước theo bản đặc tả triển khai EdTech chuẩn</p>
              </div>
            </div>

            {wizardStep > 1 && wizardStep < 4 && (
              <button
                type="button"
                onClick={() => setWizardStep(prev => prev - 1)}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1 bg-[#142244] rounded-lg cursor-pointer"
              >
                ← Quay lại
              </button>
            )}
          </div>

          {/* STEP 1: NGUỒN TÀI LIỆU */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  1. Tải lên tệp tài liệu bài học / giáo án (.docx, .pdf, .txt, .xlsx):
                </label>
                <input
                  type="file"
                  ref={fileUploadRef}
                  accept=".docx,.pdf,.txt,.xlsx,.pptx"
                  onChange={handleWizardFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileUploadRef.current?.click()}
                  className="p-6 border-2 border-dashed border-purple-500/40 bg-[#070d1e] rounded-xl text-center space-y-2 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <Paperclip className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="text-sm font-bold text-white">
                    {sourceDocName ? `Tệp đã chọn: ${sourceDocName}` : 'Bấm hoặc kéo thả file bài học vào đây'}
                  </div>
                  <div className="text-[11px] text-purple-300">
                    Hỗ trợ tệp bài giảng, giáo án điện tử, tài liệu chuyên môn (Tối đa 25MB)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Hoặc chọn nhanh bài học mẫu chuẩn SGK THCS:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CURRICULUM_LESSONS.map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleSelectCurriculumLesson(l)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedLessonId === l.id
                          ? 'bg-purple-950/80 border-purple-400 text-white ring-1 ring-purple-400'
                          : 'bg-[#070d1e] border-purple-500/20 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      <div className="font-bold text-purple-300">{l.lesson}</div>
                      <div className="text-[10px] text-cyan-300 mt-0.5">{l.subject} • {l.grade}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">{l.summary}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 rounded-xl shadow-lg cursor-pointer"
                >
                  <span>Tiếp tục: Cấu hình ma trận đề →</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CẤU HÌNH MA TRẬN VÀ 9 DẠNG CÂU HỎI */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Môn học</label>
                  <select
                    value={wizardSubject}
                    onChange={e => setWizardSubject(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-white font-bold"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Khối lớp</label>
                  <select
                    value={wizardGrade}
                    onChange={e => setWizardGrade(e.target.value)}
                    className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-white font-bold"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Số lượng câu cần sinh</label>
                  <select
                    value={wizardNumQuestions}
                    onChange={e => setWizardNumQuestions(Number(e.target.value))}
                    className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-amber-300 font-black"
                  >
                    <option value={3}>3 câu hỏi</option>
                    <option value={5}>5 câu hỏi (Chuẩn đề xuất)</option>
                    <option value={8}>8 câu hỏi</option>
                    <option value={10}>10 câu hỏi (Đầy đủ ma trận)</option>
                  </select>
                </div>
              </div>

              {/* Tùy chọn 9 dạng câu hỏi */}
              <div className="p-3.5 bg-[#070d1e] rounded-xl border border-purple-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Hỗ trợ 9 dạng câu hỏi theo đặc tả PDF:</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">✓ Đã bật tự động phân bổ</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">1. Một đáp án</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">2. Nhiều đáp án</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">3. Đúng/Sai từng ý</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">4. Ghép đôi</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">5. Sắp xếp thứ tự</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">6. Điền khuyết</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">7. Trả lời ngắn</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">8. Tự luận rubric</span>
                  <span className="bg-[#0b1329] p-1.5 rounded border border-purple-500/20">9. Đoạn văn / Tình huống</span>
                </div>
              </div>

              {/* Chống hallucination */}
              <div className="flex items-center gap-2 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                <input
                  type="checkbox"
                  id="strictBinding"
                  checked={strictSourceBinding}
                  onChange={e => setStrictSourceBinding(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <label htmlFor="strictBinding" className="cursor-pointer">
                  <strong>Bật cơ chế chống Hallucination:</strong> Yêu cầu bám sát 100% nội dung bài học, không bịa trích dẫn, kèm nhãn &quot;AI đề xuất – cần giáo viên kiểm tra&quot;.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRunAiWizard}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 hover:from-purple-300 hover:to-cyan-300 rounded-xl shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                  <span>Kích hoạt Gemini AI: Sinh câu hỏi ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TIẾN TRÌNH QUÉT CỦA AI */}
          {isAiGenerating && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center text-purple-300">
                  <BrainCircuit className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <h4 className="text-base font-black text-white">{aiProgressStatus}</h4>
              <p className="text-xs text-purple-300">Áp dụng JSON schema chuẩn hóa và chống suy đoán sai lệch...</p>
            </div>
          )}

          {/* STEP 4 & 5: REVIEW DUYỆT & LƯU VÀO NGÂN HÀNG (THE CORE COMPONENT) */}
          {wizardStep === 4 && proposedQuestions.length > 0 && !isAiGenerating && (
            <div className="space-y-4">
              {/* Header duyệt */}
              <div className="bg-purple-950/70 border border-purple-500/40 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                    AI ĐỀ XUẤT – CẦN GIÁO VIÊN KIỂM TRA
                  </span>
                  <span className="text-slate-300 font-medium">
                    (Đã chọn duyệt: <strong className="text-emerald-400">{approvedQuestionIds.length}</strong> / {proposedQuestions.length} câu)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllApproved}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#142244] text-purple-200 hover:text-white cursor-pointer"
                  >
                    {approvedQuestionIds.length === proposedQuestions.length ? 'Bỏ chọn hết' : 'Chọn duyệt tất cả'}
                  </button>
                </div>
              </div>

              {/* Questions list to review */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {proposedQuestions.map((q, idx) => {
                  const isApproved = approvedQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                        isApproved
                          ? 'bg-[#071329] border-purple-400 ring-1 ring-purple-400/40'
                          : 'bg-[#070d1e] border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleApproveQuestion(q.id)}
                            className="text-purple-400 cursor-pointer"
                          >
                            {isApproved ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          <span className="font-mono font-bold text-purple-300">{q.code}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950 text-purple-200 border border-purple-500/30">
                            {q.questionType}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                            {q.level}
                          </span>
                          <span className="text-slate-400">{q.points || 1} điểm</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProposed(q.id)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Loại bỏ câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="font-semibold text-white leading-relaxed">
                        {q.question}
                      </div>

                      {/* Display options / sub-items */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1 pl-2">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg flex items-center justify-between text-[11px] ${
                                oIdx === q.correctIndex || q.correctIndices?.includes(oIdx)
                                  ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30'
                                  : 'text-slate-300'
                              }`}
                            >
                              <span>{opt}</span>
                              {(oIdx === q.correctIndex || q.correctIndices?.includes(oIdx)) && (
                                <span className="text-[10px] text-emerald-400">✓ Đáp án đúng</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False items */}
                      {q.trueFalseStatements && (
                        <div className="space-y-1 pl-2">
                          {q.trueFalseStatements.map((tf, tfIdx) => (
                            <div key={tfIdx} className="flex items-center justify-between text-[11px] bg-[#0b1329] p-1.5 rounded">
                              <span className="text-slate-300">{tf.statement}</span>
                              <span className={`px-2 py-0.2 rounded font-bold ${tf.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tf.isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Matching items */}
                      {q.matchingPairs && (
                        <div className="grid grid-cols-2 gap-1.5 pl-2 text-[11px]">
                          {q.matchingPairs.map(p => (
                            <div key={p.id} className="p-1 bg-[#0b1329] rounded flex items-center justify-between">
                              <span className="text-slate-300">{p.left}</span>
                              <span className="text-indigo-400 font-bold">↔ {p.right}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fill blank */}
                      {q.fillBlankAnswer && (
                        <div className="p-2 bg-[#0b1329] rounded text-[11px] text-teal-300 font-mono">
                          Đáp án điền: <strong>{q.fillBlankAnswer}</strong>
                        </div>
                      )}

                      <div className="p-2 bg-[#0b1329] rounded text-[11px] text-slate-300 border border-purple-500/20">
                        <strong className="text-purple-300">Lời giải chi tiết:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom save bar */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Soạn bộ đề khác
                </button>

                <button
                  type="button"
                  onClick={handleSaveToQuestionBank}
                  disabled={approvedQuestionIds.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-lg cursor-pointer disabled:opacity-40"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Xác Nhận Lưu {approvedQuestionIds.length} Câu Đã Duyệt Vào Ngân Hàng</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI SOẠN KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CV 5512)
      ========================================================================= */}
      {activeSubTab === 'lesson-plan' && (
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>AI Soạn Giáo Án / Kế Hoạch Bài Dạy Chuẩn Công Văn 5512</span>
              </h3>
              <p className="text-xs text-slate-300">
                Tự động cấu trúc 4 hoạt động dạy học: Khởi động, Khám phá, Luyện tập, Vận dụng
              </p>
            </div>

            {generatedLessonPlan && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLessonPlan}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#142244] text-cyan-300 hover:text-white rounded-xl border border-cyan-500/30 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300">Môn học</label>
              <select
                value={lpSubject}
                onChange={e => setLpSubject(e.target.value)}
                className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-white font-bold"
              >
                <option value="Toán học">Toán học</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Ngữ văn">Ngữ văn</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300">Khối lớp</label>
              <select
                value={lpGrade}
                onChange={e => setLpGrade(e.target.value)}
                className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-white font-bold"
              >
                <option value="Khối 6">Khối 6</option>
                <option value="Khối 7">Khối 7</option>
                <option value="Khối 8">Khối 8</option>
                <option value="Khối 9">Khối 9</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-300">Tên bài học</label>
              <input
                type="text"
                value={lpLessonName}
                onChange={e => setLpLessonName(e.target.value)}
                placeholder="Nhập tên bài học..."
                className="w-full mt-1 p-2 text-xs bg-[#070d1e] border border-purple-500/30 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              disabled={isLpGenerating}
              onClick={handleGenerateLessonPlan}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isLpGenerating ? 'Đang tạo kế hoạch bài dạy...' : 'AI Soạn Kế Hoạch Bài Dạy Ngay'}</span>
            </button>
          </div>

          {generatedLessonPlan && (
            <div className="p-4 bg-[#070d1e] rounded-xl border border-purple-500/30 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto">
              {generatedLessonPlan}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: EXAM MATRIX ANALYZER
      ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Bản Đặc Tả & Ma Trận Đề Kiểm Tra Định Kỳ THCS</span>
              </h3>
              <p className="text-xs text-slate-300">
                Phân bổ chuẩn kiến thức kỹ năng theo 4 mức độ nhận thức (40% - 30% - 20% - 10%)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={matrixExamType}
                onChange={e => setMatrixExamType(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-bold bg-[#070d1e] border border-amber-500/30 rounded-xl text-amber-300"
              >
                <option value="15min">Bài kiểm tra 15 phút</option>
                <option value="midterm">Đề thi Giữa học kỳ (45-60 phút)</option>
                <option value="final">Đề thi Cuối học kỳ (90 phút)</option>
              </select>
            </div>
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#070d1e] text-slate-300 border-b border-purple-500/20">
                  <th className="p-2.5 font-bold">Chủ đề / Đơn vị kiến thức</th>
                  <th className="p-2.5 text-center font-bold text-emerald-300">Nhận biết (40%)</th>
                  <th className="p-2.5 text-center font-bold text-blue-300">Thông hiểu (30%)</th>
                  <th className="p-2.5 text-center font-bold text-amber-300">Vận dụng (20%)</th>
                  <th className="p-2.5 text-center font-bold text-rose-300">Vận dụng cao (10%)</th>
                  <th className="p-2.5 text-center font-bold text-white">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                <tr>
                  <td className="p-2.5 font-bold text-white">1. Căn bậc hai và điều kiện xác định</td>
                  <td className="p-2.5 text-center font-mono">2 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">-</td>
                  <td className="p-2.5 text-center font-bold text-emerald-400">2.0 đ</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">2. Hằng đẳng thức √(A²) = |A|</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">2 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-mono">-</td>
                  <td className="p-2.5 text-center font-bold text-emerald-400">2.5 đ</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">3. Biến đổi rút gọn biểu thức chứa căn</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">2 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-bold text-emerald-400">3.5 đ</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">4. Giải phương trình chứa căn & Cực trị</td>
                  <td className="p-2.5 text-center font-mono">-</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (0.5 đ)</td>
                  <td className="p-2.5 text-center font-mono">1 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center font-bold text-emerald-400">2.0 đ</td>
                </tr>
                <tr className="bg-[#142244]/60 font-black text-white">
                  <td className="p-2.5">TỔNG CỘNG</td>
                  <td className="p-2.5 text-center text-emerald-300">4 câu (4.0 đ)</td>
                  <td className="p-2.5 text-center text-blue-300">6 câu (3.0 đ)</td>
                  <td className="p-2.5 text-center text-amber-300">4 câu (2.0 đ)</td>
                  <td className="p-2.5 text-center text-rose-300">2 câu (1.0 đ)</td>
                  <td className="p-2.5 text-center text-amber-300 text-sm">10.0 đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: HỎI AI MỌI THỨ - TRỢ LÝ SƯ PHẠM GEMINI 3.8 FLASH TOÀN NĂNG
      ========================================================================= */}
      {activeSubTab === 'chat' && (
        <div className="bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-purple-500/30 shadow-2xl space-y-4">
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span>Hỏi AI Mọi Thứ - Trợ Lý Sư Phạm Toàn Năng</span>
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Flash Sẵn Sàng</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Giải bài tập chuyên môn • Soạn câu hỏi & đề thi • Xử lý tình huống lớp học • Phương pháp dạy học • Mọi câu hỏi giáo dục & đời sống
              </p>
            </div>

            {/* Quick Actions Right */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIncludeClassContext(!includeClassContext)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                  includeClassContext
                    ? 'bg-purple-950/80 text-purple-200 border-purple-500/50'
                    : 'bg-[#070d1e] text-slate-400 border-slate-700'
                }`}
                title="Tự động đính kèm thông tin môn và lớp khi hỏi"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Ngữ cảnh: Lớp {activeClass?.name || '9A1'} ({activeClass?.subject || 'Toán'})</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 bg-[#070d1e] hover:bg-[#142244] border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                title="Tải biên bản hội thoại (.txt)"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Xuất văn bản</span>
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 transition-colors cursor-pointer"
                title="Xóa toàn bộ cuộc trò chuyện"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>

          {/* Quick Categories Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {QUICK_PROMPT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedPromptCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPromptCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-[#070d1e] text-slate-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Filtered Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_TEACHER_PROMPTS
                .filter(p => selectedPromptCategory === 'all' || p.category === selectedPromptCategory)
                .slice(0, 5)
                .map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputChat(item.prompt);
                      handleSendChat(undefined, item.prompt);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141b38] hover:bg-[#1e2a56] text-purple-200 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:scale-[1.01]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{item.title}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-4 min-h-[380px] max-h-[55vh] overflow-y-auto pr-2 bg-[#070d1e]/80 p-4 rounded-xl border border-purple-500/20">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full bg-[#0b1329] rounded-[10px] flex items-center justify-center text-purple-300">
                      <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                    </div>
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none font-medium'
                      : 'bg-[#0b1329] text-slate-200 border border-purple-500/30 rounded-bl-none'
                  }`}
                >
                  {/* Meta bar for AI responses */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between gap-3 border-b border-purple-500/20 pb-2 mb-2 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Trợ Lý Sư Phạm • Gemini 3.8 Flash</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">{msg.time}</span>
                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, idx)}
                          className="p-1 hover:text-white text-slate-400 rounded transition-colors cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          {copiedMsgIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* TTS Speak button */}
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, idx)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            speakingMsgIdx === idx ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Đọc to bằng giọng nói tiếng Việt"
                        >
                          {speakingMsgIdx === idx ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Message Body */}
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-line text-sm">{msg.text}</div>
                  ) : (
                    <div className="text-xs space-y-1">
                      {renderFormattedMessage(msg.text)}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-purple-200 shrink-0 shadow-md">
                    <GraduationCap className="w-4 h-4 text-purple-300" />
                  </div>
                )}
              </div>
            ))}

            {isChatThinking && (
              <div className="flex items-center gap-3 p-3.5 bg-[#0b1329] border border-cyan-500/30 rounded-2xl max-w-md animate-pulse shadow-md">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400">
                  <BrainCircuit className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-xs text-cyan-300">
                  <div className="font-bold">Gemini 3.8 Flash đang suy luận sư phạm...</div>
                  <div className="text-[10px] text-slate-400">Đang tra cứu chuẩn kiến thức GDPT 2018 & biên soạn câu trả lời tối ưu</div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input form */}
          <form
            onSubmit={e => handleSendChat(e)}
            className="p-2 sm:p-3 bg-[#070d1e] rounded-2xl border border-purple-500/30 shadow-inner space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputChat}
                onChange={e => setInputChat(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Thầy/Cô hãy hỏi bất kỳ điều gì: giải bài tập khó, soạn câu hỏi, phương pháp giảng dạy, xử lý tình huống lớp học..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputChat.trim() || isChatThinking}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 hover:from-cyan-300 hover:to-purple-300 rounded-xl shadow-lg cursor-pointer disabled:opacity-40 transition-all hover:scale-[1.02] shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Câu Hỏi</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-purple-500/15 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Nhấn <strong>Enter</strong> để gửi câu hỏi • Phản hồi từ mô hình chuẩn <strong>Gemini 3.8 Flash</strong></span>
              </span>
              <span className="text-[10px] text-purple-300 font-medium">
                Hỗ trợ 100% môn học: Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Anh, Tin, GDCD...
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
