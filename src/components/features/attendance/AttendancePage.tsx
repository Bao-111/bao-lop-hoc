import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../../types';
import {
  BookCheck,
  Calendar,
  Check,
  Save,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export const AttendancePage: React.FC = () => {
  const { activeClass, classStudents, attendance, saveAttendanceRecords, setActiveTab, showToast } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon'>('morning');

  // Draft records mapped by studentId
  const [draftRecords, setDraftRecords] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >(() => {
    const existing = attendance.filter(
      a =>
        a.classId === activeClass?.id &&
        a.date === new Date().toISOString().split('T')[0] &&
        a.session === 'morning'
    );
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    classStudents.forEach(s => {
      const match = existing.find(e => e.studentId === s.id);
      initialMap[s.id] = {
        status: match ? match.status : 'present',
        note: match ? match.note || '' : ''
      };
    });

    return initialMap;
  });

  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Sync draftRecords when date or session changes
  const handleDateOrSessionChange = (newDate: string, newSession: 'morning' | 'afternoon') => {
    setSelectedDate(newDate);
    setSelectedSession(newSession);

    const existing = attendance.filter(
      a => a.classId === activeClass?.id && a.date === newDate && a.session === newSession
    );
    const updatedMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    classStudents.forEach(s => {
      const match = existing.find(e => e.studentId === s.id);
      updatedMap[s.id] = {
        status: match ? match.status : 'present',
        note: match ? match.note || '' : ''
      };
    });

    setDraftRecords(updatedMap);
    setIsDirty(false);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setIsDirty(true);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setDraftRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note
      }
    }));
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach(s => {
      allPresent[s.id] = {
        status: 'present',
        note: draftRecords[s.id]?.note || ''
      };
    });
    setDraftRecords(allPresent);
    setIsDirty(true);
    showToast('Đã đánh dấu tất cả có mặt', 'info');
  };

  // Quick stats computed from draftRecords
  const stats = useMemo(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;
    let early = 0;

    Object.values(draftRecords).forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'excused') excused++;
      else if (r.status === 'unexcused') unexcused++;
      else if (r.status === 'late') late++;
      else if (r.status === 'early_leave') early++;
    });

    const total = classStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return { present, excused, unexcused, late, early, rate };
  }, [draftRecords, classStudents.length]);

  // Students with 2+ unexcused absences
  const frequentAbsentees = useMemo(() => {
    return classStudents
      .map(s => {
        const count = attendance.filter(
          a => a.studentId === s.id && (a.status === 'unexcused' || a.status === 'late')
        ).length;
        return { student: s, count };
      })
      .filter(item => item.count >= 2);
  }, [classStudents, attendance]);

  const handleSave = () => {
    if (!activeClass) return;

    const payload: AttendanceRecord[] = classStudents.map(s => ({
      id: `att-${activeClass.id}-${selectedDate}-${selectedSession}-${s.id}`,
      classId: activeClass.id,
      studentId: s.id,
      date: selectedDate,
      session: selectedSession,
      status: draftRecords[s.id]?.status || 'present',
      note: draftRecords[s.id]?.note || '',
      recordedAt: new Date().toISOString(),
      recordedBy: 'Giáo viên'
    }));

    saveAttendanceRecords(payload);
    showToast(`Đã lưu dữ liệu điểm danh ${selectedDate}`, 'success');
    setIsDirty(false);
  };

  return (
    <div className="space-y-3.5">
      {/* 1-ROW TOOLBAR: Điểm danh chuyên cần */}
      <div className="bg-[#0b1329] p-2.5 sm:p-3 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap">
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
              <BookCheck className="w-4 h-4 text-emerald-400" />
              <span>Điểm danh chuyên cần</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              Lớp {activeClass?.name}
            </span>
          </div>
        </div>

        {/* Date, Session, Real-Time Dynamic Attendance Status Badge, and Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[#070d1e] border border-cyan-500/30 px-2.5 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateOrSessionChange(e.target.value, selectedSession)}
              className="text-xs font-bold bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Session Picker */}
          <select
            value={selectedSession}
            onChange={e => handleDateOrSessionChange(selectedDate, e.target.value as any)}
            className="px-2.5 py-1 text-xs font-bold border border-cyan-500/30 rounded-xl bg-[#070d1e] text-cyan-300 focus:outline-none cursor-pointer"
          >
            <option value="morning">Buổi Sáng</option>
            <option value="afternoon">Buổi Chiều</option>
          </select>

          {/* HUY HIỆU TRẠNG THÁI ĐIỂM DANH THỰC TẾ (CẬP NHẬT LIVE KHI CÓ HỌC SINH ĐI TRỄ / NGHỈ HỌC) */}
          {stats.unexcused === 0 && stats.excused === 0 && stats.late === 0 && stats.early === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded-xl shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span>Có mặt đầy đủ ({stats.present}/{classStudents.length})</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border shadow-xs ${
                stats.unexcused > 0
                  ? 'text-rose-300 bg-rose-950/80 border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'text-amber-300 bg-amber-950/80 border-amber-500/50 ring-1 ring-amber-500/30'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {stats.late > 0 && <span className="font-black text-amber-300">{stats.late} đi trễ</span>}
                {stats.late > 0 && (stats.unexcused > 0 || stats.excused > 0) && ' • '}
                {stats.unexcused > 0 && <span className="font-black text-rose-300">{stats.unexcused} không phép</span>}
                {stats.unexcused > 0 && stats.excused > 0 && ' • '}
                {stats.excused > 0 && <span className="font-black text-cyan-300">{stats.excused} có phép</span>}
                {' '}<span className="text-slate-300 font-normal">({stats.present}/{classStudents.length} đúng giờ)</span>
              </span>
            </div>
          )}

          {/* NÚT THAO TÁC: ĐIỂM DANH NHANH CẢ LỚP (RÕ RÀNG LÀ HÀNH ĐỘNG CLICK, KHÔNG GÂY HIỂU LẦM LÀ NHÃN TRẠNG THÁI) */}
          <button
            type="button"
            onClick={handleMarkAllPresent}
            title="Đánh dấu tất cả học sinh trong lớp là Có mặt"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-200 bg-[#07243d] hover:bg-[#0c375c] border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Điểm danh nhanh cả lớp</span>
          </button>

          {/* Nút lưu */}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 animate-pulse'
                : 'bg-[#142244] text-slate-200 border border-cyan-500/30 hover:bg-[#1a2d5a]'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isDirty ? 'Lưu thay đổi *' : 'Đã lưu'}</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Bar - Bố cục rõ ràng, sắc nét */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Có mặt đúng giờ</span>
          <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
            {stats.present} <span className="text-xs text-slate-400 font-medium font-sans">/ {classStudents.length}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border shadow-sm transition-colors ${
          stats.excused > 0 ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-[#0b1329] border-cyan-500/20'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400">Vắng có phép</span>
          <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">{stats.excused}</div>
        </div>
        <div className={`p-3 rounded-xl border shadow-sm transition-colors ${
          stats.unexcused > 0 ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/30' : 'bg-[#0b1329] border-cyan-500/20'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400">Không phép</span>
          <div className="text-xl font-black font-mono text-rose-400 mt-0.5">{stats.unexcused}</div>
        </div>
        <div className={`p-3 rounded-xl border shadow-sm transition-colors ${
          stats.late > 0 ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30' : 'bg-[#0b1329] border-cyan-500/20'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400">Đi trễ</span>
          <div className="text-xl font-black font-mono text-amber-400 mt-0.5">{stats.late}</div>
        </div>
        <div className={`p-3 rounded-xl border shadow-sm transition-colors ${
          stats.early > 0 ? 'bg-purple-950/40 border-purple-500/60' : 'bg-[#0b1329] border-cyan-500/20'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400">Về sớm</span>
          <div className="text-xl font-black font-mono text-purple-400 mt-0.5">{stats.early}</div>
        </div>
        <div className="bg-[#0b1329] p-3 rounded-xl border border-cyan-500/20 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Chuyên cần</span>
          <div className="text-xl font-black font-mono text-white mt-0.5">{stats.rate}%</div>
        </div>
      </div>

      {/* Frequent Absence Warnings (if any) */}
      {frequentAbsentees.length > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300">Cảnh báo học sinh nghỉ học nhiều</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {frequentAbsentees.map(item => (
                <span
                  key={item.student.id}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#070d1e] border border-amber-500/30 text-amber-300"
                >
                  {item.student.fullName} ({item.count} buổi vắng)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070d1e] border-b border-cyan-500/20 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Học sinh</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3 text-center">Trạng thái điểm danh</th>
                <th className="py-2.5 px-3">Lý do / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {classStudents.map((student, idx) => {
                const currentDraft = draftRecords[student.id] || { status: 'present', note: '' };

                return (
                  <tr key={student.id} className="hover:bg-[#142244]/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-cyan-400/80">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={student.fullName} avatarUrl={student.avatarUrl} gender={student.gender} size="xs" />
                        <span className="font-bold text-white">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                      {student.studentCode}
                    </td>

                    {/* Single-Click Interactive Status Pills */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            currentDraft.status === 'present'
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                              : 'bg-[#142244] text-slate-300 hover:text-white hover:bg-[#1c3060]'
                          }`}
                        >
                          Có mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'excused')}
                          className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            currentDraft.status === 'excused'
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                              : 'bg-[#142244] text-slate-300 hover:text-white hover:bg-[#1c3060]'
                          }`}
                        >
                          Có phép
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'unexcused')}
                          className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            currentDraft.status === 'unexcused'
                              ? 'bg-rose-500 text-white font-black shadow-sm'
                              : 'bg-[#142244] text-slate-300 hover:text-white hover:bg-[#1c3060]'
                          }`}
                        >
                          Không phép
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            currentDraft.status === 'late'
                              ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                              : 'bg-[#142244] text-slate-300 hover:text-white hover:bg-[#1c3060]'
                          }`}
                        >
                          Đi trễ
                        </button>
                      </div>
                    </td>

                    {/* Reason input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder={currentDraft.status !== 'present' ? 'Ghi rõ lý do...' : 'Ghi chú (nếu có)'}
                        value={currentDraft.note}
                        onChange={e => handleNoteChange(student.id, e.target.value)}
                        className={`w-full px-2.5 py-1 border rounded-lg text-xs bg-[#070d1e] text-white focus:outline-none focus:border-cyan-400 ${
                          currentDraft.status !== 'present' ? 'border-amber-400/60 bg-amber-950/20 text-amber-200' : 'border-cyan-500/30'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
