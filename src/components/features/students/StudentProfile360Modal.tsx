import React, { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  User,
  Users,
  Edit2,
  CheckCircle2,
  MessageCircle,
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEditStudent: (student: Student, defaultTab?: 'student' | 'parent') => void;
}

export const StudentProfile360Modal: React.FC<Props> = ({
  student,
  isOpen,
  onClose,
  onEditStudent
}) => {
  const { activeClass, classes, grades, attendance, showToast } = useApp();

  const studentClass = useMemo(() => {
    if (!student) return null;
    return classes.find(c => c.id === student.classId) || activeClass;
  }, [student, classes, activeClass]);

  // Compute student GPA and attendance rate
  const studentMetrics = useMemo(() => {
    if (!student) return { gpa: 8.0, attendanceRate: 100, conduct: 'Tốt' };

    const g = grades.find(item => item.studentId === student.id && item.classId === student.classId);
    let gpa = 8.0;
    if (g && g.midterm !== undefined && g.midterm !== null) {
      gpa = g.midterm;
    }

    const records = attendance.filter(a => a.studentId === student.id && a.classId === student.classId);
    let attendanceRate = 100;
    if (records.length > 0) {
      const present = records.filter(a => a.status === 'present' || a.status === 'late').length;
      attendanceRate = Math.round((present / records.length) * 100);
    }

    return {
      gpa,
      attendanceRate,
      conduct: student.conduct || 'Tốt'
    };
  }, [student, grades, attendance]);

  if (!isOpen || !student) return null;

  const parentRelationship = student.parentRelationship || 'Bố';
  const parentName = student.parentName || 'Chưa cập nhật';
  const parentPhone = student.parentPhone || 'Chưa có SĐT';
  const parentEmail = student.parentEmail || `${student.studentCode.toLowerCase()}@smartclass.edu.vn`;
  const parentAddress = student.parentAddress || student.studentAddress || 'Hà Nội';
  const isAppConnected = student.parentAppStatus !== 'not_connected';

  const handleCallParent = () => {
    if (!student.parentPhone) {
      showToast('Học sinh này chưa có số điện thoại phụ huynh', 'warning');
      return;
    }
    window.open(`tel:${student.parentPhone}`);
  };

  const handleOpenZalo = () => {
    if (!student.parentPhone) {
      showToast('Học sinh này chưa có số điện thoại để kết nối Zalo', 'warning');
      return;
    }
    const cleanPhone = student.parentPhone.replace(/\D/g, '');
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>Hồ sơ Toàn diện Học sinh 360° - {student.fullName}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Mã HS: {student.studentCode} · Lớp {studentClass?.name || '---'} ({studentClass?.subject})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#142244] rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Hero Student Identity Card */}
          <div className="p-4 rounded-2xl border border-cyan-500/25 bg-[#070d1e]/80 shadow-md flex items-center gap-4">
            <Avatar
              name={student.fullName}
              avatarUrl={student.avatarUrl}
              gender={student.gender}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-100 truncate">
                  {student.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30 font-mono">
                  {student.studyGroup || 'Tổ 1'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  student.status === 'active'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}>
                  {student.status === 'active' ? 'Đang theo học' : 'Nghỉ học / Chuyển'}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Mã HS: <strong className="font-mono text-cyan-300">{student.studentCode}</strong></span>
                <span>·</span>
                <span>Lớp: <strong className="text-slate-200">{studentClass?.name}</strong></span>
                <span>·</span>
                <span>Giới tính: <strong className="text-slate-200">{student.gender === 'male' ? 'Nam' : 'Nữ'}</strong></span>
              </div>
            </div>
          </div>

          {/* SECTION 1: Học sinh & Kết quả rèn luyện */}
          <div className="p-4.5 rounded-2xl border border-cyan-500/20 bg-[#070d1e]/60 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Thông tin học sinh & Kết quả học tập rèn luyện</span>
              </div>
              <button
                type="button"
                onClick={() => onEditStudent(student, 'student')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa thông tin HS</span>
              </button>
            </div>

            {/* 4 Stat Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-medium">Ngày sinh</span>
                <span className="text-xs font-bold font-mono text-slate-200 mt-0.5 block">
                  {student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : '2012-01-01'}
                </span>
              </div>

              <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-medium">Tổ học tập</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                  {student.studyGroup || 'Tổ 1'}
                </span>
              </div>

              <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-medium">Điểm TB (ĐTB)</span>
                <span className="text-sm font-extrabold font-mono text-cyan-400 mt-0.5 block">
                  {studentMetrics.gpa.toFixed(1)}
                </span>
              </div>

              <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-medium">Hạnh kiểm</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                  {studentMetrics.conduct}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Địa chỉ thường trú học sinh: <strong className="text-slate-100">{student.studentAddress || 'Hà Nội'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tỷ lệ chuyên cần: <strong className="text-emerald-400">{studentMetrics.attendanceRate}%</strong> (Có mặt đầy đủ các tiết)</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Phụ huynh đại diện (Sổ liên lạc điện tử) */}
          <div className="p-4.5 rounded-2xl border border-cyan-500/20 bg-[#070d1e]/60 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Thông tin Phụ huynh đại diện (Sổ liên lạc điện tử)</span>
              </div>
              <button
                type="button"
                onClick={() => onEditStudent(student, 'parent')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa thông tin PH</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Họ và tên Phụ huynh:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-100 text-sm">{parentName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    parentRelationship === 'Bố'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                      : parentRelationship === 'Mẹ'
                      ? 'bg-pink-950/80 text-pink-300 border border-pink-500/40'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  }`}>
                    {parentRelationship}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại liên hệ:</span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className="font-bold font-mono text-cyan-300 text-sm">{parentPhone}</span>
                  {student.parentPhone && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleCallParent}
                        className="p-1 rounded bg-[#142244] hover:bg-[#1a2d5a] text-cyan-300 border border-cyan-500/30 cursor-pointer"
                        title="Gọi điện"
                      >
                        <Phone className="w-3 h-3 text-cyan-400" />
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenZalo}
                        className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer"
                        title="Nhắn Zalo"
                      >
                        Zalo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Email phụ huynh:</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-300 font-mono">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{parentEmail}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Trạng thái App SmartClass:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-xs">
                    {isAppConnected ? 'Đã kết nối ứng dụng' : 'Chưa cài ứng dụng'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Địa chỉ thường trú gia đình:</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{parentAddress}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#070d1e] border-t border-cyan-500/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEditStudent(student, 'student')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-cyan-300 bg-[#142244] border border-cyan-500/30 rounded-xl hover:bg-[#1a2d5a] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chỉnh sửa học sinh</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCallParent}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-colors shadow-md cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Liên hệ Phụ huynh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
