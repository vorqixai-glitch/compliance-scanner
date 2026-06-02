/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { trpc } from '../providers/trpc';
import { 
  Users, 
  MapPin, 
  CheckSquare, 
  FileText, 
  ArrowRight,
  Plus, 
  Calendar, 
  Building, 
  Search,
  Activity as ActivityIcon,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: stats, isLoading, refetch } = trpc.dashboard.stats.useQuery();
  const complianceMutation = trpc.compliance.update.useMutation();

  const handleCompleteTask = async (id: number) => {
    try {
      await complianceMutation.mutateAsync({ status: 'completed' }, id);
      refetch();
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(idx => (
            <div key={idx} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, upcomingItems, bookings, activities, org } = stats;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Compliance Dashboard
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Operational dashboard for <span className="font-semibold text-slate-700">{org?.name}</span> &bull; {org?.city}, {org?.state}
          </p>
        </div>
        
        {/* Quick Action Group Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/residents')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            Admit New Resident
          </button>
          <button
            onClick={() => onNavigate('/compliance')}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <CheckSquare className="w-4 h-4 text-slate-400" />
            New Auditable task
          </button>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Residents</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">{kpis.activeResidents}</h2>
            <span className="text-emerald-600 text-xs font-semibold mb-1">
               {kpis.activeResidents} / {org?.beds || 12} Cap
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Licensure level</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">{org?.narLevel ? org.narLevel.replace('level_', 'L') : 'L2'}</h2>
            <span className="text-indigo-600 text-xs font-semibold mb-1 uppercase">
              {org?.licenseStatus || 'Pending'}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Compliance</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">{kpis.complianceHealth}%</h2>
            <span className={`${kpis.complianceHealth > 75 ? 'text-emerald-600' : 'text-amber-500'} text-xs font-semibold mb-1`}>
              Health
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Agreements</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">{kpis.totalDocuments}</h2>
            <span className="text-indigo-600 text-xs font-semibold mb-1">
              Documents
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Compliance state and right utility widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side (Col-span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Upcoming Compliance Tracker list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-700">Upcoming Compliance Requirements</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Pending and in-progress operational tasks</p>
              </div>
              <button
                onClick={() => onNavigate('/compliance')}
                className="text-xs text-indigo-600 font-semibold"
              >
                View Checklist Board &rarr;
              </button>
            </div>

            <div className="flex-1 p-6">
              {upcomingItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm space-y-2 font-display">
                  <CheckSquare className="w-8 h-8 text-slate-350 mx-auto" />
                  <p className="font-medium">All compliance checkpoints cleared!</p>
                  <p className="text-xs text-slate-400">Everything is in outstanding audit standing.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingItems.map((item: any) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3.5 overflow-hidden">
                        <input
                          type="checkbox"
                          onClick={() => handleCompleteTask(item.id)}
                          className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                          title="Mark Compliance Task Completed"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              item.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              item.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-slate-50 text-slate-500 border border-slate-100'
                            }`}>
                              {item.priority} priority
                            </span>
                            <span className="text-[10px] text-slate-450 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                              Category: {item.category}
                            </span>
                            {item.dueDate && (
                              <span className="text-[10px] font-mono text-slate-400 font-medium">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100/70 border border-slate-200/50 px-2.5 py-1 rounded-full uppercase leading-none">
                        {item.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Router links (Bento style) */}
          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">Expert Compliance Toolkit</span>
              <h3 className="font-display font-semibold text-xl text-slate-900">Need licensure or FARR/NARR assistance?</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Browse localized guidelines or schedule live consultation reviews directly with certified sober home specialists.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 pt-1">
              <button
                onClick={() => onNavigate('/licensing')}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-sm">GA</div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 leading-tight">States Guides</p>
                <p className="text-[10px] text-slate-500 leading-relaxed truncate">Access PA, FL, CA requirements</p>
              </button>

              <button
                onClick={() => onNavigate('/ai-assistant')}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-sm">AI</div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600 leading-tight">Interactive Chat</p>
                <p className="text-[10px] text-slate-500 leading-relaxed truncate">Compliance QA lookup bot</p>
              </button>

              <button
                onClick={() => onNavigate('/consulting')}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-left transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-sm">EB</div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-600 leading-tight">Expert Booking</p>
                <p className="text-[10px] text-slate-500 leading-relaxed truncate">Schedule operational checks</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Operator Certificate parameters / License specs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Licensure Credentials</h3>
            </div>
            
            <div className="p-4 space-y-5 flex-1">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">NARR Standard Code</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 uppercase">
                    {org?.narLevel?.replace('_', ' ') || 'Level II'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Registered License Key</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 font-mono">
                    {org?.licenseNumber || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Affiliated Expiry</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 font-mono text-xs">
                    {org?.licenseExpiry ? new Date(org.licenseExpiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onNavigate('/settings')}
                className="w-full mt-2 flex items-center justify-center gap-1 py-2 rounded border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Update Registration Info
              </button>
            </div>
          </div>

          {/* Audit Logs Activities stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <h3 className="font-semibold text-slate-700">Secure Audit Logs</h3>
            </div>

            <div className="p-4 flex-1">
              {activities.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No operations audited yet</p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {activities.map((act: any) => (
                    <div key={act.id} className="flex gap-3 text-xs leading-relaxed">
                      <span className="text-[10px] text-indigo-500 mt-0.5 shrink-0">●</span>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-800 leading-normal">{act.action}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{act.details}</p>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
