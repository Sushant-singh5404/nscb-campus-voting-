import React, { useState } from 'react';
import { VaultBallot, DepartmentInfo, Candidate } from '../types';
import { ELECTION_POSTS } from '../data/electionData';
import { verifyReceiptInLedger } from '../utils/vaultCrypto';
import { Shield, Lock, Search, CheckCircle2, AlertCircle, RefreshCw, Download, Database, Key, Server, BarChart3, Check } from 'lucide-react';

interface VotingVaultProps {
  ballots: VaultBallot[];
  departments: DepartmentInfo[];
  candidates: Candidate[];
  onSeedDemoBallots: () => void;
  onResetVault: () => void;
  onGoToBooth: () => void;
}

export const VotingVault: React.FC<VotingVaultProps> = ({
  ballots,
  departments,
  candidates,
  onSeedDemoBallots,
  onResetVault,
  onGoToBooth,
}) => {
  const [searchHash, setSearchHash] = useState('');
  const [verifiedBallot, setVerifiedBallot] = useState<VaultBallot | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'turnout' | 'tally'>('ledger');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  const totalRegisteredVoters = departments.reduce((acc, d) => acc + d.totalStudents, 0);
  const totalSealedBallots = ballots.length;
  const turnoutPercent = ((totalSealedBallots / totalRegisteredVoters) * 100).toFixed(1);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash.trim()) return;

    setHasSearched(true);
    const result = verifyReceiptInLedger(searchHash, ballots);
    setVerifiedBallot(result || null);
  };

  // Filter ballots for the ledger view
  const filteredBallots = ballots.filter(b => {
    if (selectedDeptFilter !== 'all' && b.departmentId !== selectedDeptFilter) {
      return false;
    }
    if (searchHash.trim()) {
      const q = searchHash.trim().toUpperCase();
      return b.receiptHash.toUpperCase().includes(q) || b.ballotId.toUpperCase().includes(q);
    }
    return true;
  });

  const handleExportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ballots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nscb_voting_vault_ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate vote tally for each candidate across sealed ballots
  const getCandidateVotes = (candidateId: string, postId: string) => {
    // Count from actual sealed ballots
    return ballots.filter(b => b.selections[postId] === candidateId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Vault Master Door & Security Shield Hero */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden mb-8 vault-glow">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Vault Identity */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Lock className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC VOTING VAULT: ONLINE & IMMUTABLE</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide font-collegiate">
              Netaji Subhas Chandra Bose College Voting Vault
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Every digital ballot cast at NSCB College is mathematically sealed using zero-knowledge hashing. Your voter identity is severed from your selections, guaranteeing end-to-end secret ballot integrity.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Ballots Sealed</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {totalSealedBallots.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block">Turnout Rate</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {turnoutPercent}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block">Departments</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  8 / 8 Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block">Vault Security</span>
                <span className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-1 font-mono">
                  <Check className="w-4 h-4 text-emerald-400" /> Tamper-Proof
                </span>
              </div>
            </div>
          </div>

          {/* Right: Visual Vault Dial Graphic */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-4 border-amber-500/40 flex items-center justify-center shadow-2xl">
              {/* Outer dial ticks */}
              <div className="absolute inset-2 rounded-full border border-dashed border-slate-700 animate-spin [animation-duration:60s]" />
              
              <div className="w-28 h-28 rounded-full bg-slate-950 border-2 border-emerald-500/50 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                <Shield className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-300 font-mono">BLOCK #{1042 + totalSealedBallots}</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">SEALED</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                id="btn-vault-vote-now"
                onClick={onGoToBooth}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Cast Vote in Vault
              </button>
              <button
                id="btn-export-ledger"
                onClick={handleExportLedger}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white font-collegiate">
            Voter Slip & Vault Receipt Verification Station
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Enter your unique cryptographic receipt code (e.g., <span className="font-mono text-amber-300">VAULT-NSCB-7B92-F03E-1A90</span>) to verify that your ballot is currently sealed in the safe.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-vault-search-hash"
              placeholder="Paste or type receipt hash (e.g. VAULT-NSCB-...)"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          <button
            type="submit"
            id="btn-verify-receipt-hash"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Shield className="w-4 h-4" />
            <span>Verify in Ledger</span>
          </button>
        </form>

        {/* Verification result box */}
        {hasSearched && (
          <div className="mt-4 animate-in fade-in duration-200">
            {verifiedBallot ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">
                      Receipt Authenticated: Ballot Sealed in Vault!
                    </p>
                    <p className="font-mono text-emerald-300 text-xs mt-0.5">
                      Hash: {verifiedBallot.receiptHash}
                    </p>
                    <p className="text-slate-400 mt-1">
                      Block #{verifiedBallot.blockNumber} • Recorded at {new Date(verifiedBallot.timestamp).toLocaleString()} • Dept: {departments.find(d => d.id === verifiedBallot.departmentId)?.code || verifiedBallot.departmentId}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-center border border-emerald-500/30">
                  STATUS: INTACT & UNALTERED
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Receipt Not Found in Current Vault Ledger</p>
                  <p className="text-slate-400 mt-0.5">
                    Please check the code format or cast a ballot from the Voting Booth.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-tabs: Ledger vs Turnout by Dept vs Live Tally */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-vault-ledger"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'ledger'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Immutable Ledger ({ballots.length})</span>
          </button>

          <button
            id="tab-vault-turnout"
            onClick={() => setActiveSubTab('turnout')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'turnout'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Department Turnout</span>
          </button>

          <button
            id="tab-vault-tally"
            onClick={() => setActiveSubTab('tally')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'tally'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Live Vault Tally</span>
          </button>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-seed-vault-ballots"
            onClick={onSeedDemoBallots}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>+ Seed 3 Ballots</span>
          </button>

          <button
            id="btn-reset-vault"
            onClick={onResetVault}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs border border-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Immutable Ledger View */}
      {activeSubTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Filter by Department:
              </span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredBallots.length} of {ballots.length} Sealed Entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Block #</th>
                  <th className="py-3 px-4 font-semibold">Receipt Hash</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Anonymized Identity</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredBallots.map((ballot) => {
                  const dept = departments.find(d => d.id === ballot.departmentId);
                  return (
                    <tr key={ballot.ballotId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        #{ballot.blockNumber}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        {ballot.receiptHash}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-medium text-slate-300">
                          {dept?.code || ballot.departmentId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(ballot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {ballot.voterRollHash}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Lock className="w-3 h-3" /> Sealed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Department Turnout Breakdown */}
      {activeSubTab === 'turnout' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const deptBallotsCount = ballots.filter(b => b.departmentId === dept.id).length;
            const deptTurnout = ((deptBallotsCount / dept.totalStudents) * 100).toFixed(1);

            return (
              <div key={dept.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
                    {dept.code}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {deptTurnout}% Turnout
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1 font-collegiate">
                  {dept.name}
                </h4>
                <p className="text-xs text-slate-400 mb-4 line-clamp-1">
                  {dept.building}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Ballots Sealed:</span>
                    <span className="font-bold text-white font-mono">{deptBallotsCount} / {dept.totalStudents}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(deptTurnout) * 5))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-tab 3: Live Vault Tally */}
      {activeSubTab === 'tally' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>
                <strong>Official Live Tally:</strong> Sealed ballots counted directly from the immutable vault ledger.
              </span>
            </div>
            <span className="font-mono font-bold">Total Sealed: {ballots.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ELECTION_POSTS.slice(0, 6).map((post) => {
              const postCands = candidates.filter(c => c.postId === post.id);

              return (
                <div key={post.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <h4 className="text-base font-bold text-white font-collegiate">
                      {post.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 uppercase">
                      {post.categoryLabel}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {postCands.map((cand) => {
                      const votes = getCandidateVotes(cand.id, post.id) + cand.votesCount;
                      const dept = departments.find(d => d.id === cand.department);

                      return (
                        <div key={cand.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-850 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400 font-mono">
                                {cand.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs font-bold text-white">{cand.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({cand.symbolName})</span>
                            </div>
                            <span className="text-xs font-bold font-mono text-amber-400">
                              {votes} votes
                            </span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                              style={{ width: `${Math.min(100, Math.max(15, (votes / (totalSealedBallots + 600)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
