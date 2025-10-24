import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-all-shifts',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './all-shifts.html',
  styleUrl: './all-shifts.css',
})
export class AllShifts implements OnInit {
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin123!',
    password: 'admin123',
  };

  currentUsername: string | null = null;
  allShifts: any[] = [];
  filteredShifts: any[] = [];

  searchFilters = {
    searchWorker: '',
    searchWorkplace: '',
    dateFrom: '',
    dateTo: '',
  };

  totalShifts = 0;
  totalEarnings = 0;

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

    // Load all shifts
    this.loadAllShifts();
  }

  loadAllShifts() {
    this.allShifts = this.getAllShiftsForAllWorkers();
    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
    this.updateStatistics();
  }

  getAllShiftsForAllWorkers() {
    const shifts: any[] = [];
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    for (const [username, userData] of Object.entries(users)) {
      // Skip fixed admin account
      if (username === this.ADMIN_CREDENTIALS.username) continue;

      const userShifts = this.utilsService.getUserShifts(username);
      userShifts.forEach((shift: any) => {
        shifts.push({
          ...shift,
          username: username,
          workerName: `${(userData as any).firstName} ${(userData as any).lastName}`,
        });
      });
    }

    return shifts;
  }

  displayShifts() {
    if (this.filteredShifts.length === 0) {
      return;
    }

    // Sort shifts by date (newest first)
    this.filteredShifts = [...this.filteredShifts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  filterShifts() {
    let filtered = [...this.allShifts];

    // Filter by worker name
    if (this.searchFilters.searchWorker) {
      const searchTerm = this.searchFilters.searchWorker.toLowerCase().trim();
      filtered = filtered.filter((shift) => shift.workerName.toLowerCase().includes(searchTerm));
    }

    // Filter by workplace
    if (this.searchFilters.searchWorkplace) {
      const searchTerm = this.searchFilters.searchWorkplace.toLowerCase().trim();
      filtered = filtered.filter((shift) => shift.workplace.toLowerCase().includes(searchTerm));
    }

    // Filter by date range
    if (this.searchFilters.dateFrom) {
      filtered = filtered.filter(
        (shift) => new Date(shift.date) >= new Date(this.searchFilters.dateFrom)
      );
    }

    if (this.searchFilters.dateTo) {
      filtered = filtered.filter(
        (shift) => new Date(shift.date) <= new Date(this.searchFilters.dateTo)
      );
    }

    this.filteredShifts = filtered;
    this.displayShifts();
    this.updateStatistics();
  }

  clearFilters() {
    this.searchFilters = {
      searchWorker: '',
      searchWorkplace: '',
      dateFrom: '',
      dateTo: '',
    };
    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
    this.updateStatistics();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.filterShifts();
    }
  }

  updateStatistics() {
    this.totalShifts = this.filteredShifts.length;
    this.totalEarnings = 0;

    this.filteredShifts.forEach((shift) => {
      const profit = parseFloat(
        this.calculateProfit(shift.startTime, shift.endTime, shift.hourlyWage)
      );
      this.totalEarnings += profit;
    });
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
