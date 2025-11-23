import type { Project, TestResult, TeamMember } from '../models/types';
import { createLogger } from '../utils/logger';

const logger = createLogger('share-service');

export interface SharePayload {
  version: string;
  exportedAt: string;
  exportedBy: string;
  audit: {
    name: string;
    description: string;
    wcagVersion: string;
    conformanceLevels: string[];
    pageUrl?: string;
  };
  results: TestResult[];
  teamMembers: TeamMember[];
  metadata: {
    totalCriteria: number;
    testedCount: number;
    progressPercentage: number;
  };
}

export interface ShareOptions {
  method: 'email' | 'webshare' | 'clipboard' | 'download';
  includeScreenshots?: boolean;
  recipients?: string[];
  message?: string;
}

/**
 * Generate shareable JSON payload from current audit state
 */
export function generateSharePayload(
  project: Project,
  results: TestResult[],
  teamMembers: TeamMember[],
  currentUserName: string = 'Unknown'
): SharePayload {
  const testedCount = results.length; // All results are considered tested if they exist
  
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: currentUserName,
    audit: {
      name: project.name,
      description: project.description || '',
      wcagVersion: '2.2', // Default to 2.2
      conformanceLevels: [project.targetConformanceLevel],
      pageUrl: project.description || '', // Using description as URL
    },
    results,
    teamMembers,
    metadata: {
      totalCriteria: results.length,
      testedCount,
      progressPercentage: results.length > 0 ? Math.round((testedCount / results.length) * 100) : 0,
    },
  };
}

/**
 * Generate email subject and body for sharing
 */
export function generateEmailContent(payload: SharePayload, customMessage?: string): {
  subject: string;
  body: string;
} {
  const subject = `Accessibility Audit: ${payload.audit.name} (${payload.metadata.progressPercentage}% Complete)`;
  
  const body = `Hi there,

I'm sharing an accessibility audit for ${payload.audit.name}.

${customMessage || 'Please review and continue testing as assigned.'}

📊 Audit Progress:
- Total Criteria: ${payload.metadata.totalCriteria}
- Tested: ${payload.metadata.testedCount} (${payload.metadata.progressPercentage}%)
- WCAG Version: ${payload.audit.wcagVersion}
- Conformance Level: ${payload.audit.conformanceLevels.join(', ')}

👥 Team Members: ${payload.teamMembers.length}

📥 To import this audit:
1. Download the attached JSON file
2. Open the VPAT Creator app
3. Go to "Workflow" tab
4. Click "📂 Resume Audit"
5. Select the JSON file

The audit data is attached to this email or will be shared separately.

---
Exported by: ${payload.exportedBy}
Export Date: ${new Date(payload.exportedAt).toLocaleDateString()}
  `.trim();

  return { subject, body };
}

/**
 * Share audit via email (opens mailto: link)
 */
export async function shareViaEmail(
  payload: SharePayload,
  recipients: string[] = [],
  customMessage?: string
): Promise<void> {
  try {
    const { subject, body } = generateEmailContent(payload, customMessage);
    const recipientsStr = recipients.join(',');
    
    // Create mailto link
    const mailtoLink = `mailto:${recipientsStr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Also trigger download of JSON file
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${payload.audit.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.info('Shared via email', { recipients: recipients.length });
  } catch (error) {
    logger.error('Failed to share via email:', error);
    throw new Error('Failed to open email client');
  }
}

/**
 * Share audit using Web Share API (mobile-friendly)
 */
export async function shareViaWebAPI(payload: SharePayload): Promise<void> {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    // Create JSON file
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File(
      [blob],
      `audit-${payload.audit.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`,
      { type: 'application/json' }
    );

    await navigator.share({
      title: `Accessibility Audit: ${payload.audit.name}`,
      text: `${payload.metadata.progressPercentage}% complete - ${payload.metadata.testedCount}/${payload.metadata.totalCriteria} criteria tested`,
      files: [file],
    });

    logger.info('Shared via Web Share API');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled share - not an error
      logger.info('Share cancelled by user');
      return;
    }
    logger.error('Failed to share via Web API:', error);
    throw new Error('Failed to share using native sharing');
  }
}

/**
 * Copy audit JSON to clipboard
 */
export async function copyToClipboard(payload: SharePayload): Promise<void> {
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    logger.info('Copied to clipboard');
  } catch (error) {
    logger.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Download audit JSON file
 */
export function downloadAuditFile(payload: SharePayload): void {
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${payload.audit.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.info('Downloaded audit file');
  } catch (error) {
    logger.error('Failed to download audit:', error);
    throw new Error('Failed to download audit file');
  }
}

/**
 * Check if Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
}

/**
 * Generate instructions for recipients
 */
export function generateImportInstructions(): string {
  return `
How to Import This Audit:

1. Open the VPAT Creator application
2. Navigate to the "Workflow" tab
3. Click the "📂 Resume Audit" button
4. Select the JSON file you received
5. The audit will be loaded with all test results and team assignments

Note: All data is stored locally in your browser. Share the JSON file to collaborate with team members.
  `.trim();
}
