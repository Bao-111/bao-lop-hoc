import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

function getPort(): number {
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--port' && process.argv[i + 1]) {
      const p = Number(process.argv[i + 1]);
      if (!isNaN(p) && p > 0) return p;
    }
    if (arg.startsWith('--port=')) {
      const p = Number(arg.split('=')[1]);
      if (!isNaN(p) && p > 0) return p;
    }
    if (arg === '-p' && process.argv[i + 1]) {
      const p = Number(process.argv[i + 1]);
      if (!isNaN(p) && p > 0) return p;
    }
  }
  // In AI Studio / Cloud Run, NGINX listens on port 8080 and proxies to internal app port 3000.
  // Express MUST NOT bind to 8080 if PORT=8080 is set by Cloud Run, otherwise EADDRINUSE occurs.
  if (process.env.APP_PORT) {
    const p = Number(process.env.APP_PORT);
    if (!isNaN(p) && p > 0) return p;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const p = Number(process.env.PORT);
    if (!isNaN(p) && p > 0) return p;
  }
  return 3000;
}

const PORT = getPort();

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK server-side with recommended headers
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Route 1: Cho phép giáo viên hỏi AI mọi thứ (Gemini 3.8 Flash)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung câu hỏi' });
    }

    if (!ai) {
      // Graceful pedagogical fallback when API key is missing
      return res.json({
        reply: `Chào Thầy/Cô! Hiện tại hệ thống đang chạy ở chế độ mô phỏng giáo dục. Câu hỏi của Thầy/Cô: "${message}". Để kích hoạt phản hồi trực tiếp từ Gemini 3.8 Flash, vui lòng cài đặt GEMINI_API_KEY trong cấu hình Secrets.`,
        model: 'gemini-3.8-flash (demo)'
      });
    }

    const systemInstruction = `Bạn là Trợ lý Sư phạm Trí tuệ Nhân tạo thông minh, am hiểu và thân thiện dành riêng cho giáo viên Việt Nam, được phát triển trên nền tảng Gemini AI (mô hình gemini-3.8-flash).
Nhiệm vụ của bạn là giải đáp và hỗ trợ giáo viên MỌI THỨ mà họ hỏi, không giới hạn:
1. Kiến thức chuyên môn tất cả các môn học (Toán, Vật lý, Hóa học, Sinh học, KHTN, Ngữ văn, Lịch sử, Địa lý, Tiếng Anh, Tin học, GDCD, Công nghệ, Âm nhạc, Mỹ thuật, GDTC...)
2. Soạn câu hỏi trắc nghiệm, bài tập, đề kiểm tra, ma trận đề thi chuẩn Bộ GD&ĐT (chương trình GDPT 2018).
3. Phương pháp giảng dạy tích cực (Dạy học dự án, kỹ thuật khăn trải bàn, sơ đồ tư duy, STEM, dạy học phân hóa, phát triển năng lực phẩm chất).
4. Xử lý các tình huống sư phạm thực tế trên lớp, tâm lý lứa tuổi học sinh THCS & THPT, phối hợp giáo dục với phụ huynh.
5. Giải chi tiết bài tập khó, chứng minh hình học, giải phương trình, phân tích tác phẩm văn học, sửa lỗi phát âm và ngữ pháp tiếng Anh.
6. Soạn giáo án, kế hoạch bài dạy theo Công văn 5512/BGDĐT.
7. Ứng dụng công nghệ thông tin trong dạy học (AI, phần mềm mô phỏng, bảng tương tác, tổ chức trò chơi học tập).
8. Bất kỳ câu hỏi nào khác về khoa học, giáo dục, đời sống mà giáo viên quan tâm.

Phong cách phản hồi:
- Tôn trọng, nhiệt tình, lịch sự, xưng hô "Thầy/Cô" hoặc "bạn" và "tôi".
- Trình bày mạch lạc, có cấu trúc rõ ràng (dùng gạch đầu dòng, tiêu đề đậm, bảng hoặc công thức khi phù hợp).
- Ngắn gọn nhưng đầy đủ bản chất sư phạm, luôn đưa ra ví dụ cụ thể, thiết thực áp dụng được ngay trên lớp học.`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-8).forEach((h: any) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    let finalPrompt = message;
    if (context) {
      finalPrompt = `[Ngữ cảnh giảng dạy: ${context}]\n\n${message}`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'Tôi đã tiếp nhận câu hỏi của Thầy/Cô. Thầy/Cô có cần làm rõ thêm khía cạnh nào không ạ?';
    res.json({ reply, model: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'Không thể kết nối với Gemini AI lúc này',
      details: err?.message || String(err)
    });
  }
});

