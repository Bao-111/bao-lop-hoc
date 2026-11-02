import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Award, Star, History, Sparkles, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../../services/audio';
import { Avatar } from '../../ui/Avatar';

export const BehaviorRewardsPage: React.FC = () => {
  const { activeClass, classStudents, behaviorLogs, addBehaviorRecord, setActiveTab, showToast } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || ''
  );
  const [type, setType] = useState<'reward' | 'infraction'>('reward');
  const [points, setPoints] = useState<number>(1);
  const [rewardTitle, setRewardTitle] = useState('');
  const [note, setNote] = useState('');

  // Sorted students by stars
  const sortedStudents = useMemo(() => {
    return [...classStudents].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  }, [classStudents]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !activeClass) return;

    if (!rewardTitle.trim()) {
      showToast('Vui lòng nhập lý do khen thưởng / nhắc nhở', 'warning');
      return;
    }

    const student = classStudents.find(s => s.id === selectedStudentId);
    addBehaviorRecord({
      studentId: selectedStudentId,
      studentName: student?.fullName || 'Học sinh',
      classId: activeClass.id,
      type,
      points,
      title: rewardTitle.trim(),
      note: note.trim()
    });

    if (type === 'reward') {
      soundManager.playCorrect();
      showToast(`Đã thưởng ${points} sao cho học sinh!`, 'success');
    } else {
      soundManager.playTick();
      showToast(`Đã ghi nhận nhắc nhở nề nếp học sinh`, 'info');
    }

    setRewardTitle('');
    setNote('');
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
              <Award className="w-4 h-4 text-amber-400" />
              <span>Nề nếp & Khen thưởng sao</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              Lớp {activeClass?.name} ({classStudents.length} HS)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Quick Reward Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3.5">
          <h2 className="text-xs font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ghi nhận rèn luyện / Khen thưởng</span>
          </h2>

          <form onSubmit={handleApply} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chọn học sinh *</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-cyan-500/30 rounded-xl bg-[#070d1e] text-white focus:outline-none cursor-pointer"
              >
                {classStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.studentCode}) — Hiện có {st.stars || 0} ★
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Loại ghi nhận</label>
                <div className="flex rounded-xl border border-cyan-500/30 p-0.5 bg-[#070d1e]">
                  <button
                    type="button"
                    onClick={() => setType('reward')}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      type === 'reward' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Khen thưởng
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('infraction')}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      type === 'infraction' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Nhắc nhở
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số sao / điểm</label>
                <select
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-cyan-500/30 rounded-xl bg-[#070d1e] text-cyan-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Sao ★</option>
                  <option value={2}>2 Sao ★★</option>
                  <option value={3}>3 Sao ★★★</option>
                  <option value={5}>5 Sao ★★★★★</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hành vi / Lý do</label>
              <input
                type="text"
                required
                value={rewardTitle}
                onChange={e => setRewardTitle(e.target.value)}
                placeholder="Ví dụ: Xung phong chữa bài khó, giải toán sáng tạo..."
                className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ghi chú thêm</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Lời khen cụ thể của cô..."
                className="w-full px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
                type === 'reward'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              {type === 'reward' ? 'Thưởng sao ngay' : 'Ghi nhận nhắc nhở'}
            </button>
          </form>
        </div>

        {/* Right Column: Leaderboard & Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Star Ranking Leaderboard */}
          <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg">
            <h2 className="text-xs font-black text-white mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Bảng vinh danh sao học tập</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">Top nỗ lực</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {sortedStudents.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-cyan-500/15 bg-[#070d1e]/80 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 text-center font-mono font-bold text-[10px] shrink-0 ${
                        idx === 0 ? 'text-amber-300' : idx === 1 ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <Avatar name={st.fullName} avatarUrl={st.avatarUrl} gender={st.gender} size="xs" />
                    <span className="font-bold text-white truncate">{st.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0 ml-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{st.stars || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg">
            <h2 className="text-xs font-black text-white mb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nhật ký ghi nhận gần đây</span>
            </h2>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {behaviorLogs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">Chưa có bản ghi nào</div>
              ) : (
                behaviorLogs.slice(0, 6).map(log => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl border border-cyan-500/15 bg-[#070d1e]/80 text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {log.studentName} — <span className="font-normal text-slate-300">{log.title}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400/80 font-mono">{log.date}</div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {log.type === 'reward' ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-950/80 text-amber-300 border border-amber-500/30 font-mono">
                          +{log.points} ★
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/30 font-mono">
                          -{log.points}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
