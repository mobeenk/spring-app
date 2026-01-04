import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-xml-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './xml-formatter.component.html',
  styleUrls: ['./xml-formatter.component.scss']
})
export class XmlFormatterComponent {
  xmlInput: string = '';
  xmlOutput: string = '';
  isValidXml: boolean = true;
  xmlError: string = '';

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  copyToClipboard(): void {
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
}
