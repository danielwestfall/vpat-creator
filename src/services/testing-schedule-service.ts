/**
 * Generate Testing Schedules Script
 *
 * This script loads the WCAG 2.2 JSON data and generates two testing schedules:
 * 1. Success Criteria-based schedule
 * 2. Component/Technique-based schedule
 *
 * Outputs are saved as JSON and Markdown files for easy reference
 */

import wcagData from '../assets/wcag22.json';
import {
  generateSCBasedSchedule,
  generateComponentBasedSchedule,
  type TestingScheduleItem,
  type ComponentCategory,
  type TechniqueReference,
  type ComponentTestingScheduleItem,
} from '../utils/testing-schedule-generator';
import { type ConformanceLevel } from '../models/types';

export interface TestingScheduleConfig {
  levels: ConformanceLevel[];
  includeAdvisory: boolean;
  includeFailures: boolean;
}

export class TestingScheduleService {
  private wcagData: unknown;

  constructor() {
    this.wcagData = wcagData;
  }

  /**
   * Generate Success Criteria-based testing schedule
   */
  generateSCSchedule(config: TestingScheduleConfig): TestingScheduleItem[] {
    return generateSCBasedSchedule(
      this.wcagData as Parameters<typeof generateSCBasedSchedule>[0],
      config.levels
    );
  }

  /**
   * Generate Component-based testing schedule
   */
  generateComponentSchedule(config: TestingScheduleConfig): ComponentCategory[] {
    return generateComponentBasedSchedule(
      this.wcagData as Parameters<typeof generateComponentBasedSchedule>[0],
      config.levels
    );
  }

  /**
   * Get schedule statistics
   */
  getScheduleStats(schedule: TestingScheduleItem[]): {
    totalSC: number;
    totalTechniques: number;
    totalFailures: number;
    estimatedTimeHours: number;
    byLevel: Record<ConformanceLevel, number>;
    byPrinciple: Record<string, number>;
  } {
    const byLevel: Record<string, number> = { A: 0, AA: 0, AAA: 0 };
    const byPrinciple: Record<string, number> = {};
    let totalTechniques = 0;
    let totalFailures = 0;
    let totalTime = 0;

    schedule.forEach((item) => {
      byLevel[item.scLevel]++;
      totalTechniques += item.sufficientTechniques.length + item.advisoryTechniques.length;
      totalFailures += item.failures.length;
      totalTime += item.estimatedTime;

      const principleNum = item.principle.split(' ')[0];
      byPrinciple[principleNum] = (byPrinciple[principleNum] || 0) + 1;
    });

    return {
      totalSC: schedule.length,
      totalTechniques,
      totalFailures,
      estimatedTimeHours: Math.round(totalTime / 60),
      byLevel: byLevel as Record<ConformanceLevel, number>,
      byPrinciple,
    };
  }

  /**
   * Get component schedule statistics
   */
  getComponentStats(schedule: ComponentCategory[]): {
    totalCategories: number;
    totalComponents: number;
    totalTechniques: number;
    estimatedTimeHours: number;
    byCategory: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    let totalComponents = 0;
    let totalTechniques = 0;

    schedule.forEach((category) => {
      byCategory[category.category] = category.components.length;
      totalComponents += category.components.length;
      category.components.forEach((component: ComponentTestingScheduleItem) => {
        totalTechniques += component.techniques.length;
      });
    });

    const totalTime = schedule.reduce((sum, cat) => sum + cat.totalTime, 0);

    return {
      totalCategories: schedule.length,
      totalComponents,
      totalTechniques,
      estimatedTimeHours: Math.round(totalTime / 60),
      byCategory,
    };
  }

  /**
   * Filter schedule by sensory requirements
   */
  filterBySensory(
    schedule: TestingScheduleItem[],
    requirements: {
      sight?: boolean;
      hearing?: boolean;
      motor?: boolean;
    }
  ): TestingScheduleItem[] {
    return schedule.filter((item) => {
      if (requirements.sight !== undefined && item.requiresSight !== requirements.sight) {
        return false;
      }
      if (requirements.hearing !== undefined && item.requiresHearing !== requirements.hearing) {
        return false;
      }
      if (requirements.motor !== undefined && item.requiresMotor !== requirements.motor) {
        return false;
      }
      return true;
    });
  }

