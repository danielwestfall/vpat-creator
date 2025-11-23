import type { TestResult, Project } from '../models/types';
import { wcagService } from './wcag-service';

export type ChangeType = 'improved' | 'regressed' | 'unchanged' | 'new' | 'removed';

export interface ComparisonDiff {
  scId: string;
  scNumber: string;
  scTitle: string;
  oldStatus: string;
  newStatus: string;
  changeType: ChangeType;
}

export interface ComparisonSummary {
  baseProjectName: string;
  targetProjectName: string;
  date1: Date;
  date2: Date;
  totalChanges: number;
  improvedCount: number;
  regressedCount: number;
  newCount: number;
  diffs: ComparisonDiff[];
}

// Helper to rank conformance for comparison
const getConformanceRank = (status: string): number => {
  switch (status) {
    case 'Supports': return 4;
    case 'Partially Supports': return 3;
    case 'Does Not Support': return 2;
    case 'Not Applicable': return 1; // Neutral? Or high? Usually N/A is fine.
    case 'Not Tested': return 0;
    default: return 0;
  }
};

export const comparisonService = {
  compareAudits(
    baseProject: Project,
    baseResults: TestResult[],
    targetProject: Project,
    targetResults: TestResult[]
  ): ComparisonSummary {
    const diffs: ComparisonDiff[] = [];
    let improvedCount = 0;
    let regressedCount = 0;
    let newCount = 0;

    // Create a map of base results for quick lookup
    const baseMap = new Map<string, TestResult>();
    baseResults.forEach(r => baseMap.set(r.successCriterionId, r));

    // Iterate through target results (the "new" audit)
    targetResults.forEach(targetResult => {
      const baseResult = baseMap.get(targetResult.successCriterionId);
      const sc = wcagService.getSuccessCriterionById(targetResult.successCriterionId);
      
      if (!sc) return; // Should not happen

      const scNumber = sc.num;
      const scTitle = sc.handle;
      const newStatus = targetResult.conformance;

      if (!baseResult) {
        // New item in target that wasn't in base
        diffs.push({
          scId: targetResult.successCriterionId,
          scNumber,
          scTitle,
          oldStatus: 'Not Tested', // Or 'Not Present'
          newStatus,
          changeType: 'new'
        });
        newCount++;
      } else {
        const oldStatus = baseResult.conformance;
        
        if (oldStatus !== newStatus) {
          const oldRank = getConformanceRank(oldStatus);
          const newRank = getConformanceRank(newStatus);
          
          let changeType: ChangeType = 'unchanged';
          
          if (newRank > oldRank) {
            changeType = 'improved';
            improvedCount++;
          } else if (newRank < oldRank) {
            changeType = 'regressed';
            regressedCount++;
          } else {
            // Ranks equal but strings different? (e.g. Not Applicable vs Not Tested if ranked same)
            changeType = 'unchanged'; 
          }

          if (changeType !== 'unchanged') {
            diffs.push({
              scId: targetResult.successCriterionId,
              scNumber,
              scTitle,
              oldStatus,
              newStatus,
              changeType
            });
          }
        }
      }
    });

    return {
      baseProjectName: baseProject.name,
      targetProjectName: targetProject.name,
      date1: baseProject.createdAt || new Date(),
      date2: targetProject.createdAt || new Date(),
      totalChanges: diffs.length,
      improvedCount,
      regressedCount,
      newCount,
      diffs: diffs.sort((a, b) => {
        // Sort by SC Number (e.g. 1.1.1 before 1.2.1)
        const partsA = a.scNumber.split('.').map(Number);
        const partsB = b.scNumber.split('.').map(Number);
        
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const valA = partsA[i] || 0;
          const valB = partsB[i] || 0;
          if (valA !== valB) return valA - valB;
        }
        return 0;
      })
    };
  }
};
