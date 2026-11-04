import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';

// Feature Pages
import { DashboardPage } from './components/features/dashboard/DashboardPage';
import { ClassesPage } from './components/features/classes/ClassesPage';
import { StudentsPage } from './components/features/students/StudentsPage';
import { AttendancePage } from './components/features/attendance/AttendancePage';
import { GradesPage } from './components/features/grades/GradesPage';
import { AssignmentsPage } from './components/features/assignments/AssignmentsPage';
import { QuizzesPage } from './components/features/assignments/QuizzesPage';
import { AITeachingAssistantPage } from './components/features/ai/AITeachingAssistantPage';
import { LuckyWheelView } from './components/features/tools/LuckyWheelView';
import { GroupGeneratorView } from './components/features/tools/GroupGeneratorView';
import { ClassTimerView } from './components/features/tools/ClassTimerView';
import { RandomStudentQuickPick } from './components/features/tools/RandomStudentQuickPick';
import { BehaviorRewardsPage } from './components/features/behavior/BehaviorRewardsPage';
import { ReportsPage } from './components/features/reports/ReportsPage';
import { AuditLogPage } from './components/features/audit/AuditLogPage';
import { TimetablePage } from './components/features/timetable/TimetablePage';
import { SchoolFamilyPortal } from './components/features/portal/SchoolFamilyPortal';
import { Tv, X, ArrowLeft, Home, ChevronRight } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Bàn làm việc',
  classes: 'Lớp của tôi',
  students: 'Danh sách học sinh',
  attendance: 'Sổ điểm danh',
  timetable: 'Thời khóa biểu',
  portal: 'Cổng Liên Lạc Gia Đình & Bảng Tin',
  grades: 'Sổ điểm môn học',
  assignments: 'Bài tập về nhà',
  quizzes: 'Ngân hàng câu hỏi thông minh',
  'ai-teaching': 'Hỏi AI Mọi Thứ & Trợ Lý Dạy Học (Gemini 3.8 Flash)',
  'lucky-wheel': 'Vòng quay may mắn',
  'group-generator': 'Chia nhóm ngẫu nhiên',
  timer: 'Đồng hồ & Timer',
  'random-student': 'Gọi nhanh ngẫu nhiên',
  behavior: 'Nề nếp & Khen thưởng',
  reports: 'Báo cáo & Phổ điểm',
  audit: 'Nhật ký hệ thống'
};

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeClass, projectorMode, toggleProjectorMode, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render current feature page
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'classes':
        return <ClassesPage />;
      case 'students':
        return <StudentsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'timetable':
        return <TimetablePage />;
      case 'portal':
        return <SchoolFamilyPortal />;
      case 'grades':
        return <GradesPage />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'quizzes':
        return <QuizzesPage />;
      case 'ai-teaching':
        return <AITeachingAssistantPage />;
      case 'lucky-wheel':
        return <LuckyWheelView />;
      case 'group-generator':
        return <GroupGeneratorView />;
      case 'timer':
        return <ClassTimerView />;
      case 'random-student':
        return <RandomStudentQuickPick />;
      case 'behavior':
        return <BehaviorRewardsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'audit':
        return <AuditLogPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] flex flex-col text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 pb-16 md:pb-0">
      {/* Projector Mode Top Floating HUD */}
      {projectorMode ? (
        <div className="bg-[#0b1329] border-b border-cyan-500/30 text-white px-6 py-2.5 flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>CHẾ ĐỘ MÁY CHIẾU LỚP HỌC (PROJECTOR MODE)</span>
          </div>
          <button
            onClick={toggleProjectorMode}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Thoát chế độ máy chiếu (ESC)</span>
          </button>
        </div>
      ) : (
        <Header onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />
      )}

      {/* Main Body Layout */}
      <div className="flex-1 flex">
        {/* Hide sidebar in Projector Mode for clean classroom projection */}
        {!projectorMode && (
          <Sidebar
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        )}

        <main className={`flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all ${projectorMode ? 'max-w-6xl' : ''}`}>
          {/* Universal Back Button & Breadcrumbs Bar when not on Dashboard */}
          {!projectorMode && activeTab !== 'dashboard' && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-[#0b1329] px-4 py-3 rounded-2xl border border-cyan-500/20 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs group"
                title="Quay về Bàn làm việc"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>← Quay về Bàn làm việc</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-hidden">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bàn làm việc</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-500/60 shrink-0" />
                <span className="text-slate-200 font-semibold truncate">
                  Lớp {activeClass?.name || '---'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-500/60 shrink-0" />
                <span className="font-bold text-cyan-300 truncate">
                  {TAB_TITLES[activeTab] || activeTab}
                </span>
              </div>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Bottom Nav Bar for Mobile Devices */}
      {!projectorMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b1329] border-t border-cyan-500/20 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <span className="text-base leading-none mb-0.5">🏠</span>
            <span>Tổng quan</span>
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
              activeTab === 'timetable' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <span className="text-base leading-none mb-0.5">📅</span>
            <span>TKB</span>
          </button>
          <button
            onClick={() => setActiveTab('lucky-wheel')}
            className={`flex items-center flex-col py-1 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'lucky-wheel' ? 'text-amber-300' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="text-base leading-none mb-0.5">🎡</span>
            <span>Vòng quay</span>
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center flex-col py-1 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              activeTab === 'grades' ? 'text-cyan-300' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="text-base leading-none mb-0.5">📊</span>
            <span>Sổ điểm</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center flex-col py-1 px-2 rounded-lg text-[10px] font-bold text-slate-300 hover:text-cyan-300 cursor-pointer"
          >
            <span className="text-base leading-none mb-0.5">☰</span>
            <span>Menu</span>
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
