/**
 * Testing Schedule Generator
 *
 * Generates two types of testing schedules from WCAG 2.2 data:
 * 1. Success Criteria-based schedule (organized by SC)
 * 2. Technique/Component-based schedule (organized by HTML elements and techniques)
 */

import { type WCAGSuccessCriterion, type ConformanceLevel } from '../models/types';

// Extended type to include techniques
export interface WCAGSuccessCriterionWithTechniques extends WCAGSuccessCriterion {
  techniques?: {
    sufficient?: Array<{
      title?: string;
      techniques?: Array<{
        id: string;
        technology: string;
        title: string;
        suffix?: string;
      }>;
      groups?: Array<{
        id: string;
        title: string;
        techniques: Array<{
          id: string;
          technology: string;
          title: string;
        }>;
      }>;
    }>;
    advisory?: Array<{
      id: string;
      technology: string;
      title: string;
    }>;
    failure?: Array<{
      id: string;
      technology: string;
      title: string;
    }>;
  };
}

export interface TestingScheduleItem {
  id: string;
  scNumber: string;
  scTitle: string;
  scLevel: ConformanceLevel;
  guideline: string;
  principle: string;
  description: string;
  sufficientTechniques: TechniqueReference[];
  advisoryTechniques: TechniqueReference[];
  failures: TechniqueReference[];
  testingSteps: string[];
  componentsToTest: string[];
  estimatedTime: number; // in minutes
  requiresSight: boolean;
  requiresHearing: boolean;
  requiresMotor: boolean;
}

export interface TechniqueReference {
  id: string;
  technology: string;
  title: string;
  url?: string;
}

export interface ComponentTestingScheduleItem {
  component: string;
  htmlElement?: string;
  techniques: Array<{
    techniqueId: string;
    technology: string;
    title: string;
    relatedSC: Array<{
      scNumber: string;
      scTitle: string;
      level: ConformanceLevel;
    }>;
    testingInstructions: string;
  }>;
  estimatedTime: number;
}

export interface ComponentCategory {
  category: string;
  description: string;
  components: ComponentTestingScheduleItem[];
  totalTime: number;
}

/**
 * Generate Success Criteria-based testing schedule
 * Organized by SC with all techniques, failures, and testing guidance
 */
