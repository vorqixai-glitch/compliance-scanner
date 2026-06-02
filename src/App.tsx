/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, startTransition } from 'react';
import { TRPCProvider } from './providers/trpc';
import { useAuth } from './hooks/useAuth';
import { AuthLayout } from './components/AuthLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Licensing } from './pages/Licensing';
import { Residents } from './pages/Residents';
import { Documents } from './pages/Documents';
import { Compliance } from './pages/Compliance';
import { AIAssistant } from './pages/AIAssistant';
import { Consulting } from './pages/Consulting';
import { Settings } from './pages/Settings';
import { SupportChat } from './components/SupportChat';

interface RouteHandlerProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const RouteHandler: React.FC<RouteHandlerProps> = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If loading user credentials, show a beautiful branding loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse font-display">
            Securing White Tail Vault Connection...
          </p>
        </div>
      </div>
    );
  }

  // Handle routing logic for public vs authenticated pages
  const isAuthPage = currentPath === '/login';
  const isLandingPage = currentPath === '/';

  if (!isAuthenticated && !isAuthPage && !isLandingPage) {
    // Force redirect to login if attempting to access credentials dashboards while logged out
    setTimeout(() => onNavigate('/login'), 0);
    return null;
  }

  if (isAuthenticated && (isAuthPage || isLandingPage)) {
    // Redirect to dashboard if they are already logged in
    setTimeout(() => onNavigate('/dashboard'), 0);
    return null;
  }

  // Render Public Pages
  if (currentPath === '/') {
    return <Home onNavigate={onNavigate} />;
  }

  if (currentPath === '/login') {
    return <Login onNavigate={onNavigate} />;
  }

  // Render Authenticated Pages inside the Sidebar AuthLayout
  let pageContent: React.ReactNode = null;

  switch (currentPath) {
    case '/dashboard':
      pageContent = <Dashboard onNavigate={onNavigate} />;
      break;
    case '/licensing':
      pageContent = <Licensing />;
      break;
    case '/residents':
      pageContent = <Residents />;
      break;
    case '/documents':
      pageContent = <Documents />;
      break;
    case '/compliance':
      pageContent = <Compliance />;
      break;
    case '/ai-assistant':
      pageContent = <AIAssistant />;
      break;
    case '/consulting':
      pageContent = <Consulting />;
      break;
    case '/settings':
      pageContent = <Settings />;
      break;
    default:
      // Fallback
      pageContent = <Dashboard onNavigate={onNavigate} />;
  }

  return (
    <AuthLayout activePath={currentPath} onNavigate={onNavigate}>
      <div className="animate-fadeIn min-h-[500px]">
        {pageContent}
      </div>
    </AuthLayout>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname === '/' ? '/' : window.location.pathname;
  });

  const handleNavigate = (path: string) => {
    startTransition(() => {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
    });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <TRPCProvider>
      <RouteHandler currentPath={currentPath} onNavigate={handleNavigate} />
      <SupportChat />
    </TRPCProvider>
  );
}
