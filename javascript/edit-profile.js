// Edit profile page functionality

let currentUsername = null;

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  currentUsername = checkAuth();
  if (!currentUsername) {
    return;
  }

  // Load current user data
  loadUserData();

  const editProfileForm = document.getElementById("editProfileForm");
  editProfileForm.addEventListener("submit", handleUpdate);

  // Clear errors on input
  const inputs = editProfileForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this.id + "Error");
    });
  });
});

function loadUserData() {
  const userData = getUserData(currentUsername);
  if (!userData) {
    alert("User data not found!");
    window.location.href = "index.html";
    return;
  }

  // Populate form with current user data
  document.getElementById("email").value = userData.email;
  document.getElementById("username").value = userData.username;
  document.getElementById("password").value = userData.password;
  document.getElementById("confirmPassword").value = userData.password;
  document.getElementById("firstName").value = userData.firstName;
  document.getElementById("lastName").value = userData.lastName;
  document.getElementById("birthDate").value = userData.birthDate;
}

function handleUpdate(e) {
  e.preventDefault();
  clearAllErrors(e.target);

  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const birthDate = document.getElementById("birthDate").value;

  let hasError = false;

  // Validate email
  if (!validateEmail(email)) {
    showError("emailError", "Please enter a valid email address");
    hasError = true;
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    showError("usernameError", usernameValidation.message);
    hasError = true;
  } else if (username !== currentUsername) {
    // Check if new username already exists
    const existingUser = getUserData(username);
    if (existingUser) {
      showError("usernameError", "Username already exists");
      hasError = true;
    }
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    showError("passwordError", passwordValidation.message);
    hasError = true;
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match");
    hasError = true;
  }

  // Validate first name
  const firstNameValidation = validateName(firstName);
  if (!firstNameValidation.valid) {
    showError("firstNameError", firstNameValidation.message);
    hasError = true;
  }

  // Validate last name
  const lastNameValidation = validateName(lastName);
  if (!lastNameValidation.valid) {
    showError("lastNameError", lastNameValidation.message);
    hasError = true;
  }

  // Validate age
  if (!birthDate) {
    showError("birthDateError", "Please enter your birth date");
    hasError = true;
  } else {
    const ageValidation = validateAge(birthDate);
    if (!ageValidation.valid) {
      showError("birthDateError", ageValidation.message);
      hasError = true;
    }
  }

  if (hasError) {
    return;
  }

  // Get current user data
  const currentUserData = getUserData(currentUsername);

  // Update user data
  const updatedUserData = {
    ...currentUserData,
    email: email,
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    birthDate: birthDate,
    updatedAt: new Date().toISOString(),
  };

  // If username changed, need to update localStorage keys
  if (username !== currentUsername) {
    // Get all users
    const users = JSON.parse(localStorage.getItem("users")) || {};

    // Remove old username
    delete users[currentUsername];

    // Add new username
    users[username] = updatedUserData;
    localStorage.setItem("users", JSON.stringify(users));

    // Move shifts to new username
    const shifts = getUserShifts(currentUsername);
    localStorage.removeItem(`shifts_${currentUsername}`);
    saveUserShifts(username, shifts);

    // Update session
    clearUserSession();
    setUserSession(username);
    currentUsername = username;
  } else {
    // Just update the user data
    saveUserData(currentUsername, updatedUserData);
  }

  alert("Profile updated successfully!");
  window.location.href = "worker-home.html";
}
