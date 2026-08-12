import { initializeApp, getApps } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

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

// Use localStorage-based persistence instead of the default IndexedDB.
// IndexedDB can throw "Database is closing/hidden" when the browser tab is
// hidden or during popup sign-in flows.
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Silently ignore if persistence can't be set (e.g. SSR context)
});

export default app;

