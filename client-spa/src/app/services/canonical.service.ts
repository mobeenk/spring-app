import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {
  private canonicalLink: HTMLLinkElement;

  constructor(private meta: Meta) {
    // Check if a canonical tag already exists
    this.canonicalLink = document.querySelector('link[rel=canonical]') as HTMLLinkElement;
    if (!this.canonicalLink) {
      // Create a new canonical tag if it doesn't exist
      this.canonicalLink = document.createElement('link');
      this.canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(this.canonicalLink);
    }
  }

  setCanonicalURL(url: string) {
    this.canonicalLink.setAttribute('href', url);
  }
}
