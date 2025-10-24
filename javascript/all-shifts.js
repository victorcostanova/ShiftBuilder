// All shifts page functionality

// Fixed admin account credentials (must match auth.js)
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

let currentUsername = null;
let allShifts = [];

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

  // Load all shifts
  loadAllShifts();

  // Set up search functionality
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  searchBtn.addEventListener("click", filterShifts);
  clearBtn.addEventListener("click", clearFilters);

  // Allow Enter key to trigger search
  const searchInputs = document.querySelectorAll(
    "#searchWorker, #searchWorkplace, #dateFrom, #dateTo"
  );
  searchInputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filterShifts();
      }
    });
  });
});

function loadAllShifts() {
  allShifts = getAllShiftsForAllWorkers();
  displayShifts(allShifts);
  updateStatistics(allShifts);
}

function getAllShiftsForAllWorkers() {
  const shifts = [];
  const users = JSON.parse(localStorage.getItem("users")) || {};

  for (const [username, userData] of Object.entries(users)) {
    // Skip fixed admin account
    if (username === ADMIN_CREDENTIALS.username) continue;

    const userShifts = getUserShifts(username);
    userShifts.forEach((shift) => {
      shifts.push({
        ...shift,
        username: username,
        workerName: `${userData.firstName} ${userData.lastName}`,
      });
    });
  }

  return shifts;
}

function displayShifts(shifts) {
  const tbody = document.getElementById("shiftsTableBody");

  if (shifts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="no-data">No shifts found</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  // Sort shifts by date (newest first)
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sortedShifts.forEach((shift) => {
    const row = document.createElement("tr");
    const profit = calculateProfit(
      shift.startTime,
      shift.endTime,
      shift.hourlyWage
    );

    row.innerHTML = `
            <td>${shift.workerName}</td>
            <td>${formatDate(shift.date)}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td>${formatCurrency(shift.hourlyWage)}</td>
            <td>${shift.workplace}</td>
            <td>${formatCurrency(profit)}</td>
        `;

    // Admin users cannot click on rows to edit shifts
    // Only regular users can edit their own shifts
    // row.style.cursor = "pointer";
    // row.addEventListener("click", function () {
    //   window.location.href = `add-shift.html?slug=${encodeURIComponent(
    //     shift.slug
    //   )}&user=${encodeURIComponent(shift.username)}`;
    // });

    tbody.appendChild(row);
  });
}

function filterShifts() {
  const searchWorker = document
    .getElementById("searchWorker")
    .value.toLowerCase()
    .trim();
  const searchWorkplace = document
    .getElementById("searchWorkplace")
    .value.toLowerCase()
    .trim();
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  let filteredShifts = [...allShifts];

  // Filter by worker name
  if (searchWorker) {
    filteredShifts = filteredShifts.filter((shift) =>
      shift.workerName.toLowerCase().includes(searchWorker)
    );
  }

  // Filter by workplace
  if (searchWorkplace) {
    filteredShifts = filteredShifts.filter((shift) =>
      shift.workplace.toLowerCase().includes(searchWorkplace)
    );
  }

  // Filter by date range
  if (dateFrom) {
    filteredShifts = filteredShifts.filter(
      (shift) => new Date(shift.date) >= new Date(dateFrom)
    );
  }

  if (dateTo) {
    filteredShifts = filteredShifts.filter(
      (shift) => new Date(shift.date) <= new Date(dateTo)
    );
  }

  displayShifts(filteredShifts);
  updateStatistics(filteredShifts);
}

function clearFilters() {
  document.getElementById("searchWorker").value = "";
  document.getElementById("searchWorkplace").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  displayShifts(allShifts);
  updateStatistics(allShifts);
}

function updateStatistics(shifts) {
  const totalShifts = shifts.length;
  let totalEarnings = 0;

  shifts.forEach((shift) => {
    const profit = parseFloat(
      calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage)
    );
    totalEarnings += profit;
  });

  document.getElementById("totalShifts").textContent = totalShifts;
  document.getElementById("totalEarnings").textContent =
    formatCurrency(totalEarnings);
}
