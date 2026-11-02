import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student, ParentInfo } from '../../../types';
import { Users, Phone, Mail, MapPin, Briefcase, ArrowLeft, X, Save, User } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  initialData?: ParentInfo | null;
}

export const ParentFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  student,
  initialData
}) => {
  const { classStudents, addParentToStudent, updateParentOfStudent, showToast } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Bố');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [job, setJob] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  // Target student instance
  const currentStudent = student || classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || null;

  useEffect(() => {
    if (student) {
      setSelectedStudentId(student.id);
    } else if (classStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [student, classStudents]);

  useEffect(() => {
    if (initialData) {
      setRelationship(initialData.relationship || 'Bố');
      setFullName(initialData.fullName || '');
      setPhone(initialData.phone || '');
      setJob(initialData.job || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || currentStudent?.studentAddress || '');
      setIsPrimary(initialData.isPrimary ?? false);
      setNote(initialData.note || '');
    } else {
      // Smart default: If student already has a Father, default to Mother, and vice-versa
      const existingParents = currentStudent?.parents || [];
      const hasFather = existingParents.some(p => p.relationship === 'Bố');
      const hasMother = existingParents.some(p => p.relationship === 'Mẹ');
      if (hasFather && !hasMother) {
        setRelationship('Mẹ');
      } else {
        setRelationship('Bố');
      }
      setFullName('');
      setPhone('');
      setJob('');
      setEmail('');
      setAddress(currentStudent?.studentAddress || '');
      setIsPrimary(existingParents.length === 0);
      setNote('');
    }
  }, [initialData, currentStudent, isOpen]);

  // Auto-detect gender relationship as teacher types parent name
  const handleNameChange = (val: string) => {
    setFullName(val);
    const lower = val.toLowerCase();
    if (/(\bthị\b|\blan\b|\bmai\b|\bhoa\b|\bhương\b|\bhằng\b|\bnga\b|\btrang\b|\bhiền\b|\blinh\b|\bthảo\b|\bhạnh\b|\bdung\b|\bbích\b|\bloan\b|\bthủy\b|\bthu\b)/i.test(lower)) {
      if (relationship === 'Bố') setRelationship('Mẹ');
    } else if (/(\bvăn\b|\bhùng\b|\bbình\b|\bdũng\b|\bnam\b|\bcường\b|\btuấn\b|\bthắng\b|\bđạt\b|\bsơn\b|\blong\b|\bminh\b|\bquang\b|\bhải\b|\bđức\b)/i.test(lower)) {
      if (relationship === 'Mẹ') setRelationship('Bố');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = currentStudent;
    if (!targetStudent) {
      showToast('Vui lòng chọn học sinh tương ứng!', 'error');
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showToast('Vui lòng nhập họ và tên phụ huynh', 'error');
      return;
    }
    if (!trimmedPhone) {
      showToast('Vui lòng nhập số điện thoại phụ huynh', 'error');
      return;
    }

    const payload = {
      relationship,
      fullName: trimmedName,
      phone: trimmedPhone,
      job: job.trim(),
      email: email.trim(),
      address: address.trim(),
      isPrimary,
      note: note.trim()
    };

    if (initialData) {
      updateParentOfStudent(targetStudent.id, initialData.id, payload);
      showToast(`Đã cập nhật thông tin phụ huynh cho em ${targetStudent.fullName}`, 'success');
    } else {
      addParentToStudent(targetStudent.id, payload);
      showToast(`Đã thêm phụ huynh (${relationship}: ${trimmedName}) cho em ${targetStudent.fullName}`, 'success');
    }

    onClose();
  };

  const RELATIONSHIP_OPTIONS = ['Bố', 'Mẹ', 'Người giám hộ', 'Ông / Bà', 'Khác'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header with Back button and Title */}
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#142244] rounded-xl transition-colors cursor-pointer"
              title="Quay về"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{initialData ? 'Chỉnh sửa thông tin Phụ huynh' : 'Thêm Phụ huynh mới'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentStudent ? (
                  <>Học sinh: <span className="font-semibold text-cyan-300">{currentStudent.fullName}</span> ({currentStudent.studentCode})</>
                ) : 'Vui lòng chọn học sinh'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#142244] rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Target Student Selector (if not locked to a specific student) */}
          {!student && classStudents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Học sinh tương ứng (Con em) *</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/40 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30 cursor-pointer"
              >
                {classStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} — Mã số: {st.studentCode} ({st.gender === 'male' ? 'Nam' : 'Nữ'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Relationship selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mối quan hệ với học sinh *
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRelationship(opt)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    relationship === opt
                      ? opt === 'Mẹ'
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400'
                        : opt === 'Bố'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400'
                        : 'bg-cyan-500 text-slate-950 shadow-lg border border-cyan-300'
                      : 'bg-[#142244] text-slate-300 hover:bg-[#1a2d5a] border border-cyan-500/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Họ và tên phụ huynh *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Lê Thị Lan / Trần Văn Bình"
                value={fullName}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>Số điện thoại *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="VD: 0912345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Job & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-cyan-400" />
                <span>Nghề nghiệp / Công tác</span>
              </label>
              <input
                type="text"
                placeholder="VD: Kỹ sư, Bác sĩ, Kinh doanh..."
                value={job}
                onChange={e => setJob(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-cyan-400" />
                <span>Email phụ huynh</span>
              </label>
              <input
                type="email"
                placeholder="VD: phuhuynh@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Địa chỉ thường trú / Liên lạc</span>
            </label>
            <input
              type="text"
              placeholder="VD: Số 12 phố Lê Lợi, Hà Nội"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ghi chú thêm về phụ huynh
            </label>
            <input
              type="text"
              placeholder="VD: Ban đại diện CMHS, liên hệ giờ hành chính..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          {/* Primary contact checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={e => setIsPrimary(e.target.checked)}
                className="w-4 h-4 text-cyan-400 rounded border-cyan-500/40 bg-[#070d1e] focus:ring-cyan-500 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                Đặt làm người liên hệ chính khi nhà trường thông báo
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialData ? 'Lưu thay đổi' : 'Thêm phụ huynh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
