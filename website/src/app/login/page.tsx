"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Power, Cpu, Wifi, Zap } from "lucide-react";

export default function LoginPage() {
    const { user, loading, loginWithEmail, registerWithEmail } = useAuth();
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || user) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSigningIn(true);
        try {
            await loginWithEmail(email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSigningIn(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSigningIn(true);
        try {
            await registerWithEmail(email, password, displayName);
        } catch (err: any) {
            setError(err.message);
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

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                        {isSignup && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={signingIn}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 px-6 rounded-2xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-6"
                        >
                            {signingIn ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Sign Up" : "Sign In")}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="text-center mt-6">
                        <p className="text-slate-400 text-sm">
                            {isSignup ? "Already have an account? " : "Don't have an account? "}
                            <button
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError("");
                                    setEmail("");
                                    setPassword("");
                                    setDisplayName("");
                                }}
                                className="text-blue-400 hover:text-blue-300 underline transition"
                            >
                                {isSignup ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>

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
