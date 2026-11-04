import {
  Classroom,
  Student,
  AttendanceRecord,
  GradeEntry,
  Assignment,
  Quiz,
  BehaviorLog,
  TeacherProfile,
  Timetable,
  SchoolAnnouncement,
  ClassActivityPost,
  ParentInfo
} from '../types';

export const DEFAULT_TEACHER: TeacherProfile = {
  id: 'teacher-01',
  name: 'Cô Nguyễn Thị Mai',
  email: 'nguyenthimai@thcsnguyenluongbang.edu.vn',
  schoolName: 'Trường THCS Nguyễn Lương Bằng',
  subject: 'Toán học',
  academicYear: '2025 - 2026',
  role: 'teacher'
};

export const INITIAL_CLASSES: Classroom[] = [
  {
    id: 'class-6a1',
    name: '6A1',
    grade: '6',
    subject: 'Toán học',
    academicYear: '2025 - 2026',
    room: 'Phòng A.306',
    teacherName: 'Cô Nguyễn Thị Mai',
    color: '#06b6d4', // Cyan
    description: 'Lớp 6A1 trọng điểm - Nề nếp kỷ luật tốt, chăm ngoan và học tập tốt',
    status: 'active',
    studentCount: 31,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  },
  {
    id: 'class-i7',
    name: 'i7',
    grade: '10',
    subject: 'Toán chuyên sâu',
    academicYear: '2025 - 2026',
    room: 'Phòng A.306',
    teacherName: 'Cô Nguyễn Thị Mai',
    color: '#2563eb', // Blue
    description: 'Lớp i7 chuyên sâu Toán - Năng nổ, phát biểu nhiệt tình',
    status: 'active',
    studentCount: 31,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  },
  {
    id: 'class-toandaicuong',
    name: 'Toán đại cương',
    grade: '10',
    subject: 'Toán đại cương',
    academicYear: '2025 - 2026',
    room: 'Phòng A.306',
    teacherName: 'Cô Nguyễn Thị Mai',
    color: '#ef4444', // Red
    description: 'Lớp Toán đại cương chuẩn THCS & THPT - Cần tăng cường luyện tập',
    status: 'active',
    studentCount: 31,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  },
  {
    id: 'class-kaiwa',
    name: 'kaiwa',
    grade: '10',
    subject: 'Ngoại ngữ & Toán',
    academicYear: '2025 - 2026',
    room: 'Phòng A.302',
    teacherName: 'Cô Nguyễn Thị Mai',
    color: '#10b981', // Emerald
    description: 'Lớp kaiwa tăng cường giao tiếp và tư duy logic',
    status: 'active',
    studentCount: 31,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  },
  {
    id: 'class-10a2',
    name: '10A2',
    grade: '10',
    subject: 'Toán học',
    academicYear: '2025 - 2026',
    room: 'Phòng A.304',
    teacherName: 'Thầy Lê Hoàng Long',
    color: '#8b5cf6', // Purple
    description: 'Lớp 10A2 tự nhiên - Hoạt động nghiên cứu sôi nổi',
    status: 'active',
    studentCount: 34,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  },
  {
    id: 'class-7a3',
    name: '7A3',
    grade: '7',
    subject: 'Toán học',
    academicYear: '2025 - 2026',
    room: 'Phòng 204',
    teacherName: 'Cô Nguyễn Thị Mai',
    color: '#f59e0b', // Amber
    description: 'Lớp 7A3 trọng điểm - Phong trào sôi nổi, chăm ngoan',
    status: 'active',
    studentCount: 31,
    createdAt: '2026-08-15T07:00:00.000Z',
    updatedAt: '2026-09-01T07:00:00.000Z'
  }
];

