import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../services/firebase';
import { FirestoreSyncService } from '../services/firestoreSync';
import {
  Classroom,
  Student,
  ParentInfo,
  AttendanceRecord,
  GradeEntry,
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
  Quiz,
  StudentExamAttempt,
  BehaviorLog,
  TeacherProfile,
  AuditLog,
  Timetable,
  SchoolAnnouncement,
  ClassActivityPost,
  ActivityComment,
  AppUser,
  UserRole
} from '../types';
import { StorageService } from '../services/storage';
import { DEMO_USERS } from '../services/authPresets';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AppContextType {
  teacher: TeacherProfile;
  classes: Classroom[];
  activeClassId: string;
  activeClass: Classroom | undefined;
  students: Student[];
  classStudents: Student[];
  attendance: AttendanceRecord[];
  grades: GradeEntry[];
  assignments: Assignment[];
  quizzes: Quiz[];
  behaviorLogs: BehaviorLog[];
  auditLogs: AuditLog[];
  timetables: Record<string, Timetable>;
  currentTimetable: Timetable;
  announcements: SchoolAnnouncement[];
  activities: ClassActivityPost[];
  activeTab: string;
  projectorMode: boolean;
  toasts: ToastMessage[];

  // Navigation & UI controls
  setActiveClassId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setProjectorMode: (enabled: boolean) => void;
  toggleProjectorMode: () => void;
  showToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
  saveClassTimetable: (classId: string, timetable: Timetable) => void;
  resetClassTimetable: (classId: string) => void;

  // Actions
  createClass: (data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt' | 'studentCount'>) => Classroom;
  updateClass: (id: string, data: Partial<Classroom>) => void;
  deleteClass: (id: string) => void;
  duplicateClass: (id: string) => Classroom | null;

  createStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'stars' | 'demerits'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteMultipleStudents: (studentIds: string[]) => void;
  deleteAllStudentsInClass: (classId: string) => void;
  deleteAllStudents: () => void;
  deleteAllClasses: () => void;
  deleteParentInfo: (studentId: string) => void;
  addParentToStudent: (studentId: string, parentData: Omit<ParentInfo, 'id'>) => void;
  updateParentOfStudent: (studentId: string, parentId: string, data: Partial<ParentInfo>) => void;
  toggleParentRelationship: (studentId: string, parentId: string) => void;
  deleteParentOfStudent: (studentId: string, parentId: string) => void;
  deleteAllParentsInClass: (classId: string) => void;
  importStudentsList: (newStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'stars' | 'demerits'>[]) => number;

  saveAttendanceRecords: (records: AttendanceRecord[]) => void;
  markAllPresentToday: (classId: string, session?: 'morning' | 'afternoon') => void;

  updateGradeEntry: (entry: GradeEntry) => void;

  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string, submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => void;
  gradeAssignmentSubmission: (assignmentId: string, submissionId: string, score: number, feedback: string, status?: SubmissionStatus) => void;

  createQuiz: (data: Omit<Quiz, 'id' | 'createdAt'>) => Quiz;
  updateQuiz: (id: string, data: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  submitExamAttempt: (examId: string, attempt: Omit<StudentExamAttempt, 'id' | 'submittedAt'>) => void;

  addBehaviorRecord: (data: Omit<BehaviorLog, 'id' | 'date'>) => void;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;

  // Portal Actions
  createAnnouncement: (data: Omit<SchoolAnnouncement, 'id' | 'createdAt' | 'readCount'>) => SchoolAnnouncement;
  deleteAnnouncement: (id: string) => void;
  createActivity: (data: Omit<ClassActivityPost, 'id' | 'createdAt' | 'likesCount' | 'comments'>) => ClassActivityPost;
  deleteActivity: (id: string) => void;
  likeActivity: (id: string) => void;
  addActivityComment: (activityId: string, comment: Omit<ActivityComment, 'id' | 'createdAt'>) => void;
  deleteActivityComment: (activityId: string, commentId: string) => void;

  // Firebase & Cloud Sync
  firebaseUser: User | null;
  isFirebaseLoading: boolean;
  isCloudSyncing: boolean;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;

  // Role-Based Auth
  currentUser: AppUser | null;
  userRole: UserRole;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginAsRole: (role: UserRole) => void;
  loginWithCredentials: (email: string, pass: string) => { success: boolean; message?: string };
  registerUser: (data: Omit<AppUser, 'id'>, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (data: Partial<AppUser>) => void;

  refreshAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<TeacherProfile>(StorageService.getTeacher());
  const [classes, setClasses] = useState<Classroom[]>(StorageService.getClasses());
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(StorageService.getAttendance());
  const [grades, setGrades] = useState<GradeEntry[]>(StorageService.getGrades());
  const [assignments, setAssignments] = useState<Assignment[]>(StorageService.getAssignments());
  const [quizzes, setQuizzes] = useState<Quiz[]>(StorageService.getQuizzes());
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>(StorageService.getBehavior());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [timetables, setTimetables] = useState<Record<string, Timetable>>(StorageService.getTimetables());
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(StorageService.getAnnouncements());
  const [activities, setActivities] = useState<ClassActivityPost[]>(StorageService.getActivities());

  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Firebase Auth & Cloud Sync States
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Role-Based Current User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('smart-class:auth-user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Auto-open login modal if user has no saved session cache on first visit
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('smart-class:auth-user');
      return !saved;
    } catch {
      return true;
    }
  });
  const userRole = useMemo<UserRole>(() => currentUser?.role || 'teacher', [currentUser]);

  // Active Class State
  const [activeClassId, setActiveClassIdState] = useState<string>(() => {
    const saved = localStorage.getItem('smart-class:v1:active-class-id');
    const validClasses = StorageService.getClasses();
    if (saved && validClasses.some(c => c.id === saved)) return saved;
    return validClasses[0]?.id || '';
  });

  const setActiveClassId = (id: string) => {
    setActiveClassIdState(id);
    localStorage.setItem('smart-class:v1:active-class-id', id);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast System
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Compute active class & its students
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === activeClassId) || classes[0];
  }, [classes, activeClassId]);

  const classStudents = useMemo(() => {
    if (!activeClassId) return [];
    return students.filter(s => s.classId === activeClassId);
  }, [students, activeClassId]);

  // Update student counts in classes list
  useEffect(() => {
    setClasses(prev => prev.map(cls => ({
      ...cls,
      studentCount: students.filter(s => s.classId === cls.id && s.status === 'active').length
    })));
  }, [students]);

  // Timetable State
  const currentTimetable = useMemo(() => {
    const targetClassId = activeClassId || classes[0]?.id || 'default';
    if (timetables[targetClassId]) {
      return timetables[targetClassId];
    }
    return StorageService.getTimetableForClass(targetClassId, activeClass?.name);
  }, [activeClassId, classes, timetables, activeClass?.name]);

  const saveClassTimetable = useCallback((classId: string, updated: Timetable) => {
    StorageService.saveTimetable(classId, updated);
    setTimetables(prev => ({
      ...prev,
      [classId]: {
        ...updated,
        classId,
        updatedAt: new Date().toISOString()
      }
    }));
    StorageService.addAuditLog({
      action: 'UPDATE_TIMETABLE',
      module: 'TIMETABLE',
      targetId: classId,
      targetName: `Thời khóa biểu lớp ${activeClass?.name || classId}`,
      performedBy: teacher.name,
      details: `Đã cập nhật thời khóa biểu (${updated.periods.length} tiết, ${updated.days.length} ngày)`
    });
  }, [activeClass?.name, teacher.name]);

  const resetClassTimetable = useCallback((classId: string) => {
    const defaultT = StorageService.getTimetableForClass(classId, activeClass?.name);
    setTimetables(prev => ({ ...prev, [classId]: defaultT }));
  }, [activeClass?.name]);

  // Refresh helper
  const refreshAllData = useCallback(() => {
    setTeacher(StorageService.getTeacher());
    const clss = StorageService.getClasses();
    setClasses(clss);
    setStudents(StorageService.getStudents());
    setAttendance(StorageService.getAttendance());
    setGrades(StorageService.getGrades());
    setAssignments(StorageService.getAssignments());
    setQuizzes(StorageService.getQuizzes());
    setBehaviorLogs(StorageService.getBehavior());
    setAuditLogs(StorageService.getAuditLogs());
    setTimetables(StorageService.getTimetables());
    if (clss.length > 0 && (!activeClassId || !clss.some(c => c.id === activeClassId))) {
      setActiveClassId(clss[0].id);
    }
  }, [activeClassId]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginGoogle = useCallback(async () => {
    try {
      setIsFirebaseLoading(true);
      const user = await loginWithGoogle();
      if (user) {
        showToast(`Đăng nhập Google thành công: ${user.displayName || user.email}`, 'success');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Đăng nhập Google thất bại', 'error');
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [showToast]);

  const logoutGoogle = useCallback(async () => {
    try {
      await logoutUser();
      showToast('Đã đăng xuất khỏi tài khoản Google', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Đăng xuất thất bại', 'error');
    }
  }, [showToast]);

  const syncToCloud = useCallback(async () => {
    if (!firebaseUser) {
      showToast('Vui lòng đăng nhập Google để đồng bộ dữ liệu lên Firebase Firestore', 'warning');
      return;
    }
    setIsCloudSyncing(true);
    try {
      const res = await FirestoreSyncService.uploadAllToCloud({
        classes,
        students,
        attendance,
        grades,
        assignments,
        announcements,
        activities,
        teacher
      });
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi đồng bộ Cloud', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  }, [firebaseUser, classes, students, attendance, grades, assignments, announcements, activities, teacher, showToast]);

  const loadFromCloud = useCallback(async () => {
    if (!firebaseUser) {
      showToast('Vui lòng đăng nhập Google để tải dữ liệu từ Firebase Firestore', 'warning');
      return;
    }
    setIsCloudSyncing(true);
    try {
      const cloudData = await FirestoreSyncService.fetchCloudData();
      if (cloudData.classes && cloudData.classes.length > 0) {
        setClasses(cloudData.classes);
        StorageService.saveClasses(cloudData.classes);
      }
      if (cloudData.students && cloudData.students.length > 0) {
        setStudents(cloudData.students);
        StorageService.saveStudents(cloudData.students);
      }
      if (cloudData.attendance && cloudData.attendance.length > 0) {
        setAttendance(cloudData.attendance);
        StorageService.saveAttendance(cloudData.attendance);
      }
      if (cloudData.grades && cloudData.grades.length > 0) {
        setGrades(cloudData.grades);
        StorageService.saveGrades(cloudData.grades);
      }
      if (cloudData.assignments && cloudData.assignments.length > 0) {
        setAssignments(cloudData.assignments);
        StorageService.saveAssignments(cloudData.assignments);
      }
      showToast('Đã tải và cập nhật dữ liệu mới nhất từ Firebase Firestore!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu từ Firebase', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  }, [firebaseUser, showToast]);

  // Role-Based Auth Actions
  const loginAsRole = useCallback((role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('smart-class:auth-user', JSON.stringify(user));
    if (user.linkedClassId) {
      setActiveClassId(user.linkedClassId);
    }
    showToast(`Đã đăng nhập với vai trò: ${role === 'teacher' ? 'Giáo viên' : role === 'student' ? 'Học sinh' : role === 'parent' ? 'Phụ huynh' : 'Ban Giám Hiệu'} (${user.name})`, 'success');
  }, [showToast]);

  const loginWithCredentials = useCallback((email: string, pass: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail) {
      return { success: false, message: 'Vui lòng nhập địa chỉ Email đăng nhập.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Vui lòng nhập Mật khẩu.' };
    }

    // 1. Check demo users (Mật khẩu chuẩn là 123456)
    const matchedRole = (Object.keys(DEMO_USERS) as UserRole[]).find(
      r => DEMO_USERS[r].email.toLowerCase() === cleanEmail
    );
    if (matchedRole) {
      if (cleanPass !== '123456') {
        return {
          success: false,
          message: 'Mật khẩu không chính xác! (Mật khẩu tài khoản mẫu là: 123456).'
        };
      }
      loginAsRole(matchedRole);
      return { success: true };
    }

    // 2. Check registered users in localStorage
    try {
      const raw = localStorage.getItem('smart-class:registered-users');
      if (raw) {
        const users: (AppUser & { pass: string })[] = JSON.parse(raw);
        const userExists = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (userExists) {
          if (userExists.pass !== cleanPass) {
            return {
              success: false,
              message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại mật khẩu bạn đã đăng ký.'
            };
          }
          const { pass: _, ...safeUser } = userExists;
          setCurrentUser(safeUser);
          localStorage.setItem('smart-class:auth-user', JSON.stringify(safeUser));
          if (safeUser.linkedClassId) {
            setActiveClassId(safeUser.linkedClassId);
          }
          showToast(`Đăng nhập thành công! Chào mừng ${safeUser.name}`, 'success');
          return { success: true };
        }
      }
    } catch {
      // ignore
    }

    // 3. Neither demo user nor registered user -> Strictly reject
    return {
      success: false,
      message: 'Tài khoản chưa tồn tại trong hệ thống! Vui lòng bấm sang tab "Đăng ký mới" để tạo tài khoản trước khi đăng nhập.'
    };
  }, [loginAsRole, showToast]);

  const registerUser = useCallback((data: Omit<AppUser, 'id'>, pass: string): { success: boolean; message?: string } => {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, message: 'Địa chỉ Email không hợp lệ.' };
      }
      if (!pass || pass.length < 6) {
        return { success: false, message: 'Mật khẩu cần tối thiểu 6 ký tự.' };
      }

      const raw = localStorage.getItem('smart-class:registered-users');
      const users: (AppUser & { pass: string })[] = raw ? JSON.parse(raw) : [];

      const existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
      let newUser: AppUser;

      if (existingIdx !== -1) {
        // If email already exists, update info and password smoothly
        newUser = {
          ...users[existingIdx],
          ...data,
          email: cleanEmail
        };
        users[existingIdx] = { ...newUser, pass };
        localStorage.setItem('smart-class:registered-users', JSON.stringify(users));
        showToast(`Tài khoản đã tồn tại - Đã cập nhật mật khẩu và tự động đăng nhập cho ${newUser.name}!`, 'success');
      } else {
        newUser = {
          ...data,
          email: cleanEmail,
          id: `user-${Date.now()}`
        };
        users.push({ ...newUser, pass });
        localStorage.setItem('smart-class:registered-users', JSON.stringify(users));
        showToast(`Đăng ký tài khoản thành công! Chào mừng ${newUser.name}`, 'success');
      }

      // Auto login newly registered user
      setCurrentUser(newUser);
      localStorage.setItem('smart-class:auth-user', JSON.stringify(newUser));

      // Sync teacher profile if registering as teacher
      if (newUser.role === 'teacher') {
        setTeacher(prev => {
          const updated: TeacherProfile = {
            ...prev,
            name: newUser.name,
            email: newUser.email,
            subject: newUser.subject || prev.subject
          };
          StorageService.saveTeacher(updated);
          return updated;
        });
      }

      if (newUser.linkedClassId) {
        setActiveClassId(newUser.linkedClassId);
      }
      return { success: true };
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      return { success: false, message: 'Không thể lưu tài khoản lúc này. Vui lòng thử lại.' };
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('smart-class:auth-user');
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
    setIsAuthModalOpen(true);
  }, [showToast]);

  const switchRole = useCallback((role: UserRole) => {
    loginAsRole(role);
  }, [loginAsRole]);

  const updateCurrentUserProfile = useCallback((data: Partial<AppUser>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('smart-class:auth-user', JSON.stringify(updated));
      return updated;
    });
    showToast('Đã cập nhật hồ sơ cá nhân', 'success');
  }, [showToast]);

  // Keyboard shortcut: ESC exits Projector Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && projectorMode) {
        setProjectorMode(false);
        showToast('Đã thoát chế độ máy chiếu', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectorMode, showToast]);

  // Class Management Actions
  const createClass = (data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt' | 'studentCount'>): Classroom => {
    const newClass: Classroom = {
      ...data,
      id: `class-${Date.now()}`,
      studentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newClass, ...classes];
    setClasses(updated);
    StorageService.saveClasses(updated);
    setActiveClassId(newClass.id);

    StorageService.addAuditLog({
      action: 'CREATE_CLASS',
      module: 'CLASSES',
      targetId: newClass.id,
      targetName: newClass.name,
      performedBy: teacher.name,
      details: `Đã tạo lớp học ${newClass.name} (${newClass.subject} - Khối ${newClass.grade})`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã tạo thành công lớp ${newClass.name}`, 'success');
    return newClass;
  };

  const updateClass = (id: string, data: Partial<Classroom>) => {
    const updated = classes.map(c => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c));
    setClasses(updated);
    StorageService.saveClasses(updated);

    const targetClass = classes.find(c => c.id === id);
    StorageService.addAuditLog({
      action: 'UPDATE_CLASS',
      module: 'CLASSES',
      targetId: id,
      targetName: targetClass?.name || id,
      performedBy: teacher.name,
      details: `Đã cập nhật thông tin lớp ${targetClass?.name}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('Đã lưu thay đổi thông tin lớp', 'success');
  };

  const deleteClass = (id: string) => {
    const targetClass = classes.find(c => c.id === id);
    if (!targetClass) return;

    const remainingClasses = classes.filter(c => c.id !== id);
    setClasses(remainingClasses);
    StorageService.saveClasses(remainingClasses);

    // Also remove or archive associated students
    const remainingStudents = students.filter(s => s.classId !== id);
    setStudents(remainingStudents);
    StorageService.saveStudents(remainingStudents);

    if (activeClassId === id && remainingClasses.length > 0) {
      setActiveClassId(remainingClasses[0].id);
    }

    StorageService.addAuditLog({
      action: 'DELETE_CLASS',
      module: 'CLASSES',
      targetId: id,
      targetName: targetClass.name,
      performedBy: teacher.name,
      details: `Đã xóa lớp học ${targetClass.name}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã xóa lớp ${targetClass.name}`, 'info');
  };

  const duplicateClass = (id: string): Classroom | null => {
    const target = classes.find(c => c.id === id);
    if (!target) return null;

    const newClass: Classroom = {
      ...target,
      id: `class-${Date.now()}`,
      name: `${target.name} (Bản sao)`,
      studentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newClass, ...classes];
    setClasses(updated);
    StorageService.saveClasses(updated);

    StorageService.addAuditLog({
      action: 'DUPLICATE_CLASS',
      module: 'CLASSES',
      targetId: newClass.id,
      targetName: newClass.name,
      performedBy: teacher.name,
      details: `Đã nhân bản từ lớp ${target.name}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã nhân bản thành công lớp ${newClass.name}`, 'success');
    return newClass;
  };

  // Student Actions
  const createStudent = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'stars' | 'demerits'>): Student => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stars: 0,
      demerits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    StorageService.saveStudents(updated);

    // Initialize grade entry for new student
    const newGrade: GradeEntry = {
      id: `grd-${newStudent.id}`,
      studentId: newStudent.id,
      classId: newStudent.classId,
      updatedAt: new Date().toISOString()
    };
    const updatedGrades = [...grades, newGrade];
    setGrades(updatedGrades);
    StorageService.saveGrades(updatedGrades);

    StorageService.addAuditLog({
      action: 'CREATE_STUDENT',
      module: 'STUDENTS',
      targetId: newStudent.id,
      targetName: newStudent.fullName,
      performedBy: teacher.name,
      details: `Đã thêm học sinh ${newStudent.fullName} (${newStudent.studentCode}) vào lớp`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã thêm học sinh ${newStudent.fullName}`, 'success');
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const updated = students.map(s => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
    setStudents(updated);
    StorageService.saveStudents(updated);

    const s = students.find(item => item.id === id);
    StorageService.addAuditLog({
      action: 'UPDATE_STUDENT',
      module: 'STUDENTS',
      targetId: id,
      targetName: s?.fullName || id,
      performedBy: teacher.name,
      details: `Đã cập nhật hồ sơ học sinh ${s?.fullName}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('Đã lưu thông tin học sinh', 'success');
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return;

    const remaining = students.filter(s => s.id !== id);
    setStudents(remaining);
    StorageService.saveStudents(remaining);

    // Clean up grades
    const remainingGrades = grades.filter(g => g.studentId !== id);
    setGrades(remainingGrades);
    StorageService.saveGrades(remainingGrades);

    StorageService.addAuditLog({
      action: 'DELETE_STUDENT',
      module: 'STUDENTS',
      targetId: id,
      targetName: target.fullName,
      performedBy: teacher.name,
      details: `Đã xóa học sinh ${target.fullName} khỏi danh sách`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã xóa học sinh ${target.fullName}`, 'info');
  };

  const deleteMultipleStudents = (studentIds: string[]) => {
    if (studentIds.length === 0) return;
    const idsSet = new Set(studentIds);
    const remaining = students.filter(s => !idsSet.has(s.id));
    setStudents(remaining);
    StorageService.saveStudents(remaining);

    const remainingGrades = grades.filter(g => !idsSet.has(g.studentId));
    setGrades(remainingGrades);
    StorageService.saveGrades(remainingGrades);

    StorageService.addAuditLog({
      action: 'DELETE_MULTIPLE_STUDENTS',
      module: 'STUDENTS',
      targetId: activeClassId,
      targetName: `${studentIds.length} học sinh`,
      performedBy: teacher.name,
      details: `Đã xóa hàng loạt ${studentIds.length} học sinh khỏi hệ thống`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã xóa thành công ${studentIds.length} học sinh đã chọn`, 'info');
  };

  const deleteAllStudentsInClass = (classId: string) => {
    const classTarget = classes.find(c => c.id === classId);
    const studentsInClass = students.filter(s => s.classId === classId);
    if (studentsInClass.length === 0) {
      showToast('Lớp học này hiện không có học sinh nào để xóa', 'info');
      return;
    }

    const remaining = students.filter(s => s.classId !== classId);
    setStudents(remaining);
    StorageService.saveStudents(remaining);

    const remainingGrades = grades.filter(g => g.classId !== classId);
    setGrades(remainingGrades);
    StorageService.saveGrades(remainingGrades);

    StorageService.addAuditLog({
      action: 'DELETE_ALL_STUDENTS_IN_CLASS',
      module: 'STUDENTS',
      targetId: classId,
      targetName: classTarget?.name || classId,
      performedBy: teacher.name,
      details: `Đã xóa toàn bộ ${studentsInClass.length} học sinh thuộc lớp ${classTarget?.name}`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã xóa toàn bộ ${studentsInClass.length} học sinh trong lớp ${classTarget?.name}`, 'warning');
  };

  const deleteAllStudents = () => {
    setStudents([]);
    StorageService.saveStudents([]);
    setGrades([]);
    StorageService.saveGrades([]);
    setClasses(prev => prev.map(c => ({ ...c, studentCount: 0 })));

    StorageService.addAuditLog({
      action: 'DELETE_ALL_STUDENTS',
      module: 'STUDENTS',
      targetId: 'all',
      targetName: 'Tất cả học sinh',
      performedBy: teacher.name,
      details: 'Đã xóa toàn bộ học sinh trong toàn bộ hệ thống'
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('Đã xóa tất cả học sinh trong hệ thống', 'warning');
  };

  const deleteAllClasses = () => {
    setClasses([]);
    StorageService.saveClasses([]);
    setStudents([]);
    StorageService.saveStudents([]);
    setGrades([]);
    StorageService.saveGrades([]);
    setActiveClassId('');

    StorageService.addAuditLog({
      action: 'DELETE_ALL_CLASSES',
      module: 'CLASSES',
      targetId: 'all',
      targetName: 'Tất cả các lớp',
      performedBy: teacher.name,
      details: 'Đã xóa toàn bộ các lớp học và dữ liệu liên quan'
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('Đã xóa toàn bộ các lớp học trong hệ thống', 'warning');
  };

  const deleteParentInfo = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          parents: [],
          parentName: '',
          parentRelationship: '',
          parentPhone: '',
          parentEmail: '',
          parentAddress: '',
          parentJob: '',
          parentAppStatus: 'not_connected' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast(`Đã xóa thông tin phụ huynh của em ${target.fullName}`, 'info');
  };

  const addParentToStudent = (studentId: string, parentData: Omit<ParentInfo, 'id'>) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const newParent: ParentInfo = {
      ...parentData,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };

    const currentParents = target.parents || [];
    const updatedParents = [...currentParents, newParent];

    // Primary parent sync
    const primaryParent = newParent.isPrimary || updatedParents.length === 1 ? newParent : (updatedParents.find(p => p.isPrimary) || updatedParents[0]);

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          parents: updatedParents,
          parentName: primaryParent.fullName,
          parentPhone: primaryParent.phone,
          parentRelationship: primaryParent.relationship,
          parentJob: primaryParent.job || '',
          parentEmail: primaryParent.email || '',
          parentAddress: primaryParent.address || s.studentAddress || '',
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast(`Đã thêm phụ huynh (${newParent.relationship}: ${newParent.fullName}) cho em ${target.fullName}`, 'success');
  };

  const updateParentOfStudent = (studentId: string, parentId: string, data: Partial<ParentInfo>) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const currentParents = target.parents || [];
    const updatedParents = currentParents.map(p => (p.id === parentId ? { ...p, ...data } : p));
    const primaryParent = updatedParents.find(p => p.isPrimary) || updatedParents[0];

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          parents: updatedParents,
          parentName: primaryParent ? primaryParent.fullName : '',
          parentPhone: primaryParent ? primaryParent.phone : '',
          parentRelationship: primaryParent ? primaryParent.relationship : '',
          parentJob: primaryParent?.job || '',
          parentEmail: primaryParent?.email || '',
          parentAddress: primaryParent?.address || s.studentAddress || '',
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast('Đã lưu thay đổi thông tin phụ huynh', 'success');
  };

  const toggleParentRelationship = (studentId: string, parentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const parent = (target.parents || []).find(p => p.id === parentId);
    if (!parent) return;

    const nextRel = parent.relationship === 'Bố' ? 'Mẹ' : parent.relationship === 'Mẹ' ? 'Bố' : 'Mẹ';
    updateParentOfStudent(studentId, parentId, { relationship: nextRel });
    showToast(`Đã đổi quan hệ của ${parent.fullName} thành "${nextRel}"`, 'info');
  };

  const deleteParentOfStudent = (studentId: string, parentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const currentParents = target.parents || [];
    const targetParent = currentParents.find(p => p.id === parentId);
    const updatedParents = currentParents.filter(p => p.id !== parentId);
    const primaryParent = updatedParents[0];

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          parents: updatedParents,
          parentName: primaryParent ? primaryParent.fullName : '',
          parentPhone: primaryParent ? primaryParent.phone : '',
          parentRelationship: primaryParent ? primaryParent.relationship : '',
          parentJob: primaryParent?.job || '',
          parentEmail: primaryParent?.email || '',
          parentAddress: primaryParent?.address || '',
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast(`Đã xóa phụ huynh ${targetParent?.fullName || ''} của em ${target.fullName}`, 'info');
  };

  const deleteAllParentsInClass = (classId: string) => {
    const classTarget = classes.find(c => c.id === classId);
    const updated = students.map(s => {
      if (s.classId === classId) {
        return {
          ...s,
          parents: [],
          parentName: '',
          parentPhone: '',
          parentRelationship: '',
          parentJob: '',
          parentEmail: '',
          parentAddress: '',
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast(`Đã xóa tất cả thông tin phụ huynh trong lớp ${classTarget?.name || ''}`, 'warning');
  };

  const importStudentsList = (newItems: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'stars' | 'demerits'>[]): number => {
    const timestamp = Date.now();
    const createdList: Student[] = newItems.map((item, index) => ({
      ...item,
      id: `std-${timestamp}-${index}`,
      stars: 0,
      demerits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const updated = [...students, ...createdList];
    setStudents(updated);
    StorageService.saveStudents(updated);

    // Create blank grade entries
    const newGrades: GradeEntry[] = createdList.map(s => ({
      id: `grd-${s.id}`,
      studentId: s.id,
      classId: s.classId,
      updatedAt: new Date().toISOString()
    }));
    const updatedGrades = [...grades, ...newGrades];
    setGrades(updatedGrades);
    StorageService.saveGrades(updatedGrades);

    StorageService.addAuditLog({
      action: 'IMPORT_STUDENTS',
      module: 'STUDENTS',
      targetId: activeClassId,
      targetName: activeClass?.name || 'Lớp',
      performedBy: teacher.name,
      details: `Đã nhập khẩu thành công ${createdList.length} học sinh từ tệp`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã nhập thành công ${createdList.length} học sinh`, 'success');
    return createdList.length;
  };

  // Attendance Actions
  const saveAttendanceRecords = (records: AttendanceRecord[]) => {
    // Merge or replace records with same classId + date + session + studentId
    const existing = [...attendance];
    records.forEach(newRec => {
      const idx = existing.findIndex(
        r => r.classId === newRec.classId && r.studentId === newRec.studentId && r.date === newRec.date && r.session === newRec.session
      );
      if (idx >= 0) {
        existing[idx] = newRec;
      } else {
        existing.push(newRec);
      }
    });

    setAttendance(existing);
    StorageService.saveAttendance(existing);

    StorageService.addAuditLog({
      action: 'SAVE_ATTENDANCE',
      module: 'ATTENDANCE',
      targetId: records[0]?.classId || activeClassId,
      targetName: activeClass?.name || 'Lớp',
      performedBy: teacher.name,
      details: `Đã lưu điểm danh ngày ${records[0]?.date || 'hôm nay'} (${records.length} học sinh)`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast('Đã lưu điểm danh thành công', 'success');
  };

  const markAllPresentToday = (classId: string, session: 'morning' | 'afternoon' = 'morning') => {
    const today = new Date().toISOString().split('T')[0];
    const targetStudents = students.filter(s => s.classId === classId && s.status === 'active');
    const records: AttendanceRecord[] = targetStudents.map(s => ({
      id: `att-${Date.now()}-${s.id}`,
      classId,
      studentId: s.id,
      date: today,
      session,
      status: 'present',
      recordedAt: new Date().toISOString(),
      recordedBy: teacher.name
    }));

    saveAttendanceRecords(records);
    showToast(`Đã điểm danh tất cả ${targetStudents.length} học sinh có mặt`, 'success');
  };

  // Grade Actions
  const updateGradeEntry = (entry: GradeEntry) => {
    const existing = [...grades];
    const idx = existing.findIndex(g => g.studentId === entry.studentId && g.classId === entry.classId);
    if (idx >= 0) {
      existing[idx] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      existing.push({ ...entry, updatedAt: new Date().toISOString() });
    }
    setGrades(existing);
    StorageService.saveGrades(existing);

    const student = students.find(s => s.id === entry.studentId);
    StorageService.addAuditLog({
      action: 'UPDATE_GRADE',
      module: 'GRADES',
      targetId: entry.studentId,
      targetName: student?.fullName || 'Học sinh',
      performedBy: teacher.name,
      details: `Đã cập nhật điểm số cho học sinh ${student?.fullName}`
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Assignments
  const createAssignment = (data: Omit<Assignment, 'id' | 'createdAt'>): Assignment => {
    const newAsg: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    StorageService.saveAssignments(updated);

    StorageService.addAuditLog({
      action: 'CREATE_ASSIGNMENT',
      module: 'ASSIGNMENTS',
      targetId: newAsg.id,
      targetName: newAsg.title,
      performedBy: teacher.name,
      details: `Đã giao bài tập mới: "${newAsg.title}"`
    });
    setAuditLogs(StorageService.getAuditLogs());
    showToast(`Đã tạo bài tập "${newAsg.title}"`, 'success');
    return newAsg;
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    const updated = assignments.map(a => (a.id === id ? { ...a, ...data } : a));
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast('Đã lưu bài tập', 'success');
  };

  const deleteAssignment = (id: string) => {
    const target = assignments.find(a => a.id === id);
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast(`Đã xóa bài tập "${target?.title || ''}"`, 'info');
  };

  const submitAssignment = (assignmentId: string, submissionData: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => {
    const updated = assignments.map(a => {
      if (a.id !== assignmentId) return a;
      const currentSubs = a.submissions || [];
      const existingIdx = currentSubs.findIndex(s => s.studentId === submissionData.studentId);
      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        const existing = currentSubs[existingIdx];
        const updatedSub: AssignmentSubmission = {
          ...existing,
          ...submissionData,
          submittedAt: now,
          status: 'submitted',
          revisionCount: (existing.revisionCount || 0) + 1
        };
        const nextSubs = [...currentSubs];
        nextSubs[existingIdx] = updatedSub;
        return { ...a, submissions: nextSubs };
      } else {
        const newSub: AssignmentSubmission = {
          ...submissionData,
          id: `sub-${Date.now()}`,
          submittedAt: now,
          status: submissionData.status || 'submitted',
          revisionCount: 0
        };
        return { ...a, submissions: [...currentSubs, newSub] };
      }
    });

    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast('Đã nộp bài tập thành công!', 'success');
  };

  const gradeAssignmentSubmission = (
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback: string,
    status: SubmissionStatus = 'graded'
  ) => {
    const updated = assignments.map(a => {
      if (a.id !== assignmentId) return a;
      const nextSubs = (a.submissions || []).map(s => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          score,
          teacherFeedback: feedback,
          status,
          gradedAt: new Date().toISOString(),
          gradedBy: teacher.name
        };
      });
      return { ...a, submissions: nextSubs };
    });

    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast(status === 'revision_required' ? 'Đã yêu cầu học sinh làm lại bài' : 'Đã chấm điểm và trả bài thành công!', 'success');
  };

  // Quizzes
  const createQuiz = (data: Omit<Quiz, 'id' | 'createdAt'>): Quiz => {
    const newQuiz: Quiz = {
      ...data,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    StorageService.saveQuizzes(updated);
    showToast(`Đã tạo đề trắc nghiệm "${newQuiz.title}"`, 'success');
    return newQuiz;
  };

  const updateQuiz = (id: string, data: Partial<Quiz>) => {
    const updated = quizzes.map(q => (q.id === id ? { ...q, ...data } : q));
    setQuizzes(updated);
    StorageService.saveQuizzes(updated);
  };

  const deleteQuiz = (id: string) => {
    const target = quizzes.find(q => q.id === id);
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    StorageService.saveQuizzes(updated);
    showToast(`Đã xóa đề "${target?.title || ''}"`, 'info');
  };

  const submitExamAttempt = (examId: string, attemptData: Omit<StudentExamAttempt, 'id' | 'submittedAt'>) => {
    const updated = quizzes.map(q => {
      if (q.id !== examId) return q;
      const attempts = q.attempts || [];
      const newAttempt: StudentExamAttempt = {
        ...attemptData,
        id: `att-${Date.now()}`,
        submittedAt: new Date().toISOString()
      };
      return { ...q, attempts: [...attempts, newAttempt] };
    });

    setQuizzes(updated);
    StorageService.saveQuizzes(updated);
    showToast('Đã nộp bài thi thành công!', 'success');
  };

  // Behavior
  const addBehaviorRecord = (data: Omit<BehaviorLog, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: BehaviorLog = {
      ...data,
      id: `beh-${Date.now()}`,
      date: today
    };
    const updated = [newLog, ...behaviorLogs];
    setBehaviorLogs(updated);
    StorageService.saveBehavior(updated);

    // Update student's stars / demerits
    setStudents(prev => prev.map(s => {
      if (s.id !== data.studentId) return s;
      if (data.type === 'reward') {
        return { ...s, stars: s.stars + data.points };
      } else {
        return { ...s, demerits: s.demerits + data.points };
      }
    }));

    showToast(data.type === 'reward' ? `Đã cộng ${data.points} sao cho ${data.studentName}` : `Đã ghi nhận nhắc nhở cho ${data.studentName}`, data.type === 'reward' ? 'success' : 'warning');
  };

  const updateTeacherProfile = (profile: Partial<TeacherProfile>) => {
    const updated = { ...teacher, ...profile };
    setTeacher(updated);
    StorageService.saveTeacher(updated);
    showToast('Đã lưu hồ sơ giáo viên', 'success');
  };

  const toggleProjectorMode = () => {
    setProjectorMode(prev => {
      const next = !prev;
      showToast(next ? 'Đã bật chế độ máy chiếu (Chiếu màn hình lớp)' : 'Đã tắt chế độ máy chiếu', 'info');
      return next;
    });
  };

  // Portal Actions
  const createAnnouncement = (data: Omit<SchoolAnnouncement, 'id' | 'createdAt' | 'readCount'>): SchoolAnnouncement => {
    const newAnn: SchoolAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      readCount: 1,
      createdAt: new Date().toISOString()
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    showToast(`Đã đăng thông báo: "${newAnn.title}"`, 'success');
    return newAnn;
  };

  const deleteAnnouncement = (id: string) => {
    const target = announcements.find(a => a.id === id);
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    StorageService.saveAnnouncements(updated);
    showToast(`Đã xóa thông báo "${target?.title || ''}"`, 'info');
  };

  const createActivity = (data: Omit<ClassActivityPost, 'id' | 'createdAt' | 'likesCount' | 'comments'>): ClassActivityPost => {
    const newAct: ClassActivityPost = {
      ...data,
      id: `act-${Date.now()}`,
      likesCount: 1,
      userLiked: true,
      comments: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    StorageService.saveActivities(updated);
    showToast(`Đã chia sẻ hoạt động lớp: "${newAct.title}"`, 'success');
    return newAct;
  };

  const deleteActivity = (id: string) => {
    const target = activities.find(a => a.id === id);
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    StorageService.saveActivities(updated);
    showToast(`Đã xóa hoạt động "${target?.title || ''}"`, 'info');
  };

  const likeActivity = (id: string) => {
    const updated = activities.map(act => {
      if (act.id !== id) return act;
      const isLiked = !act.userLiked;
      return {
        ...act,
        userLiked: isLiked,
        likesCount: isLiked ? act.likesCount + 1 : Math.max(0, act.likesCount - 1)
      };
    });
    setActivities(updated);
    StorageService.saveActivities(updated);
  };

  const addActivityComment = (activityId: string, comment: Omit<ActivityComment, 'id' | 'createdAt'>) => {
    const newComment: ActivityComment = {
      ...comment,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = activities.map(act => {
      if (act.id !== activityId) return act;
      return {
        ...act,
        comments: [...act.comments, newComment]
      };
    });
    setActivities(updated);
    StorageService.saveActivities(updated);
    showToast('Đã gửi phản hồi / bình luận của bạn!', 'success');
  };

  const deleteActivityComment = (activityId: string, commentId: string) => {
    const updated = activities.map(act => {
      if (act.id !== activityId) return act;
      return {
        ...act,
        comments: act.comments.filter(c => c.id !== commentId)
      };
    });
    setActivities(updated);
    StorageService.saveActivities(updated);
    showToast('Đã xóa bình luận', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        teacher,
        classes,
        activeClassId,
        activeClass,
        students,
        classStudents,
        attendance,
        grades,
        assignments,
        quizzes,
        behaviorLogs,
        auditLogs,
        timetables,
        currentTimetable,
        announcements,
        activities,
        activeTab,
        projectorMode,
        toasts,
        setActiveClassId,
        setActiveTab,
        setProjectorMode,
        toggleProjectorMode,
        showToast,
        removeToast,
        saveClassTimetable,
        resetClassTimetable,
        createClass,
        updateClass,
        deleteClass,
        duplicateClass,
        createStudent,
        updateStudent,
        deleteStudent,
        deleteMultipleStudents,
        deleteAllStudentsInClass,
        deleteAllStudents,
        deleteAllClasses,
        deleteParentInfo,
        addParentToStudent,
        updateParentOfStudent,
        toggleParentRelationship,
        deleteParentOfStudent,
        deleteAllParentsInClass,
        importStudentsList,
        saveAttendanceRecords,
        markAllPresentToday,
        updateGradeEntry,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        gradeAssignmentSubmission,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        submitExamAttempt,
        addBehaviorRecord,
        updateTeacherProfile,
        createAnnouncement,
        deleteAnnouncement,
        createActivity,
        deleteActivity,
        likeActivity,
        addActivityComment,
        deleteActivityComment,
        firebaseUser,
        isFirebaseLoading,
        isCloudSyncing,
        loginGoogle,
        logoutGoogle,
        syncToCloud,
        loadFromCloud,
        currentUser,
        userRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginAsRole,
        loginWithCredentials,
        registerUser,
        logout,
        switchRole,
        updateCurrentUserProfile,
        refreshAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
