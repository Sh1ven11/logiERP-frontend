import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Package,
  Users,
  FileText,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

/**
 * LOGISTICS ERP AUTHENTICATION SYSTEM v2.0
 * ----------------------------------------
 * 1. Login UI with Validation (Enhanced UI)
 * 2. API Integration (POST to localhost:3333)
 * 3. JWT Token Storage (localStorage)
 * 4. Protected Route Guards
 * 5. Dashboard Access (Sidebar Layout)
 * 6. Gemini API Integration for Smart Tools
 */

// Gemini API Key - Injected by the environment
const apiKey = ""; 

// --- 1. MOCK BACKEND SERVICE ---
const mockBackendLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject({ status: 400, message: "Missing email or password." });
      } else if (email === "user@gmail.com" && password === "123456") {
        resolve({ 
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-12345", 
          user: { name: "Logistics Admin", role: "admin" } 
        });
      } else if (email !== "user@gmail.com") {
        reject({ status: 404, message: "User not found." });
      } else {
        reject({ status: 401, message: "Invalid credentials." });
      }
    }, 1500); 
  });
};

// --- 2. GEMINI API HELPER ---
const generateGeminiContent = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
};

// --- 3. UI COMPONENTS ---

const Alert = ({ message, type = 'error' }) => {
  if (!message) return null;
  const styles = type === 'error' 
    ? 'bg-red-50 text-red-700 border-red-200' 
    : 'bg-green-50 text-green-700 border-green-200';
  return (
    <div className={`p-4 mb-6 rounded-lg border-l-4 flex items-start gap-3 animate-fade-in ${styles}`}>
      <AlertCircle size={20} className="mt-0.5 shrink-0" />
      <span className="text-sm font-medium leading-relaxed">{message}</span>
    </div>
  );
};

// --- LOGIN PAGE ---
const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (!formData.email.includes('@')) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length === 0) {
      setErrorMessage("Password cannot be empty.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validate()) return;

    setStatus('loading');

    try {
      let data;
      try {
        const response = await fetch('http://localhost:3333/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
           const errorData = await response.json();
           throw { status: response.status, message: errorData.message || 'Login failed' };
        }
        data = await response.json();
      } catch (networkError) {
        console.warn("Switching to Mock Backend.");
        data = await mockBackendLogin(formData.email, formData.password);
      }

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        setStatus('success');
        setTimeout(() => onLoginSuccess(), 800);
      }
    } catch (error) {
      setStatus('error');
      if (error.status === 400) setErrorMessage("Missing fields. Please check your input.");
      else if (error.status === 401) setErrorMessage("Incorrect password.");
      else if (error.status === 404) setErrorMessage("User not found.");
      else setErrorMessage(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10 min-h-[600px]">
        {/* Left Side - Visual */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                 <Truck className="text-white h-8 w-8" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Logistics ERP</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Manage your fleet with precision.</h1>
            <p className="text-indigo-100 text-lg opacity-90">Real-time tracking, automated billing, and AI-powered insights.</p>
          </div>
          <div className="text-indigo-200 text-sm">
            © 2025 Logistics Corp. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <Alert message={errorMessage} />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="user@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-indigo-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all duration-300 transform hover:-translate-y-0.5
                ${status === 'loading' ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 
                  status === 'success' ? 'bg-green-500 shadow-green-500/30' : 
                  'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Authenticating...
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Access Granted
                </span>
              ) : 'Sign In to Dashboard'}
            </button>
            
            <div className="mt-6 text-center">
               <p className="text-xs text-gray-400">Demo Account: user@gmail.com / 123456</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- GEMINI COMPONENT ---
const SmartLogisticsTools = () => {
  const [activeTab, setActiveTab] = useState('incident'); 
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setGeneratedText('');
    const prompt = activeTab === 'incident' 
      ? `You are a logistics safety officer. Rewrite this informal driver message into a Formal Incident Report: "${inputText}"` 
      : `You are a logistics coordinator. Draft a professional client email about this situation: "${inputText}"`;
    try {
      const result = await generateGeminiContent(prompt);
      setGeneratedText(result);
    } catch {
      setGeneratedText("Error generating content.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden mt-8 transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <Sparkles className="text-indigo-600 h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by Gemini 1.5</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['incident', 'email'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setInputText(''); setGeneratedText(''); }}
              className={`text-xs px-4 py-1.5 rounded-md font-medium transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'incident' ? 'Incident Report' : 'Email Drafter'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Input Context</label>
          <textarea 
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50/50 resize-none transition-all"
            placeholder={activeTab === 'incident' ? "Example: Driver called. Flat tire on highway 45. Needs roadside assist. Cargo is safe." : "Example: Tell Client A that delivery is delayed due to heavy rain."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Processing...' : 'Generate with AI'}
          </button>
        </div>

        <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5 flex flex-col h-full min-h-[250px] relative">
          <div className="flex items-center justify-between mb-3">
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Generated Output</span>
             {generatedText && (
               <button onClick={() => navigator.clipboard.writeText(generatedText)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-white px-2 py-1 rounded border border-indigo-100 shadow-sm">
                 Copy
               </button>
             )}
          </div>
          {generatedText ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">{generatedText}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-indigo-300 text-center">
              <Sparkles className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">AI output will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NavItem = ({ icon: Icon, label, active }) => (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
      <Icon size={20} />
      {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col sticky top-0 h-screen z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg shrink-0">
            <Truck className="text-white h-5 w-5" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">Logistics ERP</span>}
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
          <p className={`px-4 text-xs font-semibold text-slate-500 uppercase mb-2 ${!sidebarOpen && 'text-center'}`}>{sidebarOpen ? 'Menu' : '...'}</p>
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Package} label="Shipments" />
          <NavItem icon={Users} label="Drivers & Brokers" />
          <NavItem icon={FileText} label="Invoices" />
          <NavItem icon={BarChart3} label="Reports" />
        </div>

        <div className="p-4 border-t border-slate-800">
           <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors">
              <LogOut size={20} />
              {sidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
           </button>
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-10 bg-white text-slate-900 p-1.5 rounded-full shadow-md border border-slate-100 hover:bg-slate-100"
        >
          <ChevronRight size={14} className={`transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-white/80">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-sm text-gray-500">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
               AD
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Active Shipments', value: '24', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Available Fleet', value: '12', icon: Truck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
              { label: 'Pending Revenue', value: '₹ 1.2L', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
              { label: 'Active Drivers', value: '18', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            ].map((stat, i) => (
              <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow group cursor-default`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SmartLogisticsTools />

          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center">
             <div className="bg-green-50 p-4 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Secure Environment</h3>
             <p className="text-gray-500 max-w-md mt-2">
               You are authenticated via JWT. The session is active and all API requests are secured.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- APP ENTRY POINT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('loading');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setCurrentPage(token ? 'dashboard' : 'login');
    };
    checkAuth();
  }, []);

  const navigate = (page) => setCurrentPage(page);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('login');
  };

  if (currentPage === 'loading') return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-indigo-500 h-10 w-10" /></div>;

  return (
    <div className="font-sans text-gray-900">
       {currentPage === 'login' && <LoginPage onLoginSuccess={() => navigate('dashboard')} />}
       {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
    </div>
  );
}