package com.example.mywebapi.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class DocumentConversionService {

    public byte[] convertWordToPdf(MultipartFile wordFile) throws IOException {
        try (InputStream inputStream = wordFile.getInputStream();
             XWPFDocument document = new XWPFDocument(inputStream);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document pdfDoc = new Document(pdfDocument);

            // Process paragraphs
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                if (text != null && !text.trim().isEmpty()) {
                    Paragraph pdfParagraph = new Paragraph(text);
                    
                    // Apply basic formatting
                    if (paragraph.getRuns().size() > 0) {
                        XWPFRun run = paragraph.getRuns().get(0);
                        if (run.isBold()) {
                            pdfParagraph.setBold();
                        }
                        if (run.isItalic()) {
                            pdfParagraph.setItalic();
                        }
                        if (run.getFontSize() > 0) {
                            pdfParagraph.setFontSize(run.getFontSize());
                        }
                    }
                    
                    pdfDoc.add(pdfParagraph);
                }
            }

            // Process tables
            for (XWPFTable table : document.getTables()) {
                int numCols = table.getRow(0).getTableCells().size();
                Table pdfTable = new Table(UnitValue.createPercentArray(numCols))
                        .useAllAvailableWidth();

                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        pdfTable.addCell(cell.getText());
                    }
                }
                
                pdfDoc.add(pdfTable);
            }

            pdfDoc.close();
            return outputStream.toByteArray();
        }
    }
}
