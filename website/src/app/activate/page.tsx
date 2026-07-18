"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { ShieldCheck, QrCode, KeyRound, Sparkles, ArrowRight } from "lucide-react";

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [deviceId, setDeviceId] = useState(searchParams.get("device") || "");
  const [activationCode, setActivationCode] = useState(searchParams.get("code") || "");
  const [secretKey, setSecretKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const submitActivation = async () => {
    if (!deviceId || !activationCode || !secretKey) {
      setMessage("Please provide your device ID, activation code, and secret key.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const activateFn = httpsCallable(functions, "activateDevice");
      const result = await activateFn({ deviceId, activationCode, secretKey }) as { data: { success: boolean; device?: { deviceId: string } } };
      if (result.data?.success) {
        setMessage(`Device ${deviceId} activated successfully. Redirecting to your dashboard.`);
        setTimeout(() => router.push("/"), 1500);
      }
    } catch (error) {
      console.error(error);
      setMessage("Activation failed. Verify the QR data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.15),_transparent_35%),linear-gradient(135deg,_#020617,_#111827)] p-4 text-slate-100">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Commercial Device Activation</h1>
            <p className="text-sm text-slate-400">Activate your ESP32 device, bind it to your account, and unlock the full platform.</p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Scan QR or enter the details from the sticker</p>
            <p className="text-xs text-slate-400">The QR code contains your commercial device credentials for secure onboarding.</p>
          </div>
          <div className="rounded-2xl bg-slate-950/40 p-3 text-cyan-200">
            <QrCode className="h-8 w-8" />
          </div>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Device ID</span>
            <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none" placeholder="SH-000001" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Activation Code</span>
            <input value={activationCode} onChange={(e) => setActivationCode(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm outline-none" placeholder="ACT-XXXX-XXXX-XXXX" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Secret Key</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <KeyRound className="h-4 w-4 text-slate-500" />
              <input value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="Enter the secret key from the QR label" />
            </div>
          </label>
        </div>

        <button onClick={submitActivation} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? "Activating..." : "Activate Device"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>{message}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
