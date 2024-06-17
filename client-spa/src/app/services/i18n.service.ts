import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentDirection: 'ltr' | 'rtl' | any;

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = 'en';
    this.translate.use(browserLang && browserLang.match(/en|ar/) ? browserLang : defaultLang);
    this.setDirection(this.translate.currentLang);
    // this.translate.use(browserLang.match(/en|ar/) ? browserLang : 'en');
  }
  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.setDirection(lang);
  }

  private setDirection(lang: string) {
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    this.currentDirection = direction;
    document.documentElement.dir = direction;
    const resumeContent = document.querySelector('.resume-content') as HTMLElement;
    if (resumeContent) {
      if (direction === 'rtl') {
        resumeContent.style.marginRight = '260px';
        resumeContent.style.marginLeft = '0px';
      } else {
        resumeContent.style.marginLeft = '260px'; // or whatever your original value is
        resumeContent.style.marginRight = '0px';
      }
    }
  }


}