// Route 2: AI Generate Questions from Lesson Document / Topic
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { subject, grade, lesson, sourceContent, numQuestions = 5 } = req.body;

    if (!ai) {
      return res.json({ isDemo: true });
    }

    const prompt = `Bạn là chuyên gia khảo thí biên soạn đề thi chuẩn GDPT 2018 của Bộ GD&ĐT Việt Nam.
Tài liệu bài học:
- Môn: ${subject || 'Toán học'} - ${grade || 'Khối 9'}
- Tên bài: ${lesson || 'Bài học'}
- Nội dung:
${sourceContent || 'Chuẩn kiến thức SGK'}

Hãy biên soạn đúng ${numQuestions} câu hỏi trắc nghiệm chất lượng cao bám sát nội dung, phân bổ đều theo 4 mức độ: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%).
Phải hỗ trợ đa dạng các dạng câu hỏi: 1 Đáp án, Nhiều đáp án, Đúng / Sai 4 ý a,b,c,d, Điền khuyết, Ghép đôi.
Yêu cầu trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown):
[
  {
    "code": "TOAN9-AI01",
    "question": "Nội dung câu hỏi",
    "questionType": "1 Đáp án",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctIndex": 0,
    "correctIndices": [0],
    "trueFalseStatements": [
      { "id": "tf-1", "statement": "Mệnh đề a", "isCorrect": true },
      { "id": "tf-2", "statement": "Mệnh đề b", "isCorrect": false },
      { "id": "tf-3", "statement": "Mệnh đề c", "isCorrect": true },
      { "id": "tf-4", "statement": "Mệnh đề d", "isCorrect": false }
    ],
    "fillBlankAnswer": "từ cần điền",
    "matchingPairs": [
      { "id": "m-1", "left": "vế 1", "right": "vế a" }
    ],
    "level": "Thông hiểu",
    "explanation": "Lời giải chi tiết và căn cứ lý thuyết",
    "points": 1
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ questions: parsed, model: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Error in /api/generate-questions:', err);
    res.status(500).json({ error: 'Failed to generate questions', details: err?.message });
  }
});

// Route 3: AI Lesson Plan Generator CV 5512
app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const { subject, grade, lessonName, duration = '1 tiết (45 phút)' } = req.body;
    if (!ai) {
      return res.json({ isDemo: true });
    }

    const prompt = `Soạn Kế hoạch bài dạy (Giáo án) hoàn chỉnh chuẩn theo Công văn 5512/BGDĐT của Bộ GD&ĐT cho:
Môn: ${subject} - Khối: ${grade}
Tên bài: ${lessonName}
Thời lượng: ${duration}

Cấu trúc:
I. MỤC TIÊU BÀI DẠY (Kiến thức, Năng lực chung, Năng lực chuyên biệt, Phẩm chất)
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
III. TIẾN TRÌNH DẠY HỌC (Hoạt động 1: Khởi động, Hoạt động 2: Hình thành kiến thức mới, Hoạt động 3: Luyện tập, Hoạt động 4: Vận dụng & Mở rộng).
Trình bày đầy đủ, chi tiết, chuyên nghiệp.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    res.json({ plan: response.text });
  } catch (err: any) {
    console.error('Error in /api/generate-lesson-plan:', err);
    res.status(500).json({ error: 'Failed to generate lesson plan', details: err?.message });
  }
});

// Server start with dev Vite middleware and production static serving
async function start() {
  const isDev =
    process.env.NODE_ENV !== 'production' ||
    process.env.npm_lifecycle_event === 'dev' ||
    !fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'));

  const distPath = path.resolve(process.cwd(), 'dist');

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(process.cwd(), 'index.html');
        if (!fs.existsSync(templatePath)) {
          return res.status(404).send('index.html not found');
        }
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).send('Application is building, please refresh in a moment.');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Class server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error(`Server error on port ${PORT}:`, err);
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} is currently in use. Retrying in 1 second...`);
      setTimeout(() => {
        try {
          server.close();
        } catch {
          // ignore
        }
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    }
  });
}

start().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
