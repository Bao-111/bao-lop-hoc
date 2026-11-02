import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Shuffle, Users, Copy, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Student } from '../../../types';
import { Avatar } from '../../ui/Avatar';

export const GroupGeneratorView: React.FC = () => {
  const { activeClass, classStudents, setActiveTab, showToast } = useApp();
  const [groupCount, setGroupCount] = useState<number>(4);
  const [copied, setCopied] = useState<boolean>(false);

  // Active students only
  const activeStudents = useMemo(() => {
    return classStudents.filter(s => s.status === 'active');
  }, [classStudents]);

  // Seeded / shuffled groups
  const [groups, setGroups] = useState<{ id: number; name: string; members: Student[] }[]>([]);

  const handleGenerateGroups = () => {
    if (activeStudents.length === 0) {
      showToast('Lớp chưa có học sinh nào để chia nhóm', 'warning');
      return;
    }

    const shuffled = [...activeStudents].sort(() => Math.random() - 0.5);
    const count = Math.max(2, Math.min(groupCount, activeStudents.length));
    const result: { id: number; name: string; members: Student[] }[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Nhóm ${i + 1}`,
      members: []
    }));

    shuffled.forEach((student, index) => {
      const targetGroup = index % count;
      result[targetGroup].members.push(student);
    });

    setGroups(result);
    showToast(`Đã chia ${activeStudents.length} học sinh thành ${count} nhóm công bằng`, 'success');
  };

  const handleCopyToClipboard = () => {
    if (groups.length === 0) return;
    const text = groups
      .map(
        g =>
          `📌 ${g.name} (${g.members.length} thành viên):\n` +
          g.members.map((m, i) => `   ${i + 1}. ${m.fullName} (${m.studentCode})`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Đã sao chép danh sách nhóm vào clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* 1-ROW TOOLBAR */}
      <div className="bg-[#0b1329] p-2.5 sm:p-3 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-2 overflow-x-auto">
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
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <span>Chia nhóm ngẫu nhiên</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              {activeClass?.name} ({activeStudents.length} HS)
            </span>
          </div>
        </div>

        {/* Configuration Bar on single row */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Số nhóm:</span>
            <select
              value={groupCount}
              onChange={e => setGroupCount(Number(e.target.value))}
              className="px-2.5 py-1 text-xs font-bold border border-cyan-500/30 rounded-xl bg-[#142244] text-cyan-300 focus:outline-none cursor-pointer"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>
                  {n} nhóm
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateGroups}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chia nhóm</span>
          </button>

          {groups.length > 0 && (
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-200 bg-[#142244] border border-cyan-500/30 hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer shrink-0"
              title="Sao chép danh sách chia nhóm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Groups Display Grid */}
      {groups.length === 0 ? (
        <div className="bg-[#0b1329] p-10 rounded-2xl border border-cyan-500/30 shadow-lg text-center">
          <Users className="w-12 h-12 mx-auto text-cyan-400/50 mb-3" />
          <h3 className="text-sm font-bold text-white">Chưa chia nhóm</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Chọn số lượng nhóm mong muốn ở trên và nhấn "Chia nhóm" để tự động chia đều học sinh trong lớp.
          </p>
          <button
            onClick={handleGenerateGroups}
            className="mt-4 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bắt đầu chia nhóm</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {groups.map(grp => (
            <div
              key={grp.id}
              className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 p-3.5 shadow-lg flex flex-col"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#142244] border border-cyan-500/40 text-xs font-black text-cyan-300 flex items-center justify-center">
                    {grp.id}
                  </span>
                  <h3 className="text-sm font-black text-white">{grp.name}</h3>
                </div>
                <span className="text-[11px] font-bold text-cyan-300 font-mono bg-[#142244] px-2 py-0.5 rounded-lg border border-cyan-500/30">
                  {grp.members.length} HS
                </span>
              </div>

              <div className="space-y-1.5 flex-1 max-h-72 overflow-y-auto pr-0.5">
                {grp.members.map((m, mIdx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-1.5 rounded-xl bg-[#070d1e]/80 border border-cyan-500/15 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-cyan-400/80 font-mono w-4 shrink-0">{mIdx + 1}.</span>
                      <Avatar name={m.fullName} avatarUrl={m.avatarUrl} gender={m.gender} size="xs" />
                      <span className="font-bold text-slate-100 truncate">{m.fullName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">{m.studentCode}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
