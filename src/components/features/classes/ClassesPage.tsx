import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Classroom } from '../../../types';
import {
  School,
  Plus,
  Search,
  Filter,
  Users,
  BookCheck,
  FileSpreadsheet,
  Copy,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { ClassFormModal } from './ClassFormModal';
import { ConfirmModal } from '../../ui/ConfirmModal';

export const ClassesPage: React.FC = () => {
  const {
    classes,
    activeClassId,
    activeClass,
    setActiveClassId,
    classStudents,
    attendance,
    grades,
    duplicateClass,
    deleteClass,
    deleteAllClasses,
    setActiveTab,
    refreshAllData,
    showToast,
    userRole
  } = useApp();

  const isManager = userRole === 'teacher' || userRole === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'grade'>('name');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [deletingClass, setDeletingClass] = useState<Classroom | null>(null);
  const [isDeleteAllClassesModalOpen, setIsDeleteAllClassesModalOpen] = useState(false);

  // Active view: 'detail' (Nội dung lớp đang chọn) vs 'all' (Tất cả các lớp)
  const [viewMode, setViewMode] = useState<'detail' | 'all'>('detail');

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(classes.map(c => c.subject)));
  }, [classes]);

  // Combined Search & Filter for all classes
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classes
      .filter(cls => {
        const matchesQuery =
          !q ||
          cls.name.toLowerCase().includes(q) ||
          cls.subject.toLowerCase().includes(q) ||
          cls.room.toLowerCase().includes(q);

        const matchesGrade = filterGrade === 'all' || cls.grade === filterGrade;
        const matchesSubject = filterSubject === 'all' || cls.subject === filterSubject;

        return matchesQuery && matchesGrade && matchesSubject;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'students') return (b.studentCount || 0) - (a.studentCount || 0);
        if (sortBy === 'grade') return a.grade.localeCompare(b.grade);
        return 0;
      });
  }, [classes, searchQuery, filterGrade, filterSubject, sortBy]);

  // Handler to switch active class
  const handleSelectClass = (cls: Classroom) => {
    setActiveClassId(cls.id);
    setViewMode('detail');
    showToast(`Đã chuyển sang ${cls.name.startsWith('Lớp') ? cls.name : `Lớp ${cls.name}`} thành công`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Metrics for active class
  const currentClassMetrics = useMemo(() => {
    const totalStudents = classStudents.length;
    const maleCount = classStudents.filter(s => s.gender === 'male').length;
    const femaleCount = classStudents.filter(s => s.gender === 'female').length;

    const classAttendance = attendance.filter(a => a.classId === activeClassId);
    const presentCount = classAttendance.filter(a => a.status === 'present').length;
    const excusedCount = classAttendance.filter(a => a.status === 'excused').length;
    const unexcusedCount = classAttendance.filter(a => a.status === 'unexcused').length;

    const classGrades = grades.filter(g => g.classId === activeClassId);
    let avgGrade = 8.4;
    if (classGrades.length > 0) {
      const validScores = classGrades
        .map(g => g.finalExam || g.midterm || g.oral1)
        .filter((s): s is number => typeof s === 'number');
      if (validScores.length > 0) {
        avgGrade = Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1));
      }
    }

    const totalStars = classStudents.reduce((sum, s) => sum + (s.stars || 0), 0);
    const totalDemerits = classStudents.reduce((sum, s) => sum + (s.demerits || 0), 0);

    return {
      totalStudents,
      maleCount,
      femaleCount,
      presentCount,
      excusedCount,
      unexcusedCount,
      avgGrade,
      totalStars,
      totalDemerits
    };
  }, [classStudents, attendance, grades, activeClassId]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Breadcrumb & Active Class Context */}
      <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/25 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#070d1e] hover:bg-slate-800 hover:text-cyan-300 border border-cyan-500/30 rounded-xl transition-all cursor-pointer shadow-xs group"
              title="Quay về Bàn làm việc"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
              <span>Quay về</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Trường THCS Nguyễn Lương Bằng • Năm học 2026
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {classes.length} lớp học trong hệ thống
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1">
                <div
                  className="w-7 h-7 rounded-lg text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: activeClass?.color || '#06b6d4' }}
                >
                  {activeClass?.name?.replace(/[^0-9]/g, '').slice(0, 2) || 'LỚP'}
                </div>
                <span>
                  Lớp của tôi: <strong className="text-cyan-300">{activeClass?.name.startsWith('Lớp') ? activeClass.name : `Lớp ${activeClass?.name || '---'}`}</strong>
                </span>
              </h1>
              <p className="text-xs text-cyan-200/80 mt-0.5">
                Môn: <span className="font-semibold text-white">{activeClass?.subject || 'Toán học'}</span> · Khối: <span className="font-semibold text-white">{activeClass?.grade || '7'}</span> · Phòng: <span className="font-semibold text-white">{activeClass?.room || 'Phòng 204'}</span> · GVCN: <span className="font-semibold text-white">{activeClass?.teacherName || 'Cô Trần Thị Mai Anh'}</span>
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher & Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-[#070d1e] p-1 rounded-xl border border-cyan-500/30 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('detail')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'detail'
                    ? 'bg-cyan-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Nội dung {activeClass?.name}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-cyan-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Đổi lớp khác ({classes.length})
              </button>
            </div>

            {isManager ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lớp mới</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                Chế độ xem: {userRole === 'student' ? 'Học sinh' : 'Phụ huynh'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECTION A: DETAILED CONTENT OF CHOSEN CLASS */}
      {viewMode === 'detail' && activeClass && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Active Class Hero Overview */}
          <div className="p-5 bg-gradient-to-br from-[#0c1a38] via-[#0b1329] to-[#070d1e] rounded-2xl border-2 border-cyan-400/60 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl shrink-0 ring-4 ring-cyan-400/30"
                  style={{ backgroundColor: activeClass.color || '#06b6d4' }}
                >
                  {activeClass.name}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-black text-white drop-shadow-sm">
                      {activeClass.name.startsWith('Lớp') ? activeClass.name : `Lớp ${activeClass.name}`}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lớp đang chọn & quản lý
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30">
                      Năm học 2025 - 2026
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {activeClass.description || `Lớp ${activeClass.name} trọng điểm - Tinh thần học tập nghiêm túc, tích cực phát biểu, phong trào thi đua xuất sắc.`}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-cyan-200">
                      <strong>Môn:</strong> {activeClass.subject}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-cyan-200">
                      <strong>Phòng học:</strong> {activeClass.room}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-cyan-200">
                      <strong>GVCN:</strong> {activeClass.teacherName}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-cyan-200">
                      <strong>Sĩ số:</strong> {classStudents.length} học sinh
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Actions */}
              <div className="flex items-center gap-2 self-start lg:self-center shrink-0 flex-wrap">
                {isManager && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingClass(activeClass)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-cyan-300 bg-[#070d1e] hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sửa thông tin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateClass(activeClass.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#070d1e] hover:bg-slate-800 border border-cyan-500/30 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nhân bản</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Đổi lớp khác</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Interactive KPI Cards for this Chosen Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Học sinh */}
            <div
              onClick={() => setActiveTab('students')}
              className="bg-[#0b1329] hover:bg-[#101b38] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 shadow-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Học sinh lớp {activeClass.name}</span>
                <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono">
                  {currentClassMetrics.totalStudents} <span className="text-xs font-normal text-slate-400">HS</span>
                </span>
                <span className="text-xs text-teal-300 font-semibold">
                  {currentClassMetrics.maleCount} Nam • {currentClassMetrics.femaleCount} Nữ
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                <span>Quản lý học sinh</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Chuyên cần */}
            <div
              onClick={() => setActiveTab('attendance')}
              className="bg-[#0b1329] hover:bg-[#101b38] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 shadow-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Chuyên cần hôm nay</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono">
                  {currentClassMetrics.totalStudents} / {currentClassMetrics.totalStudents}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  100% có mặt
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Điểm danh lớp</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Sổ điểm */}
            <div
              onClick={() => setActiveTab('grades')}
              className="bg-[#0b1329] hover:bg-[#101b38] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 shadow-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Điểm TB môn {activeClass.subject}</span>
                <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-cyan-300 font-mono">
                  {currentClassMetrics.avgGrade} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  Học lực Khá - Giỏi
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Sổ điểm điện tử</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Nề nếp thi đua */}
            <div
              onClick={() => setActiveTab('behavior')}
              className="bg-[#0b1329] hover:bg-[#101b38] p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 shadow-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Nề nếp & Khen thưởng</span>
                <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-amber-300 font-mono flex items-center gap-1">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
                  {currentClassMetrics.totalStars || 185}
                </span>
                <span className="text-xs text-slate-400">
                  {currentClassMetrics.totalDemerits} vi phạm
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Xem sổ nề nếp</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Roster Preview of Chosen Class */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/25 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span>Danh sách học sinh lớp {activeClass.name}</span>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {classStudents.length} học sinh
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bản xem nhanh thông tin học sinh lớp {activeClass.name}. Bấm nút bên dưới để mở toàn bộ tính năng quản lý học sinh và phụ huynh.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Quản lý danh sách học sinh đầy đủ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Students Table (first 8 students) */}
            <div className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-[#070d1e]/80">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0b1329] text-cyan-300 uppercase text-[10px] tracking-wider border-b border-cyan-500/20">
                  <tr>
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Mã HS</th>
                    <th className="py-2.5 px-4">Họ và tên học sinh</th>
                    <th className="py-2.5 px-3">Giới tính</th>
                    <th className="py-2.5 px-3">Tổ / Nhóm</th>
                    <th className="py-2.5 px-3 text-center">Sao thưởng</th>
                    <th className="py-2.5 px-3">Phụ huynh liên hệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {classStudents.slice(0, 8).map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-cyan-300">{st.studentCode}</td>
                      <td className="py-2 px-4 font-bold text-white">{st.fullName}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.gender === 'male' ? 'bg-blue-950 text-blue-300' : 'bg-pink-950 text-pink-300'
                        }`}>
                          {st.gender === 'male' ? 'Nam' : 'Nữ'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{st.studyGroup || 'Tổ 1'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-amber-300 font-bold">
                          ⭐ {st.stars || 10}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {st.parentName ? (
                          <span>{st.parentName} {st.parentPhone ? `(${st.parentPhone})` : ''}</span>
                        ) : (
                          <span className="text-slate-500 italic">Chưa cập nhật</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {classStudents.length > 8 && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Xem thêm {classStudents.length - 8} học sinh khác trong lớp {activeClass.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SECTION B: CHOOSE OR SWITCH TO ANOTHER CLASS */}
      <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/25 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <School className="w-5 h-5 text-cyan-400" />
              <span>Chuyển đổi lớp hoặc chọn lớp khác</span>
              <span className="text-xs font-mono font-bold text-slate-400">({classes.length} lớp)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm <strong>&quot;Chọn lớp này&quot;</strong> để đổi không gian quản lý sang lớp học tương ứng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm lớp mới</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#070d1e] p-3.5 rounded-xl border border-cyan-500/20 flex flex-col md:flex-row items-center gap-3 justify-between text-white">
          <div className="flex items-center gap-2 w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Tìm theo tên lớp, môn, phòng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 bg-[#0b1329] text-white placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end text-xs">
            {/* Grade Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-300 font-semibold">Khối:</span>
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="px-2.5 py-1 text-xs border border-cyan-500/30 rounded-lg bg-[#0b1329] text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả khối</option>
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-300 font-semibold">Môn:</span>
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="px-2.5 py-1 text-xs border border-cyan-500/30 rounded-lg bg-[#0b1329] text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả môn</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-300 font-semibold">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs border border-cyan-500/30 rounded-lg bg-[#0b1329] text-white focus:outline-none cursor-pointer"
              >
                <option value="name">Tên lớp (A-Z)</option>
                <option value="students">Sĩ số học sinh</option>
                <option value="grade">Khối lớp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClasses.map(cls => {
            const isCurrent = cls.id === activeClassId;
            return (
              <div
                key={cls.id}
                className={`bg-[#070d1e] rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-lg ${
                  isCurrent
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-gradient-to-b from-[#0e1d3d] to-[#070d1e]'
                    : 'border-cyan-500/20 hover:border-cyan-400/40 hover:bg-[#0c1630]'
                }`}
              >
                {/* Card Top */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl text-slate-950 font-black text-base flex items-center justify-center shadow-md shrink-0"
                        style={{ backgroundColor: cls.color || '#06b6d4' }}
                      >
                        {cls.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">
                            {cls.name.startsWith('Lớp') ? cls.name : `Lớp ${cls.name}`}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-400/50">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-cyan-200/80 font-medium mt-0.5">
                          {cls.subject} · Khối {cls.grade} · GV: {cls.teacherName}
                        </div>
                      </div>
                    </div>

                    {/* Secondary menu buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingClass(cls)}
                        className="p-1.5 text-cyan-300 hover:text-white bg-[#0b1329] hover:bg-slate-800 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin lớp"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateClass(cls.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-[#0b1329] hover:bg-slate-800 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Nhân bản lớp học"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingClass(cls)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 bg-[#0b1329] hover:bg-rose-950/60 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lớp học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phòng học</span>
                      <span className="font-bold text-white">{cls.room}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sĩ số</span>
                      <span className="font-extrabold font-mono text-cyan-300">
                        {cls.studentCount || 20} học sinh
                      </span>
                    </div>
                  </div>

                  {cls.description && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1 italic">
                      &quot;{cls.description}&quot;
                    </p>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="px-4 py-2.5 bg-[#0b1329] border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClassId(cls.id);
                        setActiveTab('attendance');
                      }}
                      className="p-1.5 text-slate-300 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      title="Sổ điểm danh"
                    >
                      <BookCheck className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClassId(cls.id);
                        setActiveTab('grades');
                      }}
                      className="p-1.5 text-slate-300 hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                      title="Sổ điểm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClassId(cls.id);
                        setActiveTab('students');
                      }}
                      className="p-1.5 text-slate-300 hover:text-teal-400 rounded-lg transition-colors cursor-pointer"
                      title="Danh sách học sinh"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>

                  {isCurrent ? (
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Xem nội dung</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#142244] text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Chọn lớp này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Modals */}
      <ClassFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingClass && (
        <ClassFormModal
          isOpen={true}
          onClose={() => setEditingClass(null)}
          initialData={editingClass}
        />
      )}

      {deletingClass && (
        <ConfirmModal
          isOpen={true}
          onCancel={() => setDeletingClass(null)}
          onConfirm={() => {
            deleteClass(deletingClass.id);
            setDeletingClass(null);
          }}
          title="Xác nhận xóa lớp học"
          message={`Bạn có chắc chắn muốn xóa lớp "${deletingClass.name}"? Dữ liệu điểm danh, sổ điểm và bài tập liên quan của lớp này sẽ bị xóa.`}
          confirmLabel="Xóa lớp học"
          isDestructive={true}
        />
      )}

      {isDeleteAllClassesModalOpen && (
        <ConfirmModal
          isOpen={true}
          onCancel={() => setIsDeleteAllClassesModalOpen(false)}
          onConfirm={() => {
            deleteAllClasses();
            setIsDeleteAllClassesModalOpen(false);
          }}
          title="Xác nhận xóa TẤT CẢ các lớp"
          message="Bạn có chắc chắn muốn xóa TOÀN BỘ các lớp học trong hệ thống? Hành động này không thể hoàn tác."
          confirmLabel="Xóa tất cả lớp"
          isDestructive={true}
        />
      )}
    </div>
  );
};
