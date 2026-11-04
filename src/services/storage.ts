import {
  Classroom,
  Student,
  AttendanceRecord,
  GradeEntry,
  Assignment,
  Quiz,
  BehaviorLog,
  TeacherProfile,
  LuckyWheelSession,
  AuditLog,
  Timetable,
  SchoolAnnouncement,
  ClassActivityPost,
  AppUser
} from '../types';
import {
  DEFAULT_TEACHER,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_BEHAVIOR_LOGS,
  INITIAL_TIMETABLES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES
} from './seedData';

const PREFIX = 'smart-class:v1:';

const KEYS = {
  TEACHER: `${PREFIX}teacher`,
  CLASSES: `${PREFIX}classes`,
  STUDENTS: `${PREFIX}students`,
  ATTENDANCE: `${PREFIX}attendance`,
  GRADES: `${PREFIX}grades`,
  ASSIGNMENTS: `${PREFIX}assignments`,
  QUIZZES: `${PREFIX}quizzes`,
  BEHAVIOR: `${PREFIX}behavior`,
  LUCKY_WHEEL: `${PREFIX}lucky-wheel`,
  AUDIT: `${PREFIX}audit`,
  SETTINGS: `${PREFIX}settings`,
  TIMETABLES: `${PREFIX}timetables`,
  ANNOUNCEMENTS: `${PREFIX}announcements`,
  ACTIVITIES: `${PREFIX}activities`
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving to localStorage key ${key}:`, err);
    }
  }

  // Teacher Profile
  public static getTeacher(): TeacherProfile {
    const teacher = this.getItem<TeacherProfile>(KEYS.TEACHER, DEFAULT_TEACHER);
    if (
      teacher.name !== 'Cô Nguyễn Thị Mai' ||
      teacher.schoolName !== 'Trường THCS Nguyễn Lương Bằng' ||
      teacher.academicYear !== '2025 - 2026'
    ) {
      const updatedTeacher: TeacherProfile = {
        ...teacher,
        name: 'Cô Nguyễn Thị Mai',
        schoolName: 'Trường THCS Nguyễn Lương Bằng',
        academicYear: '2025 - 2026'
      };
      this.setItem(KEYS.TEACHER, updatedTeacher);
      return updatedTeacher;
    }
    return teacher;
  }

  public static saveTeacher(teacher: TeacherProfile): void {
    this.setItem(KEYS.TEACHER, teacher);
  }

  // Classes
  public static getClasses(): Classroom[] {
    const classes = this.getItem<Classroom[]>(KEYS.CLASSES, []);
    if (!classes || classes.length === 0 || !classes.some(c => c.name === '6A1')) {
      // Merge or initialize with latest classes including 6A1
      const merged = [...INITIAL_CLASSES];
      classes.forEach(c => {
        if (!merged.some(m => m.id === c.id)) {
          merged.push(c);
        }
      });
      this.setItem(KEYS.CLASSES, merged);
      return merged;
    }
    return classes;
  }

  public static saveClasses(classes: Classroom[]): void {
    this.setItem(KEYS.CLASSES, classes);
  }

  // Announcements for Portal
  public static getAnnouncements(): SchoolAnnouncement[] {
    const list = this.getItem<SchoolAnnouncement[]>(KEYS.ANNOUNCEMENTS, []);
    if (!list || list.length === 0) {
      this.setItem(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    return list;
  }

  public static saveAnnouncements(announcements: SchoolAnnouncement[]): void {
    this.setItem(KEYS.ANNOUNCEMENTS, announcements);
  }

  // Activities for Portal (Memorable photos, videos, events)
  public static getActivities(): ClassActivityPost[] {
    const list = this.getItem<ClassActivityPost[]>(KEYS.ACTIVITIES, []);
    if (!list || list.length === 0) {
      this.setItem(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
      return INITIAL_ACTIVITIES;
    }
    return list;
  }

  public static saveActivities(activities: ClassActivityPost[]): void {
    this.setItem(KEYS.ACTIVITIES, activities);
  }

  // Students
  public static getStudents(): Student[] {
    const rawStudents = this.getItem<Student[]>(KEYS.STUDENTS, []);
    const has7A3 = rawStudents && rawStudents.some(s => s.classId === 'class-7a3');
    let sourceList = rawStudents;
    if (!rawStudents || rawStudents.length === 0) {
      sourceList = INITIAL_STUDENTS;
    } else if (!has7A3) {
      const extra = INITIAL_STUDENTS.filter(s => !rawStudents.some(r => r.id === s.id));
      sourceList = [...rawStudents, ...extra];
    }

    // Normalize parents array for each student and auto-correct inverted parental relationships
    const normalized = sourceList.map(student => {
      let parents = student.parents || [];
      if (parents.length === 0 && (student.parentName || student.parentPhone)) {
        const pName = (student.parentName || '').trim();
        const isLikelyMother = /thị|lan|mai|hoa|hương|hằng|ngọc|trang|hiền|linh|dung|hạnh|bích|nga|thảo/i.test(pName);
        parents = [
          {
            id: `p-${student.id}-1`,
            relationship: student.parentRelationship || (isLikelyMother ? 'Mẹ' : 'Bố'),
            fullName: student.parentName || 'Chưa cập nhật',
            phone: student.parentPhone || '',
            email: student.parentEmail || '',
            job: student.parentJob || '',
            address: student.parentAddress || student.studentAddress || '',
            isPrimary: true
          }
        ];
      }

      // Auto-correct any inverted parental relationships (e.g. Lê Thị Lan as Bố, Trần Văn Bình as Mẹ)
      parents = parents.map(p => {
        const pName = (p.fullName || '').trim().toLowerCase();
        if ((pName.includes('lê thị lan') || pName.includes('thị lan') || pName.includes(' thị ')) && p.relationship === 'Bố') {
          return { ...p, relationship: 'Mẹ' };
        }
        if ((pName.includes('trần văn bình') || pName.includes('văn bình') || pName.includes(' văn ')) && p.relationship === 'Mẹ') {
          return { ...p, relationship: 'Bố' };
        }
        return p;
      });

      return {
        ...student,
        parents
      };
    });

    this.setItem(KEYS.STUDENTS, normalized);
    return normalized;
  }

  public static saveStudents(students: Student[]): void {
    this.setItem(KEYS.STUDENTS, students);
  }

  // Attendance
  public static getAttendance(): AttendanceRecord[] {
    const records = this.getItem<AttendanceRecord[]>(KEYS.ATTENDANCE, []);
    if (!records || records.length === 0) {
      this.setItem(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
      return INITIAL_ATTENDANCE;
    }
    return records;
  }

  public static saveAttendance(records: AttendanceRecord[]): void {
    this.setItem(KEYS.ATTENDANCE, records);
  }

  // Grades
  public static getGrades(): GradeEntry[] {
    const grades = this.getItem<GradeEntry[]>(KEYS.GRADES, []);
    if (!grades || grades.length === 0) {
      this.setItem(KEYS.GRADES, INITIAL_GRADES);
      return INITIAL_GRADES;
    }
    return grades;
  }

  public static saveGrades(grades: GradeEntry[]): void {
    this.setItem(KEYS.GRADES, grades);
  }

  // Assignments
  public static getAssignments(): Assignment[] {
    const assignments = this.getItem<Assignment[]>(KEYS.ASSIGNMENTS, []);
    if (!assignments || assignments.length === 0 || !assignments.some(a => a.id === 'asg-6a1-01')) {
      const merged = [...INITIAL_ASSIGNMENTS];
      if (assignments && assignments.length > 0) {
        assignments.forEach(a => {
          if (!merged.some(m => m.id === a.id)) {
            merged.push(a);
          }
        });
      }
      this.setItem(KEYS.ASSIGNMENTS, merged);
      return merged;
    }
    return assignments;
  }

  public static saveAssignments(assignments: Assignment[]): void {
    this.setItem(KEYS.ASSIGNMENTS, assignments);
  }

  // Quizzes
  public static getQuizzes(): Quiz[] {
    const quizzes = this.getItem<Quiz[]>(KEYS.QUIZZES, []);
    if (!quizzes || quizzes.length === 0 || (quizzes[0] && quizzes[0].questions.length < 12)) {
      this.setItem(KEYS.QUIZZES, INITIAL_QUIZZES);
      return INITIAL_QUIZZES;
    }
    return quizzes;
  }

  public static saveQuizzes(quizzes: Quiz[]): void {
    this.setItem(KEYS.QUIZZES, quizzes);
  }

  // Behavior
  public static getBehavior(): BehaviorLog[] {
    const logs = this.getItem<BehaviorLog[]>(KEYS.BEHAVIOR, []);
    if (!logs || logs.length === 0) {
      this.setItem(KEYS.BEHAVIOR, INITIAL_BEHAVIOR_LOGS);
      return INITIAL_BEHAVIOR_LOGS;
    }
    return logs;
  }

  public static saveBehavior(logs: BehaviorLog[]): void {
    this.setItem(KEYS.BEHAVIOR, logs);
  }

  // Lucky Wheel Sessions map (keyed by classId)
  public static getLuckyWheelSessions(): Record<string, LuckyWheelSession> {
    return this.getItem<Record<string, LuckyWheelSession>>(KEYS.LUCKY_WHEEL, {});
  }

  public static saveLuckyWheelSession(session: LuckyWheelSession): void {
    const current = this.getLuckyWheelSessions();
    current[session.classId] = session;
    this.setItem(KEYS.LUCKY_WHEEL, current);
  }

  // Timetables
  public static getTimetables(): Record<string, Timetable> {
    const data = this.getItem<Record<string, Timetable>>(KEYS.TIMETABLES, INITIAL_TIMETABLES);
    if (!data || Object.keys(data).length === 0) {
      this.setItem(KEYS.TIMETABLES, INITIAL_TIMETABLES);
      return INITIAL_TIMETABLES;
    }
    return data;
  }

  public static getTimetableForClass(classId: string, className?: string): Timetable {
    const all = this.getTimetables();
    if (all[classId]) {
      return all[classId];
    }
    // Generate default template if not found
    const defaultTemplate: Timetable = {
      classId,
      days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      updatedAt: new Date().toISOString(),
      periods: [
        { id: `p-${classId}-1`, periodNumber: 1, name: 'Tiết 1', time: '07:00 - 07:45', schedule: { 'Thứ 2': 'Toán học', 'Thứ 3': 'Ngữ văn', 'Thứ 4': 'Tiếng Anh', 'Thứ 5': 'Toán học', 'Thứ 6': 'Vật lý' } },
        { id: `p-${classId}-2`, periodNumber: 2, name: 'Tiết 2', time: '07:45 - 08:30', schedule: { 'Thứ 2': 'Toán học', 'Thứ 3': 'Toán học', 'Thứ 4': 'Vật lý', 'Thứ 5': 'Hóa học', 'Thứ 6': 'Sinh học' } },
        { id: `p-${classId}-3`, periodNumber: 3, name: 'Tiết 3', time: '08:30 - 09:15', schedule: { 'Thứ 2': 'Ngữ văn', 'Thứ 3': 'Lịch sử', 'Thứ 4': 'Toán học', 'Thứ 5': 'Tin học', 'Thứ 6': 'Địa lý' } },
        { id: `p-${classId}-4`, periodNumber: 4, name: 'Tiết 4', time: '09:15 - 10:00', schedule: { 'Thứ 2': 'Tiếng Anh', 'Thứ 3': 'GDCD', 'Thứ 4': 'Tiếng Anh', 'Thứ 5': 'Thể dục', 'Thứ 6': 'Mỹ thuật' } },
        { id: `p-${classId}-5`, periodNumber: 5, name: 'Tiết 5', time: '10:35 - 11:20', schedule: { 'Thứ 2': 'Vật lý', 'Thứ 3': 'Âm nhạc', 'Thứ 4': 'Công nghệ', 'Thứ 5': 'Toán học', 'Thứ 6': 'Sinh hoạt lớp' } },
        { id: `p-${classId}-6`, periodNumber: 6, name: 'Tiết 6', time: '11:25 - 12:10', schedule: { 'Thứ 2': '-trống-', 'Thứ 3': '-trống-', 'Thứ 4': '-trống-', 'Thứ 5': '-trống-', 'Thứ 6': '-trống-' } }
      ]
    };
    all[classId] = defaultTemplate;
    this.setItem(KEYS.TIMETABLES, all);
    return defaultTemplate;
  }

  public static saveTimetable(classId: string, timetable: Timetable): void {
    const all = this.getTimetables();
    all[classId] = {
      ...timetable,
      classId,
      updatedAt: new Date().toISOString()
    };
    this.setItem(KEYS.TIMETABLES, all);
  }

  // Audit Logs
  public static getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(KEYS.AUDIT, []);
  }

  public static addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 150 entries to conserve storage
    if (logs.length > 150) logs.pop();
    this.setItem(KEYS.AUDIT, logs);
  }

  public static exportDataAsJson(): string {
    return this.exportFullBackup();
  }

  public static importDataFromJson(jsonContent: string): boolean {
    return this.restoreFullBackup(jsonContent).success;
  }

  // Full System Export (JSON backup)
  public static exportFullBackup(): string {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      teacher: this.getTeacher(),
      classes: this.getClasses(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      grades: this.getGrades(),
      assignments: this.getAssignments(),
      quizzes: this.getQuizzes(),
      behavior: this.getBehavior(),
      luckyWheelSessions: this.getLuckyWheelSessions(),
      auditLogs: this.getAuditLogs(),
      timetables: this.getTimetables()
    };
    return JSON.stringify(backupData, null, 2);
  }

  // Full System Restore
  public static restoreFullBackup(jsonContent: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.classes || !Array.isArray(data.classes) || !data.students || !Array.isArray(data.students)) {
        return { success: false, message: 'Tệp sao lưu không đúng định dạng Smart Class.' };
      }
      if (data.teacher) this.setItem(KEYS.TEACHER, data.teacher);
      if (data.classes) this.setItem(KEYS.CLASSES, data.classes);
      if (data.students) this.setItem(KEYS.STUDENTS, data.students);
      if (data.attendance) this.setItem(KEYS.ATTENDANCE, data.attendance);
      if (data.grades) this.setItem(KEYS.GRADES, data.grades);
      if (data.assignments) this.setItem(KEYS.ASSIGNMENTS, data.assignments);
      if (data.quizzes) this.setItem(KEYS.QUIZZES, data.quizzes);
      if (data.behavior) this.setItem(KEYS.BEHAVIOR, data.behavior);
      if (data.luckyWheelSessions) this.setItem(KEYS.LUCKY_WHEEL, data.luckyWheelSessions);
      if (data.auditLogs) this.setItem(KEYS.AUDIT, data.auditLogs);
      if (data.timetables) this.setItem(KEYS.TIMETABLES, data.timetables);

      this.addAuditLog({
        action: 'RESTORE_BACKUP',
        module: 'SYSTEM',
        targetId: 'all',
        targetName: 'Hệ thống dữ liệu',
        performedBy: data.teacher?.name || 'Giáo viên',
        details: `Đã khôi phục thành công ${data.classes.length} lớp, ${data.students.length} học sinh`
      });

      return { success: true, message: 'Đã khôi phục toàn bộ dữ liệu thành công.' };
    } catch {
      return { success: false, message: 'Lỗi giải mã tệp tin JSON.' };
    }
  }

  // Reset to Factory Default Seed
  public static resetToDefault(): void {
    this.setItem(KEYS.TEACHER, DEFAULT_TEACHER);
    this.setItem(KEYS.CLASSES, INITIAL_CLASSES);
    this.setItem(KEYS.STUDENTS, INITIAL_STUDENTS);
    this.setItem(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    this.setItem(KEYS.GRADES, INITIAL_GRADES);
    this.setItem(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    this.setItem(KEYS.QUIZZES, INITIAL_QUIZZES);
    this.setItem(KEYS.BEHAVIOR, INITIAL_BEHAVIOR_LOGS);
    this.setItem(KEYS.LUCKY_WHEEL, {});
    this.setItem(KEYS.AUDIT, []);
    this.setItem(KEYS.TIMETABLES, INITIAL_TIMETABLES);
  }

  // Session & Auth Cache Management
  public static readonly AUTH_USER_KEY = 'smart-class:auth-user';
  public static readonly AUTH_HISTORY_KEY = 'smart-class:auth-history';

  public static getSessionUser(): AppUser | null {
    try {
      // Priority 1: Persistent cache (localStorage) for returning users who checked "Remember me"
      const persistent = localStorage.getItem(this.AUTH_USER_KEY);
      if (persistent) {
        return JSON.parse(persistent) as AppUser;
      }
      // Priority 2: Session cache (sessionStorage) for current browser tab
      const session = sessionStorage.getItem(this.AUTH_USER_KEY);
      if (session) {
        return JSON.parse(session) as AppUser;
      }
    } catch (e) {
      console.warn('Failed to parse cached session user:', e);
    }
    return null;
  }

  public static saveSessionUser(user: AppUser, rememberMe: boolean = true): void {
    try {
      const serialized = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem(this.AUTH_USER_KEY, serialized);
        sessionStorage.removeItem(this.AUTH_USER_KEY);
      } else {
        sessionStorage.setItem(this.AUTH_USER_KEY, serialized);
        localStorage.removeItem(this.AUTH_USER_KEY);
      }

      // Update login history (keep last 5 unique accounts)
      const history = this.getLoginHistory();
      const filtered = history.filter(h => h.email.toLowerCase() !== user.email.toLowerCase());
      filtered.unshift({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        schoolName: user.schoolName,
        subject: user.subject,
        studentName: user.studentName,
        studentCode: user.studentCode,
        linkedClassId: user.linkedClassId
      });
      localStorage.setItem(this.AUTH_HISTORY_KEY, JSON.stringify(filtered.slice(0, 5)));
    } catch (e) {
      console.error('Failed to save session user:', e);
    }
  }

  public static clearSessionUser(): void {
    try {
      localStorage.removeItem(this.AUTH_USER_KEY);
      sessionStorage.removeItem(this.AUTH_USER_KEY);
    } catch (e) {
      console.error('Failed to clear session user:', e);
    }
  }

  public static getLoginHistory(): AppUser[] {
    try {
      const raw = localStorage.getItem(this.AUTH_HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AppUser[];
    } catch {
      return [];
    }
  }

  public static removeLoginHistory(email: string): void {
    try {
      const history = this.getLoginHistory();
      const updated = history.filter(h => h.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(this.AUTH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove account from history:', e);
    }
  }
}
