import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { ResumeComponent } from './resume/resume.component';
import { ExchangeRatesComponent } from './exchange-rates/exchange-rates.component';

export const routes: Routes = [
  { path: '', redirectTo: 'en/home', pathMatch: 'full' }, // Redirect root to 'home' with default language
  {
    path: 'en',
    children: [
      { path: 'home', component: HomeComponent, data: { title: 'Home - Moubien Kayali', description: 'Welcome to the homepage of Moubien Kayali', keywords: 'home, Moubien Kayali' }},
      { path: 'resume', component: ResumeComponent, data: { title: 'Resume - Moubien Kayali', description: 'View the resume of Moubien Kayali', keywords: 'resume, Moubien Kayali' }},
      { path: 'contact', component: ContactComponent, data: { title: 'Contact - Moubien Kayali', description: 'Get in touch with Moubien Kayali', keywords: 'contact, Moubien Kayali' }},
      { path: 'utilities', component: ExchangeRatesComponent, data: { title: 'Exchange Rates - Moubien Kayali', description: 'View the latest exchange rates', keywords: 'exchange rates, Moubien Kayali' }}
    ]
  },
  {
    path: 'ar',
    children: [
      { path: 'home', component: HomeComponent, data: { title: 'الصفحة الرئيسية - Moubien Kayali', description: 'مرحبا بكم في الصفحة الرئيسية لـ Moubien Kayali', keywords: 'home, Moubien Kayali' }},
      { path: 'resume', component: ResumeComponent, data: { title: 'السيرة الذاتية - Moubien Kayali', description: 'عرض سيرة Moubien Kayali الذاتية', keywords: 'resume, Moubien Kayali' }},
      { path: 'contact', component: ContactComponent, data: { title: 'اتصل بنا - Moubien Kayali', description: 'تواصل مع Moubien Kayali', keywords: 'contact, Moubien Kayali' }},
      { path: 'utilities', component: ExchangeRatesComponent, data: { title: 'أسعار الصرف - موقع Moubien Kayali', description: 'عرض أحدث أسعار الصرف', keywords: 'exchange rates, Moubien Kayali' }}
    ]
  },
  { path: '**', redirectTo: 'en/home' } // Wildcard route for handling unknown paths
];
