'use client'
import React, { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import { FileText, Loader } from 'lucide-react'
import type { PDFReportData, PDFReportOptions } from '../../types/components/reports/typesPDFReport'

interface PDFReportGeneratorProps {
    preparePDFData: () => Promise<PDFReportData>
    options?: PDFReportOptions
    className?: string
    buttonText?: string
}

export default function PDFReportGenerator({
    preparePDFData,
    options = {},
    className = '',
    buttonText = 'Generar Reporte PDF'
}: PDFReportGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCleanReport = useCallback(async () => {
        setIsGenerating(true)

        try {
            console.log('🔄 Preparing PDF data...')
            const data = await preparePDFData()
            
            console.log('📊 PDF data prepared')
            console.log('🖼️ Chart image available:', !!data.chartImage)

            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 25
            const contentWidth = pageWidth - (margin * 2)

            // Función para calcular dimensiones de imagen respetando aspect ratio
            const calculateImageDimensions = (originalRatio: number = 16/9) => {
                const maxWidth = contentWidth
                const maxHeight = 120 // Altura máxima disponible
                
                // Calcular dimensiones respetando el aspect ratio
                let imageWidth = maxWidth
                let imageHeight = imageWidth / originalRatio
                
                // Si la altura excede el máximo, ajustar por altura
                if (imageHeight > maxHeight) {
                    imageHeight = maxHeight
                    imageWidth = imageHeight * originalRatio
                }
                
                // Asegurar que no exceda el ancho disponible
                if (imageWidth > maxWidth) {
                    imageWidth = maxWidth
                    imageHeight = imageWidth / originalRatio
                }
                
                return {
                    width: imageWidth,
                    height: imageHeight,
                    x: margin + (contentWidth - imageWidth) / 2 // Centrar horizontalmente
                }
            }

            // ======================
            // FUNCIONES AUXILIARES
            // ======================

            const addCleanHeader = (title: string, subtitle?: string) => {
                pdf.setFillColor(30, 64, 175)
                pdf.rect(0, 0, pageWidth, 8, 'F')

                pdf.setTextColor(55, 65, 81)
                pdf.setFontSize(24)
                pdf.setFont('helvetica', 'bold')
                pdf.text(title, margin, 35)

                if (subtitle) {
                    pdf.setFontSize(14)
                    pdf.setFont('helvetica', 'normal')
                    pdf.setTextColor(107, 114, 128)
                    pdf.text(subtitle, margin, 45)
                }

                pdf.setDrawColor(229, 231, 235)
                pdf.setLineWidth(0.5)
                pdf.line(margin, 55, pageWidth - margin, 55)

                return 70
            }

            const addSection = (title: string, yPos: number) => {
                pdf.setFontSize(16)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(30, 64, 175)
                pdf.text(title, margin, yPos)

                pdf.setDrawColor(30, 64, 175)
                pdf.setLineWidth(1)
                pdf.line(margin, yPos + 3, margin + 80, yPos + 3)

                return yPos + 15
            }

            const addKeyMetrics = (metrics: PDFReportData['keyMetrics'], yPos: number) => {
                const metricsPerRow = 2
                const cardWidth = (contentWidth - 10) / metricsPerRow
                const cardHeight = 40

                metrics.forEach((metric, index) => {
                    const col = index % metricsPerRow
                    const row = Math.floor(index / metricsPerRow)
                    const x = margin + (col * (cardWidth + 10))
                    const y = yPos + (row * (cardHeight + 15))

                    // Fondo de la tarjeta
                    pdf.setFillColor(255, 255, 255)
                    pdf.rect(x, y, cardWidth, cardHeight, 'F')

                    // Borde sutil
                    pdf.setDrawColor(229, 231, 235)
                    pdf.setLineWidth(0.5)
                    pdf.rect(x, y, cardWidth, cardHeight, 'S')

                    // Acento de color
                    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2])
                    pdf.rect(x, y, cardWidth, 3, 'F')

                    // Contenido
                    pdf.setFontSize(10)
                    pdf.setFont('helvetica', 'normal')
                    pdf.setTextColor(107, 114, 128)
                    pdf.text(metric.title, x + 8, y + 15)

                    pdf.setFontSize(20)
                    pdf.setFont('helvetica', 'bold')
                    pdf.setTextColor(55, 65, 81)
                    const valueText = metric.value.replace(/[↗↘→]/g, '').trim()
                    pdf.text(valueText, x + 8, y + 28)

                    pdf.setFontSize(9)
                    pdf.setFont('helvetica', 'normal')
                    pdf.setTextColor(107, 114, 128)
                    pdf.text(metric.subtitle, x + 8, y + 36)
                })

                const totalRows = Math.ceil(metrics.length / metricsPerRow)
                return yPos + (totalRows * (cardHeight + 15))
            }

            // ================================
            // GENERACIÓN DEL CONTENIDO
            // ================================

            let yPosition = addCleanHeader(
                data.title || 'Informe de Análisis de agua',
                data.subtitle || 'Sistema Xylem'
            )

            // Información del documento
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(107, 114, 128)

            const currentDate = new Date().toLocaleDateString('es-ES')
            pdf.text(`Generado: ${currentDate}`, margin, yPosition)
            
            if (data.metadata?.['Período analizado']) {
                pdf.text(`Período: ${data.metadata['Período analizado']}`, margin + 60, yPosition)
            }
            
            if (data.metadata?.['Total de registros']) {
                pdf.text(`Registros: ${data.metadata['Total de registros']}`, margin + 120, yPosition)
            }

            yPosition += 20

            // Métricas principales
            yPosition = addSection('Métricas Principales', yPosition)
            yPosition = addKeyMetrics(data.keyMetrics.slice(0, 4), yPosition)
            yPosition += 15

            // GRÁFICO - LÓGICA MEJORADA DE DIMENSIONAMIENTO
            if (data.chartImage) {
                console.log('📈 Adding chart to PDF...')
                
                // Verificar que hay suficiente espacio
                const spaceNeeded = 130 // Espacio necesario para el gráfico + margen
                if (yPosition + spaceNeeded > pageHeight - 30) {
                    console.log('📄 Adding new page for chart')
                    pdf.addPage()
                    yPosition = addCleanHeader('Visualización de Datos')
                } else {
                    yPosition = addSection('Gráfico de Consumo', yPosition)
                }

                try {
                    // Calcular dimensiones óptimas
                    const imageDimensions = calculateImageDimensions(16/9) // Aspect ratio típico de charts
                    
                    console.log(`📐 Image dimensions: ${imageDimensions.width}x${imageDimensions.height}`)
                    console.log(`📍 Image position: x=${imageDimensions.x}, y=${yPosition}`)

                    // Marco decorativo para la imagen
                    pdf.setDrawColor(30, 64, 175) // Color primario
                    pdf.setLineWidth(1)
                    pdf.rect(
                        imageDimensions.x - 3, 
                        yPosition - 3, 
                        imageDimensions.width + 6, 
                        imageDimensions.height + 6, 
                        'S'
                    )

                    // Fondo blanco para la imagen
                    pdf.setFillColor(255, 255, 255)
                    pdf.rect(
                        imageDimensions.x - 2, 
                        yPosition - 2, 
                        imageDimensions.width + 4, 
                        imageDimensions.height + 4, 
                        'F'
                    )

                    // Agregar la imagen del gráfico
                    pdf.addImage(
                        data.chartImage, 
                        'PNG', 
                        imageDimensions.x, 
                        yPosition, 
                        imageDimensions.width, 
                        imageDimensions.height
                    )

                    console.log('✅ Chart image added successfully to PDF')
                    yPosition += imageDimensions.height + 20

                } catch (error) {
                    console.error('❌ Error adding chart image to PDF:', error)
                    
                    // Fallback: mostrar un mensaje de error elegante
                    const fallbackHeight = 60
                    pdf.setDrawColor(220, 38, 38)
                    pdf.setLineWidth(1)
                    pdf.rect(margin, yPosition, contentWidth, fallbackHeight, 'S')
                    
                    pdf.setFontSize(12)
                    pdf.setTextColor(220, 38, 38)
                    pdf.text('⚠️ Gráfico no disponible', margin + contentWidth/2 - 30, yPosition + 20)
                    
                    pdf.setFontSize(10)
                    pdf.setTextColor(107, 114, 128)
                    pdf.text('Error al cargar la visualización de datos', margin + contentWidth/2 - 40, yPosition + 35)
                    
                    yPosition += fallbackHeight + 15
                }
            } else {
                console.warn('⚠️ No chart image provided for PDF')
                
                // Mensaje informativo cuando no hay gráfico
                yPosition = addSection('Gráfico de Consumo', yPosition)
                pdf.setFontSize(10)
                pdf.setTextColor(107, 114, 128)
                pdf.text('Gráfico no disponible en este reporte', margin + contentWidth/2 - 40, yPosition + 20)
                yPosition += 40
            }

            // Resumen estadístico (si hay espacio)
            if (yPosition < pageHeight - 100) {
                yPosition = addSection('Resumen Estadístico', yPosition)
                
                // Tabla simplificada
                const rowHeight = 12
                const headers = data.statisticalSummary.headers
                const rows = data.statisticalSummary.rows.slice(0, 4) // Solo las primeras 4

                // Header de tabla
                pdf.setFillColor(239, 246, 255)
                pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F')

                pdf.setFontSize(10)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(55, 65, 81)

                const colWidth = contentWidth / headers.length
                headers.forEach((header, index) => {
                    pdf.text(header, margin + (index * colWidth) + 5, yPosition + 8)
                })

                yPosition += rowHeight

                // Filas de datos
                pdf.setFont('helvetica', 'normal')
                pdf.setFontSize(9)

                rows.forEach((row, rowIndex) => {
                    if (rowIndex % 2 === 0) {
                        pdf.setFillColor(250, 250, 250)
                        pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F')
                    }

                    pdf.setTextColor(55, 65, 81)
                    row.forEach((cell, cellIndex) => {
                        const truncated = cell.length > 20 ? cell.substring(0, 20) + '...' : cell
                        pdf.text(truncated, margin + (cellIndex * colWidth) + 5, yPosition + 8)
                    })

                    yPosition += rowHeight
                })
            }

            // Footer profesional
            const addCleanFooter = () => {
                const footerY = pageHeight - 20
                
                pdf.setDrawColor(229, 231, 235)
                pdf.setLineWidth(0.5)
                pdf.line(margin, footerY, pageWidth - margin, footerY)

                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(107, 114, 128)
                
                pdf.text('Sistema de Análisis de agua sensores Xylem', margin, footerY + 8)
                pdf.text(currentDate, pageWidth - margin - 25, footerY + 8)
                pdf.text('Página 1', pageWidth - margin - 15, footerY + 12)
            }

            addCleanFooter()

            // Guardar PDF
            const fileName = options.filename || `xylem-report-${new Date().toISOString().slice(0, 10)}.pdf`
            pdf.save(fileName)

            console.log('✅ PDF generated successfully:', fileName)

        } catch (error) {
            console.error('❌ Error generating PDF report:', error)
            alert('Error al generar el reporte. Por favor, inténtelo de nuevo.')
        } finally {
            setIsGenerating(false)
        }
    }, [preparePDFData, options])

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