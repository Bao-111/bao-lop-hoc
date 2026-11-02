import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Users, School, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { students, classes, assignments, quizzes, setActiveTab, setActiveClassId } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanQuery = query.trim().toLowerCase();

  // Search results
  const results = useMemo(() => {
    if (!cleanQuery) return null;

    const matchedStudents = students.filter(
      s =>
        s.fullName.toLowerCase().includes(cleanQuery) ||
        s.studentCode.toLowerCase().includes(cleanQuery) ||
        (s.parentPhone && s.parentPhone.includes(cleanQuery))
    ).slice(0, 5);

    const matchedClasses = classes.filter(
      c =>
        c.name.toLowerCase().includes(cleanQuery) ||
        c.subject.toLowerCase().includes(cleanQuery) ||
        (c.room && c.room.toLowerCase().includes(cleanQuery))
    ).slice(0, 4);

    const matchedAssignments = assignments.filter(
      a =>
        a.title.toLowerCase().includes(cleanQuery) ||
        (a.description && a.description.toLowerCase().includes(cleanQuery))
    ).slice(0, 4);

    const matchedQuizzes = quizzes.filter(
      q => q.title.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);

    return {
      students: matchedStudents,
      classes: matchedClasses,
      assignments: matchedAssignments,
      quizzes: matchedQuizzes,
      total: matchedStudents.length + matchedClasses.length + matchedAssignments.length + matchedQuizzes.length
    };
  }, [cleanQuery, students, classes, assignments, quizzes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#070d1e]/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/40 overflow-hidden flex flex-col max-h-[75vh] text-slate-100">
        <div className="p-3.5 border-b border-cyan-500/20 flex items-center gap-3 bg-[#070d1e]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm học sinh, lớp học, bài tập, đề kiểm tra... (ESC để đóng)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white rounded cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 bg-[#0b1329] border border-cyan-500/30 rounded">
            ESC
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cleanQuery && (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
              <p className="text-xs">Gõ tên học sinh, mã số học sinh (ví dụ: HS-0801), hoặc lớp (7A3)...</p>
            </div>
          )}

          {results && results.total === 0 && (
            <div className="py-8 text-center text-slate-400">
              <p className="text-sm font-bold text-slate-300">Không tìm thấy kết quả nào</p>
              <p className="text-xs mt-1 text-slate-500">Hãy thử với từ khóa khác hoặc kiểm tra lại chính tả</p>
            </div>
          )}

          {results && results.students.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Học sinh ({results.students.length})</span>
              </div>
              <div className="space-y-1">
                {results.students.map(s => {
                  const targetClass = classes.find(c => c.id === s.classId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveClassId(s.classId);
                        setActiveTab('students');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#142244] transition-colors text-left group border border-transparent hover:border-cyan-500/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} avatarUrl={s.avatarUrl} gender={s.gender} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                            {s.fullName}
                            <span className="text-[11px] font-mono text-cyan-400/80">({s.studentCode})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {targetClass?.name || 'Lớp'} · {s.gender === 'male' ? 'Nam' : 'Nữ'}
                            {s.parentPhone ? ` · SĐT: ${s.parentPhone}` : ''}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {results && results.classes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                <span>Lớp học ({results.classes.length})</span>
              </div>
              <div className="space-y-1">
                {results.classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveClassId(c.id);
                      setActiveTab('classes');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#142244] transition-colors text-left group border border-transparent hover:border-cyan-500/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-950 text-xs shrink-0 shadow-sm"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.name}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                          Lớp {c.name} · {c.subject}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.room} · Khối {c.grade} · {c.studentCount || 0} học sinh
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results && results.assignments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bài tập ({results.assignments.length})</span>
              </div>
              <div className="space-y-1">
                {results.assignments.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setActiveClassId(a.classId);
                      setActiveTab('assignments');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#142244] transition-colors text-left group border border-transparent hover:border-cyan-500/30 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">{a.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{a.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results && results.quizzes.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Trắc nghiệm ({results.quizzes.length})</span>
              </div>
              <div className="space-y-1">
                {results.quizzes.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveClassId(q.classId);
                      setActiveTab('quizzes');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#142244] transition-colors text-left group border border-transparent hover:border-cyan-500/30 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">{q.title}</div>
                      <div className="text-[11px] text-slate-400">{q.subject} · {q.questions.length} câu hỏi</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-[#070d1e] border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tìm nhanh trên toàn bộ hệ thống</span>
          <button onClick={onClose} className="hover:text-white font-bold cursor-pointer">
            Đóng (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
