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
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { loadProgressForUser, clearProgressUI } from "./progress.js";
import { initRequestModule, setRequestUser, clearRequestUI } from "./requests.js";

initFirebase();

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
  userName: document.querySelector("[data-user-name]")
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
        setStatusMessage(ui.authMessage, error.message, "error");
        showToast(error.message || "Something went wrong", "error");
      }
    });
  });
}

function handleGoogleSignin() {
  if (!ui.googleButton) return;
  ui.googleButton.addEventListener("click", async () => {
    try {
      setStatusMessage(ui.authMessage, "Opening Google sign-in…");
      const auth = getAuthInstance();
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(result.user);
      setStatusMessage(ui.authMessage, "Welcome back!", "success");
      showToast("Welcome back!", "success");
      ui.authForm?.reset();
    } catch (error) {
      setStatusMessage(ui.authMessage, error.message, "error");
      showToast(error.message || "Google sign-in failed", "error");
    }
  });
}

function handleLogout() {
  if (!ui.logoutButton) return;
  ui.logoutButton.addEventListener("click", async () => {
    try {
      await logout();
    } catch (error) {
      setStatusMessage(ui.authMessage, error.message, "error");
      showToast(error.message || "Unable to logout", "error");
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
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      toggleInterface(user);
      const name = friendlyName(user);
      if (ui.userName) {
        ui.userName.textContent = name;
      }
      await ensureUserDocument(user, name);
      await loadProgressForUser(user.uid);
      setRequestUser(user);
    } else {
      toggleInterface(null);
      if (ui.userName) {
        ui.userName.textContent = "Explorer";
      }
      clearDashboard();
      setRequestUser(null);
    }
  });
}

function bootstrap() {
  clearDashboard();
  initRequestModule({ showToast });
  handleAuthButtons();
  handleGoogleSignin();
  handleLogout();
  watchAuthState();
}

bootstrap();
