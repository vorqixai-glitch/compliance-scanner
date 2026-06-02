/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMobile } from '../hooks/use-mobile';
import { trpc } from '../providers/trpc';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  FileText, 
  CheckSquare, 
  Sparkles, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Building,
  User as UserIcon
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, activePath, onNavigate }) => {
  const { user, logout, isLoading } = useAuth();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch current org for custom layout brand naming
  const { data: orgData } = trpc.org.my.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse font-display">Initializing White Tail Secure Network...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Licensing guides', path: '/licensing', icon: MapPin },
    { name: 'Resident tracker', path: '/residents', icon: Users },
    { name: 'Document center', path: '/documents', icon: FileText },
    { name: 'Compliance checklist', path: '/compliance', icon: CheckSquare },
    { name: 'AI Assistance', path: '/ai-assistant', icon: Sparkles },
    { name: 'Expert consulting', path: '/consulting', icon: Calendar },
    { name: 'Operator settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header / Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center border border-indigo-100">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.072 11.955 11.955 0 00-6.382 17.915a11.954 11.954 0 0019.536 0 11.959 11.959 0 00-5.536-17.915z"/></svg>
        </div>
        <span className="text-slate-900 font-bold tracking-tight text-lg">White Tail</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-slate-100 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-none">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section / Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1 tracking-wide">Active Operator</p>
          <p className="text-sm text-slate-900 font-semibold truncate">{orgData?.name || "Initializing..."}</p>
        </div>
        
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-slate-800 font-medium truncate">
                {user?.name || "Operational User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-850">
      
      {/* Desktop Responsive Sidebar (Locked Left) */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header Navigation */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white text-slate-900 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold leading-none">W</div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-900">WHITE TAIL</span>
            <span className="text-[8px] tracking-widest text-slate-500 font-semibold block uppercase leading-none mt-0.5">SaaS Toolkit</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Expansion Frame */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm h-full flex flex-col bg-white overflow-hidden">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 text-slate-400 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Content Stage */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto bg-slate-50">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(item => item.path === activePath)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || "Operational User"}</p>
              <p className="text-xs text-slate-500">Facility Director</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 w-full mx-auto">
          {children}
        </div>
        
        {/* Footer Area */}
        <footer className="py-6 border-t border-slate-200 mt-auto bg-white shrink-0">
          <div className="max-w-7xl w-full mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-display">
              &copy; {new Date().getFullYear()} White Tail Solutions &bull; Sober Living Operational SaaS Suite
            </span>
            <span className="text-[10px] text-indigo-600/70 bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-full font-semibold font-mono tracking-wider">
              EST STATE GUIDES ACCREDITATION v1.0
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};
