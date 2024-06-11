import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { ResumeComponent } from './resume/resume.component';

export const routes: Routes = [
{ path: '', component: HomeComponent },
{ path: 'resume', component: ResumeComponent },
{ path: 'contact', component: ContactComponent }
];
