"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rtdb, db } from "@/lib/firebase";
import { ref, onValue, set as setRTDB } from "firebase/database";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Fan, Lightbulb, Activity, Zap, Wifi, WifiOff, Settings, LogOut, QrCode, Sparkles } from "lucide-react";

interface DeviceState {
  lightOn: boolean;
  fanOn: boolean;
  fanSpeed: number;
  online: boolean;
  lastSeen: number;
  voltage: number;
  current: number;
  power: number;
  energy: number;
}

const DEFAULT_STATE: DeviceState = {
  lightOn: false,
  fanOn: false,
  fanSpeed: 0,
  online: false,
  lastSeen: 0,
  voltage: 0,
  current: 0,
  power: 0,
  energy: 0
};

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<DeviceState>(DEFAULT_STATE);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    if (rtdb.app.options.apiKey === "placeholder-api-key") {
      // MOCK DATA for testing UI without Firebase
      setState({
        lightOn: true,
        fanOn: true,
        fanSpeed: 75,
        online: true,
        lastSeen: Date.now(),
        voltage: 228.4,
        current: 1.2,
        power: 274.1,
        energy: 14.5
      });
      setIsInitializing(false);
      return () => {};
    }

    // Listen to device state from Realtime Database (ultra-low latency)
    const deviceRef = ref(rtdb, "devices/main_controller");
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setState(data as DeviceState);
      } else {
        // Initialize if not exists
        setRTDB(deviceRef, DEFAULT_STATE);
      }
      setIsInitializing(false);
    }, (error) => {
      console.error("Error fetching RTDB state", error);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [user]);

  const logEvent = async (device: string, previousState: string, newState: string) => {
    if (rtdb.app.options.apiKey === "placeholder-api-key") return;
    try {
      await addDoc(collection(db, "logs"), {
        timestamp: serverTimestamp(),
        source: "Website",
        device,
        previousState,
        newState
      });
    } catch (e) {
      console.error("Failed to log event:", e);
    }
  };

  const toggleLight = async () => {
    if (!user) return;
    const newState = !state.lightOn;
    // Optimistic Mock Update
    setState(prev => ({...prev, lightOn: newState}));
    
    if (rtdb.app.options.apiKey === "placeholder-api-key") return;
    await setRTDB(ref(rtdb, "devices/main_controller/lightOn"), newState);
    logEvent("Light", state.lightOn ? "ON" : "OFF", newState ? "ON" : "OFF");
  };

  const toggleFan = async () => {
    if (!user) return;
    const newState = !state.fanOn;
    // Optimistic Mock Update
    setState(prev => ({...prev, fanOn: newState}));
    
    if (rtdb.app.options.apiKey === "placeholder-api-key") return;
    await setRTDB(ref(rtdb, "devices/main_controller/fanOn"), newState);
    logEvent("Fan Power", state.fanOn ? "ON" : "OFF", newState ? "ON" : "OFF");
  };

  const handleFanSpeed = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const speed = parseInt(e.target.value);
    // Optimistic Mock Update
    setState(prev => ({ ...prev, fanSpeed: speed }));
    
    if (rtdb.app.options.apiKey === "placeholder-api-key") return;
    await setRTDB(ref(rtdb, "devices/main_controller/fanSpeed"), speed);
    logEvent("Fan Speed", `${state.fanSpeed}%`, `${speed}%`);
  };

  if (loading || isInitializing || !user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400"><Activity className="animate-spin w-10 h-10" /></div>;
  }

  // Calculate if offline based on lastSeen heartbeat (e.g., more than 30 seconds ago)
  const isOffline = (Date.now() - state.lastSeen) > 30000;
  const statusColor = isOffline ? "text-red-400" : "text-emerald-400";
  const StatusIcon = isOffline ? WifiOff : Wifi;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-4 sm:p-8 relative overflow-x-hidden">
      {/* Dynamic Backgrounds based on state */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 -z-10 ${state.lightOn ? 'bg-yellow-500/20' : 'bg-slate-800/50'}`}></div>
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-1000 -z-10 ${state.fanOn ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}></div>

      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Smart Home Pro</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${statusColor}`} />
              <span className={statusColor}>{isOffline ? "Controller Offline" : "Controller Online"}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition group">
              <Settings className="w-5 h-5 text-slate-300 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <button onClick={logout} className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition group hover:bg-red-500/10 hover:border-red-500/30">
              <LogOut className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                <QrCode className="h-4 w-4" />
                QR Activation Ready
              </div>
              <p className="text-slate-300 mt-1">Scan a device QR code to bind it to your account instantly and activate commercial licensing.</p>
            </div>
            <button
              onClick={() => router.push("/activate")}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-200 border border-cyan-400/20 hover:bg-cyan-500/30 transition"
            >
              <Sparkles className="h-4 w-4" />
              Activate Device
            </button>
          </div>
          {/* Light Card */}
          <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 border ${state.lightOn ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl ${state.lightOn ? 'bg-yellow-500/20 text-yellow-400 shadow-inner' : 'bg-slate-800 text-slate-400'}`}>
                <Lightbulb className={`w-8 h-8 ${state.lightOn ? 'animate-pulse' : ''}`} />
              </div>
              <button 
                onClick={toggleLight}
                className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${state.lightOn ? 'bg-yellow-500' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${state.lightOn ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Main Light</h2>
              <p className="text-slate-400 text-sm">{state.lightOn ? 'Currently ON' : 'Currently OFF'}</p>
            </div>
          </div>

          {/* Fan Card */}
          <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 border ${state.fanOn ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${state.fanOn ? 'bg-blue-500/20 text-blue-400 shadow-inner' : 'bg-slate-800 text-slate-400'}`}>
                <Fan className={`w-8 h-8 ${state.fanOn ? 'animate-spin' : ''}`} style={{ animationDuration: state.fanOn && state.fanSpeed > 0 ? `${3000 / (Math.max(10, state.fanSpeed))}s` : '0s' }} />
              </div>
              <button 
                onClick={toggleFan}
                className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${state.fanOn ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${state.fanOn ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">Ceiling Fan</h2>
              <p className="text-slate-400 text-sm mb-4">{state.fanOn ? `${state.fanSpeed}% Speed` : 'Currently OFF'}</p>
              
              {/* Slider */}
              <div className="relative w-full h-10 flex items-center group">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={state.fanSpeed}
                  onChange={handleFanSpeed}
                  disabled={!state.fanOn}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${state.fanOn ? 'bg-blue-900/50' : 'bg-slate-800'} accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  style={{
                    background: state.fanOn ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${state.fanSpeed}%, rgba(30,58,138,0.3) ${state.fanSpeed}%, rgba(30,58,138,0.3) 100%)` : ''
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Power Monitoring Card */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap className="text-yellow-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Power Monitoring</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 hover:bg-slate-800/80 transition-colors">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Voltage</p>
              <p className="text-2xl font-bold text-white">{state.voltage.toFixed(1)}<span className="text-sm font-normal text-slate-500 ml-1">V</span></p>
            </div>
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 hover:bg-slate-800/80 transition-colors">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Current</p>
              <p className="text-2xl font-bold text-white">{state.current.toFixed(2)}<span className="text-sm font-normal text-slate-500 ml-1">A</span></p>
            </div>
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 hover:bg-slate-800/80 transition-colors">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Power</p>
              <p className="text-2xl font-bold text-white">{state.power.toFixed(1)}<span className="text-sm font-normal text-slate-500 ml-1">W</span></p>
            </div>
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 hover:bg-slate-800/80 transition-colors">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Energy</p>
              <p className="text-2xl font-bold text-white">{state.energy.toFixed(2)}<span className="text-sm font-normal text-slate-500 ml-1">kWh</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
