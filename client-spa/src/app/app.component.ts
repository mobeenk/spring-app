import { AfterViewInit, ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { I18nService } from './services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';
import { CanonicalService } from './services/canonical.service';
import { PageTitleService } from './services/meta.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  currentLanguage: string;

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef,
    private canonicalService: CanonicalService,
    private pageTitleService: PageTitleService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLanguage = this.i18nService.currentLanguage; // Initialize currentLanguage
    this.i18nService.switchLanguage(this.currentLanguage); // Ensure the language is set correctly

    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }

  ngAfterViewInit() {
    // Initial setup if needed
  }

  switchLanguage(language: string) {
    this.currentLanguage = language;
    this.i18nService.switchLanguage(language);
    
    // Navigate to the same page but with the new language prefix
    const currentUrl = this.router.url;
    const pathWithoutLang = currentUrl.replace(/^\/(en|ar)/, ''); // Remove current language prefix
    const newUrl = `/${language}${pathWithoutLang || '/home'}`; // Add new language prefix
    
    this.router.navigateByUrl(newUrl);
    this.cdr.detectChanges(); // Trigger change detection
  }

  setCanonicalURL() {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }

  // Helper method to include language in router links
  getRouterLink(path: string): string[] {
    return [`/${this.currentLanguage}`, path];
  }
}
