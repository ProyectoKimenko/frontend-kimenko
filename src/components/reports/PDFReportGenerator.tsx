'use client'
import React, { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileText, Loader } from 'lucide-react'
import type { PDFReportData, PDFReportOptions } from '../../types/components/reports/typesPDFReport'

interface PDFReportGeneratorProps {
    preparePDFData: () => Promise<PDFReportData>
    options?: PDFReportOptions
    className?: string
    buttonText?: string
    filename?: string  // Add filename prop
}

export default function PDFReportGenerator({
    preparePDFData,
    className = '',
    buttonText = 'Generar Reporte PDF',
    filename  // Add filename to destructuring
}: PDFReportGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCleanReport = useCallback(async () => {
        setIsGenerating(true);

        try {
            const data = await preparePDFData();

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            const lineHeight = 5;

            // Load logo
            const loadLogo = (): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = reject;
                    img.src = '/logo-kimenko.png';
                });
            };

            // Helper function to add wrapped text and handle page overflow
            const addWrappedText = (text: string, x: number, y: number, maxWidth: number): number => {
                const lines = pdf.splitTextToSize(text, maxWidth);
                lines.forEach((line: string) => {
                    if (y + lineHeight > pageHeight - margin - 10) { // Reserve space for footer
                        pdf.addPage();
                        y = margin;
                    }
                    pdf.text(line, x, y);
                    y += lineHeight;
                });
                return y;
            };

            // Helper function for metadata
            const addMetadata = (metadata: Record<string, string> | undefined, startY: number): number => {
                let y = startY;
                pdf.setFont("helvetica", "bold");
                y = addWrappedText("Metadata", margin, y, contentWidth);
                pdf.setFont("helvetica", "normal");
                if (metadata) {
                    Object.entries(metadata).forEach(([key, value]) => {
                        y = addWrappedText(`${key}: ${value}`, margin + 5, y, contentWidth - 5);
                    });
                }
                return y + lineHeight; // Extra spacing after section
            };

            // Helper function for insights
            const addInsights = (insights: string[] | undefined, startY: number): number => {
                let y = startY;
                pdf.setFont("helvetica", "bold");
                y = addWrappedText("Insights", margin, y, contentWidth);
                pdf.setFont("helvetica", "normal");
                if (insights && insights.length > 0) {
                    insights.forEach((insight) => {
                        y = addWrappedText(`• ${insight}`, margin + 5, y, contentWidth - 5);
                    });
                }
                return y + lineHeight; // Extra spacing after section
            };

            // Set professional font
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);

            // Logo y título a la misma altura
            const headerY = 15;
            let yPosition = headerY;
            let logoWidth = 30;
            let logoHeight = 15;
            let logoX = margin;
            try {
                const logoDataUrl = await loadLogo();
                pdf.addImage(logoDataUrl, "PNG", logoX, headerY, logoWidth, logoHeight);
            } catch (error) {
                console.warn("Could not load logo:", error);
            }

            // Header (título y subtítulo) alineado a la derecha del logo, centrado verticalmente con el logo
            const titleX = pageWidth / 2;
            const titleY = headerY + logoHeight / 2 + 1; // Centrado vertical con el logo

            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text(data.title ?? '', titleX, titleY, { align: "center", maxWidth: contentWidth });

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "italic");
            pdf.text(data.subtitle ?? '', titleX, titleY + 7, { align: "center", maxWidth: contentWidth });

            yPosition = headerY + logoHeight + 15;

            // Metadata
            yPosition = addMetadata(data.metadata, yPosition);

            // Key Metrics
            pdf.setFont("helvetica", "bold");
            yPosition = addWrappedText("Métricas Clave", margin, yPosition, contentWidth);
            pdf.setFont("helvetica", "normal");
            if (data.keyMetrics && data.keyMetrics.length > 0) {
                const metricsPerRow = 3;
                const metricWidth = contentWidth / metricsPerRow;
                const metricHeight = 20;
                const rowsNeeded = Math.ceil(data.keyMetrics.length / metricsPerRow);

                data.keyMetrics.forEach((metric, index) => {
                    const row = Math.floor(index / metricsPerRow);
                    const col = index % metricsPerRow;
                    const x = margin + (col * metricWidth);
                    const y = yPosition + (row * (metricHeight + 5));

                    // Set background color
                    if (Array.isArray(metric.color) && metric.color.length === 3) {
                        pdf.setFillColor(
                            Number(metric.color[0]),
                            Number(metric.color[1]),
                            Number(metric.color[2])
                        );
                    } else {
                        pdf.setFillColor(0, 102, 204); // Default color
                    }
                    pdf.rect(x, y, metricWidth - 5, metricHeight, "F");

                    // Text inside
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(9);
                    pdf.text(metric.title ?? '', x + 5, y + 5);
                    pdf.setFontSize(12);
                    pdf.text(metric.value ?? '', x + 5, y + 12);
                    pdf.setFontSize(8);
                    pdf.text(metric.subtitle ?? '', x + 5, y + 18);
                    pdf.setTextColor(0, 0, 0);
                });

                yPosition += rowsNeeded * (metricHeight + 5) + lineHeight;
            } else {
                yPosition += lineHeight;
            }

            // Statistical Summary
            pdf.setFont("helvetica", "bold");
            // yPosition = addWrappedText("Resumen Estadístico", margin, yPosition, contentWidth);
            if (data.statisticalSummary) {
                autoTable(pdf, {
                    startY: yPosition,
                    head: [data.statisticalSummary.headers ?? []],
                    body: data.statisticalSummary.rows ?? [],
                    margin: { left: margin, right: margin },
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
                    alternateRowStyles: { fillColor: [240, 240, 240] },
                });
                // Avoid using 'any' by declaring a type for pdf with lastAutoTable property
                type PDFWithAutoTable = typeof pdf & { lastAutoTable: { finalY: number } };
                yPosition = (pdf as PDFWithAutoTable).lastAutoTable.finalY + lineHeight;
            } else {
                yPosition += lineHeight;
            }


            // Insights
            // yPosition = addInsights(data.insights, yPosition);

            // Projections
            // pdf.setFont("helvetica", "bold");
            // yPosition = addWrappedText("Proyecciones", margin, yPosition, contentWidth);
            // if (data.projections) {
            //     autoTable(pdf, {
            //         startY: yPosition,
            //         head: [data.projections.headers ?? []],
            //         body: data.projections.rows ?? [],
            //         margin: { left: margin, right: margin },
            //         styles: { fontSize: 8, cellPadding: 2 },
            //         headStyles: { fillColor: [0, 102, 204], textColor: 255 },
            //         alternateRowStyles: { fillColor: [240, 240, 240] },
            //     });
            //     // Avoid using 'any' by declaring a type for pdf with lastAutoTable property
            //     type PDFWithAutoTable = typeof pdf & { lastAutoTable: { finalY: number } };
            //     yPosition = (pdf as PDFWithAutoTable).lastAutoTable.finalY + lineHeight;
            // } else {
            //     yPosition += lineHeight;
            // }

            // Add Chart if available
            if (data.chartImage) {
                const chartHeaderHeight = 10 + lineHeight;
                const originalRatio = 16 / 9; // Assumed aspect ratio
                const maxWidth = contentWidth;
                const maxHeight = pageHeight - margin - 20 - chartHeaderHeight; // Reserve for header and footer
                let imageWidth = maxWidth;
                let imageHeight = imageWidth / originalRatio;

                if (imageHeight > maxHeight) {
                    imageHeight = maxHeight;
                    imageWidth = imageHeight * originalRatio;
                }

                // Check if fits on current page
                const requiredHeight = chartHeaderHeight + imageHeight + 10;
                if (yPosition + requiredHeight > pageHeight - margin - 10) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Chart header
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                // pdf.text("Gráfico de Análisis", pageWidth / 2, yPosition, { align: "center" });
                yPosition += chartHeaderHeight;

                // Add image centered
                const x = margin + (contentWidth - imageWidth) / 2;
                pdf.addImage(data.chartImage, "PNG", x, yPosition, imageWidth, imageHeight);
            }

            // Footer on all pages
            const pageCount = pdf.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(100);
                pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 10, { align: "right" });
                pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, margin, pageHeight - 10);
                pdf.text("Kimenko: Gestión Eficiente de Agua", pageWidth / 2, pageHeight - 10, { align: "center" });
            }

            // Save PDF - Update to use custom filename
            const defaultFilename = `reporte-analisis-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename || defaultFilename);

        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [preparePDFData, filename]);  // Add filename to dependencies

    return (
        <button
            onClick={generateCleanReport}
            disabled={isGenerating}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm disabled:cursor-not-allowed ${className}`}
        >
            {isGenerating ? (
                <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <FileText className="h-4 w-4" />
                    {buttonText}
                </>
            )}
        </button>
    )
}