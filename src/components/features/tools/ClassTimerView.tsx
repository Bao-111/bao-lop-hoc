import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { soundManager } from '../../../services/audio';
import { Clock, Play, Pause, RotateCcw, Plus, ArrowLeft } from 'lucide-react';

export const ClassTimerView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [totalSeconds, setTotalSeconds] = useState<number>(300); // Default 5 minutes
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundManager.playTimerAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSetPreset = (seconds: number) => {
    setIsRunning(false);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const handleToggle = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleAddMinute = () => {
    setRemainingSeconds(prev => prev + 60);
    setTotalSeconds(prev => prev + 60);
  };

  // Format time mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

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
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Đồng hồ đếm ngược</span>
            </span>
          </div>
        </div>

        {/* Presets on single row */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: '1p', sec: 60 },
            { label: '3p', sec: 180 },
            { label: '5p', sec: 300 },
            { label: '10p', sec: 600 },
            { label: '15p', sec: 900 }
          ].map(preset => (
            <button
              key={preset.sec}
              onClick={() => handleSetPreset(preset.sec)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                totalSeconds === preset.sec && !isRunning
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-[#142244] text-slate-200 border-cyan-500/30 hover:bg-[#1a2d5a] hover:text-cyan-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Big Stage */}
      <div className="bg-[#0b1329] p-8 sm:p-12 rounded-2xl border border-cyan-500/30 shadow-lg flex flex-col items-center justify-center min-h-[340px]">
        {/* Big digits with tabular numerals */}
        <div
          className={`font-mono font-black text-7xl sm:text-9xl tracking-tight select-none transition-colors drop-shadow-md ${
            remainingSeconds === 0
              ? 'text-rose-400 animate-pulse'
              : remainingSeconds < 30
              ? 'text-amber-400 animate-pulse'
              : 'text-cyan-300'
          }`}
        >
          {timeFormatted}
        </div>

        {/* Progress indicator */}
        <div className="w-full max-w-md h-2.5 bg-[#070d1e] rounded-full overflow-hidden mt-6 border border-cyan-500/30">
          <div
            className={`h-full transition-all duration-1000 ${
              remainingSeconds < 30 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all shadow-md active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                : 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-cyan-400/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{remainingSeconds === 0 ? 'Bắt đầu lại' : 'Bắt đầu'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddMinute}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 transition-colors cursor-pointer"
            title="Thêm 1 phút"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>+1 Phút</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 transition-colors cursor-pointer"
            title="Đặt lại từ đầu"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>
    </div>
  );
};