// Helper to create 20 students per class with realistic Vietnamese details and parents
function generateClassStudents(classId: string, classCode: string, startCodeNum: number, gradeYear: number): Student[] {
  const firstNamesMale = [
    'An', 'Bách', 'Cường', 'Dũng', 'Đăng', 'Huy', 'Khánh', 'Long', 'Minh', 'Nghĩa',
    'Phong', 'Quân', 'Sơn', 'Thắng', 'Tú', 'Việt', 'Vũ', 'Đức', 'Hoàng', 'Tùng'
  ];
  const firstNamesFemale = [
    'Ánh', 'Bảo Anh', 'Châu', 'Dung', 'Hà', 'Hằng', 'Linh', 'Nga', 'Nhi', 'Như',
    'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Vy', 'Yến', 'Mai', 'Ngọc', 'Hương', 'Thu'
  ];
  const lastNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Phan', 'Trương', 'Bùi', 'Đặng',
    'Đỗ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn', 'Lâm', 'Mai', 'Trịnh', 'Lương'
  ];
  const middleMale = ['Văn', 'Quốc', 'Đức', 'Minh', 'Thành', 'Gia', 'Hải', 'Thế', 'Công', 'Hữu'];
  const middleFemale = ['Thị', 'Ngọc', 'Thùy', 'Phương', 'Khánh', 'Thu', 'Thanh', 'Mỹ', 'Diệu', 'Hoài'];

  const jobsFather = ['Kỹ sư xây dựng', 'Bác sĩ', 'Giáo viên', 'Kinh doanh tự do', 'Công chức nhà nước', 'Kỹ sư phần mềm', 'Quân nhân', 'Kiến trúc sư', 'Chuyên viên ngân hàng', 'Luật sư'];
  const jobsMother = ['Dược sĩ', 'Kế toán trưởng', 'Giáo viên', 'Bác sĩ nhi khoa', 'Nhân viên văn phòng', 'Chuyên viên nhân sự', 'Giảng viên', 'Biên tập viên', 'Chủ kinh doanh', 'Kiểm toán viên'];

  const students: Student[] = [];

  for (let i = 0; i < 20; i++) {
    const isMale = i % 2 === 0;
    const lastName = lastNames[i % lastNames.length];
    const middleName = isMale ? middleMale[i % middleMale.length] : middleFemale[i % middleFemale.length];
    const firstName = isMale ? firstNamesMale[Math.floor(i / 2)] : firstNamesFemale[Math.floor(i / 2)];
    const fullName = `${lastName} ${middleName} ${firstName}`;

    const numStr = String(startCodeNum + i).padStart(4, '0');
    const studentCode = `HS-${numStr}`;
    const birthMonth = String((i % 12) + 1).padStart(2, '0');
    const birthDay = String((i % 27) + 1).padStart(2, '0');
    const birthDate = `${gradeYear}-${birthMonth}-${birthDay}`;

    const groupNum = (i % 4) + 1;
    const studyGroup = `Tổ ${groupNum}`;
    const conduct = i === 12 ? 'Khá' : 'Tốt';

    // Father details
    const fatherName = `${lastName} ${middleMale[(i + 3) % middleMale.length]} ${firstNamesMale[(i + 5) % firstNamesMale.length]}`;
    const fatherPhone = `0912${String(345000 + startCodeNum + i).slice(-6)}`;
    const fatherJob = jobsFather[i % jobsFather.length];

    // Mother details
    const motherLast = lastNames[(i + 4) % lastNames.length];
    const motherName = `${motherLast} Thị ${firstNamesFemale[(i + 3) % firstNamesFemale.length]}`;
    const motherPhone = `0987${String(654000 + startCodeNum + i).slice(-6)}`;
    const motherJob = jobsMother[i % jobsMother.length];

    const address = `Số ${(i * 7) + 12}, Đường Nguyễn Lương Bằng, TP. Hà Nội`;

    const parents: ParentInfo[] = [
      {
        id: `p-${studentCode}-f`,
        relationship: 'Bố',
        fullName: fatherName,
        phone: fatherPhone,
        email: `phuhuynh.${studentCode.toLowerCase()}.bo@gmail.com`,
        job: fatherJob,
        address,
        isPrimary: true,
        note: 'Liên hệ chính khi có thông báo học tập'
      },
      {
        id: `p-${studentCode}-m`,
        relationship: 'Mẹ',
        fullName: motherName,
        phone: motherPhone,
        email: `phuhuynh.${studentCode.toLowerCase()}.me@gmail.com`,
        job: motherJob,
        address,
        isPrimary: false,
        note: 'Liên hệ khi cần phối hợp nề nếp & sức khỏe'
      }
    ];

    students.push({
      id: `std-${classCode.toLowerCase()}-${String(i + 1).padStart(2, '0')}`,
      studentCode,
      fullName,
      gender: isMale ? 'male' : 'female',
      birthDate,
      classId,
      status: 'active',
      studentPhone: `039${String(111000 + startCodeNum + i).slice(-6)}`,
      studentAddress: address,
      studyGroup,
      conduct,
      parents,
      parentName: fatherName,
      parentRelationship: 'Bố',
      parentPhone: fatherPhone,
      parentEmail: parents[0].email,
      parentAddress: address,
      parentJob: fatherJob,
      parentAppStatus: 'connected',
      note: i === 0 ? 'Lớp trưởng gương mẫu, học đều các môn' : i === 1 ? 'Lớp phó học tập, nhiệt tình hỗ trợ bạn bè' : 'Chăm ngoan, phát biểu xây dựng bài tích cực',
      stars: Math.floor(Math.random() * 15) + 5,
      demerits: i === 12 ? 1 : 0,
      createdAt: '2026-08-20T08:00:00.000Z',
      updatedAt: '2026-09-10T08:00:00.000Z'
    });
  }

  return students;
}

export const INITIAL_STUDENTS: Student[] = [
  // 7A3: 20 students (Birth year: 2013)
  ...generateClassStudents('class-7a3', '7A3', 701, 2013),
  // 8A1: 20 students (Birth year: 2012)
  ...generateClassStudents('class-8a1', '8A1', 801, 2012),
  // 6A1: 20 students (Birth year: 2014)
  ...generateClassStudents('class-6a1', '6A1', 601, 2014),
  // 8A2: 20 students (Birth year: 2012)
  ...generateClassStudents('class-8a2', '8A2', 821, 2012),
  // 9A1: 20 students (Birth year: 2011)
  ...generateClassStudents('class-9a1', '9A1', 901, 2011),
  // 9A2: 20 students (Birth year: 2011)
  ...generateClassStudents('class-9a2', '9A2', 921, 2011)
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    classId: 'class-7a3',
    studentId: 'std-7a3-01',
    date: '2026-10-13',
    session: 'morning',
    status: 'present',
    recordedAt: '2026-10-13T07:15:00.000Z',
    recordedBy: 'Cô Trần Thị Mai Anh'
  },
  {
    id: 'att-02',
    classId: 'class-7a3',
    studentId: 'std-7a3-02',
    date: '2026-10-13',
    session: 'morning',
    status: 'present',
    recordedAt: '2026-10-13T07:15:00.000Z',
    recordedBy: 'Cô Trần Thị Mai Anh'
  },
  {
    id: 'att-03',
    classId: 'class-8a1',
    studentId: 'std-8a1-01',
    date: '2026-10-13',
    session: 'morning',
    status: 'present',
    recordedAt: '2026-10-13T07:15:00.000Z',
    recordedBy: 'Cô Trần Thị Mai Anh'
  }
];