export function generateSCBasedSchedule(
  wcagData: {
    principles: Array<{
      id: string;
      num: string;
      handle: string;
      guidelines: Array<{
        id: string;
        num: string;
        handle: string;
        successcriteria: WCAGSuccessCriterionWithTechniques[];
      }>;
    }>;
  },
  levels: ConformanceLevel[] = ['A', 'AA', 'AAA']
): TestingScheduleItem[] {
  const schedule: TestingScheduleItem[] = [];

  wcagData.principles.forEach((principle) => {
    principle.guidelines.forEach((guideline) => {
      guideline.successcriteria.forEach((sc) => {
        // Filter by conformance level
        if (!levels.includes(sc.level as ConformanceLevel)) {
          return;
        }

        // Extract sufficient techniques
        const sufficientTechniques: TechniqueReference[] = [];
        if (sc.techniques?.sufficient) {
          sc.techniques.sufficient.forEach((item) => {
            if (item.techniques) {
              item.techniques.forEach((tech) => {
                if (tech.id && tech.technology && tech.title) {
                  sufficientTechniques.push({
                    id: tech.id,
                    technology: tech.technology,
                    title: tech.title,
                    url: `https://www.w3.org/WAI/WCAG22/Techniques/${tech.technology}/${tech.id}`,
                  });
                }
              });
            }
            if (item.groups) {
              item.groups.forEach((group) => {
                group.techniques.forEach((tech) => {
                  // Avoid duplicates and skip invalid techniques
                  if (
                    tech.id &&
                    tech.technology &&
                    tech.title &&
                    !sufficientTechniques.some((t) => t.id === tech.id)
                  ) {
                    sufficientTechniques.push({
                      id: tech.id,
                      technology: tech.technology,
                      title: tech.title,
                      url: `https://www.w3.org/WAI/WCAG22/Techniques/${tech.technology}/${tech.id}`,
                    });
                  }
                });
              });
            }
          });
        }

        // Extract advisory techniques
        const advisoryTechniques: TechniqueReference[] =
          sc.techniques?.advisory
            ?.filter((tech) => tech.id && tech.technology && tech.title)
            .map((tech) => ({
              id: tech.id,
              technology: tech.technology,
              title: tech.title,
              url: `https://www.w3.org/WAI/WCAG22/Techniques/${tech.technology}/${tech.id}`,
            })) || [];

        // Extract failures
        const failures: TechniqueReference[] =
          sc.techniques?.failure
            ?.filter((tech) => tech.id && tech.technology && tech.title)
            .map((tech) => ({
              id: tech.id,
              technology: tech.technology,
              title: tech.title,
              url: `https://www.w3.org/WAI/WCAG22/Techniques/failures/${tech.id}`,
            })) || [];

        // Determine sensory requirements based on principle and guideline
        const requiresSight = principle.id === 'perceivable';
        const requiresHearing =
          guideline.id === 'time-based-media' || guideline.id === 'audio-content';
        const requiresMotor = principle.id === 'operable';

        // Estimate time based on number of techniques and complexity
        const estimatedTime = calculateEstimatedTime(
          sufficientTechniques.length,
          advisoryTechniques.length,
          failures.length
        );

        // Generate testing steps
        const testingSteps = generateTestingSteps(sc, sufficientTechniques, failures);

        // Identify components to test
        const componentsToTest = identifyComponentsFromTechniques(sufficientTechniques);

        schedule.push({
          id: sc.id,
          scNumber: sc.num,
          scTitle: sc.handle,
          scLevel: sc.level as ConformanceLevel,
          guideline: `${guideline.num} ${guideline.handle}`,
          principle: `${principle.num} ${principle.handle}`,
          description: stripHTML(sc.content || ''),
          sufficientTechniques,
          advisoryTechniques,
          failures,
          testingSteps,
          componentsToTest,
          estimatedTime,
          requiresSight,
          requiresHearing,
          requiresMotor,
        });
      });
    });
  });

  return schedule.sort((a, b) => a.scNumber.localeCompare(b.scNumber));
}

/**
 * Generate Component/Technique-based testing schedule
 * Organized by HTML elements and components (buttons, forms, images, etc.)
 */
export function generateComponentBasedSchedule(
  wcagData: {
    principles: Array<{
      id: string;
      num: string;
      handle: string;
      guidelines: Array<{
        id: string;
        num: string;
        handle: string;
        successcriteria: WCAGSuccessCriterionWithTechniques[];
      }>;
    }>;
  },
  levels: ConformanceLevel[] = ['A', 'AA', 'AAA']
): ComponentCategory[] {
  // Map techniques to components
  const componentTechniqueMap = new Map<string, ComponentTestingScheduleItem>();

  wcagData.principles.forEach((principle) => {
    principle.guidelines.forEach((guideline) => {
      guideline.successcriteria.forEach((sc) => {
        if (!levels.includes(sc.level as ConformanceLevel)) {
          return;
        }

        // Process sufficient techniques
        if (sc.techniques?.sufficient) {
          sc.techniques.sufficient.forEach((item) => {
            const allTechs: Array<{
              id: string;
              technology: string;
              title: string;
            }> = [];

            if (item.techniques) {
              allTechs.push(...item.techniques);
            }
            if (item.groups) {
              item.groups.forEach((group) => {
                allTechs.push(...group.techniques);
              });
            }

            allTechs.forEach((tech) => {
              // Skip techniques without required fields
              if (!tech.id || !tech.technology || !tech.title) {
                return;
              }

              const component = mapTechniqueToComponent(tech);
              const key = `${component.component}_${component.htmlElement || 'general'}`;

              if (!componentTechniqueMap.has(key)) {
                componentTechniqueMap.set(key, {
                  component: component.component,
                  htmlElement: component.htmlElement,
                  techniques: [],
                  estimatedTime: 0,
                });
              }

              const componentItem = componentTechniqueMap.get(key)!;

              // Check if technique already exists for this component
              const existingTech = componentItem.techniques.find((t) => t.techniqueId === tech.id);

              if (existingTech) {
                // Add SC to existing technique
                existingTech.relatedSC.push({
                  scNumber: sc.num,
                  scTitle: sc.handle,
                  level: sc.level as ConformanceLevel,
                });
              } else {
                // Add new technique
                componentItem.techniques.push({
                  techniqueId: tech.id,
                  technology: tech.technology,
                  title: tech.title,
                  relatedSC: [
                    {
                      scNumber: sc.num,
                      scTitle: sc.handle,
                      level: sc.level as ConformanceLevel,
                    },
                  ],
                  testingInstructions: generateTechniqueTestingInstructions(tech, component),
                });
              }
            });
          });
        }
      });
    });
  });

  // Group components by category
  const categories = new Map<string, ComponentCategory>();

  componentTechniqueMap.forEach((item) => {
    const category = getComponentCategory(item.component);

    if (!categories.has(category.name)) {
      categories.set(category.name, {
        category: category.name,
        description: category.description,
        components: [],
        totalTime: 0,
      });
    }

    const cat = categories.get(category.name)!;
    item.estimatedTime = item.techniques.length * 5; // 5 minutes per technique
    cat.components.push(item);
    cat.totalTime += item.estimatedTime;
  });

  return Array.from(categories.values()).sort((a, b) => a.category.localeCompare(b.category));
}

