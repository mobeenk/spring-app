import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private log(method: string, url: string) {
    const side = this.isBrowser ? 'browser' : 'server';
    const msg = `[ApiService] [${side}] ${method.toUpperCase()} ${url}`;
    if (this.isBrowser) {
      console.debug(msg);
    } else {
      // Print to server terminal
      // eslint-disable-next-line no-console
      console.log(msg);
    }
  }

  get<T>(url: string, options?: object): Observable<T> {
    this.log('get', url);
    return this.http.get<T>(url, options);
  }

  post<T>(url: string, body: any, options?: object): Observable<T> {
    this.log('post', url);
    return this.http.post<T>(url, body, options);
  }

  put<T>(url: string, body: any, options?: object): Observable<T> {
    this.log('put', url);
    return this.http.put<T>(url, body, options);
  }

  delete<T>(url: string, options?: object): Observable<T> {
    this.log('delete', url);
    return this.http.delete<T>(url, options);
  }

  patch<T>(url: string, body: any, options?: object): Observable<T> {
    this.log('patch', url);
    return this.http.patch<T>(url, body, options);
  }
}
