import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CanonicalService } from '../services/canonical.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  constructor(
    private canonicalService: CanonicalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ){
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }
  ngOnInit(): void {
   // throw new Error('Method not implemented.');
  }


  setCanonicalURL() {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }
}
