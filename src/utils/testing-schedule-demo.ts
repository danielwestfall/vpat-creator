/**
 * Demo script to generate and display testing schedules
 * Run this in the browser console or as a standalone demo
 */

import { testingScheduleService } from '../services/testing-schedule-service';

export function generateAndDisplaySchedules() {
  console.log('🔄 Generating WCAG 2.2 Testing Schedules...\n');

  // Generate SC-based schedule (Level A and AA only)
  console.log('📋 Generating Success Criteria-based schedule...');
  const scSchedule = testingScheduleService.generateSCSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  const scStats = testingScheduleService.getScheduleStats(scSchedule);
  console.log('✅ SC Schedule Generated:');
  console.log(`   - Total SC: ${scStats.totalSC}`);
  console.log(`   - Total Techniques: ${scStats.totalTechniques}`);
  console.log(`   - Total Failures: ${scStats.totalFailures}`);
  console.log(`   - Estimated Time: ${scStats.estimatedTimeHours} hours`);
  console.log(`   - Level A: ${scStats.byLevel.A} criteria`);
  console.log(`   - Level AA: ${scStats.byLevel.AA} criteria\n`);

  // Generate component-based schedule
  console.log('🧩 Generating Component/Technique-based schedule...');
  const componentSchedule = testingScheduleService.generateComponentSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  const componentStats = testingScheduleService.getComponentStats(componentSchedule);
  console.log('✅ Component Schedule Generated:');
  console.log(`   - Total Categories: ${componentStats.totalCategories}`);
  console.log(`   - Total Components: ${componentStats.totalComponents}`);
  console.log(`   - Total Techniques: ${componentStats.totalTechniques}`);
  console.log(`   - Estimated Time: ${componentStats.estimatedTimeHours} hours\n`);

  console.log('📂 Categories:');
  componentSchedule.forEach((cat) => {
    console.log(`   - ${cat.category}: ${cat.components.length} components`);
  });

  // Generate markdown exports
  console.log('\n📄 Generating Markdown exports...');
  const scMarkdown = testingScheduleService.exportSCScheduleAsMarkdown(scSchedule);
  const componentMarkdown =
    testingScheduleService.exportComponentScheduleAsMarkdown(componentSchedule);

  console.log('✅ Markdown files generated');

  // Example: Filter by sensory requirements
  console.log('\n🔍 Example: Filtering by sensory requirements...');
  const visualOnlyTests = testingScheduleService.filterBySensory(scSchedule, {
    sight: true,
    hearing: false,
  });
  console.log(`   - Visual-only tests: ${visualOnlyTests.length} criteria`);

  const auditoryTests = testingScheduleService.filterBySensory(scSchedule, {
    hearing: true,
  });
  console.log(`   - Auditory tests: ${auditoryTests.length} criteria`);

  const motorTests = testingScheduleService.filterBySensory(scSchedule, {
    motor: true,
  });
  console.log(`   - Motor/keyboard tests: ${motorTests.length} criteria`);

  return {
    scSchedule,
    componentSchedule,
    scMarkdown,
    componentMarkdown,
    stats: {
      sc: scStats,
      component: componentStats,
    },
  };
}

// Example: Get sample data for UI display
export function getSampleScheduleData() {
  const scSchedule = testingScheduleService.generateSCSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  // Return first 5 SC for demo
  return {
    totalItems: scSchedule.length,
    sampleItems: scSchedule.slice(0, 5),
    stats: testingScheduleService.getScheduleStats(scSchedule),
  };
}

// Example: Get component data for specific category
export function getComponentsByCategory(category: string) {
  const componentSchedule = testingScheduleService.generateComponentSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  const categoryData = componentSchedule.find((cat) => cat.category === category);

  if (!categoryData) {
    return null;
  }

  return {
    category: categoryData.category,
    description: categoryData.description,
    totalTime: categoryData.totalTime,
    components: categoryData.components,
    componentCount: categoryData.components.length,
  };
}

// Example: Get all available categories
export function getAllCategories() {
  const componentSchedule = testingScheduleService.generateComponentSchedule({
    levels: ['A', 'AA'],
    includeAdvisory: true,
    includeFailures: true,
  });

  return componentSchedule.map((cat) => ({
    name: cat.category,
    description: cat.description,
    componentCount: cat.components.length,
    estimatedTime: Math.round(cat.totalTime / 60),
  }));
}

// For browser console or demo
if (typeof window !== 'undefined') {
  (window as unknown as { generateSchedules: typeof generateAndDisplaySchedules }).generateSchedules =
    generateAndDisplaySchedules;
  console.log(
    '💡 Run window.generateSchedules() to generate testing schedules in console'
  );
}
