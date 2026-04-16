import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";
import { 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  Trash2, 
  Settings2,
  Moon,
  Sun,
  X,
  Sparkles,
  Lock,
  Mail,
  LogIn,
  LogOut,
  ChevronRight,
  User,
  Activity,
  Shield,
  Monitor,
  Globe,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Types
type SummaryLength = 'short' | 'medium' | 'detailed';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface SummaryResult {
  originalText: string;
  summary: string;
  fileName: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Components ---

interface LoginPageProps {
  onLogin: (email: string, role: string) => void;
  onSwitchToSignup: () => void;
  isDarkMode: boolean;
}

function LoginPage({ onLogin, onSwitchToSignup, isDarkMode }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(data.email, data.role);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-500",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-8",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Welcome Back</h1>
          <p className="text-zinc-500 text-sm">Sign in to PulseSummary to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={cn(
                    "w-full pl-11 pr-4 py-3.5 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-11 pr-4 py-3.5 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full py-4 bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-orange-500/25"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{" "}
            <button 
              onClick={onSwitchToSignup}
              className="text-orange-500 font-bold hover:underline underline-offset-4"
            >
              Create one for free
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface SignupPageProps {
  onSignupSuccess: (email: string, role: string) => void;
  onSwitchToLogin: () => void;
  isDarkMode: boolean;
}

function SignupPage({ onSignupSuccess, onSwitchToLogin, isDarkMode }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSignupSuccess(data.user.email, data.user.role);
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-500",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-8",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-zinc-500 text-sm">Join PulseSummary for smart document insights</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Confirm</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••"
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border outline-none transition-all",
                    isDarkMode 
                      ? "bg-zinc-800 border-zinc-700 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10" 
                      : "bg-zinc-50 border-zinc-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  )}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-orange-500/25"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <span>Create Free Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          Already have an account?{" "}
          <button 
            onClick={onSwitchToLogin}
            className="text-orange-500 font-bold hover:underline underline-offset-4"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}

interface LoginRecord {
  email: string;
  name: string;
  time: string;
  ip: string;
  userAgent: string;
}

function LoginHistoryPage({ isDarkMode, userRole }: { isDarkMode: boolean; userRole: string | null }) {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logins', {
      headers: {
        'x-user-role': userRole || ''
      }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unauthorized access');
        return data;
      })
      .then(data => {
        setHistory(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [userRole]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center text-red-500">
          <Shield size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Access Denied</h3>
          <p className="text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Login Activity History</h2>
        <p className="text-zinc-500">Track all user logins, devices, and entry times in real-time.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="animate-spin text-orange-500" size={40} />
        </div>
      ) : (
        <div className={cn(
          "overflow-hidden rounded-3xl border",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={cn(
                  "border-b transition-colors",
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                )}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Time</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">IP Address</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Device/Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-500 font-medium">
                      No login records found yet.
                    </td>
                  </tr>
                ) : (
                  history.map((record, i) => (
                    <tr key={i} className="hover:bg-orange-500/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <User size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{record.name}</span>
                            <span className="text-xs text-zinc-500">{record.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-zinc-400" />
                          <span>{record.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-500">{record.ip}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full w-fit max-w-[200px] truncate">
                          <Monitor size={12} />
                          <span title={record.userAgent}>{record.userAgent}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [appView, setAppView] = useState<'main' | 'history'>('main');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [length, setLength] = useState<SummaryLength>('medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check login state on load
  useEffect(() => {
    const savedEmail = localStorage.getItem('pulse_user_email');
    const savedRole = localStorage.getItem('pulse_user_role');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setUserRole(savedRole);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Initialize dark mode from system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or .txt file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(file);
    setError(null);
    setResult(null);
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Extract Text via Backend
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        const errData = await extractResponse.json();
        throw new Error(errData.error || 'Failed to extract text from file.');
      }

      const { text, name } = await extractResponse.json();
      setIsExtracting(false);
      setIsSummarizing(true);

      // 2. Summarize via Gemini API (Client-side)
      const prompt = `
        Please summarize the following text into a ${length} length.
        
        Requirements:
        1. Be concise and capture all key concepts.
        2. Ensure perfect grammar and logical flow.
        3. Use professional formatting (headings and bullet points where appropriate).
        4. Focus on the most important information while maintaining accuracy.
        5. For 'short', aim for 3-5 key points. 
        6. For 'medium', aim for a well-structured multi-paragraph summary.
        7. For 'detailed', provide a comprehensive breakdown of sections.

        Text to summarize:
        ${text}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const summary = response.text || '';
      
      if (!summary) throw new Error('Failed to generate summary.');

      setResult({
        originalText: text,
        summary,
        fileName: name,
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsExtracting(false);
      setIsSummarizing(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PulseSummary AI Report", margin, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Source: ${result.fileName}`, margin, 38);
    doc.text(`Length: ${length.charAt(0).toUpperCase() + length.slice(1)}`, margin, 43);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 48);

    doc.setDrawColor(200);
    doc.line(margin, 55, pageWidth - margin, 55);

    // Content
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(result.summary, maxLineWidth);
    doc.text(lines, margin, 70);

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated by PulseSummary AI`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`Summary_${result.fileName.replace(/\.[^/.]+$/, "")}.pdf`);
  };

  const handleLogin = (email: string, role: string) => {
    localStorage.setItem('pulse_user_email', email);
    localStorage.setItem('pulse_user_role', role);
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse_user_email');
    localStorage.removeItem('pulse_user_role');
    setUserEmail(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setAppView('main');
    setResult(null);
    setFile(null);
  };

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setAuthView('signup')}
        isDarkMode={isDarkMode} 
      />
    ) : (
      <SignupPage 
        onSignupSuccess={(email, role) => {
          handleLogin(email, role);
          setAuthView('login');
        }}
        onSwitchToLogin={() => setAuthView('login')}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans selection:bg-orange-100 selection:text-orange-900",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b transition-colors",
        isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50/80 border-zinc-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">PulseSummary</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                {userRole === 'admin' ? 'Administrator' : 'Authenticated User'}
              </span>
              <span className="text-sm font-medium">{userEmail}</span>
            </div>

            {userRole === 'admin' && (
              <button 
                onClick={() => setAppView(appView === 'main' ? 'history' : 'main')}
                className={cn(
                  "p-2 rounded-xl transition-all hover:scale-110 flex items-center gap-2 px-3",
                  appView === 'history' 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : (isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-orange-400" : "bg-white text-zinc-500 hover:text-orange-500 shadow-sm border border-zinc-200")
                )}
                title={appView === 'main' ? "View Admin History" : "Go to Summary"}
              >
                {appView === 'main' ? <Activity size={20} /> : <FileText size={20} />}
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">{appView === 'main' ? 'Admin' : 'App'}</span>
              </button>
            )}

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full transition-all hover:scale-110 active:scale-95",
                isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-orange-400" : "bg-white text-zinc-500 hover:text-orange-500 shadow-sm border border-zinc-200"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={handleLogout}
              className={cn(
                "p-2 rounded-full transition-all hover:scale-110 active:scale-95",
                isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-red-400" : "bg-white text-zinc-500 hover:text-red-500 shadow-sm border border-zinc-200"
              )}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {appView === 'history' && userRole === 'admin' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LoginHistoryPage isDarkMode={isDarkMode} userRole={userRole} />
            </motion.div>
          ) : !result ? (
            <motion.section
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                  Summarize anything <br />
                  <span className="text-orange-500">with precision.</span>
                </h1>
                <p className={cn(
                  "text-lg md:text-xl max-w-2xl mx-auto font-medium",
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>
                  Upload your text or PDF files to get AI-powered structured summaries, corrected grammar, and logical breakdowns in seconds.
                </p>
              </div>

              {/* Upload Area */}
              <div className="space-y-8">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "relative group cursor-pointer transition-all duration-300 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center min-h-[320px] p-8 text-center",
                    dragActive 
                      ? "border-orange-500 bg-orange-500/5" 
                      : (isDarkMode ? "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700" : "border-zinc-200 bg-white hover:border-zinc-300 shadow-sm")
                  )}
                  onClick={() => file ? null : fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt"
                    onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                  />

                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div 
                        key="no-file"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="text-zinc-400 dark:text-zinc-500" size={32} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold">Click to upload or drag & drop</p>
                          <p className="text-sm text-zinc-500">PDF or TXT files up to 10MB</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="relative p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-col items-center gap-2 max-w-sm w-full">
                          <FileText className="text-orange-500 w-12 h-12 mb-2" />
                          <p className="font-semibold text-center break-all px-4">{file.name}</p>
                          <p className="text-xs text-orange-500/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-orange-500/10 text-zinc-400 hover:text-zinc-100 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings & Action */}
                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                        <Settings2 size={16} />
                        <span>Summary Length:</span>
                      </div>
                      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        {(['short', 'medium', 'detailed'] as const).map((len) => (
                          <button
                            key={len}
                            onClick={() => setLength(len)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize",
                              length === len 
                                ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm" 
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            )}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleProcess}
                      disabled={isExtracting || isSummarizing}
                      className={cn(
                        "w-full md:w-auto px-8 py-3 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25",
                      )}
                    >
                      {(isExtracting || isSummarizing) ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          <span>{isExtracting ? 'Analyzing Document...' : 'Synthesizing Summary...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          <span>Generate Summary</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-green-500 font-bold text-sm tracking-widest uppercase">
                    <CheckCircle2 size={16} />
                    Summary Ready
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Your intelligent breakdown is here.</h2>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={clearFile}
                    className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    New Upload
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex-1 md:flex-initial px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-black/5"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Result Content */}
              <div className="grid gap-8">
                <div className={cn(
                  "p-8 md:p-12 rounded-3xl border transition-colors relative overflow-hidden",
                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-600 shadow-sm"
                )}>
                  {/* Subtle water mark icon */}
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <FileText size={400} />
                  </div>

                  <div className="relative prose prose-zinc dark:prose-invert max-w-none">
                    <div className="flex items-center gap-2 mb-8 pb-4 border-b border-zinc-500/10">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                        <Sparkles className="text-orange-500" size={16} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">AI Generated Insights</span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed text-lg">
                      {result.summary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 py-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Accuracy Verified
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Grammar Corrected
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    PulseSynth Engine
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={cn(
        "py-12 mt-20 border-t transition-colors",
        isDarkMode ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Sparkles size={16} />
            <span className="text-sm font-bold tracking-tight">PulseSummary</span>
          </div>
          <p className="text-zinc-500 text-sm">Powered by Gemini AI 3.0 & Google Cloud</p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <a href="#" className="text-xs text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest font-semibold">Privacy</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest font-semibold">Terms</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-orange-500 transition-colors uppercase tracking-widest font-semibold">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
