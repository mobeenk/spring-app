import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-guid-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guid-converter.component.html',
  styleUrls: ['./guid-converter.component.scss']
})
export class GuidConverterComponent {
  guidInput: string = '';
  parsedGuid: {
    standard: string;
    withBraces: string;
    withParentheses: string;
    hex: string;
    int: string;
    base64: string;
  } | null = null;
  guidInputError: string = '';

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  parseGuidInput(): void {
    // Clean input - remove braces, parentheses, whitespace
    let cleaned = this.guidInput.trim()
      .replace(/[{}()\s]/g, '')
      .toLowerCase();

    // Validate GUID format (with or without hyphens)
    const guidWithHyphens = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const guidWithoutHyphens = /^[0-9a-f]{32}$/i;

    let standardGuid: string;

    if (guidWithHyphens.test(cleaned)) {
      standardGuid = cleaned;
    } else if (guidWithoutHyphens.test(cleaned)) {
      // Add hyphens to make standard format
      standardGuid = `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
    } else {
      this.guidInputError = 'Invalid GUID format. Please enter a valid GUID.';
      this.parsedGuid = null;
      return;
    }

    this.guidInputError = '';
    
    // Get hex without hyphens
    const hex = standardGuid.replace(/-/g, '');
    
    // Convert to BigInt for Int representation
    const bigIntValue = BigInt('0x' + hex);
    
    // Convert to Base64
    const bytes = this.hexToBytes(hex);
    const base64 = this.bytesToBase64(bytes);

    this.parsedGuid = {
      standard: standardGuid.toLowerCase(),
      withBraces: `{${standardGuid.toUpperCase()}}`,
      withParentheses: `(${standardGuid.toUpperCase()})`,
      hex: `0x${hex.toUpperCase()}`,
      int: bigIntValue.toString(),
      base64: base64
    };
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 32; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  private bytesToBase64(bytes: Uint8Array): string {
    if (isPlatformBrowser(this.platformId)) {
      let binary = '';
      bytes.forEach(byte => binary += String.fromCharCode(byte));
      return btoa(binary);
    }
    return '';
  }

  clearGuidConverter(): void {
    this.guidInput = '';
    this.parsedGuid = null;
    this.guidInputError = '';
  }

  copyParsedValue(value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(value).then(() => {
        this.toastr.success('Copied to clipboard', 'Copied!');
      }).catch(() => {
        this.toastr.error('Failed to copy', 'Error');
      });
    }
  }
}
