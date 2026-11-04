import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppUser } from '../../types';
import { DEMO_USERS, ROLE_DETAILS } from '../../services/authPresets';
import { StorageService } from '../../services/storage';
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
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  History,
  Trash2,
  Check
} from 'lucide-react';

export const AuthGateway: React.FC = () => {
  const {
    loginWithCredentials,
    registerUser,
    loginGoogle,
    loginAsRole,
    classes
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regSubject, setRegSubject] = useState('Toán học');
  const [regClassId, setRegClassId] = useState(classes[0]?.id || 'class-7a3');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAdminTitle, setRegAdminTitle] = useState('Phó Hiệu Trưởng');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<AppUser[]>([]);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Load login history from local storage
  useEffect(() => {
    setLoginHistory(StorageService.getLoginHistory());
  }, []);

  // Ensure regClassId is initialized
  useEffect(() => {
    if (classes.length > 0 && !regClassId) {
      setRegClassId(classes[0].id);
    }
  }, [classes, regClassId]);

  const handleSelectDemoRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    setLoginEmail(demo.email);
    setLoginPassword('');
    setErrorMsg(null);
    setInfoMsg(`Đã chọn tài khoản mẫu: ${demo.name} (${ROLE_DETAILS[role].label}). Mật khẩu mẫu: 123456`);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleQuickLoginRole = (role: UserRole) => {
    loginAsRole(role, rememberMe);
  };

  const handleSelectHistoryAccount = (acc: AppUser) => {
    setLoginEmail(acc.email);
    setLoginPassword('');
    setErrorMsg(null);
    setInfoMsg(`Đã chọn tài khoản gần đây: ${acc.name}. Vui lòng nhập mật khẩu để đăng nhập.`);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleRemoveHistoryAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    StorageService.removeLoginHistory(email);
    setLoginHistory(StorageService.getLoginHistory());
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const email = loginEmail.trim();
    const pass = loginPassword.trim();

    if (!email) {
      setErrorMsg('Vui lòng nhập địa chỉ Email đăng nhập.');
      return;
    }
    if (!pass) {
      setErrorMsg('Vui lòng nhập Mật khẩu (Mật khẩu tài khoản mẫu là: 123456).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = loginWithCredentials(email, pass, rememberMe);
      if (!result.success) {
        setErrorMsg(result.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoRegister = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    const rand = Math.floor(100 + Math.random() * 900);
    if (selectedRole === 'teacher') {
      setRegName(`Cô Lê Thu Thảo ${rand}`);
      setRegEmail(`thao.le${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegSubject('Toán học');
    } else if (selectedRole === 'student') {
      setRegName(`Nguyễn Hoàng Long ${rand}`);
      setRegEmail(`long.nh${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentCode(`HS-${rand}`);
    } else if (selectedRole === 'parent') {
      setRegName(`Trần Văn Hưng ${rand}`);
      setRegEmail(`hung.tran${rand}@gmail.com`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentName('Trần Hải Đăng');
      setRegPhone('0912 345 678');
    } else {
      setRegName(`Thầy Phạm Quốc Bảo ${rand}`);
      setRegEmail(`bgh.bao${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegAdminTitle('Phó Hiệu Trưởng');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ (ví dụ: email@example.com).');
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
        setErrorMsg('Vui lòng nhập họ và tên của con em.');
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

      const result = registerUser(newUserPayload, regPassword, rememberMe);
      if (!result.success) {
        setErrorMsg(result.message || 'Không thể đăng ký tài khoản lúc này.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Strength Calculation (Image 2 effect)
  const calcPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Khá', color: 'bg-cyan-500' };
    return { score: 4, label: 'Mạnh', color: 'bg-emerald-400' };
  };

  const passStrength = calcPasswordStrength(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="min-h-screen bg-[#070d1e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] flex flex-col justify-center items-center p-3 sm:p-6 text-slate-100">
      {/* Brand Header */}
      <div className="w-full max-w-2xl mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-300 mb-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>THCS Nguyễn Lương Bằng • Cổng Xác Thực Smart Class 4.0</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          HỆ THỐNG QUẢN LÝ LỚP HỌC & GIẢNG DẠY THÔNG MINH
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Vui lòng đăng nhập hoặc đăng ký tài khoản để truy cập bài tập, ngân hàng câu hỏi và sổ điểm.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-[#0b1329] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header inside Card */}
        <div className="p-4 sm:p-6 border-b border-cyan-500/20 bg-gradient-to-r from-[#0b1329] via-[#0d1835] to-[#0b1329] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/30 shrink-0">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  THCS Nguyễn Lương Bằng
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Chọn vai trò để đăng nhập 1 chạm hoặc nhập tài khoản cá nhân'
                  : 'Tạo tài khoản mới theo đúng vai trò của bạn để giao diện tự động thích ứng'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-[#070d1e]/80 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký mới</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {infoMsg && (
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ================= MODE 1: LOGIN ================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* 1. Select Role Presets (Matching Image 1) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. BẠN LÀ AI? CHỌN VAI TRÒ ĐỂ ĐĂNG NHẬP NGAY:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">1 chạm tức thì</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const preset = DEMO_USERS[role];
                    const details = ROLE_DETAILS[role];
                    const isSelected = loginEmail.toLowerCase() === preset.email.toLowerCase();

                    const Icon = role === 'teacher'
                      ? GraduationCap
                      : role === 'student'
                      ? User
                      : role === 'parent'
                      ? Users
                      : Building;

                    return (
                      <div
                        key={role}
                        onClick={() => handleSelectDemoRole(role)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group text-left ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-500/10'
                            : 'bg-[#070d1e] border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0c1630]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-[#101e38] text-cyan-300'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{details.label}</span>
                              </div>
                              <div className="text-[11px] font-semibold text-cyan-300 truncate max-w-[150px]">
                                {preset.name}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLoginRole(role);
                            }}
                            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-cyan-400/20 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border border-cyan-400/40 transition-all cursor-pointer shrink-0"
                            title="Vào ngay bằng tài khoản này"
                          >
                            Vào ngay →
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {details.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Login Form (Matching Image 1 & 4) */}
              <div className="pt-2 border-t border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300">
                    2. Hoặc đăng nhập bằng tài khoản cá nhân:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoRole('teacher')}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                  >
                    Điền mẫu GV (123456)
                  </button>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-3">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="ten@thcsnguyenluongbang.edu.vn"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Mật khẩu
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (Mật khẩu demo: 123456)
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        ref={passwordInputRef}
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Cache & Remember Me Checkbox (CRITICAL REQUIREMENT) */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-cyan-500/30 bg-[#070d1e] text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-400"
                      />
                      <span>Ghi nhớ đăng nhập trên máy này (Lưu cache lần sau vào thẳng)</span>
                    </label>
                  </div>

                  {/* Buttons (Matching Image 4: Cyan Button + Google Button) */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-5 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <LogIn className="w-4 h-4 text-slate-950" />
                      )}
                      <span>Đăng nhập vào hệ thống</span>
                    </button>

                    <button
                      type="button"
                      onClick={loginGoogle}
                      className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 bg-[#101e38] hover:bg-[#16274c] border border-cyan-500/40 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
                      title="Đăng nhập nhanh với tài khoản Google"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Google</span>
                    </button>
                  </div>
                </form>

                {/* Prompt switch */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
                  <span>Chưa có tài khoản? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Đăng ký tài khoản mới ngay
                  </button>
                </div>
              </div>

              {/* 3. History of logged-in accounts on this device */}
              {loginHistory.length > 0 && (
                <div className="pt-3 border-t border-cyan-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tài khoản đã đăng nhập gần đây trên thiết bị này:</span>
                  </div>
                  <div className="space-y-1.5">
                    {loginHistory.map((acc) => (
                      <div
                        key={acc.email}
                        onClick={() => handleSelectHistoryAccount(acc)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#070d1e] border border-cyan-500/20 hover:border-cyan-400 hover:bg-[#0c1733] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">({ROLE_DETAILS[acc.role]?.label})</span>
                            </div>
                            <div className="text-[11px] text-slate-400">{acc.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-cyan-400 font-semibold group-hover:underline">
                            Đăng nhập lại →
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveHistoryAccount(e, acc.email)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Xóa khỏi lịch sử máy này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE 2: REGISTER ================= */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Section 1: 1. BẠN LÀ AI? CHỌN VAI TRÒ MUỐN ĐĂNG KÝ (Image 2) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    1. BẠN LÀ AI? CHỌN VAI TRÒ MUỐN ĐĂNG KÝ:
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemoRegister}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Điền mẫu tự động</span>
                  </button>
                </div>

                {/* 4 Role Selector Buttons with Active Checkmark (Image 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const isSelected = selectedRole === role;
                    const Icon = role === 'teacher'
                      ? GraduationCap
                      : role === 'student'
                      ? User
                      : role === 'parent'
                      ? Users
                      : Building;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#101f42] border-cyan-400 ring-2 ring-cyan-500/40 text-cyan-300'
                            : 'bg-[#070d1e] border-cyan-500/20 text-slate-400 hover:text-white hover:border-cyan-500/40'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold leading-tight">
                          {ROLE_DETAILS[role].label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: 2. THÔNG TIN TÀI KHOẢN ĐĂNG KÝ (Image 2 & 3) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-cyan-400 mb-2">
                  2. THÔNG TIN TÀI KHOẢN ĐĂNG KÝ:
                </label>

                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Row 1: Họ tên + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Họ và tên *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Email đăng nhập *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Mật khẩu + Xác nhận mật khẩu (with Visual Feedback Effects) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full pl-9 pr-9 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {regPassword.length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5 animate-in fade-in">
                          <div className="flex-1 grid grid-cols-4 gap-1 h-1">
                            <div className={`rounded-full ${passStrength.score >= 1 ? passStrength.color : 'bg-slate-700'}`} />
                            <div className={`rounded-full ${passStrength.score >= 2 ? passStrength.color : 'bg-slate-700'}`} />
                            <div className={`rounded-full ${passStrength.score >= 3 ? passStrength.color : 'bg-slate-700'}`} />
                            <div className={`rounded-full ${passStrength.score >= 4 ? passStrength.color : 'bg-slate-700'}`} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {passStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Xác nhận mật khẩu *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Nhập lại mật khẩu"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          className={`w-full pl-9 pr-9 py-2 text-xs bg-[#070d1e] border rounded-xl text-white placeholder:text-slate-500 focus:outline-none ${
                            passwordsMatch
                              ? 'border-emerald-500 focus:border-emerald-400'
                              : passwordsMismatch
                              ? 'border-rose-500 focus:border-rose-400'
                              : 'border-cyan-500/30 focus:border-cyan-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Real-time Match Indicator */}
                      {passwordsMatch && (
                        <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 animate-in fade-in">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Mật khẩu trùng khớp</span>
                        </div>
                      )}
                      {passwordsMismatch && (
                        <div className="mt-1 text-[10px] text-rose-400 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>Mật khẩu xác nhận chưa khớp</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Fields for Teacher (Image 2) */}
                  {selectedRole === 'teacher' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Môn giảng dạy
                        </label>
                        <input
                          type="text"
                          value={regSubject}
                          onChange={e => setRegSubject(e.target.value)}
                          placeholder="Toán học"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Lớp chủ nhiệm / phụ trách
                        </label>
                        <select
                          value={regClassId}
                          onChange={e => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
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

                  {/* Dynamic Fields for Student */}
                  {selectedRole === 'student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Mã học sinh
                        </label>
                        <input
                          type="text"
                          value={regStudentCode}
                          onChange={e => setRegStudentCode(e.target.value)}
                          placeholder="Ví dụ: HS-0701"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Lớp học
                        </label>
                        <select
                          value={regClassId}
                          onChange={e => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>
                              Lớp {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields for Parent */}
                  {selectedRole === 'parent' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Họ và tên con (Học sinh) *
                        </label>
                        <input
                          type="text"
                          required
                          value={regStudentName}
                          onChange={e => setRegStudentName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Tuấn Anh"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Số điện thoại liên hệ *
                        </label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="0912 345 678"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields for Admin */}
                  {selectedRole === 'admin' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Chức vụ quản lý
                        </label>
                        <input
                          type="text"
                          value={regAdminTitle}
                          onChange={e => setRegAdminTitle(e.target.value)}
                          placeholder="Hiệu Trưởng / Phó Hiệu Trưởng"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Đơn vị
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="Trường THCS Nguyễn Lương Bằng"
                          className="w-full px-3 py-2 text-xs bg-[#070d1e]/60 border border-slate-800 rounded-xl text-slate-400 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Remember me on register */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-cyan-500/30 bg-[#070d1e] text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-400"
                      />
                      <span>Tự động lưu phiên đăng nhập trên thiết bị này</span>
                    </label>
                  </div>

                  {/* Primary Submit Button (Matching Image 3: Bright Cyan Full-width) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 active:scale-[0.98] disabled:opacity-50 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-slate-950" />
                      )}
                      <span>Hoàn tất đăng ký & Bắt đầu trải nghiệm</span>
                    </button>
                  </div>

                  {/* Divider HOẶC (Image 3) */}
                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative bg-[#0b1329] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      HOẶC
                    </span>
                  </div>

                  {/* Secondary Google Button (Matching Image 3) */}
                  <button
                    type="button"
                    onClick={loginGoogle}
                    className="w-full py-3 px-6 text-xs sm:text-sm font-bold text-slate-200 bg-[#101e38] hover:bg-[#16274c] border border-cyan-500/40 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Đăng ký nhanh với tài khoản Google</span>
                  </button>

                  {/* Switch to login prompt (Image 3) */}
                  <div className="pt-2 text-center text-xs text-slate-400">
                    <span>Đã có tài khoản? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-3 sm:px-6 bg-[#070d1e] border-t border-cyan-500/20 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bảo mật dữ liệu chuẩn ngành giáo dục • Hệ thống phân quyền 4 vai trò</span>
        </div>
      </div>
    </div>
  );
};
