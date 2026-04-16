import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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
