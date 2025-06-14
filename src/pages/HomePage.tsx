import React, { useState, useEffect } from 'react';
import { Github, FileText, MessageSquare, Star, Zap, ArrowRight, Code2, Menu, X, Users, BookOpen, GitBranch, Terminal, Cpu, Database, ChevronDown, Sparkles, Bot, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<'readme' | 'chat' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const codeSnippets = [
    "// AI-powered README generator",
    "const generateReadme = async (repoUrl) => {",
    "  const analysis = await ai.analyzeRepository(repoUrl);",
    "  const readme = await ai.generateReadme({",
    "    structure: analysis.detectStructure(),",
    "    dependencies: analysis.getDependencies(),",
    "    features: analysis.extractFeatures()",
    "  });",
    "  return readme.beautify();",
    "};"
  ];

  const handleGenerateReadmeClick = () => {
    navigate('/readme-generator');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-slate-800/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gray-800/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-slate-900/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Code Elements - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute top-32 right-20 opacity-15 font-mono text-xs xl:text-sm text-slate-400 animate-float-code">
          <div className="bg-black/60 p-2 xl:p-3 rounded-lg border border-slate-700/30">
            git-ai generate README.md
          </div>
        </div>
        <div className="absolute bottom-40 left-16 opacity-15 font-mono text-xs xl:text-sm text-gray-400 animate-float-code" style={{ animationDelay: '3s' }}>
          <div className="bg-black/60 p-2 xl:p-3 rounded-lg border border-gray-700/30">
            "Explain this repository to me"
          </div>
        </div>
        <div className="absolute top-1/2 right-32 opacity-15 font-mono text-xs xl:text-sm text-slate-500 animate-float-code" style={{ animationDelay: '6s' }}>
          <div className="bg-black/60 p-2 xl:p-3 rounded-lg border border-slate-700/30">
            {"{ readme: 'generated ✨' }"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/95 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-black/50">
                  <Github size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-slate-500 rounded-full flex items-center justify-center">
                  <Sparkles size={8} className="sm:w-2.5 sm:h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Git-ai
                </h1>
                <p className="text-xs text-slate-400 -mt-1 hidden sm:block">README Generator</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group">
                <Zap size={16} className="group-hover:text-slate-400 transition-colors" />
                <span>Features</span>
              </a>
              <a href="#docs" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group">
                <BookOpen size={16} className="group-hover:text-gray-400 transition-colors" />
                <span>Documentation</span>
              </a>
              <a href="#community" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group">
                <Users size={16} className="group-hover:text-slate-400 transition-colors" />
                <span>Community</span>
              </a>
              <a href="#github" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group">
                <Github size={16} className="group-hover:text-gray-400 transition-colors" />
                <span>GitHub</span>
              </a>
            </div>

            {/* CTA & Mobile Menu */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={handleGenerateReadmeClick}
                className="hidden sm:flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-black/50 hover:shadow-black/70 text-sm lg:text-base"
              >
                <Sparkles size={16} className="lg:w-5 lg:h-5" />
                <span>Generate README</span>
                <ArrowRight size={14} className="lg:w-4 lg:h-4" />
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 sm:py-6 border-t border-slate-800/50 bg-black/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <a href="#features" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-3 py-2">
                  <Zap size={16} />
                  <span>Features</span>
                </a>
                <a href="#docs" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-3 py-2">
                  <BookOpen size={16} />
                  <span>Documentation</span>
                </a>
                <a href="#community" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-3 py-2">
                  <Users size={16} />
                  <span>Community</span>
                </a>
                <a href="#github" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-3 py-2">
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                <button 
                  onClick={handleGenerateReadmeClick}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-semibold rounded-xl mt-4 w-full justify-center shadow-lg shadow-black/50"
                >
                  <Sparkles size={18} />
                  <span>Generate README</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                {/* Status Badge */}
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-slate-800/50">
                  <div className="w-2 h-2 bg-slate-500 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
                  <Sparkles size={14} className="sm:w-4 sm:h-4 text-slate-400 mr-1 sm:mr-2" />
                  <span className="text-slate-300 text-xs sm:text-sm font-medium">AI-Powered README Generator</span>
                </div>
                
                {/* Main Heading */}
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="text-white">Generate</span>
                    <br />
                    <span className="bg-gradient-to-r from-slate-400 via-gray-400 to-slate-300 bg-clip-text text-transparent">
                      Beautiful
                    </span>
                    <br />
                    <span className="text-white">READMEs</span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Transform any GitHub repository into professional documentation instantly. 
                    Generate stunning README files and chat with your repos in natural language - perfect for beginners and experts alike.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={handleGenerateReadmeClick}
                    className="group flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-bold rounded-xl hover:from-slate-800 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-black/50 hover:shadow-black/70"
                  >
                    <Sparkles size={18} className="sm:w-5 sm:h-5" />
                    <span>Generate README</span>
                    <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={handleChatClick}
                    className="group flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-black/60 backdrop-blur-sm border border-slate-800/50 text-white font-semibold rounded-xl hover:bg-black/80 transition-all duration-200"
                  >
                    <Bot size={16} className="sm:w-5 sm:h-5" />
                    <span>Try Chat Feature</span>
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-8 pt-6 sm:pt-8">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FileCode className="text-green-400" size={16} />
                    <span className="text-white font-semibold text-sm sm:text-base">10k+</span>
                    <span className="text-slate-400 text-sm">READMEs</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <MessageSquare className="text-slate-400" size={16} />
                    <span className="text-white font-semibold text-sm sm:text-base">50k+</span>
                    <span className="text-slate-400 text-sm">queries</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Users className="text-gray-400" size={16} />
                    <span className="text-white font-semibold text-sm sm:text-base">5.2k</span>
                    <span className="text-slate-400 text-sm">users</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Code Preview */}
              <div className="relative mt-8 lg:mt-0">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl shadow-black/50">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-black/80 border-b border-slate-800/50">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex space-x-1 sm:space-x-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-400 text-xs sm:text-sm font-mono">readme-generator.js</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Sparkles size={14} className="sm:w-4 sm:h-4 text-slate-400" />
                      <span className="text-slate-400 text-xs sm:text-sm">Generating</span>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto">
                    {codeSnippets.map((line, index) => (
                      <div key={index} className="flex items-center space-x-2 sm:space-x-4 py-0.5 sm:py-1 whitespace-nowrap">
                        <span className="text-slate-600 w-4 sm:w-6 text-right flex-shrink-0">{line ? index + 1 : ''}</span>
                        <span className={`${
                          line.includes('const') || line.includes('await') || line.includes('async') ? 'text-slate-400' :
                          line.includes('//') ? 'text-slate-600' :
                          line.includes("'") || line.includes('"') ? 'text-green-400' :
                          line.includes('{') || line.includes('}') ? 'text-yellow-400' :
                          'text-slate-200'
                        }`}>
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Output */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-black/60 border-t border-slate-800/50">
                    <div className="flex items-center space-x-2 text-green-400 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>✨ Beautiful README.md generated successfully</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements - Responsive sizing */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-gradient-to-r from-slate-700 to-gray-700 p-2 sm:p-3 rounded-xl shadow-lg shadow-black/50 animate-bounce-slow">
                  <FileText size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-gradient-to-r from-gray-700 to-slate-800 p-2 sm:p-3 rounded-xl shadow-lg shadow-black/50 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                  <Bot size={20} className="sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Powerful Features for
                <span className="bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent"> Every Developer</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto">
                From beautiful README generation to natural language repository exploration - everything you need to make your GitHub projects shine.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* README Generator */}
              <div 
                className={`group relative p-6 sm:p-8 bg-black/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl hover:border-slate-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  activeFeature === 'readme' ? 'ring-2 ring-slate-600/50 border-slate-600/50 bg-black/60' : ''
                }`}
                onClick={() => setActiveFeature(activeFeature === 'readme' ? null : 'readme')}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl shadow-lg shadow-black/50">
                    <FileText size={24} className="sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Beautiful README Generator</h3>
                </div>
                
                <p className="text-slate-200 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Transform any GitHub repository into a stunning, professional README file. Our AI analyzes your code structure, 
                  dependencies, and features to create comprehensive documentation that attracts contributors and users.
                </p>
                
                <div className="flex items-center text-slate-400 group-hover:text-slate-300 transition-colors">
                  <span className="mr-2 font-semibold text-sm sm:text-base">Generate Now</span>
                  <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Natural Language Chat */}
              <div 
                className={`group relative p-6 sm:p-8 bg-black/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl hover:border-gray-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  activeFeature === 'chat' ? 'ring-2 ring-gray-600/50 border-gray-600/50 bg-black/60' : ''
                }`}
                onClick={() => setActiveFeature(activeFeature === 'chat' ? null : 'chat')}
              >
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-700 to-slate-800 rounded-xl shadow-lg shadow-black/50">
                    <MessageSquare size={24} className="sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Natural Language Chat</h3>
                </div>
                
                <p className="text-slate-200 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Chat with any GitHub repository in plain English! Perfect for beginners and non-technical users who want to understand 
                  codebases, ask questions about functionality, or explore project architecture without diving into code.
                </p>
                
                <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <span className="mr-2 font-semibold text-sm sm:text-base">Try Chat</span>
                  <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature Details */}
            {activeFeature && (
              <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-black/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
                {activeFeature === 'readme' ? (
                  <div>
                    <div className="flex items-center mb-4 sm:mb-6">
                      <Sparkles size={20} className="sm:w-6 sm:h-6 text-slate-400 mr-2 sm:mr-3" />
                      <h4 className="text-xl sm:text-2xl font-bold text-white">README Generation Features</h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Automatic project structure analysis</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-slate-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Smart dependency detection</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Beautiful formatting & badges</span>
                        </div>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Installation & usage guides</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Contributing guidelines</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Professional templates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-4 sm:mb-6">
                      <Bot size={20} className="sm:w-6 sm:h-6 text-gray-400 mr-2 sm:mr-3" />
                      <h4 className="text-xl sm:text-2xl font-bold text-white">Natural Language Chat Features</h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Ask "What does this project do?"</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-slate-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Beginner-friendly explanations</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Code architecture insights</span>
                        </div>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Feature explanations</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Technology stack breakdown</span>
                        </div>
                        <div className="flex items-center text-slate-200 text-sm sm:text-base">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                          <span>Non-technical friendly</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-black/50">
                <Github size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold text-base sm:text-lg">Git-ai</span>
                <p className="text-slate-400 text-xs sm:text-sm">© 2025 - Beautiful README Generator & Repository Chat</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">
                "Making GitHub repositories accessible to everyone"
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;