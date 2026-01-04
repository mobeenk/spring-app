import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../services/i18n.service';
import { PageTitleService } from '../services/meta.service';

// Import child components
import { TextToolsComponent } from './text-tools/text-tools.component';
import { JsonFormatterComponent } from './json-formatter/json-formatter.component';
import { XmlFormatterComponent } from './xml-formatter/xml-formatter.component';
import { ImageConverterComponent } from './image-converter/image-converter.component';
import { DocumentConverterComponent } from './document-converter/document-converter.component';
import { GuidConverterComponent } from './guid-converter/guid-converter.component';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    TextToolsComponent,
    JsonFormatterComponent,
    XmlFormatterComponent,
    ImageConverterComponent,
    DocumentConverterComponent,
    GuidConverterComponent
  ],
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  selectedTool: string = 'text-tools';

  constructor(
    public i18nService: I18nService,
    private metaService: PageTitleService
  ) {}

  ngOnInit(): void {
    this.metaService.updateMetaTags(
      'Free Online Tools - Text, JSON, XML, PDF Converter | Moubien Kayali',
      'Free online tools for developers and content creators. Format JSON & XML, convert Word to PDF, generate Lorem Ipsum, count words, change text case, and more. No registration required.',
      'online tools, json formatter, xml formatter, text tools, word counter, lorem ipsum generator, pdf converter, word to pdf, pdf to word, case converter, text formatter, developer tools, free tools'
    );
  }

  selectTool(tool: string): void {
    this.selectedTool = tool;
  }
}
