import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Classroom, GradeLevel } from '../../../types';
import { School, X, Eye } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Classroom | null;
}

const PRESET_COLORS = [
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#14b8a6'  // Teal
];

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { teacher, createClass, updateClass, showToast } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [grade, setGrade] = useState<GradeLevel>(initialData?.grade || '7');
  const [subject, setSubject] = useState(initialData?.subject || 'Toán học');
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || '2025 - 2026');
  const [room, setRoom] = useState(initialData?.room || '');
  const [color, setColor] = useState(initialData?.color || '#06b6d4');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên lớp học!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        updateClass(initialData.id, {
          name: name.trim(),
          grade,
          subject: subject.trim(),
          academicYear: academicYear.trim(),
          room: room.trim(),
          color,
          description: description.trim()
        });
        showToast(`Đã cập nhật thông tin Lớp ${name}!`, 'success');
      } else {
        createClass({
          name: name.trim(),
          grade,
          subject: subject.trim(),
          academicYear: academicYear.trim(),
          room: room.trim(),
          color,
          description: description.trim(),
          teacherName: teacher.name,
          status: 'active'
        });
        showToast(`Đã tạo mới Lớp ${name} thành công!`, 'success');
      }
      onClose();
    } catch {
      showToast('Có lỗi xảy ra khi lưu lớp học', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-cyan-400" />
            <h3 className="font-black text-sm text-white">
              {initialData ? 'Chỉnh sửa thông tin lớp học' : 'Tạo lớp học mới'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Form Fields & Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Columns */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên lớp học *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 8A1, 9A2..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Khối *</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-cyan-300 font-bold focus:outline-none cursor-pointer"
                  >
                    {['6', '7', '8', '9', '10', '11', '12'].map(g => (
                      <option key={g} value={g}>
                        Khối {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Môn học *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Năm học *</label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Phòng học</label>
                  <input
                    type="text"
                    placeholder="Phòng 204"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">Màu nhận diện</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                        color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0b1329]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Mô tả / Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về đặc điểm học sinh, ban cán sự lớp..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* LIVE PREVIEW COLUMN */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước thẻ lớp học</span>
              </div>

              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-[#070d1e] shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl text-slate-950 font-black text-sm flex items-center justify-center shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {name || '7A?'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Lớp {name || '---'}</h4>
                      <div className="text-xs text-cyan-300 font-bold">{subject} · Khối {grade}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Đang hoạt động
                  </span>
                </div>

                <div className="pt-2.5 border-t border-cyan-500/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phòng học</span>
                    <span className="font-bold text-white">{room || 'Chưa xếp'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Năm học</span>
                    <span className="font-bold text-white">{academicYear}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b1329] border border-cyan-500/20 rounded-xl text-xs text-slate-300 line-clamp-2">
                  {description || 'Chưa có ghi chú về lớp.'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-[#142244] border border-cyan-500/30 rounded-xl hover:bg-[#1a2d5a] transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật lớp' : 'Tạo lớp ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
