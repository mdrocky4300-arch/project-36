"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
    User, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
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

    const loginWithEmail = async (email: string, password: string) => {
        if(auth.app.options.apiKey === "placeholder-api-key") {
            alert("ℹ️ Demo mode: Auto-logging in with test account.");
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            if (error.code === "auth/user-not-found") {
                throw new Error("No account found with this email. Please sign up first.");
            } else if (error.code === "auth/wrong-password") {
                throw new Error("Incorrect password. Please try again.");
            } else if (error.code === "auth/invalid-email") {
                throw new Error("Invalid email address.");
            } else if (error.code === "auth/too-many-requests") {
                throw new Error("Too many failed login attempts. Try again later.");
            } else {
                throw new Error(error.message || "Login failed. Please try again.");
            }
        }
    };

    const registerWithEmail = async (email: string, password: string, displayName: string) => {
        if(auth.app.options.apiKey === "placeholder-api-key") {
            alert("ℹ️ Demo mode: Creating test account.");
            return;
        }
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                throw new Error("Email already registered. Please log in instead.");
            } else if (error.code === "auth/weak-password") {
                throw new Error("Password is too weak. Use at least 6 characters.");
            } else if (error.code === "auth/invalid-email") {
                throw new Error("Invalid email address.");
            } else {
                throw new Error(error.message || "Signup failed. Please try again.");
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
        <AuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, logout }}>
            {!loading ? children : <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">Loading...</div>}
        </AuthContext.Provider>
    );
};
