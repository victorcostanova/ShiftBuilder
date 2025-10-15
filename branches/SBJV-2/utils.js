// Utility functions for localStorage and validation - Login Module

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

// Validation functions
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
