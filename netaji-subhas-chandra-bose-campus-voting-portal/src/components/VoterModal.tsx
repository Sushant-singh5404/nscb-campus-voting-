import React, { useState } from 'react';
import { VoterProfile, DepartmentInfo } from '../types';
import { DEMO_REGISTERED_VOTERS } from '../data/electionData';
import { X, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, UserPlus, Info } from 'lucide-react';

interface VoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoter: VoterProfile | null;
  onSelectVoter: (voter: VoterProfile) => void;
  departments: DepartmentInfo[];
}

export const VoterModal: React.FC<VoterModalProps> = ({
  isOpen,
  onClose,
  currentVoter,
  onSelectVoter,
  departments,
}) => {
  const [customRoll, setCustomRoll] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDept, setCustomDept] = useState(departments[0]?.id || 'dept-cse');
  const [customYear, setCustomYear] = useState('3rd Year');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoll.trim() || !customName.trim()) return;

    const newVoter: VoterProfile = {
      studentId: customRoll.trim().toUpperCase(),
      name: customName.trim(),
      departmentId: customDept,
      year: customYear,
      email: `${customRoll.trim().toLowerCase()}@nscb.edu.in`,
      isVerified: true,
      hasVoted: false,
    };

    onSelectVoter(newVoter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="voter-verification-modal"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-collegiate">
                Voter Verification Desk
              </h3>
              <p className="text-xs text-slate-400">
                Netaji Subhas Chandra Bose College Electoral Roll
              </p>
            </div>
          </div>
          <button
            id="btn-close-voter-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Presets vs Custom */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            id="tab-preset-voters"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'preset'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Select Registered Student (Instant)</span>
          </button>
          <button
            id="tab-custom-voter"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Enter Custom Roll Number</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {activeTab === 'preset' ? (
            <div>
              <p className="text-xs text-slate-400 mb-3">
                Select any verified student profile across different campus departments to cast a sample secret ballot or test the Voting Vault:
              </p>
              <div className="space-y-2.5">
                {DEMO_REGISTERED_VOTERS.map((voter) => {
                  const dept = departments.find(d => d.id === voter.departmentId);
                  const isCurrent = currentVoter?.studentId === voter.studentId;
                  return (
                    <button
                      key={voter.studentId}
                      id={`btn-select-voter-${voter.studentId}`}
                      onClick={() => {
                        onSelectVoter(voter);
                        onClose();
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                          : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isCurrent ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
                        }`}>
                          {dept?.code || 'ST'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-amber-300">
                              {voter.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {dept?.name} • Roll: <span className="font-mono text-slate-300">{voter.studentId}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {voter.hasVoted ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ballot Sealed
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 group-hover:text-amber-300 flex items-center gap-1 font-medium">
                            Vote Now <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Das"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NSCB College Roll / Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024CSE099"
                  value={customRoll}
                  onChange={(e) => setCustomRoll(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate">PG / Research Scholar</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-custom-voter"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify ID & Authorize Ballot</span>
              </button>
            </form>
          )}

          {/* Lyngdoh Committee & Integrity note */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Compliance:</strong> In accordance with Lyngdoh Committee recommendations and the Netaji Subhas Chandra Bose College Election Code, each student is eligible to cast exactly one confidential digital ballot for their department and executive posts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
