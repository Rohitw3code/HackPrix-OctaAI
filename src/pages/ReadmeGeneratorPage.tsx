import React, { useState } from 'react';
import { X, Github, Sparkles, Copy, Download, Edit3, Eye, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Basic URL validation
    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate', {
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
        setIsEditing(false);
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
      // You could add a toast notification here
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
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-slate-800/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/50 bg-black/60 backdrop-blur-sm">
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
                  <p className="text-sm text-slate-400">Generate beautiful documentation for any GitHub repository</p>
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

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Panel - Input Form */}
        <div className="w-full lg:w-1/3 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800/50 bg-black/40">
          <div className="space-y-4 sm:space-y-6">
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

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col bg-black/20">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/50 bg-black/40">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">README Preview</h3>
              {generatedReadme && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                    title={isEditing ? 'Preview Mode' : 'Edit Mode'}
                  >
                    {isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
                  </button>
                </div>
              )}
            </div>
            
            {generatedReadme && (
              <div className="flex items-center space-x-2">
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

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">
            {!generatedReadme ? (
              <div className="h-full flex items-center justify-center p-8">
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
              <div className="h-full overflow-auto">
                {isEditing ? (
                  <textarea
                    value={generatedReadme}
                    onChange={(e) => setGeneratedReadme(e.target.value)}
                    className="w-full h-full p-4 sm:p-6 bg-transparent text-white font-mono text-sm resize-none focus:outline-none border-none"
                    placeholder="Your README content will appear here..."
                  />
                ) : (
                  <div className="p-4 sm:p-6">
                    <div className="prose prose-invert prose-slate max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-mono bg-black/40 p-4 rounded-xl border border-slate-800/50 overflow-x-auto">
                        {generatedReadme}
                      </pre>
                    </div>
                  </div>
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