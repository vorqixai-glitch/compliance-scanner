/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { trpc } from '../providers/trpc';
import { 
  FileText, 
  Signature, 
  Plus, 
  Trash2, 
  Activity, 
  FileCheck2, 
  Calendar, 
  Sparkles,
  Search,
  CheckCircle,
  Eye,
  X,
  BookOpen
} from 'lucide-react';

export const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'templates'>('my');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  // View states
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'resident_agreement' | 'house_rules' | 'drug_testing' | 'emergency_plan' | 'financial_policy'>('resident_agreement');
  const [content, setContent] = useState('');
  
  // Signature State
  const [signerName, setSignerName] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  // Queries & Mutations
  const { data: documents = [], isLoading, refetch } = trpc.documents.list.useQuery();
  const createDoc = trpc.documents.create.useMutation();
  const updateDoc = trpc.documents.update.useMutation();
  const deleteDoc = trpc.documents.delete.useMutation();

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setErrorFeedback('Title and content are required parameters');
      return;
    }

    try {
      await createDoc.mutateAsync({
        title,
        category,
        content,
        docType: 'generated'
      });
      refetch();
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setCategory('resident_agreement');
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to file lease document');
    }
  };

  const handleUseTemplate = async (template: any) => {
    try {
      await createDoc.mutateAsync({
        title: `${template.title} Copy`,
        category: template.category,
        content: template.content,
        docType: 'generated'
      });
      refetch();
      setActiveTab('my');
    } catch (err) {
      console.error('Failed to cloned template to active list', err);
    }
  };

  const handleSignDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName) {
      setErrorFeedback('Please provide the signee authority name');
      return;
    }

    try {
      await updateDoc.mutateAsync({
        signed: 'yes',
        signedBy: signerName,
        signedAt: new Date().toISOString()
      }, selectedDoc.id);
      refetch();
      setIsSignOpen(false);
      setSignerName('');
      setSelectedDoc(null);
    } catch (err: any) {
      setErrorFeedback(err.message || 'Failed to finalize signature');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolute sure you want to discard this document?')) return;
    try {
      await deleteDoc.mutateAsync(undefined, id);
      refetch();
    } catch (err) {
      console.error('Failed to delete document ledger', err);
    }
  };

  // Pre-configured elegant static template models
  const STATIC_TEMPLATES = [
    {
      id: 't-1',
      title: "Resident Admission Agreement",
      category: "resident_agreement" as const,
      description: "NARR Level-compliant intake covenant listing fire, curfew, drug-free safety codes.",
      content: `### SOBER LIVING HOUSING AGREEMENT

This Covenant is executed between White Tail Solutions Operator and the Resident.

1. **Zero-Tolerance Protocol**: Possession or consumption of alcoholic beverages or non-prescribed chemical substances results in safety clinical transfer options.
2. **Personal Governance**: Resident coordinates general health practices, tidies their room daily, and executes delegated household clean chores.
3. **Weekly Checksheets**: Maintain high-integrity sponsor check-ups weekly.`
    },
    {
      id: 't-2',
      title: "House Rules & Guidelines",
      category: "house_rules" as const,
      description: "Detailed curfew regulations and weekly corporate support meeting parameters.",
      content: `### SOBER COMMUNITY GOVERNANCE MANUAL

1. Keep shared kitchen components sterile after each preparation.
2. Curfew timings: 10:00 PM Sunday-Thursday; 11:30 PM Friday-Saturday.
3. Silence begins daily at 10:30 PM and terminates at 07:00 AM.`
    },
    {
      id: 't-3',
      title: "Drug Testing Protocol",
      category: "drug_testing" as const,
      description: "Non-punitive screening consent rules validating random toxicology assays.",
      content: `### ETHICAL SPECTRUM TOXICOLOGY SCREEN MANDATES

1. Random urinalysis screenings may be announced at arbitrary intervals.
2. Tampering, diluting, or declining to generate a specimen equates to a relapse assertion.
3. Interventions favor peer-led clinical transitions instead of punitive eviction discharges.`
    },
    {
      id: 't-4',
      title: "Emergency Response Plan",
      category: "emergency_plan" as const,
      description: "Crisis drills, first-aid accessibility, and safe evacuation maps directives.",
      content: `### CRITICAL INCIDENT EMERGENCY DISPATCH RULES

1. Fire marshals confirm testing lines are clear weekly.
2. First-aid locker keys remain mounted near common entrance console.
3. Immediately coordinate safety evacuations during structural anomalies.`
    },
    {
      id: 't-5',
      title: "Financial Policy & Lodging Fees",
      category: "financial_policy" as const,
      description: "Explicit refund covenants, room dues ledgers, and billing safeguards.",
      content: `### LODGING ACCOUNTABILITY AND DUPLICATIONS BILLING

1. Room fee assessments are drafted weekly on Friday evenings.
2. Refunds for voluntary early departures are calculated with a 48-hour grace ledger window.
3. Transparencies dictate no patient broker commission deals with clinical centers.`
    }
  ];

  const activeDocs = documents.filter(d => d.docType === 'generated');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">
            Document Center
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Draft, preview, copy templates, and execute e-signatures for housing covenants
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Draft Custom Document
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-100/85 p-1 rounded-xl max-w-md">
        <button
          id="tab-my-docs"
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
            activeTab === 'my' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          My Active Agreements ({activeDocs.length})
        </button>
        <button
          id="tab-template-library"
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all ${
            activeTab === 'templates' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          Standard Templates Library ({STATIC_TEMPLATES.length})
        </button>
      </div>

      {/* ACTIVE AGREEMENTS SCREEN */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : activeDocs.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white p-12 rounded-2xl text-center space-y-4 font-display">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No active housing documents filed</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select the <strong>Templates Library</strong> tab above to clone standard sober home agreements, or draft a blank custom pact instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDocs.map((doc: any) => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{doc.title}</h4>
                        <span className="inline-block text-[9px] uppercase font-mono font-bold bg-indigo-50 border border-indigo-100/60 text-indigo-700 px-2 mt-1.5 rounded-sm">
                          {doc.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.signed === 'yes' ? (
                          <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 border border-emerald-110 px-2 py-0.5 rounded-full leading-none">
                            E-Signed
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-110 px-2 py-0.5 rounded-full leading-none">
                            Pending Sign
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Compact preview of text truncated */}
                    <p className="text-xs text-slate-505 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl max-h-[85px] overflow-hidden truncate whitespace-pre-wrap font-sans">
                      {doc.content}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => { setSelectedDoc(doc); setIsViewOpen(true); }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Pact
                    </button>

                    {doc.signed !== 'yes' && (
                      <button
                        onClick={() => { setSelectedDoc(doc); setIsSignOpen(true); }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-850 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Signature className="w-3.5 h-3.5" /> Sign Digital Pact
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STANDARD TEMPLATES LOBBY SCREEN */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {STATIC_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{tpl.title}</h4>
                  <p className="text-xs text-slate-450 mt-1 lines-2-ellipsis leading-relaxed">{tpl.description}</p>
                </div>
              </div>

              <div className="border-t border-slate-100/80 mt-5 pt-4 flex items-center justify-between">
                <button
                  onClick={() => { setSelectedDoc(tpl); setIsViewOpen(true); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  View Blueprint
                </button>
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/60 px-3 py-1.5 rounded-lg border border-indigo-120/50 transition-all font-display"
                >
                  Clone into Active Covenants &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View/Preview Modal */}
      {isViewOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => { setIsViewOpen(false); setSelectedDoc(null); }}></div>
          <div className="relative w-full max-w-xl bg-white border border-slate-205 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">{selectedDoc.title}</h3>
                <p className="text-[10px] uppercase font-mono font-bold text-indigo-500 mt-2 tracking-wide leading-none">
                  Sober Housing Pact Checklist
                </p>
              </div>
              <button 
                onClick={() => { setIsViewOpen(false); setSelectedDoc(null); }}
                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document body text */}
            <div className="prose prose-sm max-w-none text-xs text-slate-600 bg-slate-50 border border-slate-150 p-6 rounded-2xl whitespace-pre-wrap font-sans leading-relaxed">
              {selectedDoc.content}
            </div>

            {selectedDoc.signed === 'yes' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-800 leading-none">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1 font-display">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-550" /> Secure digital e-signature verified
                </span>
                <span className="font-mono text-emerald-600">Signee: {selectedDoc.signedBy} &bull; {new Date(selectedDoc.signedAt).toLocaleDateString()}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsViewOpen(false); setSelectedDoc(null); }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Digital Agreement Modal */}
      {isSignOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => { setIsSignOpen(false); setSelectedDoc(null); }}></div>
          <div className="relative w-full max-w-md bg-white border border-slate-205 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Execute Digital E-Signature</h3>
                <p className="text-xs text-slate-450 mt-1.5">Sign as operator or resident authority</p>
              </div>
              <button 
                onClick={() => { setIsSignOpen(false); setSelectedDoc(null); }}
                className="p-1 rounded-lg border border-slate-200 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-xs text-rose-705 rounded-lg">
                {errorFeedback}
              </div>
            )}

            <form onSubmit={handleSignDocSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Signing Authority Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all font-sans"
                  placeholder="e.g. Resident James Miller or Director Vance"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Signature className="w-4 h-4" />
                <span>Verify Signature and Seal Covenant</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New blank custom doc Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-150 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Draft Custom Housing Agreement</h3>
                <p className="text-xs text-slate-450 mt-1.5">Compose special covenants, rules or guidelines blank sheets</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all"
                  placeholder="e.g. Curfew & Weekend Extension Agreement"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Agreement Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3 text-sm text-slate-800 transition-all"
                  required
                >
                  <option value="resident_agreement">Resident Agreement Sheets</option>
                  <option value="house_rules">House Rules Guidelines</option>
                  <option value="drug_testing">Drug testing & Toxicology Rules</option>
                  <option value="emergency_plan">Emergency Relapse response plans</option>
                  <option value="financial_policy">Financial Policy lodging fees</option>
                  <option value="other">Other specialized contracts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Covenants / Content Body</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-3 text-xs text-slate-800 transition-all min-h-[150px] font-mono leading-relaxed"
                  placeholder="Use markdown formatting tags if desired..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center"
              >
                <span>Draft and File in Locker</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
