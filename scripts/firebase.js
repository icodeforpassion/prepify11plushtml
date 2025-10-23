import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
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

const firebaseConfig = {
  apiKey: "AIzaSyD88NJ5MhwqXAQqd-9z748dH0ZoFWBMvUM",
  authDomain: "modernairlineretailing-e2dbc.firebaseapp.com",
  projectId: "modernairlineretailing-e2dbc",
  storageBucket: "modernairlineretailing-e2dbc.firebasestorage.app",
  messagingSenderId: "758331886243",
  appId: "1:758331886243:web:7572b85439be4796ad8d16",
  measurementId: "G-RHHZ7MJ521"
};

let appInstance;
let authInstance;
let firestoreInstance;
const googleProvider = new GoogleAuthProvider();

export function initFirebase() {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
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
