# 🚀 Smart Class / EduSmart - Hệ Sinh Thái Quản Lý Lớp Học Thông Minh Dành Cho Giáo Viên

**Smart Class / EduSmart** là nền tảng quản lý, giảng dạy và tương tác lớp học hiện đại, đáng tin cậy và tối ưu trải nghiệm dành cho giáo viên (Teacher-first UX). Hệ thống giúp giáo viên đứng lớp thao tác nhanh gọn trong 5–10 giây, giảm thiểu sai sót, an toàn dữ liệu và tối đa hóa thời gian tương tác với học sinh.

---

## 🏆 Product Principles & Triết Lý Sản Phẩm

```text
Ít click hơn → Ít lỗi hơn → Ít nhập dữ liệu hơn → An toàn dữ liệu tuyệt đối → Nhiều thời gian hơn cho học sinh
```

Mọi module tuân thủ thứ tự ưu tiên:
1. **ĐÚNG NGHIỆP VỤ**
2. **AN TOÀN DỮ LIỆU & PERSISTENCE**
3. **KHÔNG GÂY MẤT DỮ LIỆU (Tự động lưu, Backup & Restore JSON)**
4. **TEACHER-FIRST UX (1-click thao tác)**
5. **HIỆU NĂNG CAO & ACCESSIBILITY**

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. 🎡 Vòng Quay May Mắn (Lucky Wheel) - Tuyệt Đối Chuẩn Xác (Hard Invariant)
- **Ràng buộc ngữ cảnh lớp học**: Tự động liên kết danh sách học sinh của lớp đang chọn (ví dụ: 8A1), không cần nhập lại.
- **Fair Randomness Algorithm**: Chọn ngẫu nhiên `studentId` trước từ nhóm học sinh chờ quay, tính toán góc tâm phân đoạn (segment center angle) và góc quay mục tiêu chính xác đến từng độ.
- **Hard Invariant Guarantee**:
  $$\text{Kim chỉ vào ai} \equiv \text{Popup hiện người đó} \equiv \text{Lịch sử ghi người đó} \equiv \text{Xử lý đúng người đó}$$
- **Zero Auto-Remove**: Sau khi quay dừng, giáo viên là người quyết định: "Gọi học sinh này" (đưa ra khỏi lượt quay) hoặc "Giữ lại" (quay tiếp).
- **Âm thanh Web Audio**: Tích hợp bộ tổng hợp âm thanh Web Audio API (âm tick kim quay, tiếng fanfare chúc mừng) chạy độc lập, 100% không phụ thuộc file mp3 bên ngoài, không lo lỗi trình duyệt chặn mạng.
- **Lịch sử & Làm mới phiên**: Ghi nhận toàn bộ lượt quay trong phiên (`called`, `kept`, `selected`) và thông báo khi đã gọi hết học sinh.

### 2. 🏫 Quản Lý Lớp Học (Class Management)
- Tạo lớp với **Live Preview card** trực quan trước khi lưu.
- Bộ lọc kết hợp: Khối (6–12), Môn học, Năm học, Sắp xếp theo tên hoặc sĩ số.
- Thao tác an toàn: Mở lớp làm việc, Chỉnh sửa, Nhân bản lớp (Duplicate), Xóa an toàn với modal xác nhận hiển thị rõ tên lớp.

### 3. 👨‍🎓 Quản Lý Học Sinh & Quy Trình Nhập Khẩu Chuẩn (Import Workflow)
- Quản lý đầy đủ thông tin: Mã HS, Họ tên, Giới tính, Ngày sinh, SĐT Phụ huynh, Ghi chú, Điểm sao nề nếp.
- **Quy trình nhập khẩu từ Excel / CSV / Dán văn bản**:
  `Tải tệp/Dán text` → `Phân tích & Tự nhận diện cột` → `Ánh xạ cột (Mapping)` → `Kiểm tra dữ liệu (Validation: lọc trùng, chuẩn hóa khoảng trắng)` → `Xem trước tổng hợp (Hợp lệ vs Lỗi)` → `Giáo viên xác nhận` → `Lưu vào hệ thống`.
