import { GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { auth } from "./firebase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Shared Google sign-in flow used by both login and register pages
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result: UserCredential = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;

  // Get Firebase ID token
  const idToken = await firebaseUser.getIdToken();

  // Sync to PostgreSQL (creates user if new, returns existing if returning)
  const res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to sync user with server");
  }
}
