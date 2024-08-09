import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CanonicalService } from '../services/canonical.service';

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

  constructor(private apiService: ApiService,private router: Router, private metaService: Meta,
     private titleService: Title, private canonicalService: CanonicalService) {
    this.setCanonicalURL();
   }

  scrollToSection(section: string): void {
    document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
  }
  ngOnInit(): void {
    // this.titleService.setTitle('Moubien Kayali - Full Stack Developer');
    // this.metaService.addTags([
    //   { name: 'description', content: 'Moubien Kayali is a Full Stack Developer specializing in .Net and Angular development. Available for private programming lessons. مبين كيالي هو مطور برمجيات متكامل متخصص في تطوير .Net و Angular. متاح لدروس خصوصية في البرمجة.' },
    //   { name: 'keywords', content: 'Moubien Kayali, Full Stack Developer, .Net Senior Developer, Angular Developer, Private programming teacher, مبين كيالي, مدرس خصوصي, Moubien Kayali, Private Teacher, Private Programming Teacher, Python Teacher ,  خصوصي برمجة, خصوصي بايثون , مدرس برمجة خصوصي'  }
    // ]);

    // this.apiService.get<any>('https://moubien-kayali.com/api/home/welcome').subscribe(response => {
    //   this.data = response;
    //   console.log(JSON.stringify(this.data));
    // });
  }
  navigateToResume() {
    this.router.navigate(['/resume']); // Navigate to the 'resume' route
  }
  setCanonicalURL() {
    this.canonicalService.setCanonicalURL(window.location.href)
  }
}
//