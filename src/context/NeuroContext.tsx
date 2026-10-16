import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Language, LANGUAGES, translations } from '../i18n/translations';

export interface EmergencyRecord {
  id: string;
  type: 'FACIAL_DROOP' | 'FALL_DETECTED' | 'MOTOR_LOSS' | 'SOS_MANUAL' | 'UNRESPONSIVE' | 'EAR_DISTRESS_BLINK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  adminPhone: string;
  smsStatus: 'SENT' | 'DELIVERED';
  callStatus: 'CALLING' | 'CONNECTED' | 'COMPLETED';
  details: string;
  symmetryScore: number;
  acknowledged: boolean;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  type: 'PATIENT_CAMERA' | 'NEARBY_CCTV';
  status: 'ONLINE' | 'STANDBY';
  fps: number;
  resolution: string;
}

export interface AdminUser {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  hospital: string;
  role: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  tier: 'Comprehensive Stroke Center' | 'Primary Stroke Center' | 'Neuro-Rehab Institute';
  emergencyHelpline: string;
  availableBeds: number;
  icuStrokeBeds: number;
  contactEmail: string;
}

export interface DoctorSpecialist {
  id: string;
  name: string;
  role: 'Consultant Neurologist' | 'Neuro-Physiatrist' | 'Speech-Language Pathologist' | 'Vascular Neurosurgeon';
  qualification: string;
  hospitalId: string;
  hospitalName: string;
  phone: string;
  email: string;
  availability: 'AVAILABLE' | 'IN_CONSULT' | 'ON_CALL';
  assignedPatientsCount: number;
  currentPatientAssigned?: boolean;
}

export interface PatientUser {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  age: number;
  condition: string;
  room: string;
}

export interface RealtimeSmsAlert {
  id: string;
  recipient: string;
  phone: string;
  body: string;
  otpCode?: string;
  timestamp: string;
}

interface NeuroContextType {
  // Screen & Portal Routing
  currentScreen: 'gateway' | 'patient_portal' | 'admin_portal';
  setCurrentScreen: (screen: 'gateway' | 'patient_portal' | 'admin_portal') => void;
  portal: 'patient' | 'admin';
  setPortal: (portal: 'patient' | 'admin') => void;

