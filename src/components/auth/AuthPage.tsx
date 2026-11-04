import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppUser } from '../../types';
import { DEMO_USERS, ROLE_DETAILS } from '../../services/authPresets';
import {
  LogIn,
  UserPlus,
  Shield,
  GraduationCap,
  Users,
  Building,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  Eye,
  EyeOff,
  School,
  FileSpreadsheet,
  Award,
  Calendar
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const {
    loginAsRole,
    loginWithCredentials,
    registerUser,
    loginGoogle,
    classes
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSubject, setRegSubject] = useState('Toán học');
  const [regClassId, setRegClassId] = useState(classes[0]?.id || 'class-7a3');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowRegisterPrompt(false);

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || !loginPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = loginWithCredentials(cleanEmail, loginPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Email hoặc mật khẩu không chính xác.');
        if (res.message?.includes('chưa tồn tại')) {
          setShowRegisterPrompt(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ (ví dụ: email@gmail.com).');
      return;
    }

    if (!regPassword) {
      setErrorMsg('Vui lòng nhập Mật khẩu.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự để bảo mật an toàn.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (selectedRole === 'parent') {
      if (!regStudentName.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên của con em để kết nối sổ liên lạc.');
        return;
      }
      if (!regPhone.trim()) {
        setErrorMsg('Vui lòng nhập số điện thoại liên hệ của phụ huynh.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newUserPayload: Omit<AppUser, 'id'> = {
        name: trimmedName,
        email: trimmedEmail,
        role: selectedRole,
        schoolName: 'Trường THCS Nguyễn Lương Bằng',
        academicYear: '2025 - 2026',
        linkedClassId: regClassId || classes[0]?.id || 'class-7a3',
        subject: selectedRole === 'teacher' ? (regSubject.trim() || 'Toán học') : undefined,
        studentName: selectedRole === 'parent' ? regStudentName.trim() : undefined,
        studentCode: selectedRole === 'student' ? (regStudentCode.trim() || `HS-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        phone: selectedRole === 'parent' ? regPhone.trim() : undefined
      };

      const res = registerUser(newUserPayload, regPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Không thể đăng ký tài khoản lúc này.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoLogin = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setLoginEmail(user.email);
    setLoginPassword('123456');
    setErrorMsg(null);
    setShowRegisterPrompt(false);
  };

  const handleFillDemoRegister = () => {
    setErrorMsg(null);
    const rand = Math.floor(100 + Math.random() * 900);
    if (selectedRole === 'teacher') {
      setRegName(`Cô Hoàng Thu Hằng ${rand}`);
      setRegEmail(`hanght${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegSubject('Tiếng Anh');
    } else if (selectedRole === 'student') {
      setRegName(`Em Đỗ Minh Quân ${rand}`);
      setRegEmail(`minhquan${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentCode(`HS-07${rand.toString().slice(0, 2)}`);
    } else if (selectedRole === 'parent') {
      setRegName(`Ông Vũ Quốc Tuấn ${rand}`);
      setRegEmail(`quoctuan${rand}@gmail.com`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentName('Vũ Minh Châu');
      setRegPhone('0912 888 999');
    } else {
      setRegName(`Thầy Phạm Văn Bình ${rand}`);
      setRegEmail(`bgh${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
    }
  };

  const roleIcons: Record<UserRole, React.ReactNode> = {
    teacher: <GraduationCap className="w-5 h-5 text-cyan-400" />,
    student: <User className="w-5 h-5 text-emerald-400" />,
    parent: <Users className="w-5 h-5 text-amber-400" />,
    admin: <Building className="w-5 h-5 text-purple-400" />
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <header className="px-4 sm:px-8 py-4 border-b border-cyan-500/20 bg-[#0b1329]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#070d1e] flex items-center justify-center">
                <School className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-2">
                <span>Smart Class</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Cổng Xác Thực
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-semibold leading-tight">
                Trường THCS Nguyễn Lương Bằng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-[#070d1e] px-3 py-1.5 rounded-xl border border-cyan-500/25">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Hệ thống bảo mật dữ liệu giáo dục</span>
            <span className="sm:hidden">Bảo mật</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-2xl bg-[#0b1329] rounded-3xl border border-cyan-500/35 shadow-2xl shadow-cyan-950/40 overflow-hidden backdrop-blur-xl">
          {/* Hero Welcome Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-[#101b38] to-[#0b1329] border-b border-cyan-500/20 text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>YÊU CẦU ĐĂNG NHẬP ĐỂ VÀO HỆ THỐNG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Chào mừng đến với Smart Class
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg mx-auto leading-relaxed">
              Vui lòng đăng nhập bằng tài khoản của bạn để truy cập sổ điểm, thời khóa biểu, điểm danh và sổ liên lạc điện tử.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-6 inline-flex p-1 rounded-2xl bg-[#070d1e] border border-cyan-500/30 shadow-inner w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setShowRegisterPrompt(false);
                }}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>ĐĂNG NHẬP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setShowRegisterPrompt(false);
                }}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>ĐĂNG KÝ TÀI KHOẢN MỚI</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Global Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-xs sm:text-sm text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
                {showRegisterPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setShowRegisterPrompt(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
                  >
                    👉 Bấm Đăng ký ngay
                  </button>
                )}
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {mode === 'login' && (
              <div className="space-y-6">
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Địa chỉ Email đăng nhập:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="Ví dụ: nguyenthimai@thcsnguyenluongbang.edu.vn"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-200">
                        Mật khẩu:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        (Mật khẩu tài khoản mẫu: <strong className="text-cyan-300">123456</strong>)
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Login Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-6 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:scale-[0.99] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={loginGoogle}
                      className="w-full sm:w-auto py-3 px-4 text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Đăng nhập với Google</span>
                    </button>
                  </div>
                </form>

                {/* Prompt: Chưa có tài khoản? */}
                <div className="p-4 rounded-2xl bg-[#070d1e] border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-black text-white">Bạn chưa có tài khoản?</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Chỉ mất 30 giây để đăng ký tài khoản Giáo viên, Học sinh hoặc Phụ huynh.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Đăng ký tài khoản mới</span>
                  </button>
                </div>

                {/* Role Quick-Test Cards */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Hoặc đăng nhập nhanh bằng tài khoản mẫu:</span>
                    </span>
                    <span className="text-[11px] text-slate-400">1 chạm</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                      const user = DEMO_USERS[role];
                      const info = ROLE_DETAILS[role];

                      return (
                        <div
                          key={role}
                          className="p-3.5 rounded-2xl bg-[#070d1e] border border-cyan-500/25 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${info.badgeBg} ${info.badgeColor} ${info.badgeBorder}`}
                              >
                                {info.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">Pass: 123456</span>
                            </div>
                            <div className="text-xs font-black text-white truncate">{user.name}</div>
                            <div className="text-[11px] text-cyan-300/80 font-mono truncate">{user.email}</div>
                          </div>

                            <button
                              type="button"
                              onClick={() => {
                                handleFillDemoLogin(role);
                                setLoginPassword('');
                                setErrorMsg(null);
                              }}
                              className="col-span-2 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer text-center"
                              title="Chọn tài khoản và nhập mật khẩu"
                            >
                              Chọn tài khoản & Nhập mật khẩu 🔐
                            </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in">
                {/* Step 1: Chọn vai trò */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-black uppercase tracking-wider text-cyan-400">
                      1. Bạn là ai? Chọn vai trò muốn đăng ký:
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDemoRegister}
                      className="text-xs font-bold text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Điền mẫu tự động</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                            isSelected
                              ? 'bg-cyan-950 border-cyan-400 text-white font-black ring-2 ring-cyan-400/50 shadow-md'
                              : 'bg-[#070d1e] border-cyan-500/20 text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <div className="p-1.5 rounded-xl bg-[#0b1329] border border-cyan-500/20">
                            {roleIcons[role]}
                          </div>
                          <span className="text-xs font-bold">{ROLE_DETAILS[role].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Form fields */}
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <label className="block text-xs font-black uppercase tracking-wider text-cyan-400">
                    2. Nhập thông tin đăng ký tài khoản:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Họ và tên *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Email đăng nhập *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Mật khẩu * (Tối thiểu 6 ký tự)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(prev => !prev)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Xác nhận lại mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role-specific dynamic fields */}
                  {selectedRole === 'teacher' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Môn giảng dạy:
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Toán học, Ngữ văn..."
                          value={regSubject}
                          onChange={e => setRegSubject(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Lớp chủ nhiệm / phụ trách:
                        </label>
                        <select
                          value={regClassId}
                          onChange={e => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>
                              Lớp {c.name} ({c.subject})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Lớp học của em: *
                        </label>
                        <select
                          value={regClassId}
                          onChange={e => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>
                              Lớp {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Mã học sinh (nếu có):
                        </label>
                        <input
                          type="text"
                          placeholder="HS-0701"
                          value={regStudentCode}
                          onChange={e => setRegStudentCode(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'parent' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Họ tên con em: *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Trần Hải Đăng"
                          value={regStudentName}
                          onChange={e => setRegStudentName(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1">
                          Số điện thoại liên hệ phụ huynh: *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 678"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#070d1e] border border-cyan-500/35 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Register Button */}
                <div className="pt-3 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>HOÀN TẤT ĐĂNG KÝ & VÀO HỆ THỐNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className="w-full py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-[#070d1e] hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đã có tài khoản? Bấm để quay lại Đăng nhập</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer security badge */}
          <div className="px-6 py-3.5 bg-[#070d1e] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Dữ liệu học sinh và nhà trường được bảo vệ an toàn</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400/80">THCS Nguyễn Lương Bằng</span>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-[#070d1e]/80">
        Smart Class © 2026 Trường THCS Nguyễn Lương Bằng • Hệ thống quản lý trường học & Sổ liên lạc điện tử
      </footer>
    </div>
  );
};
