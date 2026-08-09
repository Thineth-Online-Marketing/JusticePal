import { GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { auth } from "./firebase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://justicepal-production.up.railway.app";

// Shared Google sign-in flow used by both login and register pages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signInWithGoogle(role?: string): Promise<any> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result: UserCredential = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;

  // Get Firebase ID token
  const idToken = await firebaseUser.getIdToken();

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        role: role || "client",
      }),
    });
  } catch (err: unknown) {
    throw new Error(`Cannot reach backend server at ${BACKEND_URL}. Please verify NEXT_PUBLIC_BACKEND_URL in Cloudflare settings.`);
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      const data = await res.json();
      throw new Error(data.message || "Failed to sync user with server");
    } else {
      throw new Error(`Backend error (${res.status}). Please verify NEXT_PUBLIC_BACKEND_URL and Railway backend status.`);
    }
  }
  
  if (!isJson) {
    throw new Error(`Server returned non-JSON response. Please check NEXT_PUBLIC_BACKEND_URL variable.`);
  }

  const userData = await res.json();
  return userData;
}
