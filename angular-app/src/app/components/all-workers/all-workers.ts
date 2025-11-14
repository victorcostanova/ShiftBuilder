import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-all-workers',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './all-workers.html',
  styleUrl: './all-workers.css',
})
export class AllWorkers implements OnInit {
  currentUsername: string | null = null;
  allWorkers: any[] = [];
  filteredWorkers: any[] = [];

  searchFilters = {
    searchWorker: '',
    searchEmail: '',
  };

  totalWorkers = 0;
  averageAge = 0;

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private apiService: ApiService,
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

    // Load all workers
    await this.loadAllWorkers();
  }

  async loadAllWorkers() {
    try {
      const users = await firstValueFrom(this.apiService.getAllUsers());
      // Filter out admin users
      this.allWorkers = users
        .filter((user: any) => user.permission?.description !== 'admin')
        .map((user: any) => {
          // Calculate age if birthDate is available
          const age = this.calculateAge(user.birthDate);
          return {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstname,
            lastName: user.lastname,
            birthDate: user.birthDate || null,
            age: age,
            registeredAt: user.created || new Date().toISOString(),
            fullName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
          };
        });
      this.filteredWorkers = [...this.allWorkers];
      this.displayWorkers();
      this.updateStatistics();
    } catch (error: any) {
      console.error('Error loading workers:', error);
      this.allWorkers = [];
      this.filteredWorkers = [];
    }
  }

  calculateAge(birthDate: string | Date | null | undefined): number {
    if (!birthDate) {
      return 0;
    }

    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) {
        return 0;
      }

      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      return 0;
    }
  }

  displayWorkers() {
    if (this.filteredWorkers.length === 0) {
      return;
    }

    // Sort workers by registration date (newest first)
    this.filteredWorkers = [...this.filteredWorkers].sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
  }

  editWorker(userId: string) {
    // Navigate to edit profile page with worker user ID
    this.router.navigate(['/edit-worker-profile'], { queryParams: { id: userId } });
  }

  filterWorkers() {
    let filtered = [...this.allWorkers];

    // Filter by worker name
    if (this.searchFilters.searchWorker) {
      const searchTerm = this.searchFilters.searchWorker.toLowerCase().trim();
      filtered = filtered.filter(
        (worker) =>
          worker.firstName.toLowerCase().includes(searchTerm) ||
          worker.lastName.toLowerCase().includes(searchTerm) ||
          worker.fullName.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by email
    if (this.searchFilters.searchEmail) {
      const searchTerm = this.searchFilters.searchEmail.toLowerCase().trim();
      filtered = filtered.filter((worker) => worker.email.toLowerCase().includes(searchTerm));
    }

    this.filteredWorkers = filtered;
    this.displayWorkers();
    this.updateStatistics();
  }

  clearFilters() {
    this.searchFilters = {
      searchWorker: '',
      searchEmail: '',
    };
    this.filteredWorkers = [...this.allWorkers];
    this.displayWorkers();
    this.updateStatistics();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.filterWorkers();
    }
  }

  updateStatistics() {
    this.totalWorkers = this.filteredWorkers.length;
    let totalAge = 0;
    let workersWithAge = 0;

    this.filteredWorkers.forEach((worker) => {
      if (worker.age > 0) {
        totalAge += worker.age;
        workersWithAge++;
      }
    });

    this.averageAge = workersWithAge > 0 ? Math.round(totalAge / workersWithAge) : 0;
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
}
