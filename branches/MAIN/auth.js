// Login page functionality

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const session = localStorage.getItem("userSession");
  if (session) {
    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - sessionTime) / (1000 * 60);

    if (diffInMinutes <= 60) {
      const userData = getUserData(sessionData.username);
      const redirectPage = userData && userData.isAdmin ? "admin-home.html" : "home.html";
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

    // Check if user exists
    console.log("Checking if user exists...");
    const userData = getUserData(username);
    console.log("User data retrieved:", userData);

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

    // Login successful
    console.log("✅ Login successful!");
    setUserSession(username);
    const redirectPage = userData.isAdmin ? "admin-home.html" : "home.html";
    window.location.href = redirectPage;
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
