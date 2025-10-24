import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-worker-home',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './worker-home.html',
  styleUrl: './worker-home.css',
})
export class WorkerHome implements OnInit {
  currentUsername: string | null = null;
  allShifts: any[] = [];
  filteredShifts: any[] = [];

  searchFilters = {
    searchShift: '',
    dateFrom: '',
    dateTo: '',
  };

  highestMonth = 'No data available';
  highestAmount = 0;

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication
    this.currentUsername = this.utilsService.checkAuth();
    if (!this.currentUsername) {
      this.router.navigate(['/login']);
      return;
    }

    // Load and display shifts
    this.loadShifts();
  }

  loadShifts() {
    this.allShifts = this.utilsService.getUserShifts(this.currentUsername!);
    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
    this.calculateStatistics();
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

    // Filter by shift name
    if (this.searchFilters.searchShift) {
      const searchTerm = this.searchFilters.searchShift.toLowerCase().trim();
      filtered = filtered.filter(
        (shift) =>
          shift.slug.toLowerCase().includes(searchTerm) ||
          shift.workplace.toLowerCase().includes(searchTerm) ||
          (shift.comments && shift.comments.toLowerCase().includes(searchTerm))
      );
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
  }

  clearFilters() {
    this.searchFilters = {
      searchShift: '',
      dateFrom: '',
      dateTo: '',
    };
    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.filterShifts();
    }
  }

  calculateStatistics() {
    if (this.allShifts.length === 0) {
      this.highestMonth = 'No data available';
      this.highestAmount = 0;
      return;
    }

    // Group shifts by month and calculate total earnings
    const monthlyEarnings: { [key: string]: { name: string; total: number } } = {};

    this.allShifts.forEach((shift) => {
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

  editShift(slug: string) {
    this.router.navigate(['/add-shift'], { queryParams: { slug: slug } });
  }

  deleteShift(slug: string) {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    const shifts = this.utilsService.getUserShifts(this.currentUsername!);
    const updatedShifts = shifts.filter((shift: any) => shift.slug !== slug);
    this.utilsService.saveUserShifts(this.currentUsername!, updatedShifts);

    this.loadShifts();
    alert('Shift deleted successfully!');
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
