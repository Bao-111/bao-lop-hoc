import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student, Gender, StudentStatus, ConductGrade } from '../../../types';
import { User, Users, X, Phone, Mail, MapPin, Calendar, ArrowRight, ArrowLeft, Save, Briefcase, Award } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Student | null;
  defaultTab?: 'student' | 'parent';
}

export const StudentFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialData,
  defaultTab = 'student'
}) => {
  const { activeClass, classes, createStudent, updateStudent, students, showToast } = useApp();

  const [activeFormTab, setActiveFormTab] = useState<'student' | 'parent'>(defaultTab);

  // Student Info Fields
  const [studentCode, setStudentCode] = useState(
    initialData?.studentCode || `HS-${String(Date.now()).slice(-4)}`
  );
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'male');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '2012-05-15');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [classId, setClassId] = useState(initialData?.classId || activeClass?.id || '');
  const [status, setStatus] = useState<StudentStatus>(initialData?.status || 'active');
  const [studentPhone, setStudentPhone] = useState(initialData?.studentPhone || '');
  const [studentAddress, setStudentAddress] = useState(initialData?.studentAddress || 'Hà Nội');
  const [studyGroup, setStudyGroup] = useState(initialData?.studyGroup || 'Tổ 1');
  const [conduct, setConduct] = useState<ConductGrade>(initialData?.conduct || 'Tốt');

  // Parent Info Fields
  const [parentName, setParentName] = useState(initialData?.parentName || '');
  const [parentRelationship, setParentRelationship] = useState(initialData?.parentRelationship || 'Bố');
  const [parentPhone, setParentPhone] = useState(initialData?.parentPhone || '');
  const [parentEmail, setParentEmail] = useState(initialData?.parentEmail || '');
  const [parentAddress, setParentAddress] = useState(initialData?.parentAddress || 'Hà Nội');
  const [parentJob, setParentJob] = useState(initialData?.parentJob || '');
  const [parentAppStatus, setParentAppStatus] = useState<'connected' | 'not_connected'>(
    initialData?.parentAppStatus || 'connected'
  );

  const [note, setNote] = useState(initialData?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setStudentCode(initialData.studentCode);
      setFullName(initialData.fullName);
      setGender(initialData.gender);
      setBirthDate(initialData.birthDate || '2012-05-15');
      setAvatarUrl(initialData.avatarUrl || '');
      setClassId(initialData.classId);
      setStatus(initialData.status);
      setStudentPhone(initialData.studentPhone || '');
      setStudentAddress(initialData.studentAddress || 'Hà Nội');
      setStudyGroup(initialData.studyGroup || 'Tổ 1');
      setConduct(initialData.conduct || 'Tốt');

      setParentName(initialData.parentName || '');
      setParentRelationship(initialData.parentRelationship || 'Bố');
      setParentPhone(initialData.parentPhone || '');
      setParentEmail(initialData.parentEmail || '');
      setParentAddress(initialData.parentAddress || initialData.studentAddress || 'Hà Nội');
      setParentJob(initialData.parentJob || '');
      setParentAppStatus(initialData.parentAppStatus || 'connected');
      setNote(initialData.note || '');
    } else {
      setStudentCode(`HS-${String(Date.now()).slice(-4)}`);
      setFullName('');
      setGender('male');
      setBirthDate('2012-05-15');
      setAvatarUrl('');
      setClassId(activeClass?.id || '');
      setStatus('active');
      setStudentPhone('');
      setStudentAddress('Hà Nội');
      setStudyGroup('Tổ 1');
      setConduct('Tốt');

      setParentName('');
      setParentRelationship('Bố');
      setParentPhone('');
      setParentEmail('');
      setParentAddress('Hà Nội');
      setParentJob('');
      setParentAppStatus('connected');
      setNote('');
    }
    setActiveFormTab(defaultTab);
  }, [initialData, defaultTab, activeClass?.id]);

  // Smart detect parent relationship as teacher types
  const handleParentNameChange = (val: string) => {
    setParentName(val);
    const lower = val.toLowerCase();
    if (/(\bthị\b|\blan\b|\bmai\b|\bhoa\b|\bhương\b|\bhằng\b|\bnga\b|\btrang\b|\bhiền\b|\blinh\b|\bthảo\b|\bhạnh\b|\bdung\b|\bbích\b|\bloan\b|\bthủy\b|\bthu\b)/i.test(lower)) {
      if (parentRelationship === 'Bố') setParentRelationship('Mẹ');
    } else if (/(\bvăn\b|\bhùng\b|\bbình\b|\bdũng\b|\bnam\b|\bcường\b|\btuấn\b|\bthắng\b|\bđạt\b|\bsơn\b|\blong\b|\bminh\b|\bquang\b|\bhải\b|\bđức\b)/i.test(lower)) {
      if (parentRelationship === 'Mẹ') setParentRelationship('Bố');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedCode = studentCode.trim();

    if (!trimmedName) {
      showToast('Vui lòng nhập họ và tên học sinh', 'error');
      setActiveFormTab('student');
      return;
    }
    if (!trimmedCode) {
      showToast('Vui lòng nhập mã học sinh', 'error');
      setActiveFormTab('student');
      return;
    }

    // Check duplicate code
    const isDuplicate = students.some(
      s => s.studentCode.toLowerCase() === trimmedCode.toLowerCase() && s.id !== initialData?.id
    );
    if (isDuplicate) {
      showToast(`Mã học sinh "${trimmedCode}" đã được sử dụng`, 'error');
      setActiveFormTab('student');
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedParents = initialData?.parents ? [...initialData.parents] : [];
      if (parentName.trim() || parentPhone.trim()) {
        if (updatedParents.length === 0) {
          updatedParents = [{
            id: `p-${Date.now()}-1`,
            relationship: parentRelationship,
            fullName: parentName.trim(),
            phone: parentPhone.trim(),
            email: parentEmail.trim(),
            job: parentJob.trim(),
            address: parentAddress.trim(),
            isPrimary: true
          }];
        } else {
          const pIdx = updatedParents.findIndex(p => p.isPrimary) >= 0 ? updatedParents.findIndex(p => p.isPrimary) : 0;
          updatedParents[pIdx] = {
            ...updatedParents[pIdx],
            relationship: parentRelationship,
            fullName: parentName.trim(),
            phone: parentPhone.trim(),
            email: parentEmail.trim(),
            job: parentJob.trim(),
            address: parentAddress.trim(),
            isPrimary: true
          };
        }
      }

      const studentPayload = {
        fullName: trimmedName,
        studentCode: trimmedCode,
        classId: classId || activeClass?.id || '',
        gender,
        birthDate,
        status,
        avatarUrl: avatarUrl.trim() || undefined,
        studentPhone: studentPhone.trim(),
        studentAddress: studentAddress.trim(),
        studyGroup,
        conduct,
        parents: updatedParents,
        parentName: parentName.trim(),
        parentRelationship,
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        parentAddress: parentAddress.trim(),
        parentJob: parentJob.trim(),
        parentAppStatus,
        note: note.trim()
      };

      if (initialData) {
        updateStudent(initialData.id, studentPayload);
      } else {
        createStudent(studentPayload);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070d1e]/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/60">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>{initialData ? `Sửa thông tin học sinh & Phụ huynh` : `Thêm học sinh mới`}</span>
            </h3>
            {initialData && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {initialData.fullName} (Mã HS: {initialData.studentCode} · Lớp {activeClass?.name})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#142244] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Tab Segmented Selector */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-cyan-500/20 flex items-center gap-2 bg-[#070d1e]/40">
          <button
            type="button"
            onClick={() => setActiveFormTab('student')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeFormTab === 'student'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-[#142244] text-slate-300 hover:bg-[#1a2d5a] border border-cyan-500/20'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin học sinh</span>
            {fullName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab('parent')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeFormTab === 'parent'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-[#142244] text-slate-300 hover:bg-[#1a2d5a] border border-cyan-500/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thông tin phụ huynh</span>
            {parentName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: THÔNG TIN HỌC SINH */}
          {activeFormTab === 'student' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Avatar Preview Card */}
              <div className="flex items-center gap-3.5 p-3 bg-[#070d1e] rounded-xl border border-cyan-500/20">
                <Avatar name={fullName || 'HS'} avatarUrl={avatarUrl} gender={gender} size="lg" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Ảnh đại diện học sinh (Tùy chọn URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... hoặc để trống để tạo tự động"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#0b1329] border border-cyan-500/30 rounded-lg text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Họ và tên học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn An / Trần Bảo Anh"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mã học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="HS-0801"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-cyan-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-medium"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StudentStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-medium"
                  >
                    <option value="active">Đang học</option>
                    <option value="inactive">Nghỉ / Chuyển trường</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lớp phân bổ
                  </label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tổ / Nhóm học tập
                  </label>
                  <input
                    type="text"
                    placeholder="Tổ 1"
                    value={studyGroup}
                    onChange={e => setStudyGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hạnh kiểm đầu vào
                  </label>
                  <select
                    value={conduct}
                    onChange={e => setConduct(e.target.value as ConductGrade)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-emerald-400 font-bold"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Chưa đạt">Chưa đạt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Địa chỉ thường trú học sinh
                </label>
                <input
                  type="text"
                  placeholder="Quận Ba Đình, TP. Hà Nội"
                  value={studentAddress}
                  onChange={e => setStudentAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                />
              </div>

              {/* Quick Prompt to switch to Parent tab */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                <span className="text-cyan-200 font-medium">
                  Cần cập nhật thông tin liên hệ Bố/Mẹ cho học sinh này?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('parent')}
                  className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Thông tin phụ huynh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: THÔNG TIN PHỤ HUYNH */}
          {activeFormTab === 'parent' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                Thông tin dùng để gửi tin nhắn thông báo, kết nối Sổ liên lạc điện tử và liên hệ khẩn cấp với gia đình.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Họ và tên Phụ huynh đại diện *
                  </label>
                  <input
                    type="text"
                    placeholder="Lê Thị Lan / Trần Văn Bình"
                    value={parentName}
                    onChange={e => handleParentNameChange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mối quan hệ
                  </label>
                  <select
                    value={parentRelationship}
                    onChange={e => setParentRelationship(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-bold"
                  >
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Ông/Bà">Ông / Bà</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    <span>Số điện thoại liên lạc *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span>Email nhận thông báo</span>
                  </label>
                  <input
                    type="email"
                    placeholder="phuhuynh@gmail.com"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-cyan-400" />
                    <span>Nghề nghiệp / Nơi công tác</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Kỹ sư, Bác sĩ, Kinh doanh..."
                    value={parentJob}
                    onChange={e => setParentJob(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trạng thái kết nối ứng dụng
                  </label>
                  <select
                    value={parentAppStatus}
                    onChange={e => setParentAppStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-emerald-400 font-semibold"
                  >
                    <option value="connected">● Đã kết nối ứng dụng SmartClass</option>
                    <option value="not_connected">○ Chưa cài đặt ứng dụng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Địa chỉ thường trú gia đình
                </label>
                <input
                  type="text"
                  placeholder="Số 45 phố Phan Đình Phùng, Ba Đình, Hà Nội"
                  value={parentAddress}
                  onChange={e => setParentAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú của giáo viên trao đổi với phụ huynh
                </label>
                <textarea
                  rows={2}
                  placeholder="Phụ huynh đồng ý cho con học thêm đội tuyển, nhờ cô nhắc nhở làm bài..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#070d1e] border border-cyan-500/30 rounded-xl text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between gap-3">
            {activeFormTab === 'student' ? (
              <button
                type="button"
                onClick={() => setActiveFormTab('parent')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Chuyển sang tab phụ huynh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveFormTab('student')}
                className="text-xs font-bold text-slate-300 hover:text-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại tab học sinh</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#142244] border border-cyan-500/20 rounded-xl hover:bg-[#1a2d5a] transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang lưu...' : initialData ? 'Lưu thay đổi' : 'Thêm học sinh'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
