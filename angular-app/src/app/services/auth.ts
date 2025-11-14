import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router, private apiService: ApiService) {}

  /**
   * Check if the current environment is localhost/internal network
   */
  isInternalNetwork(): boolean {
    const hostname = window.location.hostname;
    const localHosts = ['localhost', '127.0.0.1', '::1'];

    return (
      localHosts.includes(hostname) ||
      /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
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
   * Attempt to login with given credentials (for regular users)
   */
  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; redirectUrl?: string; errors?: any }> {
    // Validate credentials first
    const validation = this.validateCredentials(username, password);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const response = await firstValueFrom(this.apiService.login(username, password));
      
      // Check if user is admin (should use admin login)
      if (response.user?.permission?.description === 'admin') {
      return {
        success: false,
        errors: { username: 'Please use the admin login page to access administrator accounts.' },
      };
    }

      // Save session with token
      this.setUserSession(response.user.username, response.token, response.user);
      
      return {
        success: true,
        redirectUrl: '/worker-home',
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      return {
        success: false,
        errors: { 
          username: errorMessage.includes('username') ? errorMessage : undefined,
          password: errorMessage.includes('password') || errorMessage.includes('Invalid') ? errorMessage : undefined,
          general: errorMessage
        },
    };
    }
  }

  /**
   * Attempt to login as admin with given credentials
   */
  async adminLogin(
    username: string,
    password: string
  ): Promise<{ success: boolean; redirectUrl?: string; errors?: any }> {
    // Check if user is on internal network
    if (!this.isInternalNetwork()) {
      return {
        success: false,
        errors: { network: 'Admin access is only available from internal network (localhost).' },
      };
    }

    // Validate credentials first
    const validation = this.validateCredentials(username, password);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    try {
      const response = await firstValueFrom(this.apiService.login(username, password));
      
      // Verify user is admin
      if (response.user?.permission?.description !== 'admin') {
      return {
        success: false,
        errors: { username: 'This account is not an administrator account.' },
      };
    }

      // Save session with token
      console.log('Admin login - User data:', response.user);
      console.log('Admin login - Permission:', response.user.permission);
      this.setUserSession(response.user.username, response.token, response.user);
      
      return {
        success: true,
        redirectUrl: '/admin-home',
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      return {
        success: false,
        errors: { 
          username: errorMessage.includes('username') || errorMessage.includes('Invalid') ? errorMessage : undefined,
          password: errorMessage.includes('password') || errorMessage.includes('Invalid') ? errorMessage : undefined,
          network: errorMessage.includes('network') ? errorMessage : undefined,
          general: errorMessage
        },
    };
    }
  }

  /**
   * Handle password reset process
   */
  resetPassword(username: string): boolean {
    if (!username) {
      alert('Please enter your username first');
      return false;
    }

    const userData = this.getUserData(username);
    if (!userData) {
      alert('User does not exist');
      return false;
    }

    // Prevent reset of admin accounts
    if (userData.isAdmin) {
      alert('Cannot reset admin account password from this page');
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
   * Set user session with token
   */
  setUserSession(username: string, token: string, userData: any): void {
    const sessionData = {
      username: username,
      token: token,
      userId: userData._id,
      userData: userData,
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
    const session = localStorage.getItem('userSession');
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.userData?.permission?.description === 'admin') {
      return '/admin-home';
    }
      return '/worker-home';
    }
    return null;
  }

  /**
   * Get user data from session or by fetching from API
   */
  getUserData(username?: string): any {
    const session = localStorage.getItem('userSession');
    if (session) {
      const sessionData = JSON.parse(session);
      if (!username || sessionData.username === username) {
        return sessionData.userData || null;
      }
    }
    return null;
  }

  /**
   * Get current user ID from session
   */
  getCurrentUserId(): string | null {
    const session = localStorage.getItem('userSession');
    if (session) {
      const sessionData = JSON.parse(session);
      return sessionData.userId || null;
    }
    return null;
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
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.logout());
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }
    localStorage.removeItem('userSession');
    this.router.navigate(['/login']);
  }
}
