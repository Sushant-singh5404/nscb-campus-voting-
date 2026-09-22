/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Candidate, ElectionPost, VoterProfile, VaultBallot } from './types';
import {
  COLLEGE_NAME,
  COLLEGE_MOTTO,
  ELECTION_YEAR,
  ELECTION_POSTS,
  DEPARTMENTS,
  INITIAL_CANDIDATES,
  DEMO_REGISTERED_VOTERS,
  INITIAL_VAULT_BALLOTS,
} from './data/electionData';
import {
  generateVaultReceiptHash,
  generateSignature,
  anonymizeRollNumber,
} from './utils/vaultCrypto';
import {
  auth,
  db,
  testFirestoreConnection,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  recordBallotToFirestore,
  markUserVotedInFirestore,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { Header } from './components/Header';
import { VotingBooth } from './components/VotingBooth';
import { VotingVault } from './components/VotingVault';
import { CandidateDirectory } from './components/CandidateDirectory';
import { DepartmentHub } from './components/DepartmentHub';
import { ElectionCommission } from './components/ElectionCommission';
import { AuthPage } from './components/AuthPage';
import { VoterModal } from './components/VoterModal';
import { CandidateModal } from './components/CandidateModal';
import { Shield, Landmark } from 'lucide-react';

const STORAGE_KEY_BALLOTS = 'nscb_vault_ballots_2026';
const STORAGE_KEY_VOTER = 'nscb_active_voter_2026';
const STORAGE_KEY_REGISTERED_VOTERS = 'nscb_registered_voters_2026';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booth' | 'vault' | 'candidates' | 'departments' | 'commission' | 'auth'>('booth');

  // Load ballots from localStorage or fallback to initial seeded ballots
  const [ballots, setBallots] = useState<VaultBallot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BALLOTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_VAULT_BALLOTS;
  });

  // Registered voters roll (includes default demo voters + newly registered students)
  const [registeredVoters, setRegisteredVoters] = useState<VoterProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGISTERED_VOTERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_REGISTERED_VOTERS;
  });

  // Current active voter
  const [currentVoter, setCurrentVoter] = useState<VoterProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOTER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_REGISTERED_VOTERS[0];
  });

  const [candidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
  const [activeModalCandidate, setActiveModalCandidate] = useState<{
    candidate: Candidate;
    post: ElectionPost;
  } | null>(null);

  // Test Firestore connection on application boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfileFromFirestore(firebaseUser.uid);
          if (profile) {
            setCurrentVoter(profile);
            setRegisteredVoters(prev => [profile, ...prev.filter(v => v.studentId !== profile.studentId)]);
          }
        } catch (err) {
          console.warn('Notice loading Firebase voter profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to real-time Vault Ballots in Firestore
  useEffect(() => {
    const ballotsCol = collection(db, 'ballots');
    const unsubscribe = onSnapshot(
      ballotsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteBallots: VaultBallot[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteBallots.push({
              ballotId: data.ballotId || docSnap.id,
              voterId: data.voterId,
              voterRollHash: data.voterRollHash,
              departmentId: data.departmentId,
              timestamp: data.timestamp,
              receiptHash: data.receiptHash,
              signature: data.signature,
              selections: data.selections || {},
              status: data.status || 'sealed',
              blockNumber: data.blockNumber || 1043,
            });
          });

          setBallots((prevLocal) => {
            const map = new Map<string, VaultBallot>();
            // Add local first
            prevLocal.forEach(b => map.set(b.receiptHash, b));
            // Remote overrides/appends
            remoteBallots.forEach(b => map.set(b.receiptHash, b));
            return Array.from(map.values()).sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'ballots');
        } catch (handledErr) {
          console.warn('Real-time ballots synchronization notice:', handledErr);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync ballots to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BALLOTS, JSON.stringify(ballots));
    } catch {
      // ignore
    }
  }, [ballots]);

  // Sync registered voters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REGISTERED_VOTERS, JSON.stringify(registeredVoters));
    } catch {
      // ignore
    }
  }, [registeredVoters]);

  // Sync current voter to localStorage
  useEffect(() => {
    try {
      if (currentVoter) {
        localStorage.setItem(STORAGE_KEY_VOTER, JSON.stringify(currentVoter));
      } else {
        localStorage.removeItem(STORAGE_KEY_VOTER);
      }
    } catch {
      // ignore
    }
  }, [currentVoter]);

  // Find last ballot cast by current voter
  const currentVoterLastBallot = ballots.find(
    b => b.receiptHash === currentVoter?.receiptHash
  );

  // Handle casting ballot into Voting Vault and saving to Firestore
  const handleCastBallot = (selections: Record<string, string>): VaultBallot => {
    const voterId = currentVoter ? currentVoter.studentId : 'GUEST-STUDENT';
    const deptId = currentVoter ? currentVoter.departmentId : 'dept-cse';
    const timestamp = new Date().toISOString();
    const nextBlockNumber = 1042 + ballots.length + 1;

    const receiptHash = generateVaultReceiptHash(voterId, timestamp, nextBlockNumber);
    const signature = generateSignature(receiptHash);
    const voterRollHash = anonymizeRollNumber(voterId);

    const newBallot: VaultBallot = {
      ballotId: `BLT-${Math.floor(1000 + Math.random() * 9000)}-${deptId.slice(-2).toUpperCase()}`,
      voterId: currentVoter?.uid || auth.currentUser?.uid,
      voterRollHash,
      departmentId: deptId,
      timestamp,
      receiptHash,
      signature,
      selections,
      status: 'sealed',
      blockNumber: nextBlockNumber,
    };

    const updatedBallots = [newBallot, ...ballots];
    setBallots(updatedBallots);

    // Save to Firestore Voting Vault
    recordBallotToFirestore(newBallot).catch((err) => {
      console.warn('Ballot stored locally; cloud sync notice:', err);
    });

    if (currentVoter) {
      const updatedVoter: VoterProfile = {
        ...currentVoter,
        hasVoted: true,
        receiptHash,
        votedAt: timestamp,
      };
      setCurrentVoter(updatedVoter);

      // If user has Firebase UID, record voted status in Firestore
      if (currentVoter.uid) {
        markUserVotedInFirestore(currentVoter.uid, receiptHash, timestamp).catch((err) => {
          console.warn('Voter status update notice:', err);
        });
      }
    }

    return newBallot;
  };

  // Seed sample ballots for demo demonstration
  const handleSeedDemoBallots = () => {
    const depts = DEPARTMENTS.map(d => d.id);
    const newDemoBallots: VaultBallot[] = [];

    for (let i = 0; i < 3; i++) {
      const randomDept = depts[Math.floor(Math.random() * depts.length)];
      const block = 1042 + ballots.length + i + 1;
      const t = new Date(Date.now() - (i + 1) * 180000).toISOString();
      const mockRoll = `2024${randomDept.slice(-3).toUpperCase()}${Math.floor(10 + Math.random() * 80)}`;
      const hash = generateVaultReceiptHash(mockRoll, t, block);

      newDemoBallots.push({
        ballotId: `BLT-${Math.floor(2000 + Math.random() * 8000)}-${randomDept.slice(-2).toUpperCase()}`,
        voterRollHash: anonymizeRollNumber(mockRoll),
        departmentId: randomDept,
        timestamp: t,
        receiptHash: hash,
        signature: generateSignature(hash),
        selections: {
          'post-president': Math.random() > 0.5 ? 'cand-pres-1' : 'cand-pres-2',
          'post-vice-president': Math.random() > 0.5 ? 'cand-vp-1' : 'cand-vp-2',
          'post-joint-secretary': Math.random() > 0.5 ? 'cand-js-1' : 'cand-js-2',
          'post-treasurer': Math.random() > 0.5 ? 'cand-tres-1' : 'cand-tres-2',
          'post-cultural-secretary': Math.random() > 0.5 ? 'cand-cult-1' : 'cand-cult-2',
          'post-sports-secretary': Math.random() > 0.5 ? 'cand-sport-1' : 'cand-sport-2',
          'post-magazine-editor': Math.random() > 0.5 ? 'cand-mag-1' : 'cand-mag-2',
          'post-central-councillor': Math.random() > 0.5 ? 'cand-counc-1' : 'cand-counc-2',
        },
        status: 'sealed',
        blockNumber: block,
      });
    }

    setBallots(prev => [...newDemoBallots, ...prev]);
  };

  const handleResetVault = () => {
    if (window.confirm('Reset Voting Vault to initial baseline ballots?')) {
      setBallots(INITIAL_VAULT_BALLOTS);
      if (currentVoter) {
        setCurrentVoter({
          ...currentVoter,
          hasVoted: false,
          receiptHash: undefined,
          votedAt: undefined,
        });
      }
      localStorage.removeItem(STORAGE_KEY_BALLOTS);
    }
  };

  const handleSelectDepartmentVoter = (deptId: string) => {
    const existing = registeredVoters.find(v => v.departmentId === deptId);
    if (existing) {
      setCurrentVoter(existing);
    } else {
      const dept = DEPARTMENTS.find(d => d.id === deptId);
      const newVoter: VoterProfile = {
        studentId: `2024${dept?.code || 'ST'}035`,
        name: `Student (${dept?.code || 'Campus'})`,
        departmentId: deptId,
        year: '3rd Year',
        email: `student@nscb.edu.in`,
        password: 'password123',
        pin: '2026',
        collegeIdNumber: `NSCB-ID-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: true,
        hasVoted: false,
      };
      setRegisteredVoters(prev => [newVoter, ...prev]);
      setCurrentVoter(newVoter);
    }
  };

  const handleSignIn = (voter: VoterProfile) => {
    setCurrentVoter(voter);
    setRegisteredVoters(prev => [voter, ...prev.filter(v => v.studentId !== voter.studentId)]);
    if (voter.uid) {
      saveUserProfileToFirestore(voter).catch(err => console.warn('Sync profile notice:', err));
    }
  };

  const handleRegister = (newVoter: VoterProfile) => {
    setRegisteredVoters(prev => [newVoter, ...prev.filter(v => v.studentId !== newVoter.studentId)]);
    setCurrentVoter(newVoter);
    if (newVoter.uid) {
      saveUserProfileToFirestore(newVoter).catch(err => console.warn('Sync new user notice:', err));
    }
  };

  const handleSignOut = () => {
    setCurrentVoter(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentVoter={currentVoter}
        onOpenVoterModal={() => setIsVoterModalOpen(true)}
        onSignOut={handleSignOut}
        vaultBallotsCount={ballots.length}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'booth' && (
          <VotingBooth
            currentVoter={currentVoter}
            onOpenVoterModal={() => setIsVoterModalOpen(true)}
            candidates={candidates}
            departments={DEPARTMENTS}
            onOpenCandidateModal={(candidate, post) =>
              setActiveModalCandidate({ candidate, post })
            }
            onCastBallot={handleCastBallot}
            voterLastBallot={currentVoterLastBallot}
            onGoToVault={() => setActiveTab('vault')}
            onGoToAuth={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            currentVoter={currentVoter}
            registeredVoters={registeredVoters}
            departments={DEPARTMENTS}
            onSignIn={handleSignIn}
            onRegister={handleRegister}
            onSignOut={handleSignOut}
            onGoToBooth={() => setActiveTab('booth')}
            onGoToVault={() => setActiveTab('vault')}
            ballots={ballots}
          />
        )}

        {activeTab === 'vault' && (
          <VotingVault
            ballots={ballots}
            departments={DEPARTMENTS}
            candidates={candidates}
            onSeedDemoBallots={handleSeedDemoBallots}
            onResetVault={handleResetVault}
            onGoToBooth={() => setActiveTab('booth')}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidateDirectory
            candidates={candidates}
            departments={DEPARTMENTS}
            onOpenCandidateModal={(candidate, post) =>
              setActiveModalCandidate({ candidate, post })
            }
            onGoToBooth={() => setActiveTab('booth')}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentHub
            departments={DEPARTMENTS}
            candidates={candidates}
            ballots={ballots}
            currentVoter={currentVoter}
            onOpenCandidateModal={(candidate, post) =>
              setActiveModalCandidate({ candidate, post })
            }
            onSelectDepartmentVoter={handleSelectDepartmentVoter}
            onGoToBooth={() => setActiveTab('booth')}
          />
        )}

        {activeTab === 'commission' && (
          <ElectionCommission
            ballots={ballots}
            candidates={candidates}
            departments={DEPARTMENTS}
            onGoToBooth={() => setActiveTab('booth')}
          />
        )}
      </main>

      {/* Collegiate Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-16 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-collegiate">
                  {COLLEGE_NAME}
                </h4>
                <p className="text-xs text-amber-400/90 italic">
                  "{COLLEGE_MOTTO}" • Estd. 1952
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('booth')}
                className="hover:text-amber-400 transition-colors"
              >
                Voting Booth
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('vault')}
                className="hover:text-amber-400 transition-colors"
              >
                Voting Vault & Ledger
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('candidates')}
                className="hover:text-amber-400 transition-colors"
              >
                Candidate Manifestos
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('departments')}
                className="hover:text-amber-400 transition-colors"
              >
                Department Polling
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('commission')}
                className="hover:text-amber-400 transition-colors"
              >
                Tribunal Rules
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveTab('auth')}
                className="hover:text-amber-400 transition-colors text-amber-400 font-semibold"
              >
                {currentVoter ? 'Student ID & Sign Out' : 'Sign In / Register'}
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {ELECTION_YEAR} {COLLEGE_NAME} Students' Union Election Commission. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Cryptographic Vault v2.4</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Voter Verification / Switcher Modal */}
      <VoterModal
        isOpen={isVoterModalOpen}
        onClose={() => setIsVoterModalOpen(false)}
        currentVoter={currentVoter}
        onSelectVoter={(voter) => {
          setCurrentVoter(voter);
          setActiveTab('booth');
        }}
        departments={DEPARTMENTS}
      />

      {/* Detailed Candidate Manifesto Modal */}
      <CandidateModal
        candidate={activeModalCandidate?.candidate || null}
        post={activeModalCandidate?.post}
        department={
          activeModalCandidate
            ? DEPARTMENTS.find(d => d.id === activeModalCandidate.candidate.department)
            : undefined
        }
        onClose={() => setActiveModalCandidate(null)}
      />
    </div>
  );
}
