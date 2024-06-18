import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HostListener } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentDirection: 'ltr' | 'rtl' | any;
  screenHeight: any ;
  screenWidth: any;
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = 'en';
    this.translate.use(browserLang && browserLang.match(/en|ar/) ? browserLang : defaultLang);
    this.setDirection(this.translate.currentLang);
    this.getScreenSize();
  }
  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.setDirection(lang);
  }

  @HostListener('window:resize', ['$event'])
    getScreenSize() {
          this.screenHeight = window.innerHeight;
          this.screenWidth = window.innerWidth;
       
    }
  private setDirection(lang: string) {
    console.log(this.screenHeight, this.screenWidth);
    let isSideMenuEnabled = this.screenWidth <= 420
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    this.currentDirection = direction;
    document.documentElement.dir = direction;
    const resumeContent = document.querySelector('.resume-content') as HTMLElement;
    if (resumeContent) {
      
      if (direction === 'rtl' && !isSideMenuEnabled) {
        resumeContent.style.marginRight = '260px';
        resumeContent.style.marginLeft = '0px';
      } else if (direction === 'ltr' && !isSideMenuEnabled) {
        resumeContent.style.marginLeft= '260px'; // or whatever your original value is
        resumeContent.style.marginRight = '0px';
      }
      // else{
        
      //   resumeContent.style.marginLeft = '10px'; // or whatever your original value is
      //   resumeContent.style.marginRight = '10px';
      // }
    }
  }


}