// Helper functions

function calculateEstimatedTime(
  sufficientCount: number,
  advisoryCount: number,
  failureCount: number
): number {
  // Base time: 10 minutes
  // Each sufficient technique: 5 minutes
  // Each advisory technique: 3 minutes
  // Each failure to check: 2 minutes
  return 10 + sufficientCount * 5 + advisoryCount * 3 + failureCount * 2;
}

function generateTestingSteps(
  sc: WCAGSuccessCriterionWithTechniques,
  techniques: TechniqueReference[],
  failures: TechniqueReference[]
): string[] {
  const steps: string[] = [];

  steps.push(`Read and understand ${sc.num} ${sc.handle}`);
  steps.push('Identify all relevant components on the page');

  if (techniques.length > 0) {
    steps.push('Test using at least one sufficient technique:');
    techniques.slice(0, 3).forEach((tech) => {
      steps.push(`  - ${tech.id}: ${tech.title}`);
    });
  }

  if (failures.length > 0) {
    steps.push('Check for common failures:');
    failures.slice(0, 3).forEach((failure) => {
      steps.push(`  - ${failure.id}: ${failure.title}`);
    });
  }

  steps.push('Document results and take screenshots of any issues');
  steps.push('Record assistive technology and browser used for testing');

  return steps;
}

function identifyComponentsFromTechniques(techniques: TechniqueReference[]): string[] {
  const components = new Set<string>();

  techniques.forEach((tech) => {
    if (!tech.id) return; // Skip if no ID

    const techId = tech.id.toUpperCase();

    if (techId.startsWith('H') || techId.startsWith('HTML')) {
      // HTML techniques
      if (tech.title.includes('img') || tech.title.includes('image')) {
        components.add('Images');
      }
      if (
        tech.title.includes('form') ||
        tech.title.includes('input') ||
        tech.title.includes('label')
      ) {
        components.add('Forms');
      }
      if (tech.title.includes('link') || tech.title.includes('anchor')) {
        components.add('Links');
      }
      if (tech.title.includes('button')) {
        components.add('Buttons');
      }
      if (tech.title.includes('heading')) {
        components.add('Headings');
      }
      if (tech.title.includes('table')) {
        components.add('Tables');
      }
      if (tech.title.includes('video') || tech.title.includes('audio')) {
        components.add('Media');
      }
    }

    if (techId.startsWith('ARIA')) {
      components.add('ARIA Components');
    }
  });

  return Array.from(components);
}

