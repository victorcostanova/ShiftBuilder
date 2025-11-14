import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  loginData = {
    username: '',
    password: '',
  };

  usernameError = '';
  passwordError = '';
  networkError = '';

  constructor(private authService: AuthService, private router: Router) {
    // Log network status on component load
    const isInternal = this.authService.isInternalNetwork();
    console.log('🔒 Admin Login - Network Check:', {
      hostname: window.location.hostname,
      isInternal: isInternal,
      url: window.location.href,
    });
  }

  async onSubmit() {
    this.clearErrors();

    const result = await this.authService.adminLogin(
      this.loginData.username,
      this.loginData.password
    );

    if (result.success) {
      this.router.navigate([result.redirectUrl]);
    } else {
      if (result.errors?.network) {
        this.networkError = result.errors.network;
      }
      if (result.errors?.username) {
        this.usernameError = result.errors.username;
      }
      if (result.errors?.password) {
        this.passwordError = result.errors.password;
      }
      if (
        result.errors?.general &&
        !this.networkError &&
        !this.usernameError &&
        !this.passwordError
      ) {
        this.usernameError = result.errors.general;
      }
    }
  }

  private clearErrors() {
    this.usernameError = '';
    this.passwordError = '';
    this.networkError = '';
  }
}
