import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-document-converter',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './document-converter.component.html',
  styleUrls: ['./document-converter.component.scss']
})
export class DocumentConverterComponent {
  @Input() mode: 'word-to-pdf' | 'pdf-to-word' = 'word-to-pdf';
  
  selectedFile: File | null = null;
  isConverting: boolean = false;
  dragOver: boolean = false;
  private apiUrl = `${environment.baseUrl}documents`;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  get isWordToPdf(): boolean {
    return this.mode === 'word-to-pdf';
  }

  get acceptedFormats(): string {
    return this.isWordToPdf ? '.doc,.docx' : '.pdf';
  }

  get formatDescription(): string {
    return this.isWordToPdf ? '.doc, .docx' : '.pdf';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    const validExtensions = this.isWordToPdf ? ['.doc', '.docx'] : ['.pdf'];
    const fileName = file.name.toLowerCase();
    
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      this.toastr.error(
        `Please select a valid ${this.isWordToPdf ? 'Word document (.doc or .docx)' : 'PDF file (.pdf)'}`,
        'Invalid File'
      );
      return;
    }

    this.selectedFile = file;
  }

  convertDocument(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please select a file first', 'No File Selected');
      return;
    }

    this.isConverting = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const endpoint = this.isWordToPdf 
      ? `${this.apiUrl}/convert-to-pdf` 
      : `${this.apiUrl}/convert-to-word`;

    this.http.post(endpoint, formData, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.isConverting = false;
        
        if (response.body) {
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = this.isWordToPdf 
            ? this.selectedFile!.name.replace(/\.[^/.]+$/, '') + '.pdf'
            : this.selectedFile!.name.replace(/\.[^/.]+$/, '') + '.docx';
          
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          const blob = new Blob([response.body], { 
            type: response.headers.get('Content-Type') || 'application/octet-stream' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);

          this.toastr.success('Document converted successfully!', 'Success');
          this.selectedFile = null;
        }
      },
      error: (error) => {
        this.isConverting = false;
        console.error('Conversion error:', error);
        
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorObj = JSON.parse(reader.result as string);
              this.toastr.error(errorObj.error || 'Conversion failed', 'Error');
            } catch {
              this.toastr.error('Failed to convert document', 'Error');
            }
          };
          reader.readAsText(error.error);
        } else {
          this.toastr.error('Failed to convert document', 'Error');
        }
      }
    });
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  getFileIcon(): string {
    if (!this.selectedFile) return '📄';
    const name = this.selectedFile.name.toLowerCase();
    if (name.endsWith('.pdf')) return '📕';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📘';
    return '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
