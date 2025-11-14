import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  currentUsername: string | null = null;
  currentUserId: string | null = null;
  isAdmin: boolean = false;

  profileData = {
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  };

  emailError = '';
  usernameError = '';
  passwordError = '';
  confirmPasswordError = '';
  firstNameError = '';
  lastNameError = '';
  birthDateError = '';

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check authentication
    this.currentUsername = this.utilsService.checkAuth();
    this.currentUserId = this.authService.getCurrentUserId();
    if (!this.currentUsername || !this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin
    const userData = this.authService.getUserData();
    this.isAdmin = userData?.permission?.description === 'admin';

    // Load current user data
    await this.loadUserData();
  }

  async loadUserData() {
    try {
      const userData = await firstValueFrom(this.apiService.getUserById(this.currentUserId!));
      
      // Format birthDate for input type="date" (YYYY-MM-DD)
      let formattedBirthDate = '';
      if (userData.birthDate) {
        const birthDate = new Date(userData.birthDate);
        if (!isNaN(birthDate.getTime())) {
          const year = birthDate.getFullYear();
          const month = String(birthDate.getMonth() + 1).padStart(2, '0');
          const day = String(birthDate.getDate()).padStart(2, '0');
          formattedBirthDate = `${year}-${month}-${day}`;
        }
    }

    // Populate form with current user data
    this.profileData = {
        email: userData.email || '',
        username: userData.username || '',
        password: '', // Don't load password
        confirmPassword: '',
        firstName: userData.firstname || '',
        lastName: userData.lastname || '',
        birthDate: formattedBirthDate,
      };
    } catch (error: any) {
      alert('Error loading user data: ' + (error.message || 'Unknown error'));
      this.router.navigate(['/login']);
    }
  }

  async onSubmit() {
    this.clearErrors();

    let hasError = false;

    // Validate email
    if (!this.utilsService.validateEmail(this.profileData.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }

    // Validate username
    const usernameValidation = this.utilsService.validateUsername(this.profileData.username);
    if (!usernameValidation.valid) {
      this.usernameError = usernameValidation.message;
      hasError = true;
    }

    // Validate password
    const passwordValidation = this.utilsService.validatePassword(this.profileData.password);
    if (!passwordValidation.valid) {
      this.passwordError = passwordValidation.message;
      hasError = true;
    }

    // Validate password confirmation
    if (this.profileData.password !== this.profileData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    // Validate first name
    const firstNameValidation = this.utilsService.validateName(this.profileData.firstName);
    if (!firstNameValidation.valid) {
      this.firstNameError = firstNameValidation.message;
      hasError = true;
    }

    // Validate last name
    const lastNameValidation = this.utilsService.validateName(this.profileData.lastName);
    if (!lastNameValidation.valid) {
      this.lastNameError = lastNameValidation.message;
      hasError = true;
    }

    // Validate age
    if (!this.profileData.birthDate) {
      this.birthDateError = 'Please enter your birth date';
      hasError = true;
    } else {
      const ageValidation = this.utilsService.validateAge(this.profileData.birthDate);
      if (!ageValidation.valid) {
        this.birthDateError = ageValidation.message;
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    if (!this.currentUserId) {
      alert('User ID not found');
      return;
    }

    try {
      // Prepare update data
      const updateData: any = {
      email: this.profileData.email,
      username: this.profileData.username,
        firstname: this.profileData.firstName,
        lastname: this.profileData.lastName,
        birthDate: this.profileData.birthDate || null,
      };

      // Only update password if it was changed
      if (this.profileData.password && this.profileData.password.trim()) {
        updateData.pass = this.profileData.password;
      }

      // Update user via API
      await firstValueFrom(this.apiService.updateUser(this.currentUserId, updateData));

      // Update session if username changed
    if (this.profileData.username !== this.currentUsername) {
        // Reload user data to get updated info
        const updatedUser = await firstValueFrom(this.apiService.getUserById(this.currentUserId));
        const session = localStorage.getItem('userSession');
        if (session) {
          const sessionData = JSON.parse(session);
          sessionData.username = updatedUser.username;
          sessionData.userData = updatedUser;
          localStorage.setItem('userSession', JSON.stringify(sessionData));
        }
      this.currentUsername = this.profileData.username;
    }

    alert('Profile updated successfully!');
    this.router.navigate(['/worker-home']);
    } catch (error: any) {
      const errorMessage = error.message || 'Update failed';
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        this.emailError = errorMessage;
      } else if (errorMessage.includes('username') || errorMessage.includes('Username')) {
        this.usernameError = errorMessage;
      } else {
        alert('Error updating profile: ' + errorMessage);
      }
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
    this.usernameError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.birthDateError = '';
  }
}
