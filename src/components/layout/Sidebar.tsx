import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  School,
  BookCheck,
  Calendar,
  Award,
  FileSpreadsheet,
  BookOpen,
  HelpCircle,
  Sparkles,
  UserCheck,
  Clock,
  Shuffle,
  BarChart3,
  History,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MessagesSquare,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface NavItem {
  id: string;
  uniqueKey?: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  highlight?: boolean;
}

interface NavSection {
  key: string;
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile = false, onCloseMobile }) => {
  const { activeTab, setActiveTab, classStudents, activeClass, userRole, currentUser, classes } = useApp();

  // State for collapsible sections: LỚP HỌC, DẠY & HỌC, THEO DÕI & ĐÁNH GIÁ, TIỆN ÍCH LỚP HỌC
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('smart-class:sidebar-sections');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'classes': false,
      'teaching': false,
      'monitoring': false,
      'tools': false,
      'student_study': false,
      'student_results': false,
      'student_fun': false,
      'parent_records': false,
      'parent_school': false,
      'admin_mgmt': false,
      'admin_academics': false,
      'admin_system': false
    };
  });

  // Global collapsed mode (compact icon sidebar vs expanded)
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem('smart-class:sidebar-compact') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('smart-class:sidebar-sections', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleCompact = () => {
    setIsCompact(prev => {
      const next = !prev;
      try {
        localStorage.setItem('smart-class:sidebar-compact', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  // Các mục Sidebar tùy biến linh hoạt theo VAI TRÒ (Role-based Navigation)
  const sections: NavSection[] = useMemo(() => {
    // 1. Role = HỌC SINH (Student)
    if (userRole === 'student') {
      return [
        {
          key: 'student_study',
          title: 'GÓC HỌC TẬP CỦA EM',
          items: [
            { id: 'assignments', uniqueKey: 'student-assignments', label: 'Bài tập cần nộp', icon: <BookOpen className="w-4 h-4 text-amber-400" />, badge: 2 },
            { id: 'timetable', uniqueKey: 'student-timetable', label: 'Thời khóa biểu lớp em', icon: <Calendar className="w-4 h-4 text-cyan-300" /> },
            { id: 'quizzes', uniqueKey: 'student-quizzes', label: 'Ngân hàng câu hỏi', icon: <HelpCircle className="w-4 h-4 text-violet-400" /> },
            { id: 'ai-teaching', uniqueKey: 'student-ai', label: 'Hỏi AI bài tập', icon: <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />, badge: 'AI', highlight: true }
          ]
        },
        {
          key: 'student_results',
          title: 'KẾT QUẢ & TIẾN BỘ',
          items: [
            { id: 'grades', label: 'Bảng điểm của em', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> },
            { id: 'attendance', label: 'Chuyên cần của em', icon: <BookCheck className="w-4 h-4 text-blue-400" /> },
            { id: 'behavior', label: 'Ngôi sao thi đua ⭐', icon: <Award className="w-4 h-4 text-amber-300" />, badge: '⭐ 18' }
          ]
        },
        {
          key: 'student_fun',
          title: 'VUI HỌC & BẢNG TIN',
          items: [
            { id: 'lucky-wheel', label: 'Vòng quay may mắn', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
            { id: 'timer', label: 'Đồng hồ tự học', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
            { id: 'portal', label: 'Bản tin hoạt động lớp', icon: <MessagesSquare className="w-4 h-4 text-teal-300" /> }
          ]
        }
      ];
    }

    // 2. Role = PHỤ HUYNH (Parent)
    if (userRole === 'parent') {
      return [
        {
          key: 'parent_records',
          title: 'SỔ LIÊN LẠC ĐIỆN TỬ',
          items: [
            { id: 'grades', label: 'Bảng điểm con em', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> },
            { id: 'attendance', label: 'Điểm danh chuyên cần', icon: <BookCheck className="w-4 h-4 text-blue-400" /> },
            { id: 'behavior', label: 'Nề nếp & Khen thưởng con', icon: <Award className="w-4 h-4 text-amber-300" /> },
            { id: 'assignments', label: 'Bài tập về nhà của con', icon: <BookOpen className="w-4 h-4 text-amber-400" />, badge: 2 }
          ]
        },
        {
          key: 'parent_school',
          title: 'NHÀ TRƯỜNG & KẾT NỐI',
          items: [
            { id: 'timetable', label: 'Thời khóa biểu của con', icon: <Calendar className="w-4 h-4 text-cyan-300" /> },
            { id: 'portal', label: 'Bản tin & Thông báo trường', icon: <MessagesSquare className="w-4 h-4 text-teal-300" /> },
            { id: 'ai-teaching', label: 'Hỏi AI đồng hành cùng con', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: 'AI', highlight: true }
          ]
        }
      ];
    }

    // 3. Role = BAN GIÁM HIỆU / ADMIN
    if (userRole === 'admin') {
      return [
        {
          key: 'admin_mgmt',
          title: 'QUẢN TRỊ TOÀN TRƯỜNG',
          items: [
            { id: 'classes', label: 'Tất cả các lớp học', icon: <School className="w-4 h-4 text-cyan-400" />, badge: `${classes.length} Lớp` },
            { id: 'students', label: 'Học sinh toàn trường', icon: <Users className="w-4 h-4 text-teal-400" /> },
            { id: 'timetable', label: 'Thời khóa biểu toàn trường', icon: <Calendar className="w-4 h-4 text-cyan-300" /> }
          ]
        },
        {
          key: 'admin_academics',
          title: 'CHUYÊN MÔN & PHỔ ĐIỂM',
          items: [
            { id: 'reports', label: 'Báo cáo phổ điểm các khối', icon: <BarChart3 className="w-4 h-4 text-rose-400" /> },
            { id: 'grades', label: 'Sổ điểm điện tử trường', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> },
            { id: 'attendance', label: 'Chuyên cần toàn trường', icon: <UserCheck className="w-4 h-4 text-sky-400" /> },
            { id: 'quizzes', uniqueKey: 'admin-quizzes', label: 'Ngân hàng câu hỏi', icon: <HelpCircle className="w-4 h-4 text-violet-400" /> }
          ]
        },
        {
          key: 'admin_system',
          title: 'HỆ THỐNG & KẾT NỐI',
          items: [
            { id: 'audit', label: 'Nhật ký hệ thống', icon: <History className="w-4 h-4 text-amber-400" /> },
            { id: 'portal', label: 'Bản tin & Cổng gia đình', icon: <MessagesSquare className="w-4 h-4 text-teal-300" /> },
            { id: 'ai-teaching', label: 'AI Trợ lý quản lý', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: 'AI', highlight: true }
          ]
        }
      ];
    }

    // 4. Role = GIÁO VIÊN (Teacher - Mặc định)
    return [
      {
        key: 'classes',
        title: 'LỚP HỌC',
        items: [
          {
            id: 'classes',
            label: activeClass ? (activeClass.name.startsWith('Lớp') ? activeClass.name : `Lớp ${activeClass.name}`) : 'Lớp của tôi',
            icon: (
              <div
                className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black text-slate-950 shadow-xs"
                style={{ backgroundColor: activeClass?.color || '#06b6d4' }}
              >
                {activeClass?.name?.replace(/[^0-9]/g, '').slice(0, 2) || (
                  <School className="w-3.5 h-3.5 text-slate-950" />
                )}
              </div>
            ),
            badge: activeClass?.grade ? `Khối ${activeClass.grade}` : undefined
          },
          {
            id: 'students',
            label: 'Học sinh',
            icon: <Users className="w-4 h-4 text-teal-400" />,
            badge: classStudents.length > 0 ? `${classStudents.length} HS` : undefined
          },
          { id: 'attendance', label: 'Điểm danh', icon: <BookCheck className="w-4 h-4 text-blue-400" /> },
          { id: 'timetable', label: 'Thời khóa biểu', icon: <Calendar className="w-4 h-4 text-cyan-300" /> }
        ]
      },
      {
        key: 'teaching',
        title: 'DẠY & HỌC',
        items: [
          { id: 'quizzes', uniqueKey: 'teaching-quizzes', label: 'Ngân hàng câu hỏi', icon: <HelpCircle className="w-4 h-4 text-violet-400" /> },
          { id: 'assignments', uniqueKey: 'teaching-assignments', label: 'Giao bài tập', icon: <BookOpen className="w-4 h-4 text-amber-400" />, badge: 4 },
          { id: 'assignments', uniqueKey: 'teaching-autograding', label: 'Chấm bài tự động', icon: <Award className="w-4 h-4 text-emerald-400" /> },
          { id: 'quizzes', uniqueKey: 'teaching-digitaldocs', label: 'Tài liệu số', icon: <FileText className="w-4 h-4 text-blue-400" /> },
          { id: 'ai-teaching', uniqueKey: 'teaching-ai', label: 'AI Hỗ trợ', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: 'AI', highlight: true }
        ]
      },
      {
        key: 'monitoring',
        title: 'THEO DÕI & ĐÁNH GIÁ',
        items: [
          { id: 'grades', label: 'Sổ điểm điện tử', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> },
          { id: 'attendance', label: 'Chuyên cần', icon: <UserCheck className="w-4 h-4 text-sky-400" /> },
          { id: 'behavior', label: 'Hành vi & Nề nếp', icon: <Award className="w-4 h-4 text-amber-300" /> },
          { id: 'reports', label: 'Cảnh báo thông minh', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 3 }
        ]
      },
      {
        key: 'tools',
        title: 'TIỆN ÍCH LỚP HỌC',
        items: [
          { id: 'lucky-wheel', label: 'Vòng quay may mắn', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
          { id: 'group-generator', label: 'Chia nhóm ngẫu nhiên', icon: <Shuffle className="w-4 h-4 text-cyan-400" /> },
          { id: 'timer', label: 'Đồng hồ & Timer', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
          { id: 'random-student', label: 'Gọi nhanh ngẫu nhiên', icon: <UserCheck className="w-4 h-4 text-sky-400" /> }
        ]
      }
    ];
  }, [userRole, activeClass, classStudents.length, classes.length]);

  const sidebarContent = (
    <div
      className={`${
        isCompact ? 'w-16' : 'w-64'
      } bg-[#0b1329] border-r border-cyan-500/25 flex flex-col shrink-0 h-full overflow-hidden select-none text-slate-100 transition-all duration-200 relative shadow-2xl`}
    >
      {/* Nút thu nhỏ / phóng to toàn bộ Sidebar bằng mũi tên */}
      <div className="hidden md:flex justify-end p-2 border-b border-cyan-500/20 bg-[#070d1e]/80">
        <button
          type="button"
          onClick={toggleCompact}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 rounded-lg border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
          title={isCompact ? 'Phóng to mở rộng thanh bên' : 'Thu nhỏ thanh bên (gọn gàng)'}
        >
          {isCompact ? (
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thu nhỏ thanh bên</span>
            </>
          )}
        </button>
      </div>

      {/* Current Active Class context banner */}
      {!isCompact ? (
        <div className="p-3 m-3 mb-2 bg-[#070d1e] rounded-xl border border-cyan-500/30 shadow-md">
          <div className="text-[10px] uppercase font-extrabold text-cyan-300 tracking-wider flex items-center justify-between">
            <span className="drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">
              {userRole === 'student'
                ? 'GÓC HỌC TẬP HỌC SINH'
                : userRole === 'parent'
                ? 'SỔ LIÊN LẠC CON EM'
                : userRole === 'admin'
                ? 'BAN GIÁM HIỆU NHÀ TRƯỜNG'
                : 'KHÔNG GIAN LỚP HỌC'}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
              {userRole === 'admin' ? `${classes.length} Lớp` : `${classStudents.length} HS`}
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-2 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              style={{ backgroundColor: activeClass?.color || '#06b6d4' }}
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-extrabold text-white block truncate drop-shadow-sm">
                {userRole === 'admin'
                  ? 'THCS Nguyễn Lương Bằng'
                  : `Lớp ${activeClass?.name || '6A1'}`}
              </span>
              <span className="text-[11px] text-cyan-200/80 block truncate font-medium">
                {userRole === 'student'
                  ? `Em: ${currentUser?.name || 'Học sinh'}`
                  : userRole === 'parent'
                  ? `Con: ${currentUser?.studentName || 'Học sinh'}`
                  : userRole === 'admin'
                  ? `Quản trị ${classes.length} lớp học`
                  : `${activeClass?.subject || 'Toán học'} · ${activeClass?.room || 'Phòng 204'}`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 text-center my-2">
          <span
            className="w-4 h-4 rounded-full inline-block ring-2 ring-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            style={{ backgroundColor: activeClass?.color || '#06b6d4' }}
            title={`Lớp ${activeClass?.name}`}
          />
        </div>
      )}

      {/* Top Main Navigation (Tổng quan) */}
      <div className="px-3 pt-1">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`w-full flex items-center ${
            isCompact ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            activeTab === 'dashboard'
              ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-cyan-500/30 ring-1 ring-cyan-300'
              : 'text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/20'
          }`}
          title="Tổng quan bàn làm việc"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-slate-950' : 'text-cyan-400'}`} />
            {!isCompact && <span>Tổng quan</span>}
          </div>
        </button>
      </div>

      {/* Nav Sections with Collapsible Arrow Buttons */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3.5 scrollbar-thin">
        {sections.map(section => {
          const isCollapsed = collapsedSections[section.key];

          return (
            <div key={section.key} className="space-y-1">
              {/* Header của từng phần: có nút mũi tên thu gọn / phóng to */}
              {!isCompact ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 hover:text-white hover:bg-cyan-950/30 transition-all cursor-pointer group"
                  title={isCollapsed ? `Bấm mũi tên để phóng to / mở rộng phần ${section.title}` : `Bấm mũi tên để thu nhỏ phần ${section.title}`}
                >
                  <div className="flex items-center gap-1.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">
                    <span>{section.title}</span>
                    {isCollapsed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono normal-case">
                        {section.items.length}
                      </span>
                    )}
                  </div>

                  {/* Nút mũi tên phóng to / thu nhỏ */}
                  <span className="p-0.5 rounded text-cyan-400 group-hover:text-cyan-200 group-hover:bg-cyan-900/40 transition-transform">
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                    )}
                  </span>
                </button>
              ) : (
                <div className="w-full text-center py-1">
                  <div className="w-6 h-0.5 bg-cyan-500/30 mx-auto rounded" />
                </div>
              )}

              {/* Danh sách mục trong phần (ẩn nếu thu nhỏ) */}
              {!isCollapsed && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {section.items.map((item, idx) => {
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.uniqueKey || `${section.key}-${item.id}-${idx}`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center ${
                          isCompact ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                        } rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-950/80 text-white font-extrabold border-l-2 border-cyan-400 ring-1 ring-cyan-500/30 shadow-xs'
                            : item.highlight
                            ? 'text-pink-200 hover:text-white hover:bg-pink-950/30 border border-pink-500/20'
                            : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-semibold'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={isActive ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]' : ''}>
                            {item.icon}
                          </span>
                          {!isCompact && (
                            <span className="truncate drop-shadow-xs">{item.label}</span>
                          )}
                        </div>

                        {!isCompact && item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              isActive
                                ? 'bg-cyan-400/25 text-cyan-200 border border-cyan-400/40 shadow-xs'
                                : item.highlight
                                ? 'bg-pink-950 text-pink-300 border border-pink-500/30'
                                : 'bg-slate-900 text-cyan-300 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer subtle brand - Exact Match to Image 2 */}
      {!isCompact && (
        <div className="p-3 border-t border-cyan-500/20 bg-[#070d1e]/80 text-[11px] text-slate-300">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
            <span>Năm học 2025 – 2026</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">2026</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Học kỳ 1 • Tuần học 06</span>
            <span className="text-cyan-300 font-semibold truncate ml-1">THCS Nguyễn Lương Bằng</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Fixed/Sticky Sidebar: Does not move when scrolling main content */}
      <aside className="hidden md:flex shrink-0 sticky top-[53px] h-[calc(100vh-53px)] z-20 self-start">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
