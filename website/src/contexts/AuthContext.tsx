"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
    User, 
    onAuthStateChanged, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Demo mode: Use mock user for testing
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
        if(isDemoMode || auth.app.options.apiKey === "placeholder-api-key") {
            setUser({ uid: "demo-user-123", displayName: "Demo User", email: "demo@example.com" } as User);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        if(auth.app.options.apiKey === "placeholder-api-key") {
            alert("ℹ️ Mock mode: Using test credentials. Replace .env.local with real Firebase credentials to enable Google login.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            if (error.code === "auth/popup-blocked") {
                alert("🔒 Popup blocked! Please allow popups for this site or check your browser settings.");
            } else if (error.code === "auth/configuration-not-found") {
                alert("⚠️ Firebase not configured. Add real credentials to .env.local");
            } else {
                console.error("Error signing in with Google:", error.message);
                alert("Login failed: " + (error.message || "Unknown error"));
            }
        }
    };

    const logout = async () => {
        if(auth.app.options.apiKey === "placeholder-api-key") return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {!loading ? children : <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">Loading...</div>}
        </AuthContext.Provider>
    );
};
