import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ShiftService } from '../../services/shift.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-all-shifts',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './all-shifts.html',
  styleUrl: './all-shifts.css',
})
export class AllShifts implements OnInit {
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
    private shiftService: ShiftService,
    private router: Router
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

    // Load all shifts
    await this.loadAllShifts();
  }

  async loadAllShifts() {
    try {
      const shifts = await firstValueFrom(this.shiftService.getAllShifts());
      this.allShifts = shifts.map((shift: any) => {
        const converted = this.shiftService.convertShiftFromApi(shift);
        return {
          ...converted,
          username: shift.userId?.username || shift.userId?._id || '',
          workerName: shift.userId
            ? `${shift.userId.firstname || ''} ${shift.userId.lastname || ''}`.trim()
            : 'Unknown',
        };
      });
    this.filteredShifts = [...this.allShifts];
    this.displayShifts();
    this.updateStatistics();
    } catch (error: any) {
      console.error('Error loading shifts:', error);
      this.allShifts = [];
      this.filteredShifts = [];
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
