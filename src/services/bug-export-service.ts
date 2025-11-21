import type { TestResult, Component, Screenshot, BugReport } from '../models/types';
import { wcagService } from './wcag-service';
import { createLogger } from '../utils/logger';

const logger = createLogger('bug-export');

/**
 * Extract bugs from test results
 */
export function extractBugsFromResults(
  results: TestResult[],
  components: Component[] = [],
  screenshots: Screenshot[] = [],
  defaultComponentName: string = 'Main Application'
): BugReport[] {
  logger.info('Extracting bugs from test results', { resultCount: results.length });

  const bugs: BugReport[] = [];

  // Filter for failures and partial supports
  const failedResults = results.filter(
    (r) => r.conformance === 'Does Not Support' || r.conformance === 'Partially Supports'
  );

  for (const result of failedResults) {
    const criterion = wcagService.getSuccessCriterionById(result.successCriterionId);
    if (!criterion) continue;

    // Try to find component if available, otherwise use default
    let componentName = defaultComponentName;
    if (components.length > 0) {
      const component = components.find((c) => c.results.some(r => r.id === result.id));
      if (component) {
        componentName = component.name;
      }
    }

    // Get screenshots for this test result
    const resultScreenshots = screenshots.filter((s) => s.testResultId === result.id);

    // Determine severity based on conformance and level
    let severity: 'critical' | 'major' | 'minor' = 'minor';
    if (result.conformance === 'Does Not Support') {
      severity = result.level === 'A' ? 'critical' : result.level === 'AA' ? 'major' : 'minor';
    } else {
      severity = result.level === 'A' ? 'major' : 'minor';
    }

    // Extract functional barriers
    const functionalBarriers = result.barriers?.map((b) => b.type) || [];

    const bug: BugReport = {
      id: crypto.randomUUID(),
      criterionId: result.successCriterionId,
      criterionNumber: criterion.num,
      criterionName: criterion.handle,
      severity,
      componentName,
      description: result.observations || 'Accessibility issue detected',
      stepsToReproduce: undefined,
      codeSnippet: undefined,
      suggestedFix: undefined,
      screenshots: resultScreenshots,
      functionalBarriers,
      wcagLevel: result.level,
      reportedDate: new Date().toISOString(),
    };

    bugs.push(bug);
  }

  logger.info('Bugs extracted', { bugCount: bugs.length });
  return bugs;
}

/**
 * Export bugs as Markdown
 */
export function exportBugsAsMarkdown(bugs: BugReport[]): string {
  logger.info('Exporting bugs as Markdown', { bugCount: bugs.length });

  let markdown = `# Accessibility Bug Report\n\n`;
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total Issues: ${bugs.length}\n\n`;

  // Summary by severity
  const critical = bugs.filter((b) => b.severity === 'critical').length;
  const major = bugs.filter((b) => b.severity === 'major').length;
  const minor = bugs.filter((b) => b.severity === 'minor').length;

  markdown += `## Summary\n\n`;
  markdown += `- 🔴 Critical: ${critical}\n`;
  markdown += `- 🟠 Major: ${major}\n`;
  markdown += `- 🟡 Minor: ${minor}\n\n`;

  markdown += `---\n\n`;

  // Individual bugs
  bugs.forEach((bug, index) => {
    const severityIcon = bug.severity === 'critical' ? '🔴' : bug.severity === 'major' ? '🟠' : '🟡';

    markdown += `## ${severityIcon} Bug #${index + 1}: ${bug.criterionName}\n\n`;
    markdown += `**Severity:** ${bug.severity.toUpperCase()}\n\n`;
    markdown += `**WCAG Criterion:** ${bug.criterionNumber} - ${bug.criterionName} (Level ${bug.wcagLevel})\n\n`;
    markdown += `**Component:** ${bug.componentName}\n\n`;

    markdown += `### Description\n\n`;
    markdown += `${bug.description}\n\n`;

    if (bug.stepsToReproduce) {
      markdown += `### Steps to Reproduce\n\n`;
      markdown += `${bug.stepsToReproduce}\n\n`;
    }

    if (bug.codeSnippet) {
      markdown += `### Code Snippet\n\n`;
      markdown += `\`\`\`html\n${bug.codeSnippet}\n\`\`\`\n\n`;
    }

    if (bug.suggestedFix) {
      markdown += `### Suggested Fix\n\n`;
      markdown += `${bug.suggestedFix}\n\n`;
    }

    if (bug.functionalBarriers.length > 0) {
      markdown += `### Functional Barriers\n\n`;
      bug.functionalBarriers.forEach((barrier) => {
        markdown += `- ${barrier}\n`;
      });
      markdown += `\n`;
    }

    if (bug.screenshots.length > 0) {
      markdown += `### Screenshots\n\n`;
      bug.screenshots.forEach((screenshot, i) => {
        markdown += `**Screenshot ${i + 1}:** ${screenshot.filename}\n`;
        if (screenshot.caption) {
          markdown += `*${screenshot.caption}*\n`;
        }
        markdown += `\n`;
      });
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Export bugs as CSV
 */
export function exportBugsAsCSV(bugs: BugReport[]): string {
  logger.info('Exporting bugs as CSV', { bugCount: bugs.length });

  const headers = [
    'ID',
    'Severity',
    'WCAG Criterion',
    'Level',
    'Component',
    'Description',
    'Functional Barriers',
    'Screenshot Count',
    'Reported Date',
  ];

  let csv = headers.join(',') + '\n';

  bugs.forEach((bug) => {
    const row = [
      bug.id,
      bug.severity,
      `"${bug.criterionNumber} - ${bug.criterionName}"`,
      bug.wcagLevel,
      `"${bug.componentName}"`,
      `"${bug.description.replace(/"/g, '""')}"`,
      `"${bug.functionalBarriers.join(', ')}"`,
      bug.screenshots.length.toString(),
      bug.reportedDate,
    ];

    csv += row.join(',') + '\n';
  });

  return csv;
}

/**
 * Export bugs as JSON
 */
export function exportBugsAsJSON(bugs: BugReport[]): string {
  logger.info('Exporting bugs as JSON', { bugCount: bugs.length });

  const exportData = {
    exportDate: new Date().toISOString(),
    totalBugs: bugs.length,
    summary: {
      critical: bugs.filter((b) => b.severity === 'critical').length,
      major: bugs.filter((b) => b.severity === 'major').length,
      minor: bugs.filter((b) => b.severity === 'minor').length,
    },
    bugs: bugs.map((bug) => ({
      ...bug,
      screenshots: bug.screenshots.map((s) => ({
        filename: s.filename,
        caption: s.caption,
        // Exclude base64 data to reduce file size
      })),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
