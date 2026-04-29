import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import * as firestore from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const {
  getFirestore,
  Timestamp,
  serverTimestamp,
  collection,
  query,
  where,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc
} = firestore;

const nativeGetDoc = firestore.getDoc;

async function getDocumentSnapshot(documentRef) {
  if (typeof nativeGetDoc === "function") {
    return nativeGetDoc(documentRef);
  }

  console.warn(
    "Firestore getDoc() is unavailable in this build; falling back to a query-based lookup."
  );

  const fallbackQuery = query(documentRef.parent, where("__name__", "==", documentRef.id));
  const querySnapshot = await getDocs(fallbackQuery);
  const docSnapshot = querySnapshot.docs[0];

  return {
    exists: () => Boolean(docSnapshot),
    data: () => docSnapshot?.data(),
    id: documentRef.id,
    ref: documentRef
  };
}

function getPublicConfig() {
  return window.__PREPIFY_PUBLIC_CONFIG__ || window;
}

function resolveFirebaseConfig() {
  const source = getPublicConfig();
  const config = {
    apiKey: source.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: source.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: source.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: source.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: source.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: source.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: source.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
  const missing = requiredKeys.filter((key) => !config[key]);
  if (missing.length) {
    if (!window.__prepifyFirebaseConfigWarned) {
      window.__prepifyFirebaseConfigWarned = true;
      console.warn(`[Prepify11Plus] Firebase config missing: ${missing.join(", ")}. Add scripts/firebase-config.js or env-injected NEXT_PUBLIC_FIREBASE_* values.`);
    }
    return null;
  }

  return config;
}

let appInstance;
let authInstance;
let firestoreInstance;
const googleProvider = new GoogleAuthProvider();

export function initFirebase() {
  if (!appInstance) {
    const firebaseConfig = resolveFirebaseConfig();
    if (!firebaseConfig) {
      return { app: null, auth: null, db: null };
    }

    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    setPersistence(authInstance, browserLocalPersistence).catch(() => {});
    firestoreInstance = getFirestore(appInstance);
  }
  return {
    app: appInstance,
    auth: authInstance,
    db: firestoreInstance
  };
}

export function getAuthInstance() {
  if (!authInstance) {
    initFirebase();
  }
  return authInstance;
}

export function getDbInstance() {
  if (!firestoreInstance) {
    initFirebase();
  }
  return firestoreInstance;
}

export {
  googleProvider,
  Timestamp,
  serverTimestamp,
  collection,
  query,
  where,
  addDoc,
  getDocs,
  getDocumentSnapshot as getDoc,
  setDoc,
  doc
};
