import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student, ParentInfo } from '../../../types';
import * as XLSX from 'xlsx';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  ArrowLeft,
  ChevronDown,
  UserPlus,
  CheckCircle2,
  Send,
  Heart,
  School,
  Smartphone,
  ShieldCheck,
  MessageCircle,
  X,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { StudentFormModal } from './StudentFormModal';
import { ImportStudentsModal } from './ImportStudentsModal';
import { ParentFormModal } from './ParentFormModal';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { Avatar } from '../../ui/Avatar';

export const StudentsPage: React.FC = () => {
  const {
    classes,
    activeClassId,
    activeClass,
    setActiveClassId,
    classStudents,
    deleteStudent,
    deleteMultipleStudents,
    deleteAllStudentsInClass,
    deleteParentOfStudent,
    deleteAllParentsInClass,
    toggleParentRelationship,
    setActiveTab,
    showToast,
    userRole
  } = useApp();

  const isManager = userRole === 'teacher' || userRole === 'admin';

  // Main Tabs: 'students' (Danh sách học sinh) vs 'parents' (Thông tin phụ huynh)
  const [activeMainTab, setActiveMainTab] = useState<'parents' | 'students'>('students');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  const [filterAppStatus, setFilterAppStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');
  const [studentViewMode, setStudentViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Parent modal state
  const [parentModalStudent, setParentModalStudent] = useState<Student | null>(null);
  const [editingParentData, setEditingParentData] = useState<ParentInfo | null>(null);
  const [deletingParentInfo, setDeletingParentInfo] = useState<{ student: Student; parent: ParentInfo } | null>(null);

  // Broadcast modal state (Gửi tin nhắn cả lớp)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Bulk actions state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isDeleteAllStudentsModalOpen, setIsDeleteAllStudentsModalOpen] = useState(false);
  const [isDeleteAllParentsModalOpen, setIsDeleteAllParentsModalOpen] = useState(false);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);

  // Extract all parents with their linked student
  const allParentsInClass = useMemo(() => {
    const list: { parent: ParentInfo; student: Student }[] = [];
    classStudents.forEach(student => {
      const parents = student.parents && student.parents.length > 0
        ? student.parents
        : student.parentName || student.parentPhone
        ? [
            {
              id: `legacy-${student.id}`,
              relationship: student.parentRelationship || 'Bố',
              fullName: student.parentName || 'Chưa cập nhật',
              phone: student.parentPhone || '',
              job: student.parentJob,
              email: student.parentEmail,
              address: student.parentAddress,
              isPrimary: true
            }
          ]
        : [];

      parents.forEach(p => {
        list.push({ parent: p, student });
      });
    });
    return list;
  }, [classStudents]);

  // Compute 4 statistics cards matching screenshot
  const parentStats = useMemo(() => {
    const total = allParentsInClass.length;
    const fatherCount = allParentsInClass.filter(p => p.parent.relationship === 'Bố').length;
    const motherCount = allParentsInClass.filter(p => p.parent.relationship === 'Mẹ').length;
    const connectedCount = allParentsInClass.filter(p => p.student.parentAppStatus !== 'not_connected').length;
    const withPhoneCount = allParentsInClass.filter(p => !!p.parent.phone && p.parent.phone.trim().length > 0).length;
    const phonePercent = total > 0 ? Math.round((withPhoneCount / total) * 100) : 100;
    const connectedPercent = total > 0 ? Math.round((connectedCount / total) * 100) : 100;

    // Detect PTA (Ban đại diện CMHS)
    const truongBan = allParentsInClass.find(p => p.parent.fullName.includes('Kiên') || p.parent.note?.includes('Trưởng ban'))?.parent.fullName || 'Trần Văn Kiên';
    const phoBan = allParentsInClass.find(p => p.parent.fullName.includes('Loan') || p.parent.note?.includes('Phó ban'))?.parent.fullName || 'Vũ Thị Loan';

    return {
      total,
      fatherCount,
      motherCount,
      connectedCount,
      connectedPercent,
      withPhoneCount,
      phonePercent,
      truongBan,
      phoBan
    };
  }, [allParentsInClass]);

  // Filtered Parents
  const filteredParents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allParentsInClass.filter(item => {
      const p = item.parent;
      const s = item.student;
      const matchQuery =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.job && p.job.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q);

      const matchRel =
        filterRelationship === 'all' ||
        p.relationship === filterRelationship;

      const matchApp =
        filterAppStatus === 'all' ||
        (filterAppStatus === 'connected' && s.parentAppStatus !== 'not_connected') ||
        (filterAppStatus === 'not_connected' && s.parentAppStatus === 'not_connected');

      return matchQuery && matchRel && matchApp;
    });
  }, [allParentsInClass, searchQuery, filterRelationship, filterAppStatus]);

  // Filtered & Sorted student list
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classStudents
      .filter(s => {
        const parents = s.parents || [];
        const matchesParent = parents.some(
          p =>
            p.fullName.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            (p.job && p.job.toLowerCase().includes(q))
        );

        const matchesQuery =
          !q ||
          s.fullName.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          (s.parentPhone && s.parentPhone.includes(q)) ||
          (s.parentName && s.parentName.toLowerCase().includes(q)) ||
          matchesParent;

        const matchesGender = filterGender === 'all' || s.gender === filterGender;
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

        return matchesQuery && matchesGender && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const aParts = a.fullName.split(' ');
          const bParts = b.fullName.split(' ');
          const aLastName = aParts[aParts.length - 1];
          const bLastName = bParts[bParts.length - 1];
          return aLastName.localeCompare(bLastName, 'vi');
        }
        return a.studentCode.localeCompare(b.studentCode);
      });
  }, [classStudents, searchQuery, filterGender, filterStatus, sortBy]);

  // Export to Excel
  const handleExportExcel = () => {
    try {
      if (activeMainTab === 'parents') {
        const dataToExport = allParentsInClass.map((item, idx) => ({
          STT: idx + 1,
          'Phụ huynh đại diện': item.parent.fullName,
          'Quan hệ': item.parent.relationship,
          'Số điện thoại': item.parent.phone,
          'Học sinh (Con)': item.student.fullName,
          'Mã học sinh': item.student.studentCode,
          'Nghề nghiệp': item.parent.job || '',
          'Email': item.parent.email || '',
          'Địa chỉ': item.parent.address || '',
          'SmartClass App': item.student.parentAppStatus !== 'not_connected' ? 'Đã kết nối' : 'Chưa kết nối'
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Phu_Huynh_${activeClass?.name || 'Lop'}`);
        XLSX.writeFile(wb, `Danh_sach_Phu_huynh_Lop_${activeClass?.name || 'Lop'}.xlsx`);
      } else {
        const dataToExport = classStudents.map((s, idx) => {
          const parents = s.parents || [];
          const parentsStr = parents.map(p => `${p.relationship}: ${p.fullName} (${p.phone})`).join('; ');
          return {
            STT: idx + 1,
            'Mã học sinh': s.studentCode,
            'Họ và tên': s.fullName,
            'Giới tính': s.gender === 'male' ? 'Nam' : 'Nữ',
            'Ngày sinh': s.birthDate || '',
            'Trạng thái': s.status === 'active' ? 'Đang học' : 'Nghỉ học',
            'Phụ huynh': parentsStr,
            'Địa chỉ': s.studentAddress || ''
          };
        });
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Hoc_Sinh_${activeClass?.name || 'Lop'}`);
        XLSX.writeFile(wb, `Danh_sach_Hoc_sinh_Lop_${activeClass?.name || 'Lop'}.xlsx`);
      }
      showToast('Đã xuất danh bạ ra tệp Excel thành công', 'success');
    } catch {
      showToast('Lỗi khi xuất tệp Excel', 'error');
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast('Vui lòng nhập nội dung tin nhắn', 'warning');
      return;
    }
    showToast(`Đã gửi tin nhắn tới toàn bộ ${allParentsInClass.length} phụ huynh Lớp ${activeClass?.name}`, 'success');
    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3.5">
      {/* 1 DÒNG DUY NHẤT CHO HỌC SINH VÀ PHỤ HUYNH (THEO ĐÚNG YÊU CẦU NGƯỜI DÙNG) */}
      <div className="bg-[#0b1329] p-2 sm:p-2.5 rounded-2xl border border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
          {/* 1. Tab Switcher Học sinh / Phụ huynh */}
          <div className="flex items-center gap-1 shrink-0 bg-[#070d1e] p-1 rounded-xl border border-cyan-500/20">
            <button
              type="button"
              onClick={() => setActiveMainTab('students')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeMainTab === 'students'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#142244]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Học sinh</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeMainTab === 'students' ? 'bg-slate-950 text-cyan-300' : 'bg-[#142244] text-slate-300'
              }`}>
                {classStudents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('parents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeMainTab === 'parents'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#142244]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeMainTab === 'parents' ? 'fill-white' : 'text-pink-400'}`} />
              <span>Phụ huynh</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeMainTab === 'parents' ? 'bg-white/20 text-white' : 'bg-pink-950 text-pink-300 border border-pink-500/30'
              }`}>
                {allParentsInClass.length}
              </span>
            </button>
          </div>

          {/* 2. Lớp học selector */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-200">
            <span className="text-cyan-400 font-bold">Lớp:</span>
            <select
              value={activeClassId}
              onChange={e => setActiveClassId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount || 20} HS)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Search Box */}
          <div className="relative min-w-[200px] max-w-[260px] shrink-0">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={
                activeMainTab === 'parents'
                  ? 'Tìm tên PH, SĐT, tên con...'
                  : 'Tìm tên HS, mã HS, SĐT...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {activeMainTab === 'parents' ? (
            <>
              {/* Quan hệ filter */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-200">
                <span className="text-slate-400">Quan hệ:</span>
                <select
                  value={filterRelationship}
                  onChange={e => setFilterRelationship(e.target.value)}
                  className="px-2 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả mối quan hệ</option>
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Người giám hộ">Người giám hộ</option>
                  <option value="Ông / Bà">Ông / Bà</option>
                </select>
              </div>

              {/* App SmartClass filter */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-200">
                <span className="text-slate-400">App:</span>
                <select
                  value={filterAppStatus}
                  onChange={e => setFilterAppStatus(e.target.value)}
                  className="px-2 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="connected">Đã kết nối App</option>
                  <option value="not_connected">Chưa kết nối</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Giới tính */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-200">
                <span className="text-slate-400">Giới tính:</span>
                <select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value as any)}
                  className="px-2 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-200">
                <span className="text-slate-400">Trạng thái:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as any)}
                  className="px-2 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang học</option>
                  <option value="inactive">Nghỉ học</option>
                </select>
              </div>

              {/* Sắp xếp */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-slate-200">
                <span className="text-slate-400">Xếp:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="name">Tên (A-Z)</option>
                  <option value="code">Mã HS</option>
                </select>
              </div>

              {/* Chế độ xem: Bảng / Thẻ */}
              <div className="flex items-center gap-0.5 bg-[#070d1e] p-0.5 rounded-xl border border-cyan-500/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setStudentViewMode('table')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    studentViewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bảng
                </button>
                <button
                  type="button"
                  onClick={() => setStudentViewMode('cards')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    studentViewMode === 'cards' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Thẻ
                </button>
              </div>
            </>
          )}

          {/* Action Buttons on the single row */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {isManager && (
              <>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm học sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParentModalStudent(null);
                    setEditingParentData(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/40 rounded-xl transition-all cursor-pointer"
                  title="Thêm phụ huynh mới"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Thêm phụ huynh</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-200 bg-[#142244] border border-cyan-500/30 hover:bg-[#1a2d5a] hover:text-cyan-200 rounded-xl transition-all cursor-pointer"
              title="Xuất danh bạ ra file Excel"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/50 rounded-xl transition-all cursor-pointer"
              title="Gửi thông báo / tin nhắn tới toàn bộ phụ huynh trong lớp"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nhắn tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. THANH TIỆN ÍCH & CHỈ SỐ NHANH 1 DÒNG (THAY THẾ 4 CARD CỒNG KỀNH, TẬP TRUNG TIỆN ÍCH) */}
      <div className="bg-[#0b1329] px-3.5 py-2 rounded-xl border border-cyan-500/25 shadow-md flex items-center justify-between gap-3 text-xs flex-wrap">
        {/* Left: Tóm tắt chỉ số súc tích */}
        {activeMainTab === 'parents' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{parentStats.total} Phụ huynh</span>
            </span>
            <span className="text-cyan-500/40">•</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>{parentStats.connectedCount} Đã kết nối App ({parentStats.connectedPercent}%)</span>
            </span>
            <span className="text-cyan-500/40">•</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-400" />
              <span>{parentStats.withPhoneCount} Có SĐT</span>
            </span>
            <span className="text-cyan-500/40">•</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
              Trưởng ban: {parentStats.truongBan}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sĩ số: {classStudents.length} học sinh</span>
            </span>
            <span className="text-cyan-500/40">•</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/30">
              {classStudents.filter(s => s.gender === 'male').length} Nam
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/30">
              {classStudents.filter(s => s.gender === 'female').length} Nữ
            </span>
            <span className="text-cyan-500/40">•</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
              Hạnh kiểm Tốt: {classStudents.filter(s => s.conduct === 'Tốt').length} em
            </span>
          </div>
        )}

        {/* Right: Trạng thái hiển thị súc tích */}
        <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 ml-auto">
          <span>Đang hiển thị: <strong className="text-cyan-300">{activeMainTab === 'parents' ? filteredParents.length : filteredStudents.length}</strong> kết quả</span>
        </div>
      </div>

      {/* 6. MAIN CONTENT AREA: PARENTS TABLE VS STUDENTS TABLE */}
      {activeMainTab === 'parents' ? (
        /* ================= PARENTS DIRECTORY TABLE (FROM SCREENSHOT) ================= */
        <div className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070d1e] border-b border-cyan-500/25 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-4">PHỤ HUYNH ĐẠI DIỆN</th>
                  <th className="py-3 px-4">CON (HỌC SINH)</th>
                  <th className="py-3 px-4">SỐ ĐIỆN THOẠI LIÊN HỆ</th>
                  <th className="py-3 px-4 text-center">SMARTCLASS APP</th>
                  <th className="py-3 px-4 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      Không tìm thấy phụ huynh nào phù hợp với bộ lọc hiện tại
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((item, idx) => (
                    <tr
                      key={item.parent.id || idx}
                      className="hover:bg-cyan-950/20 transition-colors"
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Phụ huynh đại diện */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={item.parent.fullName} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-100 text-xs">
                                {item.parent.fullName}
                              </span>
                              {/* Clickable relationship badge with fast toggle */}
                              <button
                                type="button"
                                onClick={() => toggleParentRelationship(item.student.id, item.parent.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 ${
                                  item.parent.relationship === 'Bố'
                                    ? 'bg-blue-950/90 text-blue-300 border border-blue-500/40 hover:bg-blue-900'
                                    : item.parent.relationship === 'Mẹ'
                                    ? 'bg-pink-950/90 text-pink-300 border border-pink-500/40 hover:bg-pink-900'
                                    : 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                                }`}
                                title="Nhấp để đổi nhanh Bố ⇄ Mẹ"
                              >
                                {item.parent.relationship} ⇄
                              </button>
                              {item.parent.isPrimary && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                  Chính
                                </span>
                              )}
                            </div>
                            {item.parent.job && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {item.parent.job}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Con (Học sinh) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={item.student.fullName}
                            avatarUrl={item.student.avatarUrl}
                            gender={item.student.gender}
                            size="xs"
                          />
                          <div>
                            <div className="font-semibold text-slate-200">
                              {item.student.fullName}
                            </div>
                            <div className="text-cyan-400 font-mono text-[10px]">
                              {item.student.studentCode} · Tổ {item.student.studyGroup || '1'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại liên hệ */}
                      <td className="py-3 px-4">
                        {item.parent.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${item.parent.phone}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d1e] border border-cyan-500/30 text-cyan-300 font-mono font-bold hover:bg-[#142244] hover:text-white transition-colors"
                              title="Bấm để gọi điện cho phụ huynh"
                            >
                              <Phone className="w-3 h-3 text-cyan-400" />
                              <span>{item.parent.phone}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Chưa có số</span>
                        )}
                      </td>

                      {/* SmartClass App status */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Đã kết nối App</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.parent.phone && (
                            <a
                              href={`tel:${item.parent.phone}`}
                              className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                              title="Gọi điện"
                            >
                              <Phone className="w-3.5 h-3.5 text-cyan-400" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('portal');
                              showToast(`Mở cổng liên lạc với gia đình em ${item.student.fullName}`, 'info');
                            }}
                            className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                            title="Gửi tin nhắn trực tuyến"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setParentModalStudent(item.student);
                              setEditingParentData(item.parent);
                            }}
                            className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                            title="Chỉnh sửa thông tin phụ huynh"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingParentInfo({ student: item.student, parent: item.parent });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                            title="Xóa phụ huynh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= STUDENTS LIST (TABLE OR CARDS) ================= */
        studentViewMode === 'table' ? (
          <div className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#070d1e] border-b border-cyan-500/25 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={e => {
                          if (e.target.checked) setSelectedStudentIds(filteredStudents.map(s => s.id));
                          else setSelectedStudentIds([]);
                        }}
                        className="w-4 h-4 text-cyan-400 rounded border-cyan-500/40 bg-[#070d1e]"
                      />
                    </th>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">MÃ HS</th>
                    <th className="py-3 px-4">HỌ VÀ TÊN HỌC SINH</th>
                    <th className="py-3 px-3">GIỚI TÍNH</th>
                    <th className="py-3 px-3">NGÀY SINH</th>
                    <th className="py-3 px-4">PHỤ HUYNH ĐẠI DIỆN</th>
                    <th className="py-3 px-4 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                        Không tìm thấy học sinh nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const parents = student.parents || [];

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-cyan-950/20 transition-colors ${isSelected ? 'bg-cyan-950/40' : ''}`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectStudent(student.id)}
                              className="w-4 h-4 text-cyan-400 rounded border-cyan-500/40 bg-[#070d1e] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-cyan-300">{student.studentCode}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar
                                name={student.fullName}
                                avatarUrl={student.avatarUrl}
                                gender={student.gender}
                                size="xs"
                              />
                              <span className="font-bold text-slate-100">{student.fullName}</span>
                              {student.stars > 0 && (
                                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                                  ★{student.stars}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={student.gender === 'male' ? 'text-blue-400 font-medium' : 'text-purple-400 font-medium'}>
                              {student.gender === 'male' ? 'Nam' : 'Nữ'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">
                            {student.birthDate ? new Date(student.birthDate).toLocaleDateString('vi-VN') : '---'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {parents.length === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setParentModalStudent(student);
                                    setEditingParentData(null);
                                  }}
                                  className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                                >
                                  + Thêm PH
                                </button>
                              ) : (
                                parents.map((p, pIdx) => (
                                  <span
                                    key={p.id || pIdx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#070d1e] border border-cyan-500/25 text-[11px]"
                                  >
                                    <span className="font-bold text-slate-300">{p.relationship}:</span>
                                    <span className="text-slate-100 font-medium">{p.fullName}</span>
                                    {p.phone && <span className="text-cyan-400 font-mono text-[10px]">({p.phone})</span>}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setParentModalStudent(student);
                                  setEditingParentData(null);
                                }}
                                className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                                title="Thêm/sửa phụ huynh cho học sinh này"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStudent(student)}
                                className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                                title="Chỉnh sửa hồ sơ học sinh"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingStudent(student)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                                title="Xóa học sinh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards view for students */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStudents.map(student => {
              const parents = student.parents || [];
              const isSelected = selectedStudentIds.includes(student.id);

              return (
                <div
                  key={student.id}
                  className={`bg-[#0b1329] rounded-2xl border transition-all p-4 shadow-lg flex flex-col justify-between ${
                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-cyan-500/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={student.fullName}
                        avatarUrl={student.avatarUrl}
                        gender={student.gender}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-100">{student.fullName}</h3>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#142244] text-cyan-300 font-semibold border border-cyan-500/30">
                            {student.studentCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{student.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                          <span>•</span>
                          <span>{student.birthDate || '---'}</span>
                          <span>•</span>
                          <span className="text-cyan-400 font-medium">Tổ {student.studyGroup || '1'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingStudent(student)}
                        className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-[#142244] rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                        title="Sửa học sinh"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingStudent(student)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-cyan-500/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-300">Phụ huynh ({parents.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setParentModalStudent(student);
                          setEditingParentData(null);
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Thêm PH
                      </button>
                    </div>

                    <div className="space-y-1">
                      {parents.map((p, pIdx) => (
                        <div key={p.id || pIdx} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#070d1e] border border-cyan-500/15">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-slate-300">{p.relationship}:</span>
                            <span className="text-white truncate font-medium">{p.fullName}</span>
                          </div>
                          {p.phone && (
                            <a href={`tel:${p.phone}`} className="text-cyan-300 font-mono font-bold hover:underline">
                              {p.phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODAL GỬI TIN NHẮN CẢ LỚP */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden text-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Gửi Tin Nhắn / Thông Báo Cả Lớp</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-[#070d1e] rounded-xl border border-cyan-500/20 text-slate-300">
                Gửi tới toàn bộ <strong className="text-cyan-300">{allParentsInClass.length} phụ huynh</strong> của Lớp <strong className="text-cyan-300">{activeClass?.name}</strong> qua SmartClass App & SMS.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung tin nhắn / Lời dặn *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Kính gửi quý phụ huynh, xin thông báo tới quý vị kế hoạch học tập..."
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 text-slate-300 bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi tin nhắn ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isAddModalOpen || !!editingStudent}
        initialData={editingStudent}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
      />

      {/* Add / Edit Parent Modal */}
      <ParentFormModal
        isOpen={!!parentModalStudent || editingParentData !== null}
        student={parentModalStudent}
        initialData={editingParentData}
        onClose={() => {
          setParentModalStudent(null);
          setEditingParentData(null);
        }}
      />

      {/* Import Students Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Delete Single Student Confirmation Modal */}
      {deletingStudent && (
        <ConfirmModal
          isOpen={true}
          title="Xác nhận xóa học sinh"
          itemName={deletingStudent.fullName}
          message={`Bạn có chắc chắn muốn xóa học sinh "${deletingStudent.fullName}" (Mã HS: ${deletingStudent.studentCode}) cùng toàn bộ thông tin phụ huynh liên quan khỏi lớp ${activeClass?.name}? Dữ liệu sau khi xóa sẽ không thể phục hồi.`}
          confirmLabel="Xác nhận xóa"
          isDestructive={true}
          onConfirm={() => {
            deleteStudent(deletingStudent.id);
            setDeletingStudent(null);
          }}
          onCancel={() => setDeletingStudent(null)}
        />
      )}

      {/* Delete Single Parent Confirmation Modal */}
      {deletingParentInfo && (
        <ConfirmModal
          isOpen={true}
          title="Xác nhận xóa thông tin phụ huynh"
          itemName={`${deletingParentInfo.parent.relationship}: ${deletingParentInfo.parent.fullName}`}
          message={`Bạn có chắc chắn muốn xóa phụ huynh "${deletingParentInfo.parent.fullName}" (${deletingParentInfo.parent.relationship} của em ${deletingParentInfo.student.fullName})?`}
          confirmLabel="Xác nhận xóa"
          isDestructive={true}
          onConfirm={() => {
            deleteParentOfStudent(deletingParentInfo.student.id, deletingParentInfo.parent.id);
            setDeletingParentInfo(null);
          }}
          onCancel={() => setDeletingParentInfo(null)}
        />
      )}

      {/* Delete Selected Students Modal */}
      <ConfirmModal
        isOpen={isDeleteSelectedModalOpen}
        title="Xác nhận xóa học sinh đã chọn"
        itemName={`${selectedStudentIds.length} học sinh`}
        message={`Bạn có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh đã chọn khỏi danh sách lớp ${activeClass?.name}? Thao tác này sẽ xóa đồng thời thông tin phụ huynh của các học sinh này.`}
        confirmLabel={`Xóa ${selectedStudentIds.length} học sinh`}
        isDestructive={true}
        onConfirm={() => {
          deleteMultipleStudents(selectedStudentIds);
          setSelectedStudentIds([]);
          setIsDeleteSelectedModalOpen(false);
        }}
        onCancel={() => setIsDeleteSelectedModalOpen(false)}
      />

      {/* Delete All Students in Class Modal */}
      <ConfirmModal
        isOpen={isDeleteAllStudentsModalOpen}
        title="CẢNH BÁO: Xóa tất cả học sinh trong lớp"
        itemName={`Lớp ${activeClass?.name}`}
        message={`Thao tác này sẽ xóa TOÀN BỘ ${classStudents.length} học sinh cùng toàn bộ thông tin phụ huynh trong lớp ${activeClass?.name}. Hành động này là không thể khôi phục!`}
        confirmLabel="Tôi hiểu và muốn xóa tất cả học sinh"
        isDestructive={true}
        onConfirm={() => {
          deleteAllStudentsInClass(activeClass?.id || '');
          setSelectedStudentIds([]);
          setIsDeleteAllStudentsModalOpen(false);
        }}
        onCancel={() => setIsDeleteAllStudentsModalOpen(false)}
      />

      {/* Delete All Parents in Class Modal */}
      <ConfirmModal
        isOpen={isDeleteAllParentsModalOpen}
        title="Xác nhận xóa tất cả phụ huynh trong lớp"
        itemName={`Lớp ${activeClass?.name}`}
        message={`Thao tác này sẽ xóa toàn bộ thông tin liên hệ phụ huynh của tất cả ${classStudents.length} học sinh trong lớp ${activeClass?.name}, nhưng vẫn GIỮ LẠI danh sách học sinh.`}
        confirmLabel="Xóa tất cả thông tin phụ huynh"
        isDestructive={true}
        onConfirm={() => {
          deleteAllParentsInClass(activeClass?.id || '');
          setIsDeleteAllParentsModalOpen(false);
        }}
        onCancel={() => setIsDeleteAllParentsModalOpen(false)}
      />
    </div>
  );
};
