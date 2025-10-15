// Utility functions for localStorage and validation - Edit Profile Module

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

// Get user data
function getUserData(username) {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  return users[username] || null;
}

// Save user data
function saveUserData(username, userData) {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  users[username] = userData;
  localStorage.setItem("users", JSON.stringify(users));
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

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  if (username.length < 6) {
    return {
      valid: false,
      message: "Username must be at least 6 characters long",
    };
  }

  const hasLetter = /[a-zA-Z]/.test(username);
  const hasNumber = /[0-9]/.test(username);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(username);

  if (!hasLetter || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      message:
        "Username must contain letters, numbers, and at least one special character",
    };
  }

  return { valid: true };
}

function validatePassword(password) {
  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { valid: true };
}

function validateName(name, minLength = 2) {
  const nameRegex = /^[a-zA-Z]+$/;
  if (name.length < minLength) {
    return {
      valid: false,
      message: `Name must be at least ${minLength} letters`,
    };
  }
  if (!nameRegex.test(name)) {
    return { valid: false, message: "Name must contain only letters" };
  }
  return { valid: true };
}

function validateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 18 || age > 65) {
    return { valid: false, message: "Age must be between 18 and 65" };
  }
  return { valid: true, age: age };
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
