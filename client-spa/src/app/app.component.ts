import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { HttpClientModule } from '@angular/common/http';
import { I18nService } from './services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef) {}
  title = 'client-spa';
  ngAfterViewInit() {
 
  }
  switchLanguage(language: string) {
    this.i18nService.switchLanguage(language);
    this.cdr.detectChanges(); // Trigger change detection
  }
}
