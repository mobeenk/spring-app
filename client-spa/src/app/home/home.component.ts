import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

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

  constructor(private apiService: ApiService,private router: Router) { }

  scrollToSection(section: string): void {
    document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
  }
  ngOnInit(): void {
    this.apiService.get<any>('https://moubien-kayali.com/api/home/welcome').subscribe(response => {
      this.data = response;
      console.log(JSON.stringify(this.data));
    });

    // this.apiService.post<any>('https://api.example.com/data', this.postData).subscribe(response => {
    //   console.log(response);
    // });
  }
  navigateToResume() {
    this.router.navigate(['/resume']); // Navigate to the 'resume' route
  }
}