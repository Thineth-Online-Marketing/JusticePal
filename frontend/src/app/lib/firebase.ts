import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfkc6dY-QML7rYsWeVQzXa9JF2XjQsrPg",
  authDomain: "justicepal-a8bb3.firebaseapp.com",
  projectId: "justicepal-a8bb3",
  storageBucket: "justicepal-a8bb3.firebasestorage.app",
  messagingSenderId: "887151068979",
  appId: "1:887151068979:web:149a6d20f1c58abd6b6046",
  measurementId: "G-SZNE5T5DKN",
};

// Prevent duplicate app initialization (important for Next.js hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
// Disable reCAPTCHA for test phone numbers and testing
auth.settings.appVerificationDisabledForTesting = true;
export default app;
