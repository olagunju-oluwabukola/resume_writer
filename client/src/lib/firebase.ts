import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";

// ── Firebase Configuration ──
const firebaseConfig = {
  apiKey: "AIzaSyB_szOjQVy055osH0j05Uc3LfzFRPM1N9A",
  authDomain: "resumerx-6c214.firebaseapp.com",
  projectId: "resumerx-6c214",
  storageBucket: "resumerx-6c214.firebasestorage.app",
  messagingSenderId: "703789472406",
  appId: "1:703789472406:web:38870b35c26f27f72b00b7",
  measurementId: "G-RQ6XDSHGME"
};

// Log config (without sensitive data)
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey?.slice(0, 5) + "...",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

// Initialize Firebase (prevent duplicate initialization)
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

export const auth = getAuth(app);
console.log("Auth initialized");

export type { User };

// ── Auth Functions ──
export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<User> {
  try {
    console.log("Attempting to create user with email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created successfully");

    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: fullName });
      console.log("Profile updated with name:", fullName);
    }

    return userCredential.user;
  } catch (error: any) {
    console.error("Registration error in firebase.ts:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}