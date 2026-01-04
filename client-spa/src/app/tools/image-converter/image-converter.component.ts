import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './image-converter.component.html',
  styleUrls: ['./image-converter.component.scss']
})
export class ImageConverterComponent {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  outputFormat: string = 'png';
  isConverting: boolean = false;
  dragOver: boolean = false;

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;
      this.createImagePreview(file);
    } else {
      this.toastr.error('Please select a valid image file', 'Invalid File');
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

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImage = file;
        this.createImagePreview(file);
      } else {
        this.toastr.error('Please select a valid image file', 'Invalid File');
      }
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  convertImage(): void {
    if (!this.selectedImage || !isPlatformBrowser(this.platformId)) {
      this.toastr.warning('Please select an image first', 'No Image Selected');
      return;
    }

    this.isConverting = true;
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          const mimeType = `image/${this.outputFormat}`;
          canvas.toBlob((blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              const originalName = this.selectedImage!.name.replace(/\.[^/.]+$/, '');
              link.href = url;
              link.download = `${originalName}.${this.outputFormat}`;
              link.click();
              window.URL.revokeObjectURL(url);
              
              this.toastr.success(`Image converted to ${this.outputFormat.toUpperCase()}`, 'Success');
              this.isConverting = false;
              this.clearImage();
            } else {
              this.toastr.error('Failed to convert image', 'Error');
              this.isConverting = false;
            }
          }, mimeType);
        }
      };
      
      img.onerror = () => {
        this.toastr.error('Failed to load image', 'Error');
        this.isConverting = false;
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      this.toastr.error('Failed to read image file', 'Error');
      this.isConverting = false;
    };
    
    reader.readAsDataURL(this.selectedImage);
  }
}
