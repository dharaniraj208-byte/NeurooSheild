import React, { useRef, useEffect, useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { visionPipelineInstance, VisionMetrics } from '../services/visionPipeline';
import {
  Camera,
  Mic,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Activity,
  Sliders,
  CheckCircle2,
  Volume2,
  Zap,
  ArrowDownCircle
} from 'lucide-react';

interface CameraVisionHUDProps {
  mode?: 'floating' | 'embedded' | 'fullscreen';
  className?: string;
}

export const CameraVisionHUD: React.FC<CameraVisionHUDProps> = ({ mode = 'embedded', className = '' }) => {
  const {
    mediaStream,
    cameraActive,
    micActive,
    cameraError,
    videoRef,
    startMedia,
    facialSymmetry,
    setFacialSymmetry,
    armStability,
    micVolume,
    earValue,
    setEarValue,
    blinkCount,
    eyeState,
    distressBlinkProgress,
    simulateEarDistress,
    triggerEmergency,
    t
  } = useNeuro();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<VisionMetrics | null>(null);
  const [simulatedDroop, setSimulatedDroop] = useState<number>(0);

  // Hook pipeline emergency alert callback
  useEffect(() => {
    visionPipelineInstance.onEmergencyAlert = (type, details) => {
      triggerEmergency(type as any, details);
    };
  }, [triggerEmergency]);

  // Frame processing loop using VisionPipeline & OpenCV/MediaPipe principles
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const processLoop = () => {
      tick += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (videoRef.current && cameraActive) {
        // Run vision frame pipeline
        const frameMetrics = visionPipelineInstance.processFrame(
          videoRef.current,
          canvas,
          simulatedDroop
        );
        setMetrics(frameMetrics);
        setEarValue(frameMetrics.earAverage);

        // Draw overlays if enabled
        if (showMeshOverlay) {
          const cx = width / 2;
          const cy = height / 2;
          const breath = Math.sin(tick) * 2;

          // Face oval
          ctx.strokeStyle = frameMetrics.facialDroopDetected
            ? 'rgba(244, 63, 94, 0.85)'
            : 'rgba(34, 197, 94, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy + breath, width * 0.22, height * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Symmetry Midline Axis
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - height * 0.35);
          ctx.lineTo(cx, cy + height * 0.35);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw Left Eye Landmark Polygon (6 Points: p1 to p6)
          if (frameMetrics.leftEyeLandmarks.length >= 6) {
            ctx.strokeStyle = frameMetrics.isBlinking ? '#f43f5e' : '#38bdf8';
            ctx.fillStyle = frameMetrics.isBlinking ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(frameMetrics.leftEyeLandmarks[0].x, frameMetrics.leftEyeLandmarks[0].y);
            for (let i = 1; i < 6; i++) {
              ctx.lineTo(frameMetrics.leftEyeLandmarks[i].x, frameMetrics.leftEyeLandmarks[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Landmark vertices
            frameMetrics.leftEyeLandmarks.forEach((pt, idx) => {
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
            });
          }

          // Draw Right Eye Landmark Polygon (6 Points: p1 to p6)
          if (frameMetrics.rightEyeLandmarks.length >= 6) {
            ctx.strokeStyle = frameMetrics.isBlinking ? '#f43f5e' : '#38bdf8';
            ctx.fillStyle = frameMetrics.isBlinking ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(frameMetrics.rightEyeLandmarks[0].x, frameMetrics.rightEyeLandmarks[0].y);
            for (let i = 1; i < 6; i++) {
              ctx.lineTo(frameMetrics.rightEyeLandmarks[i].x, frameMetrics.rightEyeLandmarks[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            frameMetrics.rightEyeLandmarks.forEach((pt) => {
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
            });
          }

          // Mouth & Facial Palsy Asymmetry Curve
          if (frameMetrics.mouthLandmarks.length >= 4) {
            const [pLeft, pTop, pRight, pBottom] = frameMetrics.mouthLandmarks;
            ctx.strokeStyle = frameMetrics.facialDroopDetected ? '#f43f5e' : '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pLeft.x, pLeft.y);
            ctx.quadraticCurveTo(pTop.x, pTop.y, pRight.x, pRight.y);
            ctx.stroke();

            // Corner tracking points
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(pLeft.x, pLeft.y, 3, 0, Math.PI * 2);
            ctx.arc(pRight.x, pRight.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Real-time Canvas HUD Stats
          ctx.font = '10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`EAR RATIO: ${frameMetrics.earAverage.toFixed(2)} [${frameMetrics.eyeState}]`, 12, 22);
          ctx.fillText(`STROKE ASYMMETRY: ${frameMetrics.facialSymmetryScore}%`, 12, 36);
          ctx.fillText(`OPTICAL DOWNSHIFT: ${frameMetrics.downwardVelocity}px/f`, 12, 50);
        }
      }

      animationFrameId = requestAnimationFrame(processLoop);
    };

    processLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, showMeshOverlay, simulatedDroop, videoRef, setEarValue]);

  const handleTestEyeDistress = () => {
    visionPipelineInstance.simulateTripleBlinkDistress();
    simulateEarDistress();
  };

  const handleTestDroop = () => {
    setSimulatedDroop(35);
    setFacialSymmetry(52);
    triggerEmergency('FACIAL_DROOP', 'Severe acute facial asymmetry (35px deviation) detected on camera vision.');
    setTimeout(() => setSimulatedDroop(0), 10000);
  };

  const handleTestFall = () => {
    triggerEmergency(
      'FALL_DETECTED',
      'Optical flow vertical acceleration threshold exceeded (>45px) followed by immobility.'
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-24 w-72' : 'w-full'
      } ${className}`}
    >
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wider text-slate-200">
            {t('cameraVisible').toUpperCase()}
          </span>
          <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-800/80">
            OpenCV / EAR PIPELINE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMeshOverlay(!showMeshOverlay)}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              showMeshOverlay ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle EAR & Facial Mesh Overlay"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={startMedia}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="Refresh Camera"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title={isMinimized ? 'Expand Camera' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video & Vision Pipeline Canvas */}
      {!isMinimized && (
        <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Live Video Feed */}
          <video
            ref={videoRef as any}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover transform scale-x-[-1]"
          />

          {/* Vision Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="absolute inset-0 h-full w-full pointer-events-none transform scale-x-[-1]"
          />

          {/* Fallback if camera stream is blocked */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-4 text-center">
              <Camera className="h-10 w-10 text-amber-400 animate-pulse mb-2" />
              <p className="text-sm font-medium text-slate-200">Camera Feed Initializing</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                {cameraError || 'Please allow camera and microphone permissions for continuous stroke monitoring.'}
              </p>
              <button
                onClick={startMedia}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors shadow"
              >
                <Camera className="h-3.5 w-3.5" /> Grant Camera &amp; Mic Access
              </button>
            </div>
          )}

          {/* Top-Left Live Telemetry Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {/* EAR Ratio Box */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-950/85 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-xs text-white">
              <Eye className="h-3.5 w-3.5 text-sky-400" />
              <span>EAR (Eye Ratio):</span>
              <span
                className={`font-mono font-bold ${
                  earValue < 0.20 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {earValue.toFixed(2)}
              </span>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                  earValue < 0.20
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {earValue < 0.20 ? 'CLOSED' : 'OPEN'}
              </span>
            </div>

            {/* Facial Symmetry Box */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-950/85 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-xs text-white">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Face Symmetry:</span>
              <span
                className={`font-mono font-bold ${
                  facialSymmetry > 75 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {facialSymmetry}%
              </span>
            </div>
          </div>

          {/* Top-Right Distress Blink Pattern Gauge */}
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-xl bg-slate-950/85 px-3 py-1.5 backdrop-blur-md border border-slate-800 text-xs text-white">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-300">Triple-Blink SOS Code:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <span
                  key={num}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    (metrics?.distressBlinkCount || distressBlinkProgress) >= num
                      ? 'bg-amber-400 scale-125 animate-ping'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom-Left Microphone Audio Level */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-slate-950/85 px-3 py-1.5 backdrop-blur-md border border-slate-800">
            <Mic className="h-3.5 w-3.5 text-amber-400" />
            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.min(100, micVolume * 2)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-300">{micVolume} dB</span>
          </div>

          {/* Bottom-Right Emergency Test Triggers */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={handleTestEyeDistress}
              className="rounded-xl bg-amber-600/90 hover:bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow backdrop-blur transition flex items-center gap-1 border border-amber-400/40"
              title="Test Eye-Blink EAR SOS Distress Signal"
            >
              <Eye className="h-3.5 w-3.5" /> Blink SOS
            </button>
            <button
              onClick={handleTestDroop}
              className="rounded-xl bg-rose-600/90 hover:bg-rose-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow backdrop-blur transition flex items-center gap-1 border border-rose-400/40"
              title="Test Stroke Facial Droop Detection"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Stroke Droop
            </button>
            <button
              onClick={handleTestFall}
              className="rounded-xl bg-red-700/90 hover:bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow backdrop-blur transition flex items-center gap-1 border border-red-400/40"
              title="Test Fall Down Optical Flow Detection"
            >
              <ArrowDownCircle className="h-3.5 w-3.5" /> Fall Down
            </button>
          </div>
        </div>
      )}

      {/* Minimized View Header */}
      {isMinimized && (
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
              <video
                ref={videoRef as any}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transform scale-x-[-1]"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Patient Cam Active</p>
              <p className="text-[10px] font-mono text-sky-400">EAR: {earValue.toFixed(2)} • Symm: {facialSymmetry}%</p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500"
          >
            Expand
          </button>
        </div>
      )}
    </div>
  );
};
