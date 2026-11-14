package com.cointribe.backend.controllers;

import com.cointribe.backend.services.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
@Tag(name = "Analítica y Métricas", description = "Endpoints para el Banco de Preguntas Analíticas CESDE y métricas de comunidad")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Obtener resumen analítico de usuarios y comunidad")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
    }

    @GetMapping("/pdf")
    @Operation(summary = "Descargar el reporte oficial en PDF de analítica")
    public ResponseEntity<Resource> downloadPdf() {
        Resource pdf = new ClassPathResource("static/docs/Reporte_Analitico_CoinTribe.pdf");
        if (!pdf.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Reporte_Analitico_CoinTribe.pdf\"")
                .body(pdf);
    }
}

