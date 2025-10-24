// All workers page functionality

// Fixed admin account credentials (must match auth.js)
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

let currentUsername = null;
let allWorkers = [];

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication and admin status
  currentUsername = checkAuth();
  if (!currentUsername) {
    return;
  }

  // Verify user is admin (hardcoded or localStorage)
  const userData = getUserData(currentUsername);
  const isHardcodedAdmin = currentUsername === ADMIN_CREDENTIALS.username;
  const isLocalStorageAdmin = userData && userData.isAdmin;

  if (!isHardcodedAdmin && !isLocalStorageAdmin) {
    alert("Access denied. This page is for administrators only.");
    window.location.href = "worker-home.html";
    return;
  }

  // Load all workers
  loadAllWorkers();

  // Set up search functionality
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  searchBtn.addEventListener("click", filterWorkers);
  clearBtn.addEventListener("click", clearFilters);

  // Allow Enter key to trigger search
  const searchInputs = document.querySelectorAll("#searchWorker, #searchEmail");
  searchInputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filterWorkers();
      }
    });
  });
});

function loadAllWorkers() {
  allWorkers = getAllWorkers();
  displayWorkers(allWorkers);
  updateStatistics(allWorkers);
}

function getAllWorkers() {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const workers = [];

  for (const [username, userData] of Object.entries(users)) {
    // Skip fixed admin account
    if (username === ADMIN_CREDENTIALS.username) continue;

    // Calculate age
    const age = calculateAge(userData.birthDate);

    workers.push({
      username: username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
      age: age,
      registeredAt: userData.registeredAt,
      fullName: `${userData.firstName} ${userData.lastName}`,
    });
  }

  return workers;
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function displayWorkers(workers) {
  const tbody = document.getElementById("workersTableBody");

  if (workers.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="no-data">No workers found</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  // Sort workers by registration date (newest first)
  const sortedWorkers = [...workers].sort(
    (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
  );

  sortedWorkers.forEach((worker) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${worker.firstName}</td>
            <td>${worker.lastName}</td>
            <td>${worker.email}</td>
            <td>${worker.username}</td>
            <td>${formatDate(worker.birthDate)}</td>
            <td>${worker.age} years</td>
            <td>${formatDate(worker.registeredAt)}</td>
            <td>
                <button class="btn btn-primary" onclick="editWorker('${
                  worker.username
                }')">
                    Edit Profile
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });
}

function editWorker(username) {
  // Navigate to edit profile page with worker username
  window.location.href = `edit-worker-profile.html?username=${encodeURIComponent(
    username
  )}`;
}

function filterWorkers() {
  const searchWorker = document
    .getElementById("searchWorker")
    .value.toLowerCase()
    .trim();
  const searchEmail = document
    .getElementById("searchEmail")
    .value.toLowerCase()
    .trim();

  let filteredWorkers = [...allWorkers];

  // Filter by worker name
  if (searchWorker) {
    filteredWorkers = filteredWorkers.filter(
      (worker) =>
        worker.firstName.toLowerCase().includes(searchWorker) ||
        worker.lastName.toLowerCase().includes(searchWorker) ||
        worker.fullName.toLowerCase().includes(searchWorker)
    );
  }

  // Filter by email
  if (searchEmail) {
    filteredWorkers = filteredWorkers.filter((worker) =>
      worker.email.toLowerCase().includes(searchEmail)
    );
  }

  displayWorkers(filteredWorkers);
  updateStatistics(filteredWorkers);
}

function clearFilters() {
  document.getElementById("searchWorker").value = "";
  document.getElementById("searchEmail").value = "";
  displayWorkers(allWorkers);
  updateStatistics(allWorkers);
}

function updateStatistics(workers) {
  const totalWorkers = workers.length;
  let totalAge = 0;

  workers.forEach((worker) => {
    totalAge += worker.age;
  });

  const averageAge = totalWorkers > 0 ? Math.round(totalAge / totalWorkers) : 0;

  document.getElementById("totalWorkers").textContent = totalWorkers;
  document.getElementById("averageAge").textContent = `${averageAge} years`;
}
