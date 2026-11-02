import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { SchoolAnnouncement, ClassActivityPost, Student } from '../../../types';
import {
  MessagesSquare,
  Megaphone,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Phone,
  FileText,
  Download,
  Send,
  Sparkles,
  Search,
  BookOpen,
  X
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export const SchoolFamilyPortal: React.FC = () => {
  const {
    activeClass,
    classes,
    teacher,
    classStudents,
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    activities,
    createActivity,
    deleteActivity,
    likeActivity,
    addActivityComment,
    deleteActivityComment,
    showToast
  } = useApp();

  // Sub-tabs in School-Family Portal
  const [activeSubTab, setActiveSubTab] = useState<'activities' | 'announcements' | 'contact_book' | 'messages'>('activities');

  // Modal tạo bài đăng hoạt động lớp
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityCategory, setActivityCategory] = useState<ClassActivityPost['category']>('stem');
  const [activityImageUrls, setActivityImageUrls] = useState<string>('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80');

  // Modal tạo thông báo mới
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<SchoolAnnouncement['category']>('schedule');
  const [annTargetClass, setAnnTargetClass] = useState<string>('all');
  const [annIsUrgent, setAnnIsUrgent] = useState(false);

  // Ô nhập bình luận cho từng bài viết
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Tìm kiếm sổ liên lạc học sinh
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Chat message draft
  const [chatDraft, setChatDraft] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; role: string; text: string; time: string }>>([
    {
      id: 'm1',
      sender: 'Cô Trần Thị Mai Anh',
      role: 'GVCN Lớp 7A3',
      text: 'Kính chào quý phụ huynh! Hôm nay các con đã hoàn thành rất tốt tiết thực hành STEM. Đề nghị ba mẹ động viên các con hoàn thành bài tập về nhà trước 22:00 nhé ạ.',
      time: '17:30'
    },
    {
      id: 'm2',
      sender: 'Phụ huynh em Nguyễn Văn An (Bố)',
      role: 'Phụ huynh 7A3',
      text: 'Dạ cảm ơn cô giáo nhiều ạ! Cháu An vừa về nhà khoe mô hình với gia đình rất phấn khởi.',
      time: '18:15'
    },
    {
      id: 'm3',
      sender: 'Phụ huynh em Trần Thị Ánh (Mẹ)',
      role: 'Phụ huynh 7A3',
      text: 'Cô cho tôi hỏi bài kiểm tra giữa kỳ 1 tuần sau thi theo thời khóa biểu hay có lịch riêng không ạ?',
      time: '18:30'
    },
    {
      id: 'm4',
      sender: 'Cô Trần Thị Mai Anh',
      role: 'GVCN Lớp 7A3',
      text: 'Dạ, lịch thi giữa kỳ đã được Ban Giám hiệu gửi chi tiết trong mục Thông báo của trường, ba mẹ có thể xem ngay trên ứng dụng ạ.',
      time: '18:45'
    }
  ]);

  // Handle comment submit
  const handleCommentSubmit = (activityId: string) => {
    const text = (commentInputs[activityId] || '').trim();
    if (!text) return;

    addActivityComment(activityId, {
      authorName: `${teacher.name} (GVCN)`,
      role: 'teacher',
      content: text
    });

    setCommentInputs(prev => ({ ...prev, [activityId]: '' }));
    showToast('Đã gửi phản hồi đến phụ huynh học sinh', 'success');
  };

  // Handle create activity
  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề hoạt động!', 'warning');
      return;
    }

    const urls = activityImageUrls
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

    createActivity({
      classId: activeClass?.id || 'class-7a3',
      className: `Lớp ${activeClass?.name || '7A3'}`,
      title: activityTitle.trim(),
      description: activityDesc.trim(),
      category: activityCategory,
      mediaType: 'images',
      mediaUrls: urls.length > 0 ? urls : ['https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80'],
      date: new Date().toISOString().split('T')[0],
      authorName: `${teacher.name} (GVCN)`
    });

    setIsNewActivityModalOpen(false);
    setActivityTitle('');
    setActivityDesc('');
    showToast('Đã đăng tải hoạt động lớp học mới thành công!', 'success');
  };

  // Handle create announcement
  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!', 'warning');
      return;
    }

    const targetCls = classes.find(c => c.id === annTargetClass);
    const targetName = annTargetClass === 'all' ? 'Toàn trường' : `Lớp ${targetCls?.name || ''}`;

    createAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      category: annCategory,
      targetClassId: annTargetClass,
      targetClassName: targetName,
      date: new Date().toISOString().split('T')[0],
      totalTargetCount: annTargetClass === 'all' ? 120 : (targetCls?.studentCount || 20),
      isUrgent: annIsUrgent,
      author: teacher.name,
      authorRole: 'Giáo viên Chủ nhiệm'
    });

    setIsNewAnnouncementModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    showToast('Đã gửi thông báo mới đến phụ huynh học sinh!', 'success');
  };

  // Handle send chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: teacher.name,
        role: `GVCN Lớp ${activeClass?.name || '7A3'}`,
        text: chatDraft.trim(),
        time: timeStr
      }
    ]);
    setChatDraft('');
  };

  // Filter students for contact book
  const filteredStudents = classStudents.filter(s => {
    if (!contactSearchQuery) return true;
    const q = contactSearchQuery.toLowerCase();
    const matchName = s.fullName.toLowerCase().includes(q);
    const matchCode = s.studentCode.toLowerCase().includes(q);
    const matchParent = (s.parentName || '').toLowerCase().includes(q) || (s.parentPhone || '').includes(q);
    return matchName || matchCode || matchParent;
  });

  return (
    <div className="space-y-4">
      {/* COMPACT STREAMLINED HEADER */}
      <div className="bg-[#0b1329] border border-cyan-500/25 rounded-2xl p-4 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <MessagesSquare className="w-5 h-5 text-pink-400" />
            <span>Sổ Liên Lạc & Bảng Tin Hoạt Động Lớp</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kênh liên lạc trực tuyến giữa giáo viên và phụ huynh · Lớp {activeClass?.name}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewAnnouncementModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-[#142244] hover:bg-[#1a2d5a] border border-cyan-500/30 rounded-xl transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Gửi thông báo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewActivityModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-300 hover:to-rose-300 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Chia sẻ ảnh/video lớp</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION - HIGH CONTRAST */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0b1329] rounded-xl border border-cyan-500/20 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('activities')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'activities'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hoạt động lớp học ({activities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'announcements'
              ? 'bg-pink-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Thông báo & Lịch học ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('contact_book')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'contact_book'
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sổ liên lạc học sinh ({classStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('messages')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'messages'
              ? 'bg-purple-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-[#142244]'
          }`}
        >
          <MessagesSquare className="w-4 h-4" />
          <span>Hộp thư với Phụ huynh</span>
        </button>
      </div>

      {/* SUB-TAB 1: HOẠT ĐỘNG LỚP HỌC */}
      {activeSubTab === 'activities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map(act => (
              <div
                key={act.id}
                className="bg-[#0b1329] border border-cyan-500/25 hover:border-cyan-400/40 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Banner */}
                  <div className="relative h-52 sm:h-56 bg-slate-950 overflow-hidden group">
                    <img
                      src={act.mediaUrls[0]}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-transparent to-black/40" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950/90 text-cyan-200 border border-cyan-400/50 backdrop-blur-xs shadow-md uppercase">
                        {act.category === 'stem' ? '🔬 Thực hành STEM' : act.category === 'cultural' ? '🎨 Hoạt động tập thể' : act.category === 'sports' ? '⚽ Thể thao' : '📖 Học tập'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {act.className}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteActivity(act.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 rounded-xl border border-rose-500/50 transition-colors cursor-pointer"
                      title="Xóa bài viết hoạt động này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{act.date} · {act.authorName}</span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug drop-shadow-sm mt-0.5">
                        {act.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-3.5 space-y-2.5">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {act.description}
                    </p>

                    {act.mediaUrls.length > 1 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {act.mediaUrls.slice(1, 4).map((url, uIdx) => (
                          <div key={uIdx} className="h-16 rounded-xl overflow-hidden border border-cyan-500/20">
                            <img src={url} alt="Chi tiết" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Likes & Comments */}
                <div className="p-3.5 pt-2 border-t border-cyan-500/15 bg-[#070d1e]/60">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-cyan-500/15">
                    <button
                      type="button"
                      onClick={() => likeActivity(act.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        act.userLiked
                          ? 'text-rose-400 bg-rose-950/40 border border-rose-500/40'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-[#142244]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${act.userLiked ? 'fill-rose-400' : ''}`} />
                      <span>{act.likesCount} Yêu thích</span>
                    </button>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{act.comments.length} Phản hồi</span>
                    </span>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                    {act.comments.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        Chưa có bình luận nào cho hoạt động này.
                      </p>
                    ) : (
                      act.comments.map(c => (
                        <div key={c.id} className="p-2 rounded-xl bg-[#0b1329] border border-cyan-500/15 text-xs space-y-1 relative group/c">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={c.authorName} size="xs" />
                              <span className="font-bold text-slate-100 text-[11px]">{c.authorName}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                c.role === 'teacher' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-pink-950 text-pink-300 border border-pink-500/30'
                              }`}>
                                {c.role === 'teacher' ? 'GVCN' : 'Phụ huynh'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteActivityComment(act.id, c.id)}
                              className="opacity-0 group-hover/c:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                              title="Xóa bình luận này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-tight font-medium pl-6">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <input
                      type="text"
                      placeholder="Viết nhận xét, phản hồi gửi phụ huynh..."
                      value={commentInputs[act.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleCommentSubmit(act.id);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleCommentSubmit(act.id)}
                      className="p-1.5 text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer"
                      title="Gửi phản hồi"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: THÔNG BÁO & LỊCH HỌC */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className="bg-[#0b1329] border border-cyan-500/25 hover:border-cyan-400/40 rounded-2xl p-4 shadow-lg transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      ann.isUrgent
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {ann.category === 'exam' ? '📝 Lịch thi' : ann.category === 'schedule' ? '📅 Thời khóa biểu' : ann.category === 'event' ? '🎉 Sự kiện' : '🏥 Y tế'}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{ann.date}</span>
                    </span>

                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#142244] text-slate-300 border border-cyan-500/20">
                      Gửi tới: {ann.targetClassName || 'Toàn trường'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-sm">
                    {ann.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Xóa thông báo này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                {ann.content}
              </p>

              {ann.attachmentTitle && (
                <div className="flex items-center gap-2 p-2 bg-[#070d1e] rounded-xl border border-cyan-500/30 max-w-md">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-mono font-medium truncate flex-1">
                    {ann.attachmentTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast(`Đang tải tệp "${ann.attachmentTitle}"...`, 'info')}
                    className="p-1 text-cyan-400 hover:text-white rounded cursor-pointer"
                    title="Tải về tệp đính kèm"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Người gửi: <strong className="text-slate-200">{ann.author}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{ann.readCount}/{ann.totalTargetCount} phụ huynh đã xem</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: SỔ LIÊN LẠC HỌC SINH */}
      {activeSubTab === 'contact_book' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1329] p-3.5 rounded-2xl border border-cyan-500/25">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Sổ Liên Lạc Điện Tử Học Sinh · Lớp {activeClass?.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tra cứu kết quả học tập và thông tin liên hệ chính xác của Bố & Mẹ
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học sinh, mã số, phụ huynh..."
                value={contactSearchQuery}
                onChange={e => setContactSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStudents.map(student => {
              const parents = student.parents || [];
              const father = parents.find(p => p.relationship === 'Bố') || (student.parentRelationship === 'Bố' ? { fullName: student.parentName, phone: student.parentPhone, job: student.parentJob } : null);
              const mother = parents.find(p => p.relationship === 'Mẹ') || (student.parentRelationship === 'Mẹ' ? { fullName: student.parentName, phone: student.parentPhone, job: student.parentJob } : null);

              return (
                <div
                  key={student.id}
                  className="bg-[#0b1329] border border-cyan-500/25 hover:border-cyan-400/50 rounded-2xl p-3.5 shadow-lg space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={student.fullName}
                        avatarUrl={student.avatarUrl}
                        gender={student.gender}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-[#142244] px-1.5 py-0.2 rounded border border-cyan-500/30">
                            {student.studentCode}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded">
                            {student.studyGroup || 'Tổ 1'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          {student.fullName}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {student.gender === 'male' ? 'Nam' : 'Nữ'} · Sinh: {student.birthDate || '---'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{student.stars}★</span>
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 block mt-0.5">
                        {student.conduct || 'Tốt'}
                      </span>
                    </div>
                  </div>

                  {/* THÔNG TIN PHỤ HUYNH LIÊN HỆ */}
                  <div className="p-2.5 bg-[#070d1e] rounded-xl border border-cyan-500/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] border-b border-cyan-500/10 pb-1">
                      <div>
                        <span className="text-slate-400 font-semibold">Bố: </span>
                        <strong className="text-slate-100">{father?.fullName || 'Chưa cập nhật'}</strong>
                      </div>
                      {father?.phone && (
                        <a
                          href={`tel:${father.phone}`}
                          className="flex items-center gap-1 text-cyan-300 font-mono font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{father.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <div>
                        <span className="text-slate-400 font-semibold">Mẹ: </span>
                        <strong className="text-slate-100">{mother?.fullName || 'Chưa cập nhật'}</strong>
                      </div>
                      {mother?.phone && (
                        <a
                          href={`tel:${mother.phone}`}
                          className="flex items-center gap-1 text-pink-300 font-mono font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{mother.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã kết nối</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubTab('messages');
                        showToast(`Mở hộp thư trao đổi với phụ huynh em ${student.fullName}`, 'info');
                      }}
                      className="text-[11px] font-bold text-cyan-300 hover:text-cyan-100 flex items-center gap-1 cursor-pointer"
                    >
                      <MessagesSquare className="w-3 h-3" />
                      <span>Nhắn tin</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HỘP THƯ VỚI PHỤ HUYNH */}
      {activeSubTab === 'messages' && (
        <div className="bg-[#0b1329] border border-cyan-500/25 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="border-b border-cyan-500/20 pb-2.5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MessagesSquare className="w-4 h-4 text-purple-400" />
                <span>Kênh Trao Đổi Ban Phụ Huynh & Giáo Viên · Lớp {activeClass?.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kênh liên lạc trực tiếp, bảo mật giữa giáo viên chủ nhiệm và phụ huynh học sinh
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/40">
              Trực tuyến
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto p-2 bg-[#070d1e] rounded-xl border border-cyan-500/20">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className="p-2.5 rounded-xl bg-[#0b1329] border border-cyan-500/15 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={msg.sender} size="xs" />
                    <strong className="text-white">{msg.sender}</strong>
                    <span className="text-[10px] text-cyan-400 bg-[#142244] px-1.5 py-0.2 rounded font-semibold border border-cyan-500/30">
                      {msg.role}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">{msg.time}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium pl-6">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Nhập nội dung tin nhắn gửi tới phụ huynh học sinh..."
              value={chatDraft}
              onChange={e => setChatDraft(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi tin</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL TẠO BÀI ĐĂNG HOẠT ĐỘNG LỚP */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Chia Sẻ Hoạt Động Của Lớp</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewActivityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivitySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tiêu đề hoạt động *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tiết học STEM - Chế tạo robot thủy lực"
                  value={activityTitle}
                  onChange={e => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô tả khoảnh khắc của các con *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chia sẻ những điểm nổi bật, tinh thần học tập và sự hào hứng của lớp..."
                  value={activityDesc}
                  onChange={e => setActivityDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chủ đề hoạt động</label>
                <select
                  value={activityCategory}
                  onChange={e => setActivityCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="stem">Thực hành STEM / Khoa học</option>
                  <option value="cultural">Văn nghệ / Báo tường / Sự kiện</option>
                  <option value="sports">Thể dục thể thao</option>
                  <option value="field_trip">Hoạt động ngoại khóa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Đường dẫn ảnh / video (mỗi dòng 1 liên kết)</label>
                <textarea
                  rows={2}
                  value={activityImageUrls}
                  onChange={e => setActivityImageUrls(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewActivityModalOpen(false)}
                  className="px-4 py-2 text-slate-300 bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Đăng lên bảng tin lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TẠO THÔNG BÁO MỚI */}
      {isNewAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-base text-white">Gửi Thông Báo Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAnnouncementModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Lịch thi giữa kỳ I & Kế hoạch ôn tập"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung thông báo *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Kính gửi quý phụ huynh..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phân loại</label>
                  <select
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="schedule">Thời khóa biểu / Lịch học</option>
                    <option value="exam">Lịch thi & Kiểm tra</option>
                    <option value="event">Sự kiện & Ngày hội</option>
                    <option value="tuition">Thông tin y tế / Học vụ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đối tượng nhận</label>
                  <select
                    value={annTargetClass}
                    onChange={e => setAnnTargetClass(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-cyan-500/30 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="all">Toàn trường THCS Nguyễn Lương Bằng</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={annIsUrgent}
                    onChange={e => setAnnIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded border-cyan-500/40 bg-[#070d1e]"
                  />
                  <span className="text-xs text-rose-300 font-bold">
                    Đánh dấu thông báo Khẩn cấp (Gửi thông báo đẩy tức thì)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnnouncementModalOpen(false)}
                  className="px-4 py-2 text-slate-300 bg-[#142244] hover:bg-[#1a2d5a] rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-pink-400 hover:bg-pink-300 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Gửi thông báo ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
