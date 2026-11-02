export type UserRole = 'teacher' | 'student' | 'parent' | 'admin';
export type Role = UserRole;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  schoolName: string;
  subject?: string;
  academicYear?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  linkedClassId?: string;
  phone?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  subject: string;
  academicYear: string;
  role: Role;
  avatarUrl?: string;
}

export type GradeLevel = '6' | '7' | '8' | '9' | '10' | '11' | '12';

export interface Classroom {
  id: string;
  name: string;           // e.g., "8A1"
  grade: GradeLevel;      // e.g., "8"
  subject: string;        // e.g., "Toán học"
  academicYear: string;   // e.g., "2026-2027"
  room: string;           // e.g., "Phòng 204"
  teacherName: string;
  color: string;          // Hex or Tailwind color token
  description?: string;
  status: 'active' | 'archived';
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = 'active' | 'inactive' | 'suspended';
export type Gender = 'male' | 'female' | 'other';

export type ConductGrade = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface ParentInfo {
  id: string;
  relationship: 'Bố' | 'Mẹ' | 'Người giám hộ' | string;
  fullName: string;
  phone: string;
  email?: string;
  job?: string;
  address?: string;
  isPrimary?: boolean;
  note?: string;
}

export interface Student {
  id: string;
  studentCode: string;    // e.g., "HS-0801"
  fullName: string;
  gender: Gender;
  birthDate?: string;     // YYYY-MM-DD
  classId: string;
  status: StudentStatus;
  avatarUrl?: string;
  
  // Student contact & classroom assignment
  studentPhone?: string;
  studentAddress?: string;
  studyGroup?: string;    // e.g., "Tổ 1"
  conduct?: ConductGrade; // Hạnh kiểm

  // Structured list of parents/guardians for each student
  parents?: ParentInfo[];

  // Comprehensive Parent / Guardian details (legacy / primary sync)
  parentName?: string;
  parentRelationship?: string; // "Bố" | "Mẹ" | "Người giám hộ"
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
  parentJob?: string;
  parentAppStatus?: 'connected' | 'not_connected';

  note?: string;
  stars: number;          // Behavior / Reward stars
  demerits: number;       // Infractions
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;           // YYYY-MM-DD
  session: 'morning' | 'afternoon';
  status: AttendanceStatus;
  note?: string;
  recordedAt: string;
  recordedBy: string;
}

export type AssignmentStatus = 'draft' | 'assigned' | 'submitted' | 'graded' | 'overdue';

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  deadline: string;       // ISO string
  pointsMax: number;
  status: AssignmentStatus;
  createdAt: string;
}

export type QuestionLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
export type QuestionType =
  | '1 Đáp án'
  | 'Nhiều đáp án'
  | 'Đúng / Sai'
  | 'Ghép đôi'
  | 'Ghép nối'
  | 'Sắp xếp'
  | 'Điền khuyết'
  | 'Trả lời ngắn'
  | 'Tự luận'
  | 'Tự luận ngắn'
  | 'Đoạn văn / Tình huống';

export type QuestionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isCorrect: boolean; // true = Đúng, false = Sai
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  correctOrder: number;
}

export interface RubricCriterion {
  id: string;
  criterion: string;
  points: number;
  guidance: string;
}

export interface QuizQuestion {
  id: string;
  code?: string;
  question: string;
  options: string[]; // for 1 Đáp án / Nhiều đáp án
  correctIndex: number; // for 1 Đáp án
  correctIndices?: number[]; // for Nhiều đáp án (Multiple choice)
  trueFalseStatements?: TrueFalseStatement[]; // for Đúng / Sai (Cấu trúc đề mới)
  matchingPairs?: MatchingPair[]; // for Ghép đôi Cột A ↔ Cột B
  orderingItems?: OrderingItem[]; // for Sắp xếp thứ tự
  fillBlankAnswer?: string; // for Điền khuyết
  shortAnswerGuide?: string; // for Trả lời ngắn / Tự luận
  shortAnswerVariations?: string[]; // Các biến thể đáp án
  rubricCriteria?: RubricCriterion[]; // for Tự luận (Thang điểm chấm)
  passageText?: string; // for Theo đoạn văn / tình huống (Ngữ cảnh chung)
  subQuestions?: QuizQuestion[]; // Các câu con trong đoạn văn / tình huống
  explanation?: string;
  subject?: string;
  grade?: string;
  chapter?: string;
  lessonTopic?: string;
  level?: QuestionLevel;
  questionType?: QuestionType;
  status?: QuestionStatus;
  points?: number;
  tags?: string[];
  sourceDoc?: string; // e.g., 'Giáo án Bài 1 - Đại số 9'
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  classId: string;
  title: string;
  subject: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  classId: string;
  oral1?: number | null;     // Điểm miệng 1
  oral2?: number | null;     // Điểm miệng 2
  fifteenMin?: number | null;// 15 phút
  midterm?: number | null;   // Giữa kỳ (hệ số 2)
  finalExam?: number | null; // Cuối kỳ (hệ số 3)
  updatedAt: string;
}

export interface LuckyWheelHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  selectedAt: string;
  status: 'selected' | 'called' | 'kept';
}

export interface LuckyWheelSession {
  id: string;
  classId: string;
  originalStudentIds: string[];
  remainingStudentIds: string[];
  selectedStudentId: string | null;
  history: LuckyWheelHistoryItem[];
  status: 'active' | 'completed';
  spinDurationSeconds: number;
  soundEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'reward' | 'infraction';
  title: string;
  points: number;
  date: string;
  note?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  targetId: string;
  targetName: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface TimetablePeriod {
  id: string;
  periodNumber: number;
  name: string;        // "Tiết 1", "Tiết 2"...
  time: string;        // "07:00 - 07:45"
  schedule: Record<string, string>; // { "Thứ 2": "Toán học\nPhòng 204", "Thứ 3": "Vật lý"... }
}

export interface Timetable {
  classId: string;
  days: string[];      // ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
  periods: TimetablePeriod[];
  updatedAt: string;
}

export type UserPerspective = 'teacher' | 'parent' | 'school_admin' | 'education_dept';

export interface ActivityComment {
  id: string;
  authorName: string;
  role: 'parent' | 'teacher' | 'admin';
  studentName?: string;
  content: string;
  createdAt: string;
}

export interface ClassActivityPost {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  category: 'stem' | 'cultural' | 'sports' | 'outdoor' | 'academics' | 'ceremony';
  mediaType: 'images' | 'video';
  mediaUrls: string[];
  date: string;
  likesCount: number;
  userLiked?: boolean;
  comments: ActivityComment[];
  authorName: string;
  createdAt: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'schedule' | 'exam' | 'tuition' | 'event' | 'urgent' | 'health';
  targetClassId: string; // 'all' or specific classId
  targetClassName?: string;
  date: string;
  readCount: number;
  totalTargetCount: number;
  isUrgent?: boolean;
  author: string;
  authorRole: string;
  attachmentTitle?: string;
  createdAt: string;
}

