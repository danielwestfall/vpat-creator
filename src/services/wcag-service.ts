import type {
  WCAGData,
  WCAGPrinciple,
  WCAGGuideline,
  WCAGSuccessCriterion,
  ConformanceLevel,
} from '../models/types';
import wcagData from '../assets/wcag22.json';

// ============================================================================
// WCAG SERVICE
// ============================================================================

class WCAGService {
  private data: WCAGData;

  constructor() {
    this.data = JSON.parse(JSON.stringify(wcagData)) as WCAGData; // Deep copy to allow modification
    this.loadCustomCriteria();
  }

  /**
   * Load custom criteria from local storage and inject into data
   */
  private loadCustomCriteria() {
    try {
      const customCriteriaJson = localStorage.getItem('vpat_custom_criteria');
      if (customCriteriaJson) {
        const customCriteria = JSON.parse(customCriteriaJson) as WCAGSuccessCriterion[];

        if (customCriteria.length > 0) {
          // Check if Custom Principle exists
          let customPrinciple = this.data.principles.find((p) => p.id === 'custom');

          if (!customPrinciple) {
            customPrinciple = {
              id: 'custom',
              num: '5',
              handle: 'Custom',
              title: 'Custom Criteria',
              content: 'User-defined success criteria',
              versions: ['2.2'],
              guidelines: [
                {
                  id: 'custom-guideline',
                  num: '5.1',
                  handle: 'Custom Guidelines',
                  title: 'Custom Guidelines',
                  content: 'User-defined guidelines',
                  versions: ['2.2'],
                  successcriteria: [],
                },
              ],
            };
            this.data.principles.push(customPrinciple);
          }

          // Add criteria to the first guideline of the custom principle
          if (customPrinciple.guidelines.length > 0) {
            customPrinciple.guidelines[0].successcriteria = customCriteria;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load custom criteria:', error);
    }
  }

  /**
   * Add a new custom success criterion
   */
  addCustomCriterion(criterion: WCAGSuccessCriterion) {
    try {
      const existing = this.getSuccessCriterionById(criterion.id);
      if (existing) {
        throw new Error(`Criterion with ID ${criterion.id} already exists`);
      }

      // Get current custom criteria
      const customCriteriaJson = localStorage.getItem('vpat_custom_criteria');
      const customCriteria = customCriteriaJson
        ? (JSON.parse(customCriteriaJson) as WCAGSuccessCriterion[])
        : [];

      customCriteria.push(criterion);
      localStorage.setItem('vpat_custom_criteria', JSON.stringify(customCriteria));

      // Reload data
      this.loadCustomCriteria();
    } catch (error) {
      console.error('Failed to add custom criterion:', error);
      throw error;
    }
  }

  /**
   * Remove a custom success criterion
   */
  removeCustomCriterion(id: string) {
    try {
      const customCriteriaJson = localStorage.getItem('vpat_custom_criteria');
      if (customCriteriaJson) {
        let customCriteria = JSON.parse(customCriteriaJson) as WCAGSuccessCriterion[];
        customCriteria = customCriteria.filter((c) => c.id !== id);
        localStorage.setItem('vpat_custom_criteria', JSON.stringify(customCriteria));

        // Reload data - simpler to just reset and reload
        this.data = JSON.parse(JSON.stringify(wcagData)) as WCAGData;
        this.loadCustomCriteria();
      }
    } catch (error) {
      console.error('Failed to remove custom criterion:', error);
      throw error;
    }
  }

  /**
   * Get all WCAG principles
   */
  getPrinciples(): WCAGPrinciple[] {
    return this.data.principles;
  }

  /**
   * Get a specific principle by ID
   */
  getPrincipleById(id: string): WCAGPrinciple | undefined {
    return this.data.principles.find((p) => p.id === id);
  }

  /**
   * Get all guidelines
   */
  getGuidelines(): WCAGGuideline[] {
    return this.data.principles.flatMap((p) => p.guidelines);
  }

  /**
   * Get a specific guideline by ID
   */
  getGuidelineById(id: string): WCAGGuideline | undefined {
    for (const principle of this.data.principles) {
      const guideline = principle.guidelines.find((g) => g.id === id);
      if (guideline) return guideline;
    }
    return undefined;
  }

  /**
   * Get all success criteria
   */
  getAllSuccessCriteria(): WCAGSuccessCriterion[] {
    return this.data.principles.flatMap((p) => p.guidelines.flatMap((g) => g.successcriteria));
  }

  /**
   * Get success criteria filtered by level
   */
  getSuccessCriteriaByLevel(level: ConformanceLevel): WCAGSuccessCriterion[] {
    return this.getAllSuccessCriteria().filter((sc) => sc.level === level);
  }

  /**
   * Get success criteria up to and including a specific level
   * (e.g., 'AA' returns both A and AA criteria)
   */
  getSuccessCriteriaUpToLevel(level: ConformanceLevel): WCAGSuccessCriterion[] {
    const levels: ConformanceLevel[] = ['A', 'AA', 'AAA'];
    const maxIndex = levels.indexOf(level);
    const includedLevels = levels.slice(0, maxIndex + 1);

    return this.getAllSuccessCriteria().filter((sc) => includedLevels.includes(sc.level));
  }

  /**
   * Get a specific success criterion by ID (e.g., "non-text-content")
   */
  getSuccessCriterionById(id: string): WCAGSuccessCriterion | undefined {
    for (const principle of this.data.principles) {
      for (const guideline of principle.guidelines) {
        const sc = guideline.successcriteria.find((s) => s.id === id);
        if (sc) return sc;
      }
    }
    return undefined;
  }

  /**
   * Get a specific success criterion by number (e.g., "1.1.1")
   */
  getSuccessCriterionByNumber(num: string): WCAGSuccessCriterion | undefined {
    for (const principle of this.data.principles) {
      for (const guideline of principle.guidelines) {
        const sc = guideline.successcriteria.find((s) => s.num === num);
        if (sc) return sc;
      }
    }
    return undefined;
  }

  /**
   * Search success criteria by text in title or handle
   */
  searchSuccessCriteria(query: string): WCAGSuccessCriterion[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllSuccessCriteria().filter(
      (sc) =>
        sc.handle.toLowerCase().includes(lowerQuery) ||
        sc.title.toLowerCase().includes(lowerQuery) ||
        sc.num.includes(query)
    );
  }

  /**
   * Get success criteria count by level
   */
  getCountByLevel(): Record<ConformanceLevel, number> {
    const all = this.getAllSuccessCriteria();
    return {
      A: all.filter((sc) => sc.level === 'A').length,
      AA: all.filter((sc) => sc.level === 'AA').length,
      AAA: all.filter((sc) => sc.level === 'AAA').length,
    };
  }

  /**
   * Get parent guideline for a success criterion
   */
  getParentGuideline(successCriterionId: string): WCAGGuideline | undefined {
    for (const principle of this.data.principles) {
      for (const guideline of principle.guidelines) {
        const found = guideline.successcriteria.some((sc) => sc.id === successCriterionId);
        if (found) return guideline;
      }
    }
    return undefined;
  }

  /**
   * Get parent principle for a success criterion
   */
  getParentPrinciple(successCriterionId: string): WCAGPrinciple | undefined {
    for (const principle of this.data.principles) {
      const found = principle.guidelines.some((g) =>
        g.successcriteria.some((sc) => sc.id === successCriterionId)
      );
      if (found) return principle;
    }
    return undefined;
  }

  /**
   * Get breadcrumb path for a success criterion
   * Returns: [Principle, Guideline, Success Criterion]
   */
  getBreadcrumb(successCriterionId: string) {
    const principle = this.getParentPrinciple(successCriterionId);
    const guideline = this.getParentGuideline(successCriterionId);
    const sc = this.getSuccessCriterionById(successCriterionId);

    return {
      principle,
      guideline,
      successCriterion: sc,
    };
  }

  /**
   * Get total count of success criteria
   */
  getTotalCount(): number {
    return this.getAllSuccessCriteria().length;
  }

  /**
   * Group success criteria by guideline
   */
  getSuccessCriteriaGroupedByGuideline() {
    const grouped: Record<string, { guideline: WCAGGuideline; criteria: WCAGSuccessCriterion[] }> =
      {};

    for (const principle of this.data.principles) {
      for (const guideline of principle.guidelines) {
        grouped[guideline.id] = {
          guideline,
          criteria: guideline.successcriteria,
        };
      }
    }

    return grouped;
  }

  /**
   * Get techniques for a success criterion
   */
  getTechniques(successCriterionId: string) {
    const sc = this.getSuccessCriterionById(successCriterionId);
    return sc?.techniques || { sufficient: [], advisory: [], failure: [] };
  }
}

// Export singleton instance
export const wcagService = new WCAGService();
