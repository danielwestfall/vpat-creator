import type { TestResult } from '../models/types';
import type { TestingScheduleItem } from '../utils/testing-schedule-generator';

export class CSVExportService {
  public generateCSV(results: TestResult[], schedule: TestingScheduleItem[]): string {
    const headers = [
      'SC Number',
      'SC Title',
      'Level',
      'Conformance Status',
      'Notes',
      'Tested By',
      'Date',
      'Tools Used'
    ];

    // Iterate through the schedule to ensure order and include untested items
    const allRows = schedule.map(sc => {
      const result = results.find(r => r.successCriterionId === sc.id);
      
      const status = result ? result.conformance : 'Not Tested';
      const notes = result ? (result.observations || result.customNotes || '') : '';
      const testedBy = result?.testedBy || '';
      const date = result?.testedDate ? new Date(result.testedDate).toLocaleDateString() : '';
      const tools = result?.testingMethod.tools?.join(', ') || '';

      return [
        sc.scNumber,
        sc.scTitle,
        sc.scLevel,
        status,
        notes,
        testedBy,
        date,
        tools
      ].map(this.escapeCSV).join(',');
    });

    return [headers.join(','), ...allRows].join('\n');
  }

  public downloadCSV(csvContent: string, filename: string): void {
    // Add BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  private escapeCSV(field: string | undefined | null): string {
    if (field === undefined || field === null) return '';
    const stringField = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }
}

export const csvExportService = new CSVExportService();