  /**
   * Export schedule as Markdown
   */
  exportSCScheduleAsMarkdown(schedule: TestingScheduleItem[]): string {
    const lines: string[] = [];

    lines.push('# WCAG 2.2 Testing Schedule - Success Criteria Based');
    lines.push('');
    lines.push('> Generated from WCAG 2.2 JSON data');
    lines.push('');

    const stats = this.getScheduleStats(schedule);
    lines.push('## Schedule Statistics');
    lines.push('');
    lines.push(`- **Total Success Criteria**: ${stats.totalSC}`);
    lines.push(`- **Total Techniques**: ${stats.totalTechniques}`);
    lines.push(`- **Total Failures to Check**: ${stats.totalFailures}`);
    lines.push(`- **Estimated Time**: ${stats.estimatedTimeHours} hours`);
    lines.push('');
    lines.push('### By Conformance Level');
    lines.push(`- Level A: ${stats.byLevel.A} criteria`);
    lines.push(`- Level AA: ${stats.byLevel.AA} criteria`);
    lines.push(`- Level AAA: ${stats.byLevel.AAA} criteria`);
    lines.push('');

    lines.push('---');
    lines.push('');

    let currentPrinciple = '';
    let currentGuideline = '';

    schedule.forEach((item, index) => {
      // Add principle header
      if (item.principle !== currentPrinciple) {
        currentPrinciple = item.principle;
        lines.push('');
        lines.push(`## ${currentPrinciple}`);
        lines.push('');
      }

      // Add guideline header
      if (item.guideline !== currentGuideline) {
        currentGuideline = item.guideline;
        lines.push(`### ${currentGuideline}`);
        lines.push('');
      }

      // Add SC details
      lines.push(`#### ${index + 1}. ${item.scNumber} ${item.scTitle} (Level ${item.scLevel})`);
      lines.push('');
      lines.push(`**Estimated Time**: ${item.estimatedTime} minutes`);
      lines.push('');
      lines.push('**Description**:');
      lines.push(item.description);
      lines.push('');

      if (item.componentsToTest.length > 0) {
        lines.push('**Components to Test**: ' + item.componentsToTest.join(', '));
        lines.push('');
      }

      if (item.sufficientTechniques.length > 0) {
        lines.push('**Sufficient Techniques**:');
        item.sufficientTechniques.slice(0, 5).forEach((tech: TechniqueReference) => {
          lines.push(`- [${tech.id}](${tech.url}): ${tech.title}`);
        });
        if (item.sufficientTechniques.length > 5) {
          lines.push(`- ... and ${item.sufficientTechniques.length - 5} more`);
        }
        lines.push('');
      }

      if (item.advisoryTechniques.length > 0) {
        lines.push('**Advisory Techniques**:');
        item.advisoryTechniques.slice(0, 3).forEach((tech: TechniqueReference) => {
          lines.push(`- [${tech.id}](${tech.url}): ${tech.title}`);
        });
        if (item.advisoryTechniques.length > 3) {
          lines.push(`- ... and ${item.advisoryTechniques.length - 3} more`);
        }
        lines.push('');
      }

      if (item.failures.length > 0) {
        lines.push('**Common Failures to Check**:');
        item.failures.forEach((failure: TechniqueReference) => {
          lines.push(`- [${failure.id}](${failure.url}): ${failure.title}`);
        });
        lines.push('');
      }

      lines.push('**Testing Steps**:');
      item.testingSteps.forEach((step: string) => {
        lines.push(`${step.startsWith(' ') ? step : `- ${step}`}`);
      });
      lines.push('');

      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export component schedule as Markdown
   */
  exportComponentScheduleAsMarkdown(schedule: ComponentCategory[]): string {
    const lines: string[] = [];

    lines.push('# WCAG 2.2 Testing Schedule - Component/Technique Based');
    lines.push('');
    lines.push('> Generated from WCAG 2.2 JSON data');
    lines.push('');

    const stats = this.getComponentStats(schedule);
    lines.push('## Schedule Statistics');
    lines.push('');
    lines.push(`- **Total Categories**: ${stats.totalCategories}`);
    lines.push(`- **Total Components**: ${stats.totalComponents}`);
    lines.push(`- **Total Techniques**: ${stats.totalTechniques}`);
    lines.push(`- **Estimated Time**: ${stats.estimatedTimeHours} hours`);
    lines.push('');

    lines.push('---');
    lines.push('');

    schedule.forEach((category) => {
      lines.push(`## ${category.category}`);
      lines.push('');
      lines.push(category.description);
      lines.push('');
      lines.push(`**Total Time**: ${Math.round(category.totalTime / 60)} hours`);
      lines.push('');

      category.components.forEach((component: ComponentTestingScheduleItem) => {
        lines.push(`### ${component.component}`);
        if (component.htmlElement) {
          lines.push(`**HTML Element**: \`<${component.htmlElement}>\``);
        }
        lines.push(`**Estimated Time**: ${component.estimatedTime} minutes`);
        lines.push('');

        lines.push('**Techniques to Test**:');
        lines.push('');

        component.techniques.forEach((tech: ComponentTestingScheduleItem['techniques'][0]) => {
          lines.push(`#### ${tech.techniqueId}: ${tech.title}`);
          lines.push('');
          lines.push('**Related Success Criteria**:');
          tech.relatedSC.forEach(
            (sc: ComponentTestingScheduleItem['techniques'][0]['relatedSC'][0]) => {
              lines.push(`- ${sc.scNumber} ${sc.scTitle} (Level ${sc.level})`);
            }
          );
          lines.push('');
          lines.push('**Testing Instructions**:');
          lines.push('```');
          lines.push(tech.testingInstructions);
          lines.push('```');
          lines.push('');
        });

        lines.push('---');
        lines.push('');
      });
    });

    return lines.join('\n');
  }
}

// Export singleton instance
export const testingScheduleService = new TestingScheduleService();
