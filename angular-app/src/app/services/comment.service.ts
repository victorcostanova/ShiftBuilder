import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private apiService: ApiService) {}

  /**
   * Create a comment
   */
  createComment(userId: string, description: string, shiftId?: string): Observable<any> {
    return this.apiService.createComment({
      userId,
      shiftId: shiftId || null,
      description,
    });
  }

  /**
   * Get all comments for a user
   */
  getUserComments(userId: string): Observable<any[]> {
    return this.apiService.getAllUserComments(userId).pipe(
      map((comments: any[]) => comments || []),
      catchError(() => of([]))
    );
  }

  /**
   * Get all comments (admin only)
   */
  getAllComments(): Observable<any[]> {
    return this.apiService.getAllComments().pipe(
      map((comments: any[]) => comments || []),
      catchError(() => of([]))
    );
  }

  /**
   * Update a comment
   */
  updateComment(commentId: string, description: string): Observable<any> {
    return this.apiService.updateComment(commentId, {
      description,
    });
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string): Observable<any> {
    return this.apiService.deleteComment(commentId);
  }

  /**
   * Get comment by ID
   */
  getCommentById(commentId: string): Observable<any> {
    return this.apiService.getCommentById(commentId);
  }
}

