// Utility functions for localStorage and validation - Shift Module

// Check if user is logged in
function checkAuth() {
  const session = localStorage.getItem("userSession");
  if (!session) {
    window.location.href = "index.html";
    return null;
  }

  const sessionData = JSON.parse(session);
  const sessionTime = new Date(sessionData.timestamp);
  const currentTime = new Date();
  const diffInMinutes = (currentTime - sessionTime) / (1000 * 60);

  // Session expires after 60 minutes
  if (diffInMinutes > 60) {
    localStorage.removeItem("userSession");
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
    return null;
  }

  return sessionData.username;
}

// Set user session
function setUserSession(username) {
  const sessionData = {
    username: username,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem("userSession", JSON.stringify(sessionData));
}

// Clear user session
function clearUserSession() {
  localStorage.removeItem("userSession");
}

// Get all shifts for a user
function getUserShifts(username) {
  const shifts = JSON.parse(localStorage.getItem(`shifts_${username}`)) || [];
  return shifts;
}

// Save shifts for a user
function saveUserShifts(username, shifts) {
  localStorage.setItem(`shifts_${username}`, JSON.stringify(shifts));
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format time to HH:MM
function formatTime(time) {
  return time;
}

// Calculate hours between two times
function calculateHours(startTime, endTime) {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let hours = endHour - startHour;
  let minutes = endMin - startMin;

  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }

  return hours + minutes / 60;
}

// Calculate total profit
function calculateProfit(startTime, endTime, hourlyWage) {
  const hours = calculateHours(startTime, endTime);
  return (hours * parseFloat(hourlyWage)).toFixed(2);
}

// Format currency
function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Clear error message
function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = "";
  }
}

// Clear all errors in a form
function clearAllErrors(form) {
  const errorElements = form.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    clearUserSession();
    window.location.href = "index.html";
  }
}

// Add event listeners for logout buttons
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  const footerLogout = document.getElementById("footerLogout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  if (footerLogout) {
    footerLogout.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Display username in header
  const userName = document.getElementById("userName");
  if (userName) {
    const username = checkAuth();
    if (username) {
      userName.textContent = username;
    }
  }
});
