import React, { useState } from 'react';
import { X, Github, Sparkles, Copy, Download, Edit3, Eye, Loader2, AlertCircle, CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { baseUrl } from './creds';

interface ApiResponse {
  success: boolean;
  data: {
    readme_md: string;
  };
}

const ReadmeGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [optionalMessage, setOptionalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'markdown'>('edit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For mobile navigation

  const handleGenerate = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${baseUrl}api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: repoUrl.trim(),
          message: optionalMessage.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success && data.data.readme_md) {
        setGeneratedReadme(data.data.readme_md);
        setSuccess(true);
        setViewMode('preview');
        setShowPreview(true); // Show preview on mobile after generation
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate README. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReadme);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setRepoUrl('');
    setOptionalMessage('');
    setGeneratedReadme('');
    setError('');
    setSuccess(false);
    setViewMode('edit');
    setShowPreview(false);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="relative z-10 border-b border-slate-800/50 bg-black/60 backdrop-blur-sm flex-shrink-0">
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
                <div className="p-2 bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl shadow-lg shadow-black/50">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">README Generator</h1>
                  <p className="text-sm text-slate-400 hidden sm:block">Generate beautiful documentation for any GitHub repository</p>
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Input Form (Desktop) / Conditional Mobile */}
        <div className={`${showPreview ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-slate-800/50 bg-black/40 flex-col flex-shrink-0`}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* GitHub URL Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                GitHub Repository URL *
              </label>
              <div className="relative">
                <Github size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Optional Message */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Any specific requirements or focus areas for the README..."
                rows={3}
                className="w-full px-4 py-3 bg-black/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 focus:outline-none transition-all duration-200 resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">README generated successfully!</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !repoUrl.trim()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg shadow-black/50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate README</span>
                </>
              )}
            </button>

            {/* Mobile View README Button */}
            {generatedReadme && (
              <button
                onClick={() => setShowPreview(true)}
                className="lg:hidden w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-slate-800 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-slate-900 transition-all duration-200"
              >
                <Eye size={18} />
                <span>View Generated README</span>
              </button>
            )}

            {/* Reset Button */}
            {(generatedReadme || error) && (
              <button
                onClick={handleReset}
                className="w-full px-6 py-2 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all duration-200"
              >
                Start Over
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview (Desktop) / Full Width when showing preview (Mobile) */}
        <div className={`${showPreview || !generatedReadme ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-black/20 min-w-0`}>
          {/* Fixed Preview Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/50 bg-black/40 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Mobile Back Button */}
              {generatedReadme && showPreview && (
                <button
                  onClick={handleBackToForm}
                  className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h3 className="text-lg font-semibold text-white truncate">README Output</h3>
              {generatedReadme && (
                <div className="flex items-center space-x-1 bg-black/60 rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'edit' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Edit3 size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'preview' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Eye size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    onClick={() => setViewMode('markdown')}
                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'markdown' 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <FileText size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1" />
                    <span className="hidden sm:inline">Raw</span>
                  </button>
                </div>
              )}
            </div>
            
            {generatedReadme && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  title="Copy to Clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  title="Download README.md"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Preview Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {!generatedReadme ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-slate-700 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-black/50">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Ready to Generate</h4>
                    <p className="text-slate-400 max-w-md">
                      Enter a GitHub repository URL and click "Generate README" to create beautiful documentation.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {viewMode === 'edit' ? (
                  <textarea
                    value={generatedReadme}
                    onChange={(e) => setGeneratedReadme(e.target.value)}
                    className="w-full min-h-[calc(100vh-300px)] p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/20 transition-all duration-200"
                    placeholder="Your README content will appear here..."
                  />
                ) : viewMode === 'preview' ? (
                  <div className="w-full max-w-none">
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none p-4 sm:p-6 bg-[#0d1117] border border-[#30363d] rounded-xl text-gray-300">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <div className="bg-[#161b22] border border-[#30363d] rounded-md my-2 overflow-hidden">
                                <div className="px-4 py-2 border-b border-[#30363d] text-sm text-gray-400">
                                  {match ? match[1] : 'code'}
                                </div>
                                <pre className="p-4 overflow-x-auto text-xs sm:text-sm">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code className="bg-[#161b22] text-gray-300 px-1.5 py-0.5 rounded text-xs sm:text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto my-4">
                                <table className="border-collapse border border-[#30363d] min-w-full text-sm">{children}</table>
                              </div>
                            );
                          },
                          th({ children }) {
                            return <th className="border border-[#30363d] px-3 py-2 bg-[#161b22] text-left text-xs sm:text-sm">{children}</th>;
                          },
                          td({ children }) {
                            return <td className="border border-[#30363d] px-3 py-2 text-xs sm:text-sm">{children}</td>;
                          },
                          a({ href, children }) {
                            return (
                              <a href={href} className="text-[#58a6ff] hover:underline break-words" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            );
                          },
                          img({ src, alt }) {
                            return <img src={src} alt={alt} className="max-w-full h-auto rounded-md my-2" />;
                          },
                          h1: ({ node, ...props }) => <h1 className="text-2xl sm:text-4xl font-bold my-4 break-words" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl sm:text-3xl font-bold my-3 break-words" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg sm:text-2xl font-bold my-2 break-words" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="text-base sm:text-xl font-bold my-2 break-words" {...props} />,
                          h5: ({ node, ...props }) => <h5 className="text-sm sm:text-lg font-bold my-2 break-words" {...props} />,
                          h6: ({ node, ...props }) => <h6 className="text-sm sm:text-base font-bold my-2 break-words" {...props} />,
                          p: ({ node, ...props }) => <p className="my-2 break-words text-sm sm:text-base leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="my-2 pl-4 sm:pl-6 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="my-2 pl-4 sm:pl-6 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm sm:text-base break-words" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[#30363d] pl-4 my-4 italic text-gray-400 text-sm sm:text-base" {...props} />
                        }}
                      >
                        {generatedReadme}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-300 leading-relaxed font-mono bg-[#0d1117] p-4 rounded-xl border border-[#30363d] overflow-x-auto break-words">
                    {generatedReadme}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadmeGeneratorPage;