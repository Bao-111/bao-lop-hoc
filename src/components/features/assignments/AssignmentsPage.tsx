import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Assignment, AssignmentStatus } from '../../../types';
import { BookOpen, Plus, Clock, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';

export const AssignmentsPage: React.FC = () => {
  const { activeClass, assignments, createAssignment, updateAssignment, deleteAssignment, setActiveTab, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<AssignmentStatus>('assigned');

  // Filter assignments by activeClass
  const classAssignments = assignments.filter(a => a.classId === activeClass?.id);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setTitle('');
    setDescription('');
    // Default deadline: tomorrow at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    setDeadline(d.toISOString().slice(0, 16));
    setStatus('assigned');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setDescription(asg.description);
    setDeadline(new Date(asg.deadline).toISOString().slice(0, 16));
    setStatus(asg.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;

    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài tập', 'warning');
      return;
    }

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        status
      });
      showToast('Đã cập nhật bài tập thành công', 'success');
    } else {
      createAssignment({
        classId: activeClass.id,
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        status,
        pointsMax: 10
      });
      showToast('Đã giao bài tập mới cho cả lớp', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* 1-ROW TOOLBAR */}
      <div className="bg-[#0b1329] p-2.5 sm:p-3 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-1.5 text-cyan-300 hover:text-white bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer shrink-0 border border-cyan-500/30"
            title="Quay về Bàn làm việc"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Bài tập về nhà & Dự án</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              Lớp {activeClass?.name} ({classAssignments.length} bài)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Assignments List */}
      {classAssignments.length === 0 ? (
        <div className="bg-[#0b1329] p-10 rounded-2xl border border-cyan-500/30 shadow-lg text-center">
          <BookOpen className="w-10 h-10 mx-auto text-cyan-400/50 mb-2" />
          <h3 className="text-sm font-bold text-white">Chưa có bài tập nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Lớp {activeClass?.name} hiện chưa được giao bài tập. Nhấn nút bên dưới để tạo bài tập mới.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bài tập đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {classAssignments.map(asg => {
            const isOverdue = new Date(asg.deadline) < new Date() && asg.status !== 'graded';
            return (
              <div
                key={asg.id}
                className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg p-4 flex flex-col justify-between hover:border-cyan-400/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
                      Thang điểm {asg.pointsMax}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        asg.status === 'graded'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : isOverdue
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {asg.status === 'graded' ? 'Đã chấm' : isOverdue ? 'Quá hạn' : 'Đang giao'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hạn: {new Date(asg.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1.5 text-cyan-300 hover:text-white bg-[#142244] hover:bg-[#1a2d5a] rounded-lg transition-colors cursor-pointer"
                      title="Sửa bài tập"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAssignment(asg)}
                      className="p-1.5 text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 rounded-lg transition-colors cursor-pointer border border-rose-500/30"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between">
              <h3 className="font-black text-sm text-white">
                {editingAssignment ? 'Chỉnh sửa bài tập' : 'Giao bài tập mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tiêu đề bài tập *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phiếu bài tập tuần 6 - Định lý Talet..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Yêu cầu & Nội dung</label>
                <textarea
                  rows={3}
                  placeholder="Chi tiết câu hỏi hoặc hướng dẫn giải bài..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Hạn nộp bài</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as AssignmentStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-cyan-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="assigned">Đang giao</option>
                    <option value="draft">Bản nháp</option>
                    <option value="graded">Đã chấm xong</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 bg-[#142244] border border-cyan-500/30 rounded-xl hover:bg-[#1a2d5a] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl shadow-md cursor-pointer"
                >
                  {editingAssignment ? 'Lưu thay đổi' : 'Giao bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingAssignment && (
        <ConfirmModal
          isOpen={true}
          title="Xác nhận xóa bài tập"
          itemName={deletingAssignment.title}
          message="Bạn có chắc chắn muốn xóa bài tập này khỏi hệ thống?"
          confirmLabel="Xóa bài tập"
          isDestructive={true}
          onConfirm={() => {
            deleteAssignment(deletingAssignment.id);
            setDeletingAssignment(null);
          }}
          onCancel={() => setDeletingAssignment(null)}
        />
      )}
    </div>
  );
};
