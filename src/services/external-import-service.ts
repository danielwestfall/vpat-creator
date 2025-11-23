import { axeService, type AxeScanResult, type MappedResult } from './axe-service';
import type { Result } from 'axe-core';

interface RawAxeResult {
  violations?: Result[];
  passes?: Result[];
  incomplete?: Result[];
  inapplicable?: Result[];
  timestamp?: string;
  testEngine?: { name: string };
  toolOptions?: unknown;
}

export interface ExternalImportResult {
  success: boolean;
  data?: MappedResult[];
  summary?: {
    total: number;
    violations: number;
    passes: number;
    incomplete: number;
  };
  errors?: string[];
  source?: 'axe-core' | 'unknown';
}

export const externalImportService = {
  /**
   * Parse an uploaded file and attempt to convert it to VPAT results
   */
  async parseImportFile(file: File): Promise<ExternalImportResult> {
    try {
      const text = await file.text();
      let json: unknown;
      
      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: false,
          errors: ['Invalid JSON file format']
        };
      }

      // Detect format
      if (this.isAxeResult(json)) {
        return this.processAxeResult(json);
      }

      return {
        success: false,
        errors: ['Unknown file format. Currently only axe-core JSON exports are supported.']
      };

    } catch (error) {
      console.error('External import failed:', error);
      return {
        success: false,
        errors: ['Failed to read file']
      };
    }
  },

  /**
   * Check if the JSON matches axe-core result structure
   */
  isAxeResult(json: unknown): json is RawAxeResult {
    if (typeof json !== 'object' || json === null) return false;
    const candidate = json as RawAxeResult;
    return Array.isArray(candidate.violations) && 
           Array.isArray(candidate.passes) && 
           Array.isArray(candidate.incomplete) &&
           (candidate.testEngine?.name === 'axe-core' || !!candidate.toolOptions);
  },

  /**
   * Process axe-core JSON data
   */
  processAxeResult(json: RawAxeResult): ExternalImportResult {
    const axeResult: AxeScanResult = {
      violations: json.violations || [],
      passes: json.passes || [],
      incomplete: json.incomplete || [],
      inapplicable: json.inapplicable || [],
      timestamp: new Date(json.timestamp || Date.now())
    };

    const mappedResults = axeService.mapResultsToWCAG(axeResult);

    return {
      success: true,
      data: mappedResults,
      source: 'axe-core',
      summary: {
        total: (json.violations?.length || 0) + (json.passes?.length || 0) + (json.incomplete?.length || 0),
        violations: json.violations?.length || 0,
        passes: json.passes?.length || 0,
        incomplete: json.incomplete?.length || 0
      }
    };
  }
};
