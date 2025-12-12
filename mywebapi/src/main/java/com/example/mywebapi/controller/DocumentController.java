package com.example.mywebapi.controller;

import com.example.mywebapi.service.DocumentConversionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private DocumentConversionService documentConversionService;

    @PostMapping(value = "/convert-to-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> convertWordToPdf(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"Please select a file to upload\"}");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") 
                && !contentType.equals("application/msword"))) {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"Please upload a valid Word document (.doc or .docx)\"}");
            }

            // Convert to PDF
            byte[] pdfBytes = documentConversionService.convertWordToPdf(file);

            // Prepare response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    file.getOriginalFilename().replaceFirst("[.][^.]+$", "") + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to convert document: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"An unexpected error occurred: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping(value = "/convert-to-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> convertPdfToWord(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"Please select a file to upload\"}");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest()
                        .body("{\"error\": \"Please upload a valid PDF document (.pdf)\"}");
            }

            // Convert to Word
            byte[] wordBytes = documentConversionService.convertPdfToWord(file);

            // Prepare response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", 
                    file.getOriginalFilename().replaceFirst("[.][^.]+$", "") + ".docx");
            headers.setContentLength(wordBytes.length);

            return new ResponseEntity<>(wordBytes, headers, HttpStatus.OK);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to convert document: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"An unexpected error occurred: " + e.getMessage() + "\"}");
        }
    }
}
