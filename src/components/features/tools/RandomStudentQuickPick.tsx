import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { soundManager } from '../../../services/audio';
import { Student } from '../../../types';
import { UserCheck, Sparkles, RotateCw, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Avatar } from '../../ui/Avatar';

export const RandomStudentQuickPick: React.FC = () => {
  const { activeClass, classStudents, setActiveTab, showToast } = useApp();

  const activeStudents = useMemo(() => {
    return classStudents.filter(s => s.status === 'active');
  }, [classStudents]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPicking, setIsPicking] = useState<boolean>(false);

  const handleQuickPick = () => {
    if (activeStudents.length === 0) {
      showToast('Lớp chưa có học sinh để chọn', 'warning');
      return;
    }

    setIsPicking(true);
    let counter = 0;
    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * activeStudents.length);
      setSelectedStudent(activeStudents[tempIndex]);
      soundManager.playTick();
      counter++;

      if (counter > 12) {
        clearInterval(interval);
        const finalStudent = activeStudents[Math.floor(Math.random() * activeStudents.length)];
        setSelectedStudent(finalStudent);
        setIsPicking(false);
        soundManager.playFanfare();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 90);
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
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Gọi nhanh ngẫu nhiên</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              {activeClass?.name} ({activeStudents.length} HS)
            </span>
          </div>
        </div>

        <button
          onClick={handleQuickPick}
          disabled={isPicking || activeStudents.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isPicking ? <RotateCw className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
          <span>{isPicking ? 'Đang chọn...' : 'Bốc thăm ngay'}</span>
        </button>
      </div>

      {/* STAGE AREA */}
      <div className="bg-[#0b1329] p-8 sm:p-12 rounded-2xl border border-cyan-500/30 shadow-lg flex flex-col items-center justify-center min-h-[340px]">
        {selectedStudent ? (
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
              <Avatar
                name={selectedStudent.fullName}
                avatarUrl={selectedStudent.avatarUrl}
                gender={selectedStudent.gender}
                size="2xl"
                className="ring-4 ring-emerald-400 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 text-2xl drop-shadow">🌟</span>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                HỌC SINH ĐƯỢC CHỌN
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {selectedStudent.fullName}
              </h2>
              <p className="text-xs text-cyan-300 font-mono mt-1">
                Mã số: {selectedStudent.studentCode} · Lớp {activeClass?.name}
              </p>
            </div>

            <button
              onClick={handleQuickPick}
              disabled={isPicking}
              className="mt-3 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Bốc thăm em khác</span>
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#142244] border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Sẵn sàng bốc thăm</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Nhấn nút bốc thăm để hệ thống tự động chọn ngẫu nhiên một em học sinh trong lớp {activeClass?.name}.
            </p>
            <button
              onClick={handleQuickPick}
              className="mt-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bắt đầu bốc thăm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
