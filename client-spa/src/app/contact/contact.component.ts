import { Component, OnInit } from '@angular/core';
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
  constructor( private canonicalService: CanonicalService){
    this.canonicalService.setCanonicalURL(window.location.href);
  }
  ngOnInit(): void {
   // throw new Error('Method not implemented.');
  }


  setCanonicalURL() {
    this.canonicalService.setCanonicalURL(window.location.href)
  }
}
