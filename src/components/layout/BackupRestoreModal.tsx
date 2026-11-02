import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import {
  Download,
  Upload,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogIn,
  LogOut,
  CheckCircle2,
  Database,
  Loader2
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const {
    refreshAllData,
    showToast,
    firebaseUser,
    isFirebaseLoading,
    isCloudSyncing,
    loginGoogle,
    logoutGoogle,
    syncToCloud,
    loadFromCloud
  } = useApp();

  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataStr = StorageService.exportDataAsJson();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartClass_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Đã tải xuống tệp sao lưu JSON thành công', 'success');
    } catch {
      showToast('Có lỗi xảy ra khi xuất dữ liệu', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const success = StorageService.importDataFromJson(content);
        if (success) {
          refreshAllData();
          setRestoreStatus('Khôi phục dữ liệu thành công!');
          showToast('Đã phục hồi dữ liệu từ bản sao lưu', 'success');
          setTimeout(() => {
            onClose();
            setRestoreStatus(null);
          }, 1000);
        } else {
          setRestoreStatus('Tệp sao lưu không hợp lệ hoặc sai định dạng schema');
          showToast('Tệp sao lưu không hợp lệ', 'error');
        }
      } catch {
        setRestoreStatus('Lỗi khi đọc tệp sao lưu');
        showToast('Lỗi khi đọc tệp sao lưu', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu gốc ban đầu? Các dữ liệu đã nhập sẽ bị ghi đè.')) {
      StorageService.resetToDefault();
      refreshAllData();
      showToast('Đã thiết lập lại dữ liệu mẫu giáo viên thành công', 'info');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-black text-sm text-white">Quản lý Dữ liệu & Firebase Cloud</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Section A: Firebase Firestore Cloud Sync */}
          <div className="p-4 bg-gradient-to-br from-[#0c1a38] to-[#070d1e] border border-cyan-500/40 rounded-2xl space-y-3.5 shadow-lg shadow-cyan-950/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">Firebase Firestore Cloud Database</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Đã kết nối
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Project: <span className="text-cyan-300">{firebaseConfig.projectId}</span>
                  </p>
                </div>
              </div>

              {/* Google Auth Button */}
              {isFirebaseLoading ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 rounded-xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Đang tải...</span>
                </div>
              ) : firebaseUser ? (
                <button
                  onClick={logoutGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer"
                  title="Đăng xuất tài khoản Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <button
                  onClick={loginGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập Google</span>
                </button>
              )}
            </div>

            {/* Auth status notification */}
            {firebaseUser ? (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">
                    Tài khoản: <strong className="text-cyan-300">{firebaseUser.displayName || firebaseUser.email}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 shrink-0 font-medium font-mono">Google Auth OK</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90">
                Đăng nhập tài khoản Google để lưu trữ & đồng bộ cơ sở dữ liệu học sinh, lớp học và điểm số không giới hạn lên Cloud Firebase.
              </div>
            )}

            {/* Cloud Actions Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                disabled={!firebaseUser || isCloudSyncing}
                onClick={syncToCloud}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md cursor-pointer"
              >
                {isCloudSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <CloudUpload className="w-4 h-4 text-slate-950" />
                )}
                <span>Đồng bộ lên Cloud</span>
              </button>

              <button
                disabled={!firebaseUser || isCloudSyncing}
                onClick={loadFromCloud}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 bg-[#142244] border border-cyan-500/30 hover:bg-[#1a2d5a] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer"
              >
                {isCloudSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <CloudDownload className="w-4 h-4 text-cyan-400" />
                )}
                <span>Tải dữ liệu từ Cloud</span>
              </button>
            </div>
          </div>

          {/* Section B: Local Backup & Restore */}
          <div className="p-3.5 bg-[#070d1e] border border-cyan-500/25 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Sao lưu & Phục hồi Tệp cục bộ (.json)</span>
            </h4>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">1. Xuất tệp JSON ra máy tính</p>
                <p className="text-[11px] text-slate-400">Lưu trữ tệp dự phòng ngoại tuyến</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp sao lưu</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-200 mb-1.5">2. Khôi phục từ tệp đã sao lưu</p>
              <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 bg-[#142244] border border-cyan-500/30 rounded-xl hover:bg-[#1a2d5a] cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Chọn tệp .json để phục hồi</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              {restoreStatus && (
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {restoreStatus}
                </div>
              )}
            </div>
          </div>

          {/* Reset section */}
          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300">Khởi tạo lại dữ liệu mẫu</h4>
              <p className="text-[10px] text-slate-500">Nạp lại danh sách mẫu lớp 7A3, 7A1, 8A2 năm 2026</p>
            </div>
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đặt lại mẫu</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#070d1e] border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-300 bg-[#142244] border border-cyan-500/30 rounded-xl hover:bg-[#1a2d5a] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
