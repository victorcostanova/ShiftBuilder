import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin123!',
    password: 'admin123',
  };

  constructor(private router: Router) {}

  /**
   * Check if credentials match the fixed admin account
   */
  private isAdminAccount(username: string, password: string): boolean {
    return (
      username === this.ADMIN_CREDENTIALS.username && password === this.ADMIN_CREDENTIALS.password
    );
  }

  /**
   * Validate username and password
   */
  private validateCredentials(username: string, password: string): { valid: boolean; errors: any } {
    const errors: any = {};

    const usernameValidation = this.validateUsername(username);
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.message;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate username
   */
  private validateUsername(username: string): { valid: boolean; message: string } {
    if (!username || username.trim().length === 0) {
      return { valid: false, message: 'Username is required' };
    }
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validate password
   */
  private validatePassword(password: string): { valid: boolean; message: string } {
    if (!password || password.length === 0) {
      return { valid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Attempt to login with given credentials
   */
  login(
    username: string,
    password: string
  ): { success: boolean; redirectUrl?: string; errors?: any } {
    // Validate credentials first
    const validation = this.validateCredentials(username, password);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Check hardcoded admin account first
    if (this.isAdminAccount(username, password)) {
      this.setUserSession(username);
      return {
        success: true,
        redirectUrl: '/admin-home',
      };
    }

    // Check localStorage admin account
    const userData = this.getUserData(username);
    if (userData && userData.isAdmin && userData.password === password) {
      this.setUserSession(username);
      return {
        success: true,
        redirectUrl: '/admin-home',
      };
    }

    // Check regular user account
    if (!userData) {
      return {
        success: false,
        errors: { username: 'User does not exist. Please register first.' },
      };
    }

    if (userData.password !== password) {
      return {
        success: false,
        errors: { password: 'Incorrect password' },
      };
    }

    this.setUserSession(username);
    return {
      success: true,
      redirectUrl: '/worker-home',
    };
  }

  /**
   * Handle password reset process
   */
  resetPassword(username: string): boolean {
    if (!username) {
      alert('Please enter your username first');
      return false;
    }

    if (username === this.ADMIN_CREDENTIALS.username) {
      alert('Cannot reset admin account password');
      return false;
    }

    const userData = this.getUserData(username);
    if (!userData) {
      alert('User does not exist');
      return false;
    }

    const confirmed = confirm(
      'WARNING: Resetting your password will delete all user data. Are you sure you want to continue?'
    );

    if (confirmed) {
      this.deleteUserData(username);
      alert('All user data has been deleted. Please register again.');
      this.router.navigate(['/register']);
      return true;
    }
    return false;
  }

  /**
   * Reset all data
   */
  resetAllData(): void {
    localStorage.clear();
  }

  /**
   * Delete user data from localStorage
   */
  private deleteUserData(username: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem(`shifts_${username}`);
  }

  /**
   * Set user session
   */
  private setUserSession(username: string): void {
    const sessionData = {
      username: username,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
  }

  /**
   * Check existing session and redirect if valid
   */
  checkExistingSession(): string | null {
    const session = localStorage.getItem('userSession');
    if (!session) return null;

    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - sessionTime.getTime()) / (1000 * 60);

    if (diffInMinutes <= 60) {
      return this.getRedirectUrl(sessionData.username);
    }
    return null;
  }

  /**
   * Get redirect URL based on user type
   */
  private getRedirectUrl(username: string): string | null {
    if (username === this.ADMIN_CREDENTIALS.username) {
      return '/admin-home';
    }

    const userData = this.getUserData(username);
    if (userData && userData.isAdmin) {
      return '/admin-home';
    }

    return userData ? '/worker-home' : null;
  }

  /**
   * Get user data from localStorage
   */
  getUserData(username: string): any {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users[username] || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const session = localStorage.getItem('userSession');
    if (!session) return false;

    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - sessionTime.getTime()) / (1000 * 60);

    return diffInMinutes <= 60;
  }

  /**
   * Get current user
   */
  getCurrentUser(): string | null {
    const session = localStorage.getItem('userSession');
    if (!session) return null;

    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - sessionTime.getTime()) / (1000 * 60);

    return diffInMinutes <= 60 ? sessionData.username : null;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('userSession');
    this.router.navigate(['/login']);
  }
}
