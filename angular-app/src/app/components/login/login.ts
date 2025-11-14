import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData = {
    username: '',
    password: '',
  };

  usernameError = '';
  passwordError = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    this.clearErrors();

    const result = await this.authService.login(this.loginData.username, this.loginData.password);

    if (result.success) {
      this.router.navigate([result.redirectUrl]);
    } else {
      if (result.errors?.username) {
        this.usernameError = result.errors.username;
      }
      if (result.errors?.password) {
        this.passwordError = result.errors.password;
      }
      if (result.errors?.general && !this.usernameError && !this.passwordError) {
        this.usernameError = result.errors.general;
      }
    }
  }

  private clearErrors() {
    this.usernameError = '';
    this.passwordError = '';
  }
}
