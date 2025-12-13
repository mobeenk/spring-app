import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.baseUrl}auth/generateToken`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.authUrl, { username, password }, { responseType: 'text' as 'json' }).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          // Handle response as string (token directly) or object with token field
          const token = typeof response === 'string' ? response : (response?.token || response);
          if (token) {
            localStorage.setItem('authToken', token);
            this.isAuthenticatedSubject.next(true);
          }
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      this.isAuthenticatedSubject.next(false);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
