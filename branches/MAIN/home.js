// Home page functionality

let currentUsername = null;
let allShifts = [];

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  currentUsername = checkAuth();
  if (!currentUsername) {
    return;
  }

  // Load and display shifts
  loadShifts();

  // Set up search functionality
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");

  searchBtn.addEventListener("click", filterShifts);
  clearBtn.addEventListener("click", clearFilters);

  // Allow Enter key to trigger search
  const searchInputs = document.querySelectorAll(
    "#searchShift, #dateFrom, #dateTo"
  );
  searchInputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        filterShifts();
      }
    });
  });
});

function loadShifts() {
  allShifts = getUserShifts(currentUsername);
  displayShifts(allShifts);
  calculateStatistics(allShifts);
}

function displayShifts(shifts) {
  const tbody = document.getElementById("shiftsTableBody");

  if (shifts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="no-data">No shifts found. Click "+ Add Shift" to get started!</td></tr>';
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
            <td>${formatDate(shift.date)}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td>${formatCurrency(shift.hourlyWage)}</td>
            <td>${shift.workplace}</td>
            <td>${formatCurrency(profit)}</td>
            <td class="action-buttons">
                <button class="btn btn-primary" onclick="editShift('${
                  shift.slug
                }')">Edit</button>
                <button class="btn btn-danger" onclick="deleteShift('${
                  shift.slug
                }')">Delete</button>
            </td>
        `;

    tbody.appendChild(row);
  });
}

function filterShifts() {
  const searchShift = document
    .getElementById("searchShift")
    .value.toLowerCase()
    .trim();
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  let filteredShifts = [...allShifts];

  // Filter by shift name
  if (searchShift) {
    filteredShifts = filteredShifts.filter(
      (shift) =>
        shift.slug.toLowerCase().includes(searchShift) ||
        shift.workplace.toLowerCase().includes(searchShift) ||
        (shift.comments && shift.comments.toLowerCase().includes(searchShift))
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
}

function clearFilters() {
  document.getElementById("searchShift").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  displayShifts(allShifts);
}

function calculateStatistics(shifts) {
  if (shifts.length === 0) {
    document.getElementById("highestMonth").textContent = "No data available";
    document.getElementById("highestAmount").textContent = formatCurrency(0);
    return;
  }

  // Group shifts by month and calculate total earnings
  const monthlyEarnings = {};

  shifts.forEach((shift) => {
    const date = new Date(shift.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    const profit = parseFloat(
      calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage)
    );

    if (!monthlyEarnings[monthKey]) {
      monthlyEarnings[monthKey] = {
        name: monthName,
        total: 0,
      };
    }

    monthlyEarnings[monthKey].total += profit;
  });

  // Find the month with highest earnings
  let highestMonth = null;
  let highestAmount = 0;

  for (const [key, data] of Object.entries(monthlyEarnings)) {
    if (data.total > highestAmount) {
      highestAmount = data.total;
      highestMonth = data.name;
    }
  }

  document.getElementById("highestMonth").textContent = highestMonth;
  document.getElementById("highestAmount").textContent =
    formatCurrency(highestAmount);
}

function editShift(slug) {
  window.location.href = `add-shift.html?slug=${encodeURIComponent(slug)}`;
}

function deleteShift(slug) {
  if (!confirm("Are you sure you want to delete this shift?")) {
    return;
  }

  const shifts = getUserShifts(currentUsername);
  const updatedShifts = shifts.filter((shift) => shift.slug !== slug);
  saveUserShifts(currentUsername, updatedShifts);

  loadShifts();
  alert("Shift deleted successfully!");
}
