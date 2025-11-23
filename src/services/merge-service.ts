import type { TestResult, TeamMember, Project } from '../models/types';
import { createLogger } from '../utils/logger';

const logger = createLogger('merge-service');

export interface MergeConflict {
  criterionId: string;
  criterionName: string;
  criterionNumber: string;
  local: TestResult;
  incoming: TestResult;
  differences: {
    status: boolean;
    notes: boolean;
    testedBy: boolean;
    timestamps: boolean;
  };
  timeDiffHours: number;
}

export interface MergeResult {
  conflicts: MergeConflict[];
  autoMerged: TestResult[];
  unchanged: TestResult[];
  newCriteria: TestResult[];
  mergedTeamMembers: TeamMember[];
  summary: {
    total: number;
    conflicts: number;
    autoMerged: number;
    unchanged: number;
    new: number;
  };
}

export interface MergeOptions {
  preferNewer: boolean; // If true, auto-choose newer result when timestamp diff > 1 hour
  autoMergeThresholdHours: number; // Default: 1 hour
}

const DEFAULT_OPTIONS: MergeOptions = {
  preferNewer: true,
  autoMergeThresholdHours: 1,
};

/**
 * Merge imported audit data with current audit data
 */
export function mergeAudits(
  _localProject: Project,
  localResults: TestResult[],
  localTeamMembers: TeamMember[],
  _incomingProject: Project,
  incomingResults: TestResult[],
  incomingTeamMembers: TeamMember[],
  options: Partial<MergeOptions> = {}
): MergeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  logger.info('Starting merge', {
    localResults: localResults.length,
    incomingResults: incomingResults.length,
  });

  // Create maps for easier lookup
  const localMap = new Map(localResults.map(r => [r.successCriterionId, r]));
  const incomingMap = new Map(incomingResults.map(r => [r.successCriterionId, r]));

  const conflicts: MergeConflict[] = [];
  const autoMerged: TestResult[] = [];
  const unchanged: TestResult[] = [];
  const newCriteria: TestResult[] = [];

  // Process incoming results
  for (const [id, incomingResult] of incomingMap) {
    const localResult = localMap.get(id);

    if (!localResult) {
      // New criterion from incoming file
      newCriteria.push(incomingResult);
    } else {
      // Both files have this criterion - check for conflicts
      const conflict = detectConflict(localResult, incomingResult);

      if (conflict) {
        // Check if we can auto-resolve based on timestamp
        if (opts.preferNewer && conflict.timeDiffHours > opts.autoMergeThresholdHours) {
          // Auto-merge: use the newer one
          const newerResult = incomingResult.testedDate && localResult.testedDate && 
            new Date(incomingResult.testedDate) > new Date(localResult.testedDate)
            ? incomingResult
            : localResult;
          autoMerged.push(newerResult);
          logger.info(`Auto-merged ${id} (timestamp diff: ${conflict.timeDiffHours}h)`);
        } else {
          // Conflict requires manual resolution
          conflicts.push(conflict);
        }
      } else {
        // No conflict - results are identical or compatible
        unchanged.push(localResult);
      }
    }
  }

  // Add local-only results that aren't in incoming
  for (const [id, localResult] of localMap) {
    if (!incomingMap.has(id)) {
      unchanged.push(localResult);
    }
  }

  // Merge team members
  const mergedTeamMembers = mergeTeamMembers(localTeamMembers, incomingTeamMembers);

  const result: MergeResult = {
    conflicts,
    autoMerged,
    unchanged,
    newCriteria,
    mergedTeamMembers,
    summary: {
      total: localResults.length + incomingResults.length,
      conflicts: conflicts.length,
      autoMerged: autoMerged.length,
      unchanged: unchanged.length,
      new: newCriteria.length,
    },
  };

  logger.info('Merge complete', result.summary);
  return result;
}

/**
 * Detect conflicts between local and incoming test results
 */
function detectConflict(local: TestResult, incoming: TestResult): MergeConflict | null {
  const differences = {
    status: local.conformance !== incoming.conformance,
    notes: (local.customNotes || '') !== (incoming.customNotes || ''),
    testedBy: (local.testedBy || '') !== (incoming.testedBy || ''),
    timestamps: (local.testedDate && incoming.testedDate) 
      ? new Date(local.testedDate).getTime() !== new Date(incoming.testedDate).getTime()
      : false,
  };

  // Calculate time difference in hours
  const localTime = local.testedDate ? new Date(local.testedDate).getTime() : 0;
  const incomingTime = incoming.testedDate ? new Date(incoming.testedDate).getTime() : 0;
  const timeDiffHours = Math.abs(incomingTime - localTime) / (1000 * 60 * 60);

  // Check if either is "Not Tested" - these can auto-merge
  const localUntested = local.conformance === 'Not Applicable';
  const incomingUntested = incoming.conformance === 'Not Applicable';

  if (localUntested || incomingUntested) {
    // No conflict - use the tested one
    return null;
  }

  // If there are substantive differences, it's a conflict
  if (differences.status || (differences.notes && local.customNotes && incoming.customNotes)) {
    return {
      criterionId: local.successCriterionId,
      criterionName: local.successCriterionId, // TODO: Get actual name from mapping
      criterionNumber: local.successCriterionId,
      local,
      incoming,
      differences,
      timeDiffHours,
    };
  }

  // No conflict
  return null;
}

/**
 * Merge team member lists (deduplicate by ID)
 */
function mergeTeamMembers(local: TeamMember[], incoming: TeamMember[]): TeamMember[] {
  const merged = new Map<string, TeamMember>();

  // Add local team members
  for (const member of local) {
    merged.set(member.id, member);
  }

  // Add incoming team members (will overwrite if same ID)
  for (const member of incoming) {
    if (!merged.has(member.id)) {
      merged.set(member.id, member);
    }
  }

  return Array.from(merged.values());
}

/**
 * Apply conflict resolutions and create final merged result set
 */
export function applyMergeResolutions(
  mergeResult: MergeResult,
  resolutions: Map<string, 'local' | 'incoming'>
): TestResult[] {
  const finalResults: TestResult[] = [];

  // Add unchanged and auto-merged results
  finalResults.push(...mergeResult.unchanged);
  finalResults.push(...mergeResult.autoMerged);
  finalResults.push(...mergeResult.newCriteria);

  // Apply conflict resolutions
  for (const conflict of mergeResult.conflicts) {
    const resolution = resolutions.get(conflict.criterionId);
    if (resolution === 'local') {
      finalResults.push(conflict.local);
    } else if (resolution === 'incoming') {
      finalResults.push(conflict.incoming);
    }
    // If no resolution, skip (user cancelled)
  }

  logger.info('Applied merge resolutions', {
    finalCount: finalResults.length,
    resolutionsCount: resolutions.size,
  });

  return finalResults;
}

/**
 * Generate a human-readable merge report
 */
export function generateMergeReport(mergeResult: MergeResult): string {
  const { summary } = mergeResult;

  return `
Merge Summary:
- ${summary.new} new test(s) added
- ${summary.autoMerged} test(s) auto-merged (newer version used)
- ${summary.unchanged} test(s) unchanged
- ${summary.conflicts} conflict(s) ${summary.conflicts > 0 ? 'requiring resolution' : ''}

Total results after merge: ${summary.new + summary.autoMerged + summary.unchanged + summary.conflicts}
  `.trim();
}
