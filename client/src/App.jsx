import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

import CrossCaseRadar from './components/CrossCaseRadar';
import SmartSearch from './components/SmartSearch';
import MasterTimelineHub from './components/MasterTimelineHub';
import AuditTrailHub from './components/AuditTrailHub';
import ReportsHub from './components/ReportsHub';
import UsersDirectory from './components/UsersDirectory';
import SettingsHub from './components/SettingsHub';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from './hooks/useTranslation';

function AppContent() {
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'cases' or 'radar'
  
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

  // Load user profile if authenticated
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
    window.history.replaceState({ view: 'cases' }, '', '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_active_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveCaseId(null);
  };

  // Handle History API for browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.view === 'case' && event.state?.caseId) {
        setActiveCaseId(event.state.caseId);
        setActiveView('cases');
      } else if (event.state?.view) {
        setActiveCaseId(null);
        setActiveView(event.state.view);
      } else {
        setActiveCaseId(null);
        setActiveView('dashboard');
      }
    };
    
    // Initial state setup if url has hash
    const hash = window.location.hash;
    if (hash.startsWith('#case/')) {
      const id = hash.split('/')[1];
      setActiveCaseId(id);
      setActiveView('cases');
      window.history.replaceState({ view: 'case', caseId: id }, '', hash);
    } else if (hash && hash.length > 1) {
      const viewFromHash = hash.substring(1);
      setActiveView(viewFromHash);
      window.history.replaceState({ view: viewFromHash }, '', hash);
    } else {
      setActiveView('dashboard');
      window.history.replaceState({ view: 'dashboard' }, '', '/');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcut: Cmd + K / Ctrl + K opens Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleViewChange('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCaseSelect = (id) => {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white flex transition-colors duration-300 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Sidebar Navigation matching user mockup */}
      <Sidebar 
        activeView={activeCaseId ? 'cases' : activeView} 
        onViewChange={(view) => {
          if (view === 'evidence') {
            handleViewChange('cases');
          } else {
            handleViewChange(view);
          }
        }} 
        currentUser={currentUser} 
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader 
          currentUser={currentUser} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onLogout={handleLogout} 
          onSearchClick={() => handleViewChange('search')}
        />

        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeCaseId ? (
            <CaseDetail 
              caseId={activeCaseId} 
              onBack={() => {
                setActiveCaseId(null);
                setActiveView('cases');
                window.history.pushState({ view: 'cases' }, '', '#cases');
              }} 
              currentUser={currentUser}
            />
          ) : activeView === 'dashboard' ? (
            <Dashboard currentUser={currentUser} onSelectCase={handleCaseSelect} onViewChange={handleViewChange} />
          ) : activeView === 'search' ? (
            <SmartSearch onOpenCase={handleCaseSelect} />
          ) : activeView === 'radar' ? (
            <CrossCaseRadar />
          ) : activeView === 'timeline' ? (
            <MasterTimelineHub onCaseSelect={handleCaseSelect} />
          ) : activeView === 'audit' ? (
            <AuditTrailHub />
          ) : activeView === 'reports' ? (
            <ReportsHub currentUser={currentUser} />
          ) : activeView === 'users' ? (
            <UsersDirectory />
          ) : activeView === 'settings' ? (
            <SettingsHub currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />
          ) : (
            <CaseList onCaseSelect={handleCaseSelect} currentUser={currentUser} />
          )}
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
