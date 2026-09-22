import React, { useState } from 'react';
import { DepartmentInfo, Candidate, ElectionPost, VoterProfile, VaultBallot } from '../types';
import { ELECTION_POSTS } from '../data/electionData';
import { Building2, Users, Vote, CheckCircle2, Award, ExternalLink, ArrowRight } from 'lucide-react';

interface DepartmentHubProps {
  departments: DepartmentInfo[];
  candidates: Candidate[];
  ballots: VaultBallot[];
  currentVoter: VoterProfile | null;
  onOpenCandidateModal: (candidate: Candidate, post: ElectionPost) => void;
  onSelectDepartmentVoter: (deptId: string) => void;
  onGoToBooth: () => void;
}

export const DepartmentHub: React.FC<DepartmentHubProps> = ({
  departments,
  candidates,
  ballots,
  currentVoter,
  onOpenCandidateModal,
  onSelectDepartmentVoter,
  onGoToBooth,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentVoter?.departmentId || departments[0]?.id || 'dept-cse'
  );

  const currentDept = departments.find(d => d.id === selectedDeptId) || departments[0];
  const deptBallotsCount = ballots.filter(b => b.departmentId === currentDept.id).length;
  const deptTurnout = ((deptBallotsCount / currentDept.totalStudents) * 100).toFixed(1);

  // Get department representative candidates for this department
  const deptRepPost = ELECTION_POSTS.find(p => p.id === 'post-dept-representative');
  const deptRepCandidates = candidates.filter(
    c => c.postId === 'post-dept-representative' && c.department === currentDept.id
  );

  // Other candidates belonging to this department contesting for central posts
  const centralCandidatesFromDept = candidates.filter(
    c => c.postId !== 'post-dept-representative' && c.department === currentDept.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
          CAMPUS ACADEMIC DIVISIONS
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-collegiate">
          Departmental Polling Pages & Representatives
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select your academic department to view class representatives, local faculty manifestos, and real-time voter turnout.
        </p>
      </div>

      {/* Department Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {departments.map((dept) => {
          const isSelected = dept.id === currentDept.id;
          return (
            <button
              key={dept.id}
              id={`dept-tab-${dept.id}`}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{dept.code}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {dept.totalStudents}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Department Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Department Info & Class Representative Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Profile Hero */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Department Code: {currentDept.code}
                  </span>
                  <span className="text-xs text-slate-400">
                    Netaji Subhas Chandra Bose College
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-collegiate">
                  {currentDept.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Location: <span className="text-slate-200">{currentDept.building}</span>
                </p>
              </div>

              {/* Action: Vote as this dept */}
              <button
                id="btn-vote-as-dept"
                onClick={() => {
                  onSelectDepartmentVoter(currentDept.id);
                  onGoToBooth();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 whitespace-nowrap self-start"
              >
                <Vote className="w-4 h-4" />
                <span>Vote as {currentDept.code} Student</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {currentDept.description}
            </p>
          </div>

          {/* Department Representative Candidates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h4 className="text-lg font-bold text-white font-collegiate">
                  Official Class / Department Representative Candidates
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                1 to be elected from {currentDept.code}
              </span>
            </div>

            {deptRepCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deptRepCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700/80 flex flex-col items-center justify-center p-1.5 shadow-inner flex-shrink-0 text-center">
                          <span className="text-xs font-bold text-amber-400">
                            {candidate.symbolName.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Symbol
                          </span>
                        </div>
                        <div>
                          <h5 className="text-base font-bold text-white">
                            {candidate.name}
                          </h5>
                          <p className="text-xs text-slate-400 font-mono">
                            {candidate.rollNumber} • {candidate.year}
                          </p>
                          <span className="inline-block text-xs font-semibold text-amber-400 mt-1">
                            Symbol: {candidate.symbolName}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic mb-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                        "{candidate.slogan}"
                      </p>

                      <div className="space-y-1.5 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Department Agenda:
                        </span>
                        {candidate.agenda.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        CGPA: <strong className="text-white">{candidate.cgpa}</strong>
                      </span>

                      <button
                        id={`btn-dept-manifesto-${candidate.id}`}
                        onClick={() => deptRepPost && onOpenCandidateModal(candidate, deptRepPost)}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Full Manifesto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-sm text-slate-400">
                  No registered department representative candidates for this branch yet.
                </p>
              </div>
            )}
          </div>

          {/* Central Candidates originating from this department */}
          {centralCandidatesFromDept.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                {currentDept.code} Students Contesting for University & Executive Posts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {centralCandidatesFromDept.map((cand) => {
                  const post = ELECTION_POSTS.find(p => p.id === cand.postId);
                  return (
                    <div
                      key={cand.id}
                      onClick={() => post && onOpenCandidateModal(cand, post)}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-amber-400">
                          {cand.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-amber-300">
                            {cand.name}
                          </p>
                          <p className="text-xs text-amber-400/90 font-medium">
                            {post?.title}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400 group-hover:text-white">
                        View →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Department Live Stats & Polling Information */}
        <div className="space-y-6">
          {/* Turnout Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-base font-bold text-white mb-4 font-collegiate">
              {currentDept.code} Turnout Tracker
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Department Participation</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">{deptTurnout}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                    style={{ width: `${Math.min(100, Math.max(10, parseFloat(deptTurnout) * 5))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Voters</span>
                  <span className="text-base font-bold text-white font-mono">{currentDept.totalStudents}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ballots Cast</span>
                  <span className="text-base font-bold text-amber-400 font-mono">{deptBallotsCount}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Voting Vault digital audit is active for this department. No double-voting permitted.
                </span>
              </div>
            </div>
          </div>

          {/* Department Polling Station Guidelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-xs space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-collegiate">
              Department Voting Instructions
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Each student must hold a valid NSCB College roll number in this branch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>You can cast 1 vote for your Class / Department Representative, and 7 votes for college-wide Executive & Activity posts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Ballots are anonymous and permanently sealed into the encrypted Voting Vault.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
