import axe from 'axe-core';
import DOMPurify from 'dompurify';

export interface AxeScanResult {
  violations: axe.Result[];
  passes: axe.Result[];
  incomplete: axe.Result[];
  inapplicable: axe.Result[];
  timestamp: Date;
}

export interface MappedResult {
  scNumber: string;
  status: 'Supports' | 'Does Not Support';
  reason: string;
  ruleId: string;
}

// Mapping of Axe Rule IDs to WCAG Success Criteria
// This is a partial mapping for common rules
const AXE_TO_WCAG_MAP: Record<string, string[]> = {
  'area-alt': ['1.1.1'],
  'image-alt': ['1.1.1'],
  'input-image-alt': ['1.1.1'],
  'object-alt': ['1.1.1'],
  'role-img-alt': ['1.1.1'],
  'svg-img-alt': ['1.1.1'],
  'video-caption': ['1.2.2'],
  'video-description': ['1.2.3', '1.2.5'],
  'aria-allowed-attr': ['4.1.2'],
  'aria-required-attr': ['4.1.2'],
  'aria-required-children': ['1.3.1'],
  'aria-required-parent': ['1.3.1'],
  'aria-roles': ['4.1.2'],
  'aria-valid-attr-value': ['4.1.2'],
  'aria-valid-attr': ['4.1.2'],
  'button-name': ['4.1.2'],
  'color-contrast': ['1.4.3'],
  'document-title': ['2.4.2'],
  'duplicate-id-active': ['4.1.1'],
  'duplicate-id-aria': ['4.1.1'],
  'duplicate-id': ['4.1.1'],
  'empty-heading': ['1.3.1', '2.4.6'],
  'heading-order': ['1.3.1'],
  'html-has-lang': ['3.1.1'],
  'html-lang-valid': ['3.1.1'],
  'image-redundant-alt': ['1.1.1'],
  'input-button-name': ['4.1.2'],
  label: ['1.3.1', '3.3.2', '4.1.2'],
  'link-name': ['2.4.4', '4.1.2'],
  list: ['1.3.1'],
  listitem: ['1.3.1'],
  'meta-viewport': ['1.4.4'],
  'nested-interactive': ['4.1.2'],
  'select-name': ['4.1.2'],
  'skip-link': ['2.4.1'],
  tabindex: ['2.1.1'],
  'table-duplicate-name': ['1.3.1'],
  'table-fake-caption': ['1.3.1'],
  'td-headers-attr': ['1.3.1'],
  'th-has-data-cells': ['1.3.1'],
  'valid-lang': ['3.1.1'],
};

export const axeService = {
  /**
   * Run axe-core scan on a provided HTML string
   */
  async scanHtml(html: string): Promise<AxeScanResult> {
    // Create a temporary container
    const container = document.createElement('div');
    container.id = 'axe-test-container';
    // Sanitize HTML to prevent script execution but keep structure
    container.innerHTML = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: false,
      ADD_TAGS: ['head', 'body', 'title', 'meta', 'style'], // Allow some structure tags
      ADD_ATTR: ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex'], // Ensure ARIA is kept
    });

    // Hide it visually but keep it in DOM for axe to work
    // Note: axe needs the element to be "visible" for some rules (like color contrast)
    // So we position it off-screen instead of display: none
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1024px'; // Simulate desktop width
    container.style.backgroundColor = '#ffffff'; // Default background

    document.body.appendChild(container);

    try {
      const results = await axe.run(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
        reporter: 'v2',
      });

      return {
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
        timestamp: new Date(),
      };
    } finally {
      // Cleanup
      document.body.removeChild(container);
    }
  },

  /**
   * Map axe violations to WCAG Success Criteria
   */
  mapResultsToWCAG(results: AxeScanResult): MappedResult[] {
    const mappedResults: MappedResult[] = [];

    // Process Violations (Failures)
    results.violations.forEach((violation) => {
      const scNumbers = AXE_TO_WCAG_MAP[violation.id];
      if (scNumbers) {
        scNumbers.forEach((scNumber) => {
          mappedResults.push({
            scNumber,
            status: 'Does Not Support',
            reason: `Automated failure: ${violation.help} (${violation.id}). ${violation.nodes.length} occurrences found.`,
            ruleId: violation.id,
          });
        });
      }
    });

    // Process Passes (Supports)
    // Note: A pass in axe doesn't always mean full WCAG compliance for an SC,
    // but it's a good indicator for specific techniques.
    // We'll be conservative and only map passes if we're sure.
    // For now, we might just use violations to flag issues.

    return mappedResults;
  },
};
