/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '../providers/trpc';
import { useAuth } from '../hooks/useAuth';
import { 
  Building, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  CheckCircle, 
  User, 
  Sliders, 
  ChevronRight,
  AlertCircle,
  LogOut
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Queries & Mutations
  const { data: orgData, isLoading, refetch } = trpc.org.my.useQuery();
  const updateOrgMutation = trpc.org.update.useMutation();

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [beds, setBeds] = useState(12);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [narLevel, setNarLevel] = useState('level_2');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Sync form state when query resolves
  useEffect(() => {
    if (orgData) {
      setName(orgData.name || '');
      setAddress(orgData.address || '');
      setCity(orgData.city || '');
      setState(orgData.state || '');
      setZipCode(orgData.zipCode || '');
      setBeds(orgData.beds || 12);
      setLicenseNumber(orgData.licenseNumber || '');
      if (orgData.licenseExpiry) {
        setLicenseExpiry(new Date(orgData.licenseExpiry).toISOString().split('T')[0]);
      }
      setNarLevel(orgData.narLevel || 'level_2');
    }
  }, [orgData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name) {
      setFeedback({ type: 'error', text: 'Organization label is required.' });
      return;
    }

    try {
      await updateOrgMutation.mutateAsync({
        name,
        address,
        city,
        state,
        zipCode,
        beds: Number(beds),
        licenseNumber,
        licenseExpiry,
        narLevel
      });
      refetch();
      setFeedback({ type: 'success', text: 'Organization configurations successfully verified and updated!' });
      // clear notification after a while
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to sync modifications.' });
    }
  };

  if (isLoading || !orgData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-44 bg-slate-200 rounded-lg"></div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
          Operator &amp; Facility Settings
        </h2>
        <p className="text-slate-550 font-medium text-sm mt-2">
          Update corporate parameters, bed occupancies, and licensing credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main Settings Form (Col-span 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-md text-slate-900 leading-none">Facility Profile</h3>
              <p className="text-xs text-slate-450 mt-1">Configure physical coordinates and NARR certifications</p>
            </div>
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100/60 text-rose-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-555 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operator Organization Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-sans"
                  placeholder="e.g. Sanctuary Path Recovery Homes"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Licensed Beds Capacity</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-202 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-mono"
                  placeholder="12"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Physical Street Coordinates</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-805 transition-all"
                placeholder="402 Wood Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">City HQ</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all"
                  placeholder="Pittsburgh"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">State Code</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all uppercase"
                  placeholder="PA"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-mono"
                  placeholder="15222"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registration License Key</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-mono uppercase"
                  placeholder="PA-DDAP-9921"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Expiry Calendar</label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-1.5 px-3 text-sm text-slate-800 transition-all font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NARR Level code</label>
                <select
                  value={narLevel}
                  onChange={(e) => setNarLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all cursor-pointer"
                  required
                >
                  <option value="level_1">Level I &bull; Peer Run</option>
                  <option value="level_2">Level II &bull; Monitored House</option>
                  <option value="level_3">Level III &bull; Supervised Staff</option>
                  <option value="level_4">Level IV &bull; Clinical Services</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100/60 flex justify-end">
              <button
                type="submit"
                disabled={updateOrgMutation.isPending}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 h-11"
              >
                {updateOrgMutation.isPending ? 'Syncing...' : 'Verify & Synchronize Facility Specs'}
              </button>
            </div>
          </form>
        </div>

        {/* Right configurations sidebars (Col-span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User accounts Profile credentials card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-905 leading-none">Your Operator Session</h4>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Authenticated user</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{user?.name || "Initializing..."}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Registered Email</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">{user?.email}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Authority Role Access</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 uppercase tracking-wide font-mono text-[10px] bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full inline-block leading-none">
                  {user?.role || 'operator'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-650 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Close Operator Session
            </button>
          </div>

          {/* Secure cryptographic key facts */}
          <div className="bg-emerald-50 border border-emerald-100 text-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h4 className="font-display font-bold text-xs uppercase tracking-wider leading-none">Secure Vault Details</h4>
            </div>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              White Tail Solutions provides a secure hosting node. Active resident files, toxicology drug screens, and signed housing covenants are signed with cryptographic validation stamps that prevent records alteration.
            </p>
            <div className="text-[9px] font-mono text-emerald-700/60 uppercase flex justify-between pt-2 border-t border-emerald-200/60 leading-none">
              <span>Database Status OK</span>
              <span>AES-256 Enabled</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
