import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  stats = [
    { label: 'Total Views', value: '12,458', icon: '👁️' },
    { label: 'Total Projects', value: '24', icon: '📁' },
    { label: 'Blog Posts', value: '18', icon: '📝' },
    { label: 'Messages', value: '7', icon: '✉️' }
  ];
}
