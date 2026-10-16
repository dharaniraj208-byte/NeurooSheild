import React, { useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  Play,
  CheckCircle2,
  Clock,
  Award,
  Video,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExerciseModule {
  id: string;
  title: string;
  category: 'Upper Limb' | 'Facial Palsy' | 'Speech & Aphasia' | 'Balance & Gait' | 'Fine Motor';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoPoster: string;
  videoUrl?: string;
  description: string;
  steps: string[];
  targetMuscleOrNerve: string;
  completedCount: number;
}

export const RehabilitationLibrary: React.FC = () => {
  const { language, t } = useNeuro();

  const [modules, setModules] = useState<ExerciseModule[]>([
    {
      id: 'ex-1',
      title: 'Upper Limb Reach & Grasp (Bobath Approach)',
      category: 'Upper Limb',
      duration: '8 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      description: 'Active-assisted reaching to overcome flexor spasticity and rebuild shoulder girdle stability after MCA stroke.',
      steps: [
        'Interlace fingers with the unaffected hand supporting the paretic hand.',
        'Slowly elevate both arms straight ahead towards eye level over 4 seconds.',
        'Gently reach forward as if touching a point 30cm away, holding for 3 seconds.',
        'Lower hands down with controlled breath expiration. Repeat 10 times.'
      ],
      targetMuscleOrNerve: 'Corticospinal tract & Anterior Deltoid',
      completedCount: 14
    },
    {
      id: 'ex-2',
      title: 'Bilateral Facial Motor Mirror Re-education',
      category: 'Facial Palsy',
      duration: '6 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      description: 'Mirror feedback protocol activating cranial nerve VII branches to reduce unilateral hemifacial droop.',
      steps: [
        'Center face in front of the live camera HUD.',
        'Slowly raise both eyebrows together, observing forehead furrow symmetry.',
        'Smile showing teeth, focusing on elevating the affected mouth corner.',
        'Puckering lips as if blowing a gentle candle whistle. Hold 5 seconds.'
      ],
      targetMuscleOrNerve: 'Cranial Nerve VII (Facial Nerve)',
      completedCount: 22
    },
    {
      id: 'ex-3',
      title: 'Finger Tapping Rhythm & Precision Grip',
      category: 'Fine Motor',
      duration: '10 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      description: 'Dissociated finger movements to combat synergistic flexion patterns and regain daily buttoning/holding.',
      steps: [
        'Rest palm flat on a firm table or lap.',
        'Tap index finger 10 times independently without moving other fingers.',
        'Perform thumb-to-fingertip opposition sequence: index, middle, ring, little.',
        'Pick up a light small object (e.g. coin or dice) using pincer grasp.'
      ],
      targetMuscleOrNerve: 'Opponens Pollicis & Flexor Digitorum Superficialis',
      completedCount: 9
    },
    {
      id: 'ex-4',
      title: 'Sit-to-Stand Weight Shift & Postural Stability',
      category: 'Balance & Gait',
      duration: '12 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      description: 'Promotes symmetrical weight bearing through the hemiparetic lower extremity to prevent falls.',
      steps: [
        'Sit on a firm chair with feet shoulder-width apart and equal weight under both heels.',
        'Lean upper trunk forward at the hips ("nose over toes").',
        'Push evenly through both legs to stand upright without pulling on furniture.',
        'Pause for 3 seconds in standing balance, then slowly sit back down with control.'
      ],
      targetMuscleOrNerve: 'Quadriceps Femoris & Gluteus Maximus',
      completedCount: 7
    },
    {
      id: 'ex-5',
      title: 'Aphasia Melodic Intonation & Tongue Articulation',
      category: 'Speech & Aphasia',
      duration: '7 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=800&q=80',
      description: 'Leverages right-hemisphere musical cadence to bypass left frontal Broca injury and restore functional communication.',
      steps: [
        'Tap hand rhythmically to a 2-beat cadence.',
        'Sing-hum vowel sounds: "Ahhh", "Ooooh", "Eeeee".',
        'Chant high-frequency functional words: "Water please", "Thank you".',
        'Practice tongue tip sweeps from left to right corner of mouth.'
      ],
      targetMuscleOrNerve: 'Hypoglossal Nerve (CN XII) & Perisylvian Language Loop',
      completedCount: 18
    }
  ]);

  const [activeModule, setActiveModule] = useState<ExerciseModule>(modules[0]);
  const [isPlayingFlow, setIsPlayingFlow] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [stepTimer, setStepTimer] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Step countdown timer
  React.useEffect(() => {
    let interval: any;
    if (isPlayingFlow && !isPaused && stepTimer > 0) {
      interval = setInterval(() => {
        setStepTimer((t) => t - 1);
      }, 1000);
    } else if (stepTimer === 0 && isPlayingFlow) {
      if (currentStepIdx < activeModule.steps.length - 1) {
        setCurrentStepIdx((idx) => idx + 1);
        setStepTimer(30);
      } else {
        // Exercise completed!
        setIsPlayingFlow(false);
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        } catch {}
        setModules((prev) =>
          prev.map((m) =>
            m.id === activeModule.id ? { ...m, completedCount: m.completedCount + 1 } : m
          )
        );
      }
    }
    return () => clearInterval(interval);
  }, [isPlayingFlow, isPaused, stepTimer, currentStepIdx, activeModule]);

  const handleStartFlow = (module: ExerciseModule) => {
    setActiveModule(module);
    setCurrentStepIdx(0);
    setStepTimer(30);
    setIsPlayingFlow(true);
    setIsPaused(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-sky-400" /> Stroke Rehabilitation Video &amp; Exercise Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-based motor, facial, speech, and gait recovery modules with guided step-by-step flows.
          </p>
        </div>

        {/* Global Progress Metric Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Sessions</span>
            <p className="text-base font-black text-sky-400 font-mono">
              {modules.reduce((acc, m) => acc + m.completedCount, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Recovery Streak</span>
            <p className="text-base font-black text-emerald-400 font-mono">14 Days</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Motor Score</span>
            <p className="text-base font-black text-indigo-400 font-mono">+18%</p>
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Step-by-Step Player & Module Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Workout Player (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl">
            {/* Video / Interactive Stage Header */}
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
              <img
                src={activeModule.videoPoster}
                alt={activeModule.title}
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="rounded-full bg-sky-950/90 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-800 backdrop-blur">
                  {activeModule.category}
                </span>
                <span className="rounded-full bg-slate-900/90 px-2.5 py-1 text-xs font-mono text-slate-300 border border-slate-800">
                  {activeModule.duration}
                </span>
              </div>

              {/* Player Overlay Content */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-black text-white">{activeModule.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{activeModule.description}</p>
              </div>

              {/* Big Play Button Overlay if not running */}
              {!isPlayingFlow && (
                <button
                  onClick={() => handleStartFlow(activeModule)}
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/40 hover:bg-slate-950/20 transition group"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-2xl shadow-sky-500/50 group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 ml-1" />
                  </div>
                </button>
              )}
            </div>

            {/* Interactive Step-by-Step Guidance Box */}
            <div className="p-6 space-y-5">
              {isPlayingFlow ? (
                <div className="rounded-2xl border border-sky-500/40 bg-sky-950/20 p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-sky-900 px-2.5 py-1 text-xs font-bold text-sky-300">
                      Step {currentStepIdx + 1} of {activeModule.steps.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-mono font-bold text-emerald-400">{stepTimer}s</span>
                    </div>
                  </div>

                  <p className="text-base font-bold text-white leading-relaxed">
                    {activeModule.steps[currentStepIdx]}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
                    >
                      {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>

                    <button
                      onClick={() => {
                        if (currentStepIdx < activeModule.steps.length - 1) {
                          setCurrentStepIdx((i) => i + 1);
                          setStepTimer(30);
                        } else {
                          setIsPlayingFlow(false);
                          confetti();
                        }
                      }}
                      className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow flex items-center gap-1.5"
                    >
                      Next Step <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Step-by-Step Exercise Protocol:
                  </h4>
                  <div className="space-y-2">
                    {activeModule.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs text-slate-300"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-sky-400">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleStartFlow(activeModule)}
                      className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" /> Start Interactive Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Library Catalog (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available Recovery Modules ({modules.length})
          </h3>

          <div className="space-y-3">
            {modules.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setActiveModule(m);
                  setIsPlayingFlow(false);
                }}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                  activeModule.id === m.id
                    ? 'border-sky-500 bg-slate-900 shadow-lg shadow-sky-950/40'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{m.duration}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> {m.completedCount} done
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
