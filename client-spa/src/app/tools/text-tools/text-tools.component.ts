import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-text-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './text-tools.component.html',
  styleUrls: ['./text-tools.component.scss']
})
export class TextToolsComponent {
  textInput: string = '';
  wordCount: number = 0;
  charCount: number = 0;
  charCountNoSpaces: number = 0;
  lineCount: number = 0;
  sentenceCount: number = 0;
  loremParagraphs: number = 3;
  loremWords: number = 50;

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  copyToClipboard(): void {
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
}
