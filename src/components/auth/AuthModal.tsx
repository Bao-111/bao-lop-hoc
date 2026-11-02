import React, { useState, useEffect } from 'react';
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
  Phone,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Check
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
    loginAsRole,
    loginWithCredentials,
    registerUser,
    loginGoogle,
    classes,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSubject, setRegSubject] = useState('Toán học');
  const [regClassId, setRegClassId] = useState(classes[0]?.id || 'class-7a3');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync mode whenever initialMode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
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

  const handleQuickRoleLogin = (role: UserRole) => {
    loginAsRole(role);
    onClose();
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = loginWithCredentials(loginEmail.trim(), loginPassword);
      if (success) {
        onClose();
      } else {
        setErrorMsg('Email hoặc mật khẩu không chính xác. Bạn có thể bấm chọn 1 trong 4 vai trò nhanh bên trên để đăng nhập ngay!');
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

      const success = registerUser(newUserPayload, regPassword);
      if (success) {
        onClose();
      } else {
        setErrorMsg('Không thể đăng ký tài khoản lúc này. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi không xác định khi đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoRegister = () => {
    setErrorMsg(null);
    const rand = Math.floor(100 + Math.random() * 900);
    if (selectedRole === 'teacher') {
      setRegName(`Thầy Trần Minh Hoàng ${rand}`);
      setRegEmail(`hoangtm${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegSubject('Vật lý');
    } else if (selectedRole === 'student') {
      setRegName(`Học sinh Lê Tuấn Kiệt ${rand}`);
      setRegEmail(`tuankiet${rand}@thcsnguyenluongbang.edu.vn`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentCode(`HS-07${rand.toString().slice(0, 2)}`);
    } else if (selectedRole === 'parent') {
      setRegName(`Phụ huynh Phạm Văn Hải ${rand}`);
      setRegEmail(`phamhai${rand}@gmail.com`);
      setRegPassword('123456');
      setRegConfirmPassword('123456');
      setRegStudentName('Phạm Hải Nam');
      setRegPhone('0987 654 321');
    } else {
      setRegName(`Phó Hiệu trưởng Đỗ Quang Huy ${rand}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              SC
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  THCS Nguyễn Lương Bằng
                </span>
              </h3>
              <p className="text-[11px] text-cyan-200/80">
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

        {/* Tab switcher: Đăng nhập vs Đăng ký */}
        <div className="px-5 sm:px-6 pt-3 bg-[#091124] border-b border-cyan-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'login'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'register'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký mới</span>
            </button>
          </div>

          {currentUser && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Đang đăng nhập: <strong className="text-cyan-300">{currentUser.name}</strong>
            </span>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Step 1: Chọn vai trò để đăng nhập nhanh */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. Bạn là ai? Chọn vai trò để đăng nhập ngay:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">1 chạm tức thì</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const preset = DEMO_USERS[role];
                    const info = ROLE_DETAILS[role];
                    const isCurrent = currentUser?.role === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleQuickRoleLogin(role)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between relative ${
                          isCurrent
                            ? 'bg-[#101f42] border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                            : 'bg-[#070d1e] border-cyan-500/25 hover:border-cyan-400/50 hover:bg-[#0d1833]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#0b1329] border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {roleIcons[role]}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">{info.label}</span>
                                {isCurrent && (
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
                          <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
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

              {/* Step 2: Hoặc đăng nhập bằng Email & Mật khẩu */}
              <div className="pt-4 border-t border-cyan-500/15">
                <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
                  <span>2. Hoặc đăng nhập bằng tài khoản cá nhân:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('nguyenthimai@thcsnguyenluongbang.edu.vn');
                      setLoginPassword('123456');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
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
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-50 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-3.5 h-3.5" />
                      )}
                      <span>Đăng nhập vào hệ thống</span>
                    </button>

                    <button
                      type="button"
                      onClick={loginGoogle}
                      className="px-4 py-2 text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Đăng nhập tài khoản Google"
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
                    }}
                    className="font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer ml-1"
                  >
                    Đăng ký tài khoản mới ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    1. Bạn là ai? Chọn vai trò muốn đăng ký:
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemoRegister}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Điền mẫu tự động</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['teacher', 'student', 'parent', 'admin'] as UserRole[]).map(role => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                          isSelected
                            ? 'bg-cyan-950 border-cyan-400 text-white font-bold ring-2 ring-cyan-400/50 shadow-md'
                            : 'bg-[#070d1e] border-cyan-500/20 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <div className="p-1 rounded-lg bg-[#0b1329]">
                          {roleIcons[role]}
                        </div>
                        <span className="text-xs">{ROLE_DETAILS[role].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-cyan-500/15">
                <label className="block text-xs font-black uppercase tracking-wider text-cyan-400">
                  2. Thông tin tài khoản đăng ký:
                </label>

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
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Mật khẩu *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Xác nhận mật khẩu *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Role specific inputs */}
                {selectedRole === 'teacher' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Môn giảng dạy
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Toán học, Tiếng Anh, Ngữ văn..."
                        value={regSubject}
                        onChange={e => setRegSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Lớp chủ nhiệm / phụ trách
                      </label>
                      <select
                        value={regClassId}
                        onChange={e => setRegClassId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Lớp học của em *
                      </label>
                      <select
                        value={regClassId}
                        onChange={e => setRegClassId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>
                            Lớp {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Mã học sinh (nếu có)
                      </label>
                      <input
                        type="text"
                        placeholder="HS-0701"
                        value={regStudentCode}
                        onChange={e => setRegStudentCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'parent' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Họ tên con em *
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Trần Hải Đăng"
                        value={regStudentName}
                        onChange={e => setRegStudentName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Số điện thoại liên hệ *
                      </label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-50 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Hoàn tất đăng ký & Bắt đầu trải nghiệm</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">hoặc</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <button
                  type="button"
                  onClick={loginGoogle}
                  className="w-full py-2 text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đăng ký nhanh với tài khoản Google</span>
                </button>
              </div>

              {/* Switch to login prompt */}
              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer ml-1"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-[#070d1e] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bảo mật dữ liệu chuẩn ngành giáo dục</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
