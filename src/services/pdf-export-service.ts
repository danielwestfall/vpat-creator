import jsPDF from 'jspdf';
import type { Project, TestResult, Component, Screenshot } from '../models/types';
import { wcagService } from './wcag-service';
import { createLogger } from '../utils/logger';
import type { VPATTemplate } from '../models/template-types';

const logger = createLogger('pdf-export');

export interface VPATExportOptions {
  project: Project,
  _components: Component[],
  results: TestResult[],
  screenshots: Screenshot[],
  options: VPATExportOptions,
  template?: VPATTemplate
): Promise<Blob> {
  try {
    logger.info('Generating VPAT PDF', { projectId: project.id, format: options.format });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Helper to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // ========================================================================
    // COVER PAGE
    // ========================================================================
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VPAT® 2.5', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(18);
    doc.text('Voluntary Product Accessibility Template', pageWidth / 2, yPosition, {
      align: 'center',
    });
    yPosition += 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Product: ${project.name}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Version: ${project.vpatConfig.productVersion || 'N/A'}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Conformance Level: ${project.targetConformanceLevel}`, margin, yPosition);
    yPosition += 20;

    // ========================================================================
    // EXECUTIVE SUMMARY (if enabled)
    // ========================================================================
    if (options.includeExecutiveSummary) {
      checkPageBreak(40);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const totalCriteria = results.length;
      const supports = results.filter((r) => r.conformance === 'Supports').length;
      const partiallySupports = results.filter((r) => r.conformance === 'Partially Supports')
        .length;
      const doesNotSupport = results.filter((r) => r.conformance === 'Does Not Support').length;
      const notApplicable = results.filter((r) => r.conformance === 'Not Applicable').length;

      const summaryText = [
        `This report evaluates ${project.name} against WCAG ${project.wcagCustomization?.baseVersion || '2.2'} Level ${project.targetConformanceLevel} success criteria.`,
        '',
        `Total Criteria Evaluated: ${totalCriteria}`,
        `• Supports: ${supports} (${Math.round((supports / totalCriteria) * 100)}%)`,
        `• Partially Supports: ${partiallySupports} (${Math.round((partiallySupports / totalCriteria) * 100)}%)`,
        `• Does Not Support: ${doesNotSupport} (${Math.round((doesNotSupport / totalCriteria) * 100)}%)`,
        `• Not Applicable: ${notApplicable} (${Math.round((notApplicable / totalCriteria) * 100)}%)`,
      ];

      summaryText.forEach((line) => {
        checkPageBreak(7);
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    }

    // ========================================================================
    // WCAG 2.x REPORT TABLE
    // ========================================================================
    checkPageBreak(30);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('WCAG 2.x Report', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Table header
    const customColumns = project.vpatConfig.customColumns || [];
    const hasCustomColumns = customColumns.length > 0;
    
    // Calculate column widths
    // Base widths: Criteria (15), SC (60), Conformance (35), Remarks (60) = 170
    let colWidths = [15, 60, 35, 60];
    let headers = ['Criteria', 'Success Criterion', 'Conformance', 'Remarks'];
    
    if (hasCustomColumns) {
      // Adjust widths to fit custom columns
      // We'll take space from SC and Remarks
      const customColWidth = 25;
      const totalCustomWidth = customColumns.length * customColWidth;
      
      // Minimum widths
      const minScWidth = 40;
      const minRemarksWidth = 40;
      
      // Available width for SC and Remarks after fixed columns
      const fixedWidth = 15 + 35 + totalCustomWidth; // Criteria + Conformance + Custom
      const remainingWidth = contentWidth - fixedWidth;
      
      const scWidth = Math.max(minScWidth, remainingWidth * 0.5);
      const remarksWidth = Math.max(minRemarksWidth, remainingWidth * 0.5);
      
      colWidths = [15, scWidth, 35, ...customColumns.map(() => customColWidth), remarksWidth];
      headers = ['Criteria', 'Success Criterion', 'Conformance', ...customColumns.map(c => c.name), 'Remarks'];
    }

    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');

    let xPos = margin;
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPosition + 6);
      xPos += colWidths[i];
    });
    yPosition += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');

    for (const result of results) {
      const criterion = wcagService.getSuccessCriterionById(result.successCriterionId);
      if (!criterion) continue;

      checkPageBreak(15);

      // Draw row
      xPos = margin;
      let maxRowHeight = 8;

      // 1. Criteria number
      doc.text(criterion.num, xPos + 2, yPosition + 5);
      xPos += colWidths[0];

      // 2. Success Criterion name
      const criterionText = doc.splitTextToSize(criterion.handle, colWidths[1] - 4);
      doc.text(criterionText, xPos + 2, yPosition + 5);
      maxRowHeight = Math.max(maxRowHeight, criterionText.length * 5);
      xPos += colWidths[1];

      // 3. Conformance
      doc.text(result.conformance, xPos + 2, yPosition + 5);
      xPos += colWidths[2];

      // 4. Custom Columns
      if (hasCustomColumns) {
        customColumns.forEach((col, index) => {
          const value = result.customColumnValues?.[col.name] || '-';
          const colText = doc.splitTextToSize(value, colWidths[3 + index] - 4);
          doc.text(colText, xPos + 2, yPosition + 5);
          maxRowHeight = Math.max(maxRowHeight, colText.length * 5);
          xPos += colWidths[3 + index];
        });
      }

      // 5. Remarks
      const remarksText = doc.splitTextToSize(
        result.observations || 'No remarks',
        colWidths[colWidths.length - 1] - 4
      );
      doc.text(remarksText, xPos + 2, yPosition + 5);
      maxRowHeight = Math.max(maxRowHeight, remarksText.length * 5);

      yPosition += maxRowHeight + 2; // Add padding

      // Draw row border
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
    }

    yPosition += 10;

    // ========================================================================
    // SCREENSHOTS (if enabled)
    // ========================================================================
    if (options.includeScreenshots && screenshots.length > 0) {
      checkPageBreak(40);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Screenshots', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      for (const screenshot of screenshots) {
        // Check space for image + caption
        // Assuming max image height of 80mm + 20mm for text
        checkPageBreak(100);

        // Add image
        try {
          // Calculate aspect ratio to fit within content width
          const imgProps = doc.getImageProperties(screenshot.dataUrl);
          const imgRatio = imgProps.width / imgProps.height;
          
          let imgWidth = contentWidth;
          let imgHeight = contentWidth / imgRatio;

          // Limit height if too tall
          if (imgHeight > 100) {
            imgHeight = 100;
            imgWidth = imgHeight * imgRatio;
          }

          doc.addImage(screenshot.dataUrl, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5;

          // Caption
          if (screenshot.caption) {
            doc.setFont('helvetica', 'bold');
            doc.text(`Caption: ${screenshot.caption}`, margin, yPosition);
            yPosition += 5;
          }

          // Metadata
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`ID: ${screenshot.id} | Date: ${new Date(screenshot.uploadedDate).toLocaleDateString()}`, margin, yPosition);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          
          yPosition += 10;
          
          // Separator
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;

        } catch (err) {
          console.error('Error adding image to PDF:', err);
          doc.setTextColor(255, 0, 0);
          doc.text(`[Error loading image: ${screenshot.filename}]`, margin, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 10;
        }
      }
    }

    // ========================================================================
    // FOOTER
    // ========================================================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated by VPAT Creator - ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Generate blob
    const pdfBlob = doc.output('blob');
    logger.info('VPAT PDF generated successfully');

    return pdfBlob;
  } catch (error) {
    logger.error('Failed to generate VPAT PDF:', error);
    throw new Error('Failed to generate VPAT PDF');
  }
}

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