- Xuất danh sách học sinh ra file Excel `.xlsx` chuẩn hóa chỉ với 1 click.

### 4. 🕒 Sổ Điểm Danh Chuyên Cần (Attendance)
- Trạng thái chuẩn: **Có mặt**, **Vắng có phép**, **Vắng không phép**, **Đi trễ**, **Về sớm**.
- Phím tắt **"Tất cả có mặt"** giúp giáo viên hoàn tất điểm danh lớp 40 học sinh chỉ trong 1 giây.
- Ghi nhận lý do vắng/trễ; tự động tính tỷ lệ chuyên cần (%) và cảnh báo học sinh nghỉ nhiều (≥ 2–3 buổi).

### 5. 📊 Sổ Điểm Môn Học (Grade Spreadsheet)
- Các cột điểm chuẩn phổ thông: **Miệng 1**, **Miệng 2**, **15 Phút**, **Giữa kỳ (hệ số 2)**, **Cuối kỳ (hệ số 3)**.
- Tự động tính điểm trung bình (ĐTB) môn học và xếp loại học lực: Xuất sắc (≥ 9.0), Giỏi (≥ 8.0), Khá (≥ 6.5), Trung bình (≥ 5.0), Yếu (< 5.0).
- Nhập trực tiếp vào bảng với cơ chế kiểm tra chặn lỗi (0 ≤ Điểm ≤ 10, chặn NaN, chặn số âm).
- Xuất sổ điểm ra Excel `.xlsx`.

### 6. 📚 Bài Tập & Đề Trắc Nghiệm Trực Tiếp
- Giao bài tập về nhà, thiết lập hạn nộp, tiêu chí điểm và trạng thái (Đang giao, Quá hạn, Đã chấm).
- Ngân hàng câu hỏi trắc nghiệm kèm giải thích; **Chế độ trình chiếu làm bài trực tiếp** trong giờ học với phản hồi đúng/sai và tính điểm tức thì.

### 7. 🧰 Bộ Công Cụ Tương Tác Lớp Học (Classroom Tools)
- 👥 **Chia nhóm ngẫu nhiên**: Phân bổ học sinh đều vào 2–8 nhóm, sao chép danh sách chia nhóm vào clipboard.
- ⏱ **Đồng hồ bấm giờ lớp học (Timer)**: Các mốc 1p, 3p, 5p, 10p, 15p; chuông báo âm thanh kết thúc giờ làm bài.
- 🎯 **Gọi nhanh ngẫu nhiên**: Bốc thăm 1 học sinh trả lời trong 1 giây kèm hiệu ứng lật thẻ và pháo hoa chúc mừng.
- 🌟 **Nề nếp & Khen thưởng sao**: Cộng điểm phát biểu (+1, +2, +5 sao), ghi nhận nhắc nhở kỷ luật, bảng xếp hạng sao vinh danh nỗ lực.

### 8. 🖥️ Chế Độ Máy Chiếu (Projector Mode)
- Tối ưu cho màn hình máy chiếu lớp học: Toàn màn hình, phông chữ lớn, độ tương phản cao, ẩn thanh điều hướng rườm rà.
- Phím tắt `ESC` để thoát tức thì.

### 9. 🛡️ An Toàn Dữ Liệu & Audit Log
- Lưu trữ cục bộ chuẩn schema `smart-class:v1:*`.
- Sao lưu toàn diện hệ thống ra tệp JSON (`smart-class-backup-YYYY-MM-DD.json`).
- Khôi phục dữ liệu từ tệp sao lưu hoặc đặt lại dữ liệu mẫu (Seed Data) chuẩn THCS Việt Nam.
- Nhật ký thao tác (Audit Log) ghi nhận: Ai, Hành động gì, Lúc nào, Đối tượng nào.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Iconography**: Lucide React
- **Xử lý tệp Excel/CSV**: `xlsx` (SheetJS)
- **Hiệu ứng & Âm thanh**: `canvas-confetti`, Web Audio API Synthesizer (Native, zero network latency)
- **Lưu trữ**: LocalStorage versioned schema (`smart-class:v1:*`), hỗ trợ mở rộng Supabase / Cloud SQL

