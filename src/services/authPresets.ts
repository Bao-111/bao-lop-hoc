import { AppUser, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, AppUser> = {
  teacher: {
    id: 'user-teacher-01',
    name: 'Cô Nguyễn Thị Mai',
    email: 'nguyenthimai@thcsnguyenluongbang.edu.vn',
    role: 'teacher',
    schoolName: 'Trường THCS Nguyễn Lương Bằng',
    subject: 'Toán học',
    academicYear: '2025 - 2026',
    linkedClassId: 'class-7a3',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'
  },
  student: {
    id: 'user-student-01',
    name: 'Nguyễn Tuấn Anh',
    email: 'tuananh.hs0701@thcsnguyenluongbang.edu.vn',
    role: 'student',
    schoolName: 'Trường THCS Nguyễn Lương Bằng',
    studentCode: 'HS-0701',
    studentId: 'std-7a3-01',
    linkedClassId: 'class-7a3',
    academicYear: '2025 - 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
  },
  parent: {
    id: 'user-parent-01',
    name: 'Trần Văn Kiên',
    email: 'trankiencmhs@gmail.com',
    role: 'parent',
    schoolName: 'Trường THCS Nguyễn Lương Bằng',
    studentName: 'Trần Hải Đăng',
    studentId: 'std-7a3-03',
    linkedClassId: 'class-7a3',
    phone: '0912 345 678',
    academicYear: '2025 - 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  },
  admin: {
    id: 'user-admin-01',
    name: 'Thầy Lê Văn Cường (Ban Giám Hiệu)',
    email: 'bgh@thcsnguyenluongbang.edu.vn',
    role: 'admin',
    schoolName: 'Trường THCS Nguyễn Lương Bằng',
    subject: 'Ban Giám Hiệu',
    academicYear: '2025 - 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
  }
};

export const ROLE_DETAILS: Record<UserRole, {
  label: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
}> = {
  teacher: {
    label: 'Giáo viên',
    badgeColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-500/40',
    description: 'Quản lý lớp học, điểm danh, nhập sổ điểm, giao bài tập, ngân hàng câu hỏi và công cụ dạy học.'
  },
  student: {
    label: 'Học sinh',
    badgeColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/40',
    description: 'Xem điểm số cá nhân, bài tập cần nộp, thời khóa biểu, chuyên cần và điểm sao thi đua ⭐.'
  },
  parent: {
    label: 'Phụ huynh',
    badgeColor: 'text-amber-300',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/40',
    description: 'Theo dõi kết quả học tập của con, chuyên cần hàng ngày, thông báo nhà trường và phản hồi GVCN.'
  },
  admin: {
    label: 'Ban Giám Hiệu',
    badgeColor: 'text-purple-300',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500/40',
    description: 'Quản trị toàn trường, phân công giảng dạy, thống kê phổ điểm tất cả các khối và cài đặt hệ thống.'
  }
};
