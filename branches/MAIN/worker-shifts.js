// Worker shifts page functionality

// Fixed admin account credentials (must match auth.js)
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

let currentUsername = null;
let targetWorkerUsername = null;
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
    window.location.href = "home.html";
    return;
  }

  // Get worker username from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  targetWorkerUsername = urlParams.get("username");

  if (!targetWorkerUsername) {
    alert("No worker specified. Redirecting to all workers page.");
    window.location.href = "all-workers.html";
    return;
  }

  // Load worker data and shifts
  loadWorkerShifts();

  // Set up search functionality
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  searchBtn.addEventListener("click", filterShifts);
  clearBtn.addEventListener("click", clearFilters);

  // Allow Enter key to trigger search
  const searchInputs = document.querySelectorAll(
    "#searchWorkplace, #dateFrom, #dateTo"
  );
  searchInputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filterShifts();
      }
    });
  });
});

function loadWorkerShifts() {
  // Get worker data
  const workerData = getUserData(targetWorkerUsername);

  if (!workerData) {
    alert("Worker not found. Redirecting to all workers page.");
    window.location.href = "all-workers.html";
    return;
  }

  // Update page title
  document.getElementById(
    "pageTitle"
  ).textContent = `${workerData.firstName} ${workerData.lastName} - Shifts`;

  // Get worker shifts
  allShifts = getUserShifts(targetWorkerUsername);

  // Add worker name to each shift
  allShifts = allShifts.map((shift) => ({
    ...shift,
    workerName: `${workerData.firstName} ${workerData.lastName}`,
  }));

  displayShifts(allShifts);
  updateStatistics(allShifts);
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

    tbody.appendChild(row);
  });
}

function filterShifts() {
  const searchWorkplace = document
    .getElementById("searchWorkplace")
    .value.toLowerCase()
    .trim();
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  let filteredShifts = [...allShifts];

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

  const averagePerShift = totalShifts > 0 ? totalEarnings / totalShifts : 0;

  document.getElementById("totalShifts").textContent = totalShifts;
  document.getElementById("totalEarnings").textContent =
    formatCurrency(totalEarnings);
  document.getElementById("averagePerShift").textContent =
    formatCurrency(averagePerShift);
}
