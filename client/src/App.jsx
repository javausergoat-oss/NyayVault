import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import CrossCaseRadar from './components/CrossCaseRadar';
import SmartSearch from './components/SmartSearch';
import DocumentTable from './components/DocumentTable';
import AuditTrailView from './components/AuditTrailView';
import CaseTimeline from './components/CaseTimeline';
import CaseSummary from './components/CaseSummary';
import Login from './components/Login';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from './hooks/useTranslation';
import { Users, Settings as SettingsIcon, ShieldCheck, Database, FileText } from 'lucide-react';
import { getCases, getCaseAuditTrail } from './services/api';

function AppContent() {
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [allCases, setAllCases] = useState([]);
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('sih_token');
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sih_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sih_theme', theme);
  }, [theme]);

  // Load user profile and global data if authenticated
  useEffect(() => {
    const token = localStorage.getItem('sih_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(data => {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        // Pre-fetch global cases
        getCases().then(res => setAllCases(res.cases || [])).catch(() => {});
        getCaseAuditTrail('case-56fd49f6').then(res => setAllAuditLogs(res.auditLogs || [])).catch(() => {});
      })
      .catch(() => {
        localStorage.removeItem('sih_token');
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    window.history.replaceState({ view: 'dashboard' }, '', '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_active_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveCaseId(null);
  };

  // Handle History API for browser navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.view === 'case' && event.state?.caseId) {
        setActiveCaseId(event.state.caseId);
        setActiveView('cases');
      } else if (event.state?.view) {
        setActiveView(event.state.view);
        setActiveCaseId(null);
      } else {
        setActiveCaseId(null);
        setActiveView('dashboard');
      }
    };

    if (window.location.hash.startsWith('#case/')) {
      const id = window.location.hash.split('/')[1];
      setActiveCaseId(id);
      setActiveView('cases');
      window.history.replaceState({ view: 'case', caseId: id }, '', window.location.hash);
    } else if (window.location.hash) {
      const view = window.location.hash.replace('#', '');
      setActiveView(view);
      window.history.replaceState({ view }, '', window.location.hash);
    } else {
      setActiveView('dashboard');
      window.history.replaceState({ view: 'dashboard' }, '', '/');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleCaseSelect = (id) => {
    if (!id) {
      setActiveCaseId(null);
      setActiveView('cases');
      window.history.pushState({ view: 'cases' }, '', '#cases');
      return;
    }
    setActiveCaseId(id);
    setActiveView('cases');
    window.history.pushState({ view: 'case', caseId: id }, '', `#case/${id}`);
  };

  const handleViewChange = (v) => {
    setActiveView(v);
    setActiveCaseId(null);
    window.history.pushState({ view: v }, '', `#${v}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderMainView = () => {
    if (activeCaseId) {
      return (
        <CaseDetail 
          caseId={activeCaseId} 
          onBack={() => {
            setActiveCaseId(null);
            setActiveView('cases');
            window.history.pushState({ view: 'cases' }, '', '#cases');
          }} 
          currentUser={currentUser}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            currentUser={currentUser} 
            onSelectCase={handleCaseSelect} 
            onViewChange={handleViewChange}
          />
        );
      case 'cases':
        return <CaseList onCaseSelect={handleCaseSelect} currentUser={currentUser} />;
      case 'evidence':
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Evidence Directory</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Repository of digital evidence documents across all active investigations.</p>
              </div>
            </div>
            <DocumentTable documents={[]} onRefresh={() => {}} />
          </div>
        );
      case 'search':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Semantic Search</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Search contextual facts, dates, and evidence snippets across all indexed case files.</p>
              </div>
            </div>
            <SmartSearch caseId={allCases[0]?.id || 'case-56fd49f6'} initialQuery={searchQuery} />
          </div>
        );
      case 'analysis':
        return <CrossCaseRadar />;
      case 'timeline':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Chronological Timeline</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological progression of evidence uploads and legal milestones.</p>
            </div>
            <CaseTimeline documents={[]} />
          </div>
        );
      case 'audit':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Audit Trail</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable chain of custody log detailing officer access, verifications, and uploads.</p>
            </div>
            <AuditTrailView logs={allAuditLogs} caseNumber="GLOBAL-AUDIT" />
          </div>
        );
      case 'reports':
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Case Briefs</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Synthesized investigation summaries for judicial review.</p>
            </div>
            {allCases[0] ? (
              <CaseSummary caseId={allCases[0].id} caseDetails={allCases[0]} />
            ) : (
              <div className="p-8 text-center text-slate-400">Select a specific case to generate executive briefs.</div>
            )}
          </div>
        );
      case 'users':
        return (
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Team Members & Access Control</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Authorized personnel for the Nyay Vault workspace.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Insp. Krishna Chhabra', role: 'Investigating Officer', badge: 'POL-1', status: 'Active' },
                { name: 'Insp. Rajesh Sharma', role: 'Investigating Officer', badge: 'POL-78219', status: 'Active' },
                { name: 'Hon. Justice Vatsal Singh', role: 'Judicial Officer', badge: 'JUD-1', status: 'Active' },
                { name: 'Adv. Priya Kapoor', role: 'Prosecutor', badge: 'ADV-2', status: 'Active' },
                { name: 'Adv. Vikram Singh', role: 'Defense Counsel', badge: 'ADV-1', status: 'Active' },
                { name: 'Registrar Amit Kumar', role: 'Registrar', badge: 'REG-1', status: 'Active' },
              ].map((user, idx) => (
                <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                      {user.name.split(' ').slice(-2).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.role} ({user.badge})</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <SettingsIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vault System Settings & Compliance</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cryptographic parameters, SHA-256 integrity rules, and BSA Sec 63 engine status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck size={16} className="text-emerald-600" /> Cryptographic Integrity Engine
                </div>
                <p className="text-[11px] text-slate-500">SHA-256 hash hashing enforced on all uploaded evidence files under BSA Section 63 compliance.</p>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  Enforced (SHA-256)
                </span>
              </div>

              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Database size={16} className="text-emerald-600" /> Vector Database Indexing
                </div>
                <p className="text-[11px] text-slate-500">PGlite vector semantic search index active for multi-document cross-case analysis.</p>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  pgvector Active
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            currentUser={currentUser} 
            onSelectCase={handleCaseSelect} 
            onViewChange={handleViewChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col antialiased">
      {/* Top Navbar Header */}
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onCaseSelect={handleCaseSelect} 
        onLogout={handleLogout} 
        currentUser={currentUser} 
        activeView={activeView}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* Main Workspace Layout with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          onViewChange={handleViewChange} 
          currentUser={currentUser} 
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderMainView()}
        </main>
      </div>

      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
