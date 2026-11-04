import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppUser } from '../../types';
import { DEMO_USERS, ROLE_DETAILS } from '../../services/authPresets';
import {
  X,
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
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const {
    currentUser,
    loginWithCredentials,
    registerUser,
    loginGoogle,
    classes,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole | null>(null);

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

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setInfoMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  // Ensure regClassId is set when classes are available
  useEffect(() => {
    if (classes.length > 0 && !regClassId) {
      setRegClassId(classes[0].id);
    }
  }, [classes, regClassId]);

  if (!isOpen) return null;

  // Handle clicking on one of the 4 demo role cards in Login
  // CRITICAL REQUIREMENT: "khi muốn dùng lại 1 tài khoản nào thì phải nhập lại mk"
  const handleSelectDemoRole = (role: UserRole) => {
    setSelectedDemoRole(role);
    const demo = DEMO_USERS[role];
    setLoginEmail(demo.email);
    setLoginPassword('');
    setErrorMsg(null);
    setInfoMsg(`Đã chọn tài khoản ${demo.name}. Vui lòng nhập mật khẩu (mặc định: 123456) để đăng nhập.`);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
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
      setErrorMsg('Vui lòng nhập Mật khẩu để tiếp tục (Mật khẩu tài khoản mẫu là 123456).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = loginWithCredentials(email, pass);
      if (result.success) {
        onClose();
      } else {
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

      const result = registerUser(newUserPayload, regPassword);
      if (result.success) {
        onClose();
      } else {
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
    if (score === 3) return { score: 3, label: 'Khá tốt', color: 'bg-cyan-500' };
    return { score: 4, label: 'Rất mạnh', color: 'bg-emerald-500' };
  };

  const passStrength = calcPasswordStrength(regPassword);
  const passwordsMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER (Matching Screenshots 1 & 2) */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/30 shrink-0">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/35">
                  THCS Nguyễn Lương Bằng
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 mt-0.5">
                {mode === 'login'
                  ? 'Chọn vai trò để đăng nhập 1 chạm hoặc nhập tài khoản cá nhân'
                  : 'Tạo tài khoản mới theo đúng vai trò của bạn để giao diện tự động thích ứng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SWITCHER (Matching Screenshots: Đăng nhập vs Đăng ký mới) */}
        <div className="px-5 sm:px-6 pt-2 bg-[#091124] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`pb-2.5 pt-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                mode === 'login'
                  ? 'text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`pb-2.5 pt-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                mode === 'register'
                  ? 'text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
              {mode === 'register' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          </div>

          {currentUser && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Đang đăng nhập: <strong className="text-cyan-300">{currentUser.name}</strong>
            </span>
          )}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-xs text-cyan-200 flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ================= MODE 1: LOGIN (Matching Images 1 & 4) ================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Step 1: BẠN LÀ AI? CHỌN VAI TRÒ ĐỂ ĐĂNG NHẬP NGAY */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. BẠN LÀ AI? CHỌN VAI TRÒ ĐỂ ĐĂNG NHẬP NGAY:</span>
                  </label>
                  <span className="text-[10px] text-cyan-300/80 font-mono">1 chạm tức thì</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const preset = DEMO_USERS[role];
                    const info = ROLE_DETAILS[role];
                    const isSelected = selectedDemoRole === role || loginEmail === preset.email;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectDemoRole(role)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-[#101f42] border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                            : 'bg-[#070d1e] border-cyan-500/25 hover:border-cyan-400/50 hover:bg-[#0d1833]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#0b1329] border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {role === 'teacher' && <GraduationCap className="w-5 h-5 text-cyan-400" />}
                              {role === 'student' && <User className="w-5 h-5 text-emerald-400" />}
                              {role === 'parent' && <Users className="w-5 h-5 text-amber-400" />}
                              {role === 'admin' && <Building className="w-5 h-5 text-purple-400" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{info.label}</span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-400/40">
                                    Đang chọn
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-cyan-200/90 font-semibold truncate max-w-[170px]">
                                {preset.name}
                              </div>
                            </div>
                          </div>
                          <span className={`transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {info.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: HOẶC ĐĂNG NHẬP BẰNG TÀI KHOẢN CÁ NHÂN */}
              <div className="pt-4 border-t border-cyan-500/15">
                <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
                  <span>2. Hoặc đăng nhập bằng tài khoản cá nhân:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('nguyenthimai@thcsnguyenluongbang.edu.vn');
                      setLoginPassword('123456');
                      setSelectedDemoRole('teacher');
                      setInfoMsg('Đã điền tài khoản Cô Nguyễn Thị Mai (Mật khẩu: 123456). Bấm Đăng nhập để vào!');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer font-bold"
                  >
                    Điền mẫu GV (123456)
                  </button>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-3">
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

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Mật khẩu
                    </label>
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
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons (Matching Image 4: Primary Cyan Button + Google Button) */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-1.5"
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
                      className="px-4 py-2.5 text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Đăng nhập nhanh với tài khoản Google"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Google</span>
                    </button>
                  </div>
                </form>

                {/* Switch to register prompt */}
                <div className="mt-3.5 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
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
            </div>
          )}

          {/* ================= MODE 2: REGISTER (Matching Images 2 & 3) ================= */}
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
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Điền mẫu tự động</span>
                  </button>
                </div>

                {/* 4 Horizontal Role Buttons with Selected Checkmark (Image 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1.5 ${
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
                        <div className="w-7 h-7 rounded-lg bg-[#0b1329] flex items-center justify-center">
                          {role === 'teacher' && <GraduationCap className="w-4 h-4 text-cyan-400" />}
                          {role === 'student' && <User className="w-4 h-4 text-emerald-400" />}
                          {role === 'parent' && <Users className="w-4 h-4 text-amber-400" />}
                          {role === 'admin' && <Building className="w-4 h-4 text-purple-400" />}
                        </div>
                        <span className="text-xs font-bold">{ROLE_DETAILS[role].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: 2. THÔNG TIN TÀI KHOẢN ĐĂNG KÝ (Image 2 Two-column form) */}
              <div className="pt-2">
                <label className="text-xs font-black uppercase tracking-wider text-cyan-400 block mb-2">
                  2. THÔNG TIN TÀI KHOẢN ĐĂNG KÝ:
                </label>

                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Row 1: Họ và tên + Email */}
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
                        Email đăng ký *
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
                          className={`w-full pl-9 pr-9 py-2 text-xs bg-[#070d1e] border rounded-xl text-white placeholder:text-slate-500 focus:outline-none ${
                            regPassword.length >= 6 ? 'border-cyan-500/50 focus:border-cyan-400' : 'border-cyan-500/30 focus:border-cyan-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
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
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
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

                  {/* Primary Submit Button (Matching Image 3: Bright Cyan Full-width) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-slate-950" />
                      )}
                      <span>Hoàn tất đăng ký & Bắt đầu trải nghiệm</span>
                    </button>
                  </div>

                  {/* HOẶC divider (Matching Image 3) */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800" />
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400">HOẶC</span>
                    <div className="flex-grow border-t border-slate-800" />
                  </div>

                  {/* Google Registration Button (Matching Image 3) */}
                  <button
                    type="button"
                    onClick={loginGoogle}
                    className="w-full py-2 text-xs font-bold text-slate-200 bg-[#101b38] hover:bg-[#16254e] border border-cyan-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Đăng ký nhanh với tài khoản Google</span>
                  </button>

                  {/* Switch to login link (Matching Image 3) */}
                  <div className="text-center pt-2 text-xs text-slate-400">
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

        {/* BOTTOM FOOTER BAR (Matching all 4 Screenshots: Shield + Đóng Button) */}
        <div className="px-5 sm:px-6 py-3 border-t border-cyan-500/20 bg-[#070d1e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300/80 font-medium text-[11px]">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Bảo mật dữ liệu chuẩn ngành giáo dục</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
