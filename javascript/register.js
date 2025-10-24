// Registration page functionality

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAllErrors(registerForm);

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
    } else {
      // Check if username already exists
      const userData = getUserData(username);
      if (userData) {
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

    // Save user data
    const newUserData = {
      email: email,
      username: username,
      password: password,
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate,
      isAdmin: false, // Regular users are never admin
      registeredAt: new Date().toISOString(),
    };

    saveUserData(username, newUserData);

    alert("Registration successful! Please login.");
    window.location.href = "index.html";
  });

  // Clear errors on input
  const inputs = registerForm.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearError(this.id + "Error");
    });
  });
});
