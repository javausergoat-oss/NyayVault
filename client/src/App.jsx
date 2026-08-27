import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import Login from './components/Login';

import CrossCaseRadar from './components/CrossCaseRadar';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [activeView, setActiveView] = useState('cases'); // 'cases' or 'radar'
  
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
  };

  const handleLogout = () => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_active_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveCaseId(null);
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
        onCaseSelect={(id) => { setActiveCaseId(id); setActiveView('cases'); }} 
        onLogout={handleLogout} 
        currentUser={currentUser} 
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v); setActiveCaseId(null); }}
      />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'radar' ? (
          <CrossCaseRadar />
        ) : activeCaseId ? (
          <CaseDetail 
            caseId={activeCaseId} 
            onBack={() => setActiveCaseId(null)} 
            currentUser={currentUser}
          />
        ) : (
          <CaseList onCaseSelect={setActiveCaseId} currentUser={currentUser} />
        )}
      </main>
      <Analytics />
    </div>
  );
}
