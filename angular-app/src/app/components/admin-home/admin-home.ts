import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin123!',
    password: 'admin123',
  };

  currentUsername: string | null = null;
  workerOfMonth = 'No data available';
  workerShiftCount = '0 shifts';
  weeklyShifts: any[] = [];
  highestMonth = 'No data available';
  highestAmount = 0;

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication and admin status
    this.currentUsername = this.utilsService.checkAuth();
    if (!this.currentUsername) {
      this.router.navigate(['/login']);
      return;
    }

    // Verify user is admin (hardcoded or localStorage)
    const userData = this.utilsService.getUserData(this.currentUsername);
    const isHardcodedAdmin = this.currentUsername === this.ADMIN_CREDENTIALS.username;
    const isLocalStorageAdmin = userData && userData.isAdmin;

    if (!isHardcodedAdmin && !isLocalStorageAdmin) {
      alert('Access denied. This page is for administrators only.');
      this.router.navigate(['/worker-home']);
      return;
    }

    // Load dashboard data
    this.loadDashboardStatistics();
  }

  loadDashboardStatistics() {
    const allShiftsData = this.getAllShiftsForAllWorkers();

    this.calculateWorkerOfMonth(allShiftsData);
    this.displayWeeklyShifts(allShiftsData);
    this.calculateHighestEarningMonth(allShiftsData);
  }

  getAllUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return Object.entries(users)
      .filter(([username, userData]: [string, any]) => username !== this.ADMIN_CREDENTIALS.username) // Exclude fixed admin account
      .map(([username, userData]: [string, any]) => ({
        username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
      }));
  }

  getAllShiftsForAllWorkers() {
    const allShifts: any[] = [];
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    for (const [username, userData] of Object.entries(users)) {
      // Skip fixed admin account
      if (username === this.ADMIN_CREDENTIALS.username) continue;

      const userShifts = this.utilsService.getUserShifts(username);
      userShifts.forEach((shift: any) => {
        allShifts.push({
          ...shift,
          username: username,
          workerName: `${(userData as any).firstName} ${(userData as any).lastName}`,
        });
      });
    }

    return allShifts;
  }

  calculateWorkerOfMonth(allShifts: any[]) {
    if (allShifts.length === 0) {
      this.workerOfMonth = 'No data available';
      this.workerShiftCount = '0 shifts';
      return;
    }

    // Group shifts by worker
    const workerShiftCounts: { [key: string]: { name: string; count: number } } = {};

    allShifts.forEach((shift) => {
      if (!workerShiftCounts[shift.username]) {
        workerShiftCounts[shift.username] = {
          name: shift.workerName,
          count: 0,
        };
      }
      workerShiftCounts[shift.username].count++;
    });

    // Find worker with most shifts
    let topWorker = 'No data available';
    let maxShifts = 0;

    for (const [username, data] of Object.entries(workerShiftCounts)) {
      if (data.count > maxShifts) {
        maxShifts = data.count;
        topWorker = data.name;
      }
    }

    this.workerOfMonth = topWorker;
    this.workerShiftCount = `${maxShifts} shift${maxShifts !== 1 ? 's' : ''}`;
  }

  displayWeeklyShifts(allShifts: any[]) {
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
    const weeklyShifts = allShifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startOfWeek && shiftDate <= today;
    });

    // Sort by date (most recent first)
    this.weeklyShifts = weeklyShifts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  calculateHighestEarningMonth(allShifts: any[]) {
    if (allShifts.length === 0) {
      this.highestMonth = 'No data available';
      this.highestAmount = 0;
      return;
    }

    // Group shifts by month and calculate total earnings
    const monthlyEarnings: { [key: string]: { name: string; total: number } } = {};

    allShifts.forEach((shift) => {
      const date = new Date(shift.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      const profit = parseFloat(
        this.calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage)
      );

      if (!monthlyEarnings[monthKey]) {
        monthlyEarnings[monthKey] = {
          name: monthName,
          total: 0,
        };
      }

      monthlyEarnings[monthKey].total += profit;
    });

    // Find the month with highest earnings
    let highestAmount = 0;
    let highestMonthName = 'No data available';

    for (const [key, data] of Object.entries(monthlyEarnings)) {
      if (data.total > highestAmount) {
        highestAmount = data.total;
        highestMonthName = data.name;
      }
    }

    this.highestMonth = highestMonthName;
    this.highestAmount = highestAmount;
  }

  logout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  // Utility methods
  formatDate(date: string): string {
    return this.utilsService.formatDate(new Date(date));
  }

  formatCurrency(amount: number): string {
    return this.utilsService.formatCurrency(amount);
  }

  calculateProfit(startTime: string, endTime: string, hourlyWage: number): string {
    return this.utilsService.calculateProfit(startTime, endTime, hourlyWage);
  }
}
