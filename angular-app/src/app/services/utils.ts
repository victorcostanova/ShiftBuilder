import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * Check if user is logged in
   */
  checkAuth(): string | null {
    const session = localStorage.getItem('userSession');
    if (!session) {
      return null;
    }

    const sessionData = JSON.parse(session);
    const sessionTime = new Date(sessionData.timestamp);
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - sessionTime.getTime()) / (1000 * 60);

    // Session expires after 60 minutes
    if (diffInMinutes > 60) {
      localStorage.removeItem('userSession');
      return null;
    }

    return sessionData.username;
  }

  /**
   * Set user session
   */
  setUserSession(username: string): void {
    const sessionData = {
      username: username,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
  }

  /**
   * Clear user session
   */
  clearUserSession(): void {
    localStorage.removeItem('userSession');
  }

  /**
   * Get user data
   */
  getUserData(username: string): any {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users[username] || null;
  }

  /**
   * Save user data
   */
  saveUserData(username: string, userData: any): void {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[username] = userData;
    localStorage.setItem('users', JSON.stringify(users));
  }

  /**
   * Get all shifts for a user
   */
  getUserShifts(username: string): any[] {
    const shifts = JSON.parse(localStorage.getItem(`shifts_${username}`) || '[]');
    return shifts;
  }

  /**
   * Save shifts for a user
   */
  saveUserShifts(username: string, shifts: any[]): void {
    localStorage.setItem(`shifts_${username}`, JSON.stringify(shifts));
  }

  /**
   * Validation functions
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUsername(username: string): { valid: boolean; message: string } {
    if (username.length < 6) {
      return {
        valid: false,
        message: 'Username must be at least 6 characters long',
      };
    }

    const hasLetter = /[a-zA-Z]/.test(username);
    const hasNumber = /[0-9]/.test(username);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(username);

    if (!hasLetter) {
      return {
        valid: false,
        message: 'Username must contain at least one letter',
      };
    }

    if (!hasNumber) {
      return {
        valid: false,
        message: 'Username must contain at least one number',
      };
    }

    if (!hasSpecialChar) {
      return {
        valid: false,
        message: 'Username must contain at least one special character',
      };
    }

    return { valid: true, message: '' };
  }

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
      return {
        valid: false,
        message: 'Password must be at least 6 characters long',
      };
    }
    return { valid: true, message: '' };
  }

  validateName(name: string, minLength: number = 2): { valid: boolean; message: string } {
    const nameRegex = /^[a-zA-Z]+$/;
    if (name.length < minLength) {
      return {
        valid: false,
        message: `Name must be at least ${minLength} letters`,
      };
    }
    if (!nameRegex.test(name)) {
      return { valid: false, message: 'Name must contain only letters' };
    }
    return { valid: true, message: '' };
  }

  validateAge(birthDate: string): { valid: boolean; message: string; age?: number } {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 6 || age > 130) {
      return { valid: false, message: 'Age must be between 6 and 130' };
    }
    return { valid: true, message: '', age: age };
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format time to HH:MM
   */
  formatTime(time: string): string {
    return time;
  }

  /**
   * Calculate hours between two times
   */
  calculateHours(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let hours = endHour - startHour;
    let minutes = endMin - startMin;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    return hours + minutes / 60;
  }

  /**
   * Calculate total profit
   */
  calculateProfit(startTime: string, endTime: string, hourlyWage: number): string {
    const hours = this.calculateHours(startTime, endTime);
    return (hours * parseFloat(hourlyWage.toString())).toFixed(2);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  }

  /**
   * Check if username already exists
   */
  isUsernameExists(username: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users.hasOwnProperty(username);
  }

  /**
   * Check if email already exists
   */
  isEmailExists(email: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return Object.values(users).some((user: any) => user.email === email);
  }
}