---

## 🚀 Cài Đặt & Chạy Ứng Dụng (Getting Started)

### Yêu cầu môi trường
- Node.js >= 18.x
- npm hoặc yarn / bun

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

### 3. Kiểm tra TypeScript & Linting
```bash
npm run lint
```

### 4. Build sản phẩm (Production Build)
```bash
npm run build
```

---

## 📁 Cấu Trúc Mã Nguồn (Architecture)

```text
src/
├── types/                      # Centralized TypeScript definitions
│   └── index.ts
├── services/                   # Business logic, Web Audio & Data storage
│   ├── audio.ts                # Web Audio API Synthesizer (Tick, Fanfare, Timer Alert)
│   ├── seedData.ts             # Dữ liệu mẫu THCS Chu Văn An (Lớp 8A1, 8A2, 9A1)
│   └── storage.ts              # LocalStorage v1 engine, Backup & Restore
├── context/
│   └── AppContext.tsx          # Central state & Teacher action handlers
├── components/
│   ├── layout/                 # Top Header, Sidebar, Global Search, Backup Modal
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── GlobalSearchModal.tsx
│   │   ├── TeacherProfileModal.tsx
│   │   └── BackupRestoreModal.tsx
│   ├── ui/                     # Toast notifications, Confirmation dialogs
│   │   ├── ToastContainer.tsx
│   │   └── ConfirmModal.tsx
│   └── features/               # Functional modules
│       ├── dashboard/          # Bàn làm việc tổng quan 5-10s
│       ├── classes/            # Quản lý lớp học & Live Preview
│       ├── students/           # Quản lý học sinh & Import Excel/CSV/Text
│       ├── attendance/         # Sổ điểm danh 1-click
│       ├── grades/             # Sổ điểm điện tử & tính ĐTB
│       ├── assignments/        # Giao bài tập & Đề trắc nghiệm
│       ├── tools/              # Vòng quay may mắn, Chia nhóm, Timer, Gọi nhanh
│       ├── behavior/           # Nề nếp & Thưởng sao
│       ├── reports/            # Phổ điểm & Báo cáo chuyên cần
│       └── audit/              # Nhật ký hoạt động hệ thống
├── App.tsx                     # Main application entry point & Projector Mode
├── index.css                   # Tailwind CSS styling & custom scrollbars
└── main.tsx                    # React DOM mount
```

---

## 🔒 Kiểm Thử & Edge Cases (QA Verification)

- [x] **0 học sinh**: Hiển thị empty state hướng dẫn thêm học sinh hoặc chuyển lớp, vô hiệu hóa nút quay.
- [x] **1 học sinh**: Vòng quay và bốc thăm hoạt động chính xác.
- [x] **20–40 học sinh**: Tự động co giãn kích thước phông chữ trên nan quạt, màu sắc phân đoạn tương phản rõ rệt.
- [x] **Kim chỉ vs Popup vs Lịch sử vs Xử lý**: Tuyệt đối khớp 100% nhờ thuật toán chọn ID trước rồi điều hướng góc quay dừng chính xác.
- [x] **Double click / Spam click**: Vô hiệu hóa nút quay và nút reset trong suốt quá trình animation quay.
- [x] **Chế độ máy chiếu**: Nhấn ESC hoặc nút trên thanh HUD để thoát mượt mà.
- [x] **Xuất/Nhập Excel**: Xử lý mượt mà tiếng Việt có dấu, lọc khoảng trắng thừa và báo cáo dòng lỗi rõ ràng.

---

## 📄 License
Phát triển theo giấy phép Apache-2.0.
