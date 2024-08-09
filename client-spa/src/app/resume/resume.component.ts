import { Component, OnInit } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserModule, Meta, Title } from '@angular/platform-browser';
import { faHippo } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { CanonicalService } from '../services/canonical.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule, TranslateModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements OnInit{
  menuCollapsed = false;
  faCoffee = faHippo;
  constructor(public i18nService: I18nService, private metaService: Meta, private titleService: Title,
    private canonicalService: CanonicalService
  ) {
    this.setCanonicalURL();
  }
  ngOnInit(): void {
     this.initStyle()
     this.titleService.setTitle('Moubien Kayali - Resume');
    //  this.metaService.addTags([
    //    { name: 'description', content: 'Moubien Kayali is  Available for private programming lessons.' },
    //    { name: 'keywords', content: '  خصوصي برمجة, خصوصي بايثون , مدرس برمجة خصوصي ,Moubien Kayali, My Resume ,Full Stack Developer, .Net Senior Developer, Angular Developer, Private programming teacher, مبين كيالي, مدرس خصوصي, Moubien Kayali, Private Teacher, Private Programming Teacher, Python Teacher' }
    //  ]);
 
  }


  toggleMenu() {
    this.menuCollapsed = !this.menuCollapsed;
  }
  // scrollToSection(section: string): void {
  //   document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
  // }
  scrollToSection(section: string): void {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  get menuClasses() {
    return {
      'collapsed-ltr': this.menuCollapsed && this.i18nService.currentDirection === 'ltr',
      'collapsed-rtl': this.menuCollapsed && this.i18nService.currentDirection === 'rtl',
    };
  }

  initStyle() {
    let isSideMenuEnabled = this.i18nService.screenWidth <= 420
    let dir =  this.i18nService.currentDirection;
    const resumeContent = document.querySelector('.resume-content') as HTMLElement;
    if (resumeContent) {
      if (dir === 'rtl' && !isSideMenuEnabled) {
        resumeContent.style.marginRight = '260px';
        resumeContent.style.marginLeft = '0px';
      } else  if (dir === 'ltr' && !isSideMenuEnabled) {
        resumeContent.style.marginLeft = '260px'; // or whatever your original value is
        resumeContent.style.marginRight = '0px';
      }
    }

  }
  setCanonicalURL() {
    this.canonicalService.setCanonicalURL(window.location.href)
  }
}
