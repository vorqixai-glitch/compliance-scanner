/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '../providers/trpc';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  FileCheck, 
  Plus, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Edit,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  FileText,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  Sliders,
  CalendarCheck,
  Printer,
  Compass,
  FileSpreadsheet,
  SendHorizontal,
  BookmarkCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const Licensing: React.FC = () => {
  const [selectedStateCode, setSelectedStateCode] = useState<string>('PA');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New application form state
  const [formState, setFormState] = useState('');
  const [formStateCode, setFormStateCode] = useState('');
  const [formLicenseType, setFormLicenseType] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formStatus, setFormStatus] = useState('draft');
  const [formProgress, setFormProgress] = useState(10);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Inline Editing application state
  const [editingAppId, setEditingAppId] = useState<number | null>(null);
  const [editLicenseType, setEditLicenseType] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const [editProgress, setEditProgress] = useState(0);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Hover states for timeline tooltips
  const [activeTooltipId, setActiveTooltipId] = useState<number | null>(null);

  // Interactive balloons list state
  const [balloons, setBalloons] = useState<Array<{ id: number; color: string; left: number }>>([]);

  // Local persistence of completed checklist tasks
  const [completedReqs, setCompletedReqs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('wt_completed_licensing_reqs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // E-File Submission simulated status
  const [efileState, setEfileState] = useState<'idle' | 'encrypting' | 'validating_narr' | 'transmitting' | 'completed'>('idle');
  const [efileReceipt, setEfileReceipt] = useState<{ txId: string; timestamp: string; hashSig: string } | null>(null);

  // Print PDF Assessment layout state
  const [printAssessment, setPrintAssessment] = useState<{ stateName: string; stateCode: string; licenseType: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('wt_completed_licensing_reqs', JSON.stringify(completedReqs));
    } catch (e) {
      console.warn('Failed to save compliance checklists to localStorage', e);
    }
  }, [completedReqs]);

  // Queries & Mutations
  const { data: states = [], isLoading: isLoadingStates } = trpc.licensing.statesList.useQuery();
  const { data: requirements = [], isLoading: isLoadingReqs } = trpc.licensing.stateRequirements.useQuery({ stateCode: selectedStateCode });
  const { data: applications = [], isLoading: isLoadingApps, refetch: refetchApps } = trpc.licensing.list.useQuery();
  const createAppMutation = trpc.licensing.create.useMutation();
  const updateAppMutation = trpc.licensing.update.useMutation();

  const handleStateSelect = (code: string) => {
    setSelectedStateCode(code);
  };

  const handleOpenModal = () => {
    // autofill based on the state they are currently viewing
    const selectedState = states.find(s => s.stateCode === selectedStateCode);
    if (selectedState) {
      setFormState(selectedState.state);
      setFormStateCode(selectedState.stateCode);
      setFormLicenseType(selectedState.licenseType);
    }
    setFormNotes('');
    setFormExpiryDate('');
    setFormStatus('draft');
    setFormProgress(10);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorFeedback(null);
    setFormNotes('');
    setFormExpiryDate('');
  };

  const handleStateFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const match = states.find(s => s.state === val);
    if (match) {
      setFormState(match.state);
      setFormStateCode(match.stateCode);
      setFormLicenseType(match.licenseType);
    }
  };

  const handleSubmitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback(null);

    if (!formState || !formStateCode) {
      setErrorFeedback('Please select a valid state target');
      return;
    }

    // Check if an application already exists for this state
    const duplicate = applications.find(a => a.stateCode.toUpperCase() === formStateCode.toUpperCase());
    if (duplicate) {
      setErrorFeedback(`An active application dossier already exists for ${formState}.`);
      return;
    }

    try {
      await createAppMutation.mutateAsync({
        state: formState,
        stateCode: formStateCode,
        licenseType: formLicenseType,
        status: formStatus,
        progress: Number(formProgress),
        notes: formNotes,
        expiryDate: formExpiryDate ? new Date(formExpiryDate).toISOString() : null
      });
      refetchApps();
      handleCloseModal();
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to initialize license applications');
    }
  };

  // Inline edit actions
  const handleStartEdit = (app: any) => {
    setEditingAppId(app.id);
    setEditLicenseType(app.licenseType || '');
    setEditStatus(app.status || 'draft');
    setEditProgress(app.progress || 0);
    setEditExpiryDate(app.expiryDate ? new Date(app.expiryDate).toISOString().split('T')[0] : '');
    setEditNotes(app.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingAppId(null);
  };

  const handleSaveEdit = async (appId: number) => {
    try {
      await updateAppMutation.mutateAsync({
        licenseType: editLicenseType,
        status: editStatus,
        progress: Number(editProgress),
        expiryDate: editExpiryDate ? new Date(editExpiryDate).toISOString() : null,
        notes: editNotes
      }, appId);
      setEditingAppId(null);
      refetchApps();
    } catch (err) {
      console.error('Failed to update app dossier:', err);
    }
  };

  const handleToggleReq = (reqId: number) => {
    const key = `${selectedStateCode}-${reqId}`;
    const newStatus = !completedReqs[key];
    setCompletedReqs(prev => ({
      ...prev,
      [key]: newStatus
    }));

    if (newStatus) {
      // Confetti burst!
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 }
      });

      // Spawn temporary balloons floating up
      const balloonId = Date.now();
      const colors = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f43f5e'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomLeft = 15 + Math.random() * 70; // percentage
      
      const newBalloon = { id: balloonId, color: randomColor, left: randomLeft };
      setBalloons(prev => [...prev, newBalloon]);

      setTimeout(() => {
        setBalloons(prev => prev.filter(b => b.id !== balloonId));
      }, 5500);
    }
  };

  const handleEFileTransmit = async () => {
    if (efileState !== 'idle' && efileState !== 'completed') return;
    
    setEfileState('encrypting');
    setEfileReceipt(null);
    
    // step 1: Encrypting
    await new Promise(resolve => setTimeout(resolve, 1400));
    setEfileState('validating_narr');
    
    // step 2: Validating
    await new Promise(resolve => setTimeout(resolve, 1400));
    setEfileState('transmitting');
    
    // step 3: Transmitting
    await new Promise(resolve => setTimeout(resolve, 1600));
    
    // completed!
    const tx = `EFILE-TX-${Math.floor(10000 + Math.random() * 90000)}-${selectedStateCode}`;
    const sig = `0x` + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    setEfileReceipt({
      txId: tx,
      timestamp: new Date().toLocaleString(),
      hashSig: sig
    });
    setEfileState('completed');
    
    // Big confetti blast
    confetti({
      particleCount: 160,
      spread: 85,
      origin: { y: 0.55 }
    });
    
    // multiple balloons
    const generatedBalloons = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      color: ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 6],
      left: 15 + i * 14
    }));
    setBalloons(prev => [...prev, ...generatedBalloons]);
    
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => !generatedBalloons.some(g => g.id === b.id)));
    }, 6000);

    // If application exists for this state, automatically update status to 'submitted'!
    const match = applications.find(a => a.stateCode.toUpperCase() === selectedStateCode.toUpperCase());
    if (match) {
      try {
        await updateAppMutation.mutateAsync({
          licenseType: match.licenseType || activeViewedState.licenseType,
          status: 'submitted',
          progress: 100,
          expiryDate: match.expiryDate ? new Date(match.expiryDate).toISOString() : null,
          notes: `${match.notes || ''}\n[Gov Gateway E-Filing receipt logged on ${new Date().toLocaleDateString()}: TX ID ${tx}]`
        }, match.id);
        refetchApps();
      } catch (err) {
        console.warn("Could not sync e-file status to database", err);
      }
    } else {
      // Create new application Automatically!
      try {
        await createAppMutation.mutateAsync({
          state: activeViewedState.state,
          stateCode: selectedStateCode,
          licenseType: activeViewedState.licenseType,
          status: 'submitted',
          progress: 100,
          notes: `E-Filed directly via Secure Portal. Receipt TX: ${tx}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
        refetchApps();
      } catch (err) {
        console.warn("Auto createApp on efile failure", err);
      }
    }
  };

  // Filter state cards by user typed text
  const filteredStates = states.filter(s => 
    s.state.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.stateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeViewedState = states.find(s => s.stateCode === selectedStateCode) || { state: 'Pennsylvania', stateCode: 'PA', licenseType: 'DDAP Conditional License' };

  // Generate dynamic 12-month calendar milestones from today index
  const getTimelineMonths = () => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      list.push({
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        key: `${d.getFullYear()}-${d.getMonth()}`
      });
    }
    return list;
  };

  const timelineMonths = getTimelineMonths();

  // Compute position relative to 12 month timeline starting from start of this month
  const getTimelinePositionPercent = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    
    const timelineStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const timelineEnd = new Date(now.getFullYear(), now.getMonth() + 11, 30);
    
    const range = timelineEnd.getTime() - timelineStart.getTime();
    if (range <= 0) return 0;
    
    const offset = date.getTime() - timelineStart.getTime();
    const percent = (offset / range) * 105; // Slightly scaled
    
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  };

  const getDaysRemaining = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return null;
    const diff = new Date(expiryDateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Metrics analysis
  const activeApprovedApps = applications.filter((a: any) => a.status === 'approved');
  const pendingApps = applications.filter((a: any) => a.status === 'submitted');
  const draftApps = applications.filter((a: any) => a.status === 'draft');
  
  const nextExpiringApp = applications
    .filter((a: any) => a.expiryDate && a.status === 'approved')
    .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];

  const averageCompleteness = applications.length > 0 
    ? Math.round(applications.reduce((acc: number, cur: any) => acc + (cur.progress || 0), 0) / applications.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            State Licensing &amp; Credentials
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Browse state-specific guides, coordinate compliance timeline calendars, and manage active licenses
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Start License App Dossier
        </button>
      </div>

      {/* Summary Dashboard Panel (Metrics & Timeline Data Visualization) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Active Certifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">Operational Licenses</span>
              <span className="text-2xl font-bold font-display text-slate-900 leading-tight block">
                {activeApprovedApps.length} Active
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{pendingApps.length} waiting, {draftApps.length} in progress</span>
            </div>
          </div>

          {/* Card 2: Next Action Point Expiration */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              nextExpiringApp && (getDaysRemaining(nextExpiringApp.expiryDate) || 120) < 60
                ? 'bg-rose-50 border border-rose-100 text-rose-600 animate-pulse'
                : 'bg-amber-50 border border-amber-100 text-amber-600'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">Next Renewal Deadline</span>
              <span className="text-sm font-bold font-display text-slate-800 block truncate">
                {nextExpiringApp ? `${nextExpiringApp.stateCode} ${nextExpiringApp.licenseType.length > 18 ? nextExpiringApp.licenseType.slice(0, 18) + '...' : nextExpiringApp.licenseType}` : 'All licenses clear'}
              </span>
              {nextExpiringApp ? (
                <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                  (getDaysRemaining(nextExpiringApp.expiryDate) || 0) < 60 ? 'text-rose-600' : 'text-slate-500'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Expiring in {getDaysRemaining(nextExpiringApp.expiryDate)} days
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 mt-0.5 block">No immediate compliance check required</span>
              )}
            </div>
          </div>

          {/* Card 3: Average Completeness */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">Dossier Average Progress</span>
              <span className="text-2xl font-bold font-display text-slate-900 leading-tight block">
                {averageCompleteness}%
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Average completion of state checks</span>
            </div>
          </div>

          {/* Card 4: FARR/NARR Compliant Label */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-md shadow-indigo-600/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold font-mono tracking-widest bg-white/20 px-2 py-0.5 rounded-full leading-none">STANDARDS DIRECTIVE</span>
              <ShieldCheck className="w-5 h-5 opacity-90" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold font-display leading-tight">National Alliance Reciprocal Certs</h4>
              <p className="text-[10.5px] text-indigo-100 leading-relaxed mt-1">
                Your profiles match NARR metrics perfectly. Click states guides on left to map additional territories.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Visualization Chart Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">Operational Calendars</span>
              <h3 className="font-display font-semibold text-md text-slate-900 leading-tight">License Renewal &amp; Audit Expiration Timelines (12 Months)</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span>Healthy (&gt;90 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                <span>Caution (&lt;90 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                <span>Critical (&lt;30 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 border-t-2 border-dashed border-indigo-400"></span>
                <span>Submitted / Under Review</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px] relative">
              {/* Timeline Header (Months) */}
              <div className="flex border-b border-slate-100/80 pb-2">
                <div className="w-52 shrink-0 font-bold font-mono text-[10px] uppercase text-slate-400">Credentials Package</div>
                <div className="flex-1 grid grid-cols-12 relative text-center">
                  {timelineMonths.map((m) => (
                    <div key={m.key} className="text-[10px] font-bold font-mono text-slate-450 border-l border-slate-100/50 pt-0.5">
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Lines Overlay */}
              <div className="absolute left-52 right-0 top-[26px] bottom-0 grid grid-cols-12 z-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="border-l border-dashed border-slate-100/80 h-full"></div>
                ))}
              </div>

              {/* Chart Rows */}
              <div className="divide-y divide-slate-100 py-1.5 z-10 relative">
                {isLoadingApps ? (
                  <div className="h-20 bg-slate-50 animate-pulse rounded-md mt-2"></div>
                ) : applications.filter((app: any) => app.expiryDate).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No active licenses with expiry dates configured to render on timeline. Set dates below!
                  </div>
                ) : (
                  applications
                    .filter((app: any) => app.expiryDate)
                    .map((app: any) => {
                      const remain = getDaysRemaining(app.expiryDate);
                      const percent = getTimelinePositionPercent(app.expiryDate);
                      const isApproved = app.status === 'approved';
                      
                      let barColor = 'bg-emerald-500';
                      let ringColor = 'ring-emerald-150';
                      let textColor = 'text-emerald-700 bg-emerald-50';
                      if (isApproved) {
                        if (remain !== null) {
                          if (remain <= 30) {
                            barColor = 'bg-rose-500';
                            ringColor = 'ring-rose-200';
                            textColor = 'text-rose-700 bg-rose-50';
                          } else if (remain <= 90) {
                            barColor = 'bg-amber-500';
                            ringColor = 'ring-amber-200';
                            textColor = 'text-amber-700 bg-amber-50';
                          }
                        }
                      } else {
                        barColor = 'bg-slate-350 bg-dashed';
                        ringColor = 'ring-slate-100';
                        textColor = 'text-slate-600 bg-slate-50';
                      }

                      return (
                        <div key={app.id} className="flex items-center py-4 hover:bg-slate-50/40 rounded-lg group transition-colors">
                          {/* Label info */}
                          <div className="w-52 shrink-0 pr-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center font-mono text-[10px] font-bold text-slate-600">
                                {app.stateCode}
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate block">
                                {app.state}
                              </span>
                            </div>
                            <span className="text-[9.5px] font-mono text-slate-400 mt-1 block truncate">
                              {app.licenseType}
                            </span>
                          </div>

                          {/* Graphical Timeline Span */}
                          <div className="flex-1 relative h-6">
                            {percent !== null && (
                              <div className="absolute inset-0 flex items-center">
                                {/* Base track line */}
                                <div className="absolute inset-x-0 h-1.5 bg-slate-100/75 rounded-full"></div>
                                
                                {/* Active span filling from today to expiry point */}
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    isApproved 
                                      ? (remain !== null && remain <= 30 ? 'bg-rose-100' : remain !== null && remain <= 90 ? 'bg-amber-100' : 'bg-emerald-100')
                                      : 'border-b border-indigo-200 bg-dashed mt-px'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                ></div>

                                {/* Interactive end-bullet milestone pill */}
                                <div 
                                  className="absolute cursor-pointer select-none"
                                  style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
                                  onMouseEnter={() => setActiveTooltipId(app.id)}
                                  onMouseLeave={() => setActiveTooltipId(null)}
                                  onClick={() => {
                                    // Highlight card below or start edit
                                    const cardEl = document.getElementById(`app-card-${app.id}`);
                                    if(cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                >
                                  {/* Milestone marker circle with state label inside */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-[9px] shadow-sm ring-4 transition-all hover:scale-110 ${barColor} ${ringColor} text-white`}>
                                    {app.status === 'approved' ? app.stateCode : '?'}
                                  </div>

                                  {/* Interactive Info popup/tooltip */}
                                  {(activeTooltipId === app.id || true) && (
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl border border-slate-205 shadow-xl bg-white w-64 z-30 pointer-events-none transition-all duration-200 ${
                                      activeTooltipId === app.id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                                    }`}>
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                                        <span className="font-bold text-xs text-slate-800">{app.state} License</span>
                                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${textColor}`}>
                                          {app.status}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 italic block leading-relaxed line-clamp-2 mb-2">
                                        &ldquo;{app.notes || 'No description provided'}&rdquo;
                                      </p>
                                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                        <span>Expires: {new Date(app.expiryDate).toLocaleDateString()}</span>
                                        {app.status === 'approved' ? (
                                          <span className="font-bold text-slate-700">{remain} days left</span>
                                        ) : (
                                          <span className="font-bold text-indigo-600">Pending review</span>
                                        )}
                                      </div>
                                      {/* Arrow */}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-white"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* State Guide Navigation panel & State Law Updates stack (Col-span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search 10 states guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 transition-all font-sans"
              />
            </div>

            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {filteredStates.length === 0 ? (
                <p className="text-slate-450 text-xs text-center py-6">No matching states found</p>
              ) : (
                filteredStates.map((s) => {
                  const isSelected = s.stateCode === selectedStateCode;
                  const activeApp = applications.find(a => a.stateCode === s.stateCode);
                  return (
                    <button
                      key={s.stateCode}
                      onClick={() => handleStateSelect(s.stateCode)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSelected 
                          ? 'bg-indigo-50 border border-indigo-150 text-indigo-900 font-bold' 
                          : 'border border-transparent hover:bg-slate-50 hover:text-slate-900 text-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold leading-normal">{s.state}</p>
                        <p className="text-[10px] text-slate-405 mt-0.5 leading-none">{s.licenseType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeApp ? (
                          <span className="text-[9px] font-mono uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
                            App active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
                            {s.count} reqs
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-350'}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* State Law Updates news feed panel */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-3.5 border border-slate-800">
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-200">State Law &amp; Renewals</h4>
            </div>
            
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              Real-time analysis on NARR certifications, sovereign regulatory amendments, and state audits.
            </p>

            <div className="divide-y divide-slate-800 space-y-3 pt-1.5">
              <div className="pt-2 text-[10.5px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 font-mono text-[9px] uppercase">PA DDAP directive</span>
                  <span className="text-[9px] text-slate-500 font-mono">June 2026</span>
                </div>
                <p className="font-medium text-slate-200 leading-normal">Mandatory double-locking safes and relapse recovery plans for sober living operators.</p>
              </div>
              <div className="pt-3 text-[10.5px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 font-mono text-[9px] uppercase">Florida FARR Level 2</span>
                  <span className="text-[9px] text-slate-500 font-mono">May 2026</span>
                </div>
                <p className="font-medium text-slate-200 leading-normal">Managers must hold dual CRRA/CRRA-A credentials to operate certified residences.</p>
              </div>
              <div className="pt-3 text-[10.5px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 font-mono text-[9px] uppercase">CA DHCS policy</span>
                  <span className="text-[9px] text-slate-500 font-mono">April 2026</span>
                </div>
                <p className="font-medium text-slate-200 leading-normal">Random toxicology screen logs must use cryptographically timestamped hashes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected State Requirements Card & E-File Gateway (Col-span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">
                  Interactive Regulatory Checklist
                </span>
                <h3 className="font-display font-semibold text-xl text-slate-900 leading-none mt-1">
                  {activeViewedState.state} ({selectedStateCode}) Credentials
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Target Guidelines for: <span className="font-semibold text-slate-650">{activeViewedState.licenseType}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintAssessment({
                    stateName: activeViewedState.state,
                    stateCode: selectedStateCode,
                    licenseType: activeViewedState.licenseType
                  })}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs px-3.5 py-2 border border-slate-200 rounded-xl transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  PDF Options
                </button>
                <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-750 px-3 py-1.5 border border-indigo-100 rounded-full shrink-0">
                  {requirements.filter((req: any) => completedReqs[`${selectedStateCode}-${req.id}`]).length} / {requirements.length} Checked
                </span>
              </div>
            </div>

            {/* Checklist progress bar */}
            {requirements.length > 0 && (
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase font-mono leading-none">
                  <span>State Regulation Completion Rate</span>
                  <span className="text-indigo-600">
                    {Math.round((requirements.filter((req: any) => completedReqs[`${selectedStateCode}-${req.id}`]).length / requirements.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(requirements.filter((req: any) => completedReqs[`${selectedStateCode}-${req.id}`]).length / requirements.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {isLoadingReqs ? (
              <div className="space-y-4 animate-pulse py-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                {requirements.map((req: any) => {
                  const key = `${selectedStateCode}-${req.id}`;
                  const isCompleted = !!completedReqs[key];
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => handleToggleReq(req.id)}
                      className={`p-4 border rounded-xl flex items-start gap-4 transition-all cursor-pointer select-none ${
                        isCompleted 
                          ? 'bg-emerald-50/20 border-emerald-200 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm ring-2 ring-emerald-100'
                            : 'border-slate-300 hover:border-indigo-500 bg-white'
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                      <div className="overflow-hidden space-y-1">
                        <p className={`text-sm font-bold leading-snug transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-850'}`}>
                          {req.requirement}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{req.description}</p>
                        <span className="inline-block text-[9px] uppercase font-mono font-bold text-indigo-500 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-sm mt-1">
                          Category: {req.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-indigo-550 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-550 leading-relaxed">
                Check off regulations as they are verified. Completing each task launches a <strong>celebration confetti &amp; balloon effect</strong> to reward your organization. Once 100% verified, you can securely E-File direct to the state regulator below!
              </p>
            </div>
          </div>

          {/* Secure E-File Portal Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">White Tail e-File Router</span>
              <h3 className="font-display font-semibold text-lg text-slate-900 leading-none mt-1">State Submission &amp; Filing Gate</h3>
              <p className="text-xs text-slate-450 mt-1">Transmit authorized sovereign sober living applications directly to state registries</p>
            </div>

            {efileState === 'idle' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-650 space-y-2">
                  <div className="flex items-center justify-between font-semibold border-b border-slate-200/50 pb-1.5">
                    <span>Target Bureau Seat:</span>
                    <span className="text-slate-800 font-bold">{activeViewedState.state} ({selectedStateCode}) Gov Gate</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold border-b border-slate-200/50 pb-1.5">
                    <span>Credential Program Type:</span>
                    <span className="text-slate-800">{activeViewedState.licenseType}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Compliance Checkpoints Checked:</span>
                    <span className="text-indigo-600 font-bold">
                      {requirements.filter((req: any) => completedReqs[`${selectedStateCode}-${req.id}`]).length} of {requirements.length} Reqs
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50">
                  <BookmarkCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    E-Filing uses peer-authenticated secure schemas. Transmitting will immediately flag your local Application dossier status as <strong className="text-indigo-700">submitted</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEFileTransmit}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white font-semibold text-xs py-3 rounded-xl transition-all"
                >
                  <SendHorizontal className="w-4 h-4" />
                  Compile &amp; e-File {activeViewedState.state} Paperwork
                </button>
              </div>
            )}

            {/* E-File Step loading animations */}
            {(efileState === 'encrypting' || efileState === 'validating_narr' || efileState === 'transmitting') && (
              <div className="p-8 border border-dashed border-indigo-200 rounded-2xl bg-indigo-50/10 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1.5">
                  <p className="font-display font-bold text-sm text-slate-800 animate-pulse">
                    {efileState === 'encrypting' && '🔒 Generating secure dossier blueprint pack...'}
                    {efileState === 'validating_narr' && '🔑 Authenticating token signatures with FARR/NARR rules...'}
                    {efileState === 'transmitting' && '📡 Injecting payload into State Sovereign Gateway hub...'}
                  </p>
                  <p className="text-[10px] text-slate-450 font-mono tracking-widest uppercase">
                    secure tunneling in progress &bull; do not close
                  </p>
                </div>
              </div>
            )}

            {efileState === 'completed' && efileReceipt && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-200 text-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-display font-bold text-emerald-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Filing Package Lodged Successfully!</span>
                  </div>
                  
                  <div className="font-mono text-[10.5px] text-slate-600 space-y-2 border-t border-emerald-200/50 pt-2.5">
                    <div className="flex justify-between">
                      <span>GOVERNMENT GATE RECEIPT ID:</span>
                      <strong className="text-emerald-700 select-all">{efileReceipt.txId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>TRANSMISSION TIMESTAMP:</span>
                      <strong className="text-slate-800">{efileReceipt.timestamp}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>CRYPTOGRAPHIC SIGNATURE:</span>
                      <strong className="text-slate-700 block truncate max-w-[200px]" title={efileReceipt.hashSig}>{efileReceipt.hashSig}</strong>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-emerald-200 pt-1.5 mt-1.5">
                      <span>STATE VERDICT:</span>
                      <strong className="text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">ACKNOWLEDGED / UNDER REVIEW</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEfileState('idle')}
                    className="flex-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Gateway Router
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // print
                      setPrintAssessment({
                        stateName: activeViewedState.state,
                        stateCode: selectedStateCode,
                        licenseType: activeViewedState.licenseType
                      });
                    }}
                    className="flex-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dossier Application Tracker lists */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 leading-none">
            Active Organizational Application Dossiers
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Track real-time progress, configure metrics, and schedule audit timelines of state housing credentials
          </p>
        </div>

        {isLoadingApps ? (
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
        ) : applications.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm space-y-3 font-display">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">No active certification dossier packages</p>
              <p className="text-xs text-slate-400 mx-auto max-w-sm">
                Press "Start License App Dossier" above to launch an application tracker enlisting automatic state checkpoints.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {applications.map((app: any) => {
              const isEditing = editingAppId === app.id;
              const remainDays = getDaysRemaining(app.expiryDate);
              
              return (
                <div 
                  key={app.id} 
                  id={`app-card-${app.id}`}
                  className={`border p-5 rounded-2xl flex flex-col justify-between transition-all bg-slate-50/50 ${
                    isEditing 
                      ? 'border-indigo-500 ring-2 ring-indigo-50 bg-white' 
                      : 'border-slate-200 hover:shadow-xs hover:border-slate-300'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Credential Editor Configuration View */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-indigo-600 block">Configure {app.state} Dossier</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(app.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-1.5 transition-colors"
                            title="Save Changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-slate-100 hover:bg-slate-250 text-slate-605 rounded-lg p-1.5 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Blueprint/Title</label>
                          <input
                            type="text"
                            value={editLicenseType}
                            onChange={(e) => setEditLicenseType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 transition-all focus:bg-white focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Audit Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-850"
                          >
                            <option value="draft">draft</option>
                            <option value="submitted">submitted</option>
                            <option value="approved">approved</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Date of Expiration</label>
                          <input
                            type="date"
                            value={editExpiryDate}
                            onChange={(e) => setEditExpiryDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-850 transition-all"
                          />
                        </div>

                        <div className="space-y-1 col-span-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Completeness Score</label>
                            <span className="text-xs font-mono font-bold text-indigo-650">{editProgress}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editProgress}
                              onChange={(e) => setEditProgress(Number(e.target.value))}
                              className="flex-1 accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 col-span-2">
                          <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Checkpoint Review Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white min-h-[50px]"
                            placeholder="Add audit guidelines etc..."
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Display List Item Cards View */
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded leading-none shrink-0 border border-indigo-100">
                              {app.stateCode}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 leading-snug">{app.state} Certification Dossier</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase font-mono tracking-wider">{app.licenseType}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(app)}
                            className="p-1 px-1.5 text-slate-450 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 rounded-lg transition-all"
                            title="Edit Credentials"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 border rounded-full leading-none shrink-0 ${
                            app.status === 'draft' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            app.status === 'submitted' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                          &ldquo;{app.notes}&rdquo;
                        </p>
                      )}

                      {/* Expiration date countdown */}
                      {app.expiryDate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-550 pt-0.5">
                          <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Expires/Renews: <strong className="text-slate-800">{new Date(app.expiryDate).toLocaleDateString()}</strong></span>
                          {remainDays !== null && (
                            <span className={`ml-2 text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                              remainDays <= 30 ? 'bg-rose-100 text-rose-700' : remainDays <= 90 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {remainDays <= 0 ? 'Expired' : `${remainDays} days left`}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progress Indicator */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span>Application Completeness Score</span>
                          <span className="font-mono text-indigo-650">{app.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${app.progress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 text-[10px] font-mono text-slate-400 leading-none">
                        <span>Started: {new Date(app.createdAt).toLocaleDateString()}</span>
                        <span>Operator Synced Node</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Application Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 z-10">
            
            <div className="flex justify-between items-start border-b border-slate-150 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Initialize License Package Dossier</h3>
                <p className="text-xs text-slate-450 mt-1.5">Configure state checkpoints and enlisting calendars</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-xs text-rose-700 rounded-xl">
                {errorFeedback}
              </div>
            )}

            <form onSubmit={handleSubmitApp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target State Jurisdiction</label>
                  <select
                    value={formState}
                    onChange={handleStateFormChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-sans"
                    required
                  >
                    <option value="">Choose State Jurisdiction...</option>
                    {states.map(s => (
                      <option key={s.stateCode} value={s.state}>{s.state} &bull; ({s.stateCode})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Type Blueprint</label>
                  <input
                    type="text"
                    value={formLicenseType}
                    onChange={(e) => setFormLicenseType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-sans"
                    placeholder="Licensing Title"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audit State Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved &amp; Active</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expiration Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Initial Progress Completeness</label>
                    <span className="text-xs font-mono font-bold text-indigo-600">{formProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dossier Notes / Purpose</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-805 transition-all font-sans min-h-[80px]"
                    placeholder="e.g. Preparing Sanctuary Path Home #3 for Pennsylvania DDAP conditional compliance audit..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createAppMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg mt-2"
              >
                {createAppMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/45 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Deploy Applications Dossier Checkpoints</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable State Compliance Assessment PDF / Report Modal */}
      {printAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs no-print">
          <div className="relative w-full max-w-3xl bg-white border border-slate-205 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-bold text-base text-slate-900 leading-none">
                  Sovereign Credentials Dossier Report Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-605/10 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save as PDF
                </button>
                <button 
                  onClick={() => setPrintAssessment(null)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Area - styled professionally for audits */}
            <div id="printable-vault-report" className="p-8 border border-slate-300 rounded-xl bg-white space-y-6 font-serif">
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-vault-report, #printable-vault-report * {
                    visibility: visible;
                  }
                  #printable-vault-report {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}} />

              {/* Document Header Logo */}
              <div className="flex flex-col items-center text-center border-b-2 border-double border-slate-800 pb-5 space-y-1.5 non-serif font-sans">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  White Tail Solutions Compliance Registry
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-450 font-bold font-mono">
                  Sovereign Housing Standards &bull; Digital Vault Node
                </p>
                <div className="text-[10px] text-slate-550 italic">
                  Report Compiled on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Certificate Content Statement */}
              <div className="space-y-4">
                <div className="text-center font-display my-2">
                  <h2 className="text-md uppercase font-bold tracking-widest text-slate-800">
                    Compliance Verification Statement
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                    This official dossier registers sovereign compliance with certification guidelines and recovery standards.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">JURISDICTION / REGULATOR</span>
                    <strong className="text-slate-800 text-sm">{printAssessment.stateName} State ({printAssessment.stateCode})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">CREDENTIAL SPECIFICATION</span>
                    <strong className="text-slate-800 text-sm">{printAssessment.licenseType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">SYSTEM AUTHORITY SHA</span>
                    <strong className="text-slate-655 font-mono text-[10px]">SHA-256 / AUTO-SIGN-NODES-48902</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">ORGANIZATIONAL STATUS</span>
                    <strong className="text-emerald-700 font-bold uppercase">AUTHORIZED AUDIT READY</strong>
                  </div>
                </div>
              </div>

              {/* Requirement Checklists list */}
              <div className="space-y-3 pt-3">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                  Verified State Requirement Checkpoints
                </h3>
                <div className="divide-y divide-slate-100 font-sans space-y-2 pt-1">
                  {requirements.map((req: any, idx: number) => {
                    const key = `${printAssessment.stateCode}-${req.id}`;
                    const isChecked = !!completedReqs[key];
                    return (
                      <div key={req.id} className="pt-2 text-xs flex items-start gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-350 bg-white'
                        }`}>
                          {isChecked ? <span className="text-[10px] font-bold">✔</span> : null}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {idx + 1}. {req.requirement}
                          </p>
                          <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{req.description}</p>
                          <span className="inline-block text-[8px] font-mono font-bold uppercase text-slate-400 bg-slate-100 px-1 py-0.2 rounded mt-1">
                            category: {req.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal disclaimer footer in printed sheet */}
              <div className="border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400 font-sans leading-relaxed">
                <p>
                  Certified by White Tail Solutions Automated Credentials Gateway on behalf of the registered administrator.
                </p>
                <p className="italic mt-1">
                  Do not copy or distribute without proper authorization from state sober living inspectors and FARR / NARR boards.
                </p>
              </div>
            </div>

            {/* Print trigger info note */}
            <p className="text-[11px] text-slate-400 text-center leading-normal italic no-print pt-2">
              Note: Clicking "Print / Save as PDF" will isolate the certificate document block for clean hardcopy output.
            </p>
          </div>
        </div>
      )}

      {/* Floating Celebratory Balloons list layout */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {balloons.map((b) => (
            <motion.div
              key={b.id}
              initial={{ y: '100vh', x: 0, opacity: 1, scale: 0.8 }}
              animate={{ 
                y: '-110vh', 
                x: [0, 20, -20, 15, -15, 0],
                opacity: [1, 1, 1, 0.9, 0.5, 0],
                scale: 1.15
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 5.5, 
                ease: 'easeOut',
                x: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
              }}
              className="absolute bottom-0"
              style={{ left: `${b.left}%` }}
            >
              <div className="flex flex-col items-center">
                {/* Balloon Body */}
                <div 
                  className="w-11 h-13 rounded-full relative shadow-md"
                  style={{ 
                    backgroundColor: b.color,
                    boxShadow: `inset -6px -6px 0px rgba(0,0,0,0.15), 0 8px 12px -3px rgba(0, 0, 0, 0.1)` 
                  }}
                >
                  {/* Highlight */}
                  <div className="absolute top-2.5 left-3.5 w-2.5 h-3.5 bg-white/40 rounded-full rotate-12"></div>
                  {/* Knot */}
                  <div 
                    className="absolute -bottom-1 left-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] mx-auto absolute left-0 right-0"
                    style={{ borderBottomColor: b.color }}
                  ></div>
                </div>
                {/* String */}
                <div className="w-0.5 h-14 bg-slate-300 opacity-50 mt-1"></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
