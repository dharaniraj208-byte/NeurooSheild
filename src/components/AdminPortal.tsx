import React, { useState, useEffect } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { HospitalCollaborationHub } from './HospitalCollaborationHub';
import {
  Shield,
  Phone,
  PhoneCall,
  Video,
  Plus,
  AlertTriangle,
  CheckCircle,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Eye,
  Lock,
  MessageSquare,
  Radio,
  SlidersHorizontal,
  Mail,
  User,
  Building2,
  MicOff,
  CameraOff,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CCTVCamera } from '../context/NeuroContext';

export const AdminPortal: React.FC = () => {
  const {
    adminUser,
    adminPhone,
    setAdminPhone,
    isAdminLoggedIn,
    verifyAdminOtp,
    sendOtpSms,
    logoutAdmin,
    setCurrentScreen,
    cctvList,
    addCctvCamera,
    emergencyHistory,
    facialSymmetry,
    armStability,
    earValue,
    doctors,
    triggerEmergency,
    acknowledgeEmergency,
    setIsEmergencyCallActive,
    t
  } = useNeuro();

  // Admin login states (Name, Email, Phone, OTP)
  const [nameInput, setNameInput] = useState('Dr. Priya Varma');
  const [emailInput, setEmailInput] = useState('priya.varma@apollo-neuro.org');
  const [phoneInput, setPhoneInput] = useState(adminPhone);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('789012');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [loginError, setLoginError] = useState('');

  // CCTV & View states
  const [activeTab, setActiveTab] = useState<'patientCam' | 'collaboration' | 'cctvGrid' | 'alerts'>('patientCam');
  const [isAddCctvOpen, setIsAddCctvOpen] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamIp, setNewCamIp] = useState('192.168.1.');
  const [nightVision, setNightVision] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  const handleSendOtp = async () => {
    if (!phoneInput || phoneInput.length < 8) {
      setLoginError('Please enter a valid mobile number with country code (e.g. +91 98401 23456)');
      return;
    }
    if (!emailInput || !emailInput.includes('@')) {
      setLoginError('Please enter a valid hospital email address.');
      return;
    }
    const res = await sendOtpSms(phoneInput, 'doctor');
    setOtpSent(true);
    setOtpCountdown(60);
    setOtpCode(res.otpCode || '789012');
    setLoginError('');
  };

  const handleAutoFillOtp = () => {
    setOtpInput('789012');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    const result = await verifyAdminOtp(nameInput, emailInput, phoneInput, otpInput);
    if (!result.success) {
      setLoginError(result.message || 'Invalid OTP code. Please enter 789012.');
    } else {
      setLoginError('');
    }
  };

  // If not logged in, render the 4-field OTP Login Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Clinical Admin &amp; Hospital Gate</h2>
                <p className="text-xs text-slate-400">Doctor Authentication &amp; Multi-Hospital Sentinel</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('gateway')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              Back to Portals
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Admin Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Doctor / Admin Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dr. Priya Varma"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 2: Hospital Email ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Hospital Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. priya.varma@apollo-neuro.org"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 3: Mobile Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Mobile Phone (Emergency SMS &amp; Call Alert Destination)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow whitespace-nowrap"
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0}
                    className="rounded-xl border border-slate-700 bg-slate-800 disabled:opacity-50 px-3 py-2.5 text-xs text-slate-300 whitespace-nowrap"
                  >
                    Resend {otpCountdown > 0 ? `(${otpCountdown}s)` : ''}
                  </button>
                )}
              </div>
            </div>

            {/* Field 4: OTP Verification Code */}
            {otpSent && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Enter 6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-[11px] text-emerald-400 underline font-semibold"
                  >
                    Auto-fill Test OTP ({otpCode})
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 789012"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-base font-mono font-bold tracking-widest text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulated OTP code <strong className="text-white font-mono">{otpCode}</strong> dispatched to {phoneInput} and {emailInput}.
                </p>
              </div>
            )}

            {loginError && <p className="text-xs text-rose-400 font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{otpSent ? 'Verify OTP & Enter Command Center' : 'Generate Security OTP'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const assignedDoctor = doctors.find((d) => d.currentPatientAssigned) || doctors[0];

  const handleAddCctvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCamName && newCamIp) {
      addCctvCamera({
        name: newCamName,
        location: newCamLocation || 'Ward Surveillance',
        ipAddress: newCamIp,
        type: 'NEARBY_CCTV',
      });
      setIsAddCctvOpen(false);
      setNewCamName('');
      setNewCamLocation('');
      setNewCamIp('192.168.1.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Dashboard Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {adminUser?.name || 'Dr. Priya Varma'}
              </h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                OTP VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {adminUser?.email || 'priya.varma@apollo-neuro.org'} • Alert Phone: <span className="font-mono font-bold text-emerald-400">{adminPhone}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('patientCam')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'patientCam'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Video className="h-4 w-4" /> Live Patient CCTV
          </button>

          <button
            onClick={() => setActiveTab('collaboration')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'collaboration'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" /> Hospitals &amp; Doctors
          </button>

          <button
            onClick={() => setActiveTab('cctvGrid')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'cctvGrid'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="h-4 w-4" /> CCTV Grid ({cctvList.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" /> Emergency Log ({emergencyHistory.length})
          </button>

          <button
            onClick={logoutAdmin}
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs text-slate-300 flex items-center gap-1 transition"
            title="Sign out of Admin Portal"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" /> Exit
          </button>
        </div>
      </div>

      {/* Hardware Privacy Notice: Camera and Mic are strictly OFF for Admin */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CameraOff className="h-4 w-4 text-emerald-400" />
          <MicOff className="h-4 w-4 text-emerald-400" />
          <span>
            <strong>Clinician Privacy Enforced:</strong> Admin local camera and microphone are strictly <strong>DISABLED</strong>. You are observing the remote Patient Room 104 stream without broadcasting your own hardware.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
          RECEIVER ONLY
        </span>
      </div>

      {/* Tab 1: Live Patient Camera Observation & Telemetry */}
      {activeTab === 'patientCam' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">
                    Remote Patient Vision Stream • Room 104
                  </span>
                </div>
                <button
                  onClick={() => setIsEmergencyCallActive(true)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Start Emergency Audio Intercom
                </button>
              </div>

              {/* Remote Patient Stream HUD (Simulated remote camera observer) */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* Visual scanlines & CCTV telemetry overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                <div className="text-center space-y-2 p-6">
                  <Radio className="h-12 w-12 text-emerald-400 mx-auto animate-pulse" />
                  <h4 className="text-base font-bold text-white">Patient Bed 104 • Live Ambient Stream</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Continuous remote ambient CCTV receiving feed from patient bed. Local admin camera/mic remains strictly off.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <span className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-sky-400 border border-slate-800">
                      EAR: {earValue.toFixed(2)} (Blink Sentinel Armed)
                    </span>
                    <span className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-slate-800">
                      Face Symmetry: {facialSymmetry}%
                    </span>
                  </div>
                </div>

                {/* Top Video OSD */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-slate-900/90 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>REMOTE RTSP 1080p @ 30 FPS</span>
                </div>

                <div className="absolute top-3 right-3 rounded bg-slate-900/90 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-slate-800">
                  IP: 192.168.1.142:554
                </div>
              </div>
            </div>
          </div>

          {/* Patient Quick Vitals & Specialist In-Charge */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Patient Status &amp; Assigned Neurologist
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-white">{t('patientName')}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Attending Doctor:</span>
                  <span className="font-bold text-emerald-400">{assignedDoctor.name}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Eye Aspect Ratio:</span>
                  <span className="font-mono font-bold text-sky-400">{earValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Facial Symmetry:</span>
                  <span
                    className={`font-mono font-bold ${
                      facialSymmetry > 75 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {facialSymmetry}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Motor Tone:</span>
                  <span className="font-mono font-bold text-indigo-400">{armStability}%</span>
                </div>
              </div>

              {/* Manual Dispatch Call Button */}
              <div className="pt-2">
                <button
                  onClick={() => triggerEmergency('SOS_MANUAL', 'Admin manually initiated clinical emergency alert.')}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-600 transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" /> Trigger Urgent Call &amp; SMS Dispatch
                </button>
              </div>
            </div>

            {/* Admin Alert Configuration */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-400" /> Emergency Alert Recipient
              </h4>
              <p className="text-xs text-slate-400">
                Patient emergencies auto-dispatch calls and SMS to verified admin mobile:
              </p>
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Verified Phone:</span>
                <span className="font-mono font-bold text-emerald-400">{adminPhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hospital & Doctor Collaboration Hub */}
      {activeTab === 'collaboration' && <HospitalCollaborationHub />}

      {/* Tab 3: CCTV & Nearby IP Camera Monitor */}
      {activeTab === 'cctvGrid' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{t('nearbyCameras')}</h3>
              <p className="text-xs text-slate-400">
                Live surveillance via hospital network IP addresses, RTSP, and patient room streams
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNightVision(!nightVision)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border transition ${
                  nightVision
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Night Vision IR
              </button>

              <button
                onClick={() => setIsAddCctvOpen(true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" /> {t('addIpCamera')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cctvList.map((cam) => (
              <div
                key={cam.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl"
              >
                <div
                  className={`relative aspect-video w-full flex items-center justify-center overflow-hidden ${
                    nightVision ? 'bg-emerald-950/80 grayscale contrast-125' : 'bg-slate-950'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Radio className="h-10 w-10 text-emerald-400 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-white">{cam.name}</p>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1">IP: {cam.ipAddress}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">RTSP H.264 • 1080p @ {cam.fps} FPS</p>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>REC {cam.resolution}</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800 backdrop-blur">
                    {cam.ipAddress}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white">{cam.name}</h4>
                    <p className="text-[11px] text-slate-400">{cam.location}</p>
                  </div>
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800">
                    {cam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAddCctvOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
              <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <h3 className="text-base font-bold text-white">{t('addIpCamera')}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect nearby IP cameras or CCTV through local network IP address.
                </p>

                <form onSubmit={handleAddCctvSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('cameraName')}
                    </label>
                    <input
                      type="text"
                      value={newCamName}
                      onChange={(e) => setNewCamName(e.target.value)}
                      placeholder="e.g. Rehab Bay 2 / Hallway East"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Physical Location / Ward
                    </label>
                    <input
                      type="text"
                      value={newCamLocation}
                      onChange={(e) => setNewCamLocation(e.target.value)}
                      placeholder="e.g. Neurology Ward 3"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('ipAddressLabel')}
                    </label>
                    <input
                      type="text"
                      value={newCamIp}
                      onChange={(e) => setNewCamIp(e.target.value)}
                      placeholder="192.168.1.185:554 or rtsp://..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddCctvOpen(false)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow"
                    >
                      Connect Stream
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Emergency Dispatch Log */}
      {activeTab === 'alerts' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Emergency Dispatches to Admin Mobile</h3>
              <p className="text-xs text-slate-400">
                Audit trail of automated SMS alerts and phone calls sent to {adminPhone}
              </p>
            </div>
            <button
              onClick={() => triggerEmergency('FACIAL_DROOP', 'Manual test dispatch of acute facial droop to admin.')}
              className="rounded-xl bg-rose-600/80 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Trigger Test Call &amp; SMS
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {emergencyHistory.map((rec) => (
              <div key={rec.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-rose-600/20 p-2.5 text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rec.type.replace('_', ' ')}</span>
                      <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800">
                        {rec.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{rec.details}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>SMS: <strong className="text-emerald-400">{rec.smsStatus}</strong> ({rec.adminPhone})</span>
                      <span>•</span>
                      <span>Call: <strong className="text-emerald-400">{rec.callStatus}</strong></span>
                      <span>•</span>
                      <span>Symmetry: <strong className="font-mono text-sky-400">{rec.symmetryScore}%</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {rec.acknowledged ? (
                    <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 border border-slate-800 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={acknowledgeEmergency}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
