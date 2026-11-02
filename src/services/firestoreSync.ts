import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  Classroom,
  Student,
  AttendanceRecord,
  GradeEntry,
  Assignment,
  Quiz,
  SchoolAnnouncement,
  ClassActivityPost,
  TeacherProfile
} from '../types';

export interface CloudSyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export class FirestoreSyncService {
  /**
   * Check if current user is authenticated
   */
  public static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Save a single classroom to Firestore
   */
  public static async saveClassroom(cls: Classroom): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `classrooms/${cls.id}`;
    try {
      await setDoc(doc(db, 'classrooms', cls.id), {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        subject: cls.subject,
        academicYear: cls.academicYear,
        room: cls.room,
        teacherName: cls.teacherName,
        color: cls.color,
        description: cls.description || '',
        status: cls.status,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Delete classroom from Firestore
   */
  public static async deleteClassroom(id: string): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `classrooms/${id}`;
    try {
      await deleteDoc(doc(db, 'classrooms', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  /**
   * Save a student to Firestore
   */
  public static async saveStudent(st: Student): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `students/${st.id}`;
    try {
      await setDoc(doc(db, 'students', st.id), {
        id: st.id,
        studentCode: st.studentCode,
        fullName: st.fullName,
        gender: st.gender,
        birthDate: st.birthDate || '',
        classId: st.classId,
        status: st.status,
        avatarUrl: st.avatarUrl || '',
        studentPhone: st.studentPhone || '',
        studentAddress: st.studentAddress || '',
        studyGroup: st.studyGroup || '',
        conduct: st.conduct || 'Tốt',
        parentName: st.parentName || '',
        parentRelationship: st.parentRelationship || '',
        parentPhone: st.parentPhone || '',
        parentEmail: st.parentEmail || '',
        parentAddress: st.parentAddress || '',
        parentJob: st.parentJob || '',
        parentAppStatus: st.parentAppStatus || 'not_connected',
        note: st.note || '',
        stars: Number(st.stars) || 0,
        demerits: Number(st.demerits) || 0,
        createdAt: st.createdAt,
        updatedAt: st.updatedAt
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Delete student from Firestore
   */
  public static async deleteStudent(id: string): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `students/${id}`;
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  /**
   * Batch save attendance records
   */
  public static async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
    if (!this.isAuthenticated() || records.length === 0) return;
    const path = 'attendance';
    try {
      const batch = writeBatch(db);
      records.forEach(rec => {
        const ref = doc(db, 'attendance', rec.id);
        batch.set(ref, {
          id: rec.id,
          classId: rec.classId,
          studentId: rec.studentId,
          date: rec.date,
          session: rec.session,
          status: rec.status,
          note: rec.note || '',
          recordedAt: rec.recordedAt,
          recordedBy: rec.recordedBy
        });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Save a grade entry
   */
  public static async saveGrade(grade: GradeEntry): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `grades/${grade.id}`;
    try {
      await setDoc(doc(db, 'grades', grade.id), {
        id: grade.id,
        studentId: grade.studentId,
        classId: grade.classId,
        oral1: grade.oral1 ?? null,
        oral2: grade.oral2 ?? null,
        fifteenMin: grade.fifteenMin ?? null,
        midterm: grade.midterm ?? null,
        finalExam: grade.finalExam ?? null,
        updatedAt: grade.updatedAt
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Save assignment
   */
  public static async saveAssignment(asg: Assignment): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `assignments/${asg.id}`;
    try {
      await setDoc(doc(db, 'assignments', asg.id), {
        id: asg.id,
        classId: asg.classId,
        title: asg.title,
        description: asg.description,
        deadline: asg.deadline,
        pointsMax: asg.pointsMax,
        status: asg.status,
        createdAt: asg.createdAt
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Delete assignment
   */
  public static async deleteAssignment(id: string): Promise<void> {
    if (!this.isAuthenticated()) return;
    const path = `assignments/${id}`;
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  /**
   * Save Teacher Profile
   */
  public static async saveTeacherProfile(profile: TeacherProfile): Promise<void> {
    if (!this.isAuthenticated() || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `teachers/${uid}`;
    try {
      await setDoc(doc(db, 'teachers', uid), {
        id: uid,
        name: profile.name,
        email: profile.email,
        schoolName: profile.schoolName,
        subject: profile.subject,
        academicYear: profile.academicYear,
        role: profile.role,
        avatarUrl: profile.avatarUrl || ''
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Upload all local data to Firestore Cloud Database
   */
  public static async uploadAllToCloud(data: {
    classes: Classroom[];
    students: Student[];
    attendance: AttendanceRecord[];
    grades: GradeEntry[];
    assignments: Assignment[];
    announcements: SchoolAnnouncement[];
    activities: ClassActivityPost[];
    teacher: TeacherProfile;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, message: 'Vui lòng đăng nhập tài khoản Google để đồng bộ lên Cloud Firebase.' };
    }

    try {
      // 1. Sync Teacher
      await this.saveTeacherProfile(data.teacher);

      // 2. Sync Classes
      for (const cls of data.classes) {
        await this.saveClassroom(cls);
      }

      // 3. Sync Students (in chunks to avoid exceeding limits)
      for (const st of data.students) {
        await this.saveStudent(st);
      }

      // 4. Sync Attendance in batches of 200
      const attChunks: AttendanceRecord[][] = [];
      for (let i = 0; i < data.attendance.length; i += 200) {
        attChunks.push(data.attendance.slice(i, i + 200));
      }
      for (const chunk of attChunks) {
        await this.saveAttendanceBatch(chunk);
      }

      // 5. Sync Grades
      for (const gr of data.grades) {
        await this.saveGrade(gr);
      }

      // 6. Sync Assignments
      for (const asg of data.assignments) {
        await this.saveAssignment(asg);
      }

      return {
        success: true,
        message: `Đồng bộ thành công ${data.classes.length} lớp học, ${data.students.length} học sinh và toàn bộ dữ liệu lên Firebase Firestore!`
      };
    } catch (err) {
      console.error('Failed to sync all to cloud:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi khi đồng bộ lên Firebase.'
      };
    }
  }

  /**
   * Fetch all cloud data from Firestore
   */
  public static async fetchCloudData(): Promise<{
    classes?: Classroom[];
    students?: Student[];
    attendance?: AttendanceRecord[];
    grades?: GradeEntry[];
    assignments?: Assignment[];
  }> {
    if (!this.isAuthenticated()) return {};

    try {
      const [clsSnap, stdSnap, attSnap, grdSnap, asgSnap] = await Promise.all([
        getDocs(collection(db, 'classrooms')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'grades')),
        getDocs(collection(db, 'assignments'))
      ]);

      const classes = clsSnap.docs.map(d => d.data() as Classroom);
      const students = stdSnap.docs.map(d => d.data() as Student);
      const attendance = attSnap.docs.map(d => d.data() as AttendanceRecord);
      const grades = grdSnap.docs.map(d => d.data() as GradeEntry);
      const assignments = asgSnap.docs.map(d => d.data() as Assignment);

      return {
        classes: classes.length > 0 ? classes : undefined,
        students: students.length > 0 ? students : undefined,
        attendance: attendance.length > 0 ? attendance : undefined,
        grades: grades.length > 0 ? grades : undefined,
        assignments: assignments.length > 0 ? assignments : undefined
      };
    } catch (err) {
      console.error('Error fetching cloud data from Firestore:', err);
      return {};
    }
  }
}
