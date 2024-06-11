import { Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {
  menuCollapsed = false;

  toggleMenu() {
    this.menuCollapsed = !this.menuCollapsed;
  }
  scrollToSection(section: string): void {
    document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
  }
}
