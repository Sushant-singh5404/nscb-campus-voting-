import React, { useState } from 'react';
import { Candidate, DepartmentInfo, ElectionPost, VoterProfile, VaultBallot } from '../types';
import { ELECTION_POSTS } from '../data/electionData';
import { Check, Shield, Lock, FileText, ChevronRight, AlertCircle, Sparkles, ExternalLink, Printer, Award, ArrowRight, Flame, Sun, Feather, Compass, Clock, Scale, Key, Music, Palette, Zap, Trophy, PenTool, BookOpen, Landmark, Code, Cpu, Radio, Settings, LogIn, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VotingBoothProps {
  currentVoter: VoterProfile | null;
  onOpenVoterModal: () => void;
  candidates: Candidate[];
  departments: DepartmentInfo[];
  onOpenCandidateModal: (candidate: Candidate, post: ElectionPost) => void;
  onCastBallot: (selections: Record<string, string>) => VaultBallot;
  voterLastBallot?: VaultBallot;
  onGoToVault: () => void;
  onGoToAuth?: () => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({
  currentVoter,
  onOpenVoterModal,
  candidates,
  departments,
  onOpenCandidateModal,
  onCastBallot,
  voterLastBallot,
  onGoToVault,
  onGoToAuth,
}) => {
  // Store user selections: { [postId]: candidateId }
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<'all' | 'executive' | 'activity' | 'representative'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sealedBallot, setSealedBallot] = useState<VaultBallot | null>(voterLastBallot || null);

  const voterDept = departments.find(d => d.id === currentVoter?.departmentId) || departments[0];

  // Helper to filter posts and candidates
  const filteredPosts = ELECTION_POSTS.filter(post => {
    if (activeCategory === 'all') return true;
    return post.category === activeCategory;
  });

  const getCandidatesForPost = (postId: string) => {
    const post = ELECTION_POSTS.find(p => p.id === postId);
    if (!post) return [];

    return candidates.filter(c => {
      if (c.postId !== postId) return false;
      // If department specific, only show candidate of that department!
      if (post.isDepartmentSpecific) {
        return c.department === currentVoter?.departmentId;
      }
      return true;
    });
  };

  const handleSelectCandidate = (postId: string, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [postId]: candidateId,
    }));
  };

  const totalRequiredPosts = ELECTION_POSTS.length;
  const selectedPostsCount = Object.keys(selections).length;
  const isComplete = selectedPostsCount === totalRequiredPosts;

  const handleCastVote = () => {
    if (!currentVoter) {
      onOpenVoterModal();
      return;
    }

    if (!isComplete) {
      alert(`Please select your preferred candidate for all ${totalRequiredPosts} posts before sealing your ballot.`);
      return;
    }

    setIsSubmitting(true);

    // Simulate cryptographic vault sealing delay
    setTimeout(() => {
      const newBallot = onCastBallot(selections);
      setSealedBallot(newBallot);
      setIsSubmitting(false);

      // Trigger celebratory confetti for casting secret ballot
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#ffffff']
        });
      } catch (err) {
        // Safe fallback
      }
    }, 1400);
  };

  const renderSymbolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Shield': return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'Feather': return <Feather className="w-4 h-4 text-emerald-400" />;
      case 'Compass': return <Compass className="w-4 h-4 text-blue-400" />;
      case 'Clock': return <Clock className="w-4 h-4 text-purple-400" />;
      case 'Scale': return <Scale className="w-4 h-4 text-amber-400" />;
      case 'Key': return <Key className="w-4 h-4 text-emerald-400" />;
      case 'Music': return <Music className="w-4 h-4 text-pink-400" />;
      case 'Palette': return <Palette className="w-4 h-4 text-rose-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'PenTool': return <PenTool className="w-4 h-4 text-cyan-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-teal-400" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-blue-400" />;
      case 'Code': return <Code className="w-4 h-4 text-emerald-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'Radio': return <Radio className="w-4 h-4 text-orange-400" />;
      case 'Settings': return <Settings className="w-4 h-4 text-slate-300" />;
      default: return <Award className="w-4 h-4 text-amber-400" />;
    }
  };

  // 1. If not verified, show friendly verification banner
  if (!currentVoter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Shield className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
              Digital Polling Station #01
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-3 font-collegiate">
              Netaji Subhas Chandra Bose College Voting Booth
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Welcome to the official students' union digital ballot. Verify your student registration to receive an authorized digital ballot tailored for your department and executive council posts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> 100% Secret
                </div>
                <p className="text-xs text-slate-400">Zero-knowledge ballot sealing inside the cryptographic Voting Vault.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Verifiable Slip
                </div>
                <p className="text-xs text-slate-400">Receive an official verifiable cryptographic receipt hash to audit your vote.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-cyan-400 font-bold text-sm mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4" /> 8 Posts
                </div>
                <p className="text-xs text-slate-400">Vote across Executive Bearers, Activities, and your Department Rep.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onGoToAuth && (
                <>
                  <button
                    id="btn-booth-signin"
                    onClick={onGoToAuth}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl hover:from-amber-400 hover:to-amber-500 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Voter Sign In</span>
                  </button>

                  <button
                    id="btn-booth-register"
                    onClick={onGoToAuth}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>Register New Student</span>
                  </button>
                </>
              )}

              <button
                id="btn-verify-to-vote"
                onClick={onOpenVoterModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-800 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Demo Switcher</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. If voter has already voted (or just sealed ballot), show official receipt & status
  if (currentVoter.hasVoted || sealedBallot) {
    const ballot = sealedBallot || voterLastBallot;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Certificate header */}
          <div className="text-center pb-6 border-b border-slate-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-4 shadow-lg">
              <Check className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              BALLOT CRYPTOGRAPHICALLY SEALED IN VAULT
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 font-collegiate">
              Official Voter Receipt & Slip
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Netaji Subhas Chandra Bose College • Students' Union General Elections 2026
            </p>
          </div>

          {/* Receipt Details Card */}
          <div className="my-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Voter Student Identity</p>
                <p className="text-sm font-bold text-white">
                  {currentVoter.name} • <span className="font-mono text-amber-400">{currentVoter.studentId}</span>
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-400">Department & Class</p>
                <p className="text-sm font-semibold text-slate-200">
                  {voterDept.name} ({currentVoter.year})
                </p>
              </div>
            </div>

            {/* Cryptographic Vault Hash */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Immutable Vault Receipt Hash
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  BLOCK #{ballot?.blockNumber || 1046}
                </span>
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-white tracking-wider break-all selection:bg-amber-400 selection:text-slate-950">
                {ballot?.receiptHash || currentVoter.receiptHash || 'VAULT-NSCB-9F82A-C70E-2026'}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                This code proves your vote is safely registered in the Voting Vault while protecting your secret choices.
              </p>
            </div>

            {/* Digital Security Seal Visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ballot Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Sealed in Safe
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Timestamp</span>
                <span className="text-slate-200 font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Posts Voted</span>
                <span className="text-amber-400 font-bold">8 of 8 Posts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Digital Signature</span>
                <span className="text-slate-300 font-mono truncate block">ECDSA-SHA256</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-verify-in-vault"
              onClick={onGoToVault}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Inspect in Voting Vault Ledger</span>
            </button>

            <button
              id="btn-print-receipt"
              onClick={() => window.print()}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>

            <button
              id="btn-switch-voter-booth"
              onClick={onOpenVoterModal}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs border border-slate-800 transition-all"
            >
              Test as Another Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Digital Ballot Filling Mode
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Voter Profile Banner & Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              {voterDept.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-collegiate">
                  Digital Ballot: {currentVoter.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Verified Voter
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Roll: <span className="font-mono text-slate-200">{currentVoter.studentId}</span> • {voterDept.name} • {currentVoter.year}
              </p>
            </div>
          </div>

          {/* Ballot Completion Counter & Action */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Ballot Completion:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {selectedPostsCount} / {totalRequiredPosts} Posts
                </span>
              </div>
              <div className="w-48 sm:w-56 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(selectedPostsCount / totalRequiredPosts) * 100}%` }}
                />
              </div>
            </div>

            <button
              id="btn-cast-to-vault-top"
              disabled={!isComplete || isSubmitting}
              onClick={handleCastVote}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md ${
                isComplete && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Lock className="w-4 h-4 animate-spin" />
                  <span>Sealing in Vault...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Cast into Vault</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-1">
            Section:
          </span>
          <button
            id="filter-cat-all"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All 8 Posts
          </button>
          <button
            id="filter-cat-executive"
            onClick={() => setActiveCategory('executive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'executive'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Executive Office Bearers (4)
          </button>
          <button
            id="filter-cat-activity"
            onClick={() => setActiveCategory('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'activity'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Activity & Editorial Secretaries (3)
          </button>
          <button
            id="filter-cat-representative"
            onClick={() => setActiveCategory('representative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'representative'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Representatives & Members (2)
          </button>
        </div>
      </div>

      {/* Posts & Candidate Cards Grid */}
      <div className="space-y-8">
        {filteredPosts.map((post) => {
          const postCandidates = getCandidatesForPost(post.id);
          const selectedCandidateId = selections[post.id];
          const hasSelection = Boolean(selectedCandidateId);

          return (
            <div
              key={post.id}
              id={`ballot-section-${post.id}`}
              className={`p-6 rounded-2xl border transition-all ${
                hasSelection
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Post Title & Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                      {post.categoryLabel}
                    </span>
                    {post.isDepartmentSpecific && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {voterDept.code} Department Exclusive
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white font-collegiate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {post.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasSelection ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5" /> Selection Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postCandidates.map((candidate) => {
                  const isCandidateSelected = selectedCandidateId === candidate.id;
                  const candDept = departments.find(d => d.id === candidate.department);

                  return (
                    <div
                      key={candidate.id}
                      id={`cand-card-${candidate.id}`}
                      onClick={() => handleSelectCandidate(post.id, candidate.id)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                        isCandidateSelected
                          ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Top candidate summary */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col items-center justify-center p-1 shadow-inner flex-shrink-0 group-hover:border-amber-500/50 transition-colors">
                              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                                {renderSymbolIcon(candidate.symbolIcon)}
                              </div>
                              <span className="text-[9px] font-bold text-amber-400 truncate max-w-[50px] mt-0.5">
                                {candidate.symbolName}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                {candidate.name}
                              </h4>
                              <p className="text-xs text-slate-400">
                                Roll: <span className="font-mono text-slate-300">{candidate.rollNumber}</span> • {candDept?.code || candidate.department}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                                  <span>{candidate.year.split(' ')[0]}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  CGPA {candidate.cgpa}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Radio Checkbox Indicator */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isCandidateSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'border-2 border-slate-600 group-hover:border-slate-400'
                          }`}>
                            {isCandidateSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Slogan */}
                        <p className="text-xs text-slate-300 italic mb-3 line-clamp-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                          "{candidate.slogan}"
                        </p>
                      </div>

                      {/* Card Footer: View Manifesto Link + Select button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
                        <button
                          type="button"
                          id={`btn-view-manifesto-${candidate.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCandidateModal(candidate, post);
                          }}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Read Manifesto
                        </button>

                        <button
                          type="button"
                          id={`btn-radio-pick-${candidate.id}`}
                          onClick={() => handleSelectCandidate(post.id, candidate.id)}
                          className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                            isCandidateSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isCandidateSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Cast Button Section */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/50 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white font-collegiate">
              Ready to Seal Your Digital Ballot?
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Once submitted into the Voting Vault, your vote is cryptographically sealed and permanently audited.
          </p>
        </div>

        <button
          id="btn-cast-ballot-bottom"
          disabled={!isComplete || isSubmitting}
          onClick={handleCastVote}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl ${
            isComplete && !isSubmitting
              ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-slate-950 hover:scale-[1.02] shadow-emerald-500/25 animate-pulse'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Lock className="w-5 h-5 animate-spin" />
              <span>Sealing Ballot in Safe...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Cast Ballot into Voting Vault ({selectedPostsCount}/8 Complete)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
