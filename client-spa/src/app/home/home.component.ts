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
    const baseUrl = isPlatformBrowser(this.platformId) ? window.location.origin : 'https://moubien-kayali.com';
    
    if (langFromUrl === 'ar') {
      // Arabic metadata
      this.titleService.setTitle('مبين كيالي - مدرس برمجة و مطور متكامل');
      this.metaService.updateTag({
        name: 'description',
        content: 'مبين كيالي - مدرس برمجة خصوصي متخصص في تطوير .Net و Angular و Python. متاح لدروس خصوصية وتطوير تطبيقات ويب وديسكتوب. خبرة عملية في تدريس البرمجة.'
      });
      this.metaService.updateTag({
        name: 'keywords',
        content: 'مدرس برمجة, مدرس خصوصي برمجة, مدرس برمجة خصوصي, مبين, مبين كيالي, مطور متكامل, دروس برمجة, تطوير تطبيقات, Angular, .Net, Python, دروس خصوصية برمجة, معلم برمجة, خصوصي برمجة, برمجة جافا, Java, مطور ويب, تطوير مواقع'
      });
      
      // Open Graph
      this.metaService.updateTag({ property: 'og:title', content: 'مبين كيالي - مدرس برمجة و مطور متكامل' });
      this.metaService.updateTag({ property: 'og:description', content: 'دروس برمجة خصوصية وتطوير تطبيقات ويب وديسكتوب. متخصص في .Net و Angular و Python و Java.' });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
      this.metaService.updateTag({ property: 'og:url', content: `${baseUrl}/ar/home` });
      this.metaService.updateTag({ property: 'og:locale', content: 'ar_AR' });
      this.metaService.updateTag({ property: 'og:locale:alternate', content: 'en_US' });
      this.metaService.updateTag({ property: 'og:site_name', content: 'Moubien Kayali' });
      
      // Twitter Card
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: 'مبين كيالي - مدرس برمجة و مطور متكامل' });
      this.metaService.updateTag({ name: 'twitter:description', content: 'دروس برمجة خصوصية وتطوير تطبيقات. متخصص في .Net و Angular و Python.' });
      
      // Additional SEO
      this.metaService.updateTag({ name: 'author', content: 'Moubien Kayali' });
      this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
      this.metaService.updateTag({ httpEquiv: 'content-language', content: 'ar' });
      
      // Hreflang
      this.addHreflangTags(baseUrl);
      
      // Structured Data (JSON-LD)
      this.addStructuredData(langFromUrl, baseUrl);
      
    } else {
      // English metadata
      this.titleService.setTitle('Moubien Kayali - Full Stack Developer & Programming Teacher');
      this.metaService.updateTag({
        name: 'description',
        content: 'Moubien Kayali - Full Stack Developer specializing in .Net, Angular, Python, and Java. Private programming lessons and custom web/desktop application development. Experienced software engineer available for freelance projects and tutoring.'
      });
      this.metaService.updateTag({
        name: 'keywords',
        content: 'Moubien Kayali, Full Stack Developer, programming teacher, .Net developer, Angular developer, Python developer, Java developer, private programming lessons, web development, desktop applications, freelance developer, software engineer, coding tutor'
      });
      
      // Open Graph
      this.metaService.updateTag({ property: 'og:title', content: 'Moubien Kayali - Full Stack Developer & Programming Teacher' });
      this.metaService.updateTag({ property: 'og:description', content: 'Full Stack Developer offering private programming lessons and custom web/desktop application development in .Net, Angular, Python, and Java.' });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
      this.metaService.updateTag({ property: 'og:url', content: `${baseUrl}/en/home` });
      this.metaService.updateTag({ property: 'og:locale', content: 'en_US' });
      this.metaService.updateTag({ property: 'og:locale:alternate', content: 'ar_AR' });
      this.metaService.updateTag({ property: 'og:site_name', content: 'Moubien Kayali' });
      
      // Twitter Card
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.metaService.updateTag({ name: 'twitter:title', content: 'Moubien Kayali - Full Stack Developer & Programming Teacher' });
      this.metaService.updateTag({ name: 'twitter:description', content: 'Expert developer offering programming lessons and custom software development.' });
      
      // Additional SEO
      this.metaService.updateTag({ name: 'author', content: 'Moubien Kayali' });
      this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
      this.metaService.updateTag({ httpEquiv: 'content-language', content: 'en' });
      
      // Hreflang
      this.addHreflangTags(baseUrl);
      
      // Structured Data (JSON-LD)
      this.addStructuredData(langFromUrl, baseUrl);
    }
  }

  private addHreflangTags(baseUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      // Server-side: use Meta service
      this.metaService.updateTag({ rel: 'alternate', hreflang: 'en', href: `${baseUrl}/en/home` });
      this.metaService.updateTag({ rel: 'alternate', hreflang: 'ar', href: `${baseUrl}/ar/home` });
      this.metaService.updateTag({ rel: 'alternate', hreflang: 'x-default', href: `${baseUrl}/en/home` });
    } else {
      // Client-side: DOM manipulation
      this.updateLinkTag('alternate', 'en', `${baseUrl}/en/home`);
      this.updateLinkTag('alternate', 'ar', `${baseUrl}/ar/home`);
      this.updateLinkTag('alternate', 'x-default', `${baseUrl}/en/home`);
    }
  }

  private updateLinkTag(rel: string, hreflang: string, href: string): void {
    let link: HTMLLinkElement | null = document.querySelector(`link[rel="${rel}"][hreflang="${hreflang}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      link.setAttribute('hreflang', hreflang);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private addStructuredData(lang: string, baseUrl: string): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Moubien Kayali',
      'alternateName': 'مبين كيالي',
      'url': baseUrl,
      'image': `${baseUrl}/assets/images/profile.jpg`,
      'sameAs': [
        // Add your social profiles here
        // 'https://www.linkedin.com/in/moubien-kayali',
        // 'https://github.com/mobeenk'
      ],
      'jobTitle': lang === 'ar' ? 'مطور متكامل و مدرس برمجة' : 'Full Stack Developer & Programming Teacher',
      'description': lang === 'ar' 
        ? 'مبين كيالي - مدرس برمجة خصوصي ومطور برمجيات متخصص في .Net و Angular و Python'
        : 'Moubien Kayali - Full Stack Developer and Programming Teacher specializing in .Net, Angular, and Python',
      'knowsAbout': ['.Net', 'Angular', 'Python', 'Java', 'Web Development', 'Desktop Applications'],
      'teaches': lang === 'ar' 
        ? ['برمجة', '.Net', 'Angular', 'Python', 'Java', 'تطوير الويب']
        : ['Programming', '.Net', 'Angular', 'Python', 'Java', 'Web Development']
    };

    if (isPlatformBrowser(this.platformId)) {
      // Client-side: inject into DOM
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
    // Note: For server-side structured data, you'd typically add it to your index.html template
    // or use a server-side rendering approach to inject it
  }

  private setCanonicalURL(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }

  navigateToResume() {
    const langFromUrl = this.router.url.split('/')[1];
    const lang = langFromUrl === 'ar' ? 'ar' : 'en';
    this.router.navigate([`/${lang}/contact`]);
  }
}
//