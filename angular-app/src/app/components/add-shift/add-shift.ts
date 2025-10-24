import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-add-shift',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-shift.html',
  styleUrl: './add-shift.css',
})
export class AddShift implements OnInit {
  currentUsername: string | null = null;
  isEditing = false;
  editingSlug: string | null = null;
  isLoading = false;

  shiftData = {
    date: '',
    startTime: '',
    endTime: '',
    hourlyWage: 0,
    workplace: '',
    slug: '',
    comments: '',
  };

  shiftDateError = '';
  startTimeError = '';
  endTimeError = '';
  hourlyWageError = '';
  workplaceError = '';
  shiftSlugError = '';

  constructor(
    private utilsService: UtilsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check authentication
    this.currentUsername = this.utilsService.checkAuth();
    if (!this.currentUsername) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if editing existing shift
    this.route.queryParams.subscribe((params) => {
      this.editingSlug = params['slug'];
      if (this.editingSlug) {
        this.isEditing = true;
        this.loadShiftData(this.editingSlug);
      }
    });
  }

  loadShiftData(slug: string) {
    const shifts = this.utilsService.getUserShifts(this.currentUsername!);
    const shift = shifts.find((s: any) => s.slug === slug);

    if (!shift) {
      alert('Shift not found!');
      this.router.navigate(['/worker-home']);
      return;
    }

    // Populate form with shift data
    this.shiftData = {
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      hourlyWage: shift.hourlyWage,
      workplace: shift.workplace,
      slug: shift.slug,
      comments: shift.comments || '',
    };
  }

  onSubmit() {
    this.clearErrors();

    let hasError = false;

    // Validate date
    if (!this.shiftData.date) {
      this.shiftDateError = 'Date is required';
      hasError = true;
    }

    // Validate start time
    if (!this.shiftData.startTime) {
      this.startTimeError = 'Start time is required';
      hasError = true;
    }

    // Validate end time
    if (!this.shiftData.endTime) {
      this.endTimeError = 'End time is required';
      hasError = true;
    } else if (this.shiftData.startTime && this.shiftData.endTime <= this.shiftData.startTime) {
      this.endTimeError = 'End time must be after start time';
      hasError = true;
    }

    // Validate hourly wage
    if (!this.shiftData.hourlyWage || this.shiftData.hourlyWage <= 0) {
      this.hourlyWageError = 'Please enter a valid hourly wage';
      hasError = true;
    }

    // Validate workplace
    if (!this.shiftData.workplace) {
      this.workplaceError = 'Please select a workplace';
      hasError = true;
    }

    // Validate shift slug
    if (!this.shiftData.slug) {
      this.shiftSlugError = 'Shift name is required';
      hasError = true;
    } else if (!this.isEditing) {
      // Check if slug already exists (only when creating new shift)
      const shifts = this.utilsService.getUserShifts(this.currentUsername!);
      const slugExists = shifts.some((shift: any) => shift.slug === this.shiftData.slug);
      if (slugExists) {
        this.shiftSlugError = 'This shift name already exists. Please choose a different name.';
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    this.isLoading = true;

    // Simulate saving delay
    setTimeout(() => {
      this.saveShift();
      this.isLoading = false;

      const message = this.isEditing ? 'Shift updated successfully!' : 'Shift added successfully!';
      alert(message);
      this.router.navigate(['/worker-home']);
    }, 500);
  }

  saveShift() {
    const shifts = this.utilsService.getUserShifts(this.currentUsername!);
    const shiftData = {
      ...this.shiftData,
      createdAt: this.isEditing ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isEditing) {
      // Update existing shift
      const index = shifts.findIndex((s: any) => s.slug === this.editingSlug);
      if (index !== -1) {
        shifts[index] = { ...shifts[index], ...shiftData };
      }
    } else {
      // Add new shift
      shifts.push(shiftData);
    }

    this.utilsService.saveUserShifts(this.currentUsername!, shifts);
  }

  logout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  private clearErrors() {
    this.shiftDateError = '';
    this.startTimeError = '';
    this.endTimeError = '';
    this.hourlyWageError = '';
    this.workplaceError = '';
    this.shiftSlugError = '';
  }
}
