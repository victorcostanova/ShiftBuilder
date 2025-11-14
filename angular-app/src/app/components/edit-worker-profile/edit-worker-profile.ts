import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-worker-profile',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-worker-profile.html',
  styleUrl: './edit-worker-profile.css',
})
export class EditWorkerProfile implements OnInit {
  currentUsername: string | null = null;
  targetWorkerId: string | null = null;

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
      await this.loadWorkerData();
    });
  }

  async loadWorkerData() {
    try {
      const workerData = await firstValueFrom(this.apiService.getUserById(this.targetWorkerId!));

      // Format birthDate for input type="date" (YYYY-MM-DD)
      let formattedBirthDate = '';
      if (workerData.birthDate) {
        const birthDate = new Date(workerData.birthDate);
        if (!isNaN(birthDate.getTime())) {
          const year = birthDate.getFullYear();
          const month = String(birthDate.getMonth() + 1).padStart(2, '0');
          const day = String(birthDate.getDate()).padStart(2, '0');
          formattedBirthDate = `${year}-${month}-${day}`;
        }
    }

    // Populate form fields
    this.workerData = {
      email: workerData.email || '',
        password: '', // Don't load password
        confirmPassword: '',
        firstName: workerData.firstname || '',
        lastName: workerData.lastname || '',
        birthDate: formattedBirthDate,
      };
    } catch (error: any) {
      alert('Worker not found: ' + (error.message || 'Unknown error'));
      this.router.navigate(['/all-workers']);
  }
  }

  async onSubmit() {
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

    if (!this.targetWorkerId) {
      alert('Worker ID not found');
      return;
    }

    try {
      // Prepare update data
      const updateData: any = {
      email: this.workerData.email,
        firstname: this.workerData.firstName,
        lastname: this.workerData.lastName,
        birthDate: this.workerData.birthDate || null,
      };

      // Only update password if it was changed
      if (this.workerData.password && this.workerData.password.trim()) {
        updateData.pass = this.workerData.password;
      }

      // Update worker via API
      await firstValueFrom(this.apiService.updateUser(this.targetWorkerId, updateData));

    alert('Worker profile updated successfully!');
    this.router.navigate(['/admin-home']);
    } catch (error: any) {
      const errorMessage = error.message || 'Update failed';
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        this.emailError = errorMessage;
      } else {
        alert('Error updating worker profile: ' + errorMessage);
      }
    }
  }

  filterWorkerShifts() {
    // Navigate to worker shifts filter page
    this.router.navigate(['/filtershifts-worker'], {
      queryParams: { id: this.targetWorkerId },
    });
  }

  async deleteWorker() {
    if (
      !confirm(
        `Are you sure you want to delete this worker? This action cannot be undone.`
      )
    ) {
      return;
    }

    if (!this.targetWorkerId) {
      alert('Worker ID not found');
      return;
    }

    try {
      await firstValueFrom(this.apiService.deleteUser(this.targetWorkerId));
      alert('Worker deleted successfully!');
      this.router.navigate(['/admin-home']);
    } catch (error: any) {
      alert('Error deleting worker: ' + (error.message || 'Unknown error'));
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
