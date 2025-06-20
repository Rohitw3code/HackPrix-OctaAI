import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Github,
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  X,
  FolderTree,
  Link,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from './creds';

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

interface RepoTreeResponse {
  success: boolean;
  data: {
    owner: string;
    repo: string;
    tree_structure: string;
    url: string;
  };
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
  const [showRepoInput, setShowRepoInput] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; repo: string; url: string } | null>(null);
  const [repoTree, setRepoTree] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddRepository = async () => {
    if (!repoUrl.trim()) return setError('Please enter a GitHub repository URL');
    if (!repoUrl.includes('github.com')) return setError('Please enter a valid GitHub repository URL');

    setIsLoadingTree(true);
    setError('');

    try {
      const treeResponse = await fetch(`${baseUrl}/api/tree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl.trim() })
      });
      if (!treeResponse.ok) throw new Error(`HTTP error! status: ${treeResponse.status}`);
      const treeData: RepoTreeResponse = await treeResponse.json();
      if (!treeData.success) throw new Error(treeData.error || 'Failed to load repository tree');

      const setRepoResponse = await fetch(`${baseUrl}/api/set-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl.trim() })
      });
      if (!setRepoResponse.ok) console.warn('Failed to initialize chat context, but tree loaded');

      setCurrentRepo({ owner: treeData.data.owner, repo: treeData.data.repo, url: treeData.data.url });
      setRepoTree(treeData.data.tree_structure);
      setShowRepoInput(false);
      setRepoUrl('');
      setIsDrawerOpen(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content: `Repository "${treeData.data.owner}/${treeData.data.repo}" loaded! Ask me anything about it.`,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository. Please try again.');
    } finally {
      setIsLoadingTree(false);
    }
  };

  const handleRemoveRepository = () => {
    setCurrentRepo(null);
    setRepoTree('');
    setSourceDocuments([]);
    setIsDrawerOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Repository removed. Add a new one to continue chatting.',
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, repo_url: currentRepo?.url })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: ApiResponse = await response.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: data.answer, timestamp: new Date() }]);
      setSourceDocuments(data.source_documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing your request.');
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
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

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-slate-800/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Fixed Header */}
      <div className="relative z-30 border-b border-slate-800/50 bg-black/60 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-700 to-slate-800 rounded-lg sm:rounded-xl shadow-lg shadow-black/50">
                  <MessageSquare size={16} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden xs:block">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Repository Chat</h1>
                  <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Ask questions about any GitHub repository in natural language</p>
                </div>
                <div className="xs:hidden">
                  <h1 className="text-base font-bold text-white">Chat</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Add Repository Button - Visible when no repo is loaded */}
              {!currentRepo && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="md:hidden p-1.5 sm:p-2 bg-gradient-to-r from-slate-700 to-gray-700 text-white rounded-lg transition-all duration-200 hover:from-slate-800 hover:to-gray-800"
                  title="Add Repository"
                >
                  <Plus size={16} className="sm:w-4 sm:h-4" />
                </button>
              )}
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-slate-700 to-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-black/50 cursor-pointer" onClick={() => navigate('/')}>
                <Github size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* Fixed Repository Sidebar (Desktop) / Drawer (Mobile) */}
        <div className={`fixed inset-y-0 left-0 w-72 sm:w-80 border-r border-slate-800/50 bg-black/40 backdrop-blur-sm flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} z-80`}>
          {/* Sidebar Header */}
          <div className="sticky top-0 z-10 p-3 sm:p-4 lg:p-6 border-b border-slate-800/50 bg-black/60 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderTree size={16} className="sm:w-5 sm:h-5 text-slate-400" />
              <h3 className="text-sm sm:text-base font-semibold text-white">Repository</h3>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {!showRepoInput && (
                <button
                  onClick={() => setShowRepoInput(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  title="Add Repository"
                >
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Repository Input Section */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-800/30">
              {showRepoInput ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <Github size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="w-full pl-10 pr-4 py-3 bg-black/60 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200"
                        disabled={isLoadingTree}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddRepository}
                      disabled={isLoadingTree || !repoUrl.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-slate-800 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoadingTree ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add Repository</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowRepoInput(false);
                        setRepoUrl('');
                      }}
                      className="px-3 py-3 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600/50 rounded-lg transition-all duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentRepo ? (
                    <div className="bg-black/60 border border-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Github size={16} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white truncate">
                            {currentRepo.owner}/{currentRepo.repo}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveRepository}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove Repository"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <a
                        href={currentRepo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        <Link size={12} className="flex-shrink-0" />
                        <span className="truncate">View on GitHub</span>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl flex items-center justify-center">
                        <Github size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">No Repository Added</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          Add a GitHub repository to start chatting about its codebase.
                        </p>
                        <button
                          onClick={() => setShowRepoInput(true)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-slate-800 hover:to-gray-800 transition-all duration-200"
                        >
                          <Plus size={16} />
                          <span>Add Repository</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Project Structure Section */}
            {repoTree && (
              <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-800/30">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center space-x-2">
                    <FolderTree size={14} />
                    <span>Project Structure</span>
                  </h4>
                  <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-slate-800/50 overflow-x-auto max-h-64">
                    {repoTree}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Source Documents Section */}
            {sourceDocuments.length > 0 && (
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center space-x-2">
                    <FileText size={14} />
                    <span>Source Documents</span>
                  </h4>
                  <div className="space-y-2">
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
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 sm:space-y-6 max-w-sm sm:max-w-md px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-r from-gray-700 to-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-black/50">
                    <Bot size={24} className="sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Start a Conversation</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {currentRepo 
                        ? `Ask me anything about the ${currentRepo.owner}/${currentRepo.repo} repository! I can help you understand code structure, explain functionality, or answer questions about the project.`
                        : 'Add a GitHub repository from the sidebar to start chatting about its codebase. I can help you understand code structure, explain functionality, or answer questions about any project.'
                      }
                    </p>
                  </div>
                  {!currentRepo && (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="md:hidden flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-gray-800 transition-all duration-200"
                    >
                      <Plus size={18} />
                      <span>Add Repository</span>
                    </button>
                  )}
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
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] lg:max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-slate-700 to-gray-700' 
                          : 'bg-gradient-to-r from-gray-700 to-slate-800'
                      }`}>
                        {message.type === 'user' ? (
                          <User size={14} className="sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                        )}
                      </div>
                      <div className={`flex flex-col space-y-1 min-w-0 flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl max-w-full break-words ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-slate-700 to-gray-700 text-white'
                            : 'bg-black/60 backdrop-blur-sm border border-slate-800/50 text-slate-200'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
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
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-[85%] lg:max-w-3xl">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-700 to-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/50">
                        <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="bg-black/60 backdrop-blur-sm border border-slate-800/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin text-slate-400" />
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

          {/* Fixed Bottom Area: Error Message and Input */}
          <div className="flex-shrink-0 flex flex-col bg-black/40 backdrop-blur-sm border-t border-slate-800/50">
            {error && (
              <div className="px-3 sm:px-4 lg:px-6 py-2">
                <div className="flex items-center space-x-2 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              </div>
            )}
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="flex-1 relative min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={currentRepo ? `Ask about ${currentRepo.owner}/${currentRepo.repo}...` : "Add a repository to start chatting..."}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 bg-black/60 border border-slate-700/50 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200 text-sm sm:text-base"
                    disabled={isLoading || !currentRepo}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || !currentRepo}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-700 to-slate-800 text-white rounded-lg sm:rounded-xl hover:from-gray-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg shadow-black/50 flex items-center justify-center flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send size={16} className="sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Drawer on Mobile */}
      {isDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-70"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;