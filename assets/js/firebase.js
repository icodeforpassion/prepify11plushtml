import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD88NJ5MhwqXAQqd-9z748dH0ZoFWBMvUM",
  authDomain: "modernairlineretailing-e2dbc.firebaseapp.com",
  projectId: "modernairlineretailing-e2dbc",
  storageBucket: "modernairlineretailing-e2dbc.firebasestorage.app",
  messagingSenderId: "758331886243",
  appId: "1:758331886243:web:7572b85439be4796ad8d16",
  measurementId: "G-RHHZ7MJ521"
};

let firebaseApp;
let auth;
let db;
let currentUser = null;
let featureUnsubscribe = null;

const PROGRESS_LABELS = {
  math_mock_1: "Math Mock 1",
  english_mock_1: "English Mock 1",
  vr_mock_1: "VR Mock 1"
};

const ui = {
  authPanel: document.querySelector("[data-auth-panel]"),
  dashboard: document.querySelector("[data-dashboard]"),
  authForm: document.querySelector("[data-auth-form]"),
  authButtons: document.querySelectorAll("[data-auth-action]"),
  authName: document.querySelector("[data-auth-name]"),
  authEmail: document.querySelector("[data-auth-email]"),
  authPassword: document.querySelector("[data-auth-password]"),
  authMessage: document.querySelector("[data-auth-message]"),
  googleButton: document.querySelector("[data-google-signin]"),
  logoutButton: document.querySelector("[data-logout]"),
  userName: document.querySelector("[data-user-name]"),
  progressRows: document.querySelector("[data-progress-rows]"),
  progressMessage: document.querySelector("[data-progress-message]"),
  featureForm: document.querySelector("[data-feature-form]"),
  featureText: document.querySelector("[data-feature-text]"),
  featureMessage: document.querySelector("[data-feature-message]"),
  featureRows: document.querySelector("[data-feature-rows]")
};

export function initFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, db };
}

function setStatusMessage(element, message, type = "") {
  if (!element) return;
  element.textContent = message || "";
  element.classList.remove("is-error", "is-success");
  if (type) {
    element.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function toggleInterface(user) {
  if (!ui.authPanel || !ui.dashboard) return;
  if (user) {
    ui.authPanel.setAttribute("hidden", "");
    ui.dashboard.removeAttribute("hidden");
  } else {
    ui.authPanel.removeAttribute("hidden");
    ui.dashboard.setAttribute("hidden", "");
  }
}

function clearDashboard() {
  if (ui.progressRows) {
    ui.progressRows.innerHTML = `<tr><td colspan="3">Login to view your saved progress.</td></tr>`;
  }
  if (ui.featureRows) {
    ui.featureRows.innerHTML = `<tr><td colspan="4">Feature requests will appear here once submitted.</td></tr>`;
  }
  setStatusMessage(ui.progressMessage, "");
  setStatusMessage(ui.featureMessage, "");
}

async function ensureUserDocument(user, providedName = "") {
  if (!db || !user) return;
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const nameToSave = providedName || user.displayName || "";
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      name: nameToSave,
      email: user.email || "",
      joined_on: serverTimestamp()
    });
  } else if (providedName && snapshot.data().name !== providedName) {
    await setDoc(
      userRef,
      {
        name: providedName
      },
      { merge: true }
    );
  }
}

export async function signupUser({ name, email, password }) {
  const creds = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(creds.user, { displayName: name });
  }
  await ensureUserDocument(creds.user, name);
  return creds.user;
}

export async function loginUser({ email, password }) {
  const creds = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(creds.user);
  return creds.user;
}

export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}

async function seedProgress(userId) {
  const sampleRecords = [
    {
      test_id: "math_mock_1",
      score: 82,
      attempted_on: Timestamp.now()
    },
    {
      test_id: "english_mock_1",
      score: 76,
      attempted_on: Timestamp.now()
    },
    {
      test_id: "vr_mock_1",
      score: 88,
      attempted_on: Timestamp.now()
    }
  ];

  const operations = sampleRecords.map((record) => {
    const docId = `${userId}_${record.test_id}`;
    return setDoc(doc(db, "user_progress", docId), {
      user_id: userId,
      test_id: record.test_id,
      score: record.score,
      attempted_on: record.attempted_on
    });
  });

  await Promise.all(operations);
  return sampleRecords;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  } catch (error) {
    return "—";
  }
}

