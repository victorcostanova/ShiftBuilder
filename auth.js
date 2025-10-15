// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const session = localStorage.getItem('userSession');
    if (session) {
        const sessionData = JSON.parse(session);
        const sessionTime = new Date(sessionData.timestamp);
        const currentTime = new Date();
        const diffInMinutes = (currentTime - sessionTime) / (1000 * 60);

        if (diffInMinutes <= 60) {
            window.location.href = 'home.html';
            return;
        }
    }

    const loginForm = document.getElementById('loginForm');
    const resetPasswordLink = document.getElementById('resetPassword');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearAllErrors(loginForm);

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            showError('usernameError', usernameValidation.message);
            return;
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            showError('passwordError', passwordValidation.message);
            return;
        }

        // Check if user exists
        const userData = getUserData(username);
        if (!userData) {
            showError('usernameError', 'User does not exist. Please register first.');
            return;
        }

        // Check password
        if (userData.password !== password) {
            showError('passwordError', 'Incorrect password');
            return;
        }

        // Login successful
        setUserSession(username);
        window.location.href = 'home.html';
    });

    // Reset password functionality
    resetPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();

        if (confirm('WARNING: Resetting your password will delete all user data. Are you sure you want to continue?')) {
            const username = document.getElementById('username').value.trim();

            if (!username) {
                alert('Please enter your username first');
                return;
            }

            const userData = getUserData(username);
            if (!userData) {
                alert('User does not exist');
                return;
            }

            // Delete all user data
            const users = JSON.parse(localStorage.getItem('users')) || {};
            delete users[username];
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.removeItem(`shifts_${username}`);

            alert('All data has been deleted. Please register again.');
            window.location.href = 'register.html';
        }
    });

    // Clear errors on input
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id + 'Error');
        });
    });
});