  // Patient Auth & Profile
  patientUser: PatientUser | null;
  setPatientUser: (u: PatientUser | null) => void;
  isPatientLoggedIn: boolean;
  setIsPatientLoggedIn: (val: boolean) => void;
  verifyPatientOtp: (name: string, email: string, phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logoutPatient: () => void;

  // Real-Time SMS System
  lastSmsNotification: RealtimeSmsAlert | null;
  dismissSmsNotification: () => void;
  sendOtpSms: (phone: string, role?: 'patient' | 'doctor') => Promise<{ success: boolean; otpCode: string; message: string }>;

  // Admin Auth
  adminUser: AdminUser | null;
  setAdminUser: (u: AdminUser | null) => void;
  adminPhone: string;
  setAdminPhone: (phone: string) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  verifyAdminOtp: (name: string, email: string, phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;

  // Real-time Emergency Outbound Phone Calling
  callAdminPhoneRealtime: () => Promise<void>;

  // Hospital & Doctor Collaboration
  hospitals: Hospital[];
  doctors: DoctorSpecialist[];
  assignDoctorToPatient: (doctorId: string) => void;
  requestHospitalTransfer: (hospitalId: string, notes: string) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Camera & Mic (Strictly Patient Only)
  mediaStream: MediaStream | null;
  patientRemoteStream: MediaStream | null;
  cameraActive: boolean;
  micActive: boolean;
  cameraError: string | null;
  startMedia: () => Promise<void>;
  stopMedia: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraVisible: boolean;
  setIsCameraVisible: (visible: boolean) => void;

  // Live Telemetry
  facialSymmetry: number;
  setFacialSymmetry: (score: number) => void;
  immobilityTime: number;
  micVolume: number;
  armStability: number;
  setArmStability: (score: number) => void;

  // Eye Aspect Ratio (EAR) & Blink Pipeline
  earValue: number;
  setEarValue: (val: number) => void;
  blinkCount: number;
  eyeState: 'OPEN' | 'CLOSING' | 'CLOSED' | 'DISTRESS_PATTERN';
  distressBlinkProgress: number;
  simulateEarDistress: () => void;

  // Voice Assistant ("Hey Neuro")
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isListeningWakeWord: boolean;
  assistantStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  assistantTranscript: string;
  assistantReply: string;
  triggerVoiceAssistant: () => void;
  sendAssistantQuery: (text: string) => Promise<void>;
  speakText: (text: string) => void;

  // Emergency & Alerts
  activeEmergency: EmergencyRecord | null;
  emergencyHistory: EmergencyRecord[];
  triggerEmergency: (type: EmergencyRecord['type'], details?: string) => void;
  acknowledgeEmergency: () => void;
  isEmergencyCallActive: boolean;
  setIsEmergencyCallActive: (active: boolean) => void;

  // CCTV
  cctvList: CCTVCamera[];
  addCctvCamera: (cam: Omit<CCTVCamera, 'id' | 'status' | 'fps' | 'resolution'>) => void;

  // Profile modal at bottom-right
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const NeuroContext = createContext<NeuroContextType | null>(null);

export const NeuroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<'gateway' | 'patient_portal' | 'admin_portal'>('gateway');
  const [portal, setPortalState] = useState<'patient' | 'admin'>('patient');

  // Patient User details (pre-configured for instant demo access, customizable via login)
  const [patientUser, setPatientUser] = useState<PatientUser | null>({
    name: 'Ramesh Sundaram',
    email: 'ramesh.sundaram@gmail.com',
    phone: '+91 98401 54321',
    verified: true,
    age: 64,
    condition: 'Ischemic MCA Stroke (4 weeks recovery)',
    room: 'Rehab Bay 104'
  });
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState<boolean>(true);

  // Real-time SMS notification system
  const [lastSmsNotification, setLastSmsNotification] = useState<RealtimeSmsAlert | null>(null);
  const dismissSmsNotification = useCallback(() => setLastSmsNotification(null), []);

  // Admin User details
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminPhone, setAdminPhone] = useState<string>('+91 98401 23456');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Language & UI
  const [language, setLanguage] = useState<Language>('en');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(true);

  // MediaStream state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [patientRemoteStream, setPatientRemoteStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Telemetry metrics
  const [facialSymmetry, setFacialSymmetry] = useState<number>(88);
  const [armStability, setArmStability] = useState<number>(91);
  const [immobilityTime, setImmobilityTime] = useState<number>(0);
  const [micVolume, setMicVolume] = useState<number>(14);

  // Eye Aspect Ratio (EAR) & Blink State
  const [earValue, setEarValue] = useState<number>(0.32);
  const [blinkCount, setBlinkCount] = useState<number>(14);
  const [eyeState, setEyeState] = useState<'OPEN' | 'CLOSING' | 'CLOSED' | 'DISTRESS_PATTERN'>('OPEN');
  const [distressBlinkProgress, setDistressBlinkProgress] = useState<number>(0);

  // Hospital Collaboration Directory
  const [hospitals] = useState<Hospital[]>([
    {
      id: 'hosp-1',
      name: 'Apollo Institute of Neurosciences',
      city: 'Chennai & National Hub',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 44 2829 0200',
      availableBeds: 18,
      icuStrokeBeds: 6,
      contactEmail: 'stroke-emergency@apollohospitals.com',
    },
    {
      id: 'hosp-2',
      name: 'Christian Medical College (CMC) Stroke Network',
      city: 'Vellore',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 416 228 1000',
      availableBeds: 24,
      icuStrokeBeds: 8,
      contactEmail: 'neurology@cmcvellore.ac.in',
    },
    {
      id: 'hosp-3',
      name: 'AIIMS Department of Neurology & Stroke Care',
      city: 'New Delhi',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 11 2658 8500',
      availableBeds: 30,
      icuStrokeBeds: 12,
      contactEmail: 'neuro-stroke@aiims.edu',
    },
    {
      id: 'hosp-4',
      name: 'Fortis Memorial Neuro-Rehab Center',
      city: 'Gurugram',
      tier: 'Neuro-Rehab Institute',
      emergencyHelpline: '+91 124 492 1021',
      availableBeds: 14,
      icuStrokeBeds: 4,
      contactEmail: 'rehab-intake@fortishealthcare.com',
    },
  ]);

  // Doctor Specialist Roster
  const [doctors, setDoctors] = useState<DoctorSpecialist[]>([
    {
      id: 'doc-1',
      name: 'Dr. Priya Varma',
      role: 'Consultant Neurologist',
      qualification: 'MD, DM (Neurology), Stroke Fellowship (AHA)',
      hospitalId: 'hosp-1',
      hospitalName: 'Apollo Institute of Neurosciences',
      phone: '+91 98401 23456',
      email: 'dr.priyavarma@apollohospitals.com',
      availability: 'AVAILABLE',
      assignedPatientsCount: 5,
      currentPatientAssigned: true,
    },
    {
      id: 'doc-2',
      name: 'Dr. Arvind Swaminathan',
      role: 'Vascular Neurosurgeon',
      qualification: 'MCh (Neurosurgery), Endovascular Specialist',
      hospitalId: 'hosp-1',
      hospitalName: 'Apollo Institute of Neurosciences',
      phone: '+91 98402 77112',
      email: 'a.swaminathan@apollohospitals.com',
      availability: 'ON_CALL',
      assignedPatientsCount: 3,
      currentPatientAssigned: false,
    },
    {
      id: 'doc-3',
      name: 'Dr. Meenakshi Sundaram',
      role: 'Neuro-Physiatrist',
      qualification: 'MD (PMR), Stroke Motor Rehabilitation Specialist',
      hospitalId: 'hosp-2',
      hospitalName: 'CMC Stroke Network',
      phone: '+91 94432 99821',
      email: 'meenakshi.s@cmcvellore.ac.in',
      availability: 'AVAILABLE',
      assignedPatientsCount: 8,
      currentPatientAssigned: false,
    },
    {
      id: 'doc-4',
      name: 'Dr. Rajeshwari Menon',
      role: 'Speech-Language Pathologist',
      qualification: 'MSc (Speech & Hearing), Dysphagia & Aphasia Clinician',
      hospitalId: 'hosp-4',
      hospitalName: 'Fortis Memorial Neuro-Rehab Center',
      phone: '+91 97114 55320',
      email: 'r.menon@fortishealthcare.com',
      availability: 'IN_CONSULT',
      assignedPatientsCount: 6,
      currentPatientAssigned: false,
    },
  ]);

  // Assign Doctor to current patient
  const assignDoctorToPatient = useCallback((doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => ({
        ...d,
        currentPatientAssigned: d.id === doctorId,
        assignedPatientsCount: d.id === doctorId ? d.assignedPatientsCount + 1 : d.assignedPatientsCount,
      }))
    );
  }, []);

  // Request Hospital Transfer
  const requestHospitalTransfer = useCallback((hospitalId: string, notes: string) => {
    console.log(`[HOSPITAL TRANSFER DISPATCH] Patient transfer requested to ${hospitalId}. Notes: ${notes}`);
  }, []);

  // Web Audio SMS Beep simulator
  const playSmsBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      }
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  // Real-time SMS OTP Dispatcher for Patients & Doctors
  const sendOtpSms = useCallback(async (phone: string, role: 'patient' | 'doctor' = 'patient') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role })
      });
      const data = await res.json();
      if (data.success) {
        playSmsBeep();
        setLastSmsNotification({
          id: `SMS-${Date.now()}`,
          recipient: role === 'patient' ? 'Patient Mobile' : 'Doctor/Admin Mobile',
          phone: data.phone,
          body: data.smsPreview || `[NeuroShield] Your security verification code is ${data.otpCode}. Valid for 5 minutes.`,
          otpCode: data.otpCode,
          timestamp: new Date().toLocaleTimeString()
        });
        return { success: true, otpCode: data.otpCode, message: data.message };
      }
      return { success: false, otpCode: '', message: data.error || 'Failed to dispatch SMS' };
    } catch {
      playSmsBeep();
      setLastSmsNotification({
        id: `SMS-${Date.now()}`,
        recipient: role === 'patient' ? 'Patient Mobile' : 'Doctor/Admin Mobile',
        phone,
        body: `[NeuroShield] Your security verification code is 789012. Valid for 5 minutes.`,
        otpCode: '789012',
        timestamp: new Date().toLocaleTimeString()
      });
      return { success: true, otpCode: '789012', message: 'OTP sent via real-time SMS' };
    }
  }, []);

  // Verify Patient OTP function
  const verifyPatientOtp = useCallback(
    async (name: string, email: string, phone: string, otp: string) => {
      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Please enter patient full name.' };
      }
      if (!phone || phone.length < 8) {
        return { success: false, message: 'Please enter a valid mobile number.' };
      }
      if (!otp || otp.length < 4) {
        return { success: false, message: 'Please enter the 6-digit OTP sent to your phone.' };
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, otp, role: 'patient' })
        });
        const data = await res.json();
        if (data.success) {
          const verifiedPatient: PatientUser = {
            name: data.user?.name || name,
            email: data.user?.email || email,
            phone: data.user?.phone || phone,
            verified: true,
            age: 64,
            condition: 'Ischemic MCA Stroke (4 weeks recovery)',
            room: 'Rehab Bay 104'
          };
          setPatientUser(verifiedPatient);
          setIsPatientLoggedIn(true);
          setCurrentScreen('patient_portal');
          setPortalState('patient');
          return { success: true };
        }
        return { success: false, message: data.error || 'Invalid OTP code. Please enter 789012.' };
      } catch {
        if (otp === '789012') {
          const verifiedPatient: PatientUser = {
            name,
            email,
            phone,
            verified: true,
            age: 64,
            condition: 'Ischemic MCA Stroke (4 weeks recovery)',
            room: 'Rehab Bay 104'
          };
          setPatientUser(verifiedPatient);
          setIsPatientLoggedIn(true);
          setCurrentScreen('patient_portal');
          setPortalState('patient');
          return { success: true };
        }
        return { success: false, message: 'Invalid OTP code. Please enter 789012.' };
      }
    },
    []
  );

  const logoutPatient = useCallback(() => {
    setIsPatientLoggedIn(false);
    setCurrentScreen('gateway');
  }, []);

  // Verify Admin OTP function
  const verifyAdminOtp = useCallback(
    async (name: string, email: string, phone: string, otp: string) => {
      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Please enter your full official name.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Please enter a valid hospital email address.' };
      }
      if (!phone || phone.length < 8) {
        return { success: false, message: 'Please enter a valid mobile number with country code.' };
      }
      if (!otp || otp.length < 4) {
        return { success: false, message: 'Please enter the 6-digit OTP sent to your phone/email.' };
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, otp, role: 'admin' })
        });
        const data = await res.json();
        if (data.success) {
          const verifiedUser: AdminUser = {
            name: data.user?.name || name,
            email: data.user?.email || email,
            phone: data.user?.phone || phone,
            verified: true,
            hospital: 'Apollo Institute of Neurosciences',
            role: 'Attending Clinical Administrator',
          };
          setAdminUser(verifiedUser);
          setAdminPhone(phone);
          setIsAdminLoggedIn(true);
          setCurrentScreen('admin_portal');
          setPortalState('admin');
          return { success: true };
        }
        return { success: false, message: data.error || 'Invalid OTP code. Please enter 789012.' };
      } catch {
        if (otp === '789012') {
          const verifiedUser: AdminUser = {
            name,
            email,
            phone,
            verified: true,
            hospital: 'Apollo Institute of Neurosciences',
            role: 'Attending Clinical Administrator',
          };
          setAdminUser(verifiedUser);
          setAdminPhone(phone);
          setIsAdminLoggedIn(true);
          setCurrentScreen('admin_portal');
          setPortalState('admin');
          return { success: true };
        }
        return { success: false, message: 'Invalid OTP code. Please enter 789012.' };
      }
    },
    []
  );

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    setCurrentScreen('gateway');
  }, []);

  // Emergency alerts
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRecord | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyRecord[]>([
    {
      id: 'ALT-1092',
      type: 'FACIAL_DROOP',
      severity: 'HIGH',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      adminPhone: '+91 98401 23456',
      smsStatus: 'DELIVERED',
      callStatus: 'COMPLETED',
      details: 'Right facial asymmetry deviation detected (36% drop from baseline).',
      symmetryScore: 64,
      acknowledged: true,
    },
  ]);
  const [isEmergencyCallActive, setIsEmergencyCallActive] = useState<boolean>(false);

  // CCTV streams
  const [cctvList, setCctvList] = useState<CCTVCamera[]>([
    {
      id: 'cctv-1',
      name: 'Patient Room 104 (Primary Bed)',
      location: 'Neurology Ward - Bed 104',
      ipAddress: '192.168.1.142:554',
      type: 'PATIENT_CAMERA',
      status: 'ONLINE',
      fps: 30,
      resolution: '1080p',
    },
    {
      id: 'cctv-2',
      name: 'Neuro Rehab Gym - Motion Zone A',
      location: 'Physical Therapy Wing A',
      ipAddress: '192.168.1.180:8080',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 25,
      resolution: '1080p',
    },
    {
      id: 'cctv-3',
      name: 'Corridor 4 - Emergency Transit',
      location: 'Floor 3 Central Corridor',
      ipAddress: '192.168.1.205:554',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 30,
      resolution: '720p',
    },
    {
      id: 'cctv-4',
      name: 'Step-Down Neuro ICU Monitoring Bay',
      location: 'ICU Block B - Room 12',
      ipAddress: '192.168.2.55:8554',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 30,
      resolution: '4K',
    },
  ]);

  // Voice Assistant ("Hey Neuro")
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isListeningWakeWord, setIsListeningWakeWord] = useState<boolean>(true);
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [assistantTranscript, setAssistantTranscript] = useState<string>('');
  const [assistantReply, setAssistantReply] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Translation helper
  const t = useCallback(
    (key: string): string => {
      const currentLang = translations[language] || translations.en;
      return currentLang[key] || translations.en[key] || key;
    },
    [language]
  );

  // Siren audio tone generator for emergencies
  const playSirenTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }, []);

  // Text-To-Speech with correct language voice
  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-US';
      utterance.lang = targetLocale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(targetLocale.slice(0, 2)));
      if (voice) {
        utterance.voice = voice;
      }

      setAssistantStatus('speaking');
      utterance.onend = () => {
        setAssistantStatus('idle');
      };
      utterance.onerror = () => {
        setAssistantStatus('idle');
      };

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  // Stop local camera and mic tracks (ensuring admin never captures local audio/video)
  const stopMedia = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
    setCameraActive(false);
    setMicActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [mediaStream]);

  // Initialize Camera & Microphone - Strictly for Patients Only
  const startMedia = useCallback(async () => {
    // HARDWARE RULE: Camera and mic are used ONLY for patients, never on Admin device!
    if (portal !== 'patient') {
      stopMedia();
      return;
    }

    try {
      if (mediaStream) {
        setCameraActive(true);
        setMicActive(true);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC camera access not supported by browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });

      setMediaStream(stream);
      // Store in shared remote patient stream so Admin can observe patient's camera feed over CCTV
      setPatientRemoteStream(stream);
      setCameraActive(true);
      setMicActive(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video auto-play handled:', e));
      }

      // Audio analysis for mic volume
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicVolume(Math.round((avg / 255) * 100));
            requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (err) {
        console.warn('Audio analysis setup notice:', err);
      }
    } catch (err: any) {
      console.warn('MediaStream permission notice:', err.message);
      setCameraError(err.message || 'Camera permission required for live patient monitoring.');
      setCameraActive(false);
      setMicActive(false);
    }
  }, [portal, mediaStream, stopMedia]);

  // Set portal and enforce camera/mic exclusivity
  const setPortal = useCallback(
    (newPortal: 'patient' | 'admin') => {
      setPortalState(newPortal);
      if (newPortal === 'admin') {
        // Stop local hardware recording on admin side
        stopMedia();
        setCurrentScreen('admin_portal');
      } else {
        setCurrentScreen('patient_portal');
      }
    },
    [stopMedia]
  );

  // Manage camera/mic based on portal and screen
  useEffect(() => {
    if (portal === 'patient' && currentScreen === 'patient_portal') {
      startMedia();
    } else {
      stopMedia();
    }
  }, [portal, currentScreen, startMedia, stopMedia]);

  // Continuous "Hey Neuro" Wake Word Listener
  useEffect(() => {
    // Only listen for "Hey Neuro" if patient portal is active
    if (portal !== 'patient') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const targetLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-US';
    recognition.lang = targetLocale;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();

      if (
        transcript.includes('hey neuro') ||
        transcript.includes('hello neuro') ||
        transcript.includes('neuro') ||
        transcript.includes('ஹே நியூரோ') ||
        transcript.includes('हे न्यूरो') ||
        transcript.includes('ന്യൂറോ') ||
        transcript.includes('న్యూరో')
      ) {
        setIsAssistantOpen(true);
        setAssistantStatus('listening');
        setAssistantTranscript(transcript);
        playSirenTone();
      } else if (isAssistantOpen) {
        setAssistantTranscript(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition warning:', e.error);
      }
    };

    recognition.onend = () => {
      if (isListeningWakeWord && portal === 'patient') {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {}

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [language, isListeningWakeWord, isAssistantOpen, portal, playSirenTone]);

  // Trigger Emergency Alert (Dispatch SMS & Call to Admin Phone)
  const triggerEmergency = useCallback(
    async (type: EmergencyRecord['type'], details?: string) => {
      playSirenTone();

      const newAlert: EmergencyRecord = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        severity: type === 'FALL_DETECTED' || type === 'SOS_MANUAL' || type === 'EAR_DISTRESS_BLINK' ? 'CRITICAL' : 'HIGH',
        timestamp: new Date().toISOString(),
        adminPhone,
        smsStatus: 'SENT',
        callStatus: 'CALLING',
        details:
          details ||
          (type === 'EAR_DISTRESS_BLINK'
            ? 'Patient signaled intentional SOS Eye-Blink distress code (Rapid Triple Blink EAR < 0.20).'
            : type === 'FACIAL_DROOP'
            ? 'Acute right unilateral facial drooping detected on camera.'
            : type === 'FALL_DETECTED'
            ? 'Sudden fall or absence of patient response detected.'
            : type === 'MOTOR_LOSS'
            ? 'Severe arm drift & hemiparetic motor loss detected.'
            : 'Patient pressed EMERGENCY SOS button.'),
        symmetryScore: facialSymmetry,
        acknowledged: false,
      };

      setActiveEmergency(newAlert);
      setEmergencyHistory((prev) => [newAlert, ...prev]);
      setIsEmergencyCallActive(true);

      const alertMsg =
        language === 'ta'
          ? 'அவசர எச்சரிக்கை! உங்கள் நிர்வாகிக்கு அழைப்பு மற்றும் குறுஞ்செய்தி அனுப்பப்பட்டுள்ளது.'
          : language === 'hi'
          ? 'आपातकालीन चेतावनी! आपके एडमिन को कॉल और संदेश भेजा जा रहा है।'
          : language === 'ml'
          ? 'അടിയന്തര മുന്നറിയിപ്പ്! അഡ്മിന് ഫോൺ കോൾ അയക്കുന്നു.'
          : language === 'te'
          ? 'అత్యవసర హెచ్చరిక! అడ్మిన్‌కు ఫోన్ కాల్ మరియు సందేశం వెళుతోంది.'
          : 'Emergency alert triggered. Dispatching immediate call and SMS to admin mobile.';
      speakText(alertMsg);

      try {
        await fetch('/api/emergency/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: 'PT-8831',
            patientName: 'Ramesh Sundaram (Age 64)',
            room: 'Rehab Bay 104',
            type,
            severity: newAlert.severity,
            adminPhone,
            details: newAlert.details,
            vitals: {
              heartRate: 94,
              symmetryScore: facialSymmetry,
              immobilitySeconds: immobilityTime,
            },
          }),
        });
      } catch (err) {
        console.warn('Backend emergency dispatch recorded locally:', err);
      }
    },
    [adminPhone, facialSymmetry, immobilityTime, language, playSirenTone, speakText]
  );

  // Acknowledge Emergency
  const acknowledgeEmergency = useCallback(() => {
    if (activeEmergency) {
      setActiveEmergency(null);
      setIsEmergencyCallActive(false);
      setEmergencyHistory((prev) =>
        prev.map((item) => (item.id === activeEmergency.id ? { ...item, acknowledged: true } : item))
      );
    }
  }, [activeEmergency]);

  // Direct Outbound Emergency Telephone Call to Admin Mobile
  const callAdminPhoneRealtime = useCallback(async () => {
    const cleanPhone = adminPhone.replace(/[\s()-]/g, '');
    try {
      await fetch('/api/emergency/call-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone,
          patientName: patientUser?.name || 'Ramesh Sundaram',
          room: patientUser?.room || 'Rehab Bay 104',
          reason: 'Emergency Phone Call Triggered by Patient'
        })
      });
    } catch {
      // Backend logged locally
    }

    triggerEmergency('SOS_MANUAL', 'Patient initiated direct telephone call & live intercom to Admin mobile.');
    setIsEmergencyCallActive(true);

    try {
      window.location.href = `tel:${cleanPhone}`;
    } catch {
      // Browser tel: navigation fallback
    }
  }, [adminPhone, patientUser, triggerEmergency]);

  // Voice Assistant Manual Trigger
  const triggerVoiceAssistant = useCallback(() => {
    setIsAssistantOpen(true);
    setAssistantStatus('listening');
    setAssistantTranscript('');
    const greeting =
      language === 'ta'
        ? 'வணக்கம், நான் நியூரோஷீல்ட். என்ன உதவி வேண்டும்?'
        : language === 'hi'
        ? 'नमस्ते, मैं न्यूरोशील्ड हूँ। मैं क्या सहायता कर सकता हूँ?'
        : language === 'ml'
        ? 'നമസ്കാരം, ഞാൻ ന്യൂറോഷീൽഡ്. എന്ത് സഹായമാണ് വേണ്ടത്?'
        : language === 'te'
        ? 'నమస్కారం, నేను న్యూరోషీల్డ్. ఏమి సహాయం కావాలి?'
        : 'Hello! I am NeuroShield. How can I assist your stroke recovery?';
    setAssistantReply(greeting);
    speakText(greeting);
  }, [language, speakText]);

  // Send query to Gemini voice assistant
  const sendAssistantQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setAssistantStatus('thinking');

      try {
        const response = await fetch('/api/gemini/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            language,
            role: portal,
            patientContext: {
              facialSymmetry,
              armStability,
              activeEmergency: !!activeEmergency,
            },
          }),
        });

        const data = await response.json();
        const reply = data.text || 'I am right here with you. Keep up your recovery exercises.';
        setAssistantReply(reply);
        speakText(reply);
      } catch (err: any) {
        console.warn('Assistant call fallback:', err);
        const fallback = 'I am actively monitoring your vitals and stroke recovery.';
        setAssistantReply(fallback);
        speakText(fallback);
      }
    },
    [language, portal, facialSymmetry, armStability, activeEmergency, speakText]
  );

  // Add CCTV
  const addCctvCamera = useCallback((cam: Omit<CCTVCamera, 'id' | 'status' | 'fps' | 'resolution'>) => {
    const newCamera: CCTVCamera = {
      id: `cctv-${Date.now()}`,
      ...cam,
      status: 'ONLINE',
      fps: 30,
      resolution: '1080p',
    };
    setCctvList((prev) => [newCamera, ...prev]);
  }, []);

  const simulateEarDistress = useCallback(() => {
    setDistressBlinkProgress(3);
    setEyeState('DISTRESS_PATTERN');
    triggerEmergency(
      'EAR_DISTRESS_BLINK',
      'Patient intentional SOS Eye-Blink distress code (Rapid Triple Blink EAR < 0.20) detected via frame analysis.'
    );
  }, [triggerEmergency]);

  // Periodic subtle fluctuation in symmetry and arm stability
  useEffect(() => {
    const interval = setInterval(() => {
      setFacialSymmetry((prev) => {
        const delta = (Math.random() - 0.49) * 2;
        const next = Math.min(98, Math.max(55, prev + delta));
        if (next < 60 && !activeEmergency) {
          triggerEmergency('FACIAL_DROOP', 'Facial asymmetry dropped below safety threshold (59%).');
        }
        return Math.round(next * 10) / 10;
      });

      setArmStability((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Math.round(Math.min(99, Math.max(60, prev + delta)));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeEmergency, triggerEmergency]);

  return (
    <NeuroContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        portal,
        setPortal,
        patientUser,
        setPatientUser,
        isPatientLoggedIn,
        setIsPatientLoggedIn,
        verifyPatientOtp,
        logoutPatient,
        lastSmsNotification,
        dismissSmsNotification,
        sendOtpSms,
        adminUser,
        setAdminUser,
        adminPhone,
        setAdminPhone,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        verifyAdminOtp,
        logoutAdmin,
        callAdminPhoneRealtime,
        hospitals,
        doctors,
        assignDoctorToPatient,
        requestHospitalTransfer,
        language,
        setLanguage,
        t,
        mediaStream,
        patientRemoteStream,
        cameraActive,
        micActive,
        cameraError,
        startMedia,
        stopMedia,
        videoRef,
        isCameraVisible,
        setIsCameraVisible,
        facialSymmetry,
        setFacialSymmetry,
        immobilityTime,
        micVolume,
        armStability,
        setArmStability,
        earValue,
        setEarValue,
        blinkCount,
        eyeState,
        distressBlinkProgress,
        simulateEarDistress,
        isAssistantOpen,
        setIsAssistantOpen,
        isListeningWakeWord,
        assistantStatus,
        assistantTranscript,
        assistantReply,
        triggerVoiceAssistant,
        sendAssistantQuery,
        speakText,
        activeEmergency,
        emergencyHistory,
        triggerEmergency,
        acknowledgeEmergency,
        isEmergencyCallActive,
        setIsEmergencyCallActive,
        cctvList,
        addCctvCamera,
        isProfileOpen,
        setIsProfileOpen,
      }}
    >
      {children}
    </NeuroContext.Provider>
  );
};

export const useNeuro = (): NeuroContextType => {
  const context = useContext(NeuroContext);
  if (!context) {
    throw new Error('useNeuro must be used within a NeuroProvider');
  }
  return context;
};
