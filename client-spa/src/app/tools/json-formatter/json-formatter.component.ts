import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './json-formatter.component.html',
  styleUrls: ['./json-formatter.component.scss']
})
export class JsonFormatterComponent {
  jsonInput: string = '';
  jsonOutput: string = '';
  isValidJson: boolean = true;
  jsonError: string = '';

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  formatJson(): void {
    try {
      const parsed = JSON.parse(this.jsonInput);
      this.jsonOutput = JSON.stringify(parsed, null, 2);
      this.isValidJson = true;
      this.jsonError = '';
      this.toastr.success('JSON formatted successfully!', 'Success');
    } catch (error: any) {
      this.isValidJson = false;
      this.jsonError = error.message;
      this.jsonOutput = '';
      this.toastr.error('Invalid JSON: ' + error.message, 'Error');
    }
  }

  minifyJson(): void {
    try {
      const parsed = JSON.parse(this.jsonInput);
      this.jsonOutput = JSON.stringify(parsed);
      this.isValidJson = true;
      this.jsonError = '';
      this.toastr.success('JSON minified successfully!', 'Success');
    } catch (error: any) {
      this.isValidJson = false;
      this.jsonError = error.message;
      this.jsonOutput = '';
      this.toastr.error('Invalid JSON: ' + error.message, 'Error');
    }
  }

  validateJson(): void {
    try {
      JSON.parse(this.jsonInput);
      this.isValidJson = true;
      this.jsonError = '';
      this.toastr.success('JSON is valid!', 'Success');
    } catch (error: any) {
      this.isValidJson = false;
      this.jsonError = error.message;
      this.toastr.error('Invalid JSON: ' + error.message, 'Error');
    }
  }

  clearJson(): void {
    this.jsonInput = '';
    this.jsonOutput = '';
    this.isValidJson = true;
    this.jsonError = '';
  }

  copyToClipboard(): void {
    if (isPlatformBrowser(this.platformId)) {
      const textToCopy = this.jsonOutput || this.jsonInput;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.toastr.success('Copied to clipboard!', 'Success');
      }).catch(() => {
        this.toastr.error('Failed to copy', 'Error');
      });
    }
  }
}
