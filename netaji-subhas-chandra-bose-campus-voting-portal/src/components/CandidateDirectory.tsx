import React, { useState } from 'react';
import { Candidate, ElectionPost, DepartmentInfo } from '../types';
import { ELECTION_POSTS } from '../data/electionData';
import { Search, Flame, Sun, Shield, Feather, Compass, Clock, Scale, Key, Music, Palette, Zap, Trophy, PenTool, BookOpen, Landmark, Code, Cpu, Radio, Settings, Award, ExternalLink, CheckCircle2, Vote } from 'lucide-react';

interface CandidateDirectoryProps {
  candidates: Candidate[];
  departments: DepartmentInfo[];
  onOpenCandidateModal: (candidate: Candidate, post: ElectionPost) => void;
  onGoToBooth: () => void;
}

export const CandidateDirectory: React.FC<CandidateDirectoryProps> = ({
  candidates,
  departments,
  onOpenCandidateModal,
  onGoToBooth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'executive' | 'activity' | 'representative'>('all');
  const [selectedPostId, setSelectedPostId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCandidates = candidates.filter((c) => {
    const post = ELECTION_POSTS.find(p => p.id === c.postId);
    if (!post) return false;

    // Filter category
    if (selectedCategory !== 'all' && post.category !== selectedCategory) {
      return false;
    }

    // Filter specific post
    if (selectedPostId !== 'all' && post.id !== selectedPostId) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchRoll = c.rollNumber.toLowerCase().includes(q);
      const matchSlogan = c.slogan.toLowerCase().includes(q);
      const matchSymbol = c.symbolName.toLowerCase().includes(q);
      return matchName || matchRoll || matchSlogan || matchSymbol;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Directory Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
            OFFICIAL ELECTION GAZETTE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-collegiate">
            Student Council Candidate Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore contestant profiles, approved symbols, academic records, and election manifestos across all campus posts.
          </p>
        </div>

        <button
          id="btn-candidates-go-vote"
          onClick={onGoToBooth}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:from-amber-400 hover:to-amber-500 transition-all self-start md:self-auto"
        >
          <Vote className="w-4 h-4" />
          <span>Go to Voting Booth</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-candidate"
              placeholder="Search candidate by name, roll #, symbol, or vision..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Specific Post selector */}
          <div className="w-full md:w-72">
            <select
              id="select-post-filter"
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Contested Posts</option>
              {ELECTION_POSTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-1">
            Category:
          </span>
          <button
            id="cat-pill-all"
            onClick={() => { setSelectedCategory('all'); setSelectedPostId('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            All Categories ({candidates.length})
          </button>
          <button
            id="cat-pill-executive"
            onClick={() => setSelectedCategory('executive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'executive'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Executive Office Bearers
          </button>
          <button
            id="cat-pill-activity"
            onClick={() => setSelectedCategory('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'activity'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Activity & Editorial Secretaries
          </button>
          <button
            id="cat-pill-representative"
            onClick={() => setSelectedCategory('representative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'representative'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Representatives & Members
          </button>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => {
          const post = ELECTION_POSTS.find(p => p.id === candidate.postId);
          const dept = departments.find(d => d.id === candidate.department);

          return (
            <div
              key={candidate.id}
              id={`directory-card-${candidate.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700/80 flex flex-col items-center justify-center p-1.5 shadow-inner flex-shrink-0 group-hover:border-amber-500/50 transition-colors">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                        {renderSymbolIcon(candidate.symbolIcon)}
                      </div>
                      <span className="text-[9px] font-bold text-amber-400 truncate max-w-[50px] mt-0.5">
                        {candidate.symbolName}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Roll: <span className="font-mono text-slate-300">{candidate.rollNumber}</span>
                      </p>
                      <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                        {post?.title}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded-md bg-slate-800/80 text-[10px] font-bold text-slate-300 border border-slate-700 shadow-sm" title={candidate.symbolName}>
                    {candidate.year.split(' ')[0]}
                  </span>
                </div>

                {/* Slogan */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4">
                  <p className="text-xs text-slate-300 italic line-clamp-2">
                    "{candidate.slogan}"
                  </p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="text-white font-medium truncate block">{dept?.name || candidate.department}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Academics & Year</span>
                    <span className="text-emerald-400 font-bold">{candidate.cgpa} CGPA • {candidate.year.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Key Agenda snippet */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Agenda Highlights:
                  </span>
                  {candidate.agenda.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Symbol: <strong className="text-white">{candidate.symbolName}</strong>
                </span>

                <button
                  id={`btn-read-manifesto-${candidate.id}`}
                  onClick={() => post && onOpenCandidateModal(candidate, post)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Manifesto</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">No candidates match your current search criteria.</p>
        </div>
      )}
    </div>
  );
};
