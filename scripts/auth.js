import {
  initFirebase,
  getAuthInstance,
  getDbInstance,
  googleProvider,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { loadProgressForUser, clearProgressUI } from "./progress.js";
import { initRequestModule, setRequestUser, clearRequestUI } from "./requests.js";

const firebaseState = initFirebase();

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
  logoutButton: document.querySelector("[data-logout]")
};

let toastContainer;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("role", "status");
    toastContainer.setAttribute("aria-live", "polite");
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message, type = "info") {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("is-visible");
  }, 10);
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3600);
}

function setStatusMessage(element, message, type = "") {
  if (!element) return;
  element.textContent = message || "";
  element.classList.remove("is-error", "is-success");
  if (type) {
    element.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function toFriendlyAuthMessage(error, fallback = "Something went wrong.") {
  const currentHost = window.location.hostname || "this domain";
  const code = error?.code || "";
  const friendlyMap = {
    "auth/email-already-in-use":
      "This email already has an account. Please log in or use Continue with Google.",
    "auth/invalid-credential":
      "That email/password combination did not match. Please try again.",
    "auth/wrong-password":
      "Incorrect password. Please try again.",
    "auth/user-not-found":
      "No account found with that email. Try signing up first.",
    "auth/popup-closed-by-user":
      "Google sign-in was closed before completion. Please try again.",

    "auth/popup-blocked":
      "Your browser blocked the Google pop-up. We'll switch to secure redirect sign-in instead.",
    "auth/unauthorized-domain":
      `Google sign-in is not enabled for ${currentHost} yet. Please ask prepify11plus@gmail.com to add this domain in Firebase Authentication → Settings → Authorized domains.`
  };

  return friendlyMap[code] || error?.message || fallback;
}

function toggleInterface(user) {
  if (!ui.authPanel || !ui.dashboard) return;
  if (user) {
    ui.authPanel.setAttribute("hidden", "");
    ui.dashboard.removeAttribute("hidden");
    ui.dashboard.classList.add("is-visible");
    ui.dashboard.removeAttribute("aria-hidden");
  } else {
    ui.authPanel.removeAttribute("hidden");
    ui.dashboard.setAttribute("hidden", "");
    ui.dashboard.classList.remove("is-visible");
    ui.dashboard.setAttribute("aria-hidden", "true");
  }
}

function clearDashboard() {
  clearProgressUI();
  clearRequestUI();
  setStatusMessage(ui.authMessage, "");
}

async function ensureUserDocument(user, providedName = "") {
  if (!user) return;
  const db = getDbInstance();
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

async function signup({ name, email, password }) {
  const auth = getAuthInstance();
  const creds = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(creds.user, { displayName: name });
  }
  await ensureUserDocument(creds.user, name);
  showToast("Account created!", "success");
  return creds.user;
}

async function login({ email, password }) {
  const auth = getAuthInstance();
  const creds = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(creds.user);
  showToast("Logged in successfully", "success");
  return creds.user;
}

async function logout() {
  const auth = getAuthInstance();
  await signOut(auth);
  showToast("You have been logged out", "info");
}

function handleAuthButtons() {
  if (!ui.authForm || !ui.authButtons.length) return;
  ui.authForm.addEventListener("submit", (event) => event.preventDefault());
  ui.authButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.authAction;
      const email = ui.authEmail?.value.trim();
      const password = ui.authPassword?.value || "";
      const name = ui.authName?.value.trim();

      if (!email || !password) {
        setStatusMessage(ui.authMessage, "Please enter an email and password.", "error");
        return;
      }

      try {
        setStatusMessage(ui.authMessage, "Hold tight…");
        if (action === "signup") {
          await signup({ name, email, password });
          setStatusMessage(ui.authMessage, "Account created! You're logged in.", "success");
        } else {
          await login({ email, password });
          setStatusMessage(ui.authMessage, "Logged in successfully.", "success");
        }
        ui.authForm.reset();
      } catch (error) {
        const message = toFriendlyAuthMessage(error);
        setStatusMessage(ui.authMessage, message, "error");
        showToast(message, "error");
      }
    });
  });
}

async function completeRedirectSignin() {
  try {
    const auth = getAuthInstance();
    const result = await getRedirectResult(auth);
    if (!result?.user) return;
    await ensureUserDocument(result.user);
    setStatusMessage(ui.authMessage, "Signed in with Google successfully.", "success");
    showToast("Signed in with Google successfully.", "success");
    ui.authForm?.reset();
  } catch (error) {
    const message = toFriendlyAuthMessage(error, "Google sign-in failed after redirect.");
    setStatusMessage(ui.authMessage, message, "error");
    showToast(message, "error");
  }
}

function handleGoogleSignin() {
  if (!ui.googleButton) return;

  ui.googleButton.addEventListener("click", async () => {
    try {
      setStatusMessage(ui.authMessage, "Opening Google sign-in…");
      const auth = getAuthInstance();
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(result.user);
      setStatusMessage(ui.authMessage, "Welcome back!", "success");
      showToast("Welcome back!", "success");
      ui.authForm?.reset();
    } catch (error) {

      if (error?.code === "auth/popup-blocked") {
        const auth = getAuthInstance();
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const message = toFriendlyAuthMessage(error, "Google sign-in failed.");
      setStatusMessage(ui.authMessage, message, "error");
      showToast(message, "error");
    }
  });
}

function handleLogout() {
  if (!ui.logoutButton) return;
  ui.logoutButton.addEventListener("click", async () => {
    try {
      await logout();
    } catch (error) {
      const message = toFriendlyAuthMessage(error, "Unable to logout.");
      setStatusMessage(ui.authMessage, message, "error");
      showToast(message, "error");
    }
  });
}

function friendlyName(user) {
  if (!user) return "Explorer";
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Explorer";
}

function watchAuthState() {
  const auth = getAuthInstance();
  if (!auth) return;
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      toggleInterface(user);
      const name = friendlyName(user);
      await ensureUserDocument(user, name);
      await loadProgressForUser(user.uid);
      setRequestUser(user);
    } else {
      toggleInterface(null);
      clearDashboard();
      setRequestUser(null);
    }
  });
}

function bootstrap() {
  if (!firebaseState.auth || !firebaseState.db) {
    console.warn("[Prepify11Plus] Auth module disabled because Firebase config is missing.");
    return;
  }
  clearDashboard();
  initRequestModule({ showToast });
  completeRedirectSignin();
  handleAuthButtons();
  handleGoogleSignin();
  handleLogout();
  watchAuthState();
}

bootstrap();
