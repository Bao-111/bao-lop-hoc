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
  ListPlus,
  FileText,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Layers,
  FileCheck2,
  AlertCircle,
  Settings2,
  Filter,
  Split,
  FileCode,
  FileUp,
  BrainCircuit,
  Wand2,
  CheckCheck,
  RefreshCw,
  FolderDown,
  Paperclip,
  FileQuestion,
  Info
} from 'lucide-react';
import { soundManager } from '../../../services/audio';

// Sample lesson plans for quick 1-click AI generation
const SAMPLE_LESSONS = [
  {
    id: 'lesson-toan9-canbac2',
    subject: 'Toán học',
    grade: 'Khối 9',
    title: 'Đại số 9 - Bài 2: Căn thức bậc hai và hằng đẳng thức √(A²) = |A|',
    summary: 'Điều kiện xác định của biểu thức căn bậc hai √(A) là A ≥ 0. Hằng đẳng thức √(A²) = |A|. Rút gọn biểu thức và giải phương trình chứa căn.',
    fileName: 'Giao_an_Toan_9_Bai_2_Can_thuc_bac_hai.docx'
  },
  {
    id: 'lesson-khtn8-apsuat',
    subject: 'Vật lý',
    grade: 'Khối 8',
    title: 'KHTN 8 - Bài 14: Khối lượng riêng và Áp suất chất lỏng',
    summary: 'Công thức khối lượng riêng D = m / V. Áp suất chất lỏng p = d · h. Bình thông nhau và ứng dụng trong thực tế đời sống.',
    fileName: 'Giao_an_KHTN_8_Khoi_luong_rieng_Ap_suat.docx'
  },
  {
    id: 'lesson-van9-nguongbich',
    subject: 'Ngữ văn',
    grade: 'Khối 9',
    title: 'Ngữ văn 9 - Đoạn trích: Kiều ở lầu Ngưng Bích (Nguyễn Du)',
    summary: 'Nỗi lòng cô đơn, bẽ bàng và thân phận lưu lạc của Thúy Kiều. Tấm lòng hiếu thảo với cha mẹ và tình cảm thủy chung với Kim Trọng. Nghệ thuật tả cảnh ngụ tình.',
    fileName: 'Giao_an_Ngu_van_9_Kieu_o_lau_Ngung_Bich.docx'
  },
  {
    id: 'lesson-anh9-community',
    subject: 'Tiếng Anh',
    grade: 'Khối 9',
    title: 'English 9 - Unit 1: Local Community & Phrasal Verbs',
    summary: 'Vocabulary related to community helpers and local artisans. Phrasal verbs: pass down, live on, deal with, close down. Pronunciation of vowels and stress.',
    fileName: 'Lesson_Plan_English_9_Unit_1_Community.docx'
  },
  {
    id: 'lesson-hoa8-baotoan',
    subject: 'Hóa học',
    grade: 'Khối 8',
    title: 'Hóa học 8 - Bài 12: Định luật bảo toàn khối lượng',
    summary: 'Trong một phản ứng hóa học, tổng khối lượng của các chất sản phẩm bằng tổng khối lượng của các chất phản ứng: m_A + m_B = m_C + m_D. Lập phương trình hóa học.',
    fileName: 'Giao_an_Hoa_hoc_8_Bao_toan_khoi_luong.docx'
  }
];

