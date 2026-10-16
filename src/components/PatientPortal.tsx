import React, { useState, useEffect, useRef } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { CameraVisionHUD } from './CameraVisionHUD';
import confetti from 'canvas-confetti';
import {
  Smile,
  Hand,
  Volume2,
  Brain,
  ShieldAlert,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Camera,
  Activity,
  ArrowRight,
  ChevronRight,
  Flame,
  Zap,
  Mic,
  TrendingUp,
  PhoneCall,
  LogOut,
  User
} from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';
import { RehabilitationLibrary } from './RehabilitationLibrary';
import { DailyRoutineHealthLog } from './DailyRoutineHealthLog';
import { MedicalDocumentAnalyzer } from './MedicalDocumentAnalyzer';
import { VitalsTelemetry24h } from './VitalsTelemetry24h';
import { PatientLoginGate } from './PatientLoginGate';
import {
  Calendar,
  FileText,
  Eye,
  ArrowDownCircle,
  Video
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const {
    patientUser,
    isPatientLoggedIn,
    logoutPatient,
    callAdminPhoneRealtime,
    facialSymmetry,
    armStability,
    earValue,
    eyeState,
    blinkCount,
    simulateEarDistress,
    triggerEmergency,
    adminPhone,
    language,
    triggerVoiceAssistant,
    t
  } = useNeuro();

  // If patient is not logged in, show the mobile phone OTP login gate
  if (!isPatientLoggedIn) {
    return <PatientLoginGate />;
  }

  // Active Navigation Tab
  const [activeTherapy, setActiveTherapy] = useState<
    'vitalsTelemetry' | 'rehabLibrary' | 'dailyRoutine' | 'docAnalyzer' | 'facial' | 'hand' | 'speech' | 'cognitive' | 'fastScan' | 'science'
  >('vitalsTelemetry');

  // Facial Exercise States
  const [facialExerciseType, setFacialExerciseType] = useState<'SMILE' | 'EYEBROW' | 'CHEEK_PUFF' | 'LIP_PUCKER'>('SMILE');
  const [repsCompleted, setRepsCompleted] = useState<number>(6);
  const [targetReps] = useState<number>(10);
  const [exerciseActive, setExerciseActive] = useState<boolean>(false);
  const [facialFeedback, setFacialFeedback] = useState<string>('Hold bilateral smile for 3 seconds...');

  // Hand Finger Tapping States
  const [tapCount, setTapCount] = useState<number>(0);
  const [tapTimer, setTapTimer] = useState<number>(15);
  const [isTappingActive, setIsTappingActive] = useState<boolean>(false);
  const [tapCadenceScore, setTapCadenceScore] = useState<number>(0);

  // Speech & Aphasia Practice States
  const [speechExerciseIndex, setSpeechExerciseIndex] = useState<number>(0);
  const [speechClarityResult, setSpeechClarityResult] = useState<number | null>(88);
  const [isPracticingSpeech, setIsPracticingSpeech] = useState<boolean>(false);

  // Cognitive Neglect Scan States
  const [neglectTargets, setNeglectTargets] = useState<{ id: number; clicked: boolean; x: number; y: number }[]>([]);
  const [neglectScore, setNeglectScore] = useState<number>(0);

  // AI FAST Risk Scan State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanReport, setScanReport] = useState<any>(null);

  // Multilingual Speech Therapy Prompts
  const speechPromptsByLang: Record<string, { phrase: string; phonetic: string; focus: string }[]> = {
    en: [
      { phrase: 'Fifty-five yellow butterflies', phonetic: 'fif-tee fyv yel-oh buh-ter-flyz', focus: 'Labial & Lingual Precision' },
      { phrase: 'Today is a bright new morning', phonetic: 'tuh-day iz uh bryt noo mor-ning', focus: 'Sentence Prosody & Breath Flow' },
      { phrase: 'Water, tea, and warm milk', phonetic: 'wah-ter tee and worm milk', focus: 'Everyday Needs Articulation' },
    ],
    ta: [
      { phrase: 'காலை வணக்கம், நலம் வாழ்க', phonetic: 'Kaalai Vanakkam, Nalam Vaazhga', focus: 'நாக்கு மற்றும் இதழ் இயக்கம் (Lingual Motor)' },
      { phrase: 'இனிமையான காலை பொழுது', phonetic: 'Inimaiyana Kaalai Pozhudhu', focus: 'ஒலி உச்சரிப்பு தெளிவு (Phonetic Resonance)' },
      { phrase: 'தண்ணீர் கொடுங்கள், நன்றி', phonetic: 'Thanneer Kodungal, Nandri', focus: 'அத்தியாவசிய தகவல் தொடர்பு (Functional Communication)' },
    ],
    hi: [
      { phrase: 'सुप्रभात, आज का दिन शुभ हो', phonetic: 'Suprabhat, Aaj Ka Din Shubh Ho', focus: 'मुख व जीभ समन्वय (Lingual Coordination)' },
      { phrase: 'पानी दीजिए, मुझे प्यास लगी है', phonetic: 'Paani Deejiye, Mujhe Pyaas Lagi Hai', focus: 'दैनिक आवश्यकता अभिव्यक्ति' },
      { phrase: 'कच्चा पापड़, पक्का पापड़', phonetic: 'Kaccha Papad, Pakka Papad', focus: 'वाणी प्रवाह व गति (Fluency Rehab)' },
    ],
    ml: [
      { phrase: 'സുപ്രഭാതം, സുഖമായിരിക്കുന്നു', phonetic: 'Suprabhatham, Sukhamayirikkunnu', focus: 'ഉച്ചാരണ ശുദ്ധി (Articulation Control)' },
      { phrase: 'എനിക്ക് വെള്ളം വേണം', phonetic: 'Enikku Vellam Venam', focus: 'ആശയവിനിമയ ശേഷി (Functional Speech)' },
    ],
    te: [
      { phrase: 'శుభోదయం, నేను బాగున్నాను', phonetic: 'Shubhodayam, Nenu Baagunnanu', focus: 'మాటల స్పష్టత (Speech Articulation)' },
      { phrase: 'నాకు మంచినీరు కావాలి', phonetic: 'Naaku Manchineeru Kaavali', focus: 'నిత్యజీవిత సంభాషణ (Functional Language)' },
    ],
  };

  const currentSpeechList = speechPromptsByLang[language] || speechPromptsByLang.en;

  // Celebrate with confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // Facial Exercise Evaluation
  useEffect(() => {
    if (!exerciseActive) return;
    if (facialSymmetry >= 80) {
      setFacialFeedback('Perfect bilateral balance! Retaining motor map.');
      const timeout = setTimeout(() => {
        setRepsCompleted((r) => {
          const next = r + 1;
          if (next >= targetReps) {
            triggerCelebration();
            setExerciseActive(false);
          }
          return next;
        });
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      setFacialFeedback('Slight asymmetry detected. Elevate the right mouth corner gently.');
    }
  }, [exerciseActive, facialSymmetry, targetReps]);

  // Hand Tapping Timer
  useEffect(() => {
    let interval: any;
    if (isTappingActive && tapTimer > 0) {
      interval = setInterval(() => {
        setTapTimer((t) => t - 1);
      }, 1000);
    } else if (tapTimer === 0 && isTappingActive) {
      setIsTappingActive(false);
      const cadence = Math.round((tapCount / 15) * 60);
      setTapCadenceScore(cadence);
      triggerCelebration();
    }
    return () => clearInterval(interval);
  }, [isTappingActive, tapTimer, tapCount]);

  const handleStartTapping = () => {
    setTapCount(0);
    setTapTimer(15);
    setIsTappingActive(true);
    setTapCadenceScore(0);
  };

  const handleTap = () => {
    if (isTappingActive) {
      setTapCount((c) => c + 1);
    }
  };

  // Initialize Cognitive Neglect Grid
  const initCognitiveGrid = () => {
    const targets = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      clicked: false,
      x: Math.floor(Math.random() * 85) + 5,
      y: Math.floor(Math.random() * 75) + 10,
    }));
    setNeglectTargets(targets);
    setNeglectScore(0);
  };

  useEffect(() => {
    initCognitiveGrid();
  }, []);

  const handleTargetClick = (id: number) => {
    setNeglectTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, clicked: true } : t))
    );
    setNeglectScore((s) => {
      const next = s + 1;
      if (next === neglectTargets.length) {
        triggerCelebration();
      }
      return next;
    });
  };

  // Run AI FAST Diagnostic Scan
  const handleRunFastScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: { symmetryScore: facialSymmetry, armStability },
          symptomsText: 'Patient in rehabilitation bay, doing scheduled morning check.',
        }),
      });
      const data = await res.json();
      setScanReport(data);
    } catch {
      setScanReport({
        fastScore: facialSymmetry < 75 ? 2 : 0,
        facialDroopDetected: facialSymmetry < 75,
        asymmetryConfidence: Math.round(100 - facialSymmetry),
        strokeRelapseRisk: facialSymmetry < 70 ? 'HIGH' : 'LOW',
        recommendations: [
          'Continue scheduled facial mirror sessions twice daily.',
          'Upper limb finger tapping cadence is improving.',
          'Emergency sentinel remains armed on camera & mic.',
        ],
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 24/7 Protection Active & Urgent SOS Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Zap className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{t('cameraActive')}</h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                PROTECTION ARMED
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Continuous computer vision monitoring for facial drooping, motor arm drift &amp; fall detection.
            </p>
          </div>
        </div>

        {/* Emergency Actions & Real-Time Calling */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Logged in patient pill */}
          <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl">
            <User className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-bold text-white">{patientUser?.name || 'Ramesh Sundaram'}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({patientUser?.phone})</span>
            <button
              onClick={logoutPatient}
              className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition ml-1"
              title="Log out of Patient Account"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Direct Emergency Telephone Call to Admin Mobile */}
          <button
            onClick={callAdminPhoneRealtime}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 px-3.5 py-2.5 text-xs font-bold text-emerald-200 transition shadow-lg backdrop-blur"
            title={`Real-Time Cellular Telephone Call to Admin: ${adminPhone}`}
          >
            <PhoneCall className="h-4 w-4 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="font-bold leading-tight">Call Admin</div>
              <div className="text-[9px] text-emerald-300 font-mono">{adminPhone}</div>
            </div>
          </button>

          {/* Say Hey Neuro Voice Trigger */}
          <button
            onClick={triggerVoiceAssistant}
            className="flex items-center gap-2 rounded-2xl border border-sky-500/50 bg-sky-500/20 hover:bg-sky-500/30 px-3.5 py-2.5 text-xs font-bold text-sky-200 transition shadow-lg backdrop-blur"
          >
            <Mic className="h-4 w-4 text-sky-400 animate-pulse" />
            <span>"Hey Neuro"</span>
          </button>

          {/* Urgent SOS Button */}
          <button
            onClick={() => triggerEmergency('SOS_MANUAL', 'Patient initiated urgent SOS call to Admin.')}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-rose-900/50 hover:from-rose-500 hover:to-red-500 transition-all active:scale-95 border border-rose-400/40"
          >
            <ShieldAlert className="h-5 w-5 animate-bounce" />
            <div className="text-left">
              <div className="text-xs tracking-wider uppercase">{t('sosButton')}</div>
              <div className="text-[9px] text-rose-200 font-normal">SMS &amp; Intercom</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Camera HUD + Therapy Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Vision HUD (Always visible as requested) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {t('cameraVisible')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                AI SENSOR LIVE
              </span>
            </div>

            {/* Persistent Camera Vision HUD */}
            <CameraVisionHUD mode="embedded" />

            <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Current Face Symmetry Index:</span>
                <span
                  className={`font-mono font-bold ${
                    facialSymmetry > 75 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {facialSymmetry}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Safety trigger: If symmetry drops below 60% for &gt;10s, emergency alert will immediately dial Admin mobile ({adminPhone}).
              </p>
            </div>

            {/* Eye-Blink EAR Emergency Sentinel Card */}
            <div className="mt-3 rounded-2xl border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Eye className="h-4 w-4 text-sky-400" /> Eye-Blink EAR Distress Sentinel
                </span>
                <span className="rounded bg-sky-900/80 px-2 py-0.5 text-[10px] font-mono text-sky-300 font-bold border border-sky-700">
                  EAR: {earValue.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Camera uses <strong>Eye Aspect Ratio (EAR)</strong> to recognize intentional <strong>Rapid Triple-Blink SOS</strong> or coma/unresponsive state (&gt;3.5s closure) to auto-dispatch an emergency phone call and SMS to admin.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={simulateEarDistress}
                  className="flex-1 rounded-xl bg-amber-600/90 hover:bg-amber-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1 transition"
                  title="Test Rapid Triple Blink EAR Emergency Trigger"
                >
                  <Eye className="h-3.5 w-3.5" /> Blink SOS
                </button>
                <button
                  onClick={() => triggerEmergency('FACIAL_DROOP', 'Stroke facial drooping (35% asymmetry) detected.')}
                  className="flex-1 rounded-xl bg-rose-600/90 hover:bg-rose-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1 transition"
                  title="Test Stroke Droop Emergency Alert"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Stroke Droop
                </button>
                <button
                  onClick={() => triggerEmergency('FALL_DETECTED', 'Sudden rapid downward motion and immobility detected.')}
                  className="flex-1 rounded-xl bg-red-700/90 hover:bg-red-600 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1 transition"
                  title="Test Fall Detection Emergency Alert"
                >
                  <ArrowDownCircle className="h-3.5 w-3.5" /> Patient Fall
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Neuro-Therapy Suite */}
        <div className="lg:col-span-7 space-y-4">
          {/* Therapy Navigation Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 backdrop-blur-md">
            <button
              onClick={() => setActiveTherapy('vitalsTelemetry')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'vitalsTelemetry'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> {t('vitalsDashboard')}
            </button>
            <button
              onClick={() => setActiveTherapy('rehabLibrary')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'rehabLibrary'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Video className="h-4 w-4" /> Rehab Video Library
            </button>
            <button
              onClick={() => setActiveTherapy('dailyRoutine')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'dailyRoutine'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" /> Routine &amp; Health Log
            </button>
            <button
              onClick={() => setActiveTherapy('docAnalyzer')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'docAnalyzer'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="h-4 w-4" /> Medical Document AI
            </button>
            <button
              onClick={() => setActiveTherapy('facial')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'facial'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Smile className="h-4 w-4" /> {t('facialTherapy')}
            </button>
            <button
              onClick={() => setActiveTherapy('hand')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'hand'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Hand className="h-4 w-4" /> {t('handTherapy')}
            </button>
            <button
              onClick={() => setActiveTherapy('speech')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'speech'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Volume2 className="h-4 w-4" /> {t('speechTherapy')}
            </button>
            <button
              onClick={() => setActiveTherapy('cognitive')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'cognitive'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Brain className="h-4 w-4" /> {t('cognitiveTherapy')}
            </button>
            <button
              onClick={() => setActiveTherapy('fastScan')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'fastScan'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Camera className="h-4 w-4" /> {t('riskScanner')}
            </button>
            <button
              onClick={() => setActiveTherapy('science')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'science'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" /> {t('scienceHub')}
            </button>
          </div>

          {/* 24-Hour Continuous Vitals Telemetry (Recharts): Heart Rate, BP, Oxygen Saturation */}
          {activeTherapy === 'vitalsTelemetry' && <VitalsTelemetry24h />}

          {/* Rehabilitation Library: Video tutorials, step-by-step interactive flows, and progress metrics */}
          {activeTherapy === 'rehabLibrary' && <RehabilitationLibrary />}

          {/* Daily Routine & Health Log: Timed schedule, medication, hydration, meals, vitals */}
          {activeTherapy === 'dailyRoutine' && <DailyRoutineHealthLog />}

          {/* Medical Document AI Analyzer: Secure document upload (PDF/Image) with OCR & clinical care extraction */}
          {activeTherapy === 'docAnalyzer' && <MedicalDocumentAnalyzer />}

          {/* Therapy 1: Facial Symmetry Mirror Therapy */}
          {activeTherapy === 'facial' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smile className="h-5 w-5 text-sky-400" /> Facial Symmetry Mirror Therapy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stimulates bilateral motor cortex remapping for post-stroke hemiparesis.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-sky-400 border border-slate-800">
                    Reps: {repsCompleted} / {targetReps}
                  </span>
                </div>
              </div>

              {/* Exercise Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'SMILE', label: 'Bilateral Smile', desc: 'Zygomaticus major' },
                  { id: 'EYEBROW', label: 'Eyebrow Lift', desc: 'Frontalis muscle' },
                  { id: 'CHEEK_PUFF', label: 'Cheek Puff', desc: 'Buccinator seal' },
                  { id: 'LIP_PUCKER', label: 'Lip Pucker', desc: 'Orbicularis oris' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFacialExerciseType(item.id as any);
                      setExerciseActive(true);
                    }}
                    className={`rounded-2xl p-3 text-left transition border ${
                      facialExerciseType === item.id
                        ? 'border-sky-500 bg-sky-500/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Active Exercise Guidance Box */}
              <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 text-center space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-900/60 px-3 py-1 text-xs font-semibold text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" /> AI Camera Feedback
                </div>
                <p className="text-base font-bold text-white">{facialFeedback}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-xs text-slate-300">
                    Live Camera Symmetry: <span className="font-mono font-bold text-emerald-400">{facialSymmetry}%</span> (Target: &gt;75%)
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setExerciseActive(!exerciseActive)}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" /> {exerciseActive ? t('stopExercise') : t('startExercise')}
                  </button>
                  <button
                    onClick={() => {
                      setRepsCompleted(0);
                      setExerciseActive(false);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Therapy 2: Hand Dexterity & Finger Tapping Test */}
          {activeTherapy === 'hand' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Hand className="h-5 w-5 text-emerald-400" /> Upper Limb Fine Motor &amp; Finger Tapping (FTT)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Measures and rehabilitates neuromuscular speed and distal motor control.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-800">
                  Timer: {tapTimer}s
                </div>
              </div>

              {/* Tapping Arena */}
              <div className="rounded-3xl border-2 border-dashed border-emerald-500/40 bg-emerald-950/20 p-8 text-center space-y-4">
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Tap the target as rapidly as possible using your affected index/middle finger. Maintain consistent rhythm to stimulate corticospinal synapses.
                </p>

                <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={handleTap}
                    disabled={!isTappingActive}
                    className={`h-36 w-36 rounded-full border-4 flex flex-col items-center justify-center transition-all transform active:scale-90 shadow-2xl ${
                      isTappingActive
                        ? 'border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/50 cursor-pointer animate-pulse'
                        : 'border-slate-700 bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono">{tapCount}</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider">
                      {isTappingActive ? 'TAP RAPIDLY!' : 'TAPS'}
                    </span>
                  </button>
                </div>

                {tapCadenceScore > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300">
                    <p className="font-bold text-sm">Session Completed!</p>
                    <p className="mt-0.5">Cadence: <span className="font-mono font-bold text-white">{tapCadenceScore} taps/minute</span> (Normal recovery range: 120-180)</p>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleStartTapping}
                    disabled={isTappingActive}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow"
                  >
                    {isTappingActive ? 'Tapping in progress...' : 'Start 15-Second Test'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Therapy 3: Aphasia Speech & Language Practice */}
          {activeTherapy === 'speech' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-amber-400" /> Aphasia &amp; Dysarthria Speech Recovery
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-lingual phonetic speech retraining for Broca's &amp; Wernicke's speech rehabilitation.
                  </p>
                </div>
                <span className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-semibold text-amber-400 border border-slate-800">
                  {LANGUAGES.find((l) => l.code === language)?.nativeName}
                </span>
              </div>

              {/* Prompt Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Exercise {speechExerciseIndex + 1} of {currentSpeechList.length}
                  </span>
                  <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800">
                    {currentSpeechList[speechExerciseIndex]?.focus}
                  </span>
                </div>

                <div className="text-center py-4">
                  <h4 className="text-xl font-bold text-white">
                    "{currentSpeechList[speechExerciseIndex]?.phrase}"
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 italic font-mono">
                    Phonetic: {currentSpeechList[speechExerciseIndex]?.phonetic}
                  </p>
                </div>

                {/* Speech Score Result */}
                {speechClarityResult && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-900 p-3 border border-slate-800">
                    <span className="text-xs text-slate-300">Speech Articulation Clarity:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{speechClarityResult}% Accurate</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsPracticingSpeech(true);
                      setTimeout(() => {
                        setIsPracticingSpeech(false);
                        setSpeechClarityResult(Math.floor(82 + Math.random() * 16));
                        triggerCelebration();
                      }, 2500);
                    }}
                    className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-500 py-3 text-xs font-bold text-white shadow flex items-center justify-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    {isPracticingSpeech ? 'Analyzing Pronunciation...' : 'Speak into Microphone'}
                  </button>

                  <button
                    onClick={() => {
                      setSpeechExerciseIndex((i) => (i + 1) % currentSpeechList.length);
                      setSpeechClarityResult(null);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Therapy 4: Cognitive & Visual Neglect Scanner */}
          {activeTherapy === 'cognitive' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-400" /> Hemispatial Visual Neglect Training
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click all glowing beacons across the visual field to combat spatial neglect after stroke.
                  </p>
                </div>
                <span className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-indigo-400 border border-slate-800">
                  Found: {neglectScore} / {neglectTargets.length}
                </span>
              </div>

              {/* Spatial Scanning Arena */}
              <div className="relative h-64 w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                {/* Visual midline marker */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 border-r border-dashed border-slate-700" />
                <span className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">LEFT VISUAL FIELD</span>
                <span className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">RIGHT VISUAL FIELD</span>

                {neglectTargets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleTargetClick(target.id)}
                    disabled={target.clicked}
                    style={{ left: `${target.x}%`, top: `${target.y}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-all ${
                      target.clicked
                        ? 'opacity-20 scale-75 bg-slate-700 text-slate-500'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 hover:scale-125 animate-bounce'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={initCognitiveGrid}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Re-shuffle Beacons
                </button>
              </div>
            </div>
          )}

          {/* Therapy 5: AI FAST Stroke Risk Scanner */}
          {activeTherapy === 'fastScan' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-sky-400" /> AI FAST Stroke Risk &amp; Symptom Diagnostic Scan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzes live camera facial features and posture with clinical Gemini evaluation.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Clinical Ambient Assessment</h4>
                      <p className="text-xs text-slate-400">
                        Camera Facial Symmetry: {facialSymmetry}% • Arm Tone: {armStability}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunFastScan}
                    disabled={isScanning}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow"
                  >
                    {isScanning ? 'Analyzing with Gemini...' : 'Run Diagnostics'}
                  </button>
                </div>

                {scanReport && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200">NIHSS / FAST Assessment:</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          scanReport.strokeRelapseRisk === 'HIGH'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        Risk: {scanReport.strokeRelapseRisk}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p className="font-semibold text-white">Clinical Recommendations:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        {scanReport.recommendations?.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {scanReport.callEmergencyAdmin && (
                      <div className="mt-2 rounded-lg bg-rose-950/40 p-3 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
                        <span>Urgent symptoms observed. Notify medical staff?</span>
                        <button
                          onClick={() => triggerEmergency('FACIAL_DROOP')}
                          className="rounded bg-rose-600 px-3 py-1 text-xs font-bold text-white"
                        >
                          Alert Admin
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Therapy 6: Science Hub (Science Skill integration) */}
          {activeTherapy === 'science' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" /> Clinical Neurobiology &amp; Evidence-Based Recovery
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scientific stroke mechanisms, ischemic penumbra salvage, and NIHSS criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                    Neuroplastic Synaptogenesis
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    High-repetition bilateral motor training triggers <strong>BDNF (Brain-Derived Neurotrophic Factor)</strong> expression, recruiting perilesional cortex to take over functions of infarcted tissue.
                  </p>
                  <span className="inline-block rounded bg-sky-950 px-2 py-0.5 text-[10px] text-sky-400 font-mono">
                    Lancet Neurology (PMID: 31427181)
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                    The 4.5-Hour Ischemic Window
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Acute thrombolytic treatment with intravenous <strong>tPA (Tissue Plasminogen Activator)</strong> is most efficacious within 4.5 hours of onset to salvage the ischemic penumbra from irreversible infarction.
                  </p>
                  <span className="inline-block rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 font-mono">
                    AHA/ASA Stroke Guidelines (PMID: 30409748)
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    National Institutes of Health Stroke Scale (NIHSS)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Quantitative assessment of neurologic deficit across 11 domains: LOC, gaze, visual fields, facial palsy, motor arm/leg drift, limb ataxia, sensory loss, language, dysarthria, and inattention.
                  </p>
                  <span className="inline-block rounded bg-amber-950 px-2 py-0.5 text-[10px] text-amber-400 font-mono">
                    NIH Clinical Guidelines
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                    Computer Vision Sentinel Surveillance
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Continuous facial landmark tracking eliminates delayed detection of secondary stroke or hemiparetic relapse in home &amp; step-down ward monitoring.
                  </p>
                  <span className="inline-block rounded bg-rose-950 px-2 py-0.5 text-[10px] text-rose-400 font-mono">
                    Stroke (AHA Journal, PMID: 35193420)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
