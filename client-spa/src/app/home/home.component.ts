import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CanonicalService } from '../services/canonical.service';
import { I18nService } from '../services/i18n.service';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,HttpClientModule,TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  data: any;
  
  postData: any = { name: 'Test' };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private metaService: Meta,
    private titleService: Title,
    private canonicalService: CanonicalService,
    private i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.setCanonicalURL();
    }
    this.setSEOMetadata(); // Set SEO metadata on both server and browser
  }

  scrollToSection(section: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  ngOnInit(): void {
    this.setSEOMetadata();
  }

  private setSEOMetadata(): void {
    // Detect language from URL (most reliable for SSR)
    const urlSegments = this.router.url.split('/');
    const langFromUrl = urlSegments[1] === 'ar' ? 'ar' : 'en';
    
    if (langFromUrl === 'ar') {
      // Arabic metadata
      this.titleService.setTitle('مبين كيالي - مدرس برمجة و مطور متكامل');
      this.metaService.updateTag({
        name: 'description',
        content: 'مبين كيالي - مدرس برمجة خصوصي متخصص في تطوير .Net و Angular. متاح لدروس خصوصية وتطوير تطبيقات ويب واسطة ديسكتوب. Full Stack Developer معتمد.'
      });
      this.metaService.updateTag({
        name: 'keywords',
        content: 'مدرس برمجة, مدرس خصوصي برمجة, مدرس برمجة خصوصي, مبين, مبين كيالي, مطور متكامل, دروس برمجة, تطوير تطبيقات, Angular, .Net, Python, دروس خصوصية برمجة, معلم برمجة, خصوصي برمجة, برمجة جافا, Java'
      });
      this.metaService.updateTag({
        property: 'og:title',
        content: 'مبين كيالي - مدرس برمجة و مطور متكامل'
      });
      this.metaService.updateTag({
        property: 'og:description',
        content: 'دروس برمجة خصوصية وتطوير تطبيقات ويب واسطة ديسكتوب. متخصص في .Net و Angular و Python.'
      });
    } else {
      // English metadata
      this.titleService.setTitle('Moubien Kayali - Full Stack Developer & Programming Teacher');
      this.metaService.updateTag({
        name: 'description',
        content: 'Moubien Kayali - Full Stack Developer specializing in .Net, Angular, and Python. Private programming lessons and web/desktop application development. Available for freelance projects and tutoring.'
      });
      this.metaService.updateTag({
        name: 'keywords',
        content: 'Moubien Kayali, Full Stack Developer, programming teacher, .Net developer, Angular developer, Python developer, private programming lessons, web development, desktop applications, freelance developer, software engineer'
      });
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Moubien Kayali - Full Stack Developer & Programming Teacher'
      });
      this.metaService.updateTag({
        property: 'og:description',
        content: 'Full Stack Developer offering private programming lessons and custom web/desktop application development in .Net, Angular, and Python.'
      });
    }
  }

  private setCanonicalURL(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }

  navigateToResume() {
    this.router.navigate(['/resume']); // Navigate to the 'resume' route
  }
}
//