import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { PDFDocument } from 'pdf-lib';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

// Simple in-memory user storage
const users: any[] = [];

// Bootstrap Admin User
(async () => {
  const adminHashedPassword = await bcrypt.hash('1234', 10);
  users.push({
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: adminHashedPassword,
    role: 'admin'
  });
})();

// Simple in-memory storage for login history
const loginHistory: any[] = [];

// Simple in-memory storage for PDF summaries (isolated by user email)
const summariesHistory: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  app.use(express.json());

  // --- AUTH ROUTES ---

  // Signup Route
  app.post('/api/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User with this email already exists' });
      }

      // Hash password for safety
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user with default role
      const newUser = { name, email, password: hashedPassword, role: 'user' };
      users.push(newUser);

      console.log(`New user registered: ${email}`);
      res.json({ success: true, user: { name, email, role: 'user' } });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Login Route
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Track Login Activity
      const loginRecord = {
        email: user.email,
        name: user.name,
        time: new Date().toLocaleString(),
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };
      loginHistory.unshift(loginRecord); // Newest first

      res.json({ success: true, email: user.email, name: user.name, role: user.role });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // GET Login History (ADMIN ONLY)
  app.get('/api/logins', (req, res) => {
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    res.json(loginHistory);
  });

  // --- PROCESSING ROUTES ---

  // API Route for text extraction
  app.post('/api/extract', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { buffer, mimetype, originalname } = req.file;

      let extractedText = '';

      if (mimetype === 'application/pdf') {
        const data = await pdf(buffer);
        extractedText = data.text;
      } else if (mimetype === 'text/plain') {
        extractedText = buffer.toString('utf8');
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or .txt file.' });
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from the file.' });
      }

      res.json({ text: extractedText, name: originalname });
    } catch (error) {
      console.error('Extraction error:', error);
      res.status(500).json({ error: 'Failed to process file' });
    }
  });

  // --- EXTRA UTILITIES ---

  // PDF to Word
  app.post('/api/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
      if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Please upload a PDF file.' });
      }

      const data = await pdf(req.file.buffer);
      const text = data.text;

      if (!text) {
        return res.status(400).json({ error: 'Could not extract text from PDF.' });
      }

      // Create docx
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: text.split('\n').map(line => new Paragraph({
            children: [new TextRun(line)],
          })),
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname.replace('.pdf', '')}.docx`);
      res.send(buffer);
    } catch (error) {
      console.error('PDF to Word error:', error);
      res.status(500).json({ error: 'Failed to convert PDF to Word.' });
    }
  });

  // Word to PDF
  app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
      if (!req.file || !req.file.originalname.endsWith('.docx')) {
        return res.status(400).json({ error: 'Please upload a .docx file.' });
      }

      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;

      if (!text) {
        return res.status(400).json({ error: 'Could not extract text from Word document.' });
      }

      // Simple PDF generation from text
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 15, 15);
      
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname.replace('.docx', '')}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Word to PDF error:', error);
      res.status(500).json({ error: 'Failed to convert Word to PDF.' });
    }
  });

  // Merge PDFs
  app.post('/api/merge-pdfs', upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length < 2) {
        return res.status(400).json({ error: 'Please upload at least two PDF files to merge.' });
      }

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        if (file.mimetype !== 'application/pdf') continue;
        const pdf = await PDFDocument.load(file.buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
      res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
      console.error('Merge PDFs error:', error);
      res.status(500).json({ error: 'Failed to merge PDFs.' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // --- SUMMARY HISTORY ROUTES ---

  // Save a new summary for a specific user
  app.post('/api/summaries', (req, res) => {
    const userEmail = req.headers['x-user-email'] as string;
    const { summary } = req.body;

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized: User email required' });
    }

    if (!summary) {
      return res.status(400).json({ error: 'Summary data is required' });
    }

    // Attach user information to the record
    const newRecord = {
      ...summary,
      userEmail,
      createdAt: new Date()
    };

    summariesHistory.unshift(newRecord);
    res.json({ success: true, summary: newRecord });
  });

  // Fetch only the summaries for the logged-in user
  app.get('/api/summaries', (req, res) => {
    const userEmail = req.headers['x-user-email'] as string;

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized: User email required' });
    }

    // FILTER result to only show the CURRENT user's data
    const userSummaries = summariesHistory.filter(s => s.userEmail === userEmail);
    
    // Security verification: ensure No user ever gets another user's data
    res.json(userSummaries);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
