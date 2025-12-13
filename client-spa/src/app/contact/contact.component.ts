import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CanonicalService } from '../services/canonical.service';
import { environment } from '../../environments/environment';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };
  isSubmitting: boolean = false;
  private apiUrl = `${environment.baseUrl}contact/submit`;

  constructor(
    private canonicalService: CanonicalService,
    private http: HttpClient,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ){
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }
  
  ngOnInit(): void {
   // throw new Error('Method not implemented.');
  }

  onSubmit(): void {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    if (!this.isValidEmail(this.contactForm.email)) {
      this.toastr.error('Please enter a valid email address', 'Invalid Email');
      return;
    }

    this.isSubmitting = true;

    this.http.post(this.apiUrl, this.contactForm, {
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.toastr.success('Thank you! Your message has been sent successfully.', 'Success');
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error('Failed to send message. Please try again later.', 'Error');
        console.error('Contact form error:', error);
      }
    });
  }

  resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  setCanonicalURL() {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }
}
