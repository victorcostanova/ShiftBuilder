// Utility functions for localStorage and validation - Registration Module

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
