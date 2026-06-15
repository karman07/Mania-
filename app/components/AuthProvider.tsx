"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* special sentinel errors the dialog listens for */
export const ERR_UNVERIFIED  = "AUTH/EMAIL_NOT_VERIFIED";
export const ERR_VERIFY_SENT = "AUTH/VERIFICATION_SENT";

export type CreatorApplicationData = {
  penName: string;
  bio: string;
  genres: string[];
  portfolioUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  photoURL?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

export type RaMangaUser = {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "reader" | "creator" | null;
  username: string;
  dob: string;
  gender: string;
  country: string;
  countryCode: string;
  dialCode: string;
  phone: string;
  favoriteGenres: string[];
  profileCompleted: boolean;
};

type AuthCtx = {
  user: RaMangaUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  signInWithGoogle: () => Promise<RaMangaUser>;
  signInWithEmail: (email: string, password: string) => Promise<RaMangaUser>;
  signUpWithEmail: (email: string, password: string) => Promise<never>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncUser: (fbUser: FirebaseUser) => Promise<RaMangaUser>;
  updateProfile: (data: Partial<RaMangaUser>) => Promise<void>;
  applyAsCreator: (data: CreatorApplicationData) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

async function callSync(fbUser: FirebaseUser): Promise<RaMangaUser> {
  const token = await fbUser.getIdToken();
  const res = await fetch(`${API}/auth/sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sync failed");
  return res.json();
}

function isPasswordProvider(fbUser: FirebaseUser) {
  return fbUser.providerData.some((p) => p.providerId === "password");
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser]                 = useState<RaMangaUser | null>(null);
  const [loading, setLoading]           = useState(true);
  const [dialogOpen, setDialogOpen]     = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      /* Block unverified email/password accounts from persisting sessions */
      if (fbUser && isPasswordProvider(fbUser) && !fbUser.emailVerified) {
        await firebaseSignOut(auth);
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const synced = await callSync(fbUser);
          setUser(synced);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const syncUser = useCallback(async (fbUser: FirebaseUser) => {
    const synced = await callSync(fbUser);
    setUser(synced);
    return synced;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result   = await signInWithPopup(auth, provider);
    return syncUser(result.user);
  }, [syncUser]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error(ERR_UNVERIFIED);
    }
    return syncUser(result.user);
  }, [syncUser]);

  /* Signs up, sends verification, signs OUT immediately — account is not active until verified */
  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<never> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    await firebaseSignOut(auth);
    throw new Error(ERR_VERIFY_SENT);
  }, []);

  /* Re-sign-in briefly just to send the email, then sign out */
  const resendVerificationEmail = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user);
    }
    await firebaseSignOut(auth);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<RaMangaUser>) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`${API}/auth/profile`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Profile update failed");
    const updated = await res.json();
    setUser(updated);
  }, [firebaseUser]);

  const applyAsCreator = useCallback(async (data: CreatorApplicationData) => {
    if (!firebaseUser) throw new Error("Not authenticated");
    const token = await firebaseUser.getIdToken();
    const res = await fetch(`${API}/creators/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Application failed" }));
      throw new Error(err.message || "Application failed");
    }
    await syncUser(firebaseUser);
  }, [firebaseUser, syncUser]);

  return (
    <Ctx.Provider value={{
      user, firebaseUser, loading,
      dialogOpen,
      openDialog:  () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      resendVerificationEmail, sendPasswordReset,
      signOut, syncUser, updateProfile, applyAsCreator,
    }}>
      {children}
    </Ctx.Provider>
  );
}
