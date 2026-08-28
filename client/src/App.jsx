import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

import CrossCaseRadar from './components/CrossCaseRadar';
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
      } else if (event.state?.view === 'radar') {
        setActiveView('radar');
        setActiveCaseId(null);
      } else if (event.state?.view === 'cases') {
        setActiveCaseId(null);
        setActiveView('cases');
      } else {
        setActiveCaseId(null);
        setActiveView('dashboard');
      }
    };
    
    // Initial state setup if url has hash
    if (window.location.hash.startsWith('#case/')) {
      const id = window.location.hash.split('/')[1];
      setActiveCaseId(id);
      setActiveView('cases');
      window.history.replaceState({ view: 'case', caseId: id }, '', window.location.hash);
    } else if (window.location.hash === '#radar') {
      setActiveView('radar');
      window.history.replaceState({ view: 'radar' }, '', '#radar');
    } else if (window.location.hash === '#cases') {
      setActiveView('cases');
      window.history.replaceState({ view: 'cases' }, '', '#cases');
    } else {
      setActiveView('dashboard');
      window.history.replaceState({ view: 'dashboard' }, '', '/');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onCaseSelect={handleCaseSelect} 
        onLogout={handleLogout} 
        currentUser={currentUser} 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'radar' ? (
          <CrossCaseRadar />
        ) : activeCaseId ? (
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
          <Dashboard currentUser={currentUser} onSelectCase={handleCaseSelect} />
        ) : (
          <CaseList onCaseSelect={handleCaseSelect} currentUser={currentUser} />
        )}
      </main>
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
