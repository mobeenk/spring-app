import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { I18nService } from '../services/i18n.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { PageTitleService } from '../services/meta.service';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  selectedTool: string = 'text-tools';
  showPlaceholder: boolean = false;
  selectedFile: File | null = null;
  isConverting: boolean = false;
  dragOver: boolean = false;
  private apiUrl = `${environment.baseUrl}documents`;
  
  // JSON Formatter properties
  jsonInput: string = '';
  jsonOutput: string = '';
  isValidJson: boolean = true;
  jsonError: string = '';
  
  // XML Formatter properties
  xmlInput: string = '';
  xmlOutput: string = '';
  isValidXml: boolean = true;
  xmlError: string = '';
  
  // Text Tools properties
  textInput: string = '';
  wordCount: number = 0;
  charCount: number = 0;
  charCountNoSpaces: number = 0;
  lineCount: number = 0;
  sentenceCount: number = 0;
  loremParagraphs: number = 3;
  loremWords: number = 50;
  
  // Image Converter properties
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  outputFormat: string = 'png';
  isConvertingImage: boolean = false;

  constructor(
    public i18nService: I18nService,
    private http: HttpClient,
    private toastr: ToastrService,
    private metaService: PageTitleService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.metaService.updateMetaTags(
      'Free Online Tools - Text, JSON, XML, PDF Converter | Moubien Kayali',
      'Free online tools for developers and content creators. Format JSON & XML, convert Word to PDF, generate Lorem Ipsum, count words, change text case, and more. No registration required.',
      'online tools, json formatter, xml formatter, text tools, word counter, lorem ipsum generator, pdf converter, word to pdf, pdf to word, case converter, text formatter, developer tools, free tools'
    );
  }

  showForm() {
    this.showPlaceholder = true;
  }

  selectTool(tool: string) {
    this.selectedTool = tool;
    this.showPlaceholder = false;
    this.selectedFile = null;
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
    const isWordToPdf = this.selectedTool === 'word-to-pdf';
    const validExtensions = isWordToPdf ? ['.doc', '.docx'] : ['.pdf'];
    const fileName = file.name.toLowerCase();
    
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      this.toastr.error(
        `Please select a valid ${isWordToPdf ? 'Word document (.doc or .docx)' : 'PDF file (.pdf)'}`,
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

    const endpoint = this.selectedTool === 'word-to-pdf' 
      ? `${this.apiUrl}/convert-to-pdf` 
      : `${this.apiUrl}/convert-to-word`;

    this.http.post(endpoint, formData, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.isConverting = false;
        
        if (response.body) {
          // Extract filename from Content-Disposition header or generate one
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = this.selectedTool === 'word-to-pdf' 
            ? this.selectedFile!.name.replace(/\.[^/.]+$/, '') + '.pdf'
            : this.selectedFile!.name.replace(/\.[^/.]+$/, '') + '.docx';
          
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          // Create download link
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
          // Try to read error message from blob
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

  // JSON Formatter methods
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

  // XML Formatter methods
  formatXml(): void {
    try {
      const formatted = this.formatXmlString(this.xmlInput);
      this.xmlOutput = formatted;
      this.isValidXml = true;
      this.xmlError = '';
      this.toastr.success('XML formatted successfully!', 'Success');
    } catch (error: any) {
      this.isValidXml = false;
      this.xmlError = error.message;
      this.xmlOutput = '';
      this.toastr.error('Invalid XML: ' + error.message, 'Error');
    }
  }

  minifyXml(): void {
    try {
      const minified = this.xmlInput
        .replace(/\>\s+\</g, '><')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .trim();
      this.xmlOutput = minified;
      this.isValidXml = true;
      this.xmlError = '';
      this.toastr.success('XML minified successfully!', 'Success');
    } catch (error: any) {
      this.isValidXml = false;
      this.xmlError = error.message;
      this.xmlOutput = '';
      this.toastr.error('Invalid XML: ' + error.message, 'Error');
    }
  }

  validateXml(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.xmlInput, 'text/xml');
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        
        if (parseError.length > 0) {
          throw new Error(parseError[0].textContent || 'Invalid XML');
        }
        
        this.isValidXml = true;
        this.xmlError = '';
        this.toastr.success('XML is valid!', 'Success');
      }
    } catch (error: any) {
      this.isValidXml = false;
      this.xmlError = error.message;
      this.toastr.error('Invalid XML: ' + error.message, 'Error');
    }
  }

  clearXml(): void {
    this.xmlInput = '';
    this.xmlOutput = '';
    this.isValidXml = true;
    this.xmlError = '';
  }

  copyXmlToClipboard(): void {
    if (isPlatformBrowser(this.platformId)) {
      const textToCopy = this.xmlOutput || this.xmlInput;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.toastr.success('Copied to clipboard!', 'Success');
      }).catch(() => {
        this.toastr.error('Failed to copy', 'Error');
      });
    }
  }

  private formatXmlString(xml: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent || 'Invalid XML');
      }
      
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(xmlDoc);
      return this.indentXml(xmlString);
    }
    return xml;
  }

  private indentXml(xml: string): string {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    
    xml.split(/>(\s*)</)
      .forEach((node) => {
        if (node.match(/^\/\w/)) {
          indent = indent.substring(tab.length);
        }
        
        formatted += indent + '<' + node + '>\r\n';
        
        if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
          indent += tab;
        }
      });
    
    return formatted.substring(1, formatted.length - 3);
  }

  // Text Tools methods
  updateTextStats(): void {
    if (!this.textInput) {
      this.wordCount = 0;
      this.charCount = 0;
      this.charCountNoSpaces = 0;
      this.lineCount = 0;
      this.sentenceCount = 0;
      return;
    }

    this.charCount = this.textInput.length;
    this.charCountNoSpaces = this.textInput.replace(/\s/g, '').length;
    this.lineCount = this.textInput.split('\n').length;
    
    const words = this.textInput.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
    
    const sentences = this.textInput.split(/[.!?]+/).filter(s => s.trim().length > 0);
    this.sentenceCount = sentences.length;
  }

  convertToUpperCase(): void {
    this.textInput = this.textInput.toUpperCase();
    this.toastr.success('Converted to uppercase', 'Success');
  }

  convertToLowerCase(): void {
    this.textInput = this.textInput.toLowerCase();
    this.toastr.success('Converted to lowercase', 'Success');
  }

  convertToTitleCase(): void {
    this.textInput = this.textInput.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    this.toastr.success('Converted to title case', 'Success');
  }

  convertToSentenceCase(): void {
    this.textInput = this.textInput.toLowerCase().replace(/(^\w|[.!?]\s+\w)/g, char => char.toUpperCase());
    this.toastr.success('Converted to sentence case', 'Success');
  }

  removeExtraSpaces(): void {
    this.textInput = this.textInput.replace(/\s+/g, ' ').trim();
    this.updateTextStats();
    this.toastr.success('Removed extra spaces', 'Success');
  }

  removeLineBreaks(): void {
    this.textInput = this.textInput.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    this.updateTextStats();
    this.toastr.success('Removed line breaks', 'Success');
  }

  reverseText(): void {
    this.textInput = this.textInput.split('').reverse().join('');
    this.toastr.success('Text reversed', 'Success');
  }

  clearText(): void {
    this.textInput = '';
    this.updateTextStats();
  }

  copyTextToClipboard(): void {
    if (isPlatformBrowser(this.platformId) && this.textInput) {
      navigator.clipboard.writeText(this.textInput).then(() => {
        this.toastr.success('Copied to clipboard!', 'Success');
      }).catch(() => {
        this.toastr.error('Failed to copy', 'Error');
      });
    }
  }

  generateLoremIpsum(type: 'paragraphs' | 'words'): void {
    const loremWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
      'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
      'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
      'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
      'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
      'mollit', 'anim', 'id', 'est', 'laborum', 'vitae', 'suscipit', 'tellus',
      'mauris', 'augue', 'neque', 'gravida', 'cum', 'sociis', 'natoque', 'penatibus',
      'magnis', 'dis', 'parturient', 'montes', 'nascetur', 'ridiculus', 'mus',
      'donec', 'quam', 'felis', 'ultricies', 'nec', 'pellentesque', 'eu', 'pretium',
      'quis', 'sem', 'nulla', 'consequat', 'massa', 'integer', 'enim', 'leo',
      'rhoncus', 'sapien', 'varius', 'morbi', 'eros', 'cursus', 'turpis', 'egestas'
    ];

    if (type === 'paragraphs') {
      const paragraphs = [];
      for (let i = 0; i < this.loremParagraphs; i++) {
        const sentenceCount = 4 + Math.floor(Math.random() * 4); // 4-7 sentences per paragraph
        const sentences = [];
        
        for (let j = 0; j < sentenceCount; j++) {
          const wordCount = 8 + Math.floor(Math.random() * 12); // 8-19 words per sentence
          const words = [];
          
          for (let k = 0; k < wordCount; k++) {
            const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
            words.push(k === 0 ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord);
          }
          
          sentences.push(words.join(' ') + '.');
        }
        
        paragraphs.push(sentences.join(' '));
      }
      
      this.textInput = paragraphs.join('\n\n');
      this.toastr.success(`Generated ${this.loremParagraphs} Lorem Ipsum paragraph(s)`, 'Success');
    } else {
      const words = [];
      for (let i = 0; i < this.loremWords; i++) {
        const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
        words.push(i === 0 ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord);
      }
      
      this.textInput = words.join(' ') + '.';
      this.toastr.success(`Generated ${this.loremWords} Lorem Ipsum words`, 'Success');
    }
    
    this.updateTextStats();
  }

  // Image Converter methods
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;
      this.createImagePreview(file);
    } else {
      this.toastr.error('Please select a valid image file', 'Invalid File');
    }
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

  convertImage(): void {
    if (!this.selectedImage || !isPlatformBrowser(this.platformId)) {
      this.toastr.warning('Please select an image first', 'No Image Selected');
      return;
    }

    this.isConvertingImage = true;
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
              this.isConvertingImage = false;
              this.clearImage();
            } else {
              this.toastr.error('Failed to convert image', 'Error');
              this.isConvertingImage = false;
            }
          }, mimeType);
        }
      };
      
      img.onerror = () => {
        this.toastr.error('Failed to load image', 'Error');
        this.isConvertingImage = false;
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      this.toastr.error('Failed to read image file', 'Error');
      this.isConvertingImage = false;
    };
    
    reader.readAsDataURL(this.selectedImage);
  }
}
