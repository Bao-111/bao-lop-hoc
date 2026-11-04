import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Tv,
  Bell,
  ChevronDown,
  User,
  Shield,
  Layers,
  Sparkles,
  BookCheck,
  Calendar,
  Compass,
  Plus,
  ArrowLeft,
  Clock,
  BookOpen,
  Cloud,
  LogOut,
  LogIn,
  UserPlus,
  GraduationCap
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { TeacherProfileModal } from './TeacherProfileModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { AuthModal } from '../auth/AuthModal';
import { Avatar } from '../ui/Avatar';
import { ROLE_DETAILS } from '../../services/authPresets';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    teacher,
    classes,
    activeClassId,
    activeClass,
    setActiveClassId,
    projectorMode,
    toggleProjectorMode,
    auditLogs,
    activeTab,
    setActiveTab,
    firebaseUser,
    currentUser,
    userRole,
    isAuthModalOpen,
    setIsAuthModalOpen,
    logout,
    switchRole
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedSwitchRole, setSelectedSwitchRole] = useState<UserRole | undefined>(undefined);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0b1329] border-b border-cyan-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-slate-100">
        {/* Zone 1: Mobile Hamburger + Back button + Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Mở menu danh mục"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Quick Back Button in Header when not on dashboard */}
          {activeTab !== 'dashboard' && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Quay về Bàn làm việc"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về</span>
            </button>
          )}

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            {/* Prestigous App Emblem / Avatar - THCS Nguyễn Lương Bằng */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 p-0.5 shadow-md shadow-cyan-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#070d1e] flex items-center justify-center relative overflow-hidden">
                <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 64 64" fill="none">
                  <defs>
                    <linearGradient id="crestHdr" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <path d="M32 14 L50 23 L32 32 L14 23 Z" fill="url(#crestHdr)" />
                  <path d="M20 28 L20 40 C20 46 44 46 44 40 L44 28" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  <path d="M50 24 L50 38" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="50" cy="40" r="2.5" fill="#f59e0b" />
                  <path d="M24 45 Q32 41 40 45" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-tight drop-shadow-sm">
                Smart Class
              </span>
              <span className="text-[11px] text-cyan-300 font-bold hidden sm:block leading-none drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                Trường THCS Nguyễn Lương Bằng
              </span>
            </div>
          </div>

          {/* Quick Active Class Switcher */}
          <div className="relative ml-1 sm:ml-4">
            <button
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-cyan-500/20 bg-slate-900/80 hover:bg-slate-800 transition-colors text-slate-200 cursor-pointer"
              aria-label="Chọn lớp đang thao tác"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-cyan-400/30"
                style={{ backgroundColor: activeClass?.color || '#06b6d4' }}
              />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">
                Lớp {activeClass?.name || 'Chọn lớp'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isClassDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsClassDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-56 bg-[#0b1329] rounded-xl shadow-2xl border border-cyan-500/30 py-1.5 z-40 animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Chuyển lớp thao tác
                  </div>
                  {classes.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setActiveClassId(cls.id);
                        setIsClassDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 transition-colors cursor-pointer ${
                        cls.id === activeClassId ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-l-2 border-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-1 ring-cyan-400/30"
                          style={{ backgroundColor: cls.color }}
                        />
                        <span>{cls.name} ({cls.subject})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{cls.studentCount || 0} HS</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Global Search & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-900 hover:text-slate-200 rounded-lg transition-colors border border-cyan-500/20 w-36 sm:w-56 justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Tìm học sinh, lớp...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-cyan-400/80 bg-slate-800 border border-slate-700 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Quick Actions & Hỏi AI: Ẩn khi đang ở Tổng quan (để tránh lặp lại), hiển thị đầy đủ ở các trang khác */}
          {activeTab !== 'dashboard' && (
            <>
              {/* Direct Hỏi AI Mọi Thứ Button */}
              <button
                type="button"
                onClick={() => setActiveTab('ai-teaching')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                  activeTab === 'ai-teaching'
                    ? 'bg-purple-600 text-white shadow-purple-500/30 ring-1 ring-purple-300'
                    : 'text-purple-200 bg-[#1e1338] hover:bg-[#2c1b52] border border-purple-500/40 hover:border-purple-400'
                }`}
                title="Hỏi AI mọi thứ về sư phạm, chuyên môn, giải bài tập, giáo án"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden sm:inline">Hỏi AI Mọi Thứ</span>
                <span className="sm:hidden">Hỏi AI</span>
              </button>

              {/* Quick Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs cursor-pointer"
                  aria-label="Thao tác nhanh"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Thao tác nhanh</span>
                </button>

                {isQuickActionsOpen && (
                  <div
                    className="absolute right-0 mt-1 w-56 bg-[#0b1329] rounded-xl shadow-2xl border border-cyan-500/30 py-1.5 z-40 animate-in fade-in"
                    onMouseLeave={() => setIsQuickActionsOpen(false)}
                  >
                    <div className="px-3 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Phím tắt giảng dạy
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('timetable');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Thời khóa biểu</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('attendance');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <BookCheck className="w-4 h-4 text-emerald-400" />
                      <span>Điểm danh hôm nay</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('assignments');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>Giao bài tập</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('grades');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Nhập điểm học sinh</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('lucky-wheel');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Vòng quay may mắn</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('timer');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>Đồng hồ bấm giờ lớp</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('ai-teaching');
                        setIsQuickActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-purple-300 hover:bg-slate-800 transition-colors cursor-pointer border-t border-slate-800/80 mt-1 pt-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="font-bold text-white">Hỏi AI Mọi Thứ</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Projector Mode Toggle */}
          <button
            onClick={toggleProjectorMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              projectorMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                : 'bg-slate-900/80 text-slate-300 border-cyan-500/20 hover:bg-slate-800 hover:text-white'
            }`}
            title="Chế độ máy chiếu lớp học (Phím ESC để thoát)"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">{projectorMode ? 'Đang chiếu' : 'Máy chiếu'}</span>
          </button>
        </div>

        {/* Zone 3: Notifications, Backup, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications / Audit log trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative cursor-pointer"
              aria-label="Thông báo & Nhật ký"
            >
              <Bell className="w-4 h-4" />
              {auditLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0b1329]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-1 w-80 bg-[#0b1329] rounded-xl shadow-2xl border border-cyan-500/30 py-2 z-40 animate-in fade-in"
                onMouseLeave={() => setIsNotificationsOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Nhật ký hoạt động</span>
                  <span className="text-[10px] text-cyan-400/80">Gần nhất</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">Chưa có ghi nhận nào</div>
                  ) : (
                    auditLogs.slice(0, 6).map(log => (
                      <div key={log.id} className="p-3 text-xs hover:bg-slate-800/50 transition-colors">
                        <div className="font-semibold text-slate-200">{log.action}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{log.details || log.targetName}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Firebase Cloud Sync trigger */}
          <button
            onClick={() => setIsBackupOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              firebaseUser
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40'
            }`}
            title="Firebase Cloud Database & Đồng bộ dữ liệu"
          >
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Firebase Cloud</span>
            <span className={`w-1.5 h-1.5 rounded-full ${firebaseUser ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
          </button>

          {/* Backup / Restore trigger */}
          <button
            onClick={() => setIsBackupOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Sao lưu & An toàn dữ liệu"
          >
            <Shield className="w-4 h-4 text-slate-400" />
          </button>

          {/* User Account / Role Trigger & Dropdown */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-[#142244] border border-cyan-500/25 transition-all cursor-pointer shadow-xs group"
                aria-label="Tài khoản và vai trò"
              >
                <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size="sm" />
                <div className="text-left hidden lg:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase border ${
                        ROLE_DETAILS[userRole]?.badgeBg || 'bg-cyan-950'
                      } ${ROLE_DETAILS[userRole]?.badgeColor || 'text-cyan-300'} ${
                        ROLE_DETAILS[userRole]?.badgeBorder || 'border-cyan-500/40'
                      }`}
                    >
                      {ROLE_DETAILS[userRole]?.label || userRole}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5 truncate max-w-[130px]">
                    {currentUser.role === 'teacher'
                      ? currentUser.subject || 'Giáo viên'
                      : currentUser.role === 'student'
                      ? `Học sinh ${currentUser.studentCode || ''}`
                      : currentUser.role === 'parent'
                      ? `Phụ huynh em ${currentUser.studentName || ''}`
                      : 'Ban Giám Hiệu'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-transform" />
              </button>

              {/* Account Dropdown Menu */}
              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/35 py-2.5 z-40 animate-in fade-in divide-y divide-slate-800/80">
                    {/* User profile card */}
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-white truncate">{currentUser.name}</div>
                          <div className="text-[11px] text-cyan-300/90 font-medium truncate">{currentUser.email}</div>
                          <div className="mt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                                ROLE_DETAILS[userRole]?.badgeBg || 'bg-cyan-950'
                              } ${ROLE_DETAILS[userRole]?.badgeColor || 'text-cyan-300'} ${
                                ROLE_DETAILS[userRole]?.badgeBorder || 'border-cyan-500/40'
                              }`}
                            >
                              Vai trò: {ROLE_DETAILS[userRole]?.label || userRole}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                        Đổi vai trò nhanh (App đổi giao diện tức thì):
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(r => {
                          const isSel = userRole === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setSelectedSwitchRole(r);
                                setAuthModalMode('login');
                                setIsAuthModalOpen(true);
                                setIsUserDropdownOpen(false);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSel
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/50 ring-1 ring-cyan-500/30'
                                  : 'bg-[#070d1e] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                              }`}
                              title={`Chuyển sang tài khoản ${ROLE_DETAILS[r].label} (Yêu cầu mật khẩu)`}
                            >
                              <span>{ROLE_DETAILS[r].label}</span>
                              {isSel && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="px-2 py-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>Hồ sơ cá nhân & Thông tin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-emerald-400" />
                        <span>Đổi tài khoản / Đăng nhập khác</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('register');
                          setIsAuthModalOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-purple-400" />
                        <span>Đăng ký tài khoản mới</span>
                      </button>
                    </div>

                    {/* Logout button */}
                    <div className="px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Đăng xuất khỏi hệ thống</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#142244] border border-cyan-500/30 text-slate-200 hover:bg-[#1a2d5a] transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <TeacherProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <BackupRestoreModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
      <AuthModal
        key={`${isAuthModalOpen}-${authModalMode}`}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};
