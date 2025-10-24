import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-all-workers',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './all-workers.html',
  styleUrl: './all-workers.css',
})
export class AllWorkers implements OnInit {
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin123!',
    password: 'admin123',
  };

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

    // Load all workers
    this.loadAllWorkers();
  }

  loadAllWorkers() {
    this.allWorkers = this.getAllWorkers();
    this.filteredWorkers = [...this.allWorkers];
    this.displayWorkers();
    this.updateStatistics();
  }

  getAllWorkers() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const workers: any[] = [];

    for (const [username, userData] of Object.entries(users)) {
      // Skip fixed admin account
      if (username === this.ADMIN_CREDENTIALS.username) continue;

      // Calculate age
      const age = this.calculateAge((userData as any).birthDate);

      workers.push({
        username: username,
        email: (userData as any).email,
        firstName: (userData as any).firstName,
        lastName: (userData as any).lastName,
        birthDate: (userData as any).birthDate,
        age: age,
        registeredAt: (userData as any).registeredAt,
        fullName: `${(userData as any).firstName} ${(userData as any).lastName}`,
      });
    }

    return workers;
  }

  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
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

  editWorker(username: string) {
    // Navigate to edit profile page with worker username
    this.router.navigate(['/edit-worker-profile'], { queryParams: { username: username } });
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

    this.filteredWorkers.forEach((worker) => {
      totalAge += worker.age;
    });

    this.averageAge = this.totalWorkers > 0 ? Math.round(totalAge / this.totalWorkers) : 0;
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
