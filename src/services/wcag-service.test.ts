import { describe, it, expect } from 'vitest';
import { wcagService } from './wcag-service';

describe('WCAGService', () => {
  describe('getPrinciples', () => {
    it('returns all WCAG principles', () => {
      const principles = wcagService.getPrinciples();
      
      expect(principles).toHaveLength(4);
      expect(principles[0].num).toBe('1');
      expect(principles[0].handle).toBe('Perceivable');
      expect(principles[1].num).toBe('2');
      expect(principles[1].handle).toBe('Operable');
      expect(principles[2].num).toBe('3');
      expect(principles[2].handle).toBe('Understandable');
      expect(principles[3].num).toBe('4');
      expect(principles[3].handle).toBe('Robust');
    });
  });

  describe('getGuidelines', () => {
    it('returns all guidelines', () => {
      const guidelines = wcagService.getGuidelines();
      expect(guidelines.length).toBeGreaterThan(0);
      expect(guidelines[0]).toHaveProperty('num');
      expect(guidelines[0]).toHaveProperty('handle');
    });
  });

  describe('getAllSuccessCriteria', () => {
    it('returns all success criteria', () => {
      const criteria = wcagService.getAllSuccessCriteria();
      expect(criteria.length).toBeGreaterThan(0);
      expect(criteria[0]).toHaveProperty('num');
      expect(criteria[0]).toHaveProperty('handle');
      expect(criteria[0]).toHaveProperty('level');
    });
  });

  describe('getSuccessCriteriaByLevel', () => {
    it('filters by conformance level A', () => {
      const levelA = wcagService.getSuccessCriteriaByLevel('A');
      levelA.forEach(criterion => {
        expect(criterion.level).toBe('A');
      });
    });

    it('filters by conformance level AA', () => {
      const levelAA = wcagService.getSuccessCriteriaByLevel('AA');
      levelAA.forEach(criterion => {
        expect(criterion.level).toBe('AA');
      });
    });
  });

  describe('getSuccessCriterionById', () => {
    it('returns criterion by ID', () => {
      const criterion = wcagService.getSuccessCriterionById('non-text-content');
      
      expect(criterion).toBeDefined();
      expect(criterion?.num).toBe('1.1.1');
      expect(criterion?.handle).toBe('Non-text Content');
      expect(criterion?.level).toBe('A');
    });

    it('returns undefined for invalid ID', () => {
      const criterion = wcagService.getSuccessCriterionById('invalid-id-99999');
      expect(criterion).toBeUndefined();
    });
  });

  describe('getSuccessCriterionByNumber', () => {
    it('returns criterion by number', () => {
      const criterion = wcagService.getSuccessCriterionByNumber('1.1.1');
      
      expect(criterion).toBeDefined();
      expect(criterion?.num).toBe('1.1.1');
      expect(criterion?.handle).toBe('Non-text Content');
    });

    it('returns undefined for invalid number', () => {
      const criterion = wcagService.getSuccessCriterionByNumber('99.99.99');
      expect(criterion).toBeUndefined();
    });
  });

  describe('searchSuccessCriteria', () => {
    it('searches by handle text', () => {
      const results = wcagService.searchSuccessCriteria('text');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        const handleMatch = result.handle.toLowerCase().includes('text');
        const titleMatch = result.title?.toLowerCase().includes('text');
        const numMatch = result.num.includes('text');
        expect(handleMatch || titleMatch || numMatch).toBe(true);
      });
    });

    it('returns empty array for no matches', () => {
      const results = wcagService.searchSuccessCriteria('xyzabc123nonexistent');
      expect(results).toEqual([]);
    });

    it('is case insensitive', () => {
      const lowerResults = wcagService.searchSuccessCriteria('keyboard');
      const upperResults = wcagService.searchSuccessCriteria('KEYBOARD');
      
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBeGreaterThan(0);
    });
  });

  describe('getCountByLevel', () => {
    it('returns count for each conformance level', () => {
      const counts = wcagService.getCountByLevel();
      
      expect(counts).toHaveProperty('A');
      expect(counts).toHaveProperty('AA');
      expect(counts).toHaveProperty('AAA');
      expect(counts.A).toBeGreaterThan(0);
      expect(counts.AA).toBeGreaterThan(0);
      expect(counts.AAA).toBeGreaterThan(0);
    });
  });

  describe('getTotalCount', () => {
    it('returns total number of success criteria', () => {
      const total = wcagService.getTotalCount();
      expect(total).toBeGreaterThan(0);
      expect(typeof total).toBe('number');
    });
  });
});
