import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Github, Send, Bot, User, Loader2, MessageSquare, FileText, Sparkles, AlertCircle, Plus, X, FolderTree, Link } from 'lucide-react';
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
  const [currentRepo, setCurrentRepo] = useState<{owner: string, repo: string, url: string} | null>(null);
  const [repoTree, setRepoTree] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddRepository = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoadingTree(true);
    setError('');

    try {
      const treeResponse = await fetch('http://127.0.0.1:5000/api/tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: repoUrl.trim()
        }),
      });

      if (!treeResponse.ok) {
        throw new Error(`HTTP error! status: ${treeResponse.status}`);
      }

      const treeData: RepoTreeResponse = await treeResponse.json();
      
      if (!treeData.success) {
        throw new Error(treeData.error || 'Failed to load repository tree');
      }

      const setRepoResponse = await fetch('http://127.0.0.1:5000/api/set-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: repoUrl.trim()
        }),
      });

      if (!setRepoResponse.ok) {
        console.warn('Failed to initialize chat context, but tree structure loaded');
      }

      setCurrentRepo({
        owner: treeData.data.owner,
        repo: treeData.data.repo,
        url: treeData.data.url
      });
      setRepoTree(treeData.data.tree_structure);
      setShowRepoInput(false);
      setRepoUrl('');
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Repository "${treeData.data.owner}/${treeData.data.repo}" has been loaded successfully! You can now ask questions about this repository.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);

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
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Repository has been removed. You can add a new repository to start chatting about it.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

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
          query: userMessage.content,
          repo_url: currentRepo?.url
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-slate-800/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Fixed Header */}
      <div className="relative z-20 border-b border-slate-800/50 bg-black/60 backdrop-blur-sm flex-shrink-0">
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

      {/* Main Content Area */}
      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* Fixed Repository Tree Sidebar */}
        <div className="w-80 border-r border-slate-800/50 bg-black/40 backdrop-blur-sm flex flex-col flex-shrink-0">
          <div className="p-4 sm:p-6 border-b border-slate-800/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderTree size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Repository</h3>
              </div>
              {!showRepoInput && (
                <button
                  onClick={() => setShowRepoInput(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  title="Add Repository"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {showRepoInput && (
              <div className="space-y-3">
                <div className="relative">
                  <Github size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full pl-9 pr-4 py-2 bg-black/60 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-400 focus:border-slate-600 focus:ring-1 focus:ring-slate-600/20 focus:outline-none transition-all duration-200"
                    disabled={isLoadingTree}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddRepository}
                    disabled={isLoadingTree || !repoUrl.trim()}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-slate-700 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-slate-800 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoadingTree ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRepoInput(false);
                      setRepoUrl('');
                    }}
                    className="px-3 py-2 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600/50 rounded-lg transition-all duration-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {currentRepo && (
              <div className="bg-black/60 border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Github size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-white truncate">
                      {currentRepo.owner}/{currentRepo.repo}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveRepository}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove Repository"
                  >
                    <X size={12} />
                  </button>
                </div>
                <a
                  href={currentRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <Link size={10} />
                  <span className="truncate">View on GitHub</span>
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {repoTree ? (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Project Structure
                </h4>
                <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-slate-800/50 overflow-x-auto">
                  {repoTree}
                </pre>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl flex items-center justify-center">
                  <FolderTree size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">No Repository</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Add a GitHub repository to see its structure and start chatting about the codebase.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area with Source Documents */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 overflow-hidden">
            {/* Chat Messages */}
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
                          {currentRepo 
                            ? `Ask me anything about the ${currentRepo.owner}/${currentRepo.repo} repository! I can help you understand code structure, explain functionality, or answer questions about the project.`
                            : 'Add a GitHub repository from the sidebar to start chatting about its codebase. I can help you understand code structure, explain functionality, or answer questions about any project.'
                          }
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

              {/* Fixed Bottom Area: Error Message and Input */}
              <div className="flex-shrink-0 flex flex-col bg-black/40 backdrop-blur-sm border-t border-slate-800/50">
                {error && (
                  <div className="px-4 sm:px-6 py-2">
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex space-x-3 sm:space-x-4">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={currentRepo ? `Ask about ${currentRepo.owner}/${currentRepo.repo}...` : "Add a repository to start chatting..."}
                        className="w-full px-4 py-3 pr-12 bg-black/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200"
                        disabled={isLoading || !currentRepo}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || !currentRepo}
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
            </div>

            {/* Fixed Source Documents Panel */}
            {sourceDocuments.length > 0 && (
              <div className="w-80 border-l border-slate-800/50 bg-black/40 backdrop-blur-sm flex flex-col flex-shrink-0">
                <div className="p-4 sm:p-6 border-b border-slate-800/50 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-slate-400" />
                    <h3 className="text-sm font-semibold text-white">Source Documents</h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
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
    </div>
  );
};

export default ChatPage;