/**
 * Standards Mapping Service
 *
 * Maps WCAG 2.x results to other accessibility standards:
 * - EN 301 549 (European Standard)
 * - Section 508 (U.S. Federal Standard)
 */

import type { ConformanceStatus } from '../models/types';

export interface StandardMapping {
  standardId: string;
  sectionNumber: string;
  sectionTitle: string;
  description: string;
  mappedFromWCAG: string[]; // WCAG SC numbers that map to this requirement
  isDirectMapping: boolean; // true if 1:1 mapping, false if additional testing needed
  additionalNotes?: string;
}

/**
 * EN 301 549 V3.2.1 (2021-03) - Harmonized with WCAG 2.1 Level AA
 * Section 9: Web content requirements directly reference WCAG 2.1
 */
export const EN_301_549_MAPPINGS: StandardMapping[] = [
  {
    standardId: 'EN301549',
    sectionNumber: '9.1.1.1',
    sectionTitle: 'Non-text Content',
    description: 'Web pages shall satisfy WCAG 2.1 Success Criterion 1.1.1 Non-text Content.',
    mappedFromWCAG: ['1.1.1'],
    isDirectMapping: true,
  },
  {
    standardId: 'EN301549',
    sectionNumber: '9.1.2.1',
    sectionTitle: 'Audio-only and Video-only (Prerecorded)',
    description:
      'Web pages shall satisfy WCAG 2.1 Success Criterion 1.2.1 Audio-only and Video-only (Prerecorded).',
    mappedFromWCAG: ['1.2.1'],
    isDirectMapping: true,
  },
  {
    standardId: 'EN301549',
    sectionNumber: '9.1.2.2',
    sectionTitle: 'Captions (Prerecorded)',
    description: 'Web pages shall satisfy WCAG 2.1 Success Criterion 1.2.2 Captions (Prerecorded).',
    mappedFromWCAG: ['1.2.2'],
    isDirectMapping: true,
  },
  {
    standardId: 'EN301549',
    sectionNumber: '9.1.2.3',
    sectionTitle: 'Audio Description or Media Alternative (Prerecorded)',
    description:
      'Web pages shall satisfy WCAG 2.1 Success Criterion 1.2.3 Audio Description or Media Alternative (Prerecorded).',
    mappedFromWCAG: ['1.2.3'],
    isDirectMapping: true,
  },
  // Note: EN 301 549 Section 9 contains direct references to ALL WCAG 2.1 Level A and AA criteria
  // The structure is: 9.{principle}.{guideline}.{criterion}
  // Since WCAG 2.2 adds new criteria, those would need additional evaluation for EN 301 549 V4.0+
];

/**
 * Section 508 (Revised 2017) - Incorporates WCAG 2.0 Level AA
 * with some additional requirements
 */
export const SECTION_508_MAPPINGS: StandardMapping[] = [
  {
    standardId: 'Section508',
    sectionNumber: '501',
    sectionTitle: 'General',
    description:
      'Scope: ICT conforming to Level A and Level AA of WCAG 2.0 shall be deemed to comply with 502 and 503.',
    mappedFromWCAG: ['ALL_A', 'ALL_AA'],
    isDirectMapping: true,
  },
  {
    standardId: 'Section508',
    sectionNumber: '502.3.1',
    sectionTitle: 'Object Information',
    description:
      'Programmatically determinable object role, state, properties, boundary, name, and description.',
    mappedFromWCAG: ['1.3.1', '4.1.2'],
    isDirectMapping: true,
    additionalNotes: 'Maps to WCAG but requires platform-specific API testing',
  },
  {
    standardId: 'Section508',
    sectionNumber: '502.3.2',
    sectionTitle: 'Modification of Object Information',
    description:
      'States and properties that can be set by the user shall be capable of being set programmatically.',
    mappedFromWCAG: ['4.1.2'],
    isDirectMapping: false,
    additionalNotes: 'Requires additional testing of programmatic control',
  },
  {
    standardId: 'Section508',
    sectionNumber: '503.4',
    sectionTitle: 'User Controls for Captions and Audio Description',
    description:
      'Where ICT displays video with synchronized audio, it shall provide user controls for closed captions and audio descriptions.',
    mappedFromWCAG: ['1.2.2', '1.2.5'],
    isDirectMapping: false,
    additionalNotes:
      'Requires checking for presence of user controls, not just caption/description availability',
  },
];

/**
 * Generate a comprehensive mapping for EN 301 549 based on WCAG version
 */
