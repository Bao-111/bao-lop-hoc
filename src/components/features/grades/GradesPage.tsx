import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { GradeEntry } from '../../../types';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, Save, Search, ArrowLeft } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export const GradesPage: React.FC = () => {
  const { activeClass, classStudents, grades, updateGradeEntry, setActiveTab, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [localGrades, setLocalGrades] = useState<Record<string, GradeEntry>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync from props
  useMemo(() => {
    const map: Record<string, GradeEntry> = {};
    classStudents.forEach(st => {
      const existing = grades.find(g => g.studentId === st.id && g.classId === activeClass?.id);
      if (existing) {
        map[st.id] = { ...existing };
      } else {
        map[st.id] = {
          id: `grd-${st.id}`,
          studentId: st.id,
          classId: activeClass?.id || '',
          oral1: null,
          oral2: null,
          fifteenMin: null,
          midterm: null,
          finalExam: null,
          updatedAt: new Date().toISOString()
        };
      }
    });
    setLocalGrades(map);
    setHasChanges(false);
  }, [classStudents, grades, activeClass?.id]);

  // Compute average score (ĐTB)
  const calculateAverage = (g?: GradeEntry): { avg: number | null; rank: string } => {
    if (!g) return { avg: null, rank: '---' };
    const { oral1, oral2, fifteenMin, midterm, finalExam } = g;

    let totalPoints = 0;
    let totalWeights = 0;

    if (oral1 !== null && oral1 !== undefined) {
      totalPoints += oral1 * 1;
      totalWeights += 1;
    }
    if (oral2 !== null && oral2 !== undefined) {
      totalPoints += oral2 * 1;
      totalWeights += 1;
    }
    if (fifteenMin !== null && fifteenMin !== undefined) {
      totalPoints += fifteenMin * 1;
      totalWeights += 1;
    }
    if (midterm !== null && midterm !== undefined) {
      totalPoints += midterm * 2;
      totalWeights += 2;
    }
    if (finalExam !== null && finalExam !== undefined) {
      totalPoints += finalExam * 3;
      totalWeights += 3;
    }

    if (totalWeights === 0) return { avg: null, rank: 'Chưa đủ điểm' };

    const avg = Math.round((totalPoints / totalWeights) * 10) / 10;
    let rank = 'Yếu';
    if (avg >= 9.0) rank = 'Xuất sắc';
    else if (avg >= 8.0) rank = 'Giỏi';
    else if (avg >= 6.5) rank = 'Khá';
    else if (avg >= 5.0) rank = 'Trung bình';

    return { avg, rank };
  };

  const handleScoreChange = (
    studentId: string,
    field: 'oral1' | 'oral2' | 'fifteenMin' | 'midterm' | 'finalExam',
    valStr: string
  ) => {
    const trimmed = valStr.trim();
    let numVal: number | null = null;

    if (trimmed !== '') {
      const parsed = parseFloat(trimmed.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        showToast('Điểm số phải từ 0 đến 10', 'error');
        return;
      }
      numVal = Math.round(parsed * 10) / 10;
    }

    setLocalGrades(prev => {
      const current = prev[studentId] || {
        id: `grd-${studentId}`,
        studentId,
        classId: activeClass?.id || '',
        updatedAt: new Date().toISOString()
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: numVal
        }
      };
    });
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    Object.values(localGrades).forEach(entry => {
      updateGradeEntry(entry);
    });
    setHasChanges(false);
    showToast('Đã lưu toàn bộ điểm số của lớp', 'success');
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = classStudents.map((st, idx) => {
        const g = localGrades[st.id];
        const { avg, rank } = calculateAverage(g);
        return {
          STT: idx + 1,
          'Mã HS': st.studentCode,
          'Họ và tên': st.fullName,
          'Miệng 1': g?.oral1 ?? '',
          'Miệng 2': g?.oral2 ?? '',
          '15 Phút': g?.fifteenMin ?? '',
          'Giữa kỳ (x2)': g?.midterm ?? '',
          'Cuối kỳ (x3)': g?.finalExam ?? '',
          'ĐTB Môn': avg ?? '',
          'Xếp loại': rank
        };
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Bảng điểm ${activeClass?.name}`);
      XLSX.writeFile(wb, `Bang_diem_${activeClass?.name}_${activeClass?.subject}.xlsx`);
      showToast('Đã xuất sổ điểm ra tệp Excel', 'success');
    } catch {
      showToast('Lỗi khi xuất bảng điểm Excel', 'error');
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classStudents.filter(
      st => !q || st.fullName.toLowerCase().includes(q) || st.studentCode.toLowerCase().includes(q)
    );
  }, [classStudents, searchQuery]);

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
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Sổ điểm môn học</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#142244] text-cyan-300 border border-cyan-500/30">
              Lớp {activeClass?.name} ({activeClass?.subject})
            </span>
          </div>
        </div>

        {/* Search & Action Buttons on the single row */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm học sinh nhập điểm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-200 bg-[#142244] border border-cyan-500/30 hover:bg-[#1a2d5a] hover:text-cyan-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer ${
              hasChanges
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 animate-pulse'
                : 'bg-[#142244] text-slate-200 border border-cyan-500/30 hover:bg-[#1a2d5a]'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasChanges ? 'Lưu điểm *' : 'Đã lưu điểm'}</span>
          </button>
        </div>
      </div>

      {/* Main Grade Spreadsheet Table */}
      <div className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070d1e] border-b border-cyan-500/20 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3 min-w-[170px]">Học sinh</th>
                <th className="py-2.5 px-3 text-center w-24">Miệng 1 (x1)</th>
                <th className="py-2.5 px-3 text-center w-24">Miệng 2 (x1)</th>
                <th className="py-2.5 px-3 text-center w-24">15 Phút (x1)</th>
                <th className="py-2.5 px-3 text-center w-24 text-amber-300">Giữa kỳ (x2)</th>
                <th className="py-2.5 px-3 text-center w-24 text-cyan-300">Cuối kỳ (x3)</th>
                <th className="py-2.5 px-3 text-center w-24 font-black text-white">ĐTB Môn</th>
                <th className="py-2.5 px-3 text-center w-28">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {filteredStudents.map((student, idx) => {
                const g = localGrades[student.id];
                const { avg, rank } = calculateAverage(g);

                return (
                  <tr key={student.id} className="hover:bg-[#142244]/60 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-cyan-400/80">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                      {student.studentCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={student.fullName} avatarUrl={student.avatarUrl} gender={student.gender} size="xs" />
                        <span className="font-bold text-white">{student.fullName}</span>
                      </div>
                    </td>

                    {/* Oral 1 */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={g?.oral1 ?? ''}
                        onChange={e => handleScoreChange(student.id, 'oral1', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 bg-[#070d1e] text-white"
                      />
                    </td>

                    {/* Oral 2 */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={g?.oral2 ?? ''}
                        onChange={e => handleScoreChange(student.id, 'oral2', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 bg-[#070d1e] text-white"
                      />
                    </td>

                    {/* 15 Min */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={g?.fifteenMin ?? ''}
                        onChange={e => handleScoreChange(student.id, 'fifteenMin', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 bg-[#070d1e] text-white"
                      />
                    </td>

                    {/* Midterm */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={g?.midterm ?? ''}
                        onChange={e => handleScoreChange(student.id, 'midterm', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-black text-xs border border-amber-500/40 bg-amber-950/30 rounded-lg focus:outline-none focus:border-amber-400 text-amber-300"
                      />
                    </td>

                    {/* Final Exam */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={g?.finalExam ?? ''}
                        onChange={e => handleScoreChange(student.id, 'finalExam', e.target.value)}
                        className="w-16 px-1.5 py-1 text-center font-mono font-black text-xs border border-cyan-500/40 bg-cyan-950/30 rounded-lg focus:outline-none focus:border-cyan-400 text-cyan-200"
                      />
                    </td>

                    {/* Auto Computed Average */}
                    <td className="py-2 px-3 text-center font-mono font-black text-sm text-cyan-300 tabular-nums">
                      {avg !== null ? avg.toFixed(1) : '---'}
                    </td>

                    {/* Classification */}
                    <td className="py-2 px-3 text-center">
                      {rank === 'Xuất sắc' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-950/80 text-purple-300 border border-purple-500/40">
                          Xuất sắc
                        </span>
                      )}
                      {rank === 'Giỏi' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          Giỏi
                        </span>
                      )}
                      {rank === 'Khá' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          Khá
                        </span>
                      )}
                      {rank === 'Trung bình' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          Trung bình
                        </span>
                      )}
                      {rank === 'Yếu' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-950/80 text-rose-300 border border-rose-500/40">
                          Yếu
                        </span>
                      )}
                      {rank === 'Chưa đủ điểm' && (
                        <span className="text-[10px] text-slate-500">Chưa đủ</span>
                      )}
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
