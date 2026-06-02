/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { trpc } from '../providers/trpc';
import { 
  Plus, 
  Calendar, 
  Clock, 
  PhoneCall, 
  Award, 
  UserSquare2, 
  AlertCircle,
  Clock3,
  X,
  Phone,
  Video
} from 'lucide-react';

export const Consulting: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState('exp-1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [details, setDetails] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Queries & Mutations
  const { data: bookings = [], isLoading, refetch } = trpc.consulting.list.useQuery();
  const createBooking = trpc.consulting.create.useMutation();

  const EXPERTS = [
    {
      id: 'exp-1',
      name: "Dr. Elizabeth Brooks",
      domain: "Licensing Audits & Credentialing",
      bio: "Former Lead compliance officer for Pennsylvania DDAP. Over 18 years drafting level 1-4 standard rules.",
      experience: "18+ Years",
      tags: ["FARR", "DDAP", "NARR-3"]
    },
    {
      id: 'exp-2',
      name: "Marc Vance, CPA",
      domain: "Patient Broker Legislation & Finance",
      bio: "Sober living forensic accountant specializing in transparency pricing and anti-kickback compliance policies.",
      experience: "12+ Years",
      tags: ["Ethics", "Lodging Fees", "IRS"]
    },
    {
      id: 'exp-3',
      name: "Sarah Jenkins, JD",
      domain: "ADA & Fair Housing Litigation",
      bio: "Special counsel defending municipal zoning access for recovery populations. Fights municipal lockouts.",
      experience: "15+ Years",
      tags: ["Zoning", "ADA", "Federal Law"]
    }
  ];

  const handleOpenBooking = (expertId: string) => {
    setSelectedExpertId(expertId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorFeedback(null);
    setDate('');
    setTime('10:00 AM');
    setDetails('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !details) {
      setErrorFeedback('Date and detailed objective are required to book');
      return;
    }

    const expert = EXPERTS.find(exp => exp.id === selectedExpertId) || EXPERTS[0];

    try {
      await createBooking.mutateAsync({
        expertName: expert.name,
        expertDomain: expert.domain,
        date,
        time,
        notes: details,
        status: 'scheduled'
      });
      refetch();
      handleCloseModal();
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to file consulting request');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Expert Consulting Live Bookings
          </h2>
          <p className="text-slate-550 font-medium text-sm mt-2">
            Schedule direct review sessions with certified sober housing accreditors and legal experts
          </p>
        </div>
      </div>

      {/* Expert roster profile grids */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-indigo-600 leading-none">Verified Compliance Partners</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXPERTS.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{exp.name}</h4>
                    <p className="text-[11px] text-slate-450 font-semibold uppercase font-mono tracking-wide">{exp.domain}</p>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full leading-none shrink-0">
                    {exp.experience}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans">{exp.bio}</p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {exp.tags.map((tg, idx) => (
                    <span key={idx} className="text-[9px] font-mono text-slate-400 font-semibold bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50 uppercase">
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenBooking(exp.id)}
                className="w-full py-2.5 mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 hover:shadow-md h-10 shrink-0"
              >
                <Video className="w-4 h-4 text-slate-400" />
                Schedule Live Review Screen
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming consultation sessions list */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Your Scheduled Consultations</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Confirmed and pending telehealth video review audits</p>
        </div>

        {isLoading ? (
          <div className="h-16 bg-slate-55 rounded-xl animate-pulse"></div>
        ) : bookings.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 bg-white rounded-xl text-center space-y-3 font-display">
            <Clock3 className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-705">No scheduled consultations</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Press any expert&rsquo;s &ldquo;Schedule Live Review&rdquo; button above to prepare application checklists or structural designs live.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b: any) => (
              <div key={b.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-650 border border-slate-200 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850">Consultation with {b.expertName}</h4>
                    <p className="text-[11px] text-indigo-650 font-semibold mt-0.5 leading-none">{b.expertDomain}</p>
                    
                    {b.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg max-w-2xl leading-relaxed italic">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1.5 shrink-0">
                  <span className="inline-block text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full leading-none">
                    {b.status}
                  </span>
                  <p className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(b.date).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">{b.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Booking Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-lg bg-white border border-slate-205 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-150 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Book Live Review Session</h3>
                <p className="text-xs text-slate-450 mt-1.5">Schedule a video conference and customize review goals</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 rounded-lg border border-slate-200 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-xs text-rose-700 rounded-lg">
                {errorFeedback}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned accreditor specialist</label>
                <select
                  value={selectedExpertId}
                  onChange={(e) => setSelectedExpertId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-sans cursor-pointer"
                  required
                >
                  {EXPERTS.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.name} &bull; ({exp.domain})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scheduled Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-1.5 px-3 text-sm text-slate-800 transition-all font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Time window</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all cursor-pointer"
                    required
                  >
                    <option value="10:00 AM">10:00 AM EST</option>
                    <option value="11:30 AM">11:30 AM EST</option>
                    <option value="02:00 PM">02:00 PM EST</option>
                    <option value="04:30 PM">04:30 PM EST</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Core consultation targets / Objective</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-805 transition-all min-h-[90px]"
                  placeholder="e.g. Audit bed placements layout and draft our drug testing protocols for FARR certification..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize and Book Calendar Slot</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
