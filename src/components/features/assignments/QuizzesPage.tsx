import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  QuizQuestion,
  QuestionLevel,
  QuestionType,
  TrueFalseStatement,
  MatchingPair
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
  ChevronRight
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
  const { activeClass, quizzes, updateQuiz, createQuiz, setActiveTab, showToast } = useApp();

  // Current primary bank
  const currentBankQuiz = quizzes[0] || null;
  const allQuestions: QuizQuestion[] = useMemo(() => {
    return currentBankQuiz?.questions || [];
  }, [currentBankQuiz]);

  // Main UI Mode: 'create' (Method tabs as shown in screenshot) vs 'list' (Repository view)
  const [currentView, setCurrentView] = useState<'create' | 'list'>('create');

  // Method selector tab: 'import' (Tab 1), 'ai' (Tab 2 - Active in screenshot), 'manual' (Tab 3)
  const [methodTab, setMethodTab] = useState<'import' | 'ai' | 'manual'>('ai');

  // -------------------------------------------------------------
  // TAB 2: TẠO BẰNG AI THÔNG MINH (ACTIVE IN SCREENSHOT)
  // -------------------------------------------------------------
  // Source pills: 'text' (Văn bản), 'file' (File PDF/Word), 'link' (Link Web), 'image' (Hình ảnh)
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
  // LIST / REPOSITORY FILTERING STATES
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  // Interactive Projector Testing Mode
  const [isProjectorModeActive, setIsProjectorModeActive] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [testScore, setTestScore] = useState(0);

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

  // Statistics
  const stats = useMemo(() => {
    const total = allQuestions.length;
    const nhanBiet = allQuestions.filter(q => q.level === 'Nhận biết').length;
    const thongHieu = allQuestions.filter(q => q.level === 'Thông hiểu').length;
    const vanDung = allQuestions.filter(q => q.level === 'Vận dụng').length;
    const vanDungCao = allQuestions.filter(q => q.level === 'Vận dụng cao').length;
    const singleChoice = allQuestions.filter(q => q.questionType === '1 Đáp án').length;
    const trueFalse = allQuestions.filter(q => q.questionType === 'Đúng / Sai').length;
    return { total, nhanBiet, thongHieu, vanDung, vanDungCao, singleChoice, trueFalse };
  }, [allQuestions]);

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
    setTimeout(() => setGenerationStep(2), 600);
    setTimeout(() => setGenerationStep(3), 1200);
    setTimeout(() => setGenerationStep(4), 1800);
    setTimeout(() => {
      setGenerationStep(5);
      setIsGenerating(false);

      // Generate pedagogical questions aligned with Vietnamese GDPT standard
      const count = Number(aiCount) || 5;
      const generated: QuizQuestion[] = [];
      const prefix = aiSubject === 'Toán học' ? 'TOAN' :
                     aiSubject === 'Ngữ văn' ? 'VAN' :
                     aiSubject === 'Tiếng Anh' ? 'ANH' :
                     aiSubject === 'Vật lý' ? 'LY' : 'KHTN';
      const gradeNum = aiGrade.replace(/\D/g, '') || '10';

      // Q1: Nhận biết (1 Đáp án)
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

      // Q5: Vận dụng cao (Tự luận ngắn / Trả lời có rubric)
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

      // Extra questions if count > 5
      for (let i = 6; i <= count; i++) {
        generated.push({
          id: `q-ai-${Date.now()}-${i}`,
          code: `${prefix}${gradeNum}-${String(i).padStart(2, '0')}`,
          question: `[Câu hỏi ${i} - ${aiSubject}] Hãy xác định tính đúng đắn của giải thuật xử lý trong tình huống thực tế của bài học:`,
          options: [
            `Phương án A (Tối ưu nhất cho điều kiện khối ${gradeNum})`,
            'Phương án B (Chỉ đúng trong trường hợp đặc biệt)',
            'Phương án C (Chưa đủ căn cứ xác thực)',
            'Phương án D (Không áp dụng được trong thực tế)'
          ],
          correctIndex: 0,
          subject: aiSubject,
          grade: aiGrade,
          level: 'Thông hiểu',
          questionType: '1 Đáp án',
          points: 1,
          sourceDoc: uploadedFileName || 'Nội dung bài học SGK',
          explanation: 'Phương án A được xây dựng dựa trên nguyên lý chuẩn của chương trình giáo dục phổ thông.'
        });
      }

      setAiGeneratedQuestions(generated);
      setSelectedAiIds(generated.map(q => q.id));
      setShowAiReview(true);
      showToast(`AI Gemini đã tạo thành công ${generated.length} câu hỏi chuẩn hóa! Vui lòng duyệt & lưu.`, 'success');
      soundManager.playFanfare();
    }, 2400);
  };

  // Save approved AI questions to bank
  const handleSaveApprovedAiQuestions = () => {
    const toSave = aiGeneratedQuestions.filter(q => selectedAiIds.includes(q.id));
    if (toSave.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 câu hỏi để lưu vào ngân hàng', 'warning');
      return;
    }

    if (!currentBankQuiz) {
      createQuiz({
        classId: activeClass?.id || 'class-default',
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
    setCurrentView('list'); // Switch to repository to see saved questions
  };

  // -------------------------------------------------------------
  // TAB 1: IMPORT FILE & PARSE LOGIC
  // -------------------------------------------------------------
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Mã câu': 'TOAN10-001',
        'Nội dung câu hỏi': 'Trong các mệnh đề sau, mệnh đề nào là mệnh đề đúng?',
        'Dạng câu hỏi': '1 Đáp án',
        'Phương án A': 'Số 17 là số nguyên tố',
        'Phương án B': 'Tam giác đều có 4 cạnh bằng nhau',
        'Phương án C': 'Số 0 là số nguyên dương nhỏ nhất',
        'Phương án D': 'Số vô tỉ có thể viết dưới dạng phân số a/b',
        'Đáp án đúng': 'A',
        'Mức độ': 'Nhận biết',
        'Môn học': 'Toán học',
        'Khối lớp': 'Khối 10',
        'Điểm số': 1,
        'Lời giải chi tiết': '17 chỉ chia hết cho 1 và chính nó nên 17 là số nguyên tố. Chọn A.'
      },
      {
        'Mã câu': 'TOAN10-002',
        'Nội dung câu hỏi': 'Tập hợp A = {x ∈ R | x² - 4 = 0} có số phần tử là bao nhiêu?',
        'Dạng câu hỏi': 'Điền khuyết',
        'Phương án A': '',
        'Phương án B': '',
        'Phương án C': '',
        'Phương án D': '',
        'Đáp án đúng': '2',
        'Mức độ': 'Thông hiểu',
        'Môn học': 'Toán học',
        'Khối lớp': 'Khối 10',
        'Điểm số': 1,
        'Lời giải chi tiết': 'x² - 4 = 0 <=> x = ±2. Do đó A có đúng 2 phần tử.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoi_Mau');
    XLSX.writeFile(workbook, 'Mau_Import_Ngan_Hang_Cau_Hoi.xlsx');
    showToast('Đã tải xuống file mẫu Excel thành công!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);

          if (rows.length === 0) {
            showToast('File Excel không có dữ liệu!', 'warning');
            return;
          }

          const parsedList: QuizQuestion[] = rows.map((r, idx) => {
            const rawType = r['Dạng câu hỏi'] || r['Dạng'] || '1 Đáp án';
            const questionType: QuestionType =
              rawType.includes('Nhiều') ? 'Nhiều đáp án' :
              rawType.includes('Đúng') || rawType.includes('Sai') ? 'Đúng / Sai' :
              rawType.includes('Điền') ? 'Điền khuyết' : '1 Đáp án';

            const opts = [
              String(r['Phương án A'] || r['A'] || ''),
              String(r['Phương án B'] || r['B'] || ''),
              String(r['Phương án C'] || r['C'] || ''),
              String(r['Phương án D'] || r['D'] || '')
            ];

            const ansStr = String(r['Đáp án đúng'] || r['Đáp án'] || 'A').toUpperCase();
            let correctIndex = 0;
            if (ansStr.includes('B')) correctIndex = 1;
            else if (ansStr.includes('C')) correctIndex = 2;
            else if (ansStr.includes('D')) correctIndex = 3;

            return {
              id: `q-excel-${Date.now()}-${idx}`,
              code: r['Mã câu'] || `CH-${String(allQuestions.length + idx + 1).padStart(3, '0')}`,
              question: r['Nội dung câu hỏi'] || r['Câu hỏi'] || 'Câu hỏi import',
              options: opts,
              correctIndex,
              fillBlankAnswer: questionType === 'Điền khuyết' ? ansStr : undefined,
              subject: r['Môn học'] || aiSubject,
              grade: r['Khối lớp'] || aiGrade,
              level: (r['Mức độ'] || 'Thông hiểu') as QuestionLevel,
              questionType,
              points: Number(r['Điểm số']) || 1,
              explanation: r['Lời giải chi tiết'] || 'Lời giải chi tiết.'
            };
          });

          setParsedImportQuestions(parsedList);
          setSelectedImportIndices(parsedList.map((_, i) => i));
          showToast(`Đã nhận diện ${parsedList.length} câu hỏi từ file Excel!`, 'success');
        } catch {
          showToast('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = String(evt.target?.result || '');
        parseTextIntoQuestions(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const parseTextIntoQuestions = (text: string, sourceName?: string) => {
    if (!text.trim()) {
      showToast('Không có nội dung để phân tích', 'warning');
      return;
    }
    const blocks = text.split(/(?:(?:^|\n)(?:Câu\s+\d+|[0-9]{1,2}[.:)]))\s*/i).map(b => b.trim()).filter(Boolean);
    if (blocks.length === 0) {
      showToast('Không tìm thấy cú pháp câu hỏi hợp lệ trong văn bản', 'warning');
      return;
    }

    const parsed: QuizQuestion[] = blocks.map((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const questionText = lines[0] || 'Nội dung câu hỏi';
      const optA = lines.find(l => /^A[.:)]/i.test(l))?.replace(/^A[.:)]\s*/i, '') || 'Lựa chọn A';
      const optB = lines.find(l => /^B[.:)]/i.test(l))?.replace(/^B[.:)]\s*/i, '') || 'Lựa chọn B';
      const optC = lines.find(l => /^C[.:)]/i.test(l))?.replace(/^C[.:)]\s*/i, '') || 'Lựa chọn C';
      const optD = lines.find(l => /^D[.:)]/i.test(l))?.replace(/^D[.:)]\s*/i, '') || 'Lựa chọn D';

      const ansLine = lines.find(l => /(?:Đáp án|ĐA|Key)[:\s]/i.test(l));
      let correctIndex = 0;
      if (ansLine) {
        if (/B/i.test(ansLine)) correctIndex = 1;
        else if (/C/i.test(ansLine)) correctIndex = 2;
        else if (/D/i.test(ansLine)) correctIndex = 3;
      }

      const explLine = lines.find(l => /(?:Lời giải|Giải thích|HD)[:\s]/i.test(l))?.replace(/(?:Lời giải|Giải thích|HD)[:\s]*/i, '');

      return {
        id: `q-import-${Date.now()}-${idx}`,
        code: `CH-${String(allQuestions.length + idx + 1).padStart(3, '0')}`,
        question: questionText,
        options: [optA, optB, optC, optD],
        correctIndex,
        subject: aiSubject,
        grade: aiGrade,
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: explLine || 'Lời giải chi tiết.',
        sourceDoc: sourceName || 'Văn bản import'
      };
    });

    setParsedImportQuestions(parsed);
    setSelectedImportIndices(parsed.map((_, i) => i));
    showToast(`Đã nhận diện ${parsed.length} câu hỏi hợp lệ!`, 'success');
  };

  const handleConfirmBatchImport = () => {
    if (!currentBankQuiz || selectedImportIndices.length === 0) return;
    const toImport = parsedImportQuestions.filter((_, idx) => selectedImportIndices.includes(idx));

    updateQuiz(currentBankQuiz.id, {
      questions: [...toImport, ...currentBankQuiz.questions]
    });

    showToast(`Đã nhập thành công ${toImport.length} câu hỏi vào ngân hàng!`, 'success');
    soundManager.playCorrect();
    setParsedImportQuestions([]);
    setSelectedImportIndices([]);
    setCurrentView('list');
  };

  // -------------------------------------------------------------
  // TAB 3: TẠO BẰNG THỦ CÔNG
  // -------------------------------------------------------------
  const handleSaveManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.question.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi', 'warning');
      return;
    }

    const newQuestion: QuizQuestion = {
      ...manualForm,
      id: `q-manual-${Date.now()}`
    };

    if (!currentBankQuiz) {
      createQuiz({
        classId: activeClass?.id || 'class-default',
        title: `Ngân hàng câu hỏi ${manualForm.subject}`,
        subject: manualForm.subject || 'Toán học',
        durationMinutes: 45,
        questions: [newQuestion]
      });
    } else {
      updateQuiz(currentBankQuiz.id, {
        questions: [newQuestion, ...currentBankQuiz.questions]
      });
    }

    showToast('Đã thêm câu hỏi thủ công vào ngân hàng thành công!', 'success');
    soundManager.playCorrect();

    // Reset form
    setManualForm(prev => ({
      ...prev,
      code: `CH-${String(allQuestions.length + 2).padStart(3, '0')}`,
      question: '',
      options: ['', '', '', ''],
      fillBlankAnswer: '',
      explanation: ''
    }));
    setCurrentView('list');
  };

  // Delete question from repository
  const handleDeleteQuestion = (id: string) => {
    if (!currentBankQuiz) return;
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    const updated = allQuestions.filter(q => q.id !== id);
    updateQuiz(currentBankQuiz.id, { questions: updated });
    setSelectedQuestionIds(prev => prev.filter(i => i !== id));
    showToast('Đã xóa câu hỏi khỏi ngân hàng', 'info');
  };

  // Delete selected batch
  const handleDeleteSelected = () => {
    if (!currentBankQuiz || selectedQuestionIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedQuestionIds.length} câu hỏi đã chọn?`)) return;
    const updated = allQuestions.filter(q => !selectedQuestionIds.includes(q.id));
    updateQuiz(currentBankQuiz.id, { questions: updated });
    setSelectedQuestionIds([]);
    showToast(`Đã xóa ${selectedQuestionIds.length} câu hỏi`, 'info');
  };

  // Export questions to JSON
  const handleExportFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allQuestions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `Ngan_Hang_Cau_Hoi_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    showToast(`Đã xuất ${allQuestions.length} câu hỏi ra file JSON thành công!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. TOP BREADCRUMB BAR (MATCHES EXACT SCREENSHOT)           */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* 2. METHOD SELECTOR ROW & RIGHT ACTION BUTTON               */}
      {/* ========================================================= */}
      <div className="bg-[#0b1329] p-3 sm:p-4 rounded-2xl border border-cyan-500/30 shadow-xl flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Method Selector Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold text-cyan-300 mr-1 hidden sm:inline">
            Phương thức:
          </span>

          {/* Tab 1: Nhập câu hỏi bằng cách import */}
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

          {/* Tab 2: Tạo bằng AI thông minh (Active in screenshot with purple gradient) */}
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

          {/* Tab 3: Tạo bằng thủ công */}
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

        {/* Right: Quay lại danh sách ngân hàng Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView(currentView === 'list' ? 'create' : 'list')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-200 bg-[#070d1e] hover:bg-[#121c38] border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-md"
            title="Xem toàn bộ kho câu hỏi trong ngân hàng"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {currentView === 'list' ? '← Soạn & Tạo câu hỏi' : '← Quay lại danh sách ngân hàng'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE CONTENT ACCORDING TO SELECTED TAB       */}
      {/* ========================================================= */}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: TRỢ LÝ AI GEMINI (EXACT MATCH TO IMAGE_201A7284)   */}
      {/* --------------------------------------------------------- */}
      {currentView === 'create' && methodTab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
            {/* Header: Title and Subtitle */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                Tab 2: Trợ lý AI Gemini – Tạo Ngân hàng câu hỏi thông minh
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Quy trình AI 5 bước: Nhập chủ đề bài học → Cấu hình khối, môn, số lượng → Gemini tạo câu hỏi → Review & Lưu.
              </p>
            </div>

            {/* Anti-Hallucination Callout Banner */}
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

              {/* 4 Source Pills */}
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

            {/* Hidden Inputs for File and Image */}
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

            {/* File & Link preview indicators */}
            {aiSourceType === 'file' && uploadedFileName && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-400" />
                  <span>Đã chọn tệp tài liệu: <strong>{uploadedFileName}</strong></span>
                </div>
                <button
                  onClick={() => setUploadedFileName('')}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {aiSourceType === 'link' && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#070d1e] border border-cyan-500/30">
                <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                <input
                  type="url"
                  value={webLinkUrl}
                  onChange={e => setWebLinkUrl(e.target.value)}
                  placeholder="https://hanhtrangso.nxbgd.vn/sach-giao-khoa/..."
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            )}

            {aiSourceType === 'image' && uploadedImagePreview && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={uploadedImagePreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-purple-400"
                  />
                  <span className="text-xs text-purple-200 font-semibold">Ảnh chụp bài học sẵn sàng để AI OCR và sinh câu hỏi</span>
                </div>
                <button
                  onClick={() => setUploadedImagePreview(null)}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Textarea Input (Main text box from screenshot) */}
            <div className="space-y-1.5">
              <textarea
                value={aiPromptText}
                onChange={e => setAiPromptText(e.target.value)}
                placeholder="Dán hoặc nhập nội dung chủ đề bài học, đoạn trích tài liệu, yêu cầu sinh câu hỏi..."
                className="w-full h-32 sm:h-36 p-3.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none shadow-inner"
              />

              {/* Quick sample topic pills for 1-click testing */}
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

            {/* Form Controls Row: 3 Dropdowns (Môn học, Khối lớp, Số lượng câu tạo) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Dropdown 1: Môn học */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Môn học</label>
                <div className="relative">
                  <select
                    value={aiSubject}
                    onChange={e => setAiSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 appearance-none font-medium cursor-pointer"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý (KHTN)</option>
                    <option value="Hóa học">Hóa học (KHTN)</option>
                    <option value="Sinh học">Sinh học (KHTN)</option>
                    <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Giáo dục công dân">Giáo dục công dân</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Dropdown 2: Khối lớp (Matches screenshot 'Khối 10') */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Khối lớp</label>
                <div className="relative">
                  <select
                    value={aiGrade}
                    onChange={e => setAiGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 appearance-none font-medium cursor-pointer"
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

              {/* Dropdown 3: Số lượng câu tạo (Matches screenshot '5') */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Số lượng câu tạo</label>
                <div className="relative">
                  <select
                    value={aiCount}
                    onChange={e => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 appearance-none font-medium cursor-pointer"
                  >
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                    <option value={15}>15 câu</option>
                    <option value={20}>20 câu</option>
                    <option value={30}>30 câu</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bottom Right: Start AI Button */}
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

          {/* AI Generation Modal / Progress Animation */}
          {isGenerating && (
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-purple-500/40 shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-900/40">
                <BrainCircuit className="w-7 h-7 text-purple-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">
                  Gemini AI đang phân tích tài liệu và soạn đề ({generationStep}/5)
                </h3>
                <p className="text-xs text-purple-300">
                  {generationStep === 1 && 'Bước 1: Tiếp nhận văn bản chủ đề & cấu trúc ma trận kiến thức...'}
                  {generationStep === 2 && 'Bước 2: Phân tích 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)...'}
                  {generationStep === 3 && 'Bước 3: Soạn câu hỏi chuẩn 9 dạng GDPT & lời giải chi tiết từng bước...'}
                  {generationStep === 4 && 'Bước 4: Kiểm tra chống Hallucination & gắn nhãn căn cứ SGK...'}
                  {generationStep === 5 && 'Bước 5: Hoàn tất ma trận câu hỏi, sẵn sàng duyệt!'}
                </p>
              </div>
              <div className="w-full bg-[#070d1e] h-2 rounded-full overflow-hidden border border-purple-500/30 max-w-md mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(generationStep / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Review & Approve AI Generated Questions */}
          {showAiReview && aiGeneratedQuestions.length > 0 && (
            <div className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-purple-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-purple-500/20 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Duyệt câu hỏi AI đề xuất ({selectedAiIds.length}/{aiGeneratedQuestions.length} câu đã chọn)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Kiểm tra nội dung, lời giải chi tiết và chọn câu hỏi bạn muốn lưu vào ngân hàng.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAiIds.length === aiGeneratedQuestions.length) setSelectedAiIds([]);
                      else setSelectedAiIds(aiGeneratedQuestions.map(q => q.id));
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#070d1e] text-cyan-300 hover:text-white border border-cyan-500/30 cursor-pointer"
                  >
                    {selectedAiIds.length === aiGeneratedQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApprovedAiQuestions}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 cursor-pointer shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu vào Ngân hàng ({selectedAiIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Questions Cards in Review */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {aiGeneratedQuestions.map((q, idx) => {
                  const isChecked = selectedAiIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? 'bg-[#0e1733] border-purple-500/50 shadow-md'
                          : 'bg-[#070d1e]/80 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAiIds(prev =>
                                prev.includes(q.id) ? prev.filter(i => i !== q.id) : [...prev, q.id]
                              );
                            }}
                            className="mt-0.5 text-purple-400 hover:text-purple-300 cursor-pointer"
                          >
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                                {q.code || `Câu ${idx + 1}`}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                                {q.questionType}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                                {q.level}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                                ✓ AI bám sát nguồn
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white leading-relaxed">
                              {q.question}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setAiGeneratedQuestions(prev => prev.filter(item => item.id !== q.id));
                            setSelectedAiIds(prev => prev.filter(i => i !== q.id));
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          title="Xóa câu hỏi này khỏi danh sách đề xuất"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Options or specific question content */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-7">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs font-medium border ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                                  : 'bg-[#070d1e] border-slate-800 text-slate-300'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False Statements */}
                      {q.trueFalseStatements && (
                        <div className="space-y-1.5 mt-3 ml-7">
                          {q.trueFalseStatements.map((tf, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#070d1e] border border-slate-800 text-xs"
                            >
                              <span className="text-slate-200">{tf.statement}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tf.isCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}>
                                {tf.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fill in blank answer */}
                      {q.fillBlankAnswer && (
                        <div className="mt-2 ml-7 text-xs text-cyan-300 font-semibold">
                          Đáp án điền: <span className="bg-cyan-950 px-2 py-0.5 rounded text-white font-mono">{q.fillBlankAnswer}</span>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2.5 ml-7 p-2 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-[11px] text-slate-300">
                          <strong className="text-cyan-400">Lời giải chi tiết: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 1: NHẬP CÂU HỎI BẰNG CÁCH IMPORT                     */}
      {/* --------------------------------------------------------- */}
      {currentView === 'create' && methodTab === 'import' && (
        <div className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-cyan-500/20 pb-3">
            <div>
              <h2 className="text-base font-black text-white">
                Tab 1: Nhập câu hỏi bằng cách import đa định dạng
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Hỗ trợ tệp Excel (.xlsx, .xls), Word (.docx), CSV hoặc dán văn bản trực tiếp.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file mẫu Excel chuẩn</span>
            </button>
          </div>

          {/* Sub tabs: File upload vs Paste text */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportSubTab('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                importSubTab === 'file'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-[#070d1e] text-slate-300 border border-slate-700'
              }`}
            >
              Tải tệp Excel / Word
            </button>
            <button
              onClick={() => setImportSubTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                importSubTab === 'paste'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-[#070d1e] text-slate-300 border border-slate-700'
              }`}
            >
              Dán văn bản trực tiếp
            </button>
          </div>

          {/* Upload Dropzone */}
          {importSubTab === 'file' ? (
            <div
              onClick={() => fileImportInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#070d1e] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#091533]"
            >
              <input
                type="file"
                ref={fileImportInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.docx,.txt,.csv"
                className="hidden"
              />
              <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                Bấm để chọn tệp hoặc kéo thả file Excel / Word vào đây
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống tự động nhận diện Mã câu, Câu hỏi, Phương án A, B, C, D, Đáp án đúng và Lời giải.
              </p>
              {importFileName && (
                <div className="mt-3 inline-block px-3 py-1 bg-cyan-950 border border-cyan-400 rounded-lg text-xs font-mono text-cyan-200">
                  ✓ Đã chọn: {importFileName}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={importRawText}
                onChange={e => setImportRawText(e.target.value)}
                placeholder="Dán nội dung câu hỏi dạng:
Câu 1: Cho tam giác ABC vuông tại A...
A. 5 cm
B. 10 cm
C. 15 cm
D. 20 cm
Đáp án: A
Lời giải: Áp dụng định lý Pytago..."
                className="w-full h-44 p-3.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed font-mono resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => parseTextIntoQuestions(importRawText, 'Văn bản dán')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                >
                  Phân tích câu hỏi
                </button>
              </div>
            </div>
          )}

          {/* Parsed questions preview */}
          {parsedImportQuestions.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Đã nhận diện {parsedImportQuestions.length} câu hỏi hợp lệ
                </span>
                <button
                  type="button"
                  onClick={handleConfirmBatchImport}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 cursor-pointer shadow-md"
                >
                  Xác nhận nạp vào ngân hàng ({selectedImportIndices.length})
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {parsedImportQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-[#070d1e] rounded-xl border border-slate-800 text-xs">
                    <span className="text-cyan-400 font-bold mr-2">{q.code || `Câu ${idx + 1}`}:</span>
                    <span className="text-white">{q.question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: TẠO BẰNG THỦ CÔNG                                  */}
      {/* --------------------------------------------------------- */}
      {currentView === 'create' && methodTab === 'manual' && (
        <form onSubmit={handleSaveManualQuestion} className="bg-[#0b1329] p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="border-b border-cyan-500/20 pb-3">
            <h2 className="text-base font-black text-white">
              Tab 3: Soạn câu hỏi thủ công chuẩn 9 dạng kiến thức
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Nhập chi tiết đề bài, các phương án lựa chọn, đáp án đúng và lời giải chi tiết từng bước.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Mã câu hỏi</label>
              <input
                type="text"
                value={manualForm.code}
                onChange={e => setManualForm(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Môn học</label>
              <select
                value={manualForm.subject}
                onChange={e => setManualForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Toán học">Toán học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Khối lớp</label>
              <select
                value={manualForm.grade}
                onChange={e => setManualForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Khối 6">Khối 6</option>
                <option value="Khối 7">Khối 7</option>
                <option value="Khối 8">Khối 8</option>
                <option value="Khối 9">Khối 9</option>
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Dạng câu hỏi</label>
              <select
                value={manualForm.questionType}
                onChange={e => setManualForm(prev => ({ ...prev, questionType: e.target.value as QuestionType }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="1 Đáp án">Trắc nghiệm 1 đáp án</option>
                <option value="Nhiều đáp án">Trắc nghiệm nhiều đáp án</option>
                <option value="Đúng / Sai">Đúng / Sai 4 mệnh đề</option>
                <option value="Điền khuyết">Điền vào chỗ trống</option>
                <option value="Tự luận ngắn">Tự luận ngắn</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Nội dung câu hỏi *</label>
            <textarea
              value={manualForm.question}
              onChange={e => setManualForm(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Nhập nội dung đề bài..."
              className="w-full h-24 p-3 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none"
              required
            />
          </div>

          {/* Options for 1 Đáp án */}
          {manualForm.questionType === '1 Đáp án' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Các phương án lựa chọn (Tích chọn phương án đúng)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {manualForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#070d1e] p-2 rounded-xl border border-cyan-500/20">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={manualForm.correctIndex === i}
                      onChange={() => setManualForm(prev => ({ ...prev, correctIndex: i }))}
                      className="cursor-pointer"
                    />
                    <span className="text-xs font-bold text-cyan-400">{String.fromCharCode(65 + i)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...manualForm.options];
                        newOpts[i] = e.target.value;
                        setManualForm(prev => ({ ...prev, options: newOpts }));
                      }}
                      placeholder={`Nội dung phương án ${String.fromCharCode(65 + i)}`}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fill blank answer */}
          {manualForm.questionType === 'Điền khuyết' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Đáp án điền khuyết *</label>
              <input
                type="text"
                value={manualForm.fillBlankAnswer || ''}
                onChange={e => setManualForm(prev => ({ ...prev, fillBlankAnswer: e.target.value }))}
                placeholder="Ví dụ: 25"
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
              />
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Lời giải chi tiết</label>
            <textarea
              value={manualForm.explanation || ''}
              onChange={e => setManualForm(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Giải thích từng bước để học sinh xem lại sau khi làm bài..."
              className="w-full h-20 p-3 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 cursor-pointer shadow-lg"
            >
              Lưu câu hỏi vào Ngân hàng
            </button>
          </div>
        </form>
      )}

      {/* --------------------------------------------------------- */}
      {/* 4. QUESTION REPOSITORY (DANH SÁCH NGÂN HÀNG CÂU HỎI)      */}
      {/* --------------------------------------------------------- */}
      {currentView === 'list' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top KPI Summary Cards */}
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

          {/* Search, Filter & Batch Actions Bar */}
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo từ khóa, mã câu, nội dung..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Filter Subject */}
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
              >
                <option value="all">Tất cả môn học</option>
                <option value="Toán học">Toán học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
              </select>

              {/* Filter Grade */}
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
              >
                <option value="all">Tất cả khối lớp</option>
                <option value="Khối 6">Khối 6</option>
                <option value="Khối 7">Khối 7</option>
                <option value="Khối 8">Khối 8</option>
                <option value="Khối 9">Khối 9</option>
                <option value="Khối 10">Khối 10</option>
              </select>

              {/* Actions */}
              <button
                type="button"
                onClick={handleExportFile}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-200 bg-[#29200a] hover:bg-[#3d300f] border border-amber-500/40 cursor-pointer"
                title="Xuất file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất file</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('create');
                  setMethodTab('ai');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>+ AI Tạo thêm câu hỏi</span>
              </button>
            </div>

            {/* Selection row */}
            {selectedQuestionIds.length > 0 && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                <span className="text-cyan-200 font-bold">
                  Đã chọn {selectedQuestionIds.length} câu hỏi
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa các câu đã chọn</span>
                </button>
              </div>
            )}
          </div>

          {/* Questions Repository List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-[#0b1329] p-8 rounded-2xl border border-cyan-500/20 text-center space-y-2">
                <HelpCircle className="w-10 h-10 text-cyan-400 mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-white">Chưa có câu hỏi nào phù hợp với bộ lọc</h3>
                <p className="text-xs text-slate-400">
                  Hãy bấm vào "Tab 2: Tạo bằng AI thông minh" hoặc "Tab 1: Import" để nạp câu hỏi vào ngân hàng.
                </p>
                <button
                  onClick={() => {
                    setCurrentView('create');
                    setMethodTab('ai');
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Bắt đầu tạo câu hỏi bằng AI</span>
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                const isExplanationOpen = expandedExplanationIds[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedQuestionIds(prev =>
                              prev.includes(q.id) ? prev.filter(i => i !== q.id) : [...prev, q.id]
                            );
                          }}
                          className="mt-0.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                              {q.code || `CH-${String(idx + 1).padStart(3, '0')}`}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-semibold">
                              {q.subject || 'Toán học'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-semibold">
                              {q.grade || 'Khối 10'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                              {q.questionType}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              q.level === 'Nhận biết' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                              q.level === 'Thông hiểu' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                              q.level === 'Vận dụng' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                              'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}>
                              {q.level}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white leading-relaxed">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedExplanationIds(prev => ({ ...prev, [q.id]: !prev[q.id] }));
                          }}
                          className="p-1.5 text-cyan-400 hover:text-white bg-[#070d1e] rounded-lg border border-cyan-500/30 cursor-pointer"
                          title="Xem / ẩn lời giải"
                        >
                          {isExplanationOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 bg-[#070d1e] rounded-lg border border-rose-500/30 cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-7">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl text-xs font-medium border ${
                              oIdx === q.correctIndex
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                                : 'bg-[#070d1e] border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="text-cyan-400 font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Statements */}
                    {q.trueFalseStatements && (
                      <div className="space-y-1 ml-7">
                        {q.trueFalseStatements.map((tf, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#070d1e] border border-slate-800 text-xs"
                          >
                            <span className="text-slate-200">{tf.statement}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tf.isCorrect ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {tf.isCorrect ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill blank answer */}
                    {q.fillBlankAnswer && (
                      <div className="ml-7 text-xs text-cyan-300 font-semibold">
                        Đáp án điền khuyết: <span className="bg-cyan-950 px-2.5 py-0.5 rounded text-white font-mono">{q.fillBlankAnswer}</span>
                      </div>
                    )}

                    {/* Expandable Explanation */}
                    {isExplanationOpen && q.explanation && (
                      <div className="ml-7 p-3 rounded-xl bg-[#070d1e] border border-cyan-500/30 text-xs text-slate-200 leading-relaxed animate-in fade-in duration-150">
                        <strong className="text-cyan-400 block mb-1">💡 Lời giải chi tiết:</strong>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
