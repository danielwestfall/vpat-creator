import jsPDF from 'jspdf';
import type { Project, TestResult, Component, Screenshot } from '../models/types';
import { wcagService } from './wcag-service';
import { createLogger } from '../utils/logger';
import type { VPATTemplate } from '../models/template-types';

const logger = createLogger('pdf-export');

export interface VPATExportOptions {
  project: Project;
  components: Component[];
  results: TestResult[];
  screenshots: Screenshot[];
  options: {
    format: '2.4' | '2.5-international';
    tone: 'formal' | 'friendly';
    includeExecutiveSummary: boolean;
    includeScreenshots: boolean;
  };
  template?: VPATTemplate;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// Helper to map font family to standard PDF fonts
function getFontFamily(font: string): string {
  const lower = font.toLowerCase();
  if (lower.includes('times') || lower.includes('georgia')) return 'times';
  if (lower.includes('courier')) return 'courier';
  return 'helvetica';
}

export async function generateVPATPDF(
  project: Project,
  results: TestResult[],
  screenshots: Screenshot[],
  options: VPATExportOptions['options'],
  template?: VPATTemplate
): Promise<Blob> {
  try {
    logger.info('Generating VPAT PDF', { projectId: project.id, format: options.format });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Default styling if no template provided
    const styling = template?.styling || {
      primaryColor: '#000000',
      secondaryColor: '#666666',
      fontFamily: 'Arial',
      fontSize: 11,
      tableStyle: 'bordered',
      headerStyle: 'bold',
    };

    const headerConfig = template?.header || {
      companyName: '',
      reportTitle: 'Voluntary Product Accessibility Template (VPAT®)',
      includeDate: true,
      includePageNumbers: true,
    };

    const sections = template?.sections || {
      executiveSummary: { enabled: options.includeExecutiveSummary, title: 'Executive Summary' },
      productInfo: { enabled: true, title: 'Product Information' },
      evaluationMethods: { enabled: true, title: 'Evaluation Methods Used' },
      applicableCriteria: { enabled: true, title: 'Applicable Standards/Guidelines' },
      legalDisclaimer: {
        enabled: true,
        content: 'This document is provided for information purposes only.',
      },
    };

    const columns = template?.columns || {
      criterionNumber: true,
      criterionName: true,
      levelColumn: true,
      conformanceStatus: true,
      remarks: true,
      customColumns: [],
    };

    const primaryColor = hexToRgb(styling.primaryColor);
    const secondaryColor = hexToRgb(styling.secondaryColor);
    const fontFamily = getFontFamily(styling.fontFamily);
    const baseFontSize = styling.fontSize;

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

    // Helper to set primary font/color
    const setPrimaryStyle = (size = baseFontSize + 2, bold = true) => {
      doc.setFont(fontFamily, bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    };

    // Helper to set secondary font/color
    const setSecondaryStyle = (size = baseFontSize, bold = false) => {
      doc.setFont(fontFamily, bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    };

    // Helper to set body font/color
    const setBodyStyle = (size = baseFontSize, bold = false) => {
      doc.setFont(fontFamily, bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(0, 0, 0);
    };

    // ========================================================================
    // COVER PAGE
    // ========================================================================
    setPrimaryStyle(24, true);
    doc.text(headerConfig.reportTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    if (headerConfig.companyName) {
      setSecondaryStyle(18, true);
      doc.text(headerConfig.companyName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
    }

    setBodyStyle(14);
    doc.text(`Product: ${project.name}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Version: ${project.vpatConfig.productVersion || 'N/A'}`, margin, yPosition);
    yPosition += 10;

    if (headerConfig.includeDate) {
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;
    }

    doc.text(`Conformance Level: ${project.targetConformanceLevel}`, margin, yPosition);
    yPosition += 20;

    // ========================================================================
    // EXECUTIVE SUMMARY (if enabled)
    // ========================================================================
    if (sections.executiveSummary.enabled) {
      checkPageBreak(40);

      setPrimaryStyle(16, true);
      doc.text(sections.executiveSummary.title, margin, yPosition);
      yPosition += 10;

      setBodyStyle(baseFontSize);

      const totalCriteria = results.length;
      const supports = results.filter((r) => r.conformance === 'Supports').length;
      const partiallySupports = results.filter(
        (r) => r.conformance === 'Partially Supports'
      ).length;
      const doesNotSupport = results.filter((r) => r.conformance === 'Does Not Support').length;
      const notApplicable = results.filter((r) => r.conformance === 'Not Applicable').length;

      const defaultSummary = `This report evaluates ${project.name} against WCAG ${project.wcagCustomization?.baseVersion || '2.2'} Level ${project.targetConformanceLevel} success criteria.`;
      const content = sections.executiveSummary.defaultContent || defaultSummary;

      const splitContent = doc.splitTextToSize(content, contentWidth);
      doc.text(splitContent, margin, yPosition);
      yPosition += splitContent.length * 5 + 5;

      const summaryStats = [
        `Total Criteria Evaluated: ${totalCriteria}`,
        `• Supports: ${supports} (${Math.round((supports / totalCriteria) * 100)}%)`,
        `• Partially Supports: ${partiallySupports} (${Math.round((partiallySupports / totalCriteria) * 100)}%)`,
        `• Does Not Support: ${doesNotSupport} (${Math.round((doesNotSupport / totalCriteria) * 100)}%)`,
        `• Not Applicable: ${notApplicable} (${Math.round((notApplicable / totalCriteria) * 100)}%)`,
      ];

      summaryStats.forEach((line) => {
        checkPageBreak(7);
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    }

    // ========================================================================
    // LEGAL DISCLAIMER (if enabled)
    // ========================================================================
    if (sections.legalDisclaimer.enabled) {
      checkPageBreak(30);
      setSecondaryStyle(baseFontSize - 1, true);
      doc.text('Legal Disclaimer', margin, yPosition);
      yPosition += 5;

      setSecondaryStyle(baseFontSize - 2, false);
      const disclaimer = doc.splitTextToSize(sections.legalDisclaimer.content, contentWidth);
      doc.text(disclaimer, margin, yPosition);
      yPosition += disclaimer.length * 4 + 10;
    }

    // ========================================================================
    // WCAG 2.x REPORT TABLE
    // ========================================================================
    checkPageBreak(30);

    setPrimaryStyle(16, true);
    doc.text('WCAG 2.x Report', margin, yPosition);
    yPosition += 10;

    setBodyStyle(10);

    // Determine columns to show
    const activeColumns: { id: string; label: string; width: number }[] = [];

    if (columns.criterionNumber) activeColumns.push({ id: 'number', label: 'Criteria', width: 15 });
    if (columns.criterionName)
      activeColumns.push({ id: 'name', label: 'Success Criterion', width: 50 });
    if (columns.levelColumn) activeColumns.push({ id: 'level', label: 'Level', width: 15 });
    if (columns.conformanceStatus)
      activeColumns.push({ id: 'status', label: 'Conformance', width: 35 });

    // Add custom columns from template or project
    const customCols =
      columns.customColumns.length > 0
        ? columns.customColumns
        : (project.vpatConfig.customColumns || []).map((c) => ({
            id: c.name,
            name: c.name,
            width: 25,
          }));

    customCols.forEach((col) => {
      activeColumns.push({ id: col.id, label: col.name, width: col.width || 25 });
    });

    if (columns.remarks) activeColumns.push({ id: 'remarks', label: 'Remarks', width: 50 });

    // Recalculate widths to fit page
    const totalFixedWidth = activeColumns.reduce((sum, col) => sum + col.width, 0);
    const scaleFactor = contentWidth / totalFixedWidth;
    activeColumns.forEach((col) => (col.width *= scaleFactor));

    // Draw Header
    doc.setFont(fontFamily, 'bold');

    // Header background
    if (styling.headerStyle === 'background' || styling.headerStyle === 'both') {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255); // White text on colored header
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(0, 0, 0);
    }

    let xPos = margin;
    activeColumns.forEach((col) => {
      doc.text(col.label, xPos + 2, yPosition + 6);
      xPos += col.width;
    });
    yPosition += 8;

    // Draw Rows
    doc.setTextColor(0, 0, 0); // Reset text color
    doc.setFont(fontFamily, 'normal');

    let rowIndex = 0;
    for (const result of results) {
      const criterion = wcagService.getSuccessCriterionById(result.successCriterionId);
      if (!criterion) continue;

      checkPageBreak(15);

      // Striped rows
      if (styling.tableStyle === 'striped' && rowIndex % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition, contentWidth, 20, 'F'); // Approx height, will be redrawn if needed? No, difficult in PDF.
        // Actually, we need to calculate height first.
      }

      xPos = margin;
      let maxRowHeight = 8;
      const rowData: { text: string; x: number; width: number }[] = [];

      // Prepare data
      activeColumns.forEach((col) => {
        let text = '';
        if (col.id === 'number') text = criterion.num;
        else if (col.id === 'name') text = criterion.handle;
        else if (col.id === 'level') text = criterion.level;
        else if (col.id === 'status') text = result.conformance;
        else if (col.id === 'remarks') text = result.observations || 'No remarks';
        else {
          // Custom column
          text = result.customColumnValues?.[col.label] || '-';
        }

        const splitText = doc.splitTextToSize(text, col.width - 4);
        rowData.push({ text: splitText, x: xPos, width: col.width });
        maxRowHeight = Math.max(maxRowHeight, splitText.length * 5);
        xPos += col.width;
      });

      // Draw background for striped if needed (now that we know height)
      if (styling.tableStyle === 'striped' && rowIndex % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition, contentWidth, maxRowHeight + 2, 'F');
      }

      // Draw text
      rowData.forEach((data) => {
        doc.text(data.text, data.x + 2, yPosition + 5);
      });

      yPosition += maxRowHeight + 2;

      // Draw borders
      if (styling.tableStyle === 'bordered') {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
      } else if (styling.tableStyle === 'minimal') {
        // Only line at bottom of row?
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
      }

      rowIndex++;
    }

    yPosition += 10;

    // ========================================================================
    // SCREENSHOTS (if enabled)
    // ========================================================================
    if (options.includeScreenshots && screenshots.length > 0) {
      checkPageBreak(40);

      setPrimaryStyle(16, true);
      doc.text('Screenshots', margin, yPosition);
      yPosition += 10;

      setBodyStyle(10);

      for (const screenshot of screenshots) {
        checkPageBreak(100);

        try {
          const imgProps = doc.getImageProperties(screenshot.dataUrl);
          const imgRatio = imgProps.width / imgProps.height;

          let imgWidth = contentWidth;
          let imgHeight = contentWidth / imgRatio;

          if (imgHeight > 100) {
            imgHeight = 100;
            imgWidth = imgHeight * imgRatio;
          }

          doc.addImage(screenshot.dataUrl, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5;

          if (screenshot.caption) {
            doc.setFont(fontFamily, 'bold');
            doc.text(`Caption: ${screenshot.caption}`, margin, yPosition);
            yPosition += 5;
          }

          doc.setFont(fontFamily, 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `ID: ${screenshot.id} | Date: ${new Date(screenshot.uploadedDate).toLocaleDateString()}`,
            margin,
            yPosition
          );
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);

          yPosition += 10;

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
    if (headerConfig.includePageNumbers) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont(fontFamily, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(
          `Generated by VPAT Creator - ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    }

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
