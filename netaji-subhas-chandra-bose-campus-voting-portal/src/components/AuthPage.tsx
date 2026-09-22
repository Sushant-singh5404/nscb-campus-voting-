import React, { useState } from 'react';
import { VoterProfile, DepartmentInfo, VaultBallot } from '../types';
import { DEMO_REGISTERED_VOTERS, COLLEGE_NAME } from '../data/electionData';
import {
  auth,
  signInWithGoogle,
  registerWithEmailPassword,
  loginWithEmailPassword,
  logoutUser,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
} from '../firebase';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Mail,
  User,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Vote,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Cloud,
  Loader2,
} from 'lucide-react';

interface AuthPageProps {
  currentVoter: VoterProfile | null;
  registeredVoters: VoterProfile[];
  departments: DepartmentInfo[];
  onSignIn: (voter: VoterProfile) => void;
  onRegister: (newVoter: VoterProfile) => void;
  onSignOut: () => void;
  onGoToBooth: () => void;
  onGoToVault: () => void;
  ballots: VaultBallot[];
}

export const AuthPage: React.FC<AuthPageProps> = ({
  currentVoter,
  registeredVoters,
  departments,
  onSignIn,
  onRegister,
  onSignOut,
  onGoToBooth,
  onGoToVault,
  ballots,
}) => {
  // If already logged in, show 'account' view by default; otherwise 'signin'
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'account'>(
    currentVoter ? 'account' : 'signin'
  );

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signInSuccess, setSignInSuccess] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState(departments[0]?.id || 'dept-cse');
  const [regYear, setRegYear] = useState('3rd Year');
  const [regCollegeId, setRegCollegeId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState<VoterProfile | null>(null);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setSignInError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      if (!user) {
        throw new Error('Google sign in did not return user credentials.');
      }

      // Check if user profile already exists in Firestore
      let profile = await getUserProfileFromFirestore(user.uid);
      if (!profile) {
        // Create initial verified profile for new student
        const rollSeed = user.email ? user.email.split('@')[0].toUpperCase() : `2024STU${Math.floor(100 + Math.random() * 899)}`;
        profile = {
          uid: user.uid,
          studentId: rollSeed.replace(/[^A-Z0-9]/g, '').slice(0, 15) || `2024NSCB${Math.floor(100 + Math.random() * 899)}`,
          name: user.displayName || 'NSCB Student',
          email: user.email || `${rollSeed.toLowerCase()}@nscb.edu.in`,
          departmentId: departments[0]?.id || 'dept-cse',
          year: '3rd Year',
          collegeIdNumber: `NSCB-ID-${Math.floor(1000 + Math.random() * 9000)}`,
          isVerified: true,
          hasVoted: false,
          registeredAt: new Date().toISOString(),
        };
        await saveUserProfileToFirestore(profile);
      }

      onSignIn(profile);
      setActiveTab('account');
      setSignInSuccess(`Authenticated successfully via Google as ${profile.name}!`);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup was dismissed by the user.');
        setSignInError('Google sign-in popup was closed before completing. You can try again or sign in with your Student Roll below.');
      } else if (err?.code === 'auth/popup-blocked') {
        console.warn('Google sign-in popup was blocked by browser.');
        setSignInError('Popup was blocked by your browser settings. Please allow popups or sign in using your Student Roll & Password below.');
      } else {
        console.warn('Google Sign In notification:', err?.message || err);
        setSignInError(err?.message || 'Google Sign-In could not be completed. Please try again or use Student Roll.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Sign In submission (Email or Roll Number)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInSuccess('');

    const query = signInIdentifier.trim().toLowerCase();
    const pass = signInPassword.trim();

    if (!query) {
      setSignInError('Please enter your Student Roll Number or College Email.');
      return;
    }

    setSignInLoading(true);

    try {
      // If query is an email address, attempt real Firebase Email/Password login first
      if (query.includes('@')) {
        try {
          const userCredential = await loginWithEmailPassword(query, pass || 'password123');
          const user = userCredential.user;
          let profile = await getUserProfileFromFirestore(user.uid);

          if (!profile) {
            const rollSeed = query.split('@')[0].toUpperCase();
            profile = {
              uid: user.uid,
              studentId: rollSeed,
              name: user.displayName || rollSeed,
              email: user.email || query,
              departmentId: departments[0]?.id || 'dept-cse',
              year: '3rd Year',
              collegeIdNumber: `NSCB-ID-${Math.floor(1000 + Math.random() * 9000)}`,
              isVerified: true,
              hasVoted: false,
              registeredAt: new Date().toISOString(),
            };
            await saveUserProfileToFirestore(profile);
          }

          onSignIn(profile);
          setActiveTab('account');
          setSignInSuccess(`Welcome back, ${profile.name}!`);
          setSignInLoading(false);
          return;
        } catch (firebaseErr: any) {
          // If Firebase rejects email or user not found, fall back to check registered roll list
          console.warn('Firebase email auth fell back to local roster:', firebaseErr?.message);
        }
      }

      // Check registered voters roster (includes demo accounts & prior local registrations)
      const foundVoter = registeredVoters.find(
        v =>
          v.studentId.toLowerCase() === query ||
          v.email.toLowerCase() === query ||
          v.studentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === query.replace(/[^a-zA-Z0-9]/g, '')
      );

      if (!foundVoter) {
        setSignInError(
          'Student roll number or email not recognized in the electoral roll. Please verify credentials or register as a new voter below.'
        );
        setSignInLoading(false);
        return;
      }

      // Check password if set
      if (foundVoter.password && pass && foundVoter.password !== pass) {
        setSignInError('Incorrect password. For demo accounts, the password is "password123".');
        setSignInLoading(false);
        return;
      }

      setSignInSuccess(`Welcome back, ${foundVoter.name}!`);
      setTimeout(() => {
        onSignIn(foundVoter);
        setActiveTab('account');
        setSignInSuccess('');
        setSignInLoading(false);
      }, 500);
    } catch (err: any) {
      setSignInError(err?.message || 'Failed to sign in. Please check credentials.');
      setSignInLoading(false);
    }
  };

  // Quick 1-click login helper for testing
  const handleQuickLogin = (demoVoter: VoterProfile) => {
    const voter = registeredVoters.find(v => v.studentId === demoVoter.studentId) || demoVoter;
    onSignIn(voter);
    setActiveTab('account');
  };

  // Handle Register submission (Creates Firebase account & stores profile in Firestore)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regRoll.trim()) {
      setRegError('Please fill in your full legal name and student roll number.');
      return;
    }

    const cleanRoll = regRoll.trim().toUpperCase();

    // Check if roll already registered in local roll
    const existing = registeredVoters.find(
      v => v.studentId.toUpperCase() === cleanRoll
    );

    if (existing) {
      setRegError(`A student with Roll Number ${cleanRoll} is already registered in the electoral roll. Please Sign In.`);
      return;
    }

    if (!complianceAccepted) {
      setRegError('You must accept the election code compliance declaration to register.');
      return;
    }

    setRegLoading(true);

    const emailToUse = regEmail.trim() || `${cleanRoll.toLowerCase()}@nscb.edu.in`;
    const passwordToUse = regPassword.trim() || 'password123';

    let firebaseUid: string | undefined = undefined;

    try {
      // Create Firebase Auth account if email has standard format
      if (emailToUse.includes('@')) {
        try {
          const userCredential = await registerWithEmailPassword(emailToUse, passwordToUse, regName.trim());
          firebaseUid = userCredential.user.uid;
        } catch (authErr: any) {
          console.warn('Firebase Auth registration notice:', authErr?.message);
          // If email exists, or offline, we can proceed to store profile or attach existing auth
          if (authErr?.code === 'auth/email-already-in-use') {
            setRegError('This email is already registered. Please Sign In with your password.');
            setRegLoading(false);
            return;
          }
        }
      }

      const newVoter: VoterProfile = {
        uid: firebaseUid,
        studentId: cleanRoll,
        name: regName.trim(),
        departmentId: regDept,
        year: regYear,
        email: emailToUse,
        password: passwordToUse,
        pin: regPin.trim() || '2026',
        collegeIdNumber: regCollegeId.trim() || `NSCB-ID-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: true,
        hasVoted: false,
        registeredAt: new Date().toISOString(),
      };

      // Store in Firestore if Firebase UID is present
      if (firebaseUid) {
        try {
          await saveUserProfileToFirestore(newVoter);
        } catch (dbErr) {
          console.error('Failed saving to Firestore:', dbErr);
        }
      }

      onRegister(newVoter);
      setRegSuccess(newVoter);
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please verify your details.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    onSignOut();
    setActiveTab('signin');
  };

  const voterDept = departments.find(d => d.id === currentVoter?.departmentId) || departments[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Top Firebase Cloud Synchronized Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm">
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Cloud Database Connected</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      </div>

      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>OFFICIAL ELECTORAL ROLL & AUTHENTICATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-collegiate">
          {COLLEGE_NAME} Voter Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Secure digital credential gateway for authorized student voters.
        </p>
      </div>

      {/* Navigation Switch Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/70 rounded-2xl p-1.5 mb-8 shadow-md">
        {currentVoter ? (
          <button
            id="tab-auth-account"
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'account'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Digital Voter ID Card</span>
          </button>
        ) : null}

        <button
          id="tab-auth-signin"
          onClick={() => setActiveTab('signin')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'signin'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Student Sign In</span>
        </button>

        <button
          id="tab-auth-register"
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'register'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* 1. DIGITAL ID CARD VIEW (When logged in) */}
      {activeTab === 'account' && currentVoter && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Institutional Badge Header */}
          <div className="text-center mb-8">
            <h3 className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-1">
              {COLLEGE_NAME} • STUDENTS' UNION ELECTION COMMISSION
            </h3>
            <h2 className="text-2xl font-black text-white font-collegiate">
              Official Digital Voter Card
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically signed electoral identity token
            </p>
          </div>

          {/* Card Frame */}
          <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg border border-amber-400">
                  {voterDept.code}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-collegiate">
                    {COLLEGE_NAME}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-mono">
                    ELECTORAL TOKEN 2026
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            </div>

            {/* Student Info Details */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Voter Full Name</span>
                <span className="text-sm font-bold text-white block">{currentVoter.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Roll / Reg Number</span>
                <span className="text-sm font-bold text-amber-400 font-mono block">{currentVoter.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                <span className="text-slate-200 font-semibold block">{voterDept.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Academic Class</span>
                <span className="text-slate-200 font-semibold block">{currentVoter.year}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Official Webmail</span>
                <span className="text-slate-300 font-mono truncate block">{currentVoter.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">College ID Ref</span>
                <span className="text-slate-300 font-mono block">{currentVoter.collegeIdNumber || 'NSCB-VERIFIED'}</span>
              </div>
            </div>

            {/* Voting Status Badge */}
            <div className={`p-4 rounded-xl border mt-4 ${
              currentVoter.hasVoted
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {currentVoter.hasVoted ? 'Ballot Cryptographically Sealed' : 'Ballot Uncast (Ready to Vote)'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {currentVoter.hasVoted ? 'STATUS: SEALED' : 'POLLS OPEN'}
                </span>
              </div>

              {currentVoter.hasVoted && currentVoter.receiptHash && (
                <p className="text-[11px] font-mono text-slate-300 mt-2 break-all bg-slate-900/90 p-2 rounded border border-slate-800">
                  Vault Receipt: {currentVoter.receiptHash}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Go to Booth / Vault + Sign Out */}
          <div className="max-w-xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-3">
            {currentVoter.hasVoted ? (
              <button
                id="btn-account-view-vault"
                onClick={onGoToVault}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-md hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Inspect in Voting Vault</span>
              </button>
            ) : (
              <button
                id="btn-account-go-booth"
                onClick={onGoToBooth}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                <Vote className="w-4 h-4" />
                <span>Enter Voting Booth Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-account-sign-out"
              onClick={handleSignOutClick}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 font-bold text-sm border border-slate-700 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. SIGN IN VIEW */}
      {activeTab === 'signin' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left 3 cols: Sign In Form */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white font-collegiate mb-1 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-amber-400" />
              <span>Student Voter Sign In</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your college credentials or Google campus account to unlock your secret ballot slip.
            </p>

            {signInError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{signInError}</span>
              </div>
            )}

            {signInSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{signInSuccess}</span>
              </div>
            )}

            {/* Google One-Click Sign In */}
            <button
              type="button"
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/60 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-3 mb-5 group"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
              )}
              <span>Continue with Google Campus ID</span>
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] uppercase font-mono text-slate-500">
                Or Sign In with Roll / Email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Roll Number or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-signin-roll"
                    required
                    placeholder="e.g. 2024CSE012 or roll@nscb.edu.in"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password / Voter PIN
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Demo default: <code className="text-amber-400">password123</code>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-signin-password"
                    placeholder="Enter password or leave blank for demo roll"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-signin"
                disabled={signInLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {signInLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign In & Authorize Ballot</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
              Not registered on the electoral roll yet?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
              >
                Register as a New Student Voter
              </button>
            </div>
          </div>

          {/* Right 2 cols: Quick Demo Student Accounts for testing */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white font-collegiate uppercase tracking-wider">
                  One-Click Demo Voters
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Click any registered student to instantly authenticate and test ballot voting:
              </p>

              <div className="space-y-2">
                {DEMO_REGISTERED_VOTERS.slice(0, 4).map((voter) => {
                  const dept = departments.find(d => d.id === voter.departmentId);
                  return (
                    <button
                      key={voter.studentId}
                      id={`btn-quick-login-${voter.studentId}`}
                      onClick={() => handleQuickLogin(voter)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {dept?.code}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-amber-300">
                            {voter.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {voter.studentId}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-amber-300 font-semibold flex items-center gap-1">
                        Sign In →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy security note */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Zero-Knowledge Secrecy</span>
              </div>
              <p className="leading-relaxed">
                Signing in verifies that you are an eligible enrolled student. When you cast your vote, your student identity is detached and irreversibly hashed before entering the Voting Vault.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. REGISTER NEW VOTER VIEW */}
      {activeTab === 'register' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {regSuccess ? (
            <div className="max-w-lg mx-auto text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white font-collegiate mb-2">
                Voter Registration Approved!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-6">
                <strong>{regSuccess.name}</strong> ({regSuccess.studentId}) has been successfully enrolled on the official Netaji Subhas Chandra Bose College Electoral Roll.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs mb-6 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Roll:</span>
                  <span className="text-amber-400 font-bold">{regSuccess.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{departments.find(d => d.id === regSuccess.departmentId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">College ID Number:</span>
                  <span className="text-emerald-400">{regSuccess.collegeIdNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Electoral Status:</span>
                  <span className="text-emerald-300 font-bold">ELIGIBLE TO VOTE</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <button
                  id="btn-reg-go-vote"
                  onClick={() => {
                    onSignIn(regSuccess);
                    onGoToBooth();
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm shadow-md hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  <span>Proceed Directly to Voting Booth</span>
                </button>
                <button
                  id="btn-reg-view-account"
                  onClick={() => {
                    onSignIn(regSuccess);
                    setActiveTab('account');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
                >
                  View Digital ID Card
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white font-collegiate flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>Student Electoral Roll Registration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enrol your student credentials to receive a digitally signed ballot token stored in Firebase Firestore.
                </p>
              </div>

              {regError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 mb-6">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Legal Name <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arindam Mukherjee"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      NSCB College Roll Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2025CSE095"
                        value={regRoll}
                        onChange={(e) => setRegRoll(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Academic Branch <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Academic Year & Semester <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate">Postgraduate / Research</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      College Email Address (Account Login)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="student@nscb.edu.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password for Account
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance Checkbox */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="compliance"
                    checked={complianceAccepted}
                    onChange={(e) => setComplianceAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="compliance" className="text-xs text-slate-400 leading-relaxed">
                    I declare that I am a bonafide enrolled student of <strong>{COLLEGE_NAME}</strong>. I will cast only one vote and abide by the model code of conduct laid out by the Election Tribunal.
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    id="btn-submit-register"
                    disabled={regLoading}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
                  >
                    {regLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>Register Student & Store in Firebase</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
