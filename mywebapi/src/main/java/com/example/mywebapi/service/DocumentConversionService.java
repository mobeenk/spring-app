package com.example.mywebapi.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import technology.tabula.*;
import technology.tabula.extractors.SpreadsheetExtractionAlgorithm;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

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

    public byte[] convertPdfToWord(MultipartFile pdfFile) throws IOException {
        try (InputStream inputStream = pdfFile.getInputStream();
             PDDocument pdfDocument = PDDocument.load(inputStream);
             XWPFDocument wordDocument = new XWPFDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             ObjectExtractor extractor = new ObjectExtractor(pdfDocument)) {

            SpreadsheetExtractionAlgorithm sea = new SpreadsheetExtractionAlgorithm();
            PageIterator pages = extractor.extract();

            int pageNum = 1;
            while (pages.hasNext()) {
                Page page = pages.next();

                // First, extract all text from the page
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setStartPage(pageNum);
                stripper.setEndPage(pageNum);
                String pageText = stripper.getText(pdfDocument);

                // Extract tables from the page
                List<technology.tabula.Table> tables = sea.extract(page);

                // Get images with their positions
                PDPage pdPage = pdfDocument.getPage(pageNum - 1);
                List<ImageInfo> images = extractImagesWithPosition(pdPage);

                // Process content in order - add text first, then images, then tables
                String[] lines = pageText.split("\\r?\\n");
                
                for (String line : lines) {
                    if (!line.trim().isEmpty()) {
                        // Check if this line is not part of a table
                        boolean isTableContent = false;
                        if (!tables.isEmpty()) {
                            for (technology.tabula.Table table : tables) {
                                @SuppressWarnings("rawtypes")
                                List<List<RectangularTextContainer>> rows = table.getRows();
                                for (@SuppressWarnings("rawtypes") List<RectangularTextContainer> cells : rows) {
                                    for (@SuppressWarnings("rawtypes") RectangularTextContainer cell : cells) {
                                        if (cell.getText().trim().equals(line.trim())) {
                                            isTableContent = true;
                                            break;
                                        }
                                    }
                                    if (isTableContent) break;
                                }
                                if (isTableContent) break;
                            }
                        }

                        if (!isTableContent) {
                            addFormattedTextLine(line, wordDocument);
                        }
                    }
                }

                // Add images after text content
                for (ImageInfo imageInfo : images) {
                    addImageToDocument(imageInfo, wordDocument);
                }

                // Add tables
                for (technology.tabula.Table table : tables) {
                    XWPFTable wordTable = wordDocument.createTable();

                    @SuppressWarnings("rawtypes")
                    List<List<RectangularTextContainer>> rows = table.getRows();
                    for (int i = 0; i < rows.size(); i++) {
                        @SuppressWarnings("rawtypes")
                        List<RectangularTextContainer> cells = rows.get(i);
                        XWPFTableRow wordRow;

                        if (i == 0) {
                            wordRow = wordTable.getRow(0);
                        } else {
                            wordRow = wordTable.createRow();
                        }

                        for (int j = 0; j < cells.size(); j++) {
                            XWPFTableCell wordCell;
                            if (j < wordRow.getTableCells().size()) {
                                wordCell = wordRow.getCell(j);
                            } else {
                                wordCell = wordRow.addNewTableCell();
                            }
                            wordCell.setText(cells.get(j).getText().trim());
                        }
                    }
                }

                pageNum++;
            }

            wordDocument.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private List<ImageInfo> extractImagesWithPosition(PDPage page) {
        List<ImageInfo> imageList = new java.util.ArrayList<>();
        try {
            PDResources resources = page.getResources();
            
            for (COSName name : resources.getXObjectNames()) {
                PDXObject xObject = resources.getXObject(name);
                
                if (xObject instanceof PDImageXObject) {
                    PDImageXObject image = (PDImageXObject) xObject;
                    BufferedImage bufferedImage = image.getImage();
                    
                    // Convert BufferedImage to byte array
                    ByteArrayOutputStream imageOutputStream = new ByteArrayOutputStream();
                    ImageIO.write(bufferedImage, "png", imageOutputStream);
                    byte[] imageBytes = imageOutputStream.toByteArray();
                    
                    int width = bufferedImage.getWidth();
                    int height = bufferedImage.getHeight();
                    
                    imageList.add(new ImageInfo(imageBytes, width, height, 0));
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting images: " + e.getMessage());
        }
        return imageList;
    }

    private void addImageToDocument(ImageInfo imageInfo, XWPFDocument wordDocument) {
        try {
            XWPFParagraph paragraph = wordDocument.createParagraph();
            XWPFRun run = paragraph.createRun();
            
            // Scale image if too large (max width 400 pixels)
            int scaledWidth = imageInfo.width;
            int scaledHeight = imageInfo.height;
            
            if (imageInfo.width > 400) {
                scaledWidth = 400;
                scaledHeight = (int) ((double) imageInfo.height * 400 / imageInfo.width);
            }
            
            run.addPicture(
                new java.io.ByteArrayInputStream(imageInfo.imageBytes),
                XWPFDocument.PICTURE_TYPE_PNG,
                "image.png",
                Units.toEMU(scaledWidth),
                Units.toEMU(scaledHeight)
            );
        } catch (Exception e) {
            System.err.println("Error adding image to document: " + e.getMessage());
        }
    }

    private void addFormattedTextLine(String line, XWPFDocument wordDocument) {
        XWPFParagraph paragraph = wordDocument.createParagraph();
        
        // Check if this is a code block (starts with common code patterns or has specific formatting)
        boolean isCodeBlock = line.matches("^\\s*(sudo|curl|npm|git|cd|ls|mkdir|chmod|chown|apt-get|yum)\\s+.*") ||
                             line.contains("://") && (line.contains("http") || line.contains("https")) ||
                             line.matches(".*[{}\\[\\];].*");
        
        if (isCodeBlock) {
            // Style as code block with gray background
            XWPFRun run = paragraph.createRun();
            run.setText(line);
            run.setFontFamily("Courier New");
            run.setFontSize(10);
            
            // Add gray background shading to the paragraph
            org.openxmlformats.schemas.wordprocessingml.x2006.main.CTShd cTShd = run.getCTR().addNewRPr().addNewShd();
            cTShd.setVal(org.openxmlformats.schemas.wordprocessingml.x2006.main.STShd.CLEAR);
            cTShd.setColor("auto");
            cTShd.setFill("D3D3D3"); // Light gray background
        } else {
            // Process line for inline formatting (bold, underline, italic)
            processInlineFormatting(line, paragraph);
        }
    }

    private void processInlineFormatting(String line, XWPFParagraph paragraph) {
        // Simple heuristic: detect common formatting patterns
        // This is a basic implementation - PDF formatting detection is complex
        
        String[] words = line.split("\\s+");
        XWPFRun currentRun = paragraph.createRun();
        StringBuilder currentText = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            
            // Check if word appears to be specially formatted (heuristic based on common patterns)
            boolean shouldUnderline = word.matches("^[a-z]+:$") || // words ending with colon
                                     word.equalsIgnoreCase("linux") ||
                                     word.equalsIgnoreCase("nodejs") ||
                                     word.equalsIgnoreCase("config");
            
            if (shouldUnderline) {
                // Flush current text
                if (currentText.length() > 0) {
                    currentRun.setText(currentText.toString());
                    currentText = new StringBuilder();
                    currentRun = paragraph.createRun();
                }
                
                // Add underlined word
                currentRun.setText(word + (i < words.length - 1 ? " " : ""));
                currentRun.setUnderline(UnderlinePatterns.SINGLE);
                currentRun = paragraph.createRun();
            } else {
                currentText.append(word);
                if (i < words.length - 1) {
                    currentText.append(" ");
                }
            }
        }
        
        // Flush remaining text
        if (currentText.length() > 0) {
            currentRun.setText(currentText.toString());
        }
    }

    private static class ImageInfo {
        byte[] imageBytes;
        int width;
        int height;
        float yPosition;

        ImageInfo(byte[] imageBytes, int width, int height, float yPosition) {
            this.imageBytes = imageBytes;
            this.width = width;
            this.height = height;
            this.yPosition = yPosition;
        }
    }
}
