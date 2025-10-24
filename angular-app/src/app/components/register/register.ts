import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';

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

  constructor(private utilsService: UtilsService, private router: Router) {}

  onSubmit() {
    this.clearErrors();

    let hasError = false;

    // Validate email
    if (!this.utilsService.validateEmail(this.registerData.email)) {
      this.emailError = 'Please enter a valid email address';
      hasError = true;
    }

    // Check if email already exists
    if (this.utilsService.isEmailExists(this.registerData.email)) {
      this.emailError = 'Email already exists';
      hasError = true;
    }

    // Validate username
    const usernameValidation = this.utilsService.validateUsername(this.registerData.username);
    if (!usernameValidation.valid) {
      this.usernameError = usernameValidation.message;
      hasError = true;
    }

    // Check if username already exists
    if (this.utilsService.isUsernameExists(this.registerData.username)) {
      this.usernameError = 'Username already exists';
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

    // Create user data
    const userData = {
      email: this.registerData.email,
      username: this.registerData.username,
      password: this.registerData.password,
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      birthDate: this.registerData.birthDate,
      isAdmin: false,
      registeredAt: new Date().toISOString(),
    };

    // Save user data
    this.utilsService.saveUserData(this.registerData.username, userData);
    this.utilsService.setUserSession(this.registerData.username);

    alert('Registration successful! Welcome to Manage My Shifts!');
    this.router.navigate(['/worker-home']);
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
