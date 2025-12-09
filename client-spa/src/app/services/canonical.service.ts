import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {
  private canonicalLink: HTMLLinkElement | null = null;

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanonicalLink();
    }
  }
  private initializeCanonicalLink(): void {
    // Check if a canonical tag already exists in the document
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!this.canonicalLink) {
      this.canonicalLink = document.createElement('link');
      this.canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(this.canonicalLink);
    }
  }

  setCanonicalURL(url: string): void {
    // On server: use Angular's Meta service to set canonical tag in the head
    // On browser: use DOM manipulation
    
    if (!isPlatformBrowser(this.platformId)) {
      // Server-side: use Meta service
      this.meta.updateTag({
        rel: 'canonical',
        href: url
      });
      return;
    }

    // Client-side: use DOM
    if (!this.canonicalLink) {
      this.initializeCanonicalLink();
    }

    if (this.canonicalLink) {
      this.canonicalLink.setAttribute('href', url);
    }
  }

}
