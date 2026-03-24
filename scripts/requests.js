import {
  getDbInstance,
  Timestamp,
  collection,
  query,
  where,
  addDoc,
  getDocs
} from "./firebase.js";

let activeUserId = null;
let toastHandler = null;

const requestForm = document.getElementById("featureRequestForm");
const requestTextarea = document.getElementById("requestText");
const requestButton = document.getElementById("submitRequest");
const requestMessage = document.getElementById("requestFeedback");
const requestRows = document.getElementById("requestRows");

function setRequestMessage(message, type = "") {
  if (!requestMessage) return;
  requestMessage.textContent = message || "";
  requestMessage.classList.remove("is-error", "is-success");
  if (type) {
    requestMessage.classList.add(type === "error" ? "is-error" : "is-success");
  }
}

function renderRequestRows(rows) {
  if (!requestRows) return;
  if (!rows.length) {
    requestRows.innerHTML = `<tr><td colspan="3">No feature requests yet. Share an idea to see it here!</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => {
    const aTime = a.date_submitted?.seconds || 0;
    const bTime = b.date_submitted?.seconds || 0;
    return bTime - aTime;
  });

  requestRows.innerHTML = sorted
    .map((entry) => {
      const requestText = entry.request_text || "—";
      const status = entry.status || "New";
      const response = entry.response || "Pending review";
      return `<tr><td>${requestText}</td><td>${status}</td><td>${response}</td></tr>`;
    })
    .join("");
}

export function clearRequestUI() {
  if (requestRows) {
    requestRows.innerHTML = `<tr><td colspan="3">Feature requests will appear here once submitted.</td></tr>`;
  }
  setRequestMessage("");
}

async function fetchRequests(userId) {
  const db = getDbInstance();
  const baseQuery = query(collection(db, "feature_requests"), where("user_id", "==", userId));
  const snapshot = await getDocs(baseQuery);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

async function saveRequest(userId, text) {
  const db = getDbInstance();
  const cleaned = text.trim();
  if (!cleaned) {
    throw new Error("Please share a feature idea before submitting.");
  }

  await addDoc(collection(db, "feature_requests"), {
    user_id: userId,
    request_text: cleaned,
    date_submitted: Timestamp.now(),
    status: "New",
    action_taken: "",
    response: ""
  });
}

async function refreshRequests() {
  if (!activeUserId) {
    clearRequestUI();
    return;
  }

  try {
    setRequestMessage("Loading your feature ideas…");
    const rows = await fetchRequests(activeUserId);
    renderRequestRows(rows);
    setRequestMessage("Requests updated", "success");
  } catch (error) {
    setRequestMessage(error.message || "Unable to load feature requests", "error");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!activeUserId) {
    setRequestMessage("Please log in to share a request.", "error");
    return;
  }
  if (!requestTextarea) return;
  const text = requestTextarea.value || "";

  try {
    setRequestMessage("Saving your idea…");
    await saveRequest(activeUserId, text);
    requestForm?.reset();
    setRequestMessage("Request submitted!", "success");
    if (typeof toastHandler === "function") {
      toastHandler("Feature request submitted", "success");
    }
    await refreshRequests();
  } catch (error) {
    setRequestMessage(error.message || "Unable to submit request", "error");
    if (typeof toastHandler === "function") {
      toastHandler(error.message || "Unable to submit request", "error");
    }
  }
}

export function setRequestUser(user) {
  activeUserId = user?.uid || null;
  if (!activeUserId) {
    clearRequestUI();
    return;
  }
  refreshRequests();
}

export function initRequestModule({ showToast } = {}) {
  toastHandler = showToast || null;
  if (requestForm) {
    requestForm.addEventListener("submit", handleSubmit);
  }
  if (requestButton) {
    requestButton.disabled = false;
  }
  clearRequestUI();
}