export const QuizzesPage: React.FC = () => {
  const { activeClass, quizzes, updateQuiz, createQuiz, setActiveTab, showToast } = useApp();

  // Primary active quiz bank
  const currentBankQuiz = quizzes[0] || null;
  const allQuestions: QuizQuestion[] = useMemo(() => {
    return currentBankQuiz?.questions || [];
  }, [currentBankQuiz]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  // Multi-selection states
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  // -------------------------------------------------------------
  // MODAL 1: THÊM / SỬA TỪNG CÂU HỎI (HỖ TRỢ NHIỀU DẠNG CÂU HỎI)
  // -------------------------------------------------------------
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const [formData, setFormData] = useState<Omit<QuizQuestion, 'id'>>({
    code: 'CH-001',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    correctIndices: [0],
    trueFalseStatements: [
      { id: 'tf-1', statement: '', isCorrect: true },
      { id: 'tf-2', statement: '', isCorrect: false },
      { id: 'tf-3', statement: '', isCorrect: true },
      { id: 'tf-4', statement: '', isCorrect: false }
    ],
    fillBlankAnswer: '',
    matchingPairs: [
      { id: 'm-1', left: '', right: '' },
      { id: 'm-2', left: '', right: '' }
    ],
    shortAnswerGuide: '',
    explanation: '',
    subject: 'Toán học',
    grade: 'Khối 9',
    level: 'Thông hiểu',
    questionType: '1 Đáp án',
    points: 1
  });

  // -------------------------------------------------------------
  // MODAL 2: IMPORT NHIỀU CÂU HỎI CÙNG 1 LÚC (EXCEL, WORD, TEXT)
  // -------------------------------------------------------------
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [importRawText, setImportRawText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [parsedImportQuestions, setParsedImportQuestions] = useState<QuizQuestion[]>([]);
  const [selectedImportIndices, setSelectedImportIndices] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // MODAL 3: AI TẠO ĐỀ TỪ GIÁO ÁN / TÀI LIỆU (THE WORKFLOW REQUESTED)
  // -------------------------------------------------------------
  const [isAiLessonModalOpen, setIsAiLessonModalOpen] = useState(false);
  const [aiUploadedFileName, setAiUploadedFileName] = useState('');
  const [aiLessonText, setAiLessonText] = useState('');
  const [aiSubject, setAiSubject] = useState('Toán học');
  const [aiGrade, setAiGrade] = useState('Khối 9');
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiDesiredType, setAiDesiredType] = useState<string>('mixed'); // 'mixed' or specific
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState(1);
  const [aiProposedQuestions, setAiProposedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAiQuestionIds, setSelectedAiQuestionIds] = useState<string[]>([]);
  const [editingAiQuestionIndex, setEditingAiQuestionIndex] = useState<number | null>(null);
  const aiDocInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // INTERACTIVE PROJECTOR TEST RUNNER (Phục vụ chiếu lớp học)
  // -------------------------------------------------------------
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedTestOption, setSelectedTestOption] = useState<number | null>(null);
  const [isTestAnswerSubmitted, setIsTestAnswerSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // -------------------------------------------------------------
  // FILTERED QUESTIONS
  // -------------------------------------------------------------
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchText = q.question.toLowerCase().includes(query);
        const matchCode = q.code?.toLowerCase().includes(query);
        const matchSubject = q.subject?.toLowerCase().includes(query);
        const matchOptions = q.options?.some(opt => opt.toLowerCase().includes(query));
        const matchTF = q.trueFalseStatements?.some(tf => tf.statement.toLowerCase().includes(query));
        if (!matchText && !matchCode && !matchSubject && !matchOptions && !matchTF) return false;
      }

      // Subject
      if (filterSubject !== 'all' && q.subject !== filterSubject) return false;

      // Grade
      if (filterGrade !== 'all' && q.grade !== filterGrade) return false;

      // Question Type
      if (filterType !== 'all' && q.questionType !== filterType) return false;

      // Level
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

    // Counts by type
    const single = allQuestions.filter(q => q.questionType === '1 Đáp án').length;
    const multi = allQuestions.filter(q => q.questionType === 'Nhiều đáp án').length;
    const tf = allQuestions.filter(q => q.questionType === 'Đúng / Sai').length;
    const blank = allQuestions.filter(q => q.questionType === 'Điền khuyết').length;
    const match = allQuestions.filter(q => q.questionType === 'Ghép nối').length;
    const essay = allQuestions.filter(q => q.questionType === 'Tự luận ngắn').length;

    return { total, nhanBiet, thongHieu, vanDung, vanDungCao, single, multi, tf, blank, match, essay };
  }, [allQuestions]);

  // Toggle multi-select
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleExplanation = (id: string) => {
    setExpandedExplanationIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // -------------------------------------------------------------
  // HANDLERS: MODAL 1 - THÊM / SỬA TỪNG CÂU HỎI
  // -------------------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    const nextNum = allQuestions.length + 1;
    setFormData({
      code: `CH-${String(nextNum).padStart(3, '0')}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      correctIndices: [0],
      trueFalseStatements: [
        { id: 'tf-1', statement: '', isCorrect: true },
        { id: 'tf-2', statement: '', isCorrect: false },
        { id: 'tf-3', statement: '', isCorrect: true },
        { id: 'tf-4', statement: '', isCorrect: false }
      ],
      fillBlankAnswer: '',
      matchingPairs: [
        { id: 'm-1', left: '', right: '' },
        { id: 'm-2', left: '', right: '' }
      ],
      shortAnswerGuide: '',
      explanation: '',
      subject: activeClass?.subject || 'Toán học',
      grade: `Khối ${activeClass?.grade || 9}`,
      level: 'Thông hiểu',
      questionType: '1 Đáp án',
      points: 1
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormData({
      code: q.code || '',
      question: q.question,
      options: q.options && q.options.length > 0 ? [...q.options] : ['', '', '', ''],
      correctIndex: q.correctIndex ?? 0,
      correctIndices: q.correctIndices ? [...q.correctIndices] : [q.correctIndex ?? 0],
      trueFalseStatements: q.trueFalseStatements && q.trueFalseStatements.length > 0
        ? [...q.trueFalseStatements]
        : [
            { id: 'tf-1', statement: '', isCorrect: true },
            { id: 'tf-2', statement: '', isCorrect: false },
            { id: 'tf-3', statement: '', isCorrect: true },
            { id: 'tf-4', statement: '', isCorrect: false }
          ],
      fillBlankAnswer: q.fillBlankAnswer || '',
      matchingPairs: q.matchingPairs && q.matchingPairs.length > 0
        ? [...q.matchingPairs]
        : [
            { id: 'm-1', left: '', right: '' },
            { id: 'm-2', left: '', right: '' }
          ],
      shortAnswerGuide: q.shortAnswerGuide || '',
      explanation: q.explanation || '',
      subject: q.subject || 'Toán học',
      grade: q.grade || 'Khối 9',
      level: q.level || 'Thông hiểu',
      questionType: q.questionType || '1 Đáp án',
      points: q.points || 1
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi', 'warning');
      return;
    }

    // Type-specific validations
    if (formData.questionType === '1 Đáp án') {
      if (formData.options.some(opt => !opt.trim())) {
        showToast('Vui lòng điền đầy đủ các phương án lựa chọn', 'warning');
        return;
      }
    } else if (formData.questionType === 'Nhiều đáp án') {
      if (formData.options.some(opt => !opt.trim())) {
        showToast('Vui lòng điền đầy đủ các phương án', 'warning');
        return;
      }
      if (!formData.correctIndices || formData.correctIndices.length === 0) {
        showToast('Vui lòng chọn ít nhất 1 đáp án đúng', 'warning');
        return;
      }
    } else if (formData.questionType === 'Đúng / Sai') {
      if (!formData.trueFalseStatements || formData.trueFalseStatements.some(s => !s.statement.trim())) {
        showToast('Vui lòng điền đầy đủ 4 mệnh đề a, b, c, d', 'warning');
        return;
      }
    } else if (formData.questionType === 'Điền khuyết') {
      if (!formData.fillBlankAnswer?.trim()) {
        showToast('Vui lòng nhập đáp án cần điền vào chỗ trống', 'warning');
        return;
      }
    } else if (formData.questionType === 'Ghép nối') {
      if (!formData.matchingPairs || formData.matchingPairs.some(p => !p.left.trim() || !p.right.trim())) {
        showToast('Vui lòng điền đầy đủ cả 2 vế ghép nối', 'warning');
        return;
      }
    }

    if (!currentBankQuiz) {
      createQuiz({
        classId: activeClass?.id || 'class-default',
        title: 'Ngân hàng câu hỏi chuẩn kiến thức THCS',
        subject: formData.subject || 'Toán học',
        durationMinutes: 45,
        questions: [{ ...formData, id: `q-${Date.now()}` }]
      });
      setIsAddEditModalOpen(false);
      showToast('Đã thêm câu hỏi vào ngân hàng', 'success');
      return;
    }

    let updatedQuestions: QuizQuestion[];
    if (editingQuestion) {
      updatedQuestions = currentBankQuiz.questions.map(q =>
        q.id === editingQuestion.id ? { ...formData, id: q.id } : q
      );
      showToast('Đã cập nhật câu hỏi thành công', 'success');
    } else {
      const newQuestion: QuizQuestion = {
        ...formData,
        id: `q-${Date.now()}`
      };
      updatedQuestions = [newQuestion, ...currentBankQuiz.questions];
      showToast('Đã thêm câu hỏi mới vào ngân hàng thành công', 'success');
    }

    updateQuiz(currentBankQuiz.id, { questions: updatedQuestions });
    setIsAddEditModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!currentBankQuiz) return;
    const target = allQuestions.find(q => q.id === id);
    if (!confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${target?.code || target?.question.slice(0, 30)}..."?`)) return;

    const updated = allQuestions.filter(q => q.id !== id);
    updateQuiz(currentBankQuiz.id, { questions: updated });
    setSelectedQuestionIds(prev => prev.filter(item => item !== id));
    showToast('Đã xóa câu hỏi khỏi ngân hàng', 'info');
  };

  const handleDeleteSelected = () => {
    if (!currentBankQuiz || selectedQuestionIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedQuestionIds.length} câu hỏi đã chọn?`)) return;

    const updated = allQuestions.filter(q => !selectedQuestionIds.includes(q.id));
    updateQuiz(currentBankQuiz.id, { questions: updated });
    setSelectedQuestionIds([]);
    showToast(`Đã xóa ${selectedQuestionIds.length} câu hỏi`, 'info');
  };

  // -------------------------------------------------------------
  // HANDLERS: MODAL 2 - IMPORT NHIỀU CÂU HỎI (EXCEL, WORD, TEXT)
  // -------------------------------------------------------------
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Mã câu': 'TOAN9-001',
        'Nội dung câu hỏi': 'Điều kiện xác định của biểu thức √(3x - 9) là gì?',
        'Dạng câu hỏi': '1 Đáp án',
        'Phương án A': 'x ≥ 3',
        'Phương án B': 'x > 3',
        'Phương án C': 'x ≤ 3',
        'Phương án D': 'x < 3',
        'Đáp án đúng': 'A',
        'Mức độ': 'Nhận biết',
        'Môn học': 'Toán học',
        'Khối lớp': 'Khối 9',
        'Điểm số': 1,
        'Lời giải chi tiết': 'Biểu thức căn thức xác định khi 3x - 9 ≥ 0 <=> x ≥ 3. Do đó chọn A.'
      },
      {
        'Mã câu': 'KHTN8-002',
        'Nội dung câu hỏi': 'Trong các hiện tượng sau, hiện tượng nào là hiện tượng hóa học? (Chọn tất cả đáp án đúng)',
        'Dạng câu hỏi': 'Nhiều đáp án',
        'Phương án A': 'Sắt để lâu trong không khí ẩm bị gỉ sét',
        'Phương án B': 'Đun sôi nước bốc hơi',
        'Phương án C': 'Đốt cháy than củi sinh ra khí CO2',
        'Phương án D': 'Hòa tan đường vào nước',
        'Đáp án đúng': 'A, C',
        'Mức độ': 'Thông hiểu',
        'Môn học': 'Vật lý',
        'Khối lớp': 'Khối 8',
        'Điểm số': 1.5,
        'Lời giải chi tiết': 'A và C có chất mới tạo thành nên là hiện tượng hóa học.'
      },
      {
        'Mã câu': 'TOAN9-003',
        'Nội dung câu hỏi': 'Tam giác vuông ABC tại A có BH = 4cm, CH = 9cm. Độ dài đường cao AH bằng ... cm.',
        'Dạng câu hỏi': 'Điền khuyết',
        'Phương án A': '',
        'Phương án B': '',
        'Phương án C': '',
        'Phương án D': '',
        'Đáp án đúng': '6',
        'Mức độ': 'Vận dụng',
        'Môn học': 'Toán học',
        'Khối lớp': 'Khối 9',
        'Điểm số': 1,
        'Lời giải chi tiết': 'AH^2 = BH * CH = 36 => AH = 6cm.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoi_Mau');
    XLSX.writeFile(workbook, 'Mau_Import_Ngan_Hang_Cau_Hoi_THCS.xlsx');
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
            const rawType: string = r['Dạng câu hỏi'] || r['Dạng'] || '1 Đáp án';
            const questionType: QuestionType =
              rawType.includes('Nhiều') ? 'Nhiều đáp án' :
              rawType.includes('Đúng') || rawType.includes('Sai') ? 'Đúng / Sai' :
              rawType.includes('Điền') ? 'Điền khuyết' :
              rawType.includes('Ghép') ? 'Ghép nối' :
              rawType.includes('Tự luận') ? 'Tự luận ngắn' : '1 Đáp án';

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
              subject: r['Môn học'] || activeClass?.subject || 'Toán học',
              grade: r['Khối lớp'] || `Khối ${activeClass?.grade || 9}`,
              level: (r['Mức độ'] || 'Thông hiểu') as QuestionLevel,
              questionType,
              points: Number(r['Điểm số']) || 1,
              explanation: r['Lời giải chi tiết'] || r['Lời giải'] || 'Lời giải theo bài học.'
            };
          });

          setParsedImportQuestions(parsedList);
          setSelectedImportIndices(parsedList.map((_, i) => i));
          showToast(`Đã phân tích thành công ${parsedList.length} câu hỏi từ file Excel!`, 'success');
        } catch (err) {
          showToast('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Text or Docx extraction
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
      showToast('Không có nội dung văn bản để phân tích', 'warning');
      return;
    }

    // Split questions by "Câu 1", "Câu 2", "1.", "2."
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
        subject: activeClass?.subject || 'Toán học',
        grade: `Khối ${activeClass?.grade || 9}`,
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: explLine || 'Lời giải chi tiết theo chuẩn kiến thức.',
        sourceDoc: sourceName || 'Văn bản import'
      };
    });

    setParsedImportQuestions(parsed);
    setSelectedImportIndices(parsed.map((_, i) => i));
    showToast(`Đã nhận diện ${parsed.length} câu hỏi hợp lệ!`, 'success');
  };

  const handleFillSamplePasteText = () => {
    const sample = `Câu 1: Điều kiện xác định của biểu thức căn bậc hai √(2x - 6) là gì?
A. x ≥ 3
B. x > 3
C. x ≤ 3
D. x < 3
Đáp án: A
Lời giải: 2x - 6 ≥ 0 <=> 2x ≥ 6 <=> x ≥ 3.

Câu 2: Rút gọn biểu thức √(9a²) với a < 0 ta được kết quả là:
A. 3a
B. -3a
C. 9a
D. -9a
Đáp án: B
Lời giải: √(9a²) = |3a| = -3a (do a < 0).

Câu 3: Phương trình bậc nhất hai ẩn 2x - y = 3 có nghiệm nguyên dương nhỏ nhất là:
A. (1; -1)
B. (2; 1)
C. (3; 3)
D. (0; -3)
Đáp án: B
Lời giải: Thử x = 2, y = 1 ta có 2*2 - 1 = 3 (thỏa mãn cả 2 số đều nguyên dương).`;

    setImportRawText(sample);
  };

  const handleConfirmBatchImport = () => {
    if (!currentBankQuiz || selectedImportIndices.length === 0) return;
    const toImport = parsedImportQuestions.filter((_, idx) => selectedImportIndices.includes(idx));

    updateQuiz(currentBankQuiz.id, {
      questions: [...toImport, ...currentBankQuiz.questions]
    });

    showToast(`Đã nhập thành công ${toImport.length} câu hỏi vào ngân hàng!`, 'success');
    soundManager.playCorrect();
    setIsImportModalOpen(false);
    setParsedImportQuestions([]);
    setSelectedImportIndices([]);
    setImportRawText('');
    setImportFileName('');
  };

  // -------------------------------------------------------------
  // HANDLERS: MODAL 3 - AI TẠO ĐỀ TỪ GIÁO ÁN / TÀI LIỆU (THE REQUESTED WORKFLOW)
  // -------------------------------------------------------------
  const handleOpenAiLessonModal = () => {
    setIsAiLessonModalOpen(true);
    setAiProposedQuestions([]);
    setSelectedAiQuestionIds([]);
    setIsAiScanning(false);
    setAiScanStep(1);
  };

  const handleSelectSampleLesson = (lesson: typeof SAMPLE_LESSONS[0]) => {
    setAiSubject(lesson.subject);
    setAiGrade(lesson.grade);
    setAiLessonText(`${lesson.title}\n\nTóm tắt nội dung trọng tâm bài học:\n${lesson.summary}`);
    setAiUploadedFileName(lesson.fileName);
    showToast(`Đã nạp tài liệu: ${lesson.title}`, 'info');
  };

  const handleAiDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiUploadedFileName(file.name);
    // Detect subject from file name or active class
    if (/toan|dai|hinh/i.test(file.name)) setAiSubject('Toán học');
    else if (/ly|vatly|khtn/i.test(file.name)) setAiSubject('Vật lý');
    else if (/hoa/i.test(file.name)) setAiSubject('Hóa học');
    else if (/anh|english/i.test(file.name)) setAiSubject('Tiếng Anh');
    else if (/van|vanhoc/i.test(file.name)) setAiSubject('Ngữ văn');

    const reader = new FileReader();
    reader.onload = evt => {
      const content = String(evt.target?.result || '');
      setAiLessonText(content || `Tài liệu: ${file.name}\n(Dung lượng: ${(file.size / 1024).toFixed(1)} KB)`);
      showToast(`Đã tải lên tệp: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  };

  // AI Generation Simulation with High-Fidelity Pedagogical Matrix
  const handleStartAiScanAndGenerate = () => {
    if (!aiLessonText.trim()) {
      showToast('Vui lòng tải lên tài liệu giáo án hoặc chọn bài học mẫu', 'warning');
      return;
    }

    setIsAiScanning(true);
    setAiScanStep(1);

    // Simulate scanning stages
    setTimeout(() => setAiScanStep(2), 500);
    setTimeout(() => setAiScanStep(3), 1100);
    setTimeout(() => {
      setIsAiScanning(false);

      // Generate structured questions tailored to the lesson
      const generated: QuizQuestion[] = [];
      const codePrefix = aiSubject === 'Toán học' ? 'TOAN' :
                         aiSubject === 'Vật lý' ? 'LY' :
                         aiSubject === 'Hóa học' ? 'HOA' :
                         aiSubject === 'Tiếng Anh' ? 'ANH' : 'VAN';
      const gradeNum = aiGrade.replace(/\D/g, '') || '9';

      // Q1: Single choice (Nhận biết)
      generated.push({
        id: `q-ai-${Date.now()}-1`,
        code: `${codePrefix}${gradeNum}-AI01`,
        question: `[AI Đề xuất từ giáo án] Dựa trên nội dung bài học "${aiUploadedFileName || aiSubject}", phát biểu nào sau đây nêu ĐÚNG định nghĩa hoặc công thức cơ bản?`,
        options: [
          'A. Điều kiện cần và đủ để biểu thức có nghĩa là đại lượng dưới dấu căn không âm (A ≥ 0)',
          'B. Biểu thức luôn luôn xác định với mọi giá trị thực của biến số trong trường số thực R',
          'C. Chỉ xác định khi biến số là một số nguyên dương lẻ lớn hơn 0',
          'D. Biểu thức không xác định tại điểm x = 0 trong tất cả các trường hợp'
        ],
        correctIndex: 0,
        subject: aiSubject,
        grade: aiGrade,
        level: 'Nhận biết',
        questionType: '1 Đáp án',
        points: 1,
        sourceDoc: aiUploadedFileName || 'Giáo án bài học',
        explanation: 'Khẳng định A hoàn toàn chính xác theo định nghĩa chuẩn SGK của bài học.'
      });

      // Q2: True / False 4 items (Thông hiểu - Cấu trúc đề mới)
      generated.push({
        id: `q-ai-${Date.now()}-2`,
        code: `${codePrefix}${gradeNum}-AI02`,
        question: `[AI Đề xuất - Cấu trúc mới Bộ GD&ĐT] Xét tính Đúng / Sai của các mệnh đề sau đây theo kiến thức bài học:`,
        options: [],
        correctIndex: 0,
        subject: aiSubject,
        grade: aiGrade,
        level: 'Thông hiểu',
        questionType: 'Đúng / Sai',
        points: 2,
        sourceDoc: aiUploadedFileName || 'Giáo án bài học',
        trueFalseStatements: [
          { id: 'tf-ai-1', statement: 'Mệnh đề a) Công thức hoặc định lý nêu trong bài học luôn có giá trị không âm', isCorrect: true },
          { id: 'tf-ai-2', statement: 'Mệnh đề b) Khi biến số nhận giá trị âm thì biểu thức vẫn luôn có nghĩa', isCorrect: false },
          { id: 'tf-ai-3', statement: 'Mệnh đề c) Áp dụng hằng đẳng thức thu gọn được kết quả là một số hữu tỉ dương', isCorrect: true },
          { id: 'tf-ai-4', statement: 'Mệnh đề d) Kết quả tính toán không phụ thuộc vào điều kiện xác định ban đầu', isCorrect: false }
        ],
        explanation: 'Lời giải chi tiết: Mệnh đề a và c đúng theo lý thuyết; mệnh đề b và d vi phạm điều kiện ràng buộc của bài học.'
      });

      // Q3: Fill in the blank (Vận dụng)
      generated.push({
        id: `q-ai-${Date.now()}-3`,
        code: `${codePrefix}${gradeNum}-AI03`,
        question: `[AI Đề xuất] Áp dụng các quy tắc biến đổi trong bài giảng, kết quả rút gọn biểu thức P tại x = 4 bằng ...`,
        options: [],
        correctIndex: 0,
        fillBlankAnswer: '12',
        subject: aiSubject,
        grade: aiGrade,
        level: 'Vận dụng',
        questionType: 'Điền khuyết',
        points: 1,
        sourceDoc: aiUploadedFileName || 'Giáo án bài học',
        explanation: 'Thay x = 4 vào biểu thức rút gọn, ta tính được giá trị bằng 12.'
      });

      // Q4: Multiple choice (Thông hiểu)
      if (aiCount >= 4) {
        generated.push({
          id: `q-ai-${Date.now()}-4`,
          code: `${codePrefix}${gradeNum}-AI04`,
          question: `[AI Đề xuất - Nhiều đáp án] Những tính chất và ứng dụng thực tế nào sau đây thuộc phạm vi bài học? (Chọn tất cả đáp án đúng)`,
          options: [
            'A. Có tính chất đối xứng và liên tục trên tập xác định',
            'B. Ứng dụng để giải quyết các bài toán cực trị trong thực tế',
            'C. Chỉ áp dụng được cho các số tự nhiên có 1 chữ số',
            'D. Là nền tảng để học tiếp các chủ đề nâng cao ở học kỳ II'
          ],
          correctIndex: 0,
          correctIndices: [0, 1, 3],
          subject: aiSubject,
          grade: aiGrade,
          level: 'Thông hiểu',
          questionType: 'Nhiều đáp án',
          points: 1.5,
          sourceDoc: aiUploadedFileName || 'Giáo án bài học',
          explanation: 'Các phương án A, B, D đều là các tính chất và ứng dụng trọng tâm của bài học.'
        });
      }

      // Q5: Short answer with rubric (Vận dụng cao)
      if (aiCount >= 5) {
        generated.push({
          id: `q-ai-${Date.now()}-5`,
          code: `${codePrefix}${gradeNum}-AI05`,
          question: `[AI Đề xuất - Vận dụng cao] Hãy trình bày tóm tắt phương pháp và tìm giá trị lớn nhất của đại lượng nêu trong bài toán ứng dụng thực tế.`,
          options: [],
          correctIndex: 0,
          subject: aiSubject,
          grade: aiGrade,
          level: 'Vận dụng cao',
          questionType: 'Tự luận ngắn',
          points: 2,
          shortAnswerGuide: '1. Đặt ẩn phụ và xác định tập xác định (0.5đ)\n2. Biến đổi về dạng bình phương cộng hằng số (1.0đ)\n3. Kết luận Max = 25 khi x = 3 (0.5đ)',
          sourceDoc: aiUploadedFileName || 'Giáo án bài học',
          explanation: 'Biểu điểm chấm phân hóa học sinh khá giỏi: Cần kiểm tra dấu bằng xảy ra.'
        });
      }

      setAiProposedQuestions(generated);
      setSelectedAiQuestionIds(generated.map(q => q.id));
      showToast(`AI đã đề xuất ${generated.length} câu hỏi chuẩn từ giáo án. Vui lòng duyệt trước khi lưu!`, 'success');
      soundManager.playCorrect();
    }, 1800);
  };

  // Toggle selection in AI review screen
  const handleToggleSelectAiQuestion = (id: string) => {
    setSelectedAiQuestionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAiQuestions = () => {
    if (selectedAiQuestionIds.length === aiProposedQuestions.length) {
      setSelectedAiQuestionIds([]);
    } else {
      setSelectedAiQuestionIds(aiProposedQuestions.map(q => q.id));
    }
  };

  const handleDeleteAiQuestion = (id: string) => {
    setAiProposedQuestions(prev => prev.filter(q => q.id !== id));
    setSelectedAiQuestionIds(prev => prev.filter(item => item !== id));
  };

  // Save approved questions into bank
  const handleSaveApprovedAiQuestions = () => {
    if (!currentBankQuiz) return;
    const approved = aiProposedQuestions.filter(q => selectedAiQuestionIds.includes(q.id));

    if (approved.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 câu hỏi để duyệt và lưu vào ngân hàng', 'warning');
      return;
    }

    updateQuiz(currentBankQuiz.id, {
      questions: [...approved, ...currentBankQuiz.questions]
    });

    showToast(`Đã duyệt và lưu thành công ${approved.length} câu hỏi vào ngân hàng!`, 'success');
    soundManager.playFanfare();
    setIsAiLessonModalOpen(false);
    setAiProposedQuestions([]);
    setSelectedAiQuestionIds([]);
  };

  // Export questions to JSON
  const handleExportFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allQuestions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `Ngan_Hang_Cau_Hoi_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    showToast(`Đã xuất ${allQuestions.length} câu hỏi ra file thành công`, 'success');
  };

  // Interactive Quiz Test Controls
  const handleStartTestingMode = () => {
    if (filteredQuestions.length === 0) {
      showToast('Không có câu hỏi nào để bắt đầu bài thi', 'warning');
      return;
    }
    setIsTestingMode(true);
    setCurrentTestIndex(0);
    setSelectedTestOption(null);
    setIsTestAnswerSubmitted(false);
    setTestScore(0);
  };

  const handleSelectTestAnswer = () => {
    if (selectedTestOption === null) return;
    setIsTestAnswerSubmitted(true);
    const isCorrect = selectedTestOption === filteredQuestions[currentTestIndex]?.correctIndex;
    if (isCorrect) {
      setTestScore(prev => prev + 1);
      soundManager.playCorrect();
    } else {
      soundManager.playTick();
    }
  };

  const handleNextTestQuestion = () => {
    if (currentTestIndex < filteredQuestions.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
      setSelectedTestOption(null);
      setIsTestAnswerSubmitted(false);
    } else {
      soundManager.playFanfare();
      showToast(`Hoàn thành bài kiểm tra! Điểm số: ${testScore + (selectedTestOption === filteredQuestions[currentTestIndex]?.correctIndex ? 1 : 0)}/${filteredQuestions.length}`, 'success');
      setIsTestingMode(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER CARD: CHUẨN XÁC THEO HÌNH ẢNH 2 (NGẮN GỌN & NĂM 2026) */}
      <div className="bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Tiêu đề chuẩn hình 2 */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-cyan-300 hover:text-white bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer shrink-0 border border-cyan-500/30 mt-1 sm:mt-0"
            title="Quay về Bàn làm việc"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                <span className="text-cyan-400">Ngân Hàng Câu</span>
                <br className="sm:hidden" />
                <span className="text-white sm:ml-2">Hỏi Thông Minh</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-950 text-purple-300 border border-purple-500/50 shadow-xs">
                Chuẩn GDPT 2026
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Đa dạng câu hỏi • Tạo tự động từ giáo án bằng AI • Import & Xuất file
            </p>
          </div>
        </div>

        {/* Right: Các nút hành động ngắn gọn, trực quan */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Nút 1: AI Tạo đề */}
          <button
            type="button"
            onClick={handleOpenAiLessonModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 border border-purple-400/50 shadow-lg shadow-purple-950/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="AI Tạo đề tự động từ giáo án"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Tạo Đề</span>
          </button>

          {/* Nút 2: Import */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-200 bg-[#07281e] hover:bg-[#0c3d2e] border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-md"
            title="Import câu hỏi từ Excel/Word/Text"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import</span>
          </button>

          {/* Nút 3: Thêm câu hỏi */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Thêm Câu Hỏi</span>
          </button>

          {/* Nút 4: Xuất file */}
          <button
            type="button"
            onClick={handleExportFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-200 bg-[#29200a] hover:bg-[#3d300f] border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-md"
            title="Xuất file ngân hàng câu hỏi"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất File</span>
          </button>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC ĐA DẠNG CÂU HỎI */}
      <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo từ khóa, mã câu, nội dung..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Lọc Dạng câu hỏi */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Dạng câu:</span>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-cyan-300 font-bold focus:outline-none"
            >
              <option value="all">Tất cả dạng ({stats.total})</option>
              <option value="1 Đáp án">1 Đáp án ({stats.single})</option>
              <option value="Nhiều đáp án">Nhiều đáp án ({stats.multi})</option>
              <option value="Đúng / Sai">Đúng / Sai ({stats.tf})</option>
              <option value="Điền khuyết">Điền khuyết ({stats.blank})</option>
              <option value="Ghép nối">Ghép nối ({stats.match})</option>
              <option value="Tự luận ngắn">Tự luận ngắn ({stats.essay})</option>
            </select>
          </div>

          {/* Lọc Mức độ */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Mức độ:</span>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="Nhận biết">Nhận biết ({stats.nhanBiet})</option>
              <option value="Thông hiểu">Thông hiểu ({stats.thongHieu})</option>
              <option value="Vận dụng">Vận dụng ({stats.vanDung})</option>
              <option value="Vận dụng cao">Vận dụng cao ({stats.vanDungCao})</option>
            </select>
          </div>

          {/* Lọc Môn học */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Môn:</span>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">Tất cả môn</option>
              <option value="Toán học">Toán học</option>
              <option value="Vật lý">Vật lý / KHTN</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Ngữ văn">Ngữ văn</option>
            </select>
          </div>

          {/* Nút chạy thi thử trên máy chiếu */}
          <button
            type="button"
            onClick={handleStartTestingMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 bg-[#291b05] hover:bg-[#3d2907] border border-amber-500/40 transition-colors cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Trình chiếu lớp</span>
          </button>
        </div>

        {/* Thanh trạng thái nhanh & chọn hàng loạt */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-cyan-500/15 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-cyan-300 hover:text-white font-bold cursor-pointer"
            >
              {selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Chọn tất cả ({selectedQuestionIds.length}/{filteredQuestions.length})</span>
            </button>

            {selectedQuestionIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Xóa {selectedQuestionIds.length} câu đã chọn</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>Hiển thị: <strong className="text-white">{filteredQuestions.length}</strong> / {allQuestions.length} câu hỏi</span>
          </div>
        </div>
      </div>

      {/* 3. TRÌNH CHIẾU BÀI THI CHO LỚP HỌC (NẾU ĐANG BẬT) */}
      {isTestingMode && filteredQuestions[currentTestIndex] && (
        <div className="bg-[#0b1329] border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-black text-amber-300">
                CHẾ ĐỘ TRẢI NGHIỆM LỚP HỌC: CÂU {currentTestIndex + 1}/{filteredQuestions.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTestingMode(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 bg-slate-800 rounded-lg"
            >
              Thoát (ESC)
            </button>
          </div>

          <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {filteredQuestions[currentTestIndex].question}
          </div>

          {/* Options */}
          {filteredQuestions[currentTestIndex].options && filteredQuestions[currentTestIndex].options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {filteredQuestions[currentTestIndex].options.map((opt, oIdx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isSelected = selectedTestOption === oIdx;
                const isCorrect = oIdx === filteredQuestions[currentTestIndex].correctIndex;
                const showSuccess = isTestAnswerSubmitted && isCorrect;
                const showWrong = isTestAnswerSubmitted && isSelected && !isCorrect;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isTestAnswerSubmitted}
                    onClick={() => setSelectedTestOption(oIdx)}
                    className={`p-3.5 rounded-xl border text-left text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
                      showSuccess ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400' :
                      showWrong ? 'bg-rose-950/80 border-rose-400 text-rose-200' :
                      isSelected ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400' :
                      'bg-[#070d1e] border-cyan-500/20 text-slate-200 hover:border-cyan-400'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-black flex items-center justify-center shrink-0">
                      {letters[oIdx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
            {!isTestAnswerSubmitted ? (
              <button
                type="button"
                disabled={selectedTestOption === null}
                onClick={handleSelectTestAnswer}
                className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer disabled:opacity-40"
              >
                Kiểm Tra Đáp Án
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextTestQuestion}
                className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl cursor-pointer"
              >
                {currentTestIndex < filteredQuestions.length - 1 ? 'Câu Tiếp Theo →' : 'Xem Điểm Tổng Kết'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. DANH SÁCH CÂU HỎI TRONG NGÂN HÀNG (HỖ TRỢ ĐA DẠNG CÁC ĐỊNH DẠNG CÂU HỎI) */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-[#0b1329] p-8 rounded-2xl border border-cyan-500/20 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Không tìm thấy câu hỏi phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Thử thay đổi bộ lọc hoặc thêm câu hỏi mới, import từ Excel/Word hoặc dùng AI để tạo bộ câu hỏi tự động.
          </p>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleOpenAiLessonModal}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl cursor-pointer"
            >
              Sinh câu hỏi bằng AI
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl cursor-pointer"
            >
              + Thêm câu hỏi
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.includes(q.id);
            const isExpanded = expandedExplanationIds[q.id];

            return (
              <div
                key={q.id}
                className={`bg-[#0b1329] rounded-2xl border transition-all p-4 space-y-3 ${
                  isSelected
                    ? 'border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-950/40'
                    : 'border-cyan-500/25 hover:border-cyan-400/50'
                }`}
              >
                {/* Header dòng câu hỏi */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectQuestion(q.id)}
                      className="text-cyan-400 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                      {q.code || `CH-${String(idx + 1).padStart(3, '0')}`}
                    </span>

                    {/* Badge Dạng câu hỏi */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      q.questionType === 'Đúng / Sai' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                      q.questionType === 'Nhiều đáp án' ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' :
                      q.questionType === 'Điền khuyết' ? 'bg-teal-950/80 text-teal-300 border-teal-500/40' :
                      q.questionType === 'Ghép nối' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40' :
                      q.questionType === 'Tự luận ngắn' ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' :
                      'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {q.questionType || '1 Đáp án'}
                    </span>

                    {/* Badge Mức độ */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      q.level === 'Nhận biết' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                      q.level === 'Thông hiểu' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                      q.level === 'Vận dụng' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}>
                      {q.level || 'Thông hiểu'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {q.subject} • {q.grade} • {q.points || 1} điểm
                    </span>

                    {q.sourceDoc && (
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/30">
                        📄 {q.sourceDoc}
                      </span>
                    )}
                  </div>

                  {/* Hành động sửa / xóa */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Nội dung câu hỏi */}
                <div className="text-sm font-semibold text-white leading-relaxed">
                  {q.question}
                </div>

                {/* HIỂN THỊ PHÙ HỢP TỪNG DẠNG CÂU HỎI */}

                {/* Dạng 1: Trắc nghiệm 1 đáp án */}
                {(!q.questionType || q.questionType === '1 Đáp án') && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const letters = ['A', 'B', 'C', 'D', 'E'];
                      const isCorrect = oIdx === q.correctIndex;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
                            isCorrect
                              ? 'bg-[#06241e] border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                              : 'bg-[#070d1e] border-cyan-500/20 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {letters[oIdx]}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isCorrect && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dạng 2: Trắc nghiệm nhiều đáp án đúng */}
                {q.questionType === 'Nhiều đáp án' && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const letters = ['A', 'B', 'C', 'D', 'E'];
                      const isCorrect = q.correctIndices?.includes(oIdx) || oIdx === q.correctIndex;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                            isCorrect
                              ? 'bg-purple-950/60 border-purple-400 text-purple-200 ring-1 ring-purple-400/40'
                              : 'bg-[#070d1e] border-cyan-500/20 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded text-[11px] font-black flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-purple-500 text-white'
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {letters[oIdx]}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-400/40">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dạng 3: Đúng / Sai (Cấu trúc đề mới Bộ GD&ĐT) */}
                {q.questionType === 'Đúng / Sai' && q.trueFalseStatements && q.trueFalseStatements.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {q.trueFalseStatements.map((item, tfIdx) => {
                      const labels = ['a)', 'b)', 'c)', 'd)'];
                      return (
                        <div
                          key={item.id || tfIdx}
                          className="flex items-center justify-between gap-3 p-2.5 bg-[#070d1e] rounded-xl border border-cyan-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300">{labels[tfIdx] || `${tfIdx + 1}.`}</span>
                            <span className="text-slate-200">{item.statement}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            item.isCorrect
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            {item.isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dạng 4: Điền khuyết */}
                {q.questionType === 'Điền khuyết' && (
                  <div className="p-3 bg-[#070d1e] rounded-xl border border-teal-500/30 flex items-center gap-3 text-xs">
                    <span className="font-bold text-teal-300 shrink-0">Đáp án cần điền:</span>
                    <span className="px-2.5 py-1 bg-teal-950 text-teal-200 border border-teal-500/40 rounded-lg font-mono font-bold">
                      {q.fillBlankAnswer || 'Chưa thiết lập'}
                    </span>
                  </div>
                )}

                {/* Dạng 5: Ghép nối */}
                {q.questionType === 'Ghép nối' && q.matchingPairs && q.matchingPairs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.matchingPairs.map((p, pIdx) => (
                      <div key={p.id || pIdx} className="p-2.5 bg-[#070d1e] rounded-xl border border-indigo-500/30 text-xs flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-200">{p.left}</span>
                        <span className="text-indigo-400 font-bold">↔</span>
                        <span className="font-bold text-indigo-300">{p.right}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dạng 6: Tự luận ngắn */}
                {q.questionType === 'Tự luận ngắn' && q.shortAnswerGuide && (
                  <div className="p-3 bg-[#070d1e] rounded-xl border border-rose-500/30 text-xs text-slate-200 space-y-1">
                    <div className="font-bold text-rose-300">Barem chấm điểm & Gợi ý trả lời:</div>
                    <div className="whitespace-pre-line leading-relaxed text-slate-300">
                      {q.shortAnswerGuide}
                    </div>
                  </div>
                )}

                {/* Lời giải chi tiết accordion */}
                <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleExplanation(q.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ẩn lời giải & hướng dẫn chấm</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem lời giải & hướng dẫn chấm</span>
                      </>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-3 bg-[#070d1e] rounded-xl border border-cyan-500/25 text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-cyan-300">Lời giải chi tiết:</span>{' '}
                    {q.explanation || 'Áp dụng các định nghĩa và công thức chuẩn SGK.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 1: THÊM / SỬA TỪNG CÂU HỎI VÀO HỆ THỐNG
      ------------------------------------------------------------- */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-cyan-500/25 flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>{editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Từng Câu Hỏi Vào Hệ Thống'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Chọn Dạng câu hỏi trước tiên */}
              <div>
                <label className="text-xs font-black text-cyan-300 block mb-1">
                  1. Chọn Dạng câu hỏi (Yêu cầu 3):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['1 Đáp án', 'Nhiều đáp án', 'Đúng / Sai', 'Điền khuyết', 'Ghép nối', 'Tự luận ngắn'] as QuestionType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, questionType: type })}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        formData.questionType === type
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
                          : 'bg-[#070d1e] text-slate-300 border-cyan-500/30 hover:border-cyan-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thuộc tính chung: Mã câu, Môn, Khối, Mức độ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300">Mã câu</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Môn học</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white"
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
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white"
                  >
                    <option value="Khối 6">Khối 6</option>
                    <option value="Khối 7">Khối 7</option>
                    <option value="Khối 8">Khối 8</option>
                    <option value="Khối 9">Khối 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300">Mức độ nhận thức</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value as QuestionLevel })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div>
                <label className="text-[11px] font-bold text-slate-300">Nội dung câu hỏi</label>
                <textarea
                  rows={3}
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Nhập nội dung đề bài..."
                  className="w-full mt-1 p-2.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* FORM THEO TỪNG DẠNG */}

              {/* 1. Dạng 1 Đáp án */}
              {formData.questionType === '1 Đáp án' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Các phương án lựa chọn (Click nút tròn chữ cái để chọn 1 đáp án ĐÚNG):
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((opt, oIdx) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isCorrect = formData.correctIndex === oIdx;
                      return (
                        <div key={oIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, correctIndex: oIdx })}
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900'
                            }`}
                          >
                            {letters[oIdx]}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const newOpts = [...formData.options];
                              newOpts[oIdx] = e.target.value;
                              setFormData({ ...formData, options: newOpts });
                            }}
                            placeholder={`Phương án ${letters[oIdx]}...`}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Dạng Nhiều đáp án */}
              {formData.questionType === 'Nhiều đáp án' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Các phương án (Tích chọn tất cả các đáp án ĐÚNG):
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((opt, oIdx) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isChecked = formData.correctIndices?.includes(oIdx);
                      return (
                        <div key={oIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const current = formData.correctIndices || [];
                              const next = current.includes(oIdx)
                                ? current.filter(i => i !== oIdx)
                                : [...current, oIdx];
                              setFormData({ ...formData, correctIndices: next });
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 cursor-pointer ${
                              isChecked
                                ? 'bg-purple-500 text-white shadow-sm'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {isChecked ? '✓' : letters[oIdx]}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const newOpts = [...formData.options];
                              newOpts[oIdx] = e.target.value;
                              setFormData({ ...formData, options: newOpts });
                            }}
                            placeholder={`Phương án ${letters[oIdx]}...`}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Dạng Đúng / Sai (Bộ GD&ĐT mới) */}
              {formData.questionType === 'Đúng / Sai' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    4 Mệnh đề a, b, c, d (Bấm nút [Đúng] hoặc [Sai] cho từng mệnh đề):
                  </label>
                  <div className="space-y-2">
                    {formData.trueFalseStatements?.map((stmt, sIdx) => {
                      const labels = ['a)', 'b)', 'c)', 'd)'];
                      return (
                        <div key={stmt.id || sIdx} className="flex items-center gap-2">
                          <span className="w-6 font-bold text-xs text-amber-300">{labels[sIdx]}</span>
                          <input
                            type="text"
                            value={stmt.statement}
                            onChange={e => {
                              const next = [...(formData.trueFalseStatements || [])];
                              next[sIdx].statement = e.target.value;
                              setFormData({ ...formData, trueFalseStatements: next });
                            }}
                            placeholder={`Nội dung mệnh đề ${labels[sIdx]}...`}
                            className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(formData.trueFalseStatements || [])];
                              next[sIdx].isCorrect = true;
                              setFormData({ ...formData, trueFalseStatements: next });
                            }}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg cursor-pointer ${
                              stmt.isCorrect
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : 'bg-[#070d1e] text-slate-400 border border-slate-700'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(formData.trueFalseStatements || [])];
                              next[sIdx].isCorrect = false;
                              setFormData({ ...formData, trueFalseStatements: next });
                            }}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg cursor-pointer ${
                              !stmt.isCorrect
                                ? 'bg-rose-500 text-white font-black'
                                : 'bg-[#070d1e] text-slate-400 border border-slate-700'
                            }`}
                          >
                            Sai
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Dạng Điền khuyết */}
              {formData.questionType === 'Điền khuyết' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Đáp án cần điền vào chỗ trống:
                  </label>
                  <input
                    type="text"
                    value={formData.fillBlankAnswer}
                    onChange={e => setFormData({ ...formData, fillBlankAnswer: e.target.value })}
                    placeholder="Ví dụ: 6 hoặc x ≥ 3..."
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-teal-500/40 rounded-xl text-teal-200 font-bold focus:outline-none"
                  />
                </div>
              )}

              {/* 5. Dạng Ghép nối */}
              {formData.questionType === 'Ghép nối' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Các cặp ghép nối (Cột A ↔ Cột B):
                  </label>
                  {formData.matchingPairs?.map((pair, pIdx) => (
                    <div key={pair.id || pIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={e => {
                          const next = [...(formData.matchingPairs || [])];
                          next[pIdx].left = e.target.value;
                          setFormData({ ...formData, matchingPairs: next });
                        }}
                        placeholder={`Vế A (${pIdx + 1})...`}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white"
                      />
                      <span className="text-cyan-400 font-bold">↔</span>
                      <input
                        type="text"
                        value={pair.right}
                        onChange={e => {
                          const next = [...(formData.matchingPairs || [])];
                          next[pIdx].right = e.target.value;
                          setFormData({ ...formData, matchingPairs: next });
                        }}
                        placeholder={`Vế B tương ứng...`}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 6. Dạng Tự luận ngắn */}
              {formData.questionType === 'Tự luận ngắn' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Barem chấm điểm & Gợi ý trả lời:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.shortAnswerGuide}
                    onChange={e => setFormData({ ...formData, shortAnswerGuide: e.target.value })}
                    placeholder="Nhập các ý chính và thang điểm chấm..."
                    className="w-full p-2.5 text-xs bg-[#070d1e] border border-rose-500/30 rounded-xl text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Lời giải chi tiết */}
              <div>
                <label className="text-[11px] font-bold text-slate-300">Lời giải chi tiết & Hướng dẫn chấm</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Nhập các bước giải thích chi tiết..."
                  className="w-full mt-1 p-2.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#142244] rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl shadow-md cursor-pointer"
                >
                  Lưu Câu Hỏi Vào Ngân Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: IMPORT NHIỀU CÂU HỎI CÙNG 1 LÚC (EXCEL, WORD, TEXT)
      ------------------------------------------------------------- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b1329] border border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-emerald-500/25 flex items-center justify-between bg-emerald-950/40">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import Nhiều Câu Hỏi Cùng Một Lúc (Yêu cầu 2)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Tab selector */}
              <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                <button
                  type="button"
                  onClick={() => setImportTab('file')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    importTab === 'file'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white bg-[#070d1e]'
                  }`}
                >
                  📁 Tải file Excel (.xlsx) / Word (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => setImportTab('paste')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    importTab === 'paste'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white bg-[#070d1e]'
                  }`}
                >
                  📋 Dán văn bản nhiều câu hỏi
                </button>
              </div>

              {/* TAB 1: FILE UPLOAD */}
              {importTab === 'file' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-emerald-500/40 bg-[#070d1e] rounded-xl text-center space-y-2 cursor-pointer hover:border-emerald-400 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-sm">
                      {importFileName ? `Đã chọn: ${importFileName}` : 'Kéo thả hoặc bấm để chọn file Excel / Word'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hỗ trợ file .xlsx, .xls, .docx, .txt (Tối đa 15MB)
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải file Excel mẫu chuẩn (.xlsx)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE RAW TEXT */}
              {importTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Dán nội dung câu hỏi theo cấu trúc chuẩn:</span>
                    <button
                      type="button"
                      onClick={handleFillSamplePasteText}
                      className="text-xs text-cyan-300 hover:underline font-bold"
                    >
                      + Điền văn bản mẫu thử nghiệm
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={importRawText}
                    onChange={e => setImportRawText(e.target.value)}
                    placeholder={`Câu 1: Nội dung câu hỏi...
A. Phương án A
B. Phương án B
C. Phương án C
D. Phương án D
Đáp án: A
Lời giải: Lời giải chi tiết...`}
                    className="w-full p-3 text-xs bg-[#070d1e] border border-emerald-500/30 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                  />

                  <button
                    type="button"
                    onClick={() => parseTextIntoQuestions(importRawText)}
                    disabled={!importRawText.trim()}
                    className="px-4 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                  >
                    Phân Tích & Xem Trước Câu Hỏi
                  </button>
                </div>
              )}

              {/* MÀN HÌNH XEM TRƯỚC (PREVIEW) TRƯỚC KHI LƯU */}
              {parsedImportQuestions.length > 0 && (
                <div className="pt-4 border-t border-emerald-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Đã nhận diện {parsedImportQuestions.length} câu hỏi hợp lệ (Chọn: {selectedImportIndices.length})</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImportIndices.length === parsedImportQuestions.length) {
                          setSelectedImportIndices([]);
                        } else {
                          setSelectedImportIndices(parsedImportQuestions.map((_, i) => i));
                        }
                      }}
                      className="text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
                    >
                      {selectedImportIndices.length === parsedImportQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {parsedImportQuestions.map((item, idx) => {
                      const isChecked = selectedImportIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedImportIndices(prev =>
                              prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#06241e] border-emerald-400 text-white'
                              : 'bg-[#070d1e] border-slate-800 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-emerald-300">
                              Câu {idx + 1}: {item.code} ({item.questionType})
                            </span>
                            <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300">
                              {item.level}
                            </span>
                          </div>
                          <div className="font-medium text-slate-200 line-clamp-2">{item.question}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-500/20">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedImportQuestions([]);
                        setSelectedImportIndices([]);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBatchImport}
                      disabled={selectedImportIndices.length === 0}
                      className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-lg cursor-pointer disabled:opacity-40"
                    >
                      Xác Nhận Nhập {selectedImportIndices.length} Câu Vào Ngân Hàng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 3: AI TẠO ĐỀ TỰ ĐỘNG TỪ GIÁO ÁN, GIÁO TRÌNH, BÀI KIỂM TRA
          (QUY TRÌNH CHUẨN: TẢI LÊN -> AI ĐỀ XUẤT -> DUYỆT -> LƯU NGÂN HÀNG)
      ------------------------------------------------------------- */}
      {isAiLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b1329] border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-purple-500/30 flex items-center justify-between bg-purple-950/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-white">
                    AI Tạo Câu Hỏi Tự Động Từ Giáo Án / Giáo Trình
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    Tải lên bài học hoặc chọn chủ đề → AI đề xuất bộ câu hỏi → Giáo viên duyệt → Lưu vào ngân hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiLessonModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* BƯỚC 1: CUNG CẤP TÀI LIỆU (NẾU CHƯA CÓ KẾT QUẢ ĐỀ XUẤT) */}
              {aiProposedQuestions.length === 0 && !isAiScanning && (
                <div className="space-y-4">
                  {/* Khu vực đính kèm file giáo án */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      1. Đính kèm tệp bài học / giáo án / đề cương (.docx, .pdf, .txt, .xlsx):
                    </label>
                    <input
                      type="file"
                      ref={aiDocInputRef}
                      accept=".docx,.pdf,.txt,.xlsx,.pptx,.md"
                      onChange={handleAiDocUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => aiDocInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-purple-500/40 bg-[#070d1e] rounded-xl text-center space-y-2 cursor-pointer hover:border-purple-400 transition-colors"
                    >
                      <Paperclip className="w-7 h-7 text-purple-400 mx-auto" />
                      <div className="text-sm font-bold text-white">
                        {aiUploadedFileName ? `Tệp đã đính kèm: ${aiUploadedFileName}` : 'Bấm để đính kèm giáo án / giáo trình của bạn'}
                      </div>
                      <div className="text-[11px] text-purple-300">
                        AI sẽ đọc nội dung bài giảng, trích xuất kiến thức trọng tâm và thiết lập ma trận câu hỏi
                      </div>
                    </div>
                  </div>

                  {/* Hoặc chọn nhanh các bài học mẫu chuẩn THCS */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Hoặc chọn nhanh bài học mẫu chuẩn THCS:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SAMPLE_LESSONS.map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleSelectSampleLesson(l)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            aiUploadedFileName === l.fileName
                              ? 'bg-purple-950 border-purple-400 text-white ring-1 ring-purple-400'
                              : 'bg-[#070d1e] border-purple-500/20 text-slate-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="font-bold text-purple-300 truncate">{l.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{l.summary}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cấu hình câu hỏi */}
                  <div className="p-3.5 bg-[#070d1e] rounded-xl border border-purple-500/25 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Môn học</label>
                      <select
                        value={aiSubject}
                        onChange={e => setAiSubject(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#0b1329] border border-purple-500/30 rounded-lg text-white"
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
                        value={aiGrade}
                        onChange={e => setAiGrade(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#0b1329] border border-purple-500/30 rounded-lg text-white"
                      >
                        <option value="Khối 6">Khối 6</option>
                        <option value="Khối 7">Khối 7</option>
                        <option value="Khối 8">Khối 8</option>
                        <option value="Khối 9">Khối 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Số lượng câu</label>
                      <select
                        value={aiCount}
                        onChange={e => setAiCount(Number(e.target.value))}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#0b1329] border border-purple-500/30 rounded-lg text-white font-bold"
                      >
                        <option value={3}>3 câu hỏi</option>
                        <option value={5}>5 câu hỏi (Chuẩn)</option>
                        <option value={8}>8 câu hỏi</option>
                        <option value={10}>10 câu hỏi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Dạng câu hỏi</label>
                      <select
                        value={aiDesiredType}
                        onChange={e => setAiDesiredType(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs bg-[#0b1329] border border-purple-500/30 rounded-lg text-amber-300 font-bold"
                      >
                        <option value="mixed">Hỗn hợp các dạng</option>
                        <option value="1 Đáp án">Chỉ 1 đáp án</option>
                        <option value="Đúng / Sai">Đúng / Sai (Mới)</option>
                        <option value="Điền khuyết">Điền khuyết</option>
                      </select>
                    </div>
                  </div>

                  {/* Nút bắt đầu quét */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/20">
                    <button
                      type="button"
                      onClick={() => setIsAiLessonModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Hủy bỏ
                    </button>

                    <button
                      type="button"
                      onClick={handleStartAiScanAndGenerate}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl shadow-lg cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Phân Tích Giáo Án & Sinh Câu Hỏi AI</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: HIỆU ỨNG AI QUÉT TÀI LIỆU */}
              {isAiScanning && (
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center text-purple-300">
                      <BrainCircuit className="w-8 h-8 animate-spin" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">AI đang phân tích tài liệu bài học...</h4>
                    <p className="text-xs text-purple-300 mt-1">
                      {aiScanStep === 1 && '1/3: Trích xuất các khái niệm, định lý và công thức trọng tâm...'}
                      {aiScanStep === 2 && '2/3: Xây dựng ma trận độ khó & biên soạn phương án đúng/nhiễu...'}
                      {aiScanStep === 3 && '3/3: Tạo lập lời giải chi tiết và căn cứ lý thuyết theo giáo án...'}
                    </p>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: MÀN HÌNH DUYỆT CỦA GIÁO VIÊN (REVIEW & APPROVE TRƯỚC KHI LƯU VÀO NGÂN HÀNG) */}
              {aiProposedQuestions.length > 0 && !isAiScanning && (
                <div className="space-y-4">
                  {/* Banner hướng dẫn duyệt */}
                  <div className="bg-purple-950/70 border border-purple-500/40 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white">Kết quả AI đề xuất ({aiProposedQuestions.length} câu)</span>
                        <p className="text-[11px] text-purple-200">
                          Giáo viên vui lòng kiểm tra nội dung, chọn các câu đạt yêu cầu để lưu vào ngân hàng.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllAiQuestions}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#142244] text-purple-200 hover:text-white cursor-pointer"
                      >
                        {selectedAiQuestionIds.length === aiProposedQuestions.length ? 'Bỏ chọn hết' : 'Chọn duyệt tất cả'}
                      </button>
                    </div>
                  </div>

                  {/* Danh sách các câu để duyệt */}
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {aiProposedQuestions.map((q, qIdx) => {
                      const isApproved = selectedAiQuestionIds.includes(q.id);

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
                                onClick={() => handleToggleSelectAiQuestion(q.id)}
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
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteAiQuestion(q.id)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="Loại bỏ câu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-semibold text-white leading-relaxed">
                            {q.question}
                          </div>

                          {/* Options display */}
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

                          {/* True / False display */}
                          {q.trueFalseStatements && (
                            <div className="space-y-1 pl-2">
                              {q.trueFalseStatements.map((tf, tfIdx) => (
                                <div key={tfIdx} className="flex items-center justify-between text-[11px] bg-[#0b1329] p-1.5 rounded">
                                  <span className="text-slate-300">{tf.statement}</span>
                                  <span className={`px-1.5 py-0.2 rounded font-bold ${tf.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tf.isCorrect ? 'ĐÚNG' : 'SAI'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="p-2 bg-[#0b1329] rounded-lg text-[11px] text-slate-300 border border-purple-500/20">
                            <strong className="text-purple-300">Lời giải AI:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Thanh hành động lưu */}
                  <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAiProposedQuestions([]);
                        setSelectedAiQuestionIds([]);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      ← Quét lại tài liệu khác
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveApprovedAiQuestions}
                      disabled={selectedAiQuestionIds.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-lg cursor-pointer disabled:opacity-40"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Xác Nhận Lưu {selectedAiQuestionIds.length} Câu Đã Duyệt Vào Ngân Hàng</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
