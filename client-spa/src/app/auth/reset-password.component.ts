import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  resetCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  private apiUrl = `${environment.baseUrl}auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onSubmit(): void {
    if (!this.email || !this.resetCode || !this.newPassword || !this.confirmPassword) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match', 'Validation');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastr.warning('Password must be at least 6 characters', 'Validation');
      return;
    }

    this.isLoading = true;

    const request = {
      email: this.email,
      resetCode: this.resetCode,
      newPassword: this.newPassword
    };

    this.http.post(`${this.apiUrl}/reset-password`, request, { 
      responseType: 'text' 
    }).subscribe({
      next: (response) => {
        this.toastr.success('Password reset successfully! You can now login', 'Success');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.toastr.error(error.error || 'Invalid or expired reset code', 'Error');
        } else {
          this.toastr.error('Failed to reset password', 'Error');
        }
        console.error('Error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
