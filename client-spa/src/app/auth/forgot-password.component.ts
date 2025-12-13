import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  private apiUrl = `${environment.baseUrl}auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.toastr.warning('Please enter your email address', 'Validation');
      return;
    }

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/forgot-password`, { email: this.email }, { 
      responseType: 'text' 
    }).subscribe({
      next: (response) => {
        this.toastr.success('Password reset code has been sent to your email', 'Success');
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.toastr.error('No user found with this email', 'Error');
        } else {
          this.toastr.error('Failed to send reset code', 'Error');
        }
        console.error('Error:', error);
      }
    });
  }
}
