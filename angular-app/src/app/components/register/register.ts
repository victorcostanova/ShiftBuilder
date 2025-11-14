import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerData = {
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
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.clearErrors();

    let hasError = false;

    // Validate email
    if (!this.utilsService.validateEmail(this.registerData.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }

    // Validate username
    const usernameValidation = this.utilsService.validateUsername(this.registerData.username);
    if (!usernameValidation.valid) {
      this.usernameError = usernameValidation.message;
      hasError = true;
    }

    // Validate password
    const passwordValidation = this.utilsService.validatePassword(this.registerData.password);
    if (!passwordValidation.valid) {
      this.passwordError = passwordValidation.message;
      hasError = true;
    }

    // Validate password confirmation
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasError = true;
    }

    // Validate first name
    const firstNameValidation = this.utilsService.validateName(this.registerData.firstName);
    if (!firstNameValidation.valid) {
      this.firstNameError = firstNameValidation.message;
      hasError = true;
    }

    // Validate last name
    const lastNameValidation = this.utilsService.validateName(this.registerData.lastName);
    if (!lastNameValidation.valid) {
      this.lastNameError = lastNameValidation.message;
      hasError = true;
    }

    // Validate age
    if (!this.registerData.birthDate) {
      this.birthDateError = 'Please enter birth date';
      hasError = true;
    } else {
      const ageValidation = this.utilsService.validateAge(this.registerData.birthDate);
      if (!ageValidation.valid) {
        this.birthDateError = ageValidation.message;
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    // Create user data for API
    const userData = {
      email: this.registerData.email,
      username: this.registerData.username,
      pass: this.registerData.password,
      firstname: this.registerData.firstName,
      lastname: this.registerData.lastName,
      birthDate: this.registerData.birthDate || null,
    };

    try {
      // Register user via API
      const response = await firstValueFrom(this.apiService.createUser(userData));

      // Auto-login after registration
      const loginResponse = await firstValueFrom(
        this.apiService.login(this.registerData.username, this.registerData.password)
      );
      
      // Save session
      this.authService.setUserSession(
        loginResponse.user.username,
        loginResponse.token,
        loginResponse.user
      );

    alert('Registration successful! Welcome to Manage My Shifts!');
    this.router.navigate(['/worker-home']);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        this.emailError = errorMessage;
      } else if (errorMessage.includes('username') || errorMessage.includes('Username')) {
        this.usernameError = errorMessage;
      } else {
        alert('Registration failed: ' + errorMessage);
      }
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
