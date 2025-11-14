import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Get authorization headers with token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get token from localStorage
   */
  private getToken(): string | null {
    const session = localStorage.getItem('userSession');
    if (session) {
      const sessionData = JSON.parse(session);
      return sessionData.token || null;
    }
    return null;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.error || error.message || `Error Code: ${error.status}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // User endpoints
  createUser(userData: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/user`, userData)
      .pipe(catchError(this.handleError));
  }

  createAdmin(adminData: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/user/admin`, adminData)
      .pipe(catchError(this.handleError));
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/user/login`, {
        username,
        pass: password,
      })
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/user/logout`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserById(userId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http
      .patch(`${this.baseUrl}/user/${userId}`, { user: userData }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/user`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteUser(userId: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/user/${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Shift endpoints
  addShift(userId: string, shiftData: any): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/shifts`,
        {
          _id: userId,
          shift: shiftData,
        },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  getShiftById(shiftId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/shifts?_id=${shiftId}`)
      .pipe(catchError(this.handleError));
  }

  updateShift(shiftId: string, shiftData: any): Observable<any> {
    return this.http
      .patch(
        `${this.baseUrl}/shifts`,
        {
          _id: shiftId,
          shift: shiftData,
        },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  getAllShifts(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/shifts`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getShiftsByUserId(userId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/shifts?userId=${userId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteShift(shiftId: string): Observable<any> {
    return this.http
      .request('delete', `${this.baseUrl}/shifts`, {
        headers: this.getAuthHeaders(),
        body: { _id: shiftId, user: {} },
      })
      .pipe(catchError(this.handleError));
  }

  // Comment endpoints
  createComment(commentData: any): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/comment`,
        { comment: commentData },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  getCommentById(commentId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/comment/${commentId}`)
      .pipe(catchError(this.handleError));
  }

  getAllUserComments(userId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/comment/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateComment(commentId: string, commentData: any): Observable<any> {
    return this.http
      .patch(
        `${this.baseUrl}/comment`,
        {
          _id: commentId,
          comment: commentData,
        },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  getAllComments(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/comment`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/comment/${commentId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}

