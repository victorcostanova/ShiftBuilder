// Edit worker profile page functionality

// Fixed admin account credentials (must match auth.js)
const ADMIN_CREDENTIALS = {
  username: "admin123!",
  password: "admin123",
};

let currentUsername = null;
let targetWorkerUsername = null;

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
    window.location.href = "worker-home.html";
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

  // Load worker data
  loadWorkerData();

  // Set up form submission
  const editForm = document.getElementById("editWorkerProfileForm");
  editForm.addEventListener("submit", handleFormSubmission);

  // Clear errors on input
  const inputs = editForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this.id + "Error");
    });
  });
});

function loadWorkerData() {
  const workerData = getUserData(targetWorkerUsername);

  if (!workerData) {
    alert("Worker not found. Redirecting to all workers page.");
    window.location.href = "all-workers.html";
    return;
  }

  // Populate form fields
  document.getElementById("email").value = workerData.email || "";
  document.getElementById("password").value = workerData.password || "";
  document.getElementById("confirmPassword").value = workerData.password || "";
  document.getElementById("firstName").value = workerData.firstName || "";
  document.getElementById("lastName").value = workerData.lastName || "";
  document.getElementById("birthDate").value = workerData.birthDate || "";
}

function handleFormSubmission(e) {
  e.preventDefault();
  clearAllErrors(e.target);

  const email = document.getElementById("email").value.trim();
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
    showError("birthDateError", "Please enter birth date");
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

  // Update worker data
  const updatedWorkerData = {
    email: email,
    username: targetWorkerUsername,
    password: password,
    firstName: firstName,
    lastName: lastName,
    birthDate: birthDate,
    isAdmin: false, // Workers are never admin
    registeredAt: getUserData(targetWorkerUsername).registeredAt, // Keep original registration date
  };

  saveUserData(targetWorkerUsername, updatedWorkerData);

  alert("Worker profile updated successfully!");
  window.location.href = "admin-home.html";
}

function filterWorkerShifts() {
  // Navigate to worker shifts filter page
  window.location.href = `filtershifts-worker.html?username=${encodeURIComponent(
    targetWorkerUsername
  )}`;
}

function deleteWorker() {
  if (
    confirm(
      `Are you sure you want to delete worker "${targetWorkerUsername}"? This action cannot be undone.`
    )
  ) {
    // Get all users
    const users = JSON.parse(localStorage.getItem("users")) || {};

    // Delete worker data
    delete users[targetWorkerUsername];
    localStorage.setItem("users", JSON.stringify(users));

    // Delete worker shifts
    localStorage.removeItem(`shifts_${targetWorkerUsername}`);

    alert("Worker deleted successfully!");
    window.location.href = "admin-home.html";
  }
}
