import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { soundManager } from '../../../services/audio';
import { StorageService } from '../../../services/storage';
import { Student, LuckyWheelSession, LuckyWheelHistoryItem } from '../../../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCw,
  Volume2,
  VolumeX,
  History,
  CheckCircle2,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  HelpCircle,
  Maximize2,
  ArrowLeft
} from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { Avatar } from '../../ui/Avatar';

// Vibrant, contrasting palette for classroom legibility
const SLICE_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#0284c7', // Sky
  '#9333ea', // Violet
  '#16a34a', // Green
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#c026d3'  // Fuchsia
];

export const LuckyWheelView: React.FC = () => {
  const { activeClass, classStudents, setActiveTab, showToast } = useApp();

  // Active student pool (filtered by status === 'active')
  const availableStudents = useMemo(() => {
    return classStudents.filter(s => s.status === 'active');
  }, [classStudents]);

  // Session state persisted per class
  const [session, setSession] = useState<LuckyWheelSession>(() => {
    const saved = StorageService.getLuckyWheelSessions();
    if (activeClass?.id && saved[activeClass.id]) {
      const s = saved[activeClass.id];
      // Ensure remaining IDs are valid current students
      const validIds = new Set(availableStudents.map(st => st.id));
      const filteredRemaining = s.remainingStudentIds.filter(id => validIds.has(id));
      return {
        ...s,
        remainingStudentIds: filteredRemaining.length > 0 ? filteredRemaining : availableStudents.map(st => st.id),
        originalStudentIds: availableStudents.map(st => st.id)
      };
    }
    return {
      id: `lws-${Date.now()}`,
      classId: activeClass?.id || '',
      originalStudentIds: availableStudents.map(st => st.id),
      remainingStudentIds: availableStudents.map(st => st.id),
      selectedStudentId: null,
      history: [],
      status: 'active',
      spinDurationSeconds: 4,
      soundEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Re-sync session when activeClass changes
  useEffect(() => {
    if (!activeClass) return;
    const saved = StorageService.getLuckyWheelSessions();
    const classSaved = saved[activeClass.id];
    const validIds = availableStudents.map(st => st.id);

    if (classSaved && classSaved.remainingStudentIds.length > 0) {
      setSession(classSaved);
    } else {
      const newSession: LuckyWheelSession = {
        id: `lws-${Date.now()}`,
        classId: activeClass.id,
        originalStudentIds: validIds,
        remainingStudentIds: validIds,
        selectedStudentId: null,
        history: classSaved?.history || [],
        status: 'active',
        spinDurationSeconds: 4,
        soundEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSession(newSession);
      StorageService.saveLuckyWheelSession(newSession);
    }
  }, [activeClass?.id, availableStudents]);

  // Remaining active students in current wheel
  const remainingStudents = useMemo(() => {
    const remainingIdSet = new Set(session.remainingStudentIds);
    return availableStudents.filter(s => remainingIdSet.has(s.id));
  }, [availableStudents, session.remainingStudentIds]);

  // Wheel animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [currentResultModalStudent, setCurrentResultModalStudent] = useState<Student | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(session.soundEnabled);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const lastTickSegmentRef = useRef<number>(-1);

  // Sync sound manager
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Draw the Wheel onto Canvas
  const drawWheel = (angleDeg: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 24;

    ctx.clearRect(0, 0, width, height);

    const count = remainingStudents.length;
    if (count === 0) {
      // Empty wheel state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '600 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Đã gọi hết học sinh', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / count;
    const currentAngleRad = (angleDeg * Math.PI) / 180;

    // Draw Outer Shadow & Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 6;
    ctx.fill();
    ctx.restore();

    // Draw Golden Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Draw Wheel Slices
    for (let i = 0; i < count; i++) {
      const student = remainingStudents[i];
      const startA = currentAngleRad + i * sliceAngle;
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startA, endA);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      // Hairline boundary between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Render Student Name along segment
      ctx.save();
      ctx.translate(centerX, centerY);
      const textAngle = startA + sliceAngle / 2;
      ctx.rotate(textAngle);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Dynamic font sizing based on student count & name length
      let fontSize = 14;
      if (count > 25) fontSize = 11;
      else if (count > 15) fontSize = 12;
      else if (count <= 6) fontSize = 16;

      ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

      // Truncate name if too long for slice
      const displayName = student.fullName.length > 18 ? student.fullName.substring(0, 16) + '...' : student.fullName;
      ctx.fillText(displayName, radius - 20, 0);

      // Student code micro-subtext if space allows
      if (count <= 18) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = `400 9px 'JetBrains Mono', monospace`;
        ctx.fillText(student.studentCode, radius - 20, 14);
      }

      ctx.restore();
    }

    // Draw Center Hub & Gold Emblem
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', centerX, centerY);
  };

  // Re-draw wheel on angle or remaining students update
  useEffect(() => {
    drawWheel(rotationAngle);
  }, [rotationAngle, remainingStudents]);

  // Canvas size setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 540;
      canvas.height = 540;
      drawWheel(rotationAngle);
    }
  }, []);

  /**
   * INVARIANT FAIR RANDOM SPIN ENGINE:
   * 1. Fairly random `studentId` is chosen FIRST from remaining pool.
   * 2. Find exact index `targetIndex` in `remainingStudents`.
   * 3. Needle is located at TOP: 270 degrees.
   * 4. Segment center angle $\alpha = (targetIndex + 0.5) \times (360 / count)$.
   * 5. Target wheel angle $R \equiv (270 - \alpha) \pmod{360}$.
   * 6. Add $N$ full spins ($N \times 360$) for realistic inertia.
   * 7. Stopping wheel lands exactly on the chosen segment.
   * 8. Verify invariant: pointed student === randomly chosen student!
   */
  const handleSpin = () => {
    if (isSpinning || remainingStudents.length === 0) return;

    const count = remainingStudents.length;

    // STEP 1: FAIR RANDOM SELECTION of studentId FIRST
    const randomIndex = Math.floor(Math.random() * count);
    const chosenStudent = remainingStudents[randomIndex];
    if (!chosenStudent) return;

    setIsSpinning(true);

    // STEP 2: MATHEMATICAL TARGET ANGLE CALCULATION
    const sliceAngleDeg = 360 / count;
    // Angle of segment center relative to 0 deg
    const segmentCenterDeg = (randomIndex + 0.5) * sliceAngleDeg;

    // Pointer is at the TOP (270 degrees in canvas coordinates)
    const pointerAngleDeg = 270;

    // The angle we need the wheel to stop at (modulo 360)
    let targetModAngle = (pointerAngleDeg - segmentCenterDeg) % 360;
    if (targetModAngle < 0) targetModAngle += 360;

    // Current angle modulo 360
    const currentNormalized = rotationAngle % 360;

    // Number of full spins (6 to 9 full turns)
    const extraRotations = (6 + Math.floor(Math.random() * 3)) * 360;

    // Calculate total final target angle
    let delta = (targetModAngle - currentNormalized) % 360;
    if (delta < 0) delta += 360;

    const finalTargetAngle = rotationAngle + extraRotations + delta;

    startAngleRef.current = rotationAngle;
    targetAngleRef.current = finalTargetAngle;
    startTimeRef.current = performance.now();
    lastTickSegmentRef.current = -1;

    const durationMs = session.spinDurationSeconds * 1000;

    // Quintic/Cubic smooth deceleration easing curve
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3.2);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * easedProgress;
      setRotationAngle(currentAngle);

      // Play tick sound when slice boundary crosses the pointer
      const normalizedForPointer = (pointerAngleDeg - (currentAngle % 360) + 360) % 360;
      const currentSegment = Math.floor(normalizedForPointer / sliceAngleDeg);
      if (currentSegment !== lastTickSegmentRef.current && progress < 0.95) {
        lastTickSegmentRef.current = currentSegment;
        soundManager.playTick();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // SPIN COMPLETED!
        setIsSpinning(false);
        setRotationAngle(targetAngleRef.current);

        // HARD INVARIANT SAFETY CHECK:
        // Calculate which student index the needle actually lands on:
        const finalNormalizedForPointer = (pointerAngleDeg - (targetAngleRef.current % 360) + 360) % 360;
        const resolvedIndex = Math.floor(finalNormalizedForPointer / sliceAngleDeg);
        const resolvedStudent = remainingStudents[resolvedIndex];

        if (!resolvedStudent || resolvedStudent.id !== chosenStudent.id) {
          console.error('FATAL INVARIANT MISMATCH:', { chosenStudent, resolvedStudent, resolvedIndex });
          showToast('Lỗi lệch chỉ báo góc quay. Đang hiệu chỉnh lại...', 'error');
          return;
        }

        // Triumphant Fanfare & Confetti
        soundManager.playFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // POPUP RESULT TO TEACHER:
        setCurrentResultModalStudent(chosenStudent);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // TEACHER DECISION: "GỌI HỌC SINH NÀY" (Remove from remaining pool)
  const handleConfirmCallStudent = (student: Student) => {
    const updatedRemaining = session.remainingStudentIds.filter(id => id !== student.id);
    const historyItem: LuckyWheelHistoryItem = {
      id: `lwh-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      selectedAt: new Date().toISOString(),
      status: 'called'
    };

    const updatedSession: LuckyWheelSession = {
      ...session,
      remainingStudentIds: updatedRemaining,
      selectedStudentId: student.id,
      history: [historyItem, ...session.history],
      status: updatedRemaining.length === 0 ? 'completed' : 'active',
      updatedAt: new Date().toISOString()
    };

    setSession(updatedSession);
    StorageService.saveLuckyWheelSession(updatedSession);
    setCurrentResultModalStudent(null);
    showToast(`Đã gọi em ${student.fullName}. Còn lại ${updatedRemaining.length} học sinh trong lượt.`, 'success');
  };

  // TEACHER DECISION: "GIỮ LẠI" (Keep in pool for future spins)
  const handleKeepStudent = (student: Student) => {
    const historyItem: LuckyWheelHistoryItem = {
      id: `lwh-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      selectedAt: new Date().toISOString(),
      status: 'kept'
    };

    const updatedSession: LuckyWheelSession = {
      ...session,
      history: [historyItem, ...session.history],
      updatedAt: new Date().toISOString()
    };

    setSession(updatedSession);
    StorageService.saveLuckyWheelSession(updatedSession);
    setCurrentResultModalStudent(null);
    showToast(`Đã giữ lại em ${student.fullName} trong danh sách quay tiếp theo`, 'info');
  };

  // RESET SESSION CONFIRMATION
  const handleResetSession = () => {
    const validIds = availableStudents.map(st => st.id);
    const resetSessionData: LuckyWheelSession = {
      ...session,
      originalStudentIds: validIds,
      remainingStudentIds: validIds,
      selectedStudentId: null,
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    setSession(resetSessionData);
    StorageService.saveLuckyWheelSession(resetSessionData);
    setIsResetConfirmOpen(false);
    showToast('Đã làm mới vòng quay! Tất cả học sinh đã sẵn sàng cho lượt mới.', 'success');
  };

  // Cleanup anim frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="space-y-3.5">
      {/* 1-ROW STREAMLINED TOOLBAR - BỐ TRÍ TRÊN 1 DÒNG TIẾT KIỆM KHÔNG GIAN */}
      <div className="bg-[#0b1329] p-2.5 sm:p-3 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center justify-between gap-2 overflow-x-auto">
        {/* Left: Back + Title + Class badge in 1 compact row */}
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
              <span>🎡 Vòng quay</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              {activeClass?.name} ({activeClass?.subject})
            </span>
          </div>
        </div>

        {/* Right: Quick Controls all on the same row */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 bg-[#142244] text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Còn:</span>
            <span className="font-mono font-black text-amber-300">{remainingStudents.length}</span>
            <span className="text-slate-500 text-[11px]">/{availableStudents.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#142244] text-cyan-300 border-cyan-500/30 hover:bg-[#1a2d5a]'
                : 'bg-rose-950/60 text-rose-400 border-rose-500/40 hover:bg-rose-900/60'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isSpinning}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            title="Làm mới lại toàn bộ danh sách"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {remainingStudents.length > 0 && (
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              title="Quay chọn học sinh ngay"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>QUAY</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Wheel Stage + Side Panels - Space Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Wheel Stage (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b1329] p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
          {/* Top Indicator / Needle pointing down at the wheel */}
          <div className="relative z-20 mb-[-14px] flex flex-col items-center pointer-events-none">
            {/* Triangular pointer needle */}
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]" />
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white mt-[-6px] shadow-sm" />
          </div>

          {/* Canvas Wheel with Interactive Center Hub - Space-Optimized */}
          <div className="relative w-full max-w-[370px] sm:max-w-[390px] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full max-w-[370px] sm:max-w-[390px] max-h-[390px] rounded-full select-none"
            />

            {/* CLICKABLE CENTER HUB - BẤM CHỮ QUAY Ở GIỮA VÒNG QUAY */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || remainingStudents.length === 0}
              className={`absolute z-30 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 border-4 border-amber-400 text-white font-black text-sm tracking-widest shadow-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-110 hover:shadow-[0_0_25px_rgba(6,182,212,0.9)] disabled:opacity-50 disabled:cursor-not-allowed group select-none ${
                isSpinning ? 'animate-pulse' : 'hover:border-amber-300'
              }`}
              title="Nhấp vào chữ QUAY ở giữa để quay chọn học sinh"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform drop-shadow" />
              <span className="leading-tight drop-shadow font-black tracking-widest text-xs mt-0.5">QUAY</span>
            </button>
          </div>

          {/* Action Bar Under Wheel - BẤM NÚT QUAY CHỌN HỌC SINH */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            {remainingStudents.length === 0 ? (
              <div className="w-full p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center">
                <p className="text-xs font-bold text-emerald-300">🎉 Đã gọi hết học sinh trong lượt này!</p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">Nhấn nút bên dưới để khôi phục danh sách và bắt đầu lượt mới.</p>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="mt-2.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Bắt đầu lượt mới
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || remainingStudents.length === 0}
                className="w-full py-3 px-6 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 active:scale-[0.99] transition-all duration-150 shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang quay chọn học sinh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>QUAY CHỌN HỌC SINH</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Remaining List & Spin History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Remaining Student Pool Card */}
          <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Danh sách chờ quay</span>
                <span className="text-[11px] font-mono font-bold text-cyan-300 bg-[#142244] border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  {remainingStudents.length}
                </span>
              </h2>
              <span className="text-[10px] text-cyan-400/80 font-mono">Đồng bộ tự động</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {remainingStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">Tất cả học sinh đã được gọi</div>
              ) : (
                remainingStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#070d1e]/80 hover:bg-[#142244] border border-cyan-500/15 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 text-[10px] font-mono text-cyan-400/80 shrink-0">{idx + 1}</span>
                      <Avatar name={st.fullName} avatarUrl={st.avatarUrl} gender={st.gender} size="xs" />
                      <span className="font-bold text-slate-100 truncate">{st.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">({st.studentCode})</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                      {st.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History Log Card */}
          <div className="bg-[#0b1329] p-4 rounded-2xl border border-cyan-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lịch sử quay lượt này</span>
              </h2>
              <span className="text-[11px] font-mono font-bold text-slate-300 bg-[#142244] border border-cyan-500/30 px-2 py-0.5 rounded-full">
                {session.history.length} lượt
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {session.history.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  Chưa có học sinh nào được quay trong phiên này
                </div>
              ) : (
                session.history.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-cyan-500/20 bg-[#070d1e]/80 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={item.studentName} size="xs" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate">{item.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.studentCode} · {new Date(item.selectedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {item.status === 'called' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          Đã gọi
                        </span>
                      ) : item.status === 'kept' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                          Giữ lại
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                          Đã chọn
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

      {/* POPUP RESULT MODAL WITH STUDENT AVATAR */}
      {currentResultModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95">
            {/* Student Avatar with Celebration Rings */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
              <Avatar
                name={currentResultModalStudent.fullName}
                avatarUrl={currentResultModalStudent.avatarUrl}
                gender={currentResultModalStudent.gender}
                size="2xl"
                className="ring-4 ring-amber-400 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 text-2xl drop-shadow">🎉</span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                KẾT QUẢ VÒNG QUAY MAY MẮN
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                {currentResultModalStudent.fullName}
              </h2>
              <p className="text-xs text-cyan-200 font-mono mt-1">
                Mã số: {currentResultModalStudent.studentCode} · Lớp {activeClass?.name} ({activeClass?.subject})
              </p>
            </div>

            <div className="p-3 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-xs text-slate-200 font-medium">
              ✨ Học sinh được hệ thống chọn kiểm tra bài / phát biểu hôm nay!
            </div>

            {/* Actions: "Gọi học sinh này" vs "Giữ lại" vs "Đóng" */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleConfirmCallStudent(currentResultModalStudent)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Gọi học sinh này</span>
              </button>
              <button
                type="button"
                onClick={() => handleKeepStudent(currentResultModalStudent)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-200 bg-[#142244] hover:bg-[#1c3060] border border-cyan-500/30 transition-colors cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>Giữ lại quay tiếp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentResultModalStudent(null)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors block mx-auto pt-1 cursor-pointer"
            >
              Đóng kết quả
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Session */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Làm mới vòng quay may mắn"
        itemName={`Lớp ${activeClass?.name}`}
        message="Thao tác này sẽ khôi phục lại toàn bộ học sinh của lớp vào danh sách chờ quay cho lượt mới. Bạn có chắc chắn muốn làm mới?"
        confirmLabel="Làm mới ngay"
        isDestructive={false}
        onConfirm={handleResetSession}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
