import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-edit-profile',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  currentUsername: string | null = null;

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
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication
    this.currentUsername = this.utilsService.checkAuth();
    if (!this.currentUsername) {
      this.router.navigate(['/login']);
      return;
    }

    // Load current user data
    this.loadUserData();
  }

  loadUserData() {
    const userData = this.utilsService.getUserData(this.currentUsername!);
    if (!userData) {
      alert('User data not found!');
      this.router.navigate(['/login']);
      return;
    }

    // Populate form with current user data
    this.profileData = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      confirmPassword: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
    };
  }

  onSubmit() {
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
    } else if (this.profileData.username !== this.currentUsername) {
      // Check if new username already exists
      const existingUser = this.utilsService.getUserData(this.profileData.username);
      if (existingUser) {
        this.usernameError = 'Username already exists';
        hasError = true;
      }
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

    // Get current user data
    const currentUserData = this.utilsService.getUserData(this.currentUsername!);

    // Update user data
    const updatedUserData = {
      ...currentUserData,
      email: this.profileData.email,
      username: this.profileData.username,
      password: this.profileData.password,
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      birthDate: this.profileData.birthDate,
      updatedAt: new Date().toISOString(),
    };

    // If username changed, need to update localStorage keys
    if (this.profileData.username !== this.currentUsername) {
      // Get all users
      const users = JSON.parse(localStorage.getItem('users') || '{}');

      // Remove old username
      delete users[this.currentUsername!];

      // Add new username
      users[this.profileData.username] = updatedUserData;
      localStorage.setItem('users', JSON.stringify(users));

      // Move shifts to new username
      const shifts = this.utilsService.getUserShifts(this.currentUsername!);
      localStorage.removeItem(`shifts_${this.currentUsername}`);
      this.utilsService.saveUserShifts(this.profileData.username, shifts);

      // Update session
      this.utilsService.clearUserSession();
      this.utilsService.setUserSession(this.profileData.username);
      this.currentUsername = this.profileData.username;
    } else {
      // Just update the user data
      this.utilsService.saveUserData(this.currentUsername!, updatedUserData);
    }

    alert('Profile updated successfully!');
    this.router.navigate(['/worker-home']);
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