function renderProgress(rows) {
  if (!ui.progressRows) return;
  if (!rows.length) {
    ui.progressRows.innerHTML = `<tr><td colspan="3">No attempts yet. Complete a mock test to see your progress here.</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => {
    const aTime = a.attempted_on?.seconds || 0;
    const bTime = b.attempted_on?.seconds || 0;
    return bTime - aTime;
  });

  ui.progressRows.innerHTML = sorted
    .map((entry) => {
      const label = PROGRESS_LABELS[entry.test_id] || entry.test_id;
      const score = typeof entry.score === "number" ? `${entry.score}%` : "—";
      const date = formatDate(entry.attempted_on);
      return `<tr><td>${label}</td><td>${score}</td><td>${date}</td></tr>`;
    })
    .join("");
}

export async function fetchProgress(userId) {
  if (!db) return;
  setStatusMessage(ui.progressMessage, "Loading progress…");
  const progressQuery = query(collection(db, "user_progress"), where("user_id", "==", userId));
  const snapshot = await getDocs(progressQuery);
  if (snapshot.empty) {
    await seedProgress(userId);
    return fetchProgress(userId);
  }
  const rows = snapshot.docs.map((docSnap) => docSnap.data());
  renderProgress(rows);
  setStatusMessage(ui.progressMessage, "Progress updated", "success");
}

function renderFeatureRequests(rows) {
  if (!ui.featureRows) return;
  if (!rows.length) {
    ui.featureRows.innerHTML = `<tr><td colspan="4">No feature requests yet. Share an idea to see it here!</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => {
    const aTime = a.date_submitted?.seconds || 0;
    const bTime = b.date_submitted?.seconds || 0;
    return bTime - aTime;
  });

  ui.featureRows.innerHTML = sorted
    .map((entry) => {
      const submitted = formatDate(entry.date_submitted);
      const status = entry.status || "New";
      const action = entry.action_taken || "—";
      const response = entry.response || "—";
      return `<tr>
        <td>${entry.request_text || "—"}<span>Submitted ${submitted}</span></td>
        <td>${status}</td>
        <td>${action}</td>
        <td>${response}</td>
      </tr>`;
    })
    .join("");
}

export function fetchFeatureRequests(userId) {
  if (!db) return () => {};
  if (featureUnsubscribe) {
    featureUnsubscribe();
  }
  const featureQuery = query(collection(db, "feature_requests"), where("user_id", "==", userId));
  featureUnsubscribe = onSnapshot(featureQuery, (snapshot) => {
    const rows = snapshot.docs.map((docSnap) => docSnap.data());
    renderFeatureRequests(rows);
  });
  return featureUnsubscribe;
}

export async function submitFeatureRequest(requestText) {
  if (!db || !currentUser) {
    throw new Error("You need to be logged in to submit a request.");
  }
  const text = requestText.trim();
  if (!text) {
    throw new Error("Please share a feature idea before submitting.");
  }
  await addDoc(collection(db, "feature_requests"), {
    user_id: currentUser.uid,
    request_text: text,
    date_submitted: Timestamp.now(),
    status: "New",
    action_taken: "",
    response: ""
  });
}

function resetAuthForm() {
  if (ui.authForm) {
    ui.authForm.reset();
  }
}

function handleAuthButtons() {
  if (!ui.authForm || !ui.authButtons.length) return;
  ui.authForm.addEventListener("submit", (event) => event.preventDefault());
  ui.authButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.authAction;
      const email = ui.authEmail?.value.trim();
      const password = ui.authPassword?.value;
      const name = ui.authName?.value.trim();
      if (!email || !password) {
        setStatusMessage(ui.authMessage, "Please enter an email and password.", "error");
        return;
      }
      try {
        setStatusMessage(ui.authMessage, "Hold tight…");
        if (action === "signup") {
          await signupUser({ name, email, password });
          setStatusMessage(ui.authMessage, "Account created! You're logged in.", "success");
        } else {
          await loginUser({ email, password });
          setStatusMessage(ui.authMessage, "Logged in successfully.", "success");
        }
        resetAuthForm();
      } catch (error) {
        setStatusMessage(ui.authMessage, error.message, "error");
      }
    });
  });
}

function handleGoogleSignin() {
  if (!ui.googleButton) return;
  ui.googleButton.addEventListener("click", async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      setStatusMessage(ui.authMessage, "Opening Google sign-in…");
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      setStatusMessage(ui.authMessage, "Welcome back!", "success");
      resetAuthForm();
    } catch (error) {
      setStatusMessage(ui.authMessage, error.message, "error");
    }
  });
}

function handleLogout() {
  if (!ui.logoutButton) return;
  ui.logoutButton.addEventListener("click", async () => {
    try {
      await logoutUser();
    } catch (error) {
      setStatusMessage(ui.authMessage, error.message, "error");
    }
  });
}

function handleFeatureForm() {
  if (!ui.featureForm) return;
  ui.featureForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      setStatusMessage(ui.featureMessage, "Saving your idea…");
      await submitFeatureRequest(ui.featureText?.value || "");
      setStatusMessage(ui.featureMessage, "Request submitted!", "success");
      if (ui.featureForm) {
        ui.featureForm.reset();
      }
    } catch (error) {
      setStatusMessage(ui.featureMessage, error.message, "error");
    }
  });
}

function watchAuthState() {
  if (!auth) return;
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      toggleInterface(user);
      const friendlyName = user.displayName || ui.authName?.value || (user.email ? user.email.split("@")[0] : "Explorer");
      if (ui.userName) {
        ui.userName.textContent = friendlyName;
      }
      await ensureUserDocument(user, friendlyName);
      fetchProgress(user.uid);
      fetchFeatureRequests(user.uid);
    } else {
      toggleInterface(null);
      if (featureUnsubscribe) {
        featureUnsubscribe();
        featureUnsubscribe = null;
      }
      clearDashboard();
    }
  });
}

(function bootstrap() {
  initFirebase();
  clearDashboard();
  handleAuthButtons();
  handleGoogleSignin();
  handleLogout();
  handleFeatureForm();
  watchAuthState();
})();
