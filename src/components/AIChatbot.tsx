import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw, 
  ChevronDown, 
  Minimize2, 
  Sparkles, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

// We initialize a separate AI instance for the chatbot for better separation
// It will use the same GEMINI_API_KEY from the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatBotProps {
  isDarkMode: boolean;
  pdfContext: string | null;
  fileName: string | null;
}

export default function AIChatBot({ isDarkMode, pdfContext, fileName }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "hi myself Friend",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset chat when pdfContext changes to ensure AI is aware of the new document
  useEffect(() => {
    chatRef.current = null;
  }, [pdfContext]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const messageText = overrideInput || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Prepare context for the AI
      const systemInstruction = `
        You are "Friend", a helpful and friendly AI chatbot for the PDF Summarization App called PulseSynth.
        Your goal is to help users interact with their documents and understand the app's features.
        
        Guidelines:
        1. Maintain a natural, friendly, and conversational tone.
        2. Be concise but informative.
        3. If a PDF context is provided, answer specifically based on that document.
        4. If no PDF is uploaded, you can still help with general questions or explain how to use the app.
        5. Current Date: ${new Date().toLocaleDateString()}.
        
        ${pdfContext ? `CONTEXT DOCUMENT: "${fileName}"\nCONTENT:\n${pdfContext.substring(0, 15000)}` : "No document is currently uploaded."}
      `;

      // Use chat mode to maintain history
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction
          }
        });
      }

      const response = await chatRef.current.sendMessageStream({
        message: input
      });

      let assistantMessageContent = "";
      const assistantMessageId = (Date.now() + 1).toString();

      // Initial empty message for the assistant
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      for await (const chunk of response) {
        assistantMessageContent += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: assistantMessageContent }
            : msg
        ));
      }

    } catch (err: any) {
      console.error("Chatbot Error:", err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const suggestionChips = [
    "What are this document's top three points?",
    "Explain this PDF in simple language",
    "Summarize this file in bullet points",
    "What is this document about?"
  ];

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend(undefined, suggestion);
  };

  // Dedicated function for suggestion clicks to ensure it uses the latest text
  const submitSuggestion = (text: string) => {
    setInput(text);
    // Since state update is async, we pass the text directly to a specialized send function if needed
    // or just let the user see it in the box then hit send. 
    // Usually users expect immediate send on click.
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "mb-4 w-[90vw] md:w-[400px] h-[550px] rounded-[2.5rem] border shadow-2xl flex flex-col overflow-hidden",
              isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-6 border-b flex items-center justify-between shrink-0",
              isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-100"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight uppercase">AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <Minimize2 size={18} className="text-zinc-500" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'assistant' ? (
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Assistant</span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">You</span>
                    )}
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-orange-500 text-white rounded-tr-none shadow-lg shadow-orange-500/20" 
                      : (isDarkMode ? "bg-zinc-900 border border-zinc-800 rounded-tl-none" : "bg-zinc-100 rounded-tl-none")
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col gap-2 items-start max-w-[85%]">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Assistant</span>
                    </div>
                  <div className={cn(
                    "p-4 rounded-3xl rounded-tl-none",
                    isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-zinc-100"
                  )}>
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* Suggestions */}
              {messages.length === 1 && !isTyping && (
                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestionChips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(chip)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[11px] font-semibold text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                          isDarkMode ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400" : "bg-zinc-50 border border-zinc-200 hover:bg-white hover:shadow-sm text-zinc-500"
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Context Indicator */}
            {pdfContext && (
               <div className={cn(
                 "px-6 py-2 border-t text-[10px] font-bold flex items-center gap-2",
                 isDarkMode ? "bg-zinc-900/30 border-zinc-800 text-orange-500/70" : "bg-orange-500/5 border-orange-500/10 text-orange-600"
               )}>
                 <FileText size={10} />
                 Analyzing: {fileName}
               </div>
            )}

            {/* Input */}
            <form 
              onSubmit={handleSend}
              className={cn(
                "p-6 border-t flex gap-2 shrink-0 bg-transparent",
                isDarkMode ? "border-zinc-800" : "border-zinc-100"
              )}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your assistant..."
                className={cn(
                  "flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium",
                  isDarkMode ? "placeholder:text-zinc-700" : "placeholder:text-zinc-400"
                )}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className={cn(
                  "p-2.5 rounded-xl transition-all disabled:opacity-30",
                  input.trim() ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-105" : "text-zinc-400"
                )}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all relative",
          isOpen ? "bg-zinc-900 text-white" : "bg-orange-500 text-white shadow-orange-500/25"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Minimize2 size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
               <Sparkles size={28} />
               {pdfContext && (
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-orange-500" />
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
