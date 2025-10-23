import {
  getDbInstance,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc
} from "./firebase.js";

const PROGRESS_LABELS = {
  math_mock_1: "Math Mock 1",
  english_mock_1: "English Mock 1",
  vr_mock_1: "VR Mock 1"
};

const progressRows = document.querySelector("[data-progress-rows]");
const progressMessage = document.querySelector("[data-progress-message]");

function setProgressMessage(message, type = "") {
  if (!progressMessage) return;
  progressMessage.textContent = message || "";
  progressMessage.classList.remove("is-error", "is-success");
  if (type) {
    progressMessage.classList.add(type === "error" ? "is-error" : "is-success");
  }
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
  if (!progressRows) return;
  if (!rows.length) {
    progressRows.innerHTML = `<tr><td colspan="3">No attempts yet. Complete a mock test to see your progress here.</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => {
    const aTime = a.attempted_on?.seconds || 0;
    const bTime = b.attempted_on?.seconds || 0;
    return bTime - aTime;
  });

  progressRows.innerHTML = sorted
    .map((entry) => {
      const label = PROGRESS_LABELS[entry.test_id] || entry.test_id;
      const score = typeof entry.score === "number" ? `${entry.score}%` : "—";
      const date = formatDate(entry.attempted_on);
      return `<tr><td>${label}</td><td>${score}</td><td>${date}</td></tr>`;
    })
    .join("");
}

async function seedProgress(userId) {
  const db = getDbInstance();
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

  const operations = sampleRecords.map(async (record) => {
    const docId = `${userId}_${record.test_id}`;
    await setDoc(doc(db, "user_progress", docId), {
      user_id: userId,
      test_id: record.test_id,
      score: record.score,
      attempted_on: record.attempted_on
    });
  });

  await Promise.all(operations);
  return sampleRecords;
}

export function clearProgressUI() {
  if (progressRows) {
    progressRows.innerHTML = `<tr><td colspan="3">Login to view your saved progress.</td></tr>`;
  }
  setProgressMessage("");
}

export async function loadProgressForUser(userId) {
  if (!userId) {
    clearProgressUI();
    return;
  }

  try {
    setProgressMessage("Loading progress…");
    const db = getDbInstance();
    const baseQuery = query(collection(db, "user_progress"), where("user_id", "==", userId));
    const snapshot = await getDocs(baseQuery);

    if (snapshot.empty) {
      await seedProgress(userId);
      return loadProgressForUser(userId);
    }

    const rows = snapshot.docs.map((docSnap) => docSnap.data());
    renderProgress(rows);
    setProgressMessage("Progress updated", "success");
  } catch (error) {
    setProgressMessage(error.message || "Unable to load progress", "error");
  }
}
