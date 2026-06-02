/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { trpc } from '../providers/trpc';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Sliders, 
  SlidersHorizontal,
  FolderLock,
  PlusCircle,
  Calendar,
  AlertCircle,
  Clock,
  X,
  Filter
} from 'lucide-react';

export const Compliance: React.FC = () => {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('facility');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Queries & Mutations
  const { data: complianceItems = [], isLoading, refetch } = trpc.compliance.list.useQuery();
  const createItem = trpc.compliance.create.useMutation();
  const updateItem = trpc.compliance.update.useMutation();
  const deleteItem = trpc.compliance.delete.useMutation();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setErrorFeedback('Checklist title is required');
      return;
    }

    try {
      await createItem.mutateAsync({
        title,
        category,
        priority,
        status: 'pending',
        dueDate,
        notes
      });
      refetch();
      setIsModalOpen(false);
      setTitle('');
      setCategory('facility');
      setPriority('medium');
      setDueDate('');
      setNotes('');
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to file audit checklist task');
    }
  };

  const handleUpdateStatus = async (id: number, val: string) => {
    try {
      await updateItem.mutateAsync({ status: val }, id);
      refetch();
    } catch (err) {
      console.error('Failed to change checklist item status', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolute sure you want to discard this auditable checklist item?')) return;
    try {
      await deleteItem.mutateAsync(undefined, id);
      refetch();
    } catch (err) {
      console.error('Failed to delete checklist row', err);
    }
  };

  // Aggregates for KPI cards
  const pendingCount = complianceItems.filter(i => i.status === 'pending').length;
  const inProgressCount = complianceItems.filter(i => i.status === 'in-progress' || i.status === 'in_progress').length;
  const completedCount = complianceItems.filter(i => i.status === 'completed').length;
  const totalCount = complianceItems.length;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks list
  const filteredItems = complianceItems.filter((item) => {
    const priorityMatch = priorityFilter === 'all' || item.priority === priorityFilter;
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    return priorityMatch && categoryMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Compliance Checklist Board
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Audit physical facility parameters, clinical staffing structures, and legal licensing milestones
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Append New Audit Task
        </button>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI: Progress Ring representation */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl md:col-span-1 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Audits Clear Rate</span>
          <div className="flex items-center gap-4 mt-2">
            <p className="font-display font-bold text-4xl text-slate-900 leading-none">{progressPercent}%</p>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-150">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent > 75 ? 'bg-emerald-500' : progressPercent > 40 ? 'bg-amber-400' : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block font-medium">Cleared: {completedCount} / {totalCount} requirements</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending audits</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-400 font-bold text-sm">⏳</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">In-Progress check</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-500 font-bold text-sm">⚙️</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Successfully verified</span>
            <p className="font-display font-bold text-2xl text-slate-900 mt-1 leading-none">{completedCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 font-bold text-sm">✅</div>
        </div>

      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex bg-slate-100/85 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              priorityFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            All Priorities
          </button>
          <button
            onClick={() => setPriorityFilter('high')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              priorityFilter === 'high' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            🔴 High priority
          </button>
          <button
            onClick={() => setPriorityFilter('medium')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold ${
              priorityFilter === 'medium' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            🟡 Medium
          </button>
        </div>

        {/* Category Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs text-slate-750 font-semibold"
          >
            <option value="all">Complete Categories List</option>
            <option value="facility">🏠 Physical Facility parameters</option>
            <option value="clinical">🧑‍⚕️ Clinical Operations &amp; Staff</option>
            <option value="documentation">📄 Admissions Documentation</option>
            <option value="policy">📌 House Policy &amp; Procedures</option>
            <option value="other">🧬 Other Regulations</option>
          </select>
        </div>
      </div>

      {/* Checklist rows sheet */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-dashed border-slate-205 bg-white p-12 rounded-2xl text-center space-y-3 font-display">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No matching auditable metrics found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or append a custom checklist task manually with the button above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-start gap-3.5 overflow-hidden">
                <input
                  type="checkbox"
                  checked={item.status === 'completed'}
                  onChange={() => handleUpdateStatus(item.id, item.status === 'completed' ? 'pending' : 'completed')}
                  className="w-4.5 h-4.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  title="Toggle Completed"
                />
                
                <div className="overflow-hidden space-y-1.5">
                  <p className={`text-sm font-bold leading-snug ${item.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {item.title}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      item.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {item.priority} priority
                    </span>
                    <span className="text-[10px] text-slate-450 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      Category: {item.category.replace('_', ' ')}
                    </span>
                    {item.dueDate && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100/60 p-2.5 rounded-xl font-sans mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Dropdown */}
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                  className={`text-xs font-semibold px-3 py-1.5 border rounded-lg focus:outline-none cursor-pointer ${
                    item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                    item.status === 'in-progress' || item.status === 'in_progress' ? 'bg-amber-50 text-amber-705 border-amber-150' :
                    item.status === 'waived' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                    'bg-slate-50 text-slate-600 border-slate-205'
                  }`}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">⚙️ In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="waived">🚫 Waived</option>
                </select>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-colors"
                  title="Remove Checklist Row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Checklist Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white border border-slate-205 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-150 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Draft Checklist Auditable Task</h3>
                <p className="text-xs text-slate-450 mt-1.5">Compose custom physical or operations parameter targets</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-slate-202 text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-xs text-rose-700 rounded-xl">
                {errorFeedback}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Checklist Item Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all"
                  placeholder="e.g. Conduct weekly smoke alarm fire drilling"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all cursor-pointer"
                    required
                  >
                    <option value="facility">🏠 Physical Facility</option>
                    <option value="clinical">🧑‍⚕️ Clinical Operations</option>
                    <option value="documentation">📄 Admissions Docs</option>
                    <option value="policy">📌 House Policy/Rules</option>
                    <option value="other">🧬 Other Guidelines</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Priority Code</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all cursor-pointer"
                    required
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scheduled Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-1.5 px-3 text-sm text-slate-800 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operational Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-sm text-slate-805 transition-all min-h-[85px]"
                  placeholder="e.g. Ensure keys to cabinet remain locked under supervisor protocol..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <span>Append Audit Task Checks</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