export function generateEN301549Mapping(wcagVersion: '2.1' | '2.2'): StandardMapping[] {
  if (wcagVersion === '2.1') {
    return EN_301_549_MAPPINGS;
  }

  // For WCAG 2.2, note that EN 301 549 V3.2.1 references WCAG 2.1
  // New 2.2 criteria may not have direct EN mappings yet
  return [
    ...EN_301_549_MAPPINGS,
    {
      standardId: 'EN301549',
      sectionNumber: 'NOTE',
      sectionTitle: 'WCAG 2.2 Additional Criteria',
      description:
        'EN 301 549 V3.2.1 references WCAG 2.1. WCAG 2.2 criteria may require evaluation under V4.0 when published.',
      mappedFromWCAG: [
        '2.4.11',
        '2.4.12',
        '2.4.13',
        '2.5.7',
        '2.5.8',
        '3.2.6',
        '3.3.7',
        '3.3.8',
        '3.3.9',
      ],
      isDirectMapping: false,
      additionalNotes: 'New WCAG 2.2 criteria - check latest EN 301 549 version for formal mapping',
    },
  ];
}

/**
 * Map WCAG test results to EN 301 549 compliance
 */
export function mapWCAGToEN301549(
  wcagResults: Map<string, { status: ConformanceStatus | 'Not Tested'; scNumber: string }>,
  wcagVersion: '2.1' | '2.2'
): Map<string, { status: ConformanceStatus | 'Not Tested'; mappedFrom: string[] }> {
  const enResults = new Map<
    string,
    { status: ConformanceStatus | 'Not Tested'; mappedFrom: string[] }
  >();

  const mappings = generateEN301549Mapping(wcagVersion);

  for (const mapping of mappings) {
    if (mapping.isDirectMapping && mapping.mappedFromWCAG.length > 0) {
      // For direct mappings, use the worst status from all mapped WCAG criteria
      let worstStatus: ConformanceStatus | 'Not Tested' = 'Supports';
      const mappedFrom: string[] = [];

      for (const wcagSC of mapping.mappedFromWCAG) {
        const result = Array.from(wcagResults.entries()).find(([_, r]) => r.scNumber === wcagSC);
        if (result) {
          mappedFrom.push(wcagSC);
          const status = result[1].status;

          // Priority: Does Not Support > Partially Supports > Not Tested > Supports
          if (status === 'Does Not Support') {
            worstStatus = 'Does Not Support';
          } else if (status === 'Partially Supports' && worstStatus !== 'Does Not Support') {
            worstStatus = 'Partially Supports';
          } else if (status === 'Not Tested' && worstStatus === 'Supports') {
            worstStatus = 'Not Tested';
          }
        }
      }

      enResults.set(mapping.sectionNumber, { status: worstStatus, mappedFrom });
    }
  }

  return enResults;
}

/**
 * Map WCAG test results to Section 508 compliance
 */
export function mapWCAGToSection508(
  wcagResults: Map<string, { status: ConformanceStatus | 'Not Tested'; scNumber: string }>
): Map<
  string,
  {
    status: ConformanceStatus | 'Not Tested';
    mappedFrom: string[];
    requiresAdditionalTesting: boolean;
  }
> {
  const section508Results = new Map<
    string,
    {
      status: ConformanceStatus | 'Not Tested';
      mappedFrom: string[];
      requiresAdditionalTesting: boolean;
    }
  >();

  for (const mapping of SECTION_508_MAPPINGS) {
    let worstStatus: ConformanceStatus | 'Not Tested' = 'Supports';
    const mappedFrom: string[] = [];

    for (const wcagSC of mapping.mappedFromWCAG) {
      if (wcagSC === 'ALL_A' || wcagSC === 'ALL_AA') continue; // Skip general mappings

      const result = Array.from(wcagResults.entries()).find(([_, r]) => r.scNumber === wcagSC);
      if (result) {
        mappedFrom.push(wcagSC);
        const status = result[1].status;

        if (status === 'Does Not Support') {
          worstStatus = 'Does Not Support';
        } else if (status === 'Partially Supports' && worstStatus !== 'Does Not Support') {
          worstStatus = 'Partially Supports';
        } else if (status === 'Not Tested' && worstStatus === 'Supports') {
          worstStatus = 'Not Tested';
        }
      }
    }

    section508Results.set(mapping.sectionNumber, {
      status: worstStatus,
      mappedFrom,
      requiresAdditionalTesting: !mapping.isDirectMapping,
    });
  }

  return section508Results;
}

export const standardsMappingService = {
  generateEN301549Mapping,
  mapWCAGToEN301549,
  mapWCAGToSection508,
  EN_301_549_MAPPINGS,
  SECTION_508_MAPPINGS,
};