export const INITIAL_GRADES: GradeEntry[] = [
  {
    id: 'gr-01',
    studentId: 'std-7a3-01',
    classId: 'class-7a3',
    oral1: 9,
    oral2: 10,
    fifteenMin: 9.5,
    midterm: 9,
    finalExam: 9.5,
    updatedAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'gr-02',
    studentId: 'std-7a3-02',
    classId: 'class-7a3',
    oral1: 10,
    oral2: 9,
    fifteenMin: 9.0,
    midterm: 8.5,
    finalExam: 9.0,
    updatedAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'gr-03',
    studentId: 'std-8a1-01',
    classId: 'class-8a1',
    oral1: 9,
    oral2: 8,
    fifteenMin: 8.5,
    midterm: 9,
    finalExam: 9,
    updatedAt: '2026-10-10T10:00:00.000Z'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-6a1-01',
    classId: 'class-6a1',
    title: 'Bài tập Số học 6: Phép cộng và nhân số tự nhiên - Tính chất giao hoán, kết hợp',
    description: 'Hoàn thành bài tập 1, 2, 3 trang 18 SGK Toán 6 Tập 1. Vận dụng tính chất kết hợp để tính nhanh các biểu thức. Học sinh có thể làm vào vở rồi chụp ảnh gửi lên hoặc nhập lời giải trực tiếp.',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    pointsMax: 10,
    subject: 'Toán học',
    status: 'assigned',
    targetType: 'all',
    attachments: [
      { name: 'Phieu_Bai_Tap_Toan_6_Tuan_6.pdf', size: '240 KB' },
      { name: 'Huong_Dan_Giai_Mau_Bai_1.docx', size: '115 KB' }
    ],
    submissions: [
      {
        id: 'sub-6a1-01',
        assignmentId: 'asg-6a1-01',
        studentId: 'std-6a1-01',
        studentName: 'Nguyễn Tuấn Anh',
        submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        content: 'Thưa cô, em đã hoàn thành 3 bài tập tính nhanh:\nBài 1: 135 + 360 + 65 + 40 = (135 + 65) + (360 + 40) = 200 + 400 = 600.\nBài 2: 25 * 37 * 4 = (25 * 4) * 37 = 100 * 37 = 3700.\nBài 3: 48 * 19 + 48 * 81 = 48 * (19 + 81) = 48 * 100 = 4800.',
        attachments: [{ name: 'Anh_chup_bai_lam_Tuan_Anh.png', size: '1.2 MB' }],
        status: 'graded',
        score: 10,
        teacherFeedback: 'Bài làm xuất sắc! Trình bày rất khoa học, biết nhóm số tròn trăm chính xác. Cô khen ngợi!',
        gradedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        gradedBy: 'Cô Nguyễn Thị Mai'
      },
      {
        id: 'sub-6a1-02',
        assignmentId: 'asg-6a1-01',
        studentId: 'std-6a1-02',
        studentName: 'Trần Minh Khang',
        submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        content: 'Em gửi cô bài làm số học tuần 6 ạ.',
        attachments: [{ name: 'Bai_lam_toan_Khang.pdf', size: '480 KB' }],
        status: 'submitted'
      },
      {
        id: 'sub-6a1-03',
        assignmentId: 'asg-6a1-01',
        studentId: 'std-6a1-03',
        studentName: 'Lê Hoàng Yến',
        submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        content: 'Thưa cô em nộp bài tập toán ạ.',
        status: 'revision_required',
        score: 6.5,
        teacherFeedback: 'Câu 3 em quên đặt thừa số chung 48 ra ngoài, tính cộng dồn dễ nhầm lẫn. Em sửa lại cách tính nhanh rồi nộp lại nhé!'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'asg-6a1-02',
    classId: 'class-6a1',
    title: 'Chuyên đề Hình học trực quan: Tam giác đều, Hình vuông, Lục giác đều',
    description: 'Vẽ và cắt dán các hình phẳng đã học. Nêu số cạnh, số góc và các đường chéo chính của lục giác đều. Nộp file ảnh chụp sản phẩm thực tế.',
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
    pointsMax: 10,
    subject: 'Toán học',
    status: 'assigned',
    targetType: 'all',
    attachments: [
      { name: 'Mau_Ve_Hinh_Hoc_Truc_Quan.pdf', size: '1.8 MB' }
    ],
    submissions: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'asg-01',
    classId: 'class-7a3',
    title: 'Bài tập Đại số: Biểu thức đại số & Đơn thức thu gọn',
    description: 'Hoàn thành các bài tập từ bài 1 đến bài 5 trang 32 SGK Toán 7 tập 2. Chụp ảnh bài làm gửi lên ứng dụng trước 22:00.',
    deadline: '2026-10-16T22:00:00.000Z',
    pointsMax: 10,
    subject: 'Toán học',
    status: 'assigned',
    createdAt: '2026-10-12T08:00:00.000Z'
  },
  {
    id: 'asg-02',
    classId: 'class-8a1',
    title: 'Chuyên đề Hình học 8: Định lý Talet và Tam giác đồng dạng',
    description: 'Vẽ hình chính xác, trình bày lời giải chi tiết cho 3 bài toán chứng minh song song và tỉ số đồng dạng.',
    deadline: '2026-10-18T22:00:00.000Z',
    pointsMax: 10,
    subject: 'Toán học',
    status: 'assigned',
    createdAt: '2026-10-12T08:00:00.000Z'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-bank-01',
    classId: 'class-7a3',
    title: 'Ngân hàng câu hỏi chuẩn kiến thức THCS',
    subject: 'Toán học',
    durationMinutes: 45,
    createdAt: '2026-10-14T08:00:00.000Z',
    questions: [
      {
        id: 'q-01',
        code: 'TOAN9-001',
        question: 'Điều kiện xác định của biểu thức √(3x - 9) là gì?',
        options: ['x ≥ 3', 'x > 3', 'x ≤ 3', 'x < 3'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Nhận biết',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Biểu thức căn thức bậc hai √(A) xác định khi và chỉ khi A ≥ 0. Ta có: 3x - 9 ≥ 0 ⇔ 3x ≥ 9 ⇔ x ≥ 3. Do đó chọn đáp án A.'
      },
      {
        id: 'q-02',
        code: 'TOAN9-002',
        question: 'Rút gọn biểu thức P = √(4 - 2√3) ta được kết quả là:',
        options: ['√3 - 1', '1 - √3', '√3 + 1', '2 - √3'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Ta có 4 - 2√3 = (√3)² - 2·√3·1 + 1² = (√3 - 1)². Do đó √(4 - 2√3) = |√3 - 1| = √3 - 1 (vì √3 > 1).'
      },
      {
        id: 'q-03',
        code: 'TOAN7-003',
        question: 'Số nào sau đây biểu diễn số hữu tỉ trong các số dưới đây?',
        options: ['-0,75', '√5', 'π', '0,1010010001...'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 7',
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: '-0,75 = -75/100 = -3/4 viết được dưới dạng phân số a/b với a, b nguyên, b ≠ 0 nên là số hữu tỉ.'
      },
      {
        id: 'q-04',
        code: 'TOAN8-004',
        question: 'Khai triển hằng đẳng thức (2x - 3y)² bằng:',
        options: ['4x² - 12xy + 9y²', '4x² - 6xy + 9y²', '4x² + 12xy + 9y²', '2x² - 12xy + 3y²'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 8',
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Áp dụng hằng đẳng thức bình phương của một hiệu: (A - B)² = A² - 2AB + B² = (2x)² - 2·(2x)·(3y) + (3y)² = 4x² - 12xy + 9y².'
      },
      {
        id: 'q-05',
        code: 'LY8-005',
        question: 'Một người đi xe đạp với vận tốc v = 12 km/h. Thời gian để người đó đi hết quãng đường 18 km là:',
        options: ['1 giờ 30 phút', '1 giờ 15 phút', '1 giờ 45 phút', '2 giờ'],
        correctIndex: 0,
        subject: 'Vật lý',
        grade: 'Khối 8',
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Công thức tính thời gian: t = s / v = 18 / 12 = 1,5 giờ = 1 giờ 30 phút.'
      },
      {
        id: 'q-06',
        code: 'ANH9-006',
        question: 'Choose the correct form: "If the weather _____ good tomorrow, we will go on a picnic."',
        options: ['is', 'will be', 'was', 'were'],
        correctIndex: 0,
        subject: 'Tiếng Anh',
        grade: 'Khối 9',
        level: 'Thông hiểu',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Câu điều kiện loại 1 (First Conditional): Mệnh đề If dùng thì hiện tại đơn (Present Simple: is), mệnh đề chính dùng will + V.'
      },
      {
        id: 'q-07',
        code: 'TOAN9-007',
        question: 'Cho hệ phương trình { 2x + y = 5; x - y = 1 }. Nghiệm (x; y) của hệ là:',
        options: ['(2; 1)', '(1; 2)', '(3; -1)', '(0; 5)'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Vận dụng',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Cộng hai vế phương trình: 3x = 6 ⇒ x = 2. Thay x = 2 vào x - y = 1 ta được 2 - y = 1 ⇒ y = 1. Nghiệm là (2; 1).'
      },
      {
        id: 'q-08',
        code: 'TOAN8-008',
        question: 'Phân tích đa thức thành nhân tử: x³ - 4x = 0 có các nghiệm là:',
        options: ['x = 0, x = 2, x = -2', 'x = 0, x = 4', 'x = 2, x = -2', 'x = 0, x = 2'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 8',
        level: 'Vận dụng',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Ta có: x(x² - 4) = 0 ⇔ x(x - 2)(x + 2) = 0 ⇔ x = 0 hoặc x = 2 hoặc x = -2.'
      },
      {
        id: 'q-09',
        code: 'HOA8-009',
        question: 'Đốt cháy hoàn toàn 2,4 gam magie (Mg) trong khí oxi thu được bao nhiêu gam magie oxit (MgO)? (Mg=24, O=16)',
        options: ['4,0 gam', '2,0 gam', '4,8 gam', '3,6 gam'],
        correctIndex: 0,
        subject: 'Hóa học',
        grade: 'Khối 8',
        level: 'Vận dụng',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Phương trình: 2Mg + O₂ → 2MgO. n(Mg) = 2,4 / 24 = 0,1 mol ⇒ n(MgO) = 0,1 mol ⇒ m(MgO) = 0,1 · 40 = 4,0 g.'
      },
      {
        id: 'q-10',
        code: 'TOAN9-010',
        question: 'Tìm giá trị nhỏ nhất của biểu thức A = x - 2√x + 5 với x ≥ 0.',
        options: ['4', '5', '3', '1'],
        correctIndex: 0,
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Vận dụng cao',
        questionType: '1 Đáp án',
        points: 1,
        explanation: 'Ta biến đổi: A = (√x)² - 2·√x·1 + 1 + 4 = (√x - 1)² + 4. Vì (√x - 1)² ≥ 0 với mọi x ≥ 0, nên A ≥ 4. Dấu "=" xảy ra khi √x = 1 ⇔ x = 1. Vậy Min A = 4.'
      },
      {
        id: 'q-11',
        code: 'TOAN9-011',
        question: 'Xét tính Đúng / Sai của các mệnh đề sau về căn thức bậc hai và biểu thức chứa căn (Theo định dạng đề thi mới Bộ GD&ĐT):',
        options: [],
        correctIndex: 0,
        questionType: 'Đúng / Sai',
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Thông hiểu',
        points: 2,
        trueFalseStatements: [
          { id: 'tf-1', statement: 'Căn bậc hai số học của 16 là 4 và -4', isCorrect: false },
          { id: 'tf-2', statement: 'Với mọi số thực a, ta luôn có √(a²) = |a|', isCorrect: true },
          { id: 'tf-3', statement: 'Biểu thức √(x - 5) có nghĩa khi và chỉ khi x ≥ 5', isCorrect: true },
          { id: 'tf-4', statement: 'Phương trình √x = -3 có nghiệm thực x = 9', isCorrect: false }
        ],
        explanation: 'a) Sai: Căn bậc hai số học của một số không âm luôn là số không âm, do đó căn bậc hai số học của 16 chỉ là 4.\nb) Đúng: Theo hằng đẳng thức căn bậc hai √(A²) = |A|.\nc) Đúng: Biểu thức dưới dấu căn không âm x - 5 ≥ 0 ⇔ x ≥ 5.\nd) Sai: Căn bậc hai số học luôn không âm, vế phải -3 < 0 nên vô nghiệm.'
      },
      {
        id: 'q-12',
        code: 'KHTN8-012',
        question: 'Trong các hiện tượng sau đây, những hiện tượng nào là hiện tượng hóa học? (Chọn tất cả các đáp án đúng)',
        options: [
          'A. Sắt để lâu ngày trong không khí ẩm bị gỉ sét thành oxit sắt',
          'B. Đun sôi nước, nước chuyển từ thể lỏng sang thể hơi',
          'C. Đốt cháy than (cacbon) sinh ra khí cacbonic và tỏa nhiều nhiệt',
          'D. Hòa tan muối ăn vào nước tạo thành dung dịch nước muối'
        ],
        correctIndex: 0,
        correctIndices: [0, 2],
        questionType: 'Nhiều đáp án',
        subject: 'Vật lý',
        grade: 'Khối 8',
        level: 'Thông hiểu',
        points: 1.5,
        explanation: 'Hiện tượng hóa học là hiện tượng có chất mới sinh ra. Ở A có sinh ra oxit sắt mới (gỉ sắt), ở C có sinh ra khí CO2 mới. Còn B và D chỉ là sự biến đổi vật lý về trạng thái và sự hòa tan.'
      },
      {
        id: 'q-13',
        code: 'TOAN9-013',
        question: 'Cho tam giác ABC vuông tại A, đường cao AH. Biết BH = 4 cm, CH = 9 cm. Độ dài đường cao AH bằng ... cm.',
        options: [],
        correctIndex: 0,
        fillBlankAnswer: '6',
        questionType: 'Điền khuyết',
        subject: 'Toán học',
        grade: 'Khối 9',
        level: 'Vận dụng',
        points: 1,
        explanation: 'Theo hệ thức lượng trong tam giác vuông: AH² = BH · CH = 4 · 9 = 36. Suy ra AH = √36 = 6 cm.'
      },
      {
        id: 'q-14',
        code: 'KHTN9-014',
        question: 'Hãy ghép nối mỗi đại lượng vật lý ở Cột A với đơn vị đo lường tương ứng ở Cột B:',
        options: [],
        correctIndex: 0,
        questionType: 'Ghép nối',
        subject: 'Vật lý',
        grade: 'Khối 9',
        level: 'Nhận biết',
        points: 1,
        matchingPairs: [
          { id: 'm-1', left: '1. Hiệu điện thế (U)', right: 'a. Vôn (V)' },
          { id: 'm-2', left: '2. Cường độ dòng điện (I)', right: 'b. Ampe (A)' },
          { id: 'm-3', left: '3. Điện trở (R)', right: 'c. Ôm (Ω)' },
          { id: 'm-4', left: '4. Công suất điện (P)', right: 'd. Oát (W)' }
        ],
        explanation: 'Cặp nối chính xác: 1 - a, 2 - b, 3 - c, 4 - d theo đúng định nghĩa đơn vị chuẩn SI trong chương trình Vật lý 9.'
      },
      {
        id: 'q-15',
        code: 'VAN9-015',
        question: 'Nêu ngắn gọn nội dung và giá trị nhân đạo chính trong đoạn trích "Kiều ở lầu Ngưng Bích" (Truyện Kiều - Nguyễn Du).',
        options: [],
        correctIndex: 0,
        shortAnswerGuide: '1. Tâm trạng cô đơn, buồn tủi, xót xa cho thân phận bẽ bàng của Thúy Kiều khi bị giam lỏng nơi lầu Ngưng Bích.\n2. Tấm lòng hiếu thảo hướng về cha mẹ (xót người tựa cửa hôm mai) và lòng thủy chung son sắt với Kim Trọng.\n3. Nghệ thuật tả cảnh ngụ tình đặc sắc bậc thầy của đại thi hào Nguyễn Du.',
        questionType: 'Tự luận ngắn',
        subject: 'Ngữ văn',
        grade: 'Khối 9',
        level: 'Vận dụng',
        points: 2,
        explanation: 'Đánh giá học sinh dựa trên 3 ý chính: Nỗi cô đơn thân phận (0.75đ), Tấm lòng vị tha hiếu thảo & chung thủy (0.75đ), Nghệ thuật tả cảnh ngụ tình (0.5đ).'
      }
    ]
  }
];

export const INITIAL_BEHAVIOR_LOGS: BehaviorLog[] = [
  {
    id: 'bh-01',
    studentId: 'std-7a3-01',
    studentName: 'Nguyễn Văn An',
    classId: 'class-7a3',
    type: 'reward',
    title: 'Giải nhanh bài toán hay trên bảng',
    points: 2,
    date: '2026-10-13',
    note: 'Có cách giải sáng tạo và trình bày mạch lạc'
  },
  {
    id: 'bh-02',
    studentId: 'std-7a3-02',
    studentName: 'Trần Thị Ánh',
    classId: 'class-7a3',
    type: 'reward',
    title: 'Đôi bạn cùng tiến giúp bạn yếu hiểu bài',
    points: 3,
    date: '2026-10-12',
    note: 'Nhiệt tình hướng dẫn bạn cùng bàn hoàn thành bài tập'
  }
];

export const INITIAL_TIMETABLES: Record<string, Timetable> = {
  'class-7a3': {
    classId: 'class-7a3',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    updatedAt: '2026-10-13T07:00:00.000Z',
    periods: [
      {
        id: 'p-7a3-1',
        periodNumber: 1,
        name: 'Tiết 1',
        time: '07:00 - 07:45',
        schedule: {
          'Thứ 2': 'Chào cờ\nSân trường',
          'Thứ 3': 'Toán học\nPhòng 204',
          'Thứ 4': 'Ngữ văn\nPhòng 204',
          'Thứ 5': 'Tiếng Anh\nPhòng 204',
          'Thứ 6': 'Toán học\nPhòng 204'
        }
      },
      {
        id: 'p-7a3-2',
        periodNumber: 2,
        name: 'Tiết 2',
        time: '07:45 - 08:30',
        schedule: {
          'Thứ 2': 'Toán học\nPhòng 204',
          'Thứ 3': 'Toán học\nPhòng 204',
          'Thứ 4': 'Vật lý (KHTN)\nPhòng 204',
          'Thứ 5': 'Hóa học (KHTN)\nPhòng 204',
          'Thứ 6': 'Sinh học (KHTN)\nPhòng 204'
        }
      },
      {
        id: 'p-7a3-3',
        periodNumber: 3,
        name: 'Tiết 3',
        time: '08:30 - 09:15',
        schedule: {
          'Thứ 2': 'Ngữ văn\nPhòng 204',
          'Thứ 3': 'Lịch sử & Địa lý\nPhòng 204',
          'Thứ 4': 'Toán học\nPhòng 204',
          'Thứ 5': 'Tin học\nPhòng Lab 1',
          'Thứ 6': 'Địa lý\nPhòng 204'
        }
      },
      {
        id: 'p-7a3-4',
        periodNumber: 4,
        name: 'Tiết 4',
        time: '09:15 - 10:00',
        schedule: {
          'Thứ 2': 'Tiếng Anh\nPhòng 204',
          'Thứ 3': 'GDCD\nPhòng 204',
          'Thứ 4': 'Tiếng Anh\nPhòng 204',
          'Thứ 5': 'Thể dục\nSân thể thao',
          'Thứ 6': 'Mỹ thuật\nPhòng đa năng'
        }
      },
      {
        id: 'p-7a3-5',
        periodNumber: 5,
        name: 'Tiết 5',
        time: '10:35 - 11:20',
        schedule: {
          'Thứ 2': 'Khoa học tự nhiên\nPhòng 204',
          'Thứ 3': 'Âm nhạc\nPhòng Âm nhạc',
          'Thứ 4': 'Công nghệ\nPhòng 204',
          'Thứ 5': 'Toán học\nPhòng 204',
          'Thứ 6': 'Sinh hoạt lớp\nPhòng 204'
        }
      },
      {
        id: 'p-7a3-6',
        periodNumber: 6,
        name: 'Tiết 6',
        time: '11:25 - 12:10',
        schedule: {
          'Thứ 2': '-trống-',
          'Thứ 3': 'Bồi dưỡng Toán 7\nPhòng 204',
          'Thứ 4': '-trống-',
          'Thứ 5': 'CLB STEM Robot\nLab 2',
          'Thứ 6': '-trống-'
        }
      },
      {
        id: 'p-7a3-7',
        periodNumber: 7,
        name: 'Tiết 7',
        time: '12:15 - 13:00',
        schedule: {
          'Thứ 2': '-trống-',
          'Thứ 3': '-trống-',
          'Thứ 4': '-trống-',
          'Thứ 5': '-trống-',
          'Thứ 6': '-trống-'
        }
      }
    ]
  },
  'class-8a1': {
    classId: 'class-8a1',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
    updatedAt: '2026-09-01T07:00:00.000Z',
    periods: [
      {
        id: 'p-8a1-1',
        periodNumber: 1,
        name: 'Tiết 1',
        time: '07:00 - 07:45',
        schedule: {
          'Thứ 2': 'Chào cờ\nSân trường',
          'Thứ 3': 'Toán học\nPhòng 205',
          'Thứ 4': 'Ngữ văn\nPhòng 205',
          'Thứ 5': 'Tiếng Anh\nPhòng 205',
          'Thứ 6': 'Toán học\nPhòng 205'
        }
      },
      {
        id: 'p-8a1-2',
        periodNumber: 2,
        name: 'Tiết 2',
        time: '07:45 - 08:30',
        schedule: {
          'Thứ 2': 'Toán học\nPhòng 205',
          'Thứ 3': 'Toán học\nPhòng 205',
          'Thứ 4': 'Vật lý\nPhòng 205',
          'Thứ 5': 'Hóa học\nPhòng 205',
          'Thứ 6': 'Sinh học\nPhòng 205'
        }
      },
      {
        id: 'p-8a1-3',
        periodNumber: 3,
        name: 'Tiết 3',
        time: '08:30 - 09:15',
        schedule: {
          'Thứ 2': 'Ngữ văn\nPhòng 205',
          'Thứ 3': 'Lịch sử\nPhòng 205',
          'Thứ 4': 'Toán học\nPhòng 205',
          'Thứ 5': 'Tin học\nPhòng Lab 1',
          'Thứ 6': 'Địa lý\nPhòng 205'
        }
      },
      {
        id: 'p-8a1-4',
        periodNumber: 4,
        name: 'Tiết 4',
        time: '09:15 - 10:00',
        schedule: {
          'Thứ 2': 'Tiếng Anh\nPhòng 205',
          'Thứ 3': 'GDCD\nPhòng 205',
          'Thứ 4': 'Tiếng Anh\nPhòng 205',
          'Thứ 5': 'Thể dục\nSân bóng',
          'Thứ 6': 'Mỹ thuật\nPhòng đa năng'
        }
      },
      {
        id: 'p-8a1-5',
        periodNumber: 5,
        name: 'Tiết 5',
        time: '10:35 - 11:20',
        schedule: {
          'Thứ 2': 'Vật lý\nPhòng 205',
          'Thứ 3': 'Âm nhạc\nPhòng Âm nhạc',
          'Thứ 4': 'Công nghệ\nPhòng 205',
          'Thứ 5': 'Toán học\nPhòng 205',
          'Thứ 6': 'Sinh hoạt lớp\nPhòng 205'
        }
      },
      {
        id: 'p-8a1-6',
        periodNumber: 6,
        name: 'Tiết 6',
        time: '11:25 - 12:10',
        schedule: {
          'Thứ 2': '-trống-',
          'Thứ 3': 'Bồi dưỡng Toán\nPhòng 205',
          'Thứ 4': '-trống-',
          'Thứ 5': 'CLB Khoa học\nLab 2',
          'Thứ 6': '-trống-'
        }
      },
      {
        id: 'p-8a1-7',
        periodNumber: 7,
        name: 'Tiết 7',
        time: '12:15 - 13:00',
        schedule: {
          'Thứ 2': '-trống-',
          'Thứ 3': '-trống-',
          'Thứ 4': '-trống-',
          'Thứ 5': '-trống-',
          'Thứ 6': '-trống-'
        }
      }
    ]
  }
};

// INITIAL ANNOUNCEMENTS FOR SCHOOL-FAMILY PORTAL
export const INITIAL_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Kế hoạch ôn tập & Lịch kiểm tra giữa học kỳ I năm học 2026 - 2027',
    content: 'Kính gửi quý phụ huynh và các em học sinh: Nhà trường thông báo lịch kiểm tra tập trung giữa học kỳ I diễn ra từ ngày 27/10 đến 31/10/2026. Đề nghị quý phụ huynh phối hợp đôn đốc học sinh ôn tập theo đề cương đã gửi trên ứng dụng.',
    category: 'exam',
    targetClassId: 'all',
    targetClassName: 'Toàn trường',
    date: '2026-10-13',
    readCount: 118,
    totalTargetCount: 120,
    isUrgent: true,
    author: 'Thầy Hiệu trưởng Lê Bá Quân',
    authorRole: 'Ban Giám Hiệu',
    attachmentTitle: 'De_cuong_on_tap_GHK1_2026_THCS_NguyenLuongBang.pdf',
    createdAt: '2026-10-13T08:00:00.000Z'
  },
  {
    id: 'ann-02',
    title: 'Thời khóa biểu học tập học kỳ I cập nhật chính thức',
    content: 'Ban Giám hiệu công bố Thời khóa biểu điều chỉnh nhằm tối ưu hóa các tiết học thực hành STEM và giáo dục thể chất. Thời khóa biểu mới có hiệu lực kể từ Thứ Hai tuần tới.',
    category: 'schedule',
    targetClassId: 'class-7a3',
    targetClassName: 'Lớp 7A3',
    date: '2026-10-12',
    readCount: 20,
    totalTargetCount: 20,
    isUrgent: false,
    author: 'Cô Trần Thị Mai Anh',
    authorRole: 'Giáo viên Chủ nhiệm',
    attachmentTitle: 'Thoi_khoa_bieu_Lop7A3_DieuChinh.xlsx',
    createdAt: '2026-10-12T09:30:00.000Z'
  },
  {
    id: 'ann-03',
    title: 'Phát động Hội thi Làm Báo Tường & Văn Nghệ chào mừng 20/11',
    content: 'Chào mừng kỷ niệm 44 năm Ngày Nhà giáo Việt Nam (20/11/1982 - 20/11/2026), Liên đội trường THCS Nguyễn Lương Bằng tổ chức chuỗi hoạt động tri ân thầy cô. Các chi đội nộp maket báo tường trước ngày 15/11.',
    category: 'event',
    targetClassId: 'all',
    targetClassName: 'Toàn trường',
    date: '2026-10-10',
    readCount: 112,
    totalTargetCount: 120,
    isUrgent: false,
    author: 'Tổng phụ trách Đội Nguyễn Tuấn',
    authorRole: 'Đoàn Đội',
    attachmentTitle: 'The_le_Hoi_thi_Bao_tuong_20_11.pdf',
    createdAt: '2026-10-10T14:00:00.000Z'
  },
  {
    id: 'ann-04',
    title: 'Khám sức khỏe tổng quát và khúc xạ học đường định kỳ',
    content: 'Trạm Y tế phối hợp với Bệnh viện Mắt Hà Nội tổ chức khám thị lực và kiểm tra sức khỏe thể chất miễn phí cho 100% học sinh các khối 6, 7, 8, 9 vào ngày 22/10/2026.',
    category: 'health',
    targetClassId: 'all',
    targetClassName: 'Toàn trường',
    date: '2026-10-08',
    readCount: 115,
    totalTargetCount: 120,
    isUrgent: false,
    author: 'Bộ phận Y tế Học đường',
    authorRole: 'Y tế trường học',
    createdAt: '2026-10-08T10:00:00.000Z'
  }
];

// INITIAL CLASSROOM MEMORABLE ACTIVITIES (Photos, Videos, Events)
export const INITIAL_ACTIVITIES: ClassActivityPost[] = [
  {
    id: 'act-01',
    classId: 'class-7a3',
    className: 'Lớp 7A3',
    title: 'Tiết học trải nghiệm STEM: Chế tạo mô hình Nhà thông minh & Pin năng lượng',
    description: 'Hôm nay các bạn học sinh Lớp 7A3 đã có một buổi học thực hành STEM vô cùng bùng nổ! Các tổ tự lên ý tưởng, thuyết trình mạch điện sinh học và vận hành thành công hệ thống cảm biến quang học. Ba mẹ cùng ngắm nhìn tinh thần hăng say của các con nhé!',
    category: 'stem',
    mediaType: 'images',
    mediaUrls: [
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
    ],
    date: '2026-10-12',
    likesCount: 28,
    userLiked: true,
    comments: [
      {
        id: 'c-01',
        authorName: 'Nguyễn Văn Hùng',
        role: 'parent',
        studentName: 'Nguyễn Văn An',
        content: 'Cảm ơn cô giáo đã tạo sân chơi bổ ích cho các con! An về nhà hào hứng khoe mô hình cả buổi tối.',
        createdAt: '2026-10-12T18:40:00.000Z'
      },
      {
        id: 'c-02',
        authorName: 'Trần Thị Bích',
        role: 'parent',
        studentName: 'Trần Thị Ánh',
        content: 'Các con giỏi quá! Hoạt động thực hành này giúp các cháu tiếp thu kiến thức rất tự nhiên.',
        createdAt: '2026-10-12T19:15:00.000Z'
      },
      {
        id: 'c-03',
        authorName: 'Cô Trần Thị Mai Anh',
        role: 'teacher',
        content: 'Cảm ơn sự đồng hành và động viên quý báu của quý phụ huynh. Các con lớp mình rất sáng tạo!',
        createdAt: '2026-10-12T20:00:00.000Z'
      }
    ],
    authorName: 'Cô Trần Thị Mai Anh (GVCN)',
    createdAt: '2026-10-12T16:30:00.000Z'
  },
  {
    id: 'act-02',
    classId: 'class-7a3',
    className: 'Lớp 7A3',
    title: 'Hội thi làm Báo Tường Tri Ân 20/11: Những nét vẽ đong đầy lòng biết ơn',
    description: 'Buổi chiều thứ Sáu rộn rã tiếng cười, các bạn khéo léo hoàn thành bài thơ, tranh vẽ gửi tặng thầy cô nhân ngày 20/11 sắp tới. Tác phẩm mang tên "Cánh Buồm Tri Thức" đã hoàn thành 90%!',
    category: 'cultural',
    mediaType: 'images',
    mediaUrls: [
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'
    ],
    date: '2026-10-10',
    likesCount: 35,
    userLiked: true,
    comments: [
      {
        id: 'c-04',
        authorName: 'Lê Văn Cường',
        role: 'parent',
        studentName: 'Lê Hoàng Bách',
        content: 'Nhìn các con đoàn kết, tự lập thế này ba mẹ ở nhà rất yên tâm và tự hào.',
        createdAt: '2026-10-10T17:30:00.000Z'
      }
    ],
    authorName: 'Cô Trần Thị Mai Anh (GVCN)',
    createdAt: '2026-10-10T16:00:00.000Z'
  },
  {
    id: 'act-03',
    classId: 'class-8a1',
    className: 'Lớp 8A1',
    title: 'Giải bóng đá Nam - Nữ cấp trường: Khởi động tưng bừng vòng bảng',
    description: 'Trận đấu mở màn giữa Chi đội 8A1 và 8A2 đã diễn ra đầy kịch tính với tinh thần thể thao cao thượng, fair-play. Xin chúc mừng các cầu thủ nhí của chúng ta!',
    category: 'sports',
    mediaType: 'images',
    mediaUrls: [
      'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80'
    ],
    date: '2026-10-08',
    likesCount: 22,
    userLiked: false,
    comments: [],
    authorName: 'Thầy Nguyễn Tuấn (Thể chất)',
    createdAt: '2026-10-08T17:00:00.000Z'
  }
];
