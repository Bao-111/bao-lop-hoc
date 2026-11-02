import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { Timetable, TimetablePeriod } from '../../../types';
import * as XLSX from 'xlsx';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  X,
  Save,
  RotateCcw,
  RotateCw,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Eraser,
  School,
  UserCheck,
  Building2,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  Scissors,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';

const ALL_WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const DEFAULT_PERIOD_TIMES: Record<number, string> = {
  1: '07:00 - 07:45',
  2: '07:45 - 08:30',
  3: '08:30 - 09:15',
  4: '09:15 - 10:00',
  5: '10:35 - 11:20',
  6: '11:25 - 12:10',
  7: '12:15 - 13:00',
  8: '13:15 - 14:00',
  9: '14:05 - 14:50',
  10: '15:00 - 15:45'
};

export const TimetablePage: React.FC = () => {
  const {
    classes,
    activeClassId,
    activeClass,
    setActiveClassId,
    currentTimetable,
    saveClassTimetable,
    setActiveTab,
    showToast
  } = useApp();

  // Tab: Lịch lớp học, Lịch giáo viên, Lịch phòng học
  const [scheduleViewType, setScheduleViewType] = useState<'class' | 'teacher' | 'room'>('class');

  // Chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);

  // Chế độ xóa nhanh ô trên lưới
  const [isEraseMode, setIsEraseMode] = useState(false);

  // Bản nháp thời khóa biểu đang thao tác
  const [draftTimetable, setDraftTimetable] = useState<Timetable>(() => {
    return JSON.parse(JSON.stringify(currentTimetable));
  });

  // Theo dõi có thay đổi chưa lưu hay không
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo / Redo history stack
  const [history, setHistory] = useState<Timetable[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals xác nhận xóa
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [columnToClear, setColumnToClear] = useState<string | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<TimetablePeriod | null>(null);
  const [periodToClear, setPeriodToClear] = useState<TimetablePeriod | null>(null);
  const [isSelectiveDeleteModalOpen, setIsSelectiveDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // State cho Modal Xóa Chọn Lọc (tùy chọn xóa từng tiết, thứ người đó muốn)
  const [selectedDaysToDelete, setSelectedDaysToDelete] = useState<string[]>([]);
  const [selectedPeriodsToDelete, setSelectedPeriodsToDelete] = useState<number[]>([]);
  const [deleteModeAction, setDeleteModeAction] = useState<'clear_content' | 'remove_structure'>('clear_content');

  // Modal cảnh báo khi muốn chuyển lớp mà chưa lưu
  const [pendingClassChangeId, setPendingClassChangeId] = useState<string | null>(null);

  // Input file Excel ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo bản nháp khi activeClassId hoặc currentTimetable thay đổi từ ngoài
  useEffect(() => {
    const copy = JSON.parse(JSON.stringify(currentTimetable));
    setDraftTimetable(copy);
    setHistory([copy]);
    setHistoryIndex(0);
    setIsEditing(false);
    setIsEraseMode(false);
    setHasUnsavedChanges(false);
  }, [activeClassId, currentTimetable]);

  // Cảnh báo người dùng khi reload hoặc đóng tab trình duyệt nếu có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Hàm thêm bản nháp mới vào undo stack
  const pushHistoryState = useCallback((newData: Timetable) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(newData))];
    });
    setHistoryIndex(prev => prev + 1);
    setDraftTimetable(newData);
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  // Phím tắt Ctrl+Z (Undo) và Ctrl+Y (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, historyIndex, history]);

  // Hoàn tác
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setDraftTimetable(JSON.parse(JSON.stringify(history[prevIdx])));
      showToast('Đã hoàn tác thao tác trước', 'info');
    }
  };

  // Làm lại
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setDraftTimetable(JSON.parse(JSON.stringify(history[nextIdx])));
      showToast('Đã làm lại thao tác', 'info');
    }
  };

  // Bật/Tắt chế độ chỉnh sửa
  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      showToast('Đã bật chế độ chỉnh sửa trực tiếp. Bạn có thể nhấp vào bất kỳ ô nào để nhập chữ!', 'info');
    } else {
      setIsEditing(false);
      setIsEraseMode(false);
    }
  };

  // Bật/Tắt chế độ xóa nhanh
  const handleToggleEraseMode = () => {
    if (!isEditing) {
      setIsEditing(true);
      setIsEraseMode(true);
      showToast('Đã chuyển sang chế độ chỉnh sửa & BẬT xóa nhanh ô!', 'info');
    } else {
      setIsEraseMode(prev => {
        const next = !prev;
        if (next) {
          showToast('Chế độ xóa nhanh: BẬT. Nhấp vào ô bất kỳ để xóa nội dung về -trống-!', 'warning');
        } else {
          showToast('Đã thoát chế độ xóa nhanh. Trở lại chế độ chỉnh sửa trực tiếp.', 'info');
        }
        return next;
      });
    }
  };

  // Thêm cột ngày theo thứ tự
  const handleAddDayColumn = () => {
    const currentDays = draftTimetable.days;
    if (currentDays.length >= 7) {
      showToast('Lỗi: Tuần chỉ có 7 ngày.', 'error');
      return;
    }

    const missingDay = ALL_WEEK_DAYS.find(day => !currentDays.includes(day));
    if (!missingDay) {
      showToast('Lỗi: Tuần chỉ có 7 ngày.', 'error');
      return;
    }

    const updatedDays = ALL_WEEK_DAYS.filter(day => currentDays.includes(day) || day === missingDay);
    const updatedData: Timetable = {
      ...draftTimetable,
      days: updatedDays,
      periods: draftTimetable.periods.map(period => ({
        ...period,
        schedule: {
          ...period.schedule,
          [missingDay]: '-trống-'
        }
      }))
    };

    pushHistoryState(updatedData);
    showToast(`Đã thêm cột ${missingDay} vào thời khóa biểu`, 'success');
  };

  // Xác nhận xóa hẳn cột ngày khỏi bảng
  const handleConfirmDeleteColumn = () => {
    if (!columnToDelete) return;
    const day = columnToDelete;

    if (draftTimetable.days.length <= 1) {
      showToast('Lỗi: Thời khóa biểu phải có ít nhất 1 ngày.', 'error');
      setColumnToDelete(null);
      return;
    }

    const updatedDays = draftTimetable.days.filter(d => d !== day);
    const updatedData: Timetable = {
      ...draftTimetable,
      days: updatedDays,
      periods: draftTimetable.periods.map(p => {
        const nextSchedule = { ...p.schedule };
        delete nextSchedule[day];
        return {
          ...p,
          schedule: nextSchedule
        };
      })
    };

    pushHistoryState(updatedData);
    setColumnToDelete(null);
    showToast(`Đã xóa cột ${day} khỏi bản nháp (có thể Hoàn tác)`, 'info');
  };

  // Xác nhận làm trống tất cả các tiết trong 1 Thứ (không xóa cột)
  const handleConfirmClearDayContent = () => {
    if (!columnToClear) return;
    const day = columnToClear;

    const updatedPeriods = draftTimetable.periods.map(p => ({
      ...p,
      schedule: {
        ...p.schedule,
        [day]: '-trống-'
      }
    }));

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    pushHistoryState(updatedData);
    setColumnToClear(null);
    showToast(`Đã làm trống toàn bộ nội dung của ${day} (có thể Hoàn tác)`, 'info');
  };

  // Xác nhận xóa hẳn hàng tiết học khỏi bảng
  const handleConfirmDeletePeriod = () => {
    if (!periodToDelete) return;
    const periodId = periodToDelete.id;

    if (draftTimetable.periods.length <= 1) {
      showToast('Lỗi: Thời khóa biểu phải có ít nhất 1 tiết học.', 'error');
      setPeriodToDelete(null);
      return;
    }

    const updatedPeriods = draftTimetable.periods
      .filter(p => p.id !== periodId)
      .map((p, idx) => ({
        ...p,
        periodNumber: idx + 1,
        name: `Tiết ${idx + 1}`
      }));

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    pushHistoryState(updatedData);
    setPeriodToDelete(null);
    showToast(`Đã xóa ${periodToDelete.name} trên tất cả các ngày (có thể Hoàn tác)`, 'info');
  };

  // Xác nhận làm trống nội dung của 1 tiết học trên tất cả các ngày
  const handleConfirmClearPeriodContent = () => {
    if (!periodToClear) return;
    const periodIdx = draftTimetable.periods.findIndex(p => p.id === periodToClear.id);
    if (periodIdx === -1) return;

    const updatedPeriods = [...draftTimetable.periods];
    const clearedSchedule: Record<string, string> = {};
    draftTimetable.days.forEach(d => {
      clearedSchedule[d] = '-trống-';
    });

    updatedPeriods[periodIdx] = {
      ...updatedPeriods[periodIdx],
      schedule: clearedSchedule
    };

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    pushHistoryState(updatedData);
    setPeriodToClear(null);
    showToast(`Đã xóa sạch nội dung của ${periodToClear.name} (có thể Hoàn tác)`, 'info');
  };

  // Xóa nội dung của một ô đơn lẻ về '-trống-'
  const handleClearSingleCell = (periodIndex: number, day: string) => {
    const currentVal = draftTimetable.periods[periodIndex]?.schedule[day] || '';
    if (!currentVal || currentVal === '-trống-') return;

    const updatedPeriods = [...draftTimetable.periods];
    updatedPeriods[periodIndex] = {
      ...updatedPeriods[periodIndex],
      schedule: {
        ...updatedPeriods[periodIndex].schedule,
        [day]: '-trống-'
      }
    };

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    pushHistoryState(updatedData);
    showToast(`Đã xóa ô ${draftTimetable.periods[periodIndex].name} · ${day}`, 'info');
  };

  // Xử lý Xóa Chọn Lọc (Người dùng tích chọn từng tiết hoặc từng thứ muốn xóa)
  const handleExecuteSelectiveDelete = () => {
    if (selectedDaysToDelete.length === 0 && selectedPeriodsToDelete.length === 0) {
      showToast('Vui lòng chọn ít nhất một Tiết hoặc một Thứ để xóa!', 'warning');
      return;
    }

    if (deleteModeAction === 'clear_content') {
      // Làm trống nội dung các thứ hoặc tiết đã chọn
      const updatedPeriods = draftTimetable.periods.map((p, pIdx) => {
        const nextSchedule = { ...p.schedule };
        const shouldClearPeriod = selectedPeriodsToDelete.includes(pIdx);

        draftTimetable.days.forEach(d => {
          const shouldClearDay = selectedDaysToDelete.includes(d);
          if (shouldClearPeriod || shouldClearDay) {
            nextSchedule[d] = '-trống-';
          }
        });

        return { ...p, schedule: nextSchedule };
      });

      const updatedData: Timetable = {
        ...draftTimetable,
        periods: updatedPeriods
      };

      pushHistoryState(updatedData);
      setIsSelectiveDeleteModalOpen(false);
      setSelectedDaysToDelete([]);
      setSelectedPeriodsToDelete([]);
      showToast('Đã xóa sạch nội dung các Tiết / Thứ được chọn (có thể Hoàn tác)', 'success');
    } else {
      // Xóa bỏ cấu trúc (xóa cột hoặc xóa hàng)
      let nextDays = [...draftTimetable.days];
      if (selectedDaysToDelete.length > 0) {
        nextDays = nextDays.filter(d => !selectedDaysToDelete.includes(d));
        if (nextDays.length === 0) {
          showToast('Lỗi: Bạn không thể xóa toàn bộ các ngày!', 'error');
          return;
        }
      }

      let nextPeriods = [...draftTimetable.periods];
      if (selectedPeriodsToDelete.length > 0) {
        nextPeriods = nextPeriods.filter((_, idx) => !selectedPeriodsToDelete.includes(idx));
        if (nextPeriods.length === 0) {
          showToast('Lỗi: Thời khóa biểu phải có ít nhất 1 tiết học!', 'error');
          return;
        }
        nextPeriods = nextPeriods.map((p, idx) => ({
          ...p,
          periodNumber: idx + 1,
          name: `Tiết ${idx + 1}`
        }));
      }

      const updatedData: Timetable = {
        ...draftTimetable,
        days: nextDays,
        periods: nextPeriods.map(p => {
          const cleanSched: Record<string, string> = {};
          nextDays.forEach(d => {
            cleanSched[d] = p.schedule[d] || '-trống-';
          });
          return { ...p, schedule: cleanSched };
        })
      };

      pushHistoryState(updatedData);
      setIsSelectiveDeleteModalOpen(false);
      setSelectedDaysToDelete([]);
      setSelectedPeriodsToDelete([]);
      showToast('Đã xóa các hàng/cột đã chọn khỏi thời khóa biểu (có thể Hoàn tác)', 'success');
    }
  };

  // Làm trống toàn bộ thời khóa biểu về '-trống-'
  const handleConfirmClearAll = () => {
    const updatedPeriods = draftTimetable.periods.map(p => {
      const emptySched: Record<string, string> = {};
      draftTimetable.days.forEach(d => {
        emptySched[d] = '-trống-';
      });
      return { ...p, schedule: emptySched };
    });

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    pushHistoryState(updatedData);
    setIsClearAllModalOpen(false);
    showToast('Đã làm trống toàn bộ nội dung thời khóa biểu (có thể Hoàn tác)', 'info');
  };

  // Thêm tiết học mới (+ Thêm tiết học mới)
  const handleAddNewPeriod = () => {
    const nextNum = draftTimetable.periods.length + 1;
    const defaultTime = DEFAULT_PERIOD_TIMES[nextNum] || `Tiết ${nextNum}`;
    const newPeriod: TimetablePeriod = {
      id: `period-${Date.now()}-${nextNum}`,
      periodNumber: nextNum,
      name: `Tiết ${nextNum}`,
      time: defaultTime,
      schedule: {}
    };

    draftTimetable.days.forEach(d => {
      newPeriod.schedule[d] = '-trống-';
    });

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: [...draftTimetable.periods, newPeriod]
    };

    pushHistoryState(updatedData);
    showToast(`Đã thêm Tiết ${nextNum} mới`, 'success');
  };

  // Sửa khung giờ của tiết học
  const handlePeriodTimeChange = (periodIndex: number, newTimeStr: string) => {
    const updatedPeriods = [...draftTimetable.periods];
    updatedPeriods[periodIndex] = {
      ...updatedPeriods[periodIndex],
      time: newTimeStr
    };

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    setDraftTimetable(updatedData);
    setHasUnsavedChanges(true);
  };

  const handlePeriodTimeBlur = (timeStr: string) => {
    const timeRegex = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/;
    const match = timeStr.trim().match(timeRegex);
    if (match) {
      const [_, start, end] = match;
      if (start >= end) {
        showToast('Cảnh báo: Giờ bắt đầu phải nhỏ hơn giờ kết thúc!', 'warning');
      }
    }
    pushHistoryState(draftTimetable);
  };

  // Xử lý click ô:
  // Nếu chưa ở edit mode: TỰ ĐỘNG BẬT CHẾ ĐỘ CHỈNH SỬA VÀ TẬP TRUNG VÀO Ô ĐÓ (sửa lỗi người dùng không gõ được chữ!)
  // Nếu đang ở erase mode: xóa nhanh ô đó
  const handleCellClick = (periodIndex: number, day: string) => {
    if (!isEditing) {
      setIsEditing(true);
      showToast(`Đã kích hoạt chế độ chỉnh sửa! Bạn đang nhập ô: ${draftTimetable.periods[periodIndex]?.name} · ${day}`, 'info');
      return;
    }

    if (isEraseMode) {
      handleClearSingleCell(periodIndex, day);
    }
  };

  // Sửa nội dung ô trực tiếp trên lưới
  const handleCellChange = (periodIndex: number, day: string, value: string) => {
    const updatedPeriods = [...draftTimetable.periods];
    updatedPeriods[periodIndex] = {
      ...updatedPeriods[periodIndex],
      schedule: {
        ...updatedPeriods[periodIndex].schedule,
        [day]: value
      }
    };

    const updatedData: Timetable = {
      ...draftTimetable,
      periods: updatedPeriods
    };

    setDraftTimetable(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleCellBlur = () => {
    if (history[historyIndex] && JSON.stringify(history[historyIndex]) !== JSON.stringify(draftTimetable)) {
      pushHistoryState(draftTimetable);
    }
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    pIdx: number,
    dayIdx: number
  ) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Natural tab traversal to next textarea
    }
  };

  // Lưu thời khóa biểu
  const handleSave = () => {
    if (draftTimetable.days.length === 0) {
      showToast('Lỗi: Thời khóa biểu phải có ít nhất 1 ngày.', 'error');
      return;
    }
    if (draftTimetable.periods.length === 0) {
      showToast('Lỗi: Thời khóa biểu phải có ít nhất 1 tiết học.', 'error');
      return;
    }

    try {
      saveClassTimetable(activeClassId || 'default', draftTimetable);
      setIsEditing(false);
      setIsEraseMode(false);
      setHasUnsavedChanges(false);
      showToast('Đã lưu thời khóa biểu thành công!', 'success');
    } catch {
      showToast('Lỗi khi lưu thời khóa biểu. Vui lòng thử lại!', 'error');
    }
  };

  // Xử lý đổi lớp an toàn
  const handleClassSelectChange = (newClassId: string) => {
    if (newClassId === activeClassId) return;

    if (hasUnsavedChanges) {
      setPendingClassChangeId(newClassId);
    } else {
      setActiveClassId(newClassId);
    }
  };

  const handleSaveAndSwitchClass = () => {
    handleSave();
    if (pendingClassChangeId) {
      setActiveClassId(pendingClassChangeId);
      setPendingClassChangeId(null);
    }
  };

  const handleDiscardAndSwitchClass = () => {
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setIsEraseMode(false);
    if (pendingClassChangeId) {
      setActiveClassId(pendingClassChangeId);
      setPendingClassChangeId(null);
    }
  };

  // Xuất file Excel
  const handleExportExcel = () => {
    try {
      const headerRow = ['Tiết', 'Khung giờ', ...draftTimetable.days];
      const dataRows = draftTimetable.periods.map(p => {
        const row = [p.name, p.time];
        draftTimetable.days.forEach(d => {
          row.push(p.schedule[d] === '-trống-' ? '' : p.schedule[d] || '');
        });
        return row;
      });

      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
      const wb = XLSX.utils.book_new();
      const sheetName = `TKB ${activeClass?.name || 'Lop'}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      XLSX.writeFile(wb, `Thoi_khoa_bieu_${activeClass?.name || 'lop'}.xlsx`);
      showToast('Đã xuất thời khóa biểu ra tệp Excel!', 'success');
    } catch {
      showToast('Lỗi khi xuất tệp Excel', 'error');
    }
  };

  // Import từ file Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length < 2) {
          showToast('Tệp Excel không có đủ dữ liệu bảng thời khóa biểu.', 'error');
          return;
        }

        const headerRow = rawData[0];
        const daysInSheet: string[] = [];
        for (let col = 2; col < headerRow.length; col++) {
          if (headerRow[col]) {
            daysInSheet.push(String(headerRow[col]).trim());
          }
        }

        const effectiveDays = daysInSheet.length > 0 ? daysInSheet : draftTimetable.days;
        const newPeriods: TimetablePeriod[] = [];

        for (let r = 1; r < rawData.length; r++) {
          const row = rawData[r];
          if (!row || row.length === 0) continue;
          const periodName = String(row[0] || `Tiết ${r}`).trim();
          const periodTime = String(row[1] || DEFAULT_PERIOD_TIMES[r] || '').trim();
          const schedule: Record<string, string> = {};

          effectiveDays.forEach((day, idx) => {
            const cellVal = row[idx + 2];
            schedule[day] = cellVal ? String(cellVal).trim() : '-trống-';
          });

          newPeriods.push({
            id: `p-imported-${Date.now()}-${r}`,
            periodNumber: r,
            name: periodName,
            time: periodTime,
            schedule
          });
        }

        if (newPeriods.length > 0) {
          const importedData: Timetable = {
            classId: activeClassId || 'default',
            days: effectiveDays,
            periods: newPeriods,
            updatedAt: new Date().toISOString()
          };
          pushHistoryState(importedData);
          setIsEditing(true);
          showToast(`Đã nhập thành công ${newPeriods.length} tiết học từ Excel! Nhớ bấm Lưu.`, 'success');
        }
      } catch {
        showToast('Lỗi khi đọc tệp Excel. Vui lòng kiểm tra định dạng.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Input File ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* HEADER CARD - Nền xanh đen, viền cyan mảnh, chữ sáng rực rỡ */}
      <div className="bg-[#0b1329] border border-cyan-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 text-cyan-400 hover:text-cyan-200 rounded-xl border border-cyan-500/20 transition-all cursor-pointer shadow-xs"
              title="Quay về Bàn làm việc"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                  Trường THCS Nguyễn Lương Bằng
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Năm học 2026 - 2027
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
                <Calendar className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <span className="drop-shadow-sm">Thời Khóa Biểu Học Tập · Lớp {activeClass?.name || '7A3'}</span>
              </h1>
              <p className="text-xs text-cyan-200 font-medium mt-0.5">
                {activeClass?.room || 'Phòng 204'} · GVCN: <span className="text-white font-bold">{activeClass?.teacherName || 'Cô Trần Thị Mai Anh'}</span> · Môn: {activeClass?.subject || 'Toán học'}
              </p>
            </div>
          </div>

          {/* Cụm Tabs chuyển chế độ xem & Bộ chọn lớp */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Tabs: Lịch lớp học, Lịch giáo viên, Lịch phòng học */}
            <div className="flex items-center p-1 bg-[#070d1e] rounded-xl border border-slate-800 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setScheduleViewType('class')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  scheduleViewType === 'class'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Lịch lớp học</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleViewType('teacher');
                  showToast('Đang xem thời khóa biểu theo phân công giáo viên', 'info');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  scheduleViewType === 'teacher'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Lịch giáo viên</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleViewType('room');
                  showToast('Đang xem lịch sử dụng phòng học và phòng chức năng', 'info');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  scheduleViewType === 'room'
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lịch phòng học</span>
              </button>
            </div>

            {/* Dropdown Bộ chọn lớp */}
            <div className="flex items-center gap-2 bg-[#070d1e] px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs">
              <span className="text-cyan-400 font-extrabold uppercase text-[10px] tracking-wider">LỚP:</span>
              <select
                value={activeClassId}
                onChange={e => handleClassSelectChange(e.target.value)}
                className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer pr-1"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                    Lớp {cls.name} ({cls.studentCount || 20} HS)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* THANH CÔNG CỤ TOOLBAR GỌN GÀNG (Sát theo mẫu ảnh 1, 2, 3 + Nút Xóa Từng Tiết / Thứ theo yêu cầu) */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Cụm công cụ bên trái */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút 1: Chỉnh sửa / Đang chỉnh sửa (Màu Cyan) */}
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isEditing
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-950/40 font-extrabold'
                  : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-white border border-cyan-600/70'
              }`}
              title={isEditing ? 'Thoát chế độ chỉnh sửa' : 'Bật chế độ chỉnh sửa trực tiếp (nhấp ô để gõ chữ)'}
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}</span>
            </button>

            {/* Nút 4: Hoàn tác (Undo) */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              title="Hoàn tác (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Hoàn tác</span>
            </button>

            {/* Nút 5: Làm lại (Redo) */}
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              title="Làm lại (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Làm lại</span>
            </button>

            {/* Nút 6: Import Excel */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/80 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Nhập thời khóa biểu từ Excel (.xlsx, .csv)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>

            {/* Nút 7: Xuất thời khóa biểu */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-700/80 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Xuất thời khóa biểu ra tệp Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất TKB</span>
            </button>
          </div>

          {/* Cụm bên phải: Nút LƯU thời khóa biểu (Hiện khi đang chỉnh sửa) */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 border border-emerald-400 ring-2 ring-emerald-500/30 transition-all cursor-pointer shadow-lg shadow-emerald-950/60"
                title="Lưu tất cả thay đổi thời khóa biểu"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thời khóa biểu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BANNER HƯỚNG DẪN CHẾ ĐỘ CHỈNH SỬA (Sát theo mẫu Hình 2) */}
      {isEditing && !isEraseMode && (
        <div className="bg-cyan-950/80 border border-cyan-500/80 text-cyan-100 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>
              <strong>Đang ở chế độ chỉnh sửa!</strong> Nhấp trực tiếp vào bất kỳ ô nào để nhập/sửa nội dung. Enter để xuống dòng, Tab chuyển ô, bấm <strong>Lưu</strong> khi hoàn thành.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
          >
            Đóng chỉnh sửa
          </button>
        </div>
      )}

      {/* BANNER HƯỚNG DẪN CHẾ ĐỘ XÓA NHANH (Sát theo mẫu Hình 3) */}
      {isEraseMode && (
        <div className="bg-rose-950/90 border border-rose-500 text-rose-100 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Eraser className="w-4 h-4 text-rose-300 shrink-0" />
            <span>
              <strong>Chế độ xóa ô đang bật!</strong> Nhấp vào bất kỳ ô thời khóa biểu nào để xóa nội dung về &apos;-trống-&apos;. Nhấp lại nút Xóa để thoát.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEraseMode(false)}
            className="text-[11px] font-bold text-rose-100 hover:text-white bg-rose-900/90 hover:bg-rose-800 px-2.5 py-1 rounded-lg border border-rose-500 cursor-pointer transition-colors"
          >
            Thoát xóa nhanh
          </button>
        </div>
      )}

      {/* BẢNG THỜI KHÓA BIỂU CHÍNH */}
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[720px]">
            {/* Header Columns */}
            <thead>
              <tr className="bg-[#080e1e] border-b border-cyan-500/20 text-slate-200 font-extrabold">
                {/* Cột đầu: Tiết / Giờ */}
                <th className="py-3.5 px-4 w-36 border-r border-slate-800 text-center font-mono uppercase tracking-wider text-[11px] text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">
                  Tiết / Giờ
                </th>

                {/* Các cột Thứ (Thứ 2 -> Chủ nhật) */}
                {draftTimetable.days.map((day) => (
                  <th
                    key={day}
                    className="py-3 px-3.5 border-r border-slate-800 min-w-[140px] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-white font-extrabold tracking-wide text-xs drop-shadow-sm">
                        {day}
                      </span>

                      {/* Nút hành động trên đầu cột: Làm trống thứ, Xóa cột thứ, Thêm cột */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Nút làm trống nhanh toàn bộ tiết trong Thứ này (theo yêu cầu xóa từng thứ) */}
                        <button
                          type="button"
                          onClick={() => setColumnToClear(day)}
                          className="p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 rounded transition-colors cursor-pointer"
                          title={`Làm trống tất cả các tiết trong ${day} về -trống-`}
                        >
                          <Eraser className="w-3.5 h-3.5" />
                        </button>

                        {/* Khi ở Edit mode: hiển thị icon "+" thêm cột và "×" xóa cột */}
                        {isEditing && (
                          <>
                            <button
                              type="button"
                              onClick={handleAddDayColumn}
                              className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 rounded transition-colors cursor-pointer"
                              title="Thêm cột ngày vào tuần (Thứ 7, Chủ nhật...)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setColumnToDelete(day)}
                              className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded transition-colors cursor-pointer"
                              title={`Xóa cột ${day} khỏi thời khóa biểu`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </th>
                ))}

                {/* Cột icon thùng rác xóa hàng khi ở Edit mode */}
                {isEditing && (
                  <th className="py-3 px-3 w-16 text-center border-l border-slate-800 text-rose-400 font-extrabold text-[10px]">
                    Xóa Hàng
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body Rows */}
            <tbody className="divide-y divide-slate-800/80">
              {draftTimetable.periods.map((period, periodIdx) => (
                <tr
                  key={period.id}
                  className="hover:bg-slate-900/50 transition-colors group/row"
                >
                  {/* Cột Tiết & Khoảng giờ: Có nút xóa từng tiết theo yêu cầu */}
                  <td className="py-3 px-3 border-r border-slate-800 bg-[#070c1a]/70 text-center align-middle relative">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="font-extrabold text-white text-xs tracking-tight drop-shadow-sm">
                          {period.name}
                        </span>

                        {/* Nút xóa/làm trống nội dung riêng cho từng Tiết học (theo yêu cầu) */}
                        <button
                          type="button"
                          onClick={() => setPeriodToClear(period)}
                          className="opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-amber-300 rounded transition-all cursor-pointer"
                          title={`Xóa sạch nội dung của ${period.name} trên tất cả các ngày`}
                        >
                          <Eraser className="w-3 h-3" />
                        </button>
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={period.time}
                          onChange={e => handlePeriodTimeChange(periodIdx, e.target.value)}
                          onBlur={e => handlePeriodTimeBlur(e.target.value)}
                          className="mt-1 w-24 text-[10px] font-mono text-center text-cyan-300 bg-slate-900 border border-cyan-500/30 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 font-bold"
                          title="Chỉnh sửa khoảng giờ tiết học"
                        />
                      ) : (
                        <span className="text-[10px] text-cyan-200/80 font-mono mt-0.5 flex items-center justify-center gap-1 font-semibold">
                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{period.time}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Các ô dữ liệu ngày */}
                  {draftTimetable.days.map((day, dayIdx) => {
                    const rawContent = period.schedule[day] || '';
                    const isEmpty = !rawContent || rawContent === '-trống-';

                    return (
                      <td
                        key={`${period.id}-${day}`}
                        onClick={() => handleCellClick(periodIdx, day)}
                        className={`py-2 px-2.5 border-r border-slate-800 align-top transition-all relative group/cell ${
                          isEraseMode
                            ? 'cursor-pointer hover:bg-rose-950/40 hover:ring-1 hover:ring-rose-500/50'
                            : isEditing
                            ? 'hover:bg-slate-900/60 cursor-text'
                            : 'cursor-pointer hover:bg-slate-900/40'
                        }`}
                      >
                        {isEditing && !isEraseMode ? (
                          /* CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP: Textarea tự giãn, nhập chữ thoải mái, có nút xóa riêng ô đó */
                          <div className="relative">
                            <textarea
                              rows={Math.max(2, (rawContent.match(/\n/g) || []).length + 1)}
                              value={rawContent === '-trống-' ? '' : rawContent}
                              placeholder="-trống-"
                              onChange={e => handleCellChange(periodIdx, day, e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={e => handleCellKeyDown(e, periodIdx, dayIdx)}
                              className="w-full text-xs text-white bg-[#070d1e] hover:bg-[#070d1e] focus:bg-[#070d1e] border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 rounded-lg p-2 pr-6 focus:outline-none resize-none transition-all placeholder:text-slate-500 placeholder:italic leading-relaxed font-sans font-semibold"
                            />

                            {/* Nút xóa ô này về '-trống-' ngay lập tức (góc trên bên phải ô) */}
                            {!isEmpty && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearSingleCell(periodIdx, day);
                                }}
                                className="absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded transition-colors cursor-pointer"
                                title="Xóa nội dung ô này về -trống-"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          /* CHẾ ĐỘ XEM / CHẾ ĐỘ XÓA NHANH */
                          <div
                            className={`p-2 rounded-lg min-h-[58px] flex flex-col justify-center transition-all ${
                              isEraseMode
                                ? isEmpty
                                  ? 'bg-[#070d1e]/30 text-slate-500 italic text-center border border-transparent'
                                  : 'bg-[#070d1e]/80 text-white border border-rose-500/40 hover:border-rose-500 hover:bg-rose-950/40 shadow-xs'
                                : isEmpty
                                ? 'bg-[#070d1e]/30 text-slate-500 italic text-center border border-transparent hover:border-cyan-500/30 hover:bg-[#070d1e]/60'
                                : 'bg-[#070d1e]/80 text-white border border-cyan-500/20 hover:border-cyan-400/60 shadow-xs'
                            }`}
                            title={!isEditing ? "Nhấp vào ô để chỉnh sửa ngay lập tức" : undefined}
                          >
                            {isEmpty ? (
                              <span className="text-[11px] text-slate-400/80 italic select-none font-medium">
                                -trống-
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                {rawContent.split('\n').map((line, lIdx) => (
                                  <div
                                    key={lIdx}
                                    className={
                                      lIdx === 0
                                        ? 'font-bold text-white text-xs tracking-tight drop-shadow-sm'
                                        : 'text-[11px] text-cyan-300 font-semibold drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]'
                                    }
                                  >
                                    {line}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Chỉ báo trong chế độ xóa nhanh */}
                            {isEraseMode && !isEmpty && (
                              <div className="mt-1 text-[9px] text-rose-400 font-bold flex items-center justify-end gap-0.5">
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>Bấm để xóa</span>
                              </div>
                            )}

                            {/* Chỉ báo click để sửa khi ở chế độ xem */}
                            {!isEditing && isEmpty && (
                              <div className="hidden group-hover/cell:block text-[9px] text-cyan-400 font-semibold text-center mt-1">
                                Nhấp để nhập
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột Icon thùng rác màu hồng xóa hàng tiết học */}
                  {isEditing && (
                    <td className="py-2 px-2 text-center align-middle border-l border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPeriodToDelete(period)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title={`Xóa hàng ${period.name} trên tất cả các ngày`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DƯỚI CÙNG BẢNG: Nút "+ Thêm tiết học mới" & Nút "Xóa toàn bộ TKB" khi ở Edit mode */}
        {isEditing && (
          <div className="p-3 bg-[#080e1e] border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddNewPeriod}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Thêm tiết học mới</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClearAllModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/60 rounded-xl transition-all cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5 text-rose-400" />
              <span>Làm trống toàn bộ thời khóa biểu</span>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER BAR: Hướng dẫn nhanh & Trạng thái lưu */}
      <div className="p-3.5 bg-[#0b1329] border border-cyan-500/20 rounded-xl text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>
            💡 Mẹo: Nhấp trực tiếp vào bất kỳ ô nào để sửa nội dung. Sử dụng nút <strong>&quot;Xóa chọn lọc từng tiết/thứ&quot;</strong> để xóa đúng phần bạn muốn mà không mất toàn bộ dữ liệu.
          </span>
          {hasUnsavedChanges && (
            <>
              <div>•</div>
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Có thay đổi chưa lưu (bấm Lưu để hoàn tất)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={handleToggleEdit}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-100 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Bật chế độ chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL XÓA CHỌN LỌC (TÙY CHỌN XÓA TỪNG TIẾT, THỨ KHÔNG BẮT BUỘC XÓA TẤT CẢ)
          ========================================================================= */}
      {isSelectiveDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-purple-500/50 rounded-2xl p-6 max-w-xl w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-950/70 rounded-xl border border-purple-700">
                  <Scissors className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Xóa Chọn Lọc Thời Khóa Biểu</h3>
                  <p className="text-xs text-purple-300/80">Chọn đúng các tiết hoặc thứ bạn muốn xóa, không xóa toàn bộ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectiveDeleteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chế độ: Làm trống nội dung vs Xóa hẳn hàng/cột */}
            <div className="bg-[#070d1e] p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                1. Hình thức xóa:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700/80 cursor-pointer hover:border-cyan-400">
                  <input
                    type="radio"
                    name="deleteAction"
                    checked={deleteModeAction === 'clear_content'}
                    onChange={() => setDeleteModeAction('clear_content')}
                    className="text-cyan-400"
                  />
                  <span>
                    <strong className="block text-white">Làm trống nội dung</strong>
                    <span className="text-[10px] text-slate-400">Chuyển nội dung về &apos;-trống-&apos;, giữ nguyên bảng</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700/80 cursor-pointer hover:border-rose-400">
                  <input
                    type="radio"
                    name="deleteAction"
                    checked={deleteModeAction === 'remove_structure'}
                    onChange={() => setDeleteModeAction('remove_structure')}
                    className="text-rose-400"
                  />
                  <span>
                    <strong className="block text-rose-300">Xóa bỏ hàng / cột</strong>
                    <span className="text-[10px] text-slate-400">Xóa hẳn cột thứ hoặc hàng tiết đã chọn</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Chọn các thứ cần xóa */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chọn các ngày Thứ muốn xóa:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDaysToDelete.length === draftTimetable.days.length) {
                      setSelectedDaysToDelete([]);
                    } else {
                      setSelectedDaysToDelete([...draftTimetable.days]);
                    }
                  }}
                  className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {selectedDaysToDelete.length === draftTimetable.days.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {draftTimetable.days.map(d => {
                  const isChecked = selectedDaysToDelete.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDaysToDelete(prev =>
                          isChecked ? prev.filter(x => x !== d) : [...prev, d]
                        );
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isChecked
                          ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                          : 'bg-[#070d1e] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chọn các tiết cần xóa */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chọn các Tiết học muốn xóa:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPeriodsToDelete.length === draftTimetable.periods.length) {
                      setSelectedPeriodsToDelete([]);
                    } else {
                      setSelectedPeriodsToDelete(draftTimetable.periods.map((_, idx) => idx));
                    }
                  }}
                  className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                >
                  {selectedPeriodsToDelete.length === draftTimetable.periods.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {draftTimetable.periods.map((p, idx) => {
                  const isChecked = selectedPeriodsToDelete.includes(idx);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPeriodsToDelete(prev =>
                          isChecked ? prev.filter(x => x !== idx) : [...prev, idx]
                        );
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isChecked
                          ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                          : 'bg-[#070d1e] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tóm tắt hành động */}
            <div className="p-2.5 bg-slate-900 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <span>
                Đang chọn: <strong>{selectedDaysToDelete.length} Thứ</strong>, <strong>{selectedPeriodsToDelete.length} Tiết</strong>
              </span>
              <span className="text-purple-300 font-semibold font-mono">
                {deleteModeAction === 'clear_content' ? 'Làm trống ô' : 'Xóa hàng/cột'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSelectiveDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteSelectiveDelete}
                disabled={selectedDaysToDelete.length === 0 && selectedPeriodsToDelete.length === 0}
                className="px-5 py-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-purple-950/60 cursor-pointer"
              >
                Thực hiện xóa lựa chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM TRỐNG TOÀN BỘ THỜI KHÓA BIỂU */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/70 rounded-xl border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Làm trống toàn bộ thời khóa biểu?</h3>
                <p className="text-xs text-slate-400">Chuyển tất cả môn học về &apos;-trống-&apos;</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn làm trống toàn bộ nội dung của thời khóa biểu lớp {activeClass?.name}? Bạn vẫn có thể dùng nút <strong>Hoàn tác</strong> trước khi nhấn Lưu.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg cursor-pointer"
              >
                Xác nhận làm trống tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM TRỐNG 1 THỨ */}
      {columnToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 bg-amber-950/70 rounded-xl border border-amber-800">
                <Eraser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Xóa nội dung {columnToClear}?</h3>
                <p className="text-xs text-slate-400">Làm trống các tiết của {columnToClear}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ môn học trong <strong>{columnToClear}</strong> về &apos;-trống-&apos;? Cột {columnToClear} vẫn được giữ nguyên trong tuần.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setColumnToClear(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClearDayContent}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg cursor-pointer"
              >
                Xóa sạch {columnToClear}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN LÀM TRỐNG 1 TIẾT */}
      {periodToClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 bg-amber-950/70 rounded-xl border border-amber-800">
                <Eraser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Xóa nội dung {periodToClear.name}?</h3>
                <p className="text-xs text-slate-400">Làm trống môn học của {periodToClear.name} trên tất cả các ngày</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa môn học trong <strong>{periodToClear.name}</strong> về &apos;-trống-&apos;? Hàng tiết học vẫn được giữ nguyên.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPeriodToClear(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClearPeriodContent}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg cursor-pointer"
              >
                Xóa sạch {periodToClear.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA HẲN CỘT NGÀY */}
      {columnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/70 rounded-xl border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Xác nhận xóa cột ngày</h3>
                <p className="text-xs text-slate-400">Hành động này tác động trực tiếp lên bản nháp</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa cột <strong>{columnToDelete}</strong>? Toàn bộ môn học và dữ liệu trong ngày này sẽ bị xóa khỏi bản nháp thời khóa biểu.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setColumnToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteColumn}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg cursor-pointer"
              >
                Xác nhận xóa cột
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA HẲN HÀNG TIẾT HỌC */}
      {periodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/70 rounded-xl border border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Xác nhận xóa tiết học</h3>
                <p className="text-xs text-slate-400">Hành động này tác động trực tiếp lên bản nháp</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong>{periodToDelete.name} ({periodToDelete.time})</strong> trên tất cả các ngày? Sau khi xóa, các tiết học bên dưới sẽ tự động được đánh số lại.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPeriodToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePeriod}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg cursor-pointer"
              >
                Xác nhận xóa tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẢNH BÁO KHI ĐỔI LỚP MÀ CHƯA LƯU */}
      {pendingClassChangeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 bg-amber-950/70 rounded-xl border border-amber-800">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Thay đổi chưa lưu</h3>
                <p className="text-xs text-slate-400">Bạn đang chuyển sang lớp học khác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có một số thay đổi chưa lưu trên thời khóa biểu lớp hiện tại. Bạn có muốn lưu các thay đổi này trước khi chuyển lớp không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPendingClassChangeId(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                Ở lại trang
              </button>
              <button
                type="button"
                onClick={handleDiscardAndSwitchClass}
                className="px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded-xl cursor-pointer"
              >
                Hủy bỏ thay đổi
              </button>
              <button
                type="button"
                onClick={handleSaveAndSwitchClass}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Lưu & Chuyển lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
