import { Injectable, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentDirection: 'ltr' | 'rtl' = 'ltr'; // Initialize with a default value
  currentLanguage: string; // Add this property
  screenHeight: any;
  screenWidth: any;

  constructor(private translate: TranslateService, private router: Router) {
    this.translate.addLangs(['en', 'ar']);
    this.router.events.subscribe(() => {
      const lang = this.getLanguageFromUrl();
      this.currentLanguage = lang || 'en'; // Default to 'en'
      this.translate.use(this.currentLanguage);
      this.setDirection(this.currentLanguage);
    });

    // Initial setup
    const browserLang = this.translate.getBrowserLang();
    this.currentLanguage = browserLang && browserLang.match(/en|ar/) ? browserLang : 'en';
    this.translate.use(this.currentLanguage);
    this.setDirection(this.currentLanguage);
    this.getScreenSize();
  }

  switchLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    this.setDirection(lang);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  private setDirection(lang: string) {
    this.currentDirection = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = this.currentDirection;
    this.adjustContentLayout();
  }

  private getLanguageFromUrl(): string | null {
    const url = this.router.url;
    return url.startsWith('/ar') ? 'ar' : (url.startsWith('/en') ? 'en' : null);
  }

  private adjustContentLayout() {
    const resumeContent = document.querySelector('.resume-content') as HTMLElement;
    if (resumeContent) {
      const isSideMenuEnabled = this.screenWidth <= 420;

      if (this.currentDirection === 'rtl' && !isSideMenuEnabled) {
        resumeContent.style.marginRight = '260px';
        resumeContent.style.marginLeft = '0px';
      } else if (this.currentDirection === 'ltr' && !isSideMenuEnabled) {
        resumeContent.style.marginLeft = '260px';
        resumeContent.style.marginRight = '0px';
      }
    }
  }
}
