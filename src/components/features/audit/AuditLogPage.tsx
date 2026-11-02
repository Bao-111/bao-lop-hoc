import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { History, Search, ShieldCheck, ArrowLeft } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditLogs.filter(log => {
      const matchQ =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.targetName.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));

      const matchMod = filterModule === 'all' || log.module === filterModule;
      return matchQ && matchMod;
    });
  }, [auditLogs, searchQuery, filterModule]);

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
              <History className="w-4 h-4 text-cyan-400" />
              <span>Nhật ký thao tác hệ thống (Audit Log)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm hành động, đối tượng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-cyan-500/30 rounded-xl bg-[#070d1e] text-cyan-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả phân hệ</option>
            <option value="CLASSES">Lớp học</option>
            <option value="STUDENTS">Học sinh</option>
            <option value="ATTENDANCE">Điểm danh</option>
            <option value="GRADES">Điểm số</option>
            <option value="ASSIGNMENTS">Bài tập</option>
            <option value="SYSTEM">Hệ thống</option>
          </select>
        </div>
      </div>

      {/* Log Entries List */}
      <div className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto text-cyan-400/30 mb-2" />
            <p className="text-xs font-bold text-slate-300">Không có nhật ký nào phù hợp</p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-500/15">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3.5 hover:bg-[#142244]/60 transition-colors flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#142244] text-cyan-300 border border-cyan-500/30 font-mono">
                      {log.module}
                    </span>
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-cyan-400 font-semibold">· {log.targetName}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{log.details || `Thao tác trên đối tượng ${log.targetName}`}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-[11px] text-cyan-300 font-bold">
                    {new Date(log.timestamp).toLocaleDateString('vi-VN')} {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Thực hiện: {log.performedBy}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
