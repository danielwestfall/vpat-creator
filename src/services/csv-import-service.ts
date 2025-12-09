import type { TestResult, ConformanceStatus } from '../models/types';
import { wcagService } from './wcag-service';

export interface ImportResult {
  success: boolean;
  data?: TestResult[];
  errors?: string[];
  summary?: {
    total: number;
    imported: number;
    skipped: number;
  };
}

export class CSVImportService {
  public async parseCSV(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const result = this.processCSVText(text);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            errors: [
              `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`,
            ],
          });
        }
      };
      reader.onerror = () => {
        resolve({
          success: false,
          errors: ['Failed to read file'],
        });
      };
      reader.readAsText(file);
    });
  }

  private processCSVText(text: string): ImportResult {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) {
      return { success: false, errors: ['File is empty or missing headers'] };
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    // Map column indices
    const colMap = {
      scNumber: headers.findIndex(
        (h) => h.includes('sc number') || h.includes('criterion') || h === 'id'
      ),
      status: headers.findIndex((h) => h.includes('status') || h.includes('conformance')),
      notes: headers.findIndex(
        (h) => h.includes('notes') || h.includes('observations') || h.includes('remarks')
      ),
      testedBy: headers.findIndex((h) => h.includes('tested by') || h.includes('tester')),
      tools: headers.findIndex((h) => h.includes('tools')),
      level: headers.findIndex((h) => h.includes('level')),
    };

    if (colMap.scNumber === -1 || colMap.status === -1) {
      return {
        success: false,
        errors: ['Could not find required columns: "SC Number" and "Conformance Status"'],
      };
    }

    const results: TestResult[] = [];
    const errors: string[] = [];
    let skipped = 0;

    // Process rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = this.parseCSVLine(line);

      // Get SC Number
      const scNumber = cols[colMap.scNumber]?.trim();
      if (!scNumber) {
        skipped++;
        continue;
      }

      // Find SC ID
      const sc = wcagService.getSuccessCriterionByNumber(scNumber);
      if (!sc) {
        // Try to find by ID if number lookup fails (maybe they used ID in the number column)
        const scById = wcagService.getSuccessCriterionById(scNumber);
        if (!scById) {
          errors.push(`Row ${i + 1}: Unknown Success Criterion "${scNumber}"`);
          skipped++;
          continue;
        }
      }

      const finalSC = sc || wcagService.getSuccessCriterionById(scNumber)!;

      // Parse Status
      const statusRaw = cols[colMap.status]?.trim();
      const status = this.normalizeStatus(statusRaw);

      if (!status) {
        errors.push(`Row ${i + 1}: Invalid status "${statusRaw}" for ${scNumber}`);
        skipped++;
        continue;
      }

      // Create Result
      const result: TestResult = {
        id: finalSC.id, // Use SC ID as Result ID for simplicity in import, or generate new?
        // Ideally we match the ID of the SC.
        successCriterionId: finalSC.id,
        level: finalSC.level,
        conformance: status,
        observations: cols[colMap.notes] || '',
        barriers: [],
        testingMethod: {
          type: 'Manual',
          tools: cols[colMap.tools] ? cols[colMap.tools].split(',').map((t) => t.trim()) : [],
        },
        customNotes: cols[colMap.notes] || '',
        testedBy: cols[colMap.testedBy] || 'Imported',
        testedDate: new Date(),
      };

      results.push(result);
    }

    return {
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: lines.length - 1, // minus header
        imported: results.length,
        skipped,
      },
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private normalizeStatus(status: string): ConformanceStatus | undefined {
    if (!status) return undefined;
    const s = status.toLowerCase().trim();

    if (s.includes('not applicable') || s === 'n/a' || s === 'na') return 'Not Applicable';
    if (s.includes('partially') || s === 'partial') return 'Partially Supports';
    if (s.includes('does not') || s === 'fail' || s === 'failed' || s === 'non-compliant')
      return 'Does Not Support';
    if (s.includes('supports') || s === 'pass' || s === 'passed' || s === 'compliant')
      return 'Supports';

    return undefined;
  }
}

export const csvImportService = new CSVImportService();