function mapTechniqueToComponent(tech: { id: string; technology: string; title: string }): {
  component: string;
  htmlElement?: string;
} {
  const title = tech.title?.toLowerCase() || '';
  const id = tech.id?.toUpperCase() || '';

  // Images
  if (title.includes('img') || title.includes('image') || title.includes('alt')) {
    return { component: 'Images', htmlElement: 'img' };
  }

  // Forms
  if (title.includes('input') || title.includes('label') || title.includes('form control')) {
    return { component: 'Form Inputs', htmlElement: 'input' };
  }
  if (title.includes('select') || title.includes('dropdown')) {
    return { component: 'Form Inputs', htmlElement: 'select' };
  }
  if (title.includes('textarea')) {
    return { component: 'Form Inputs', htmlElement: 'textarea' };
  }

  // Links
  if (title.includes('link') || title.includes('anchor') || id.includes('H30')) {
    return { component: 'Links', htmlElement: 'a' };
  }

  // Buttons
  if (title.includes('button')) {
    return { component: 'Buttons', htmlElement: 'button' };
  }

  // Headings
  if (title.includes('heading')) {
    return { component: 'Headings', htmlElement: 'h1-h6' };
  }

  // Tables
  if (title.includes('table')) {
    return { component: 'Tables', htmlElement: 'table' };
  }

  // Media
  if (title.includes('video') || title.includes('audio') || title.includes('media')) {
    return { component: 'Media Elements', htmlElement: 'video/audio' };
  }

  // Lists
  if (title.includes('list')) {
    return { component: 'Lists', htmlElement: 'ul/ol' };
  }

  // ARIA
  if (id.startsWith('ARIA') || title.includes('aria-')) {
    return { component: 'ARIA Components', htmlElement: 'various' };
  }

  // Color and Contrast
  if (title.includes('color') || title.includes('contrast')) {
    return { component: 'Color & Contrast' };
  }

  // Text
  if (title.includes('text size') || title.includes('font') || title.includes('resize')) {
    return { component: 'Text & Typography' };
  }

  // Navigation
  if (title.includes('navigation') || title.includes('menu')) {
    return { component: 'Navigation' };
  }

  // Focus
  if (title.includes('focus') || title.includes('keyboard')) {
    return { component: 'Keyboard & Focus' };
  }

  return { component: 'General Content' };
}

function getComponentCategory(component: string): { name: string; description: string } {
  const categories: Record<string, { name: string; description: string }> = {
    Images: {
      name: 'Images & Graphics',
      description: 'Testing images, icons, graphics, and non-text content',
    },
    'Form Inputs': {
      name: 'Forms & Inputs',
      description: 'Testing form controls, inputs, labels, and form validation',
    },
    Links: {
      name: 'Links & Navigation',
      description: 'Testing hyperlinks, navigation menus, and link purpose',
    },
    Buttons: {
      name: 'Interactive Controls',
      description: 'Testing buttons, controls, and interactive elements',
    },
    Headings: {
      name: 'Structure & Semantics',
      description: 'Testing headings, landmarks, and document structure',
    },
    Tables: {
      name: 'Data Tables',
      description: 'Testing table structure, headers, and relationships',
    },
    'Media Elements': {
      name: 'Multimedia',
      description: 'Testing video, audio, captions, and transcripts',
    },
    Lists: {
      name: 'Lists & Groups',
      description: 'Testing lists, list items, and grouped content',
    },
    'ARIA Components': {
      name: 'ARIA & Custom Widgets',
      description: 'Testing ARIA attributes, roles, and custom components',
    },
    'Color & Contrast': {
      name: 'Visual Design',
      description: 'Testing color contrast, color usage, and visual presentation',
    },
    'Text & Typography': {
      name: 'Text & Typography',
      description: 'Testing text sizing, spacing, and readability',
    },
    Navigation: {
      name: 'Navigation & Wayfinding',
      description: 'Testing navigation systems and page wayfinding',
    },
    'Keyboard & Focus': {
      name: 'Keyboard Accessibility',
      description: 'Testing keyboard navigation and focus management',
    },
    'General Content': {
      name: 'General Content',
      description: 'Testing general content and page-level features',
    },
  };

  return (
    categories[component] || {
      name: 'Other',
      description: 'Other testing requirements',
    }
  );
}

function generateTechniqueTestingInstructions(
  tech: { id: string; technology: string; title: string },
  component: { component: string; htmlElement?: string }
): string {
  const instructions: string[] = [];

  instructions.push(`Test ${tech.id}: ${tech.title}`);
  instructions.push('');
  instructions.push('Steps:');
  instructions.push(`1. Locate all ${component.htmlElement || component.component} elements`);
  instructions.push('2. Verify implementation matches technique requirements');
  instructions.push('3. Test with keyboard navigation');
  instructions.push('4. Test with screen reader');
  instructions.push('5. Document any issues found');

  return instructions.join('\n');
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
