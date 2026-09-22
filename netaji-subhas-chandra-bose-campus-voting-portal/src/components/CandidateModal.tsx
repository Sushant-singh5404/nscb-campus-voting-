import React from 'react';
import { Candidate, ElectionPost, DepartmentInfo } from '../types';
import { X, Award, CheckCircle, GraduationCap, Building2, Flame, Sun, Shield, Feather, Compass, Clock, Scale, Key, Music, Palette, Zap, Trophy, PenTool, BookOpen, Landmark, Code, Cpu, Radio, Settings } from 'lucide-react';

interface CandidateModalProps {
  candidate: Candidate | null;
  post?: ElectionPost;
  department?: DepartmentInfo;
  onClose: () => void;
  onSelectInBallot?: (candidateId: string, postId: string) => void;
  isSelected?: boolean;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  post,
  department,
  onClose,
  onSelectInBallot,
  isSelected,
}) => {
  if (!candidate) return null;

  const renderSymbolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-indigo-400" />;
      case 'Feather': return <Feather className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'Clock': return <Clock className="w-5 h-5 text-purple-400" />;
      case 'Scale': return <Scale className="w-5 h-5 text-amber-400" />;
      case 'Key': return <Key className="w-5 h-5 text-emerald-400" />;
      case 'Music': return <Music className="w-5 h-5 text-pink-400" />;
      case 'Palette': return <Palette className="w-5 h-5 text-rose-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-cyan-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-teal-400" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-blue-400" />;
      case 'Code': return <Code className="w-5 h-5 text-emerald-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-violet-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-orange-400" />;
      case 'Settings': return <Settings className="w-5 h-5 text-slate-300" />;
      default: return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="candidate-detail-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header with symbol emblem */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-500/60 shadow-lg flex flex-col items-center justify-center p-2 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 mb-1">
                {renderSymbolIcon(candidate.symbolIcon)}
              </div>
              <span className="text-[10px] font-bold text-amber-400 truncate max-w-[70px]">
                {candidate.symbolName}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {post?.categoryLabel || 'Candidate'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Roll: {candidate.rollNumber}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-collegiate">
                {candidate.name}
              </h2>
              <p className="text-sm font-medium text-amber-400">
                Contesting for: {post?.title}
              </p>
            </div>
          </div>

          <button
            id="btn-close-candidate-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Symbol & Academic Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                {renderSymbolIcon(candidate.symbolIcon)}
              </div>
              <div>
                <p className="text-xs text-slate-400">Election Symbol</p>
                <p className="text-sm font-bold text-white">{candidate.symbolName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Class & CGPA</p>
                <p className="text-sm font-bold text-white">{candidate.year} • {candidate.cgpa} CGPA</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="text-sm font-bold text-white truncate max-w-[140px]">{department?.name || candidate.department}</p>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 italic text-sm">
            "{candidate.slogan}"
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Candidate Background & Vision
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {candidate.bio}
            </p>
          </div>

          {/* Manifesto Agenda */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400" /> Key Election Agenda & Promises
            </h3>
            <div className="space-y-2.5">
              {candidate.agenda.map((point, index) => (
                <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Track Record & Achievements */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Campus Achievements & Credentials
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.achievements.map((ach, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {ach}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Netaji Subhas Chandra Bose College • Elections 2026
          </div>

          {onSelectInBallot && post && (
            <button
              id={`btn-modal-choose-${candidate.id}`}
              onClick={() => {
                onSelectInBallot(candidate.id, post.id);
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
              }`}
            >
              {isSelected ? '✓ Selected in Ballot' : 'Vote for Candidate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
