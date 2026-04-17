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
  ChevronDown,
  User,
  Activity,
  Shield,
  Monitor,
  Globe,
  Clock,
  History,
  PanelRightClose,
  PanelRightOpen,
  BookOpen,
  Library,
  ChevronLeft,
  Search,
  PenLine,
  FilePlus,
  StickyNote,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import AIChatBot from './components/AIChatbot';

// Types
type SummaryLength = 'short' | 'medium' | 'detailed';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface SummaryResult {
  id: string;
  originalText: string;
  summary: string;
  fileName: string;
  date: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  content: string;
  category: string;
}

interface RecentBook {
  bookId: string;
  lastOpened: number;
}

const TRENDING_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Cognitive Psychology 101',
    author: 'Dr. Sarah Miller',
    cover: 'https://picsum.photos/seed/psychology/400/600',
    description: 'An introductory guide to understanding the human mind, memory, and perception.',
    category: 'Science',
    content: '# Cognitive Psychology 101\n\n## Introduction\nCognitive psychology is the scientific study of mind and mental function, including learning, memory, attention, perception, reasoning, language, conceptual development, and decision making.\n\n## Chapter 1: Perception\nPerception is the organization, identification, and interpretation of sensory information in order to represent and understand the presented information, or the environment.\n\n## Chapter 2: Memory\nMemory is the faculty of the mind by which data or information is encoded, stored, and retrieved when needed.'
  },
  {
    id: '2',
    title: 'Modern Architecture Principles',
    author: 'Robert Chen',
    cover: 'https://picsum.photos/seed/architecture/400/600',
    description: 'Exploring the evolution of architectural design and the future of sustainable building.',
    category: 'Design',
    content: '# Modern Architecture Principles\n\n## The Evolution of Form\nForm follows function. This chapter explores how architectural styles have shifted from ornamental focus to functional efficiency.\n\n## Sustainability in Build\nAs we face global challenges, architecture must pivot towards zero-emission materials and energy-efficient designs.'
  },
  {
    id: '3',
    title: 'Artificial Intelligence & Ethics',
    author: 'Prof. James Wilson',
    cover: 'https://picsum.photos/seed/ai/400/600',
    description: 'A critical look at the rise of AI and the ethical challenges it presents to modern society.',
    category: 'Technology',
    content: '# Artificial Intelligence & Ethics\n\n## The Pulse of the Machine\nAI is no longer science fiction. It is embedded in our daily lives through algorithms and smart devices.\n\n## The Alignment Problem\nHow do we ensure that superintelligent systems act in accordance with human values? This is the core ethical dilemma of our time.'
  },
  {
    id: '4',
    title: 'Quantum Physics Simplified',
    author: 'Dr. Maria Garcia',
    cover: 'https://picsum.photos/seed/quantum/400/600',
    description: 'Breaking down the complexities of quantum mechanics into easy-to-understand concepts.',
    category: 'Science',
    content: '# Quantum Physics Simplified\n\n## The Smallest Truths\nEverything we see is made of particles that don\'t follow the usual rules of Newtonian physics.\n\n## Superposition & Entanglement\nHow can a particle be in two places at once? And how can two particles be connected across the universe?'
  }
];

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
  const [activeTab, setActiveTab] = useState<'summarize' | 'history' | 'books' | 'notes' | 'settings'>('summarize');
  const [isAdminView, setIsAdminView] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [summariesHistory, setSummariesHistory] = useState<SummaryResult[]>([]);
  
  // Books feature state
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>(() => {
    const saved = localStorage.getItem('pulse_recent_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [length, setLength] = useState<SummaryLength>('medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentExtractedText, setCurrentExtractedText] = useState<string | null>(null);

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Extra features state
  const [showExtraFeatures, setShowExtraFeatures] = useState(false);
  const [pdfToWordFile, setPdfToWordFile] = useState<File | null>(null);
  const [wordToPdfFile, setWordToPdfFile] = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [extraLoading, setExtraLoading] = useState<string | null>(null);

  // Notes Generator state
  const [activeExtraTool, setActiveExtraTool] = useState<'notes' | null>(null);
  const [notesMode, setNotesMode] = useState<'text' | 'file'>('file');
  const [notesTextInput, setNotesTextInput] = useState('');
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserHistory = (email: string) => {
    fetch('/api/summaries', {
      headers: {
        'x-user-email': email
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSummariesHistory(data);
        }
      })
      .catch(err => console.error('Failed to fetch user history:', err));
  };

  // Check login state on load
  useEffect(() => {
    const savedEmail = localStorage.getItem('pulse_user_email');
    const savedRole = localStorage.getItem('pulse_user_role');
    
    if (savedEmail) {
      setUserEmail(savedEmail);
      setUserRole(savedRole);
      setIsAuthenticated(true);
      fetchUserHistory(savedEmail);
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
    setCurrentExtractedText(null);
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
      setCurrentExtractedText(text); // Store text for chatbot context
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

      const newResult: SummaryResult = {
        id: Math.random().toString(36).substr(2, 9),
        originalText: text,
        summary,
        fileName: name,
        date: new Date().toLocaleString(),
      };

      // 3. Save Summary to Backend (User Isolation)
      fetch('/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify({ summary: newResult })
      }).catch(err => console.error('Failed to save summary history:', err));

      setResult(newResult);
      setSummariesHistory(prev => [newResult, ...prev]);

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

  const handleExtraFeature = async (type: 'p2w' | 'w2p' | 'merge') => {
    setExtraLoading(type);
    const formData = new FormData();
    let endpoint = '';
    let targetFile: File | File[] | null = null;

    if (type === 'p2w') {
      endpoint = '/api/pdf-to-word';
      targetFile = pdfToWordFile;
      if (targetFile) formData.append('file', targetFile as File);
    } else if (type === 'w2p') {
      endpoint = '/api/word-to-pdf';
      targetFile = wordToPdfFile;
      if (targetFile) formData.append('file', targetFile as File);
    } else if (type === 'merge') {
      endpoint = '/api/merge-pdfs';
      targetFile = mergeFiles;
      (targetFile as File[]).forEach(f => formData.append('files', f));
    }

    if (!targetFile || (Array.isArray(targetFile) && targetFile.length === 0)) {
        setExtraLoading(null);
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file. Please try again.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let downloadName = 'processed_file';
      if (type === 'p2w') downloadName = (pdfToWordFile?.name || 'document').replace('.pdf', '.docx');
      else if (type === 'w2p') downloadName = (wordToPdfFile?.name || 'document').replace('.docx', '.pdf');
      else if (type === 'merge') downloadName = 'merged_document.pdf';
      
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExtraLoading(null);
    }
  };

  const handleGenerateNotes = async () => {
    setIsGeneratingNotes(true);
    setGeneratedNotes(null);
    setError(null);

    try {
      let textToProcess = '';

      if (notesMode === 'file') {
        if (!notesFile) {
          throw new Error('Please select a PDF file first.');
        }
        
        const formData = new FormData();
        formData.append('file', notesFile);
        
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          body: formData
        });
        
        const extractData = await extractRes.json();
        if (!extractRes.ok) throw new Error(extractData.error || 'Extraction failed');
        textToProcess = extractData.text;
      } else {
        if (!notesTextInput.trim()) {
          throw new Error('Please enter some text to generate notes.');
        }
        textToProcess = notesTextInput;
      }

      const prompt = `
        You are an expert academic tutor. Transform the following text into well-structured, professional study notes using Markdown.
        Use clear headings (H1, H2, H3), bullet points, and highlight key concepts using bold text.
        Focus on clarity, organization, and ease of revision.
        Include a "Summary & Key Takeaways" section at the end.
        
        Input Text:
        ${textToProcess.substring(0, 30000)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const notes = response.text || '';
      if (!notes) throw new Error('Failed to generate notes.');
      setGeneratedNotes(notes);
    } catch (err: any) {
      setError(err.message || 'Failed to generate notes');
      console.error(err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const downloadNotesPDF = () => {
    if (!generatedNotes) return;
    
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(generatedNotes, 180);
    
    // Simple multi-page handling
    let y = 15;
    splitText.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 7;
    });
    
    doc.save('AI_Study_Notes_Pulse.pdf');
  };

  const handleLogin = (email: string, role: string) => {
    localStorage.setItem('pulse_user_email', email);
    localStorage.setItem('pulse_user_role', role);
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    fetchUserHistory(email); // FETCH ONLY THIS USER'S HISTORY UPON LOGIN
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse_user_email');
    localStorage.removeItem('pulse_user_role');
    localStorage.removeItem('pulse_summaries_history'); // CLEAR ANY STALE LOCALSTORAGE DATA
    setUserEmail(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setSummariesHistory([]); // CLEAR HISTORY STATE ON LOGOUT
    setActiveTab('summarize');
    setIsAdminView(false);
    setResult(null);
    setFile(null);
    setCurrentExtractedText(null);
  };

  const handleReadBook = (book: Book) => {
    setReadingBook(book);
    setActiveTab('books');
    
    // Update recent books
    const updatedRecent = [
      { bookId: book.id, lastOpened: Date.now() },
      ...recentBooks.filter(rb => rb.bookId !== book.id)
    ].slice(0, 10); // Keep top 10
    
    setRecentBooks(updatedRecent);
    localStorage.setItem('pulse_recent_books', JSON.stringify(updatedRecent));
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
      "min-h-screen flex transition-colors duration-500 font-sans selection:bg-orange-100 selection:text-orange-900",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* MAIN WORKSPACE (Left/Center) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 overflow-y-auto h-screen relative">
        <header className={cn(
          "h-16 flex items-center justify-between px-8 shrink-0 backdrop-blur-md sticky top-0 z-30 border-b",
          isDarkMode ? "bg-zinc-950/80 border-zinc-900" : "bg-zinc-50/80 border-zinc-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              {isAdminView ? 'Admin Dashboard' : 
               readingBook ? `Reading: ${readingBook.title}` :
               activeTab === 'summarize' ? 'AI Summarize' : 
               activeTab === 'history' ? 'Summary History' : 
               activeTab === 'books' ? 'Dashboard Overview' :
               'Settings'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {userRole === 'admin' && (
              <button 
                onClick={() => setIsAdminView(!isAdminView)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  isAdminView 
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                    : (isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-white text-zinc-500 hover:text-orange-500 shadow-sm border border-zinc-200")
                )}
              >
                {isAdminView ? <Shield size={14} /> : <Activity size={14} />}
                {isAdminView ? 'Exit Admin' : 'Admin'}
              </button>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isDarkMode ? "hover:bg-zinc-900 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
              )}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-zinc-500/10 mx-1 hidden lg:block" />
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "hidden lg:flex p-2 rounded-lg transition-all",
                isDarkMode ? "hover:bg-zinc-900 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
              )}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
          <AnimatePresence mode="wait">
            {isAdminView ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <LoginHistoryPage isDarkMode={isDarkMode} userRole={userRole} />
              </motion.div>
            ) : activeTab === 'summarize' ? (
              <motion.div
                key="summarize"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {!result ? (
                  <div className="space-y-12">
                     <div className="space-y-4 text-center max-w-lg mx-auto">
                        <h2 className="text-4xl font-extrabold tracking-tight">Distill documents in seconds.</h2>
                        <p className="text-zinc-500 text-lg">Upload any PDF or text file and let PulseSummary's AI extract the core insights for you.</p>
                      </div>

                      {/* Upload Section */}
                      <div 
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                          "relative group cursor-pointer h-72 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-12 overflow-hidden",
                          dragActive 
                            ? "border-orange-500 bg-orange-500/5 ring-8 ring-orange-500/5" 
                            : (isDarkMode ? "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50" : "border-zinc-200 hover:border-zinc-300 bg-white shadow-sm")
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                          accept=".pdf,.txt"
                        />

                        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                          <div className="grid grid-cols-6 gap-4 p-8">
                            {[...Array(24)].map((_, i) => (
                              <FileText key={i} size={48} />
                            ))}
                          </div>
                        </div>

                        <div className="relative flex flex-col items-center gap-6">
                          <div className={cn(
                            "w-20 h-20 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3",
                            isDarkMode ? "bg-zinc-800 text-orange-500" : "bg-orange-50 text-orange-500"
                          )}>
                            <FileUp size={40} />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Click or drag to upload</h3>
                            <p className="text-sm text-zinc-500 font-medium">PDF or Text files supported (Max 10MB)</p>
                          </div>
                        </div>
                      </div>

                      {/* Processing Info */}
                      <AnimatePresence>
                        {(file || isExtracting || isSummarizing || error) && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={cn(
                              "p-8 rounded-[2rem] border transition-all",
                              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-1 flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                  isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                                )}>
                                  {file ? <FileText className="text-orange-500" /> : <Shield size={18} />}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <h4 className="font-bold truncate">{file ? file.name : "System Message"}</h4>
                                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Notification"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <select 
                                  value={length}
                                  onChange={(e) => setLength(e.target.value as SummaryLength)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl border text-sm font-bold outline-none transition-all",
                                    isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200 focus:border-orange-500"
                                  )}
                                >
                                  <option value="short">Short</option>
                                  <option value="medium">Medium</option>
                                  <option value="detailed">Detailed</option>
                                </select>

                                {file && !isExtracting && !isSummarizing ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={clearFile}
                                      className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                                      title="Remove file"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                    <button
                                      onClick={handleProcess}
                                      className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                                    >
                                      Summarize
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-4 text-orange-500 font-bold text-sm">
                                    <RefreshCw className="animate-spin" size={18} />
                                    {isExtracting ? "Extracting Content..." : "AI Intelligence Working..."}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {error && (
                              <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium">
                                <AlertCircle size={16} />
                                {error}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* ALWAYS VISIBLE EXTRA FEATURES BUTTON */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowExtraFeatures(!showExtraFeatures)}
                          className={cn(
                            "flex items-center gap-2 h-12 px-8 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm",
                            showExtraFeatures 
                              ? "bg-zinc-900 text-white" 
                              : (isDarkMode ? "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50")
                          )}
                        >
                          <Settings2 size={18} />
                          Extra Features
                          <ChevronDown className={cn("transition-transform duration-300", showExtraFeatures && "rotate-180")} size={18} />
                        </button>
                      </div>

                      {/* Extra Features Dropdown */}
                      <AnimatePresence>
                        {showExtraFeatures && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                              {/* PDF to Word */}
                              <div className={cn(
                                "p-6 rounded-[2rem] border transition-all space-y-4",
                                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                              )}>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <FileText size={20} />
                                  </div>
                                  <h4 className="font-bold text-sm">PDF to Word</h4>
                                </div>
                                <div className="relative group">
                                  <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={(e) => setPdfToWordFile(e.target.files?.[0] || null)}
                                    className="hidden" 
                                    id="p2w-upload" 
                                  />
                                  <label 
                                    htmlFor="p2w-upload"
                                    className={cn(
                                      "block w-full text-center py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                                      pdfToWordFile ? "border-blue-500 bg-blue-500/5 text-blue-500" : (isDarkMode ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-100 hover:border-zinc-200")
                                    )}
                                  >
                                    <span className="text-xs font-bold truncate block px-2">{pdfToWordFile ? pdfToWordFile.name : "Select PDF"}</span>
                                  </label>
                                </div>
                                <button
                                  onClick={() => handleExtraFeature('p2w')}
                                  disabled={!pdfToWordFile || extraLoading !== null}
                                  className="w-full h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                  {extraLoading === 'p2w' ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                  {extraLoading === 'p2w' ? 'Converting...' : 'Convert & Download'}
                                </button>
                              </div>

                              {/* Word to PDF */}
                              <div className={cn(
                                "p-6 rounded-[2rem] border transition-all space-y-4",
                                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                              )}>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                    <FileUp size={20} />
                                  </div>
                                  <h4 className="font-bold text-sm">Word to PDF</h4>
                                </div>
                                <div className="relative group">
                                  <input 
                                    type="file" 
                                    accept=".docx" 
                                    onChange={(e) => setWordToPdfFile(e.target.files?.[0] || null)}
                                    className="hidden" 
                                    id="w2p-upload" 
                                  />
                                  <label 
                                    htmlFor="w2p-upload"
                                    className={cn(
                                      "block w-full text-center py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                                      wordToPdfFile ? "border-orange-500 bg-orange-500/5 text-orange-500" : (isDarkMode ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-100 hover:border-zinc-200")
                                    )}
                                  >
                                    <span className="text-xs font-bold truncate block px-2">{wordToPdfFile ? wordToPdfFile.name : "Select Word File"}</span>
                                  </label>
                                </div>
                                <button
                                  onClick={() => handleExtraFeature('w2p')}
                                  disabled={!wordToPdfFile || extraLoading !== null}
                                  className="w-full h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                  {extraLoading === 'w2p' ? <RefreshCw className="animate-spin" size={14} /> : <Download size={14} />}
                                  {extraLoading === 'w2p' ? 'Converting...' : 'Convert & Download'}
                                </button>
                              </div>

                              {/* Merger */}
                              <div className={cn(
                                "p-6 rounded-[2rem] border transition-all space-y-4 flex flex-col justify-between",
                                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                              )}>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                      <RefreshCw size={20} />
                                    </div>
                                    <h4 className="font-bold text-sm">PDF Merger</h4>
                                  </div>
                                  <div className="relative group">
                                    <input 
                                      type="file" 
                                      accept=".pdf" 
                                      multiple 
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setMergeFiles(prev => [...prev, ...files]);
                                      }}
                                      className="hidden" 
                                      id="merge-upload" 
                                    />
                                    <label 
                                      htmlFor="merge-upload"
                                      className={cn(
                                        "block w-full text-center py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                                        isDarkMode ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-100 hover:border-zinc-200"
                                      )}
                                    >
                                      <span className="text-xs font-bold">Add PDFs to Merge</span>
                                    </label>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleExtraFeature('merge')}
                                  disabled={mergeFiles.length < 2 || extraLoading !== null}
                                  className="w-full h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                  {extraLoading === 'merge' ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                                  {extraLoading === 'merge' ? 'Merging...' : 'Merge & Download'}
                                </button>
                              </div>
                            </div>

                            {/* Horizontal scroll for merged files */}
                            {mergeFiles.length > 0 && (
                              <div className="pb-12 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ready to merge ({mergeFiles.length})</h5>
                                  <button onClick={() => setMergeFiles([])} className="text-[10px] font-bold text-red-500 hover:underline">Clear all</button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                  {mergeFiles.map((f, idx) => (
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      key={idx}
                                      className={cn(
                                        "shrink-0 w-48 p-4 rounded-2xl border flex items-center gap-3 group relative",
                                        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                                      )}
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <FileText size={16} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold truncate">{f.name}</p>
                                        <p className="text-[9px] text-zinc-500 font-medium">{(f.size / 1024).toFixed(0)} KB</p>
                                      </div>
                                      <button 
                                        onClick={() => setMergeFiles(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X size={10} />
                                      </button>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-8 pb-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm tracking-widest uppercase">
                          <CheckCircle2 size={16} />
                          Synthesis Complete
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Your intelligent breakdown is here.</h2>
                      </div>
                      
                      <div className="flex gap-3 w-full md:w-auto">
                        <button
                          onClick={clearFile}
                          className={cn(
                            "flex-1 md:flex-initial px-6 py-2.5 rounded-xl border font-semibold transition-colors",
                            isDarkMode ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-100"
                          )}
                        >
                          New Upload
                        </button>
                        <button
                          onClick={downloadPDF}
                          className="flex-1 md:flex-initial px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-black/5"
                        >
                          <Download size={18} />
                          Save PDF
                        </button>
                      </div>
                    </div>

                    <div className={cn(
                      "p-10 md:p-14 rounded-[3rem] border relative overflow-hidden",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}>
                      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
                        <FileText size={400} />
                      </div>

                      <div className="relative prose prose-zinc dark:prose-invert max-w-none">
                        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-zinc-500/10">
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                             <Sparkles className="text-orange-500" size={14} />
                             Analysis Insight
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed text-lg font-medium text-opacity-90">
                          {result.summary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Recent Summaries</h2>
                  <p className="text-zinc-500">Access your previously generated insights and reports.</p>
                </div>

                <div className="grid gap-4">
                  {summariesHistory.length === 0 ? (
                    <div className={cn(
                      "p-12 rounded-[2.5rem] border text-center space-y-4",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                    )}>
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
                        <FileText size={32} />
                      </div>
                      <p className="font-medium text-zinc-500">No history found. Start by summarizing a document!</p>
                    </div>
                  ) : (
                    summariesHistory.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "group p-6 rounded-3xl border transition-all hover:scale-[1.01] flex items-center justify-between",
                          isDarkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                            <FileText size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold">{item.fileName}</h4>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-semibold tracking-wide">
                              <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setResult(item);
                            setActiveTab('summarize');
                          }}
                          className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                        >
                          View Report
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                  {/* Header */}
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight">System Settings</h2>
                    <p className="text-zinc-500 text-lg">Configure your environment and visual preferences.</p>
                  </div>

                  {/* SECTION 0: SYSTEM CONFIGURATION (SETTINGS AREA) */}
                  <div className="space-y-8 p-10 rounded-[3.5rem] bg-zinc-500/5 border border-zinc-500/10">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-500/10">
                      <div className="w-10 h-10 rounded-xl bg-zinc-500/10 text-zinc-500 flex items-center justify-center">
                        <Settings2 size={20} />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight">User Interface</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className={cn(
                        "p-8 rounded-[2.5rem] border flex items-center justify-between",
                        isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-100"
                      )}>
                        <div className="space-y-1">
                          <h4 className="font-bold">Dark Appearance</h4>
                          <p className="text-xs text-zinc-500">Switch visual themes.</p>
                        </div>
                        <button 
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            isDarkMode ? "bg-orange-500" : "bg-zinc-200"
                          )}
                        >
                          <motion.div 
                            animate={{ x: isDarkMode ? 24 : 4 }}
                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className={cn(
                        "p-8 rounded-[2.5rem] border flex items-center justify-between",
                        isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-100"
                      )}>
                        <div className="space-y-1">
                          <h4 className="font-bold">AI Performance</h4>
                          <p className="text-xs text-zinc-500">Status: optimized</p>
                        </div>
                        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
              </motion.div>
            ) : activeTab === 'books' ? (
              <motion.div
                key="books"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {readingBook ? (
                  /* Reader View */
                  <div className="space-y-8">
                    <button 
                      onClick={() => setReadingBook(null)}
                      className="flex items-center gap-2 text-zinc-500 hover:text-orange-500 font-bold text-sm transition-all group"
                    >
                      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      Back to Library
                    </button>
                    
                    <div className={cn(
                      "max-w-3xl mx-auto p-12 md:p-20 rounded-[3rem] border shadow-2xl shadow-black/5",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                    )}>
                       <div className="prose prose-zinc dark:prose-invert max-w-none">
                         <h1 className="text-4xl font-extrabold mb-4">{readingBook.title}</h1>
                         <div className="flex items-center gap-2 mb-8 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                            <span>{readingBook.author}</span>
                            <span>•</span>
                            <span>{readingBook.category}</span>
                         </div>
                         <div className="whitespace-pre-wrap leading-relaxed text-lg font-medium opacity-90">
                           {readingBook.content}
                         </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  /* Books Dashboard */
                  <div className="space-y-16">
                    {/* Header: Trending Books */}
                    <div className="space-y-2">
                       <h2 className="text-4xl font-extrabold tracking-tight">Trending Books</h2>
                       <p className="text-zinc-500 text-lg font-medium">Curated educational deep-dives and academic insights.</p>
                    </div>

                    {/* SECTION 1: TRENDING BOOKS */}
                    <div className="space-y-12">
                      <div className={cn(
                        "flex items-center gap-3 px-6 h-14 rounded-2xl border transition-all w-full md:w-96 shadow-sm",
                        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      )}>
                        <Search size={18} className="text-zinc-400" />
                        <input 
                          type="text" 
                          placeholder="Search professional library..." 
                          className="bg-transparent border-none outline-none text-sm font-medium w-full"
                        />
                      </div>

                      {/* Recently Read Sub-section */}
                      {recentBooks.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-60">Continue Reading</h4>
                          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none">
                            {recentBooks.map(rb => {
                              const book = TRENDING_BOOKS.find(b => b.id === rb.bookId);
                              if (!book) return null;
                              return (
                                <div 
                                  key={rb.bookId}
                                  className={cn(
                                    "min-w-[320px] p-6 rounded-[2.5rem] border transition-all hover:scale-[1.02] flex items-center gap-4 cursor-pointer group",
                                    isDarkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:shadow-lg"
                                  )}
                                  onClick={() => handleReadBook(book)}
                                >
                                  <img 
                                    src={book.cover} 
                                    className="w-16 h-20 object-cover rounded-xl shadow-md"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="space-y-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{book.title}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{book.category}</p>
                                    <div className="pt-2 flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                                      <Clock size={10} />
                                      Resume Reading
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Books Grid Sub-section */}
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-60">Explore the Library</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                          {TRENDING_BOOKS.map(book => (
                            <div 
                              key={book.id}
                              className={cn(
                                "group p-8 rounded-[3rem] border transition-all hover:scale-[1.01] flex flex-col md:flex-row gap-8",
                                isDarkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:shadow-xl"
                              )}
                            >
                              <div className="relative shrink-0 mx-auto md:mx-0">
                                <img 
                                  src={book.cover} 
                                  className="w-40 h-56 object-cover rounded-[2rem] shadow-2xl transition-transform group-hover:-rotate-2"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex flex-col justify-between items-start space-y-4 py-2">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">{book.category}</p>
                                  <h4 className="text-2xl font-black leading-tight tracking-tight">{book.title}</h4>
                                  <p className="text-sm text-zinc-500 font-medium line-clamp-3">{book.description}</p>
                                </div>
                                <button 
                                  onClick={() => handleReadBook(book)}
                                  className="mt-4 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/10 text-sm"
                                >
                                  <BookOpen size={16} />
                                  Read Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'notes' ? (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Header */}
                <div className="space-y-4">
                  <h2 className="text-4xl font-extrabold tracking-tight">AI Notes Generator</h2>
                  <p className="text-zinc-500 text-lg">Synthesize complex material into study-ready insights.</p>
                </div>

                {/* SECTION 2: AI NOTES GENERATOR */}
                <div className="space-y-10 p-10 rounded-[3.5rem] bg-orange-500/5 border border-orange-500/10">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-orange-500/10">
                     <div className="space-y-1">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                           <PenLine size={20} />
                         </div>
                         <h3 className="text-3xl font-black tracking-tight">synthesis engine</h3>
                       </div>
                       <p className="text-sm text-zinc-500 font-medium ml-1">Professional grade study notes synthesized in real-time.</p>
                     </div>

                       <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl w-fit">
                         <button 
                           onClick={() => setNotesMode('file')}
                           className={cn(
                             "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                             notesMode === 'file' ? "bg-white dark:bg-zinc-700 shadow-md text-orange-500" : "text-zinc-500"
                           )}
                         >
                           <FileText size={16} /> PDF Input
                         </button>
                         <button 
                           onClick={() => setNotesMode('text')}
                           className={cn(
                             "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                             notesMode === 'text' ? "bg-white dark:bg-zinc-700 shadow-md text-orange-500" : "text-zinc-500"
                           )}
                         >
                           <PenLine size={16} /> Text Input
                         </button>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                       {/* Input Section */}
                       <div className="space-y-6">
                         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                           <div className="w-2 h-2 rounded-full bg-orange-500" />
                           Source Material
                         </div>
                         
                         {notesMode === 'file' ? (
                           <div className="space-y-4">
                             <div 
                               onClick={() => document.getElementById('notes-file-main-dash')?.click()}
                               className={cn(
                                 "h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:scale-[1.01]",
                                 notesFile ? "border-green-500 bg-green-500/5 text-green-500" : (isDarkMode ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-100 hover:border-zinc-200")
                               )}
                             >
                               <input 
                                 id="notes-file-main-dash"
                                 type="file" 
                                 accept=".pdf"
                                 className="hidden"
                                 onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
                               />
                               {notesFile ? <CheckCircle2 size={48} /> : <FilePlus size={48} className="opacity-20" />}
                               <div className="text-center px-6">
                                 <p className="text-sm font-black truncate max-w-[240px]">
                                   {notesFile ? notesFile.name : "Select Research PDF"}
                                 </p>
                                 <p className="text-[10px] uppercase font-bold text-zinc-400 mt-1">Tap to browse files</p>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <textarea 
                             value={notesTextInput}
                             onChange={(e) => setNotesTextInput(e.target.value)}
                             placeholder="Paste lecture transcripts, textbook chapters, or meeting notes here..."
                             className={cn(
                               "w-full h-64 p-8 rounded-[2.5rem] border outline-none font-medium text-sm resize-none transition-all",
                               isDarkMode ? "bg-zinc-950 border-zinc-800 focus:border-orange-500" : "bg-zinc-50 border-zinc-100 focus:border-orange-200"
                             )}
                           />
                         )}

                         <button 
                           onClick={handleGenerateNotes}
                           disabled={isGeneratingNotes || (notesMode === 'file' && !notesFile) || (notesMode === 'text' && !notesTextInput)}
                           className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-600 disabled:opacity-50 transition-all shadow-2xl shadow-orange-500/20 active:scale-95"
                         >
                           {isGeneratingNotes ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
                           {isGeneratingNotes ? "SYNTHESIZING..." : "GENERATE AI NOTES"}
                         </button>
                       </div>

                       {/* Preview Section */}
                       <div className="space-y-6">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                             <div className="w-2 h-2 rounded-full bg-green-500" />
                             AI Analysis Preview
                           </div>
                           {generatedNotes && (
                             <button 
                               onClick={downloadNotesPDF}
                               className="flex items-center gap-2 text-xs font-black text-green-500 hover:text-green-600 transition-colors"
                             >
                               <Download size={16} /> DOWNLOAD PDF
                             </button>
                           )}
                         </div>

                         <div className={cn(
                           "w-full h-[380px] rounded-[2.5rem] border overflow-y-auto p-10 relative",
                           isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200/50"
                         )}>
                           {!generatedNotes && !isGeneratingNotes ? (
                             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-400">
                               <StickyNote size={64} className="opacity-5" />
                               <div className="space-y-1">
                                 <p className="text-sm font-bold italic">Awaiting Source Material</p>
                                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Output will be formatted as Markdown</p>
                               </div>
                             </div>
                           ) : isGeneratingNotes ? (
                             <div className="h-full flex flex-col items-center justify-center space-y-6">
                               <div className="flex gap-1.5">
                                 {[...Array(3)].map((_, i) => (
                                   <motion.div
                                     key={i}
                                     animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                     transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                     className="w-3 h-3 rounded-full bg-orange-500"
                                   />
                                 ))}
                               </div>
                               <div className="text-center space-y-2">
                                 <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] animate-pulse">Running Neural Extraction</p>
                                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">Optimizing for academic density...</p>
                               </div>
                             </div>
                           ) : (
                             <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none prose-headings:font-black prose-p:font-medium prose-li:font-medium">
                               <Markdown>{generatedNotes}</Markdown>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
             </motion.div>
            ) : (
              <motion.div
                key="summary-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center text-center p-12"
              >
                <div className="space-y-6 max-w-md">
                  <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mx-auto text-zinc-300">
                    <History size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">History Archive</h3>
                    <p className="text-zinc-500 font-medium">Your processed summaries and generated notes will appear here once archived.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* RIGHT SIDEBAR (Fixed) */}
      <aside className={cn(
        "hidden lg:flex flex-col border-l transition-all duration-500 shrink-0 overflow-hidden",
        isSidebarOpen ? "w-80" : "w-20",
        isDarkMode ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"
      )}>
        {/* Profile Section */}
        <div className={cn("p-8 space-y-6", !isSidebarOpen && "px-4")}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-orange-500 shrink-0">
               <User size={24} />
            </div>
            {isSidebarOpen && (
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-bold text-sm truncate uppercase tracking-widest">Profile</h3>
                <p className="text-xs text-zinc-500 font-medium truncate">{userEmail}</p>
              </div>
            )}
          </div>
          
          {isSidebarOpen ? (
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={14} /> Log Out
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 transition-all"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        <div className="h-px bg-zinc-500/10 mx-6" />

        {/* Feature Navigation */}
        <nav className={cn("flex-1 p-6 space-y-1.5", !isSidebarOpen && "px-4")}>
          <div className="pb-2">
            <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 px-4", !isSidebarOpen && "text-center px-0")}>
              {isSidebarOpen ? "Core Utilities" : "Core"}
            </p>
            <button 
              onClick={() => { setActiveTab('summarize'); setIsAdminView(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all",
                isSidebarOpen ? "px-4 py-3.5" : "w-12 h-12 justify-center",
                activeTab === 'summarize' && !isAdminView
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/25 scale-[1.02]" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
              title={!isSidebarOpen ? "Summarize" : ""}
            >
              <Sparkles size={18} className="shrink-0" /> {isSidebarOpen && "Summarize"}
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setIsAdminView(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all",
                isSidebarOpen ? "px-4 py-3.5" : "w-12 h-12 justify-center",
                activeTab === 'history' && !isAdminView
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/25 scale-[1.02]" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
              title={!isSidebarOpen ? "History" : ""}
            >
              <Clock size={18} className="shrink-0" /> {isSidebarOpen && "History"}
            </button>
          </div>

          <div className="pt-2">
            <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 px-4", !isSidebarOpen && "text-center px-0")}>
              {isSidebarOpen ? "Insights" : "AI"}
            </p>
            <button 
              onClick={() => { setActiveTab('books'); setIsAdminView(false); setReadingBook(null); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all",
                isSidebarOpen ? "px-4 py-3.5" : "w-12 h-12 justify-center",
                activeTab === 'books' && !isAdminView
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/25 scale-[1.02]" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
              title={!isSidebarOpen ? "Trending Books" : ""}
            >
              <Library size={18} className="shrink-0" /> {isSidebarOpen && "Trending Books"}
            </button>
            <button 
              onClick={() => { setActiveTab('notes'); setIsAdminView(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all",
                isSidebarOpen ? "px-4 py-3.5" : "w-12 h-12 justify-center",
                activeTab === 'notes' && !isAdminView
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-500/25 scale-[1.02]" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
              title={!isSidebarOpen ? "Study Notes" : ""}
            >
              <PenLine size={18} className="shrink-0" /> {isSidebarOpen && "Notes Generator"}
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-500/10">
            <button 
              onClick={() => { setActiveTab('settings'); setIsAdminView(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl text-sm font-bold transition-all",
                isSidebarOpen ? "px-4 py-3" : "w-12 h-12 justify-center",
                activeTab === 'settings' && !isAdminView
                  ? (isDarkMode ? "bg-zinc-800 text-white" : "bg-white text-orange-500 shadow-sm border border-zinc-200")
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
              title={!isSidebarOpen ? "Settings" : ""}
            >
              <Settings2 size={18} className="shrink-0" /> {isSidebarOpen && "Settings"}
            </button>
          </div>
        </nav>

        {/* Previous Uploads Quick List */}
        {isSidebarOpen && (
          <div className="h-[40%] flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Previous Uploads</h4>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full font-bold">{summariesHistory.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {summariesHistory.slice(0, 8).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setResult(item);
                    setActiveTab('summarize');
                    setIsAdminView(false);
                  }}
                  className={cn(
                    "p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]",
                    isDarkMode ? "bg-zinc-950/50 border-zinc-900 hover:border-zinc-800" : "bg-zinc-50 border-zinc-200/50 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.fileName}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{item.date.split(',')[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
              {summariesHistory.length === 0 && (
                <p className="text-[10px] text-center py-8 text-zinc-500 italic">No uploads yet</p>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-8 pt-0">
          <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-2">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles size={12} />
              PulseSynth v3.2
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Neural engine active. Optimizing extraction for maximum density.</p>
          </div>
        </div>
      </aside>

      {/* MOBILE NAV (Bottom) */}
      <nav className={cn(
        "lg:hidden fixed bottom-6 left-6 right-6 h-16 rounded-[2rem] border z-40 flex items-center justify-around px-4 shadow-2xl backdrop-blur-xl",
        isDarkMode ? "bg-zinc-950/90 border-zinc-800" : "bg-white/90 border-zinc-200"
      )}>
        <button 
          onClick={() => { setActiveTab('summarize'); setIsAdminView(false); }}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeTab === 'summarize' && !isAdminView ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-zinc-400"
          )}
        >
          <Sparkles size={20} />
        </button>
        <button 
          onClick={() => { setActiveTab('history'); setIsAdminView(false); }}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeTab === 'history' && !isAdminView ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-zinc-400"
          )}
        >
          <Clock size={20} />
        </button>
        <button 
          onClick={() => { setActiveTab('books'); setIsAdminView(false); setReadingBook(null); }}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeTab === 'books' && !isAdminView ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-zinc-400"
          )}
        >
          <Library size={20} />
        </button>
        <button 
          onClick={() => { setActiveTab('notes'); setIsAdminView(false); }}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeTab === 'notes' && !isAdminView ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-zinc-400"
          )}
        >
          <PenLine size={20} />
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); setIsAdminView(false); }}
          className={cn(
            "p-3 rounded-2xl transition-all",
            activeTab === 'settings' && !isAdminView ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-zinc-400"
          )}
        >
          <Settings2 size={20} />
        </button>
      </nav>

      <AIChatBot 
        isDarkMode={isDarkMode} 
        pdfContext={currentExtractedText} 
        fileName={file?.name || null} 
      />
    </div>
  );
}
