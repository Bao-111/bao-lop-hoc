import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Assignment,
  AssignmentSubmission,
  AssignmentStatus,
  SubmissionStatus,
  Student
} from '../../../types';
import {
  BookOpen,
  Plus,
  Clock,
  Edit2,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Calendar,
  Award,
  Sparkles,
  Paperclip,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Eye,
  Send,
  Check,
  CheckSquare,
  Square,
  MessageSquare,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../../../services/audio';

export const AssignmentsPage: React.FC = () => {
  const {
    activeClass,
    classes,
    classStudents,
    students,
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeAssignmentSubmission,
    setActiveTab,
    showToast,
    userRole,
    currentUser
  } = useApp();

  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClass?.id || classes[0]?.id || 'class-6a1');

  // Teacher Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedGradingAssignment, setSelectedGradingAssignment] = useState<Assignment | null>(null);
  const [gradingStudentSubmission, setGradingStudentSubmission] = useState<{
    student: Student;
    submission?: AssignmentSubmission;
  } | null>(null);

  // Teacher Grading Input Form
  const [gradeInput, setGradeInput] = useState<number>(10);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Teacher Create/Edit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState(activeClass?.subject || 'Toán học');
  const [formClassId, setFormClassId] = useState(activeClass?.id || 'class-6a1');
  const [formDescription, setFormDescription] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPointsMax, setFormPointsMax] = useState(10);
  const [formTargetType, setFormTargetType] = useState<'all' | 'specific'>('all');
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([]);
  const [formAttachments, setFormAttachments] = useState<{ name: string; size?: string }[]>([]);
  const teacherFileInputRef = useRef<HTMLInputElement>(null);

  // Student Submission Modal
  const [studentActiveAssignment, setStudentActiveAssignment] = useState<Assignment | null>(null);
  const [studentContentInput, setStudentContentInput] = useState('');
  const [studentAttachmentFiles, setStudentAttachmentFiles] = useState<{ name: string; size?: string }[]>([]);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // FILTERED ASSIGNMENTS ACCORDING TO USER ROLE
  // -------------------------------------------------------------
  // Determine target student ID if logged in as student or parent
  const currentStudentId = useMemo(() => {
    if (userRole === 'student') {
      return currentUser?.studentId || 'std-6a1-01';
    }
    if (userRole === 'parent') {
      return currentUser?.studentId || 'std-6a1-01';
    }
    return null;
  }, [userRole, currentUser]);

  const targetClassId = userRole === 'admin' ? selectedClassId : activeClass?.id || 'class-6a1';

  const relevantAssignments = useMemo(() => {
    let list = assignments;

    if (userRole === 'student' || userRole === 'parent') {
      // Show assignments that target all or specific student
      list = assignments.filter(a => {
        if (a.targetType === 'specific' && a.targetStudentIds) {
          return currentStudentId ? a.targetStudentIds.includes(currentStudentId) : false;
        }
        return true;
      });
    } else if (userRole === 'teacher') {
      // Show assignments belonging to current active class
      list = assignments.filter(a => a.classId === activeClass?.id);
    } else if (userRole === 'admin') {
      if (selectedClassId !== 'all') {
        list = assignments.filter(a => a.classId === selectedClassId);
      }
    }

    // Apply search keyword
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }

    return list;
  }, [assignments, userRole, activeClass?.id, currentStudentId, selectedClassId, searchQuery]);

  // Statistics for Teacher
  const teacherStats = useMemo(() => {
    const total = relevantAssignments.length;
    let submittedCount = 0;
    let waitingGradeCount = 0;
    let gradedCount = 0;

    relevantAssignments.forEach(a => {
      const subs = a.submissions || [];
      submittedCount += subs.length;
      subs.forEach(s => {
        if (s.status === 'submitted') waitingGradeCount++;
        if (s.status === 'graded') gradedCount++;
      });
    });

    return { total, submittedCount, waitingGradeCount, gradedCount };
  }, [relevantAssignments]);

  // Statistics for Student
  const studentStats = useMemo(() => {
    let pendingCount = 0;
    let submittedCount = 0;
    let gradedCount = 0;
    let revisionCount = 0;

    relevantAssignments.forEach(a => {
      const mySub = a.submissions?.find(s => s.studentId === currentStudentId);
      if (!mySub) {
        pendingCount++;
      } else if (mySub.status === 'revision_required') {
        revisionCount++;
      } else if (mySub.status === 'graded') {
        gradedCount++;
      } else {
        submittedCount++;
      }
    });

    return { pendingCount, submittedCount, gradedCount, revisionCount };
  }, [relevantAssignments, currentStudentId]);

  // -------------------------------------------------------------
  // HANDLERS: TEACHER ACTIONS
  // -------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setFormTitle('');
    setFormSubject(activeClass?.subject || 'Toán học');
    setFormClassId(activeClass?.id || 'class-6a1');
    setFormDescription('');
    // Default deadline: 3 days from now at 22:00
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(22, 0, 0, 0);
    setFormDeadline(d.toISOString().slice(0, 16));
    setFormPointsMax(10);
    setFormTargetType('all');
    setFormSelectedStudentIds([]);
    setFormAttachments([]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (asg: Assignment) => {
    setEditingAssignment(asg);
    setFormTitle(asg.title);
    setFormSubject(asg.subject || activeClass?.subject || 'Toán học');
    setFormClassId(asg.classId);
    setFormDescription(asg.description);
    setFormDeadline(new Date(asg.deadline).toISOString().slice(0, 16));
    setFormPointsMax(asg.pointsMax || 10);
    setFormTargetType(asg.targetType || 'all');
    setFormSelectedStudentIds(asg.targetStudentIds || []);
    setFormAttachments(asg.attachments || []);
    setIsCreateModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài tập', 'warning');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: formTitle,
        subject: formSubject,
        classId: formClassId,
        description: formDescription,
        deadline: new Date(formDeadline).toISOString(),
        pointsMax: formPointsMax,
        targetType: formTargetType,
        targetStudentIds: formSelectedStudentIds,
        attachments: formAttachments,
        updatedAt: new Date().toISOString()
      });
      showToast('Đã cập nhật bài tập thành công', 'success');
    } else {
      createAssignment({
        classId: formClassId,
        title: formTitle,
        subject: formSubject,
        description: formDescription,
        deadline: new Date(formDeadline).toISOString(),
        pointsMax: formPointsMax,
        targetType: formTargetType,
        targetStudentIds: formSelectedStudentIds,
        attachments: formAttachments,
        status: 'assigned',
        submissions: []
      });
      showToast('Đã xuất bản và giao bài tập mới thành công!', 'success');
      soundManager.playCorrect();
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài tập "${title}"?`)) return;
    deleteAssignment(id);
    if (selectedGradingAssignment?.id === id) {
      setSelectedGradingAssignment(null);
    }
  };

  // Open Grading Drawer for an Assignment
  const handleOpenGradingView = (asg: Assignment) => {
    setSelectedGradingAssignment(asg);
    setGradingStudentSubmission(null);
  };

  const handleSelectStudentToGrade = (student: Student) => {
    const sub = selectedGradingAssignment?.submissions?.find(s => s.studentId === student.id);
    setGradingStudentSubmission({ student, submission: sub });
    setGradeInput(sub?.score ?? 10);
    setFeedbackInput(sub?.teacherFeedback || '');
  };

  const handleSubmitGrade = (status: SubmissionStatus = 'graded') => {
    if (!selectedGradingAssignment || !gradingStudentSubmission) return;

    if (status === 'graded' && (gradeInput < 0 || gradeInput > (selectedGradingAssignment.pointsMax || 10))) {
      showToast(`Điểm số phải từ 0 đến ${selectedGradingAssignment.pointsMax || 10}`, 'warning');
      return;
    }

    const subId = gradingStudentSubmission.submission?.id || `sub-manual-${Date.now()}`;
    gradeAssignmentSubmission(
      selectedGradingAssignment.id,
      subId,
      gradeInput,
      feedbackInput.trim() || (status === 'revision_required' ? 'Cần làm lại và hoàn thiện bài tập' : 'Đã hoàn thành bài tập tốt.'),
      status
    );

    // Refresh local assignment selection
    const updatedAsg = assignments.find(a => a.id === selectedGradingAssignment.id);
    if (updatedAsg) {
      setSelectedGradingAssignment(updatedAsg);
    }
    setGradingStudentSubmission(null);
    soundManager.playCorrect();
  };

  // -------------------------------------------------------------
  // HANDLERS: STUDENT ACTIONS
  // -------------------------------------------------------------
  const handleOpenStudentSubmission = (asg: Assignment) => {
    setStudentActiveAssignment(asg);
    const mySub = asg.submissions?.find(s => s.studentId === currentStudentId);
    setStudentContentInput(mySub?.content || '');
    setStudentAttachmentFiles(mySub?.attachments || []);
  };

  const handleSubmitStudentWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentActiveAssignment) return;

    if (!studentContentInput.trim() && studentAttachmentFiles.length === 0) {
      showToast('Vui lòng nhập bài làm hoặc tải ảnh / tệp bài tập', 'warning');
      return;
    }

    submitAssignment(studentActiveAssignment.id, {
      assignmentId: studentActiveAssignment.id,
      studentId: currentStudentId || 'std-6a1-01',
      studentName: currentUser?.name || 'Học sinh',
      content: studentContentInput,
      attachments: studentAttachmentFiles,
      status: 'submitted'
    });

    soundManager.playCorrect();
    setStudentActiveAssignment(null);
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & KPI BAR                                   */}
      {/* ========================================================= */}
      <div className="bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-cyan-300 hover:text-white bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer border border-cyan-500/30 shrink-0"
            title="Quay về Bàn làm việc"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>
                  {userRole === 'student'
                    ? 'Bài Tập Cần Nộp Của Em'
                    : userRole === 'parent'
                    ? 'Sổ Theo Dõi Bài Tập Của Con'
                    : userRole === 'admin'
                    ? 'Quản Trị Bài Tập Toàn Trường'
                    : 'Quản Lý & Giao Bài Tập Về Nhà'}
                </span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                {userRole === 'student'
                  ? `Học sinh: ${currentUser?.name || 'Nguyễn Tuấn Anh'}`
                  : userRole === 'parent'
                  ? `Con: ${currentUser?.studentName || 'Nguyễn Tuấn Anh'}`
                  : `Lớp ${activeClass?.name || '6A1'}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {userRole === 'student'
                ? 'Theo dõi hạn nộp bài, làm bài trực tuyến và nhận nhận xét điểm số từ cô giáo'
                : userRole === 'parent'
                ? 'Nắm bắt tình trạng học tập, bài tập về nhà và lời phê của giáo viên chủ nhiệm'
                : 'Giao bài tập đa định dạng, theo dõi tiến độ nộp bài và chấm điểm tự động / thủ công'}
            </p>
          </div>
        </div>

        {/* Action Button for Teacher / Admin */}
        {(userRole === 'teacher' || userRole === 'admin') && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 rounded-xl transition-all shadow-lg shadow-amber-950/40 cursor-pointer shrink-0 hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Giao bài tập mới</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY METRICS                                    */}
      {/* ========================================================= */}
      {userRole === 'teacher' || userRole === 'admin' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/30 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng bài tập đã giao
            </span>
            <p className="text-2xl font-black text-white mt-1">{teacherStats.total}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/30 shadow-md">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
              Học sinh đã nộp
            </span>
            <p className="text-2xl font-black text-cyan-300 mt-1">{teacherStats.submittedCount}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-amber-500/30 shadow-md">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Đang chờ chấm điểm
            </span>
            <p className="text-2xl font-black text-amber-300 mt-1">{teacherStats.waitingGradeCount}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-emerald-500/30 shadow-md">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Đã chấm & Trả bài
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-1">{teacherStats.gradedCount}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-amber-500/30 shadow-md">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Cần hoàn thành
            </span>
            <p className="text-2xl font-black text-amber-300 mt-1">{studentStats.pendingCount}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/30 shadow-md">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
              Đã nộp - Chờ cô chấm
            </span>
            <p className="text-2xl font-black text-cyan-300 mt-1">{studentStats.submittedCount}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-emerald-500/30 shadow-md">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Đã được chấm điểm
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-1">{studentStats.gradedCount}</p>
          </div>
          <div className="bg-[#0b1329] p-3.5 rounded-2xl border border-rose-500/30 shadow-md">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
              Cần sửa lại bài
            </span>
            <p className="text-2xl font-black text-rose-300 mt-1">{studentStats.revisionCount}</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEARCH & CLASS FILTER BAR                              */}
      {/* ========================================================= */}
      <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/30 shadow-md flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề bài tập hoặc nội dung..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {userRole === 'admin' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
            >
              <option value="all">Tất cả các lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN ASSIGNMENT CARDS GRID                             */}
      {/* ========================================================= */}
      {relevantAssignments.length === 0 ? (
        <div className="bg-[#0b1329] p-12 rounded-2xl border border-cyan-500/30 shadow-xl text-center space-y-3">
          <BookOpen className="w-12 h-12 text-cyan-400/40 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có bài tập nào trong danh sách</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {userRole === 'student'
              ? 'Tuyệt vời! Hiện tại em không có bài tập nào cần hoàn thành.'
              : 'Chưa có bài tập nào được giao. Hãy nhấn nút "Giao bài tập mới" để bắt đầu.'}
          </p>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bài tập đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantAssignments.map(asg => {
            const isOverdue = new Date(asg.deadline) < new Date();
            const subs = asg.submissions || [];
            const mySubmission = subs.find(s => s.studentId === currentStudentId);
            const myStatus = mySubmission?.status;

            return (
              <div
                key={asg.id}
                className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#142244] text-cyan-300 border border-cyan-500/30">
                      {asg.subject || 'Toán học'} • Thang điểm {asg.pointsMax || 10}
                    </span>

                    {/* Status Badge */}
                    {userRole === 'student' || userRole === 'parent' ? (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          myStatus === 'graded'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : myStatus === 'revision_required'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                            : myStatus === 'submitted'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                            : isOverdue
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {myStatus === 'graded'
                          ? `Đã chấm: ${mySubmission?.score ?? ''}đ`
                          : myStatus === 'revision_required'
                          ? 'Cần nộp lại bài'
                          : myStatus === 'submitted'
                          ? 'Đã nộp - Chờ chấm'
                          : isOverdue
                          ? 'Quá hạn nộp'
                          : 'Chưa nộp bài'}
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          isOverdue
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isOverdue ? 'Đã hết hạn' : 'Đang mở'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-extrabold text-white leading-snug">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Attachments from teacher */}
                  {asg.attachments && asg.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">Tài liệu đính kèm:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {asg.attachments.map((file, fIdx) => (
                          <div
                            key={fIdx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#070d1e] rounded-lg border border-cyan-500/20 text-[10px] text-cyan-300 font-medium"
                          >
                            <Paperclip className="w-3 h-3 text-cyan-400" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deadline info */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Hạn nộp: <strong className="text-slate-200">{new Date(asg.deadline).toLocaleString('vi-VN')}</strong>
                    </span>
                  </div>

                  {/* Teacher Feedback preview for student */}
                  {(userRole === 'student' || userRole === 'parent') && mySubmission?.teacherFeedback && (
                    <div className="mt-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                      <strong className="text-purple-300 block mb-0.5">💬 Lời phê của cô giáo:</strong>
                      <p>{mySubmission.teacherFeedback}</p>
                    </div>
                  )}

                  {/* Teacher Progress */}
                  {(userRole === 'teacher' || userRole === 'admin') && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/20">
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span>Tiến độ nộp bài:</span>
                        <strong className="text-cyan-300">{subs.length}/{classStudents.length} HS</strong>
                      </div>
                      <div className="w-full bg-[#070d1e] h-2 rounded-full overflow-hidden border border-cyan-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
                          style={{
                            width: `${classStudents.length > 0 ? (subs.length / classStudents.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2">
                  {userRole === 'student' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenStudentSubmission(asg)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 cursor-pointer shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{mySubmission ? 'Xem lại / Nộp lại bài' : 'Làm bài & Nộp bài'}</span>
                    </button>
                  ) : userRole === 'parent' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenStudentSubmission(asg)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-200 bg-[#142244] hover:bg-[#1c3060] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem chi tiết bài làm của con</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenGradingView(asg)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Xem & Chấm bài ({subs.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(asg)}
                        className="p-2 text-slate-300 hover:text-white bg-[#070d1e] rounded-xl border border-slate-700 cursor-pointer"
                        title="Chỉnh sửa bài tập"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                        className="p-2 text-rose-400 hover:text-rose-200 bg-[#070d1e] rounded-xl border border-rose-500/30 cursor-pointer"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: TEACHER CREATE / EDIT ASSIGNMENT                */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>{editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo & Giao bài tập mới'}</span>
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tiêu đề bài tập *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Bài tập Số học 6: Phép cộng và nhân số tự nhiên"
                  className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Môn học</label>
                  <select
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                    <option value="Tin học">Tin học</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Lớp phân công</label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Thang điểm</label>
                  <input
                    type="number"
                    value={formPointsMax}
                    onChange={e => setFormPointsMax(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Hạn nộp bài *</label>
                  <input
                    type="datetime-local"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Phạm vi giao</label>
                  <select
                    value={formTargetType}
                    onChange={e => setFormTargetType(e.target.value as 'all' | 'specific')}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none"
                  >
                    <option value="all">Toàn bộ học sinh trong lớp</option>
                    <option value="specific">Chỉ định một số học sinh cụ thể</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mô tả & Hướng dẫn làm bài</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Yêu cầu học sinh mở SGK trang bao nhiêu, cách trình bày và lưu ý..."
                  className="w-full h-24 p-3 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Attachments for teacher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Đính kèm tệp mẫu / phiếu bài tập</label>
                  <button
                    type="button"
                    onClick={() => teacherFileInputRef.current?.click()}
                    className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Thêm tệp (PDF/Word/Ảnh)</span>
                  </button>
                  <input
                    type="file"
                    ref={teacherFileInputRef}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormAttachments(prev => [...prev, { name: file.name, size: `${Math.round(file.size / 1024)} KB` }]);
                        showToast(`Đã thêm tệp: ${file.name}`, 'info');
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {formAttachments.length > 0 && (
                  <div className="space-y-1">
                    {formAttachments.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#070d1e] text-xs text-cyan-200">
                        <span className="truncate">{f.name} ({f.size || 'Tệp'})</span>
                        <button
                          type="button"
                          onClick={() => setFormAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-[#070d1e] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 cursor-pointer shadow-md"
                >
                  {editingAssignment ? 'Cập nhật bài tập' : 'Xuất bản & Giao bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: TEACHER VIEW & GRADE SUBMISSIONS                */}
      {/* ========================================================= */}
      {selectedGradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>Danh sách nộp & Chấm bài: {selectedGradingAssignment.title}</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Lớp {activeClass?.name} • Thang điểm: {selectedGradingAssignment.pointsMax}đ • Hạn nộp: {new Date(selectedGradingAssignment.deadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedGradingAssignment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* If grading a specific student */}
            {gradingStudentSubmission ? (
              <div className="bg-[#070d1e] p-4 rounded-xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <span className="text-xs font-bold text-cyan-300">
                    Chấm bài học sinh: <strong className="text-white text-sm">{gradingStudentSubmission.student.fullName}</strong> ({gradingStudentSubmission.student.studentCode})
                  </span>
                  <button
                    onClick={() => setGradingStudentSubmission(null)}
                    className="text-xs text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    ← Quay lại danh sách lớp
                  </button>
                </div>

                {/* Student's answer content */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300">Nội dung bài làm của học sinh:</span>
                  <div className="p-3 rounded-xl bg-[#0b1329] border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                    {gradingStudentSubmission.submission?.content || '(Học sinh chưa nhập văn bản giải)'}
                  </div>
                </div>

                {/* Student's attachments */}
                {gradingStudentSubmission.submission?.attachments && gradingStudentSubmission.submission.attachments.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300">Tệp bài làm đính kèm:</span>
                    <div className="flex flex-wrap gap-2">
                      {gradingStudentSubmission.submission.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 p-2 bg-[#0b1329] rounded-lg border border-cyan-500/30 text-xs text-cyan-300">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grading Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Điểm số (Thang {selectedGradingAssignment.pointsMax}đ) *
                    </label>
                    <input
                      type="number"
                      value={gradeInput}
                      onChange={e => setGradeInput(Number(e.target.value))}
                      min={0}
                      max={selectedGradingAssignment.pointsMax}
                      step={0.5}
                      className="w-full px-3 py-2 text-xs bg-[#0b1329] border border-cyan-500/30 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Nhận xét sư phạm của giáo viên</label>
                    <textarea
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      placeholder="Lời khen ngợi hoặc nhắc nhở sửa lỗi..."
                      className="w-full h-16 p-2 text-xs bg-[#0b1329] border border-cyan-500/30 rounded-xl text-white resize-none"
                    />
                  </div>
                </div>

                {/* Grade Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                  <button
                    type="button"
                    onClick={() => handleSubmitGrade('revision_required')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 cursor-pointer"
                  >
                    Yêu cầu nộp lại bài
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitGrade('graded')}
                    className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 cursor-pointer shadow-md"
                  >
                    Trả bài & Công bố điểm
                  </button>
                </div>
              </div>
            ) : (
              /* Class Students Submissions Table */
              <div className="space-y-2">
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                  {classStudents.map(student => {
                    const sub = selectedGradingAssignment.submissions?.find(s => s.studentId === student.id);
                    const isSubmitted = !!sub;

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#070d1e] border border-slate-800 hover:border-cyan-500/30 transition-all text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                            {student.studentCode}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{student.fullName}</span>
                            <span className="text-[11px] text-slate-400">
                              {sub ? `Đã nộp: ${new Date(sub.submittedAt).toLocaleTimeString('vi-VN')} - ${new Date(sub.submittedAt).toLocaleDateString('vi-VN')}` : 'Chưa nộp bài'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub?.status === 'graded'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : sub?.status === 'revision_required'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : isSubmitted
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {sub?.status === 'graded'
                              ? `Điểm: ${sub.score}đ`
                              : sub?.status === 'revision_required'
                              ? 'Cần sửa lại'
                              : isSubmitted
                              ? 'Chờ chấm'
                              : 'Chưa nộp'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSelectStudentToGrade(student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 cursor-pointer"
                          >
                            {isSubmitted ? 'Chấm bài' : 'Nhập điểm'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: STUDENT SUBMISSION FORM                         */}
      {/* ========================================================= */}
      {studentActiveAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Nộp bài tập: {studentActiveAssignment.title}</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Hạn nộp: <strong className="text-amber-300">{new Date(studentActiveAssignment.deadline).toLocaleString('vi-VN')}</strong>
                </p>
              </div>
              <button
                onClick={() => setStudentActiveAssignment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Assignment description recap */}
            <div className="p-3 rounded-xl bg-[#070d1e] border border-cyan-500/20 text-xs text-slate-200">
              <strong className="text-cyan-400 block mb-1">📖 Yêu cầu của giáo viên:</strong>
              <p className="leading-relaxed">{studentActiveAssignment.description}</p>
            </div>

            <form onSubmit={handleSubmitStudentWork} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Nội dung câu trả lời / Lời giải của em:
                </label>
                <textarea
                  value={studentContentInput}
                  onChange={e => setStudentContentInput(e.target.value)}
                  placeholder="Gõ lời giải, kết quả tính toán hoặc tóm tắt bài làm của em tại đây..."
                  className="w-full h-36 p-3 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none font-mono leading-relaxed"
                />
              </div>

              {/* Attachments from student */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Đính kèm ảnh chụp vở bài tập hoặc file tài liệu:
                  </label>
                  <button
                    type="button"
                    onClick={() => studentFileInputRef.current?.click()}
                    className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Tải ảnh / tệp lên</span>
                  </button>
                  <input
                    type="file"
                    ref={studentFileInputRef}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setStudentAttachmentFiles(prev => [...prev, { name: file.name, size: `${Math.round(file.size / 1024)} KB` }]);
                        showToast(`Đã đính kèm: ${file.name}`, 'info');
                      }
                    }}
                    accept="image/*,.pdf,.docx,.doc"
                    className="hidden"
                  />
                </div>

                {studentAttachmentFiles.length > 0 && (
                  <div className="space-y-1">
                    {studentAttachmentFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#070d1e] text-xs text-cyan-200">
                        <span className="truncate">{file.name} ({file.size || 'Tệp'})</span>
                        <button
                          type="button"
                          onClick={() => setStudentAttachmentFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setStudentActiveAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-[#070d1e] cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 cursor-pointer shadow-md"
                >
                  Xác nhận nộp bài cho cô giáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
