import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ShiftService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all shifts for a specific user
   */
  getUserShifts(userId: string): Observable<any[]> {
    // Use the dedicated endpoint for getting shifts by userId
    return this.apiService.getShiftsByUserId(userId).pipe(
      map((shifts: any[]) => shifts || []),
      catchError(() => of([]))
    );
  }

  /**
   * Get all shifts (admin only)
   */
  getAllShifts(): Observable<any[]> {
    return this.apiService.getAllShifts().pipe(
      map((shifts: any[]) => shifts || []),
      catchError(() => of([]))
    );
  }

  /**
   * Add a new shift
   */
  addShift(userId: string, shiftData: any): Observable<any> {
    // Convert date and time to ISO format for start and end
    const startDateTime = this.combineDateAndTime(shiftData.date, shiftData.startTime);
    const endDateTime = this.combineDateAndTime(shiftData.date, shiftData.endTime);

    const shiftPayload = {
      start: startDateTime,
      end: endDateTime,
      perHour: shiftData.hourlyWage,
      place: shiftData.workplace,
      shiftName: shiftData.shiftName || shiftData.slug, // Use shiftName or slug as fallback
    };

    return this.apiService.addShift(userId, shiftPayload);
  }

  /**
   * Update an existing shift
   */
  updateShift(shiftId: string, shiftData: any): Observable<any> {
    const shiftPayload: any = {};

    if (shiftData.date && shiftData.startTime) {
      shiftPayload.start = this.combineDateAndTime(shiftData.date, shiftData.startTime);
    }
    if (shiftData.date && shiftData.endTime) {
      shiftPayload.end = this.combineDateAndTime(shiftData.date, shiftData.endTime);
    }
    if (shiftData.hourlyWage !== undefined) {
      shiftPayload.perHour = shiftData.hourlyWage;
    }
    if (shiftData.workplace) {
      shiftPayload.place = shiftData.workplace;
    }
    if (shiftData.shiftName !== undefined || shiftData.slug !== undefined) {
      shiftPayload.shiftName = shiftData.shiftName || shiftData.slug;
    }

    return this.apiService.updateShift(shiftId, shiftPayload);
  }

  /**
   * Delete a shift
   */
  deleteShift(shiftId: string): Observable<any> {
    return this.apiService.deleteShift(shiftId);
  }

  /**
   * Get shift by ID
   */
  getShiftById(shiftId: string): Observable<any> {
    return this.apiService.getShiftById(shiftId);
  }

  /**
   * Combine date and time into ISO string
   */
  private combineDateAndTime(date: string, time: string): string {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toISOString();
  }

  /**
   * Convert shift from API format to frontend format
   */
  convertShiftFromApi(shift: any): any {
    const startDate = new Date(shift.start);
    const endDate = new Date(shift.end);

    return {
      _id: shift._id,
      date: startDate.toISOString().split('T')[0],
      startTime: this.formatTime(startDate),
      endTime: this.formatTime(endDate),
      hourlyWage: shift.perHour,
      workplace: shift.place,
      shiftName: shift.shiftName || '',
      slug: shift.shiftName || shift._id, // Use shiftName as slug, fallback to _id
      userId: shift.userId?._id || shift.userId,
      createdAt: shift.created,
      updatedAt: shift.updated,
    };
  }

  /**
   * Format time from Date to HH:MM
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

