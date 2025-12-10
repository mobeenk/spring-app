import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent {
  selectedTool: string = 'word-to-pdf';
  showPlaceholder: boolean = false;

  constructor(
    public i18nService: I18nService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  showForm() {
    this.showPlaceholder = true;
  }

  selectTool(tool: string) {
    this.selectedTool = tool;
    this.showPlaceholder = false;
  }
}
