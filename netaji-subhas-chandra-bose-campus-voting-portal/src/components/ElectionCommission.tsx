import React, { useState } from 'react';
import { Candidate, DepartmentInfo, VaultBallot } from '../types';
import { ELECTION_POSTS, COLLEGE_NAME } from '../data/electionData';
import { Landmark, ShieldAlert, CheckCircle2, Award, FileText, Vote } from 'lucide-react';

interface ElectionCommissionProps {
  ballots: VaultBallot[];
  candidates: Candidate[];
  departments: DepartmentInfo[];
  onGoToBooth: () => void;
}

export const ElectionCommission: React.FC<ElectionCommissionProps> = ({
  ballots,
  candidates,
  departments,
  onGoToBooth,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'standings' | 'tribunal'>('standings');

  const getCandidateVotes = (candidateId: string, postId: string) => {
    return ballots.filter(b => b.selections[postId] === candidateId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Commission Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                STATUTORY ELECTION TRIBUNAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-collegiate">
                {COLLEGE_NAME} Election Commission
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Presiding Officer: Prof. P. K. Banerjee • Observer: Retd. Justice D. N. Roy
              </p>
            </div>
          </div>

          <button
            id="btn-tribunal-vote"
            onClick={onGoToBooth}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Vote className="w-4 h-4" />
            <span>Cast Authorized Ballot</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            id="btn-comm-tab-standings"
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'standings'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Certified Live Tally & Standings
          </button>
          <button
            id="btn-comm-tab-rules"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Model Code of Conduct (MCC)
          </button>
          <button
            id="btn-comm-tab-tribunal"
            onClick={() => setActiveTab('tribunal')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'tribunal'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Tribunal & Election Calendar
          </button>
        </div>
      </div>

      {/* Tab 1: Live Tally & Standings */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ELECTION_POSTS.map((post) => {
              const postCands = candidates.filter(c => c.postId === post.id);
              if (postCands.length === 0) return null;

              // Sort by total votes desc
              const sortedCands = [...postCands].sort((a, b) => {
                const aVotes = getCandidateVotes(a.id, post.id) + a.votesCount;
                const bVotes = getCandidateVotes(b.id, post.id) + b.votesCount;
                return bVotes - aVotes;
              });

              const leader = sortedCands[0];
              const leaderVotes = getCandidateVotes(leader.id, post.id) + leader.votesCount;
              const totalPostVotes = sortedCands.reduce(
                (sum, c) => sum + getCandidateVotes(c.id, post.id) + c.votesCount, 0
              );

              return (
                <div key={post.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        {post.categoryLabel}
                      </span>
                      <h4 className="text-lg font-bold text-white font-collegiate">
                        {post.title}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {totalPostVotes} Cast
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sortedCands.map((cand, idx) => {
                      const votes = getCandidateVotes(cand.id, post.id) + cand.votesCount;
                      const percentage = totalPostVotes > 0 ? ((votes / totalPostVotes) * 100).toFixed(1) : '0.0';
                      const isLeading = idx === 0 && votes > 0;
                      const dept = departments.find(d => d.id === cand.department);

                      return (
                        <div
                          key={cand.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isLeading
                              ? 'bg-slate-950/80 border-amber-500/40'
                              : 'bg-slate-950/40 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              {isLeading && (
                                <Award className="w-4 h-4 text-amber-400" />
                              )}
                              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 font-mono">
                                {cand.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white block">
                                  {cand.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {cand.symbolName} • {dept?.code}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-bold text-amber-400 font-mono">
                                {votes}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full ${
                                isLeading
                                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                                  : 'bg-slate-600'
                              }`}
                              style={{ width: `${percentage}%` }}
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

      {/* Tab 2: Model Code of Conduct */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 font-collegiate">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Lyngdoh Committee Guidelines
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">1. Age & Academic Eligibility:</strong>
                Candidates for undergraduate posts must be between 17 and 22 years of age, maintain minimum 75% classroom attendance, and have zero academic backlogs.
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">2. Election Expenditure Cap:</strong>
                Maximum allowed expenditure per candidate is strictly capped at Rs. 5,000/-. Audited expense vouchers must be submitted within 24 hours of declaration.
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">3. Ban on Printed Defacement:</strong>
                Zero printed posters or wall paintings permitted on college heritage buildings. Only handmade pamphlets and authorized digital manifestos allowed.
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 font-collegiate">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Digital Voting Vault Safeguards
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">1. Secret Ballot Sealing:</strong>
                Votes are encrypted in the client browser before entering the Voting Vault. No administrator or faculty member can map a student roll number to their selected candidates.
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">2. Single Vote Authentication:</strong>
                Once a voter slip receipt is issued and recorded on the immutable ledger, the student’s identity record is permanently locked for the election cycle.
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-white block mb-1">3. Public Ledger Audit:</strong>
                Every student can independently verify their ballot inclusion in the Voting Vault using their cryptographic receipt code.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tribunal & Calendar */}
      {activeTab === 'tribunal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h4 className="text-lg font-bold text-white font-collegiate">
              Official Election Timeline & Tribunal Schedule
            </h4>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 text-xs">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-400" />
              <p className="font-mono text-emerald-400 font-bold">15 September 2026</p>
              <h5 className="font-bold text-white text-sm">Filing of Nominations & Scrutiny</h5>
              <p className="text-slate-400">Scrutiny of candidate papers by Returning Officer. 24 nominations cleared.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-400" />
              <p className="font-mono text-emerald-400 font-bold">18 September 2026</p>
              <h5 className="font-bold text-white text-sm">Presidential Debate & Manifesto Release</h5>
              <p className="text-slate-400">Live open-air debate in the college auditorium between all Presidential candidates.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <p className="font-mono text-amber-400 font-bold">22 September 2026 (TODAY)</p>
              <h5 className="font-bold text-white text-sm">Digital Voting Vault Polls Open</h5>
              <p className="text-slate-300">Campus-wide electronic secret balloting across all 8 departments until 17:00 IST.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-slate-600" />
              <p className="font-mono text-slate-400 font-bold">22 September 2026 (18:30 IST)</p>
              <h5 className="font-bold text-white text-sm">Vault Decryption & Formal Declaration</h5>
              <p className="text-slate-400">Principal administers oath of office to newly elected Students' Union Executive.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
