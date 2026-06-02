/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { trpc } from '../providers/trpc';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { login: authContextLogin } = useAuth();

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const isPending = registerMutation.isPending || loginMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Please wait...');
    try {
      await authContextLogin();
      onNavigate('/dashboard');
    } catch (err: any) {
      setFeedback(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-radial from-indigo-100/10 via-transparent to-transparent"></div>
      
      {/* Absolute Header link to go back */}
      <button 
        onClick={() => onNavigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        &larr; Back to Landing Page
      </button>

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 relative overflow-hidden backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/15 mb-3.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight leading-none">
            White Tail Solutions
          </h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-2.5">
            Sober Living Operators Secure Terminal
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-slate-100/85 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('login'); setFeedback(null); }}
            className={`py-2 rounded-lg text-xs font-semibold font-display tracking-wide transition-all ${
              activeTab === 'login' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100/40' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            SaaS Operator Sign-In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setFeedback(null); }}
            className={`py-2 rounded-lg text-xs font-semibold font-display tracking-wide transition-all ${
              activeTab === 'register' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100/40' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Operator Account
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-5 bg-rose-50 border border-rose-100/60 p-4 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isPending}
            className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/10"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Sign in with Google</span>
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed mt-6 border-t border-slate-100 pt-5">
          White Tail Solutions utilizes high-strength HMAC-SHA256 signature vaults to protect clinical rosters and compliance ledgers securely.
        </p>

      </div>
    </div>
  );
};
