import { Component } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {
  menuCollapsed = false;

  constructor(public i18nService: I18nService) {}
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
  get toggleButtonClasses() {
    return {
      'ltr': this.i18nService.currentDirection === 'ltr',
      'rtl': this.i18nService.currentDirection === 'rtl',
    };
  }
}
