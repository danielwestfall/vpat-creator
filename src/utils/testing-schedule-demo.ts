/**
 * Demo script to generate and display testing schedules
 * Run this in the browser console or as a standalone demo
 */

import { testingScheduleService } from '../services/testing-schedule-service';
import { createLogger } from './logger';

const logger = createLogger('testing-schedule-demo');

export function generateAndDisplaySchedules() {
  logger.info('🔄 Generating WCAG 2.2 Testing Schedules...\n');

  // Generate SC-based schedule (Level A and AA only)
  logger.info('📋 Generating Success Criteria-based schedule...');
  const scSchedule = testingScheduleService.generateSCSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  const scStats = testingScheduleService.getScheduleStats(scSchedule);
  logger.info('✅ SC Schedule Generated:');
  logger.info(`   - Total SC: ${scStats.totalSC}`);
  logger.info(`   - Total Techniques: ${scStats.totalTechniques}`);
  logger.info(`   - Total Failures: ${scStats.totalFailures}`);
  logger.info(`   - Estimated Time: ${scStats.estimatedTimeHours} hours`);
  logger.info(`   - Level A: ${scStats.byLevel.A} criteria`);
  logger.info(`   - Level AA: ${scStats.byLevel.AA} criteria\n`);

  // Generate component-based schedule
  logger.info('🧩 Generating Component/Technique-based schedule...');
  const componentSchedule = testingScheduleService.generateComponentSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  const componentStats = testingScheduleService.getComponentStats(componentSchedule);
  logger.info('✅ Component Schedule Generated:');
  logger.info(`   - Total Categories: ${componentStats.totalCategories}`);
  logger.info(`   - Total Components: ${componentStats.totalComponents}`);
  logger.info(`   - Total Techniques: ${componentStats.totalTechniques}`);
  logger.info(`   - Estimated Time: ${componentStats.estimatedTimeHours} hours\n`);

  logger.info('📂 Categories:');
  componentSchedule.forEach((cat) => {
    logger.info(`   - ${cat.category}: ${cat.components.length} components`);
  });

  // Generate markdown exports
  logger.info('\n📄 Generating Markdown exports...');
  const scMarkdown = testingScheduleService.exportSCScheduleAsMarkdown(scSchedule);
  const componentMarkdown =
    testingScheduleService.exportComponentScheduleAsMarkdown(componentSchedule);

  logger.info('✅ Markdown files generated');

  // Example: Filter by sensory requirements
  logger.info('\n🔍 Example: Filtering by sensory requirements...');
  const visualOnlyTests = testingScheduleService.filterBySensory(scSchedule, {
    sight: true,
    hearing: false,
  });
  logger.info(`   - Visual-only tests: ${visualOnlyTests.length} criteria`);

  const auditoryTests = testingScheduleService.filterBySensory(scSchedule, {
    hearing: true,
  });
  logger.info(`   - Auditory tests: ${auditoryTests.length} criteria`);

  const motorTests = testingScheduleService.filterBySensory(scSchedule, {
    motor: true,
  });
  logger.info(`   - Motor/keyboard tests: ${motorTests.length} criteria`);

  return {
    scSchedule,
    scMarkdown,
    componentSchedule,
    componentMarkdown,
  };
}

// Make available in browser console for testing
if (typeof window !== 'undefined') {
  (window as unknown as { generateSchedules: typeof generateAndDisplaySchedules }).generateSchedules =
    generateAndDisplaySchedules;
  logger.info(
    '💡 Run window.generateSchedules() to generate testing schedules in console'
  );
}
