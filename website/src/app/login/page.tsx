"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Power, Cpu, Wifi, Zap } from "lucide-react";

export default function LoginPage() {
    const { user, loading, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [signingIn, setSigningIn] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || user) return null;

    const handleGoogleLogin = async () => {
        setSigningIn(true);
        try {
            await loginWithGoogle();
        } finally {
            setSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080c14] p-4 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-700/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-600/10 rounded-full blur-[80px]"></div>

            {/* Floating feature icons */}
            <div className="absolute top-1/4 left-[8%] hidden lg:flex flex-col gap-6 opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                    <Cpu className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                    <Wifi className="w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400">
                    <Zap className="w-6 h-6" />
                </div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 rounded-t-3xl"></div>

                    {/* Logo */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-5 border border-white/10 shadow-inner">
                            <Power className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                            Smart Home <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Pro</span>
                        </h1>
                        <p className="text-slate-400 text-sm">Sign in to control and monitor your devices</p>
                    </div>

                    {/* Feature badges */}
                    <div className="flex justify-center gap-3 mb-8 flex-wrap">
                        {["ESP32 Control", "Live Monitoring", "Power Stats"].map((feat) => (
                            <span key={feat} className="text-xs text-slate-400 border border-white/10 bg-white/5 px-3 py-1 rounded-full">
                                {feat}
                            </span>
                        ))}
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        id="google-signin-btn"
                        onClick={handleGoogleLogin}
                        disabled={signingIn}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 py-3.5 px-6 rounded-2xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {/* Google SVG Logo */}
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {signingIn ? "Signing in..." : "Continue with Google"}
                    </button>

                    <p className="text-center text-slate-500 text-xs mt-5">
                        By signing in, you agree to our{" "}
                        <span className="text-slate-400 underline cursor-pointer">Terms of Service</span>
                    </p>
                </div>

                {/* Footer note */}
                <p className="text-center text-slate-600 text-xs mt-4">
                    Smart Home Pro &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
