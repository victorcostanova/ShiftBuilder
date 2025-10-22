// Admin home page functionality

let currentUsername = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin status
    currentUsername = checkAuth();
    if (!currentUsername) {
        return;
    }

    // Verify user is admin
    const userData = getUserData(currentUsername);
    if (!userData || !userData.isAdmin) {
        alert('Access denied. This page is for administrators only.');
        window.location.href = 'home.html';
        return;
    }

    // Load dashboard data
    loadDashboardStatistics();
});

function loadDashboardStatistics() {
    const allUsers = getAllUsers();
    const allShiftsData = getAllShiftsForAllWorkers();

    calculateWorkerOfMonth(allShiftsData);
    displayWeeklyShifts(allShiftsData);
    calculateHighestEarningMonth(allShiftsData);
}

function getAllUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return Object.entries(users)
        .filter(([username, userData]) => !userData.isAdmin)
        .map(([username, userData]) => ({
            username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: `${userData.firstName} ${userData.lastName}`
        }));
}

function getAllShiftsForAllWorkers() {
    const allShifts = [];
    const users = JSON.parse(localStorage.getItem('users')) || {};

    for (const [username, userData] of Object.entries(users)) {
        // Skip admin users
        if (userData.isAdmin) continue;

        const userShifts = getUserShifts(username);
        userShifts.forEach(shift => {
            allShifts.push({
                ...shift,
                username: username,
                workerName: `${userData.firstName} ${userData.lastName}`
            });
        });
    }

    return allShifts;
}

function calculateWorkerOfMonth(allShifts) {
    if (allShifts.length === 0) {
        document.getElementById('workerOfMonth').textContent = 'No data available';
        document.getElementById('workerShiftCount').textContent = '0 shifts';
        return;
    }

    // Group shifts by worker
    const workerShiftCounts = {};

    allShifts.forEach(shift => {
        if (!workerShiftCounts[shift.username]) {
            workerShiftCounts[shift.username] = {
                name: shift.workerName,
                count: 0
            };
        }
        workerShiftCounts[shift.username].count++;
    });

    // Find worker with most shifts
    let topWorker = null;
    let maxShifts = 0;

    for (const [username, data] of Object.entries(workerShiftCounts)) {
        if (data.count > maxShifts) {
            maxShifts = data.count;
            topWorker = data.name;
        }
    }

    document.getElementById('workerOfMonth').textContent = topWorker || 'No data available';
    document.getElementById('workerShiftCount').textContent = `${maxShifts} shift${maxShifts !== 1 ? 's' : ''}`;
}

function displayWeeklyShifts(allShifts) {
    const tbody = document.getElementById('weeklyShiftsTableBody');

    // Get current week's date range
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter shifts for this week and in the past
    const weeklyShifts = allShifts.filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= startOfWeek && shiftDate <= today;
    });

    if (weeklyShifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No shifts this week</td></tr>';
        return;
    }

    // Sort by date (most recent first)
    const sortedShifts = weeklyShifts.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = '';

    sortedShifts.forEach(shift => {
        const row = document.createElement('tr');
        const profit = calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage);

        row.innerHTML = `
            <td>${shift.workerName}</td>
            <td>${formatDate(shift.date)}</td>
            <td>${shift.startTime}</td>
            <td>${shift.endTime}</td>
            <td>${shift.workplace}</td>
            <td>${formatCurrency(profit)}</td>
        `;

        tbody.appendChild(row);
    });
}

function calculateHighestEarningMonth(allShifts) {
    if (allShifts.length === 0) {
        document.getElementById('highestMonth').textContent = 'No data available';
        document.getElementById('highestAmount').textContent = formatCurrency(0);
        return;
    }

    // Group shifts by month and calculate total earnings
    const monthlyEarnings = {};

    allShifts.forEach(shift => {
        const date = new Date(shift.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        const profit = parseFloat(calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage));

        if (!monthlyEarnings[monthKey]) {
            monthlyEarnings[monthKey] = {
                name: monthName,
                total: 0
            };
        }

        monthlyEarnings[monthKey].total += profit;
    });

    // Find the month with highest earnings
    let highestMonth = null;
    let highestAmount = 0;

    for (const [key, data] of Object.entries(monthlyEarnings)) {
        if (data.total > highestAmount) {
            highestAmount = data.total;
            highestMonth = data.name;
        }
    }

    document.getElementById('highestMonth').textContent = highestMonth;
    document.getElementById('highestAmount').textContent = formatCurrency(highestAmount);
}
