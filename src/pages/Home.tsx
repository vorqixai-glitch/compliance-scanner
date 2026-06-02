/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  FileSignature, 
  Sparkles, 
  CheckSquare, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Play
} from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 scroll-smooth">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <span className="font-display font-bold text-xl tracking-tight">W</span>
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 block leading-none">
                WHITE TAIL
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Solutions Compliance
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 transition-all"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/10 hover:shadow-lg px-5 py-2.5 rounded-xl transition-all h-10 flex items-center"
            >
              Register Account
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-radial from-slate-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/60 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider font-display uppercase">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Sober Living Compliance Engine
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight">
              Operational Peace of Mind for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">Sober Living Operators</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transition away from chaotic spreadsheets and compliance guesswork. Streamline state licensing applications, resident drug screening, digital agreements, and track NARR compliance markers in one unified ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                Launch Operator Terminal
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-slate-500 fill-slate-500" />
                Preview Video Demo
              </button>
            </div>
            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 border-t border-slate-200/60 mt-10">
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-none">10 States</p>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Operational Guides</p>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <p className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-none">100%</p>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">NARR Standardized</p>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <p className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-none">HIPAA</p>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Secure Hosting</p>
              </div>
            </div>
          </div>
          {/* Hero Artwork Card */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl filter blur-3xl transform -translate-x-4 -translate-y-4"></div>
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono uppercase">Operator Live</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 leading-none">PA DDAP License Status</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 font-mono">ID: PA-DDAP-9921</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">Active</span>
                </div>

                <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><Users className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 leading-none">Resident Beds occupancy</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">James M. (A-2) &bull; Sarah P. (B-1)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono">11 / 12</span>
                </div>

                <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-50 border border-violet-100 text-violet-600 rounded-lg flex items-center justify-center"><FileSignature className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 leading-none">Resident Admissions Agreement</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">E-Signed today 09:12 AM</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full font-semibold">Signed</span>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                <span>Database Sync OK</span>
                <span>UTC Secure Server</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Integrated Tools Built Specifically for Recovering Communities
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Standard billing and generic CRM platforms fail when applied to recovery houses. White Tail Solutions is architected specifically around state rules and ethical standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">State Licensing guides</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Unlock instant guidelines for 10 prominent states (PA, FL, CA, OH, AZ, UT, TX, NY, MI, CO). Auto-generate custom compliance tasks matching local ordinances.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">Resident Tracker</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Add residents, distribute room placements, file detailed operational histories, and track background checks alongside toxicological testing sheets.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><FileSignature className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">Digital Agreements</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Utilize integrated sober-home agreement templates. Pre-populate covenants with resident data, capture compliant digital e-signatures instantly.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><CheckSquare className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">Compliance checklist</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Structured checklist board divided by Priority levels. Ensures your facilities, documentation, staffing indexes, and facility rules remain 100% auditable.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-650 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">AI Assistant Partner</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Query state regulations natively via our intelligent AI agent. Draft curfews, review licensing conditions, or check proper lockbox medication storage configurations.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all space-y-5">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Sliders className="w-6 h-6" /></div>
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">Expert Consultations</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Connect and schedule live video reviews with accreditation and peer-house specialists when applying for official FARR, DDAP, or NARR credentials.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Trust Quote CTA */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply"></div>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative">
          <TrendingUp className="w-10 h-10 text-indigo-400 mx-auto" />
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-white leading-tight">
            "Before White Tail, coordinating FARR certification and resident house files meant endless paper cabinets. Today it's all automated and secure."
          </h2>
          <div>
            <p className="font-semibold text-sm text-indigo-300 font-display">Marcus Vance</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Founding Director, Sanctuary Path Residences (14 Properties, Florida)</p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => onNavigate('/login')}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Start Operator Registration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
