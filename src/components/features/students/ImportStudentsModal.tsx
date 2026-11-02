import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student, Gender } from '../../../types';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, ArrowRight, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  rawIndex: number;
  code: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  phone: string;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export const ImportStudentsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeClass, students, importStudentsList, showToast } = useApp();

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawDataRows, setRawDataRows] = useState<any[][]>([]);

  // Column mappings
  const [colNameIdx, setColNameIdx] = useState<number>(1);
  const [colCodeIdx, setColCodeIdx] = useState<number>(0);
  const [colGenderIdx, setColGenderIdx] = useState<number>(-1);
  const [colPhoneIdx, setColPhoneIdx] = useState<number>(-1);

  // Parsed and validated rows
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

  // Paste text tab
  const [pasteText, setPasteText] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Tệp tin quá lớn (> 5MB). Vui lòng chọn tệp nhỏ hơn.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        if (!data || data.length < 2) {
          showToast('Tệp rỗng hoặc không có dữ liệu hàng.', 'error');
          return;
        }

        const headers = (data[0] || []).map((h: any, i: number) => String(h || `Cột ${i + 1}`).trim());
        const rows = data.slice(1).filter((r: any[]) => r && r.length > 0 && r.some(cell => cell !== undefined && cell !== ''));

        setRawHeaders(headers);
        setRawDataRows(rows);

        // Auto detect columns
        headers.forEach((h, idx) => {
          const lower = h.toLowerCase();
          if (lower.includes('họ') || lower.includes('tên') || lower.includes('name')) setColNameIdx(idx);
          if (lower.includes('mã') || lower.includes('code') || lower.includes('stt')) setColCodeIdx(idx);
          if (lower.includes('giới') || lower.includes('phái') || lower.includes('gender')) setColGenderIdx(idx);
          if (lower.includes('sđt') || lower.includes('thoại') || lower.includes('phone')) setColPhoneIdx(idx);
        });

        setStep('mapping');
      } catch {
        showToast('Lỗi đọc tệp tin. Vui lòng kiểm tra định dạng Excel/CSV.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessPastedText = () => {
    const lines = pasteText.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      showToast('Vui lòng dán danh sách họ tên', 'warning');
      return;
    }

    const rows: any[][] = lines.map(line => {
      if (line.includes('\t')) return line.split('\t').map(c => c.trim());
      if (line.includes(',')) return line.split(',').map(c => c.trim());
      return [line];
    });

    setRawHeaders(['Họ và tên']);
    setRawDataRows(rows);
    setColNameIdx(0);
    setColCodeIdx(-1);
    setColGenderIdx(-1);
    setColPhoneIdx(-1);
    setStep('mapping');
  };

  const handleValidateAndPreview = () => {
    if (colNameIdx < 0) {
      showToast('Bạn phải chọn cột chứa Họ và Tên học sinh', 'error');
      return;
    }

    const existingCodes = new Set(students.map(s => s.studentCode.toLowerCase()));
    const seenCodesInBatch = new Set<string>();

    const validated: ParsedRow[] = rawDataRows.map((row, idx) => {
      const rawName = row[colNameIdx] !== undefined ? String(row[colNameIdx]).trim() : '';
      let rawCode = colCodeIdx >= 0 && row[colCodeIdx] !== undefined ? String(row[colCodeIdx]).trim() : '';
      if (!rawCode) {
        rawCode = `HS-${String(Date.now() + idx).slice(-4)}`;
      }

      let gender: Gender = 'male';
      if (colGenderIdx >= 0 && row[colGenderIdx]) {
        const gStr = String(row[colGenderIdx]).toLowerCase();
        if (gStr.includes('nữ') || gStr.includes('f')) gender = 'female';
      }

      const phone = colPhoneIdx >= 0 && row[colPhoneIdx] !== undefined ? String(row[colPhoneIdx]).trim() : '';

      const errors: string[] = [];
      if (!rawName) errors.push('Thiếu họ tên');

      const isDupCode = existingCodes.has(rawCode.toLowerCase()) || seenCodesInBatch.has(rawCode.toLowerCase());
      if (isDupCode) {
        errors.push(`Mã số trùng: ${rawCode}`);
      }
      seenCodesInBatch.add(rawCode.toLowerCase());

      return {
        rawIndex: idx + 1,
        code: rawCode,
        fullName: rawName,
        gender,
        birthDate: '2012-01-01',
        phone,
        isValid: errors.length === 0,
        isDuplicate: isDupCode,
        errors
      };
    });

    setParsedRows(validated);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast('Không có dòng dữ liệu hợp lệ nào để nhập', 'error');
      return;
    }

    const payload = validRows.map(r => ({
      studentCode: r.code,
      fullName: r.fullName,
      gender: r.gender,
      birthDate: r.birthDate,
      classId: activeClass?.id || '',
      status: 'active' as const,
      parentPhone: r.phone,
      note: 'Nhập khẩu từ tệp'
    }));

    importStudentsList(payload);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-slate-100">
                Nhập danh sách học sinh từ tệp · Lớp {activeClass?.name}
              </h3>
              <p className="text-[11px] text-slate-400">Hỗ trợ Excel (.xlsx, .xls), CSV hoặc dán trực tiếp danh sách</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on Step */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Option 1: File Upload */}
              <div className="p-6 border-2 border-dashed border-cyan-500/30 rounded-2xl text-center hover:border-cyan-400 transition-colors bg-[#070d1e]/60">
                <FileText className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
                <h4 className="text-sm font-semibold text-slate-200">Tải lên tệp Excel / CSV</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Kéo thả hoặc chọn tệp (.xlsx, .xls, .csv). Dung lượng tối đa 5MB.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl hover:from-cyan-300 hover:to-teal-300 cursor-pointer shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp tin từ máy</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option 2: Paste List */}
              <div className="p-4 bg-[#070d1e]/70 border border-cyan-500/20 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-200">Hoặc dán trực tiếp danh sách họ tên</h4>
                <p className="text-[11px] text-slate-400">Mỗi dòng một tên học sinh (có thể copy từ Word, Excel, Zalo)</p>
                <textarea
                  rows={4}
                  placeholder={`Nguyễn An\nTrần Bảo Anh\nLê Hoàng Bách...`}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-cyan-500/30 rounded-lg bg-[#070d1e] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleProcessPastedText}
                    className="px-3.5 py-1.5 text-xs font-semibold text-cyan-300 bg-[#142244] border border-cyan-500/30 rounded-lg hover:bg-[#1a2d5a] transition-colors cursor-pointer"
                  >
                    Tiếp tục với danh sách đã dán
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-5">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                Đã nhận diện <strong>{rawDataRows.length}</strong> dòng dữ liệu. Vui lòng xác nhận các cột tương ứng:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cột Họ và Tên *</label>
                  <select
                    value={colNameIdx}
                    onChange={e => setColNameIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-cyan-500/30 rounded-lg bg-[#070d1e] text-slate-100"
                  >
                    {rawHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cột Mã học sinh</label>
                  <select
                    value={colCodeIdx}
                    onChange={e => setColCodeIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-cyan-500/30 rounded-lg bg-[#070d1e] text-slate-100"
                  >
                    <option value={-1}>-- Tự động sinh mã (HS-XXXX) --</option>
                    {rawHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cột Giới tính</label>
                  <select
                    value={colGenderIdx}
                    onChange={e => setColGenderIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-cyan-500/30 rounded-lg bg-[#070d1e] text-slate-100"
                  >
                    <option value={-1}>-- Mặc định Nam --</option>
                    {rawHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cột Số điện thoại</label>
                  <select
                    value={colPhoneIdx}
                    onChange={e => setColPhoneIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-cyan-500/30 rounded-lg bg-[#070d1e] text-slate-100"
                  >
                    <option value={-1}>-- Không có --</option>
                    {rawHeaders.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-cyan-500/20">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Quay lại chọn tệp
                </button>
                <button
                  onClick={handleValidateAndPreview}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  <span>Kiểm tra & Xem trước</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#070d1e] border border-cyan-500/20">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Tổng số dòng</span>
                  <div className="text-lg font-bold font-mono text-cyan-300">{parsedRows.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">Hợp lệ để nhập</span>
                  <div className="text-lg font-bold font-mono text-emerald-300">{validCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30">
                  <span className="text-[10px] font-semibold text-rose-400 uppercase">Dòng lỗi / Trùng</span>
                  <div className="text-lg font-bold font-mono text-rose-300">{errorCount}</div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-cyan-500/20 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#070d1e] border-b border-cyan-500/20 text-slate-300 sticky top-0 font-semibold">
                    <tr>
                      <th className="p-2.5">STT</th>
                      <th className="p-2.5">Mã HS</th>
                      <th className="p-2.5">Họ và tên</th>
                      <th className="p-2.5">Giới tính</th>
                      <th className="p-2.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10">
                    {parsedRows.map(row => (
                      <tr key={row.rawIndex} className={row.isValid ? 'hover:bg-cyan-950/20' : 'bg-rose-950/30'}>
                        <td className="p-2.5 font-mono text-slate-500">{row.rawIndex}</td>
                        <td className="p-2.5 font-mono font-medium text-cyan-300">{row.code}</td>
                        <td className="p-2.5 font-semibold text-slate-100">{row.fullName}</td>
                        <td className="p-2.5 text-slate-400">{row.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hợp lệ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold" title={row.errors.join(', ')}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {row.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4 border-t border-cyan-500/20">
                <button
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Quay lại điều chỉnh cột
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={validCount === 0}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Xác nhận nhập {validCount} học sinh hợp lệ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
