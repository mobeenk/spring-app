import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { I18nService } from './services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';
import { CanonicalService } from './services/canonical.service';
import { PageTitleService } from './services/meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  currentLanguage: string;

  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef, private canonicalService: CanonicalService,
              private pageTitleService: PageTitleService, private router: Router) {
    this.currentLanguage = this.i18nService.currentLanguage; // Initialize currentLanguage
    this.i18nService.switchLanguage(this.currentLanguage); // Ensure the language is set correctly
    this.canonicalService.setCanonicalURL(window.location.href);
  }

  ngAfterViewInit() {
    // Initial setup if needed
  }

  switchLanguage(language: string) {
    this.currentLanguage = language;
    this.i18nService.switchLanguage(language);
    this.cdr.detectChanges(); // Trigger change detection
  }

  setCanonicalURL() {
    this.canonicalService.setCanonicalURL(window.location.href);
  }

  // Helper method to include language in router links
  getRouterLink(path: string): string[] {
    return [`/${this.currentLanguage}`, path];
  }
}
