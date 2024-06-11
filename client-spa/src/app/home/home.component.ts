import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  data: any;
  postData: any = { name: 'Test' };

  constructor(private apiService: ApiService) { }

  scrollToSection(section: string): void {
    document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
  }
  ngOnInit(): void {
    this.apiService.get<any>('http://207.154.253.49:8080/home/welcome').subscribe(response => {
      this.data = response;
      console.log(JSON.stringify(this.data));
    });

    // this.apiService.post<any>('https://api.example.com/data', this.postData).subscribe(response => {
    //   console.log(response);
    // });
  }
}