import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-edit-worker-profile',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-worker-profile.html',
  styleUrl: './edit-worker-profile.css',
})
export class EditWorkerProfile implements OnInit {
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin123!',
    password: 'admin123',
  };

  currentUsername: string | null = null;
  targetWorkerUsername: string | null = null;

  workerData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  };

  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  firstNameError = '';
  lastNameError = '';
  birthDateError = '';

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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

    // Get worker username from URL parameters
    this.route.queryParams.subscribe((params) => {
      this.targetWorkerUsername = params['username'];
      if (!this.targetWorkerUsername) {
        alert('No worker specified. Redirecting to all workers page.');
        this.router.navigate(['/all-workers']);
        return;
      }
      this.loadWorkerData();
    });
  }

  loadWorkerData() {
    const workerData = this.utilsService.getUserData(this.targetWorkerUsername!);

    if (!workerData) {
      alert('Worker not found. Redirecting to all workers page.');
      this.router.navigate(['/all-workers']);
      return;
    }

    // Populate form fields
    this.workerData = {
      email: workerData.email || '',
      password: workerData.password || '',
      confirmPassword: workerData.password || '',
      firstName: workerData.firstName || '',
      lastName: workerData.lastName || '',
      birthDate: workerData.birthDate || '',
    };
  }

  onSubmit() {
    this.clearErrors();

    let hasError = false;

    // Validate email
    if (!this.utilsService.validateEmail(this.workerData.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }

    // Validate password
    const passwordValidation = this.utilsService.validatePassword(this.workerData.password);
    if (!passwordValidation.valid) {
      this.passwordError = passwordValidation.message;
      hasError = true;
    }

    // Validate password confirmation
    if (this.workerData.password !== this.workerData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    // Validate first name
    const firstNameValidation = this.utilsService.validateName(this.workerData.firstName);
    if (!firstNameValidation.valid) {
      this.firstNameError = firstNameValidation.message;
      hasError = true;
    }

    // Validate last name
    const lastNameValidation = this.utilsService.validateName(this.workerData.lastName);
    if (!lastNameValidation.valid) {
      this.lastNameError = lastNameValidation.message;
      hasError = true;
    }

    // Validate age
    if (!this.workerData.birthDate) {
      this.birthDateError = 'Please enter birth date';
      hasError = true;
    } else {
      const ageValidation = this.utilsService.validateAge(this.workerData.birthDate);
      if (!ageValidation.valid) {
        this.birthDateError = ageValidation.message;
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    // Update worker data
    const updatedWorkerData = {
      email: this.workerData.email,
      username: this.targetWorkerUsername,
      password: this.workerData.password,
      firstName: this.workerData.firstName,
      lastName: this.workerData.lastName,
      birthDate: this.workerData.birthDate,
      isAdmin: false, // Workers are never admin
      registeredAt: this.utilsService.getUserData(this.targetWorkerUsername!).registeredAt, // Keep original registration date
    };

    this.utilsService.saveUserData(this.targetWorkerUsername!, updatedWorkerData);

    alert('Worker profile updated successfully!');
    this.router.navigate(['/admin-home']);
  }

  filterWorkerShifts() {
    // Navigate to worker shifts filter page
    this.router.navigate(['/filtershifts-worker'], {
      queryParams: { username: this.targetWorkerUsername },
    });
  }

  deleteWorker() {
    if (
      confirm(
        `Are you sure you want to delete worker "${this.targetWorkerUsername}"? This action cannot be undone.`
      )
    ) {
      // Get all users
      const users = JSON.parse(localStorage.getItem('users') || '{}');

      // Delete worker data
      delete users[this.targetWorkerUsername!];
      localStorage.setItem('users', JSON.stringify(users));

      // Delete worker shifts
      localStorage.removeItem(`shifts_${this.targetWorkerUsername}`);

      alert('Worker deleted successfully!');
      this.router.navigate(['/admin-home']);
    }
  }

  logout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  private clearErrors() {
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.birthDateError = '';
  }
}
