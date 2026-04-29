import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
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

const firebaseConfig = {
  apiKey: "AIzaSyCfrAl1QmQgJFDDA_sNfW5lIDZ2nNWu58A",
  authDomain: "prepify11plus-d7cca.firebaseapp.com",
  projectId: "prepify11plus-d7cca",
  storageBucket: "prepify11plus-d7cca.firebasestorage.app",
  messagingSenderId: "974439166848",
  appId: "1:974439166848:web:1036f627b432d87271c765",
  measurementId: "G-7MCRTLTXHS"
};

let appInstance;
let authInstance;
let firestoreInstance;
const googleProvider = new GoogleAuthProvider();

export function initFirebase() {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
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
