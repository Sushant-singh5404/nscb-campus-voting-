import React from 'react';
import { VoterProfile } from '../types';
import { COLLEGE_NAME, ELECTION_YEAR } from '../data/electionData';
import { Shield, Vote, Lock, Users, Building2, FileCheck2, UserCheck, Sparkles, Landmark, LogIn, LogOut, UserPlus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'booth' | 'vault' | 'candidates' | 'departments' | 'commission' | 'auth';
  setActiveTab: (tab: 'booth' | 'vault' | 'candidates' | 'departments' | 'commission' | 'auth') => void;
  currentVoter: VoterProfile | null;
  onOpenVoterModal: () => void;
  onSignOut: () => void;
  vaultBallotsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentVoter,
  onOpenVoterModal,
  onSignOut,
  vaultBallotsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top institution ribbon */}
      <div className="bg-gradient-to-r from-amber-700 via-slate-900 to-emerald-800 px-4 py-1 text-[11px] font-medium text-slate-200 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-amber-300 uppercase tracking-wider">OFFICIAL ELECTION TRIBUNAL</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-300">Netaji Subhas Chandra Bose College Campus Election Portal</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-amber-300 font-mono">
            <Lock className="w-3 h-3" /> Vault: {vaultBallotsCount} Sealed
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
            POLLS OPEN
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* College Crest & Title */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('booth')}>
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-slate-900 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-bold border border-amber-500/40">
              <Landmark className="w-6 h-6 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide font-collegiate leading-tight">
                {COLLEGE_NAME}
              </h1>
            </div>
            <p className="text-xs text-amber-400/90 font-medium flex items-center gap-2">
              <span>Students' Union Elections {ELECTION_YEAR}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Voting Vault Verified</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            id="nav-tab-booth"
            onClick={() => setActiveTab('booth')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'booth'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Voting Booth</span>
          </button>

          <button
            id="nav-tab-vault"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'vault'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Voting Vault</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <button
            id="nav-tab-candidates"
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidates</span>
          </button>

          <button
            id="nav-tab-departments"
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'departments'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments</span>
          </button>

          <button
            id="nav-tab-commission"
            onClick={() => setActiveTab('commission')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'commission'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Rules & Tally</span>
          </button>

          <button
            id="nav-tab-auth"
            onClick={() => setActiveTab('auth')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'auth'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 bg-slate-900/60 border border-amber-500/30'
            }`}
          >
            {currentVoter ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>My ID Card</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Sign In / Register</span>
              </>
            )}
          </button>
        </nav>

        {/* Voter Status, Digital ID & Sign Out Actions */}
        <div className="flex items-center gap-2">
          {currentVoter ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-voter-profile-chip"
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/60 transition-all text-left group"
                title="View Digital Voter ID Card"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                    <span>{currentVoter.name}</span>
                    {currentVoter.hasVoted && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                        VOTED
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentVoter.studentId}
                  </p>
                </div>
              </button>

              <button
                id="btn-header-signout"
                onClick={onSignOut}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-header-signin"
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>

              <button
                id="btn-header-register"
                onClick={() => setActiveTab('auth')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-bold text-xs shadow-md transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
