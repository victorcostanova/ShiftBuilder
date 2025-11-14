import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils';
import { AuthService } from '../../services/auth';
import { ShiftService } from '../../services/shift.service';
import { CommentService } from '../../services/comment.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-shift',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-shift.html',
  styleUrl: './add-shift.css',
})
export class AddShift implements OnInit {
  currentUsername: string | null = null;
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  isEditing = false;
  editingShiftId: string | null = null;
  existingCommentId: string | null = null;
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
    private shiftService: ShiftService,
    private commentService: CommentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Check authentication
    this.currentUsername = this.utilsService.checkAuth();
    this.currentUserId = this.authService.getCurrentUserId();
    if (!this.currentUsername || !this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin
    const userData = this.authService.getUserData();
    this.isAdmin = userData?.permission?.description === 'admin';

    // Check if editing existing shift
    this.route.queryParams.subscribe(async (params) => {
      const shiftId = params['id'] || params['slug']; // Support both id and slug for backward compatibility
      if (shiftId) {
        this.isEditing = true;
        this.editingShiftId = shiftId;
        await this.loadShiftData(shiftId);
      }
    });
  }

  async loadShiftData(shiftId: string) {
    try {
      const shift = await firstValueFrom(this.shiftService.getShiftById(shiftId));
      const convertedShift = this.shiftService.convertShiftFromApi(shift);

      // Get comments for this shift
      let commentsText = '';
      try {
        const userComments = await firstValueFrom(
          this.commentService.getUserComments(this.currentUserId!)
        );
        // Find comment related to this shift
        const shiftComment = userComments.find(
          (comment: any) => comment.shiftId?._id === shiftId || comment.shiftId === shiftId
        );
        if (shiftComment) {
          commentsText = shiftComment.description || '';
          this.existingCommentId = shiftComment._id;
        }
      } catch (error) {
        // Comments not found or error, continue
        console.error('Error loading comments:', error);
      }

      // Populate form with shift data
      this.shiftData = {
        date: convertedShift.date,
        startTime: convertedShift.startTime,
        endTime: convertedShift.endTime,
        hourlyWage: convertedShift.hourlyWage,
        workplace: convertedShift.workplace,
        slug: convertedShift.shiftName || convertedShift.slug || convertedShift._id,
        comments: commentsText,
      };
    } catch (error: any) {
      alert('Shift not found: ' + (error.message || 'Unknown error'));
      this.router.navigate(['/worker-home']);
    }
  }

  async onSubmit() {
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

    // Validate shift name (required and unique)
    if (!this.shiftData.slug || !this.shiftData.slug.trim()) {
      this.shiftSlugError = 'Shift name is required';
      hasError = true;
    }

    if (hasError) {
      return;
    }

    this.isLoading = true;

    try {
      await this.saveShift();

      const message = this.isEditing ? 'Shift updated successfully!' : 'Shift added successfully!';
      alert(message);
      this.router.navigate(['/worker-home']);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      // Check if error is about duplicate shift name
      if (
        errorMessage.includes('Shift name already exists') ||
        errorMessage.includes('already exists')
      ) {
        this.shiftSlugError = 'This shift name already exists. Please choose a different name.';
      } else {
        alert('Error saving shift: ' + errorMessage);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async saveShift() {
    if (!this.currentUserId) {
      throw new Error('User ID not found');
    }

    const shiftPayload = {
      date: this.shiftData.date,
      startTime: this.shiftData.startTime,
      endTime: this.shiftData.endTime,
      hourlyWage: this.shiftData.hourlyWage,
      workplace: this.shiftData.workplace,
      shiftName: this.shiftData.slug.trim(), // Use slug as shiftName
      slug: this.shiftData.slug.trim(), // Keep for backward compatibility
    };

    let savedShift: any;

    if (this.isEditing && this.editingShiftId) {
      // Update existing shift
      savedShift = await firstValueFrom(
        this.shiftService.updateShift(this.editingShiftId, shiftPayload)
      );
    } else {
      // Add new shift
      savedShift = await firstValueFrom(
        this.shiftService.addShift(this.currentUserId, shiftPayload)
      );
    }

    // If there's a comment, save it separately in the comments table
    if (this.shiftData.comments && this.shiftData.comments.trim()) {
      try {
        const shiftId = savedShift._id || savedShift.id;

        if (this.existingCommentId && this.isEditing) {
          // Update existing comment
          await firstValueFrom(
            this.commentService.updateComment(this.existingCommentId, this.shiftData.comments)
          );
        } else {
          // Create new comment
          await firstValueFrom(
            this.commentService.createComment(this.currentUserId, this.shiftData.comments, shiftId)
          );
        }
      } catch (error) {
        // Comment creation/update failed, but shift was saved
        console.error('Error saving comment:', error);
      }
    } else if (this.existingCommentId && this.isEditing) {
      // If comment was removed, delete it
      try {
        await firstValueFrom(this.commentService.deleteComment(this.existingCommentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }

    return savedShift;
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
