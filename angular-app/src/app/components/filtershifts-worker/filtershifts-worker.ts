import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ShiftService } from '../../services/shift.service';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-filtershifts-worker',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './filtershifts-worker.html',
  styleUrl: './filtershifts-worker.css',
})
export class FiltershiftsWorker implements OnInit {
  currentUsername: string | null = null;
  targetWorkerId: string | null = null;
  pageTitle = 'Worker Shifts';
  allShifts: any[] = [];
  filteredShifts: any[] = [];

  searchFilters = {
    searchWorkplace: '',
    dateFrom: '',
    dateTo: '',
  };

  totalShifts = 0;
  totalEarnings = 0;
  averagePerShift = 0;

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private shiftService: ShiftService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Check authentication and admin status
    this.currentUsername = this.utilsService.checkAuth();
    if (!this.currentUsername) {
      this.router.navigate(['/login']);
      return;
    }

    // Verify user is admin
    const userData = this.authService.getUserData();
    if (!userData || userData.permission?.description !== 'admin') {
      alert('Access denied. This page is for administrators only.');
      this.router.navigate(['/worker-home']);
      return;
    }

    // Get worker ID from URL parameters (support both id and username for backward compatibility)
    this.route.queryParams.subscribe(async (params) => {
      this.targetWorkerId = params['id'] || params['username'];
      if (!this.targetWorkerId) {
        alert('No worker specified. Redirecting to all workers page.');
        this.router.navigate(['/all-workers']);
        return;
      }
      await this.loadWorkerShifts();
    });
  }

  async loadWorkerShifts() {
    try {
    // Get worker data
      const workerData = await firstValueFrom(this.apiService.getUserById(this.targetWorkerId!));

    // Update page title
      this.pageTitle = `${workerData.firstname || ''} ${workerData.lastname || ''} - Shifts`.trim();

    // Get worker shifts
      const shifts = await firstValueFrom(this.shiftService.getUserShifts(this.targetWorkerId!));
      this.allShifts = shifts.map((shift: any) => {
        const converted = this.shiftService.convertShiftFromApi(shift);
        return {
          ...converted,
          workerName: `${workerData.firstname || ''} ${workerData.lastname || ''}`.trim(),
        };
      });

    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
    this.updateStatistics();
    } catch (error: any) {
      alert('Worker not found: ' + (error.message || 'Unknown error'));
      this.router.navigate(['/all-workers']);
    }
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

    this.averagePerShift = this.totalShifts > 0 ? this.totalEarnings / this.totalShifts : 0;
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
