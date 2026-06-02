/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { trpc } from '../providers/trpc';
import { 
  Plus, 
  Search, 
  Users, 
  GraduationCap, 
  ShieldAlert, 
  Trash2, 
  UserPlus, 
  AlertCircle,
  FileCheck2,
  Calendar,
  X,
  Phone,
  User,
  MoreVertical
} from 'lucide-react';

export const Residents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Queries & Mutations
  const { data: residents = [], isLoading, refetch } = trpc.residents.list.useQuery();
  const createResident = trpc.residents.create.useMutation();
  const updateResident = trpc.residents.update.useMutation();
  const deleteResident = trpc.residents.delete.useMutation();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorFeedback(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setRoomNumber('');
    setEmergencyContact('');
    setEmergencyPhone('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback(null);

    if (!firstName || !lastName) {
      setErrorFeedback('First and last name are required to proceed.');
      return;
    }

    try {
      await createResident.mutateAsync({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        roomNumber,
        emergencyContact,
        emergencyPhone,
        notes
      });
      refetch();
      handleCloseModal();
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to file resident check-in');
    }
  };

  const handleUpdateStatus = async (id: number, field: 'status' | 'backgroundCheckStatus' | 'drugTestStatus', val: string) => {
    try {
      await updateResident.mutateAsync({ [field]: val }, id);
      refetch();
    } catch (err) {
      console.error('Failed to update parameter', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolute sure you want to archive this resident record sheet?')) return;
    try {
      await deleteResident.mutateAsync(undefined, id);
      refetch();
    } catch (err) {
      console.error('Failed to delete resident', err);
    }
  };

  // Aggregators for KPI count blocks
  const totalCount = residents.length;
  const activeCount = residents.filter(r => r.status === 'active').length;
  const graduatedCount = residents.filter(r => r.status === 'graduated').length;
  const bgPendingCount = residents.filter(r => r.backgroundCheckStatus === 'pending').length;

  // Filter residents list
  const filteredResidents = residents.filter(r => {
    const tabMatch = activeTab === 'all' || r.status === 'active';
    const query = searchTerm.toLowerCase();
    const searchMatch = 
      r.firstName.toLowerCase().includes(query) || 
      r.lastName.toLowerCase().includes(query) ||
      (r.email && r.email.toLowerCase().includes(query)) ||
      (r.roomNumber && r.roomNumber.toLowerCase().includes(query));
    return tabMatch && searchMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Resident Tracker
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Admit, monitor, screen, and archive secure resident information data sheets
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Conduct Resident Admission
        </button>
      </div>

      {/* Roster KPI Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Filed Roster</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{totalCount}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active In-House</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{activeCount}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-650">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Graduated peers</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{graduatedCount}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BG Scans Pending</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{bgPendingCount}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-650">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Tab Selector Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex bg-slate-100/85 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              activeTab === 'active' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            Active In-House
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              activeTab === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            All Historic Filed
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resident or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-800 transition-all font-sans"
          />
        </div>
      </div>

      {/* Main Grid/List for Residents */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6 animate-pulse">
          {[1,2].map(i => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-white p-12 rounded-2xl text-center space-y-3 font-display">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No matching resident logs</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Filing full intake profiles matches residents with room placements and legal checklists instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResidents.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-shadow relative overflow-hidden">
              
              {/* Badge/Avatar Row */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-250 text-slate-600 font-display font-semibold">
                      {r.firstName[0]}{r.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {r.firstName} {r.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Room PLACED: <span className="font-semibold text-slate-600 uppercase bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm">{r.roomNumber || 'unassigned'}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateStatus(r.id, 'status', e.target.value)}
                      className={`text-[9px] uppercase font-bold px-2 py-1 rounded-full border leading-none shrink-0 outline-none cursor-pointer ${
                        r.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        r.status === 'graduated' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        r.status === 'violated' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="graduated">Graduated</option>
                      <option value="violated">Relapsed/Violated</option>
                      <option value="inactive">Inactive/Other</option>
                    </select>
                    
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                      title="Archive Resident Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub Metadata parameters */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none">Background scan</p>
                    <select
                      value={r.backgroundCheckStatus}
                      onChange={(e) => handleUpdateStatus(r.id, 'backgroundCheckStatus', e.target.value)}
                      className={`text-xs font-semibold leading-relaxed block bg-transparent border-none outline-none cursor-pointer mt-1 ${
                        r.backgroundCheckStatus === 'passed' ? 'text-emerald-700' :
                        r.backgroundCheckStatus === 'failed' ? 'text-rose-700' :
                        'text-amber-600'
                      }`}
                    >
                      <option value="pending">⏳ Pending Check</option>
                      <option value="passed">✅ Passed / Verified</option>
                      <option value="failed">❌ Failed / Term</option>
                      <option value="not_required">🚫 Not Required</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none">Urinalysis Tox Screen</p>
                    <select
                      value={r.drugTestStatus}
                      onChange={(e) => handleUpdateStatus(r.id, 'drugTestStatus', e.target.value)}
                      className={`text-xs font-semibold leading-relaxed block bg-transparent border-none outline-none cursor-pointer mt-1 ${
                        r.drugTestStatus === 'passed' ? 'text-emerald-700' :
                        r.drugTestStatus === 'failed' ? 'text-rose-700' :
                        'text-amber-600'
                      }`}
                    >
                      <option value="pending">⏳ Pending Screen</option>
                      <option value="passed">✅ Passed Clear</option>
                      <option value="failed">❌ Refused / Relapse</option>
                      <option value="scheduled">📅 Scheduled</option>
                    </select>
                  </div>
                </div>

                {/* Optional description notes */}
                {r.notes && (
                  <p className="text-xs text-slate-500 leading-normal bg-slate-100/40 p-2.5 rounded-lg border border-slate-100/50">
                    {r.notes}
                  </p>
                )}
              </div>

              {/* Emergency Contact Footer block */}
              <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-405 leading-none">
                <span>Admitted: {new Date(r.intakeDate).toLocaleDateString()}</span>
                {r.emergencyContact && r.emergencyPhone && (
                  <span className="text-slate-450 hover:text-slate-700 transition-colors uppercase font-semibold flex items-center gap-1" title={`Contact: ${r.emergencyContact}`}>
                    <Phone className="w-2.5 h-2.5" /> ICE Profile OK
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Admission Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-150 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Execute Resident Admission Sheets</h3>
                <p className="text-xs text-slate-450 mt-1.5">File regulatory profiles, emergency contacts, and assigned rooms</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resident First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resident Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resident Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all font-sans"
                    placeholder="name@recovering.org"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resident Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all font-sans"
                    placeholder="412-555-0100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bed / Room Assigned</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all uppercase"
                    placeholder="e.g. Room A-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-1 px-3 text-sm text-slate-800 transition-all font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all"
                    placeholder="Sarah Miller"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all font-sans"
                    placeholder="412-555-0199"
                  />
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-4">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Relapse planning &amp; intake notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-800 transition-all min-h-[85px]"
                  placeholder="e.g. Primary recovery sponsor, active physical restrictions, custom compliance variables..."
                />
              </div>

              <button
                type="submit"
                disabled={createResident.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                {createResident.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/45 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Conduct Check-In &amp; Admit Resident</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
