import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Github, Send, Bot, User, Loader2, MessageSquare, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface SourceDocument {
  file_name: string;
  path: string;
}

interface ApiResponse {
  answer: string;
  source_documents: SourceDocument[];
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setSourceDocuments(data.source_documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-slate-800/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-black/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-gray-700 to-slate-800 rounded-xl shadow-lg shadow-black/50">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Repository Chat</h1>
                    <p className="text-sm text-slate-400">Ask questions about any GitHub repository in natural language</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-black/50 cursor-pointer" onClick={() => navigate('/')}>
                  <Github size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden flex">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/50">
                      <Bot size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
                      <p className="text-slate-400 leading-relaxed">
                        Ask me anything about GitHub repositories! I can help you understand code structure, 
                        explain functionality, or answer questions about any project.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">Try asking:</p>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 bg-black/40 px-3 py-2 rounded-lg border border-slate-800/50">
                          "What does this project do?"
                        </div>
                        <div className="text-xs text-slate-400 bg-black/40 px-3 py-2 rounded-lg border border-slate-800/50">
                          "How do I install and run this?"
                        </div>
                        <div className="text-xs text-slate-400 bg-black/40 px-3 py-2 rounded-lg border border-slate-800/50">
                          "What technologies are used?"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50 ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-slate-700 to-gray-700' 
                            : 'bg-gradient-to-r from-gray-700 to-slate-800'
                        }`}>
                          {message.type === 'user' ? (
                            <User size={16} className="text-white" />
                          ) : (
                            <Bot size={16} className="text-white" />
                          )}
                        </div>
                        
                        {/* Message Content */}
                        <div className={`flex flex-col space-y-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-2xl max-w-full ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-slate-700 to-gray-700 text-white'
                              : 'bg-black/60 backdrop-blur-sm border border-slate-800/50 text-slate-200'
                          }`}>
                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 px-2">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-3 max-w-3xl">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-black/60 backdrop-blur-sm border border-slate-800/50 px-4 py-3 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <Loader2 size={16} className="animate-spin text-slate-400" />
                            <span className="text-slate-400 text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 sm:px-6 pb-2">
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-slate-800/50 bg-black/40 backdrop-blur-sm p-4 sm:p-6">
              <div className="flex space-x-3 sm:space-x-4">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about GitHub repositories..."
                    className="w-full px-4 py-3 pr-12 bg-black/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-3 bg-gradient-to-r from-gray-700 to-slate-800 text-white rounded-xl hover:from-gray-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg shadow-black/50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Source Documents Panel */}
          {sourceDocuments.length > 0 && (
            <div className="w-80 border-l border-slate-800/50 bg-black/40 backdrop-blur-sm">
              <div className="p-4 sm:p-6 border-b border-slate-800/50">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-white">Source Documents</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {sourceDocuments.map((doc, index) => (
                  <div key={index} className="p-3 bg-black/60 border border-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText size={14} className="text-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-white truncate">{doc.file_name}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">{doc.path}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;