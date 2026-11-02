import React, { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Users,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Calendar,
  BookCheck,
  BookOpen,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Award,
  Star,
  Clock,
  HelpCircle,
  Building,
  GraduationCap,
  Heart,
  MessageCircle,
  Bell,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Flame,
  CheckCircle,
  UserCheck,
  School
} from 'lucide-react';
import { ROLE_DETAILS } from '../../../services/authPresets';
import { UserRole } from '../../../types';

export const DashboardPage: React.FC = () => {
  const {
    teacher,
    classes,
    attendance,
    assignments,
    activeClass,
    setActiveTab,
    setActiveClassId,
    currentUser,
    userRole,
    switchRole,
    students,
    auditLogs
  } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);

  // Total students across all managed classes
  const totalStudents = useMemo(() => {
    return classes.reduce((sum, c) => sum + (c.studentCount || 0), 0) || 34;
  }, [classes]);

  // Today attendance metrics across active class
  const todayAttendance = useMemo(() => {
    const todayRecords = attendance.filter(
      a => a.classId === activeClass?.id && a.date === todayStr
    );
    const present = todayRecords.filter(a => a.status === 'present').length;
    const excused = todayRecords.filter(a => a.status === 'excused').length;
    const unexcused = todayRecords.filter(a => a.status === 'unexcused').length;
    const late = todayRecords.filter(a => a.status === 'late').length;

    return {
      recorded: todayRecords.length > 0,
      total: todayRecords.length,
      present: present || 32,
      excused: excused || 1,
      unexcused: unexcused || 1,
      late: late || 0
    };
  }, [attendance, activeClass?.id, todayStr]);

  // Pending assignments
  const pendingAssignments = useMemo(() => {
    return assignments.filter(a => a.status === 'assigned' || a.status === 'submitted');
  }, [assignments]);

  // --------------------------------------------------------------------------
  // ROLE-BASED QUICK ROLE PICKER BANNER
  // --------------------------------------------------------------------------
  const renderRoleSwitcherHUD = () => (
    <div className="bg-[#0b1329] p-3 rounded-2xl border border-cyan-500/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-xs font-bold text-slate-200">
          Chế độ xem theo vai trò:
        </span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase border ${
            ROLE_DETAILS[userRole]?.badgeBg || 'bg-cyan-950'
          } ${ROLE_DETAILS[userRole]?.badgeColor || 'text-cyan-300'} ${
            ROLE_DETAILS[userRole]?.badgeBorder || 'border-cyan-500/40'
          }`}
        >
          {ROLE_DETAILS[userRole]?.label || userRole}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Thử vai trò khác:</span>
        {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => switchRole(r)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              userRole === r
                ? 'bg-cyan-400 text-slate-950 font-extrabold shadow-sm'
                : 'bg-[#070d1e] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {ROLE_DETAILS[r].label}
          </button>
        ))}
      </div>
    </div>
  );

  // --------------------------------------------------------------------------
  // 1. DASHBOARD: HỌC SINH (Student)
  // --------------------------------------------------------------------------
  if (userRole === 'student') {
    const studentName = currentUser?.name || 'Nguyễn Tuấn Anh';
    const studentCode = currentUser?.studentCode || 'HS-0701';

    return (
      <div className="space-y-5 animate-in fade-in">
        {/* Role Switcher */}
        {renderRoleSwitcherHUD()}

        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-[#0b1329] to-cyan-950/50 p-5 rounded-2xl border border-emerald-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>GÓC HỌC TẬP THÔNG MINH CỦA HỌC SINH</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Xin chào em, <span className="text-emerald-300">{studentName}</span>! 👋
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Lớp <span className="font-bold text-white">{activeClass?.name || '7A3'}</span> • Mã HS:{' '}
                <span className="font-mono text-cyan-300 font-bold">{studentCode}</span> • Chúc em ngày học hứng khởi và gặt hái nhiều điểm tốt!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Hạng thi đua</div>
                <div className="text-lg font-black text-white">Top 3 ⭐</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards for Student */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Điểm TB tích lũy */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-emerald-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Điểm TB học tập kỳ này</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tabular-nums">8.8</span>
              <span className="text-xs text-slate-400 font-bold">/ 10</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 ml-auto">
                Học lực Giỏi
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Môn Toán: <span className="text-white font-bold">9.0</span> • Ngữ văn:{' '}
              <span className="text-white font-bold">8.5</span>
            </div>
          </div>

          {/* Card 2: Bài tập cần nộp */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Bài tập cần nộp</span>
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300 font-mono tabular-nums">2</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                1 bài hết hạn hôm nay
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400 truncate">
              Hàm số bậc hai • Trắc nghiệm Tiếng Anh
            </div>
          </div>

          {/* Card 3: Chuyên cần cá nhân */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Chuyên cần của em</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono tabular-nums">100%</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Đúng giờ
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Có mặt: <span className="text-emerald-300 font-bold">38 buổi</span> • Nghỉ: 0
            </div>
          </div>

          {/* Card 4: Ngôi sao thi đua */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Ngôi sao thi đua ⭐</span>
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300 font-mono tabular-nums">18 ⭐</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                +3 sao tuần này
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Tuyên dương: Phát biểu tích cực môn Toán
            </div>
          </div>
        </div>

        {/* Tác vụ nhanh học sinh */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
            TÁC VỤ HỌC TẬP NHANH CỦA EM
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="bg-[#0b1329] hover:bg-[#12233f] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Bài tập cần nộp
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className="bg-[#0b1329] hover:bg-[#12233f] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Thời khóa biểu
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grades')}
              className="bg-[#0b1329] hover:bg-[#12233f] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Bảng điểm của em
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quizzes')}
              className="bg-[#0b1329] hover:bg-[#12233f] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                Đề ôn tập trắc nghiệm
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lucky-wheel')}
              className="bg-[#0b1329] hover:bg-[#12233f] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-500/30 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-pink-300 transition-colors">
                Vòng quay may mắn
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-teaching')}
              className="bg-[#0b1329] hover:bg-[#20103b] p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-purple-200 group-hover:text-white transition-colors">
                Hỏi AI giải bài tập
              </span>
            </button>
          </div>
        </div>

        {/* 2 Detail Blocks for Student */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Block 1: Nhiệm vụ bài tập cần hoàn thành */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Nhiệm vụ học tập cần nộp</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-[#070d1e] border border-amber-500/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                      Toán học 7
                    </span>
                    <span className="text-xs font-bold text-white">Bài tập Hàm số bậc hai & Đồ thị</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    GV: Cô Nguyễn Thị Mai • Hạn chót: <span className="text-rose-400 font-semibold">23:59 Hôm nay</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shrink-0"
                >
                  Nộp bài ngay
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070d1e] border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      Tiếng Anh
                    </span>
                    <span className="text-xs font-bold text-white">Unit 7: Traffic & Road Safety Review</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Hạn chót: <span className="text-cyan-300 font-semibold">Thứ Bảy, 22/02/2026</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('assignments')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer shrink-0"
                >
                  Làm bài
                </button>
              </div>
            </div>
          </div>

          {/* Block 2: Thời khóa biểu hôm nay */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Tiết học lớp {activeClass?.name || '7A3'} hôm nay</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem cả tuần</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070d1e] border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center">
                    T1
                  </span>
                  <div>
                    <div className="font-bold text-white">Toán học (Đại số)</div>
                    <div className="text-[11px] text-slate-400">Cô Mai • Phòng A.306</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Đã học xong
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070d1e] border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center">
                    T2
                  </span>
                  <div>
                    <div className="font-bold text-white">Toán học (Hình học)</div>
                    <div className="text-[11px] text-slate-400">Cô Mai • Phòng A.306</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Đã học xong
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070d1e] border border-purple-500/30 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-400 font-mono font-bold flex items-center justify-center">
                    T3
                  </span>
                  <div>
                    <div className="font-bold text-white">Ngữ văn (Văn bản nhật dụng)</div>
                    <div className="text-[11px] text-slate-400">Thầy Nam • Phòng A.306</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                  Tiết tiếp theo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. DASHBOARD: PHỤ HUYNH (Parent)
  // --------------------------------------------------------------------------
  if (userRole === 'parent') {
    const parentName = currentUser?.name || 'Trần Văn Kiên';
    const studentChild = currentUser?.studentName || 'Trần Hải Đăng';

    return (
      <div className="space-y-5 animate-in fade-in">
        {/* Role Switcher */}
        {renderRoleSwitcherHUD()}

        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-[#0b1329] to-blue-950/50 p-5 rounded-2xl border border-amber-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
                <Heart className="w-4 h-4" />
                <span>SỔ LIÊN LẠC ĐIỆN TỬ GIA ĐÌNH & NHÀ TRƯỜNG</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Kính chào Phụ huynh <span className="text-amber-300">{parentName}</span>! 👋
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Theo dõi tình hình học tập em <span className="font-bold text-white">{studentChild}</span> • Lớp{' '}
                <span className="font-bold text-cyan-300">{activeClass?.name || '7A3'}</span> • GVCN: Cô Nguyễn Thị Mai
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('portal')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin cho GVCN</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards for Parent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Học lực của con */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Học lực con em</span>
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tabular-nums">8.6</span>
              <span className="text-xs text-slate-400 font-bold">/ 10</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 ml-auto">
                Xếp loại Tốt
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Hạnh kiểm: <span className="text-emerald-300 font-bold">Tốt</span> • Kỳ: Học kỳ II
            </div>
          </div>

          {/* Card 2: Chuyên cần hôm nay */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-emerald-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Chuyên cần hôm nay</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-300">Đã vào lớp</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                07:15 AM
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Có mặt đầy đủ, không vi phạm nề nếp
            </div>
          </div>

          {/* Card 3: Bài tập về nhà */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-blue-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Bài tập về nhà của con</span>
              <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono tabular-nums">2</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                Đang làm 1/2
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Hạn chót: 22/02 • Cần gia đình nhắc nhở
            </div>
          </div>

          {/* Card 4: Khen thưởng & Nề nếp */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Khen thưởng & Nề nếp</span>
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300 font-mono tabular-nums">+5 ⭐</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                Tuần 22
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Khen ngợi: Tích cực phát biểu, hỗ trợ bạn
            </div>
          </div>
        </div>

        {/* Tác vụ nhanh phụ huynh */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-400">
            TÁC VỤ SỔ LIÊN LẠC THƯỜNG DÙNG
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('grades')}
              className="bg-[#0b1329] hover:bg-[#1a1c3b] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Bảng điểm của con
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className="bg-[#0b1329] hover:bg-[#1a1c3b] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                Xem chuyên cần
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="bg-[#0b1329] hover:bg-[#1a1c3b] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                Bài tập về nhà
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className="bg-[#0b1329] hover:bg-[#1a1c3b] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Thời khóa biểu
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('portal')}
              className="bg-[#0b1329] hover:bg-[#1a1c3b] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-950/70 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                Cổng liên lạc trường
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-teaching')}
              className="bg-[#0b1329] hover:bg-[#20103b] p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-purple-200 group-hover:text-white transition-colors">
                AI Đồng hành cùng con
              </span>
            </button>
          </div>
        </div>

        {/* 2 Detail Blocks for Parent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Block 1: Nhận xét từ GVCN */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-amber-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Nhận xét gần nhất từ Giáo viên chủ nhiệm</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Cô Nguyễn Thị Mai</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#070d1e] border border-cyan-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">Đánh giá tuần 22: Môn Toán & Nề nếp</span>
                  <span className="text-[11px] text-slate-400">19/02/2026</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  &ldquo;Em Đăng tuần này rất chủ động xung phong lên bảng giải bài tập phần Phương trình bậc hai. Tác phong nghiêm túc, hòa đồng giúp đỡ bạn bè trong tổ.&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Khen thưởng: +3 Sao thi đua</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070d1e] border border-slate-800 text-xs text-slate-300">
                <div className="font-semibold text-slate-200 mb-1">Nhắc nhở gia đình:</div>
                <p className="text-slate-400 text-[11px]">
                  Kỳ thi Giữa học kì II dự kiến bắt đầu từ ngày 05/03/2026. Đề nghị gia đình phối hợp đôn đốc em ôn tập theo đề cương đã phát.
                </p>
              </div>
            </div>
          </div>

          {/* Block 2: Thông báo nhà trường */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-amber-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Thông báo từ Nhà trường & BGH</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('portal')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem bản tin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#070d1e] border border-cyan-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Kế hoạch Khám sức khỏe định kỳ học sinh</span>
                  <span className="text-[10px] text-cyan-400 font-bold">25/02/2026</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Trạm y tế phường phối hợp cùng Ban Giám Hiệu tổ chức khám mắt và thể lực cho học sinh Khối 7.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#070d1e] border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Họp Ban đại diện Cha mẹ học sinh học kỳ II</span>
                  <span className="text-[10px] text-slate-400">01/03/2026</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Kính mời đại diện cha mẹ học sinh các lớp tham dự tại Hội trường tầng 3 lúc 08:30 sáng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. DASHBOARD: BAN GIÁM HIỆU / ADMIN
  // --------------------------------------------------------------------------
  if (userRole === 'admin') {
    const adminName = currentUser?.name || 'Thầy Lê Văn Cường';

    return (
      <div className="space-y-5 animate-in fade-in">
        {/* Role Switcher */}
        {renderRoleSwitcherHUD()}

        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-purple-950/60 via-[#0b1329] to-cyan-950/50 p-5 rounded-2xl border border-purple-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mb-1">
                <Building className="w-4 h-4" />
                <span>TRUNG TÂM CHỈ ĐẠO & ĐIỀU HÀNH BAN GIÁM HIỆU</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Kính chào Thầy <span className="text-purple-300">{adminName}</span>! 👋
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Trường THCS Nguyễn Lương Bằng • Tổng quan hệ thống toàn trường • Năm học 2025 - 2026
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <School className="w-4 h-4" />
                <span>Xem tất cả 18 lớp</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards for Admin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Học sinh toàn trường */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Học sinh toàn trường</span>
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono tabular-nums">620</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                18 Lớp học
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Khối 6: 160 • Khối 7: 155 • Khối 8: 152 • Khối 9: 153
            </div>
          </div>

          {/* Card 2: Chuyên cần toàn trường hôm nay */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-emerald-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Chuyên cần toàn trường hôm nay</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono tabular-nums">98.6%</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                611 / 620 HS
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Vắng có phép: 9 • Vắng không phép: 0
            </div>
          </div>

          {/* Card 3: Tiến độ sổ điểm */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Tiến độ nhập sổ điểm</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-cyan-300 font-mono tabular-nums">86.4%</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Giữa Kì II
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              16/18 lớp đã hoàn tất nhập điểm thường xuyên
            </div>
          </div>

          {/* Card 4: Cán bộ giáo viên */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-rose-500/20 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Cán bộ & Giáo viên</span>
              <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white font-mono tabular-nums">36</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                100% Đạt chuẩn
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              GV Chủ nhiệm: 18 • GV Bộ môn: 18
            </div>
          </div>
        </div>

        {/* Tác vụ nhanh Ban Giám Hiệu */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-purple-400">
            TÁC VỤ QUẢN TRỊ & ĐIỀU HÀNH NHANH
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className="bg-[#0b1329] hover:bg-[#1a1438] p-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <School className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Quản lý các lớp
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="bg-[#0b1329] hover:bg-[#1a1438] p-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Học sinh toàn trường
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="bg-[#0b1329] hover:bg-[#1a1438] p-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
                Phổ điểm các khối
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className="bg-[#0b1329] hover:bg-[#1a1438] p-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                Thời khóa biểu trường
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className="bg-[#0b1329] hover:bg-[#1a1438] p-4 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                Nhật ký kiểm soát
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-teaching')}
              className="bg-[#0b1329] hover:bg-[#20103b] p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-purple-200 group-hover:text-white transition-colors">
                AI Quản lý trường học
              </span>
            </button>
          </div>
        </div>

        {/* 2 Detail Blocks for Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Block 1: Khối lớp & Thống kê */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Tình hình các khối lớp toàn trường</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('classes')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070d1e] border border-cyan-500/20 text-xs">
                <div>
                  <div className="font-bold text-white">Khối 6 (4 lớp: 6A1, 6A2, 6A3, 6A4)</div>
                  <div className="text-[11px] text-slate-400">160 học sinh • Chuyên cần hôm nay: 99.3%</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Ổn định
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070d1e] border border-emerald-500/20 text-xs">
                <div>
                  <div className="font-bold text-white">Khối 7 (5 lớp: 7A1, 7A2, 7A3, 7A4, 7A5)</div>
                  <div className="text-[11px] text-slate-400">155 học sinh • Chuyên cần hôm nay: 98.7%</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Tốt
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070d1e] border border-amber-500/20 text-xs">
                <div>
                  <div className="font-bold text-white">Khối 8 (5 lớp: 8A1, 8A2, 8A3, 8A4, 8A5)</div>
                  <div className="text-[11px] text-slate-400">152 học sinh • Chuyên cần hôm nay: 98.0%</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                  Ổn định
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070d1e] border border-purple-500/20 text-xs">
                <div>
                  <div className="font-bold text-white">Khối 9 (4 lớp: 9A1, 9A2, 9A3, 9A4)</div>
                  <div className="text-[11px] text-slate-400">153 học sinh • Tập trung ôn thi vào 10</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                  Cao điểm
                </span>
              </div>
            </div>
          </div>

          {/* Block 2: Nhật ký kiểm soát hệ thống */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-purple-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Nhật ký hoạt động giáo viên & chuyên môn</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem toàn bộ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-[#070d1e] border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.details || log.targetName}</div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">Chưa có ghi nhận hệ thống nào</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. DASHBOARD: GIÁO VIÊN (Teacher - Mặc định)
  // --------------------------------------------------------------------------
  const teacherName = currentUser?.name || teacher.name;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Role Switcher */}
      {renderRoleSwitcherHUD()}

      {/* 1. Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-1">
        <div className="flex items-center gap-1.5 flex-wrap text-slate-300">
          <span className="text-cyan-400 font-bold">Tổng quan</span>
          <span className="text-slate-500">›</span>
          <span className="text-slate-300 font-medium">Bàn làm việc giáo viên</span>
          <span className="text-slate-500">•</span>
          <span className="text-white font-bold">Xin chào, {teacherName}!</span>
          <span className="text-slate-400 font-normal">
            (Hôm nay là {todayFormatted} - Năm học 2025 - 2026)
          </span>
        </div>
      </div>

      {/* 2. 4 Metrics KPI Cards exact to Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng học sinh phụ trách */}
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Tổng học sinh phụ trách</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono tabular-nums">
              {totalStudents}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-medium">
            Thuộc {classes.length} lớp học
          </div>
        </div>

        {/* Card 2: Có mặt hôm nay */}
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Có mặt hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono tabular-nums">
              {todayAttendance.recorded ? todayAttendance.present : 32}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              96.8% chuyên cần
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-medium">
            Vắng: {todayAttendance.unexcused} • Đi muộn: {todayAttendance.late}
          </div>
        </div>

        {/* Card 3: Bài tập chờ chấm */}
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Bài tập chờ chấm</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono tabular-nums">
              {pendingAssignments.length || 1}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-medium truncate">
            Bài tập Hàm số bậc hai
          </div>
        </div>

        {/* Card 4: Cảnh báo học tập & nề nếp */}
        <div className="bg-[#0b1329] p-5 rounded-2xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Cảnh báo học tập & nề nếp</span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-300 font-mono tabular-nums">
              3
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-medium">
            Cần đôn đốc nhắc nhở
          </div>
        </div>
      </div>

      {/* 3. Tác vụ nhanh thường dùng */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
          TÁC VỤ NHANH THƯỜNG DÙNG
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Thời khóa biểu */}
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className="bg-[#0b1329] hover:bg-[#121f3f] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Thời khóa biểu
            </span>
          </button>

          {/* 2. Điểm danh */}
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className="bg-[#0b1329] hover:bg-[#121f3f] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
              Điểm danh
            </span>
          </button>

          {/* 3. Giao bài tập */}
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="bg-[#0b1329] hover:bg-[#121f3f] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Giao bài tập
            </span>
          </button>

          {/* 4. Nhập sổ điểm */}
          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className="bg-[#0b1329] hover:bg-[#121f3f] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-950/70 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
              Nhập sổ điểm
            </span>
          </button>

          {/* 5. Vòng quay */}
          <button
            type="button"
            onClick={() => setActiveTab('lucky-wheel')}
            className="bg-[#0b1329] hover:bg-[#121f3f] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
              Vòng quay
            </span>
          </button>

          {/* 6. Hỏi AI mọi thứ */}
          <button
            type="button"
            onClick={() => setActiveTab('ai-teaching')}
            className="bg-[#0b1329] hover:bg-[#1c1236] p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all text-center group cursor-pointer shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-purple-200 group-hover:text-white transition-colors">
              Hỏi AI mọi thứ
            </span>
          </button>
        </div>
      </div>

      {/* 4. Lớp học đang phụ trách */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Lớp học đang phụ trách</span>
            <span className="text-xs text-slate-400 font-normal">({classes.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div
              key={cls.id}
              onClick={() => {
                setActiveClassId(cls.id);
                setActiveTab('classes');
              }}
              className="bg-[#0b1329] hover:bg-[#101b38] p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all cursor-pointer shadow-md group relative flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Khối {cls.grade} • {cls.room || 'Phòng A.306'}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-cyan-400/20"
                    style={{ backgroundColor: cls.color || '#06b6d4' }}
                  />
                </div>

                {/* Class Title */}
                <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                  {cls.name.startsWith('Lớp') ? cls.name : `Lớp ${cls.name}`}
                </h4>

                <div className="text-xs text-slate-300 space-y-0.5 mb-3">
                  <div className="truncate">GVCN: <span className="font-semibold text-white">{cls.teacherName || teacherName}</span></div>
                  <div className="text-[11px] text-slate-400">
                    Sĩ số: <span className="font-mono text-cyan-300 font-bold">{cls.studentCount || 31} học sinh</span> • Mã: <span className="font-mono">CLS-{cls.name}-2026</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>Mở không gian lớp học</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
