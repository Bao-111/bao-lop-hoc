import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, X, Save, ArrowLeft, Camera } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { teacher, updateTeacherProfile, showToast } = useApp();
  const [formData, setFormData] = useState({
    name: teacher.name,
    email: teacher.email,
    schoolName: teacher.schoolName,
    subject: teacher.subject,
    academicYear: teacher.academicYear,
    avatarUrl: teacher.avatarUrl || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập họ và tên giáo viên', 'error');
      return;
    }
    updateTeacherProfile(formData);
    showToast('Đã lưu thông tin hồ sơ giáo viên thành công', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">Hồ sơ Giáo viên</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-[#142244] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Avatar Hero */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#070d1e] rounded-xl border border-cyan-500/20">
            <Avatar name={formData.name || teacher.name} avatarUrl={formData.avatarUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Liên kết ảnh đại diện (Avatar URL)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.avatarUrl}
                onChange={e => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#0b1329] border border-cyan-500/30 rounded-lg text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và tên giáo viên *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Trường học</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email liên hệ</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Môn giảng dạy</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Năm học</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={e => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thông tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
