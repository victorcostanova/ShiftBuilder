// Login page functionality

// Fixed admin account credentials
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

// Check if credentials match the fixed admin account
function isAdminAccount(username, password) {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const session = localStorage.getItem("userSession");
  if (session) {
    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - sessionTime) / (1000 * 60);

    if (diffInMinutes <= 60) {
      // Check if it's the admin account (hardcoded or localStorage)
      if (sessionData.username === ADMIN_CREDENTIALS.username) {
        window.location.href = "admin-home.html";
        return;
      }

      // Check if it's an admin account in localStorage
      const userData = getUserData(sessionData.username);
      if (userData && userData.isAdmin) {
        window.location.href = "admin-home.html";
        return;
      }

      // For regular users
      const redirectPage = userData ? "home.html" : "index.html";
      window.location.href = redirectPage;
      return;
    }
  }

  const loginForm = document.getElementById("loginForm");
  const resetPasswordLink = document.getElementById("resetPassword");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(loginForm);

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    console.log("=== LOGIN DEBUG ===");
    console.log("Username:", username);
    console.log("Password:", password);

    // Validate username
    const usernameValidation = validateUsername(username);
    console.log("Username validation:", usernameValidation);
    if (!usernameValidation.valid) {
      console.log("❌ Username validation failed");
      showError("usernameError", usernameValidation.message);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    console.log("Password validation:", passwordValidation);
    if (!passwordValidation.valid) {
      console.log("❌ Password validation failed");
      showError("passwordError", passwordValidation.message);
      return;
    }

    // Check if it's the fixed admin account first (hardcoded)
    if (isAdminAccount(username, password)) {
      console.log("✅ Admin login successful (hardcoded)!");
      setUserSession(username);
      window.location.href = "admin-home.html";
      return;
    }

    // Check if user exists (for regular users and admin in localStorage)
    console.log("Checking if user exists...");
    const userData = getUserData(username);
    console.log("User data retrieved:", userData);

    // Check if it's the admin account in localStorage
    if (userData && userData.isAdmin && userData.password === password) {
      console.log("✅ Admin login successful (localStorage)!");
      setUserSession(username);
      window.location.href = "admin-home.html";
      return;
    }

    if (!userData) {
      console.log("❌ User does not exist");
      showError("usernameError", "User does not exist. Please register first.");
      return;
    }

    // Check password
    console.log("Checking password...");
    console.log("Expected password:", userData.password);
    console.log("Provided password:", password);
    console.log("Passwords match:", userData.password === password);

    if (userData.password !== password) {
      console.log("❌ Password incorrect");
      showError("passwordError", "Incorrect password");
      return;
    }

    // Login successful (regular user)
    console.log("✅ Login successful!");
    setUserSession(username);
    window.location.href = "home.html";
  });

  // Reset password functionality
  resetPasswordLink.addEventListener("click", function (e) {
    e.preventDefault();

    if (
      confirm(
        "WARNING: Resetting your password will delete all user data. Are you sure you want to continue?"
      )
    ) {
      const username = document.getElementById("username").value.trim();

      if (!username) {
        alert("Please enter your username first");
        return;
      }

      // Prevent admin account reset
      if (username === ADMIN_CREDENTIALS.username) {
        alert("Cannot reset admin account password");
        return;
      }

      const userData = getUserData(username);
      if (!userData) {
        alert("User does not exist");
        return;
      }

      // Delete all user data
      const users = JSON.parse(localStorage.getItem("users")) || {};
      delete users[username];
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.removeItem(`shifts_${username}`);

      alert("All user data has been deleted. Please register again.");
      window.location.href = "register.html";
    }
  });

  // Clear errors on input
  const inputs = loginForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this.id + "Error");
    });
  });
});
