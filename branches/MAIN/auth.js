/**
 * Authentication System
 * Handles user login, session management, and password reset functionality
 */

// Fixed admin account credentials
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

/**
 * Check if credentials match the fixed admin account
 * @param {string} username - Username to check
 * @param {string} password - Password to check
 * @returns {boolean} - True if credentials match admin account
 */
function isAdminAccount(username, password) {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

/**
 * Handle user login process
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
  e.preventDefault();
  clearAllErrors(e.target);

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Validate credentials
  if (!validateCredentials(username, password)) {
    return;
  }

  // Attempt login
  const loginResult = attemptLogin(username, password);
  if (loginResult.success) {
    setUserSession(username);
    window.location.href = loginResult.redirectUrl;
  } else {
    showError(loginResult.errorField, loginResult.errorMessage);
  }
}

/**
 * Validate username and password
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {boolean} - True if validation passes
 */
function validateCredentials(username, password) {
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    showError("usernameError", usernameValidation.message);
    return false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    showError("passwordError", passwordValidation.message);
    return false;
  }

  return true;
}

/**
 * Attempt to login with given credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - Login result with success status and redirect info
 */
function attemptLogin(username, password) {
  // Check hardcoded admin account first
  if (isAdminAccount(username, password)) {
    return {
      success: true,
      redirectUrl: "admin-home.html",
    };
  }

  // Check localStorage admin account
  const userData = getUserData(username);
  if (userData && userData.isAdmin && userData.password === password) {
    return {
      success: true,
      redirectUrl: "admin-home.html",
    };
  }

  // Check regular user account
  if (!userData) {
    return {
      success: false,
      errorField: "usernameError",
      errorMessage: "User does not exist. Please register first.",
    };
  }

  if (userData.password !== password) {
    return {
      success: false,
      errorField: "passwordError",
      errorMessage: "Incorrect password",
    };
  }

  return {
    success: true,
    redirectUrl: "home.html",
  };
}

/**
 * Handle password reset process
 * @param {Event} e - Click event
 */
function handlePasswordReset(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Please enter your username first");
    return;
  }

  if (username === ADMIN_CREDENTIALS.username) {
    alert("Cannot reset admin account password");
    return;
  }

  const userData = getUserData(username);
  if (!userData) {
    alert("User does not exist");
    return;
  }

  const confirmed = confirm(
    "WARNING: Resetting your password will delete all user data. Are you sure you want to continue?"
  );

  if (confirmed) {
    deleteUserData(username);
    alert("All user data has been deleted. Please register again.");
    window.location.href = "register.html";
  }
}

/**
 * Delete all user data from localStorage
 * @param {string} username - Username to delete
 */
function deleteUserData(username) {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  delete users[username];
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem(`shifts_${username}`);
}

/**
 * Check existing session and redirect if valid
 */
function checkExistingSession() {
  const session = localStorage.getItem("userSession");
  if (!session) return;

  const sessionData = JSON.parse(session);
  const sessionTime = new Date(sessionData.timestamp);
  const currentTime = new Date();
  const diffInMinutes = (currentTime - sessionTime) / (1000 * 60);

  if (diffInMinutes <= 60) {
    const redirectUrl = getRedirectUrl(sessionData.username);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }
}

/**
 * Get redirect URL based on user type
 * @param {string} username - Username to check
 * @returns {string|null} - Redirect URL or null
 */
function getRedirectUrl(username) {
  if (username === ADMIN_CREDENTIALS.username) {
    return "admin-home.html";
  }

  const userData = getUserData(username);
  if (userData && userData.isAdmin) {
    return "admin-home.html";
  }

  return userData ? "home.html" : null;
}

/**
 * Clear input errors on user input
 * @param {HTMLInputElement} input - Input element
 */
function clearInputError(input) {
  clearError(input.id + "Error");
}

/**
 * Initialize authentication system
 */
function initializeAuth() {
  checkExistingSession();

  const loginForm = document.getElementById("loginForm");
  const resetPasswordLink = document.getElementById("resetPassword");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);

    // Clear errors on input
    const inputs = loginForm.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => clearInputError(input));
    });
  }

  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", handlePasswordReset);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeAuth);
