// Add/Edit shift functionality

let currentUsername = null;
let editingSlug = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    currentUsername = checkAuth();
    if (!currentUsername) {
        return;
    }

    // Check if editing existing shift
    const urlParams = new URLSearchParams(window.location.search);
    editingSlug = urlParams.get('slug');

    if (editingSlug) {
        loadShiftData(editingSlug);
        document.getElementById('formTitle').textContent = 'Edit Shift';
        document.querySelector('.btn-primary .btn-text').textContent = 'Update Shift';
    }

    const shiftForm = document.getElementById('shiftForm');
    shiftForm.addEventListener('submit', handleSubmit);

    // Clear errors on input
    const inputs = shiftForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id + 'Error');
        });
    });
});

function loadShiftData(slug) {
    const shifts = getUserShifts(currentUsername);
    const shift = shifts.find(s => s.slug === slug);

    if (!shift) {
        alert('Shift not found!');
        window.location.href = 'home.html';
        return;
    }

    // Populate form with shift data
    document.getElementById('shiftDate').value = shift.date;
    document.getElementById('startTime').value = shift.startTime;
    document.getElementById('endTime').value = shift.endTime;
    document.getElementById('hourlyWage').value = shift.hourlyWage;
    document.getElementById('workplace').value = shift.workplace;
    document.getElementById('shiftSlug').value = shift.slug;
    document.getElementById('comments').value = shift.comments || '';

    // Disable slug editing
    document.getElementById('shiftSlug').disabled = true;
}

function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors(e.target);

    const shiftDate = document.getElementById('shiftDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const hourlyWage = document.getElementById('hourlyWage').value;
    const workplace = document.getElementById('workplace').value;
    const shiftSlug = document.getElementById('shiftSlug').value.trim();
    const comments = document.getElementById('comments').value.trim();

    let hasError = false;

    // Validate date
    if (!shiftDate) {
        showError('shiftDateError', 'Date is required');
        hasError = true;
    }

    // Validate start time
    if (!startTime) {
        showError('startTimeError', 'Start time is required');
        hasError = true;
    }

    // Validate end time
    if (!endTime) {
        showError('endTimeError', 'End time is required');
        hasError = true;
    } else if (startTime && endTime <= startTime) {
        showError('endTimeError', 'End time must be after start time');
        hasError = true;
    }

    // Validate hourly wage
    if (!hourlyWage || parseFloat(hourlyWage) <= 0) {
        showError('hourlyWageError', 'Please enter a valid hourly wage');
        hasError = true;
    }

    // Validate workplace
    if (!workplace) {
        showError('workplaceError', 'Please select a workplace');
        hasError = true;
    }

    // Validate shift slug
    if (!shiftSlug) {
        showError('shiftSlugError', 'Shift name is required');
        hasError = true;
    } else if (!editingSlug) {
        // Check if slug already exists (only when creating new shift)
        const shifts = getUserShifts(currentUsername);
        const slugExists = shifts.some(shift => shift.slug === shiftSlug);
        if (slugExists) {
            showError('shiftSlugError', 'This shift name already exists. Please choose a different name.');
            hasError = true;
        }
    }

    if (hasError) {
        return;
    }

    // Show loading spinner
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';

    // Simulate saving delay
    setTimeout(() => {
        saveShift({
            date: shiftDate,
            startTime: startTime,
            endTime: endTime,
            hourlyWage: parseFloat(hourlyWage),
            workplace: workplace,
            slug: shiftSlug,
            comments: comments,
            createdAt: editingSlug ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        btnText.style.display = 'inline';
        loader.style.display = 'none';

        const message = editingSlug ? 'Shift updated successfully!' : 'Shift added successfully!';
        alert(message);
        window.location.href = 'home.html';
    }, 500);
}

function saveShift(shiftData) {
    const shifts = getUserShifts(currentUsername);

    if (editingSlug) {
        // Update existing shift
        const index = shifts.findIndex(s => s.slug === editingSlug);
        if (index !== -1) {
            shifts[index] = { ...shifts[index], ...shiftData };
        }
    } else {
        // Add new shift
        shifts.push(shiftData);
    }

    saveUserShifts(currentUsername, shifts);
}
