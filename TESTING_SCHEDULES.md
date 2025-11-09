# WCAG 2.2 Testing Schedules

## Overview

This module generates two types of testing schedules from the WCAG 2.2 JSON data:

1. **Success Criteria-Based Schedule** - Organized by WCAG Success Criteria
2. **Component/Technique-Based Schedule** - Organized by HTML elements and testing techniques

## Purpose

These schedules help testers organize their accessibility testing workflow in two different ways:

- **SC-Based**: Ideal for compliance-focused testing, audits, and generating VPATs
- **Component-Based**: Ideal for developers testing specific UI components and elements

## Files

### Core Logic
- `src/utils/testing-schedule-generator.ts` - Schedule generation algorithms
- `src/services/testing-schedule-service.ts` - Service layer with export functions
- `src/utils/testing-schedule-demo.ts` - Demo and helper functions

### UI Components
- `src/components/testing/TestingSchedulePreview.tsx` - React component to preview schedules
- `src/components/testing/TestingSchedulePreview.css` - Styling

## Usage

### Generate Schedules Programmatically

```typescript
import { testingScheduleService } from './services/testing-schedule-service';

// Generate SC-based schedule for Level A and AA
const scSchedule = testingScheduleService.generateSCSchedule({
  levels: ['A', 'AA'],
  includeAdvisory: true,
  includeFailures: true,
});

// Generate component-based schedule
const componentSchedule = testingScheduleService.generateComponentSchedule({
  levels: ['A', 'AA'],
  includeAdvisory: true,
  includeFailures: true,
});

// Get statistics
const scStats = testingScheduleService.getScheduleStats(scSchedule);
console.log(`Total SC: ${scStats.totalSC}`);
console.log(`Estimated time: ${scStats.estimatedTimeHours} hours`);

// Export as Markdown
const markdown = testingScheduleService.exportSCScheduleAsMarkdown(scSchedule);

// Filter by sensory requirements
const visualTests = testingScheduleService.filterBySensory(scSchedule, {
  sight: true,
  hearing: false,
});
```

### View in Browser

Navigate to the Testing Schedules view in the app to see:
- Statistics for both schedule types
- Preview of sample items
- Download options (Markdown and JSON)
- Category breakdown for component-based schedule

### Download Schedules

The UI provides buttons to download both schedules as:
- **Markdown** - Human-readable documentation format
- **JSON** - Machine-readable data format

## Success Criteria-Based Schedule

### Structure

Each SC entry includes:

```typescript
{
  id: string;                    // SC identifier
  scNumber: string;              // e.g., "1.1.1"
  scTitle: string;               // e.g., "Non-text Content"
  scLevel: 'A' | 'AA' | 'AAA';
  guideline: string;             // Parent guideline
  principle: string;             // Parent principle
  description: string;           // Plain text description
  sufficientTechniques: [        // Techniques that meet the SC
    {
      id: string;                // e.g., "H37"
      technology: string;        // e.g., "html"
      title: string;
      url: string;               // Link to W3C technique
    }
  ];
  advisoryTechniques: [...];     // Best practice techniques
  failures: [...];               // Common failures to check
  testingSteps: string[];        // Step-by-step testing guide
  componentsToTest: string[];    // Related HTML components
  estimatedTime: number;         // Minutes
  requiresSight: boolean;        // Sensory requirements
  requiresHearing: boolean;
  requiresMotor: boolean;
}
```

### Benefits

- ✅ Maps directly to VPAT structure
- ✅ Comprehensive coverage of all criteria
- ✅ Includes failures to check
- ✅ Provides testing steps
- ✅ Estimates time requirements
- ✅ Can filter by conformance level
- ✅ Can filter by sensory requirements

### Use Cases

1. **VPAT Generation** - Test each SC and document conformance
2. **Compliance Audits** - Systematic coverage of all requirements
3. **Accessible Testing** - Filter by sensory requirements for testers with disabilities
4. **Time Estimation** - Plan testing resources based on estimated times

## Component/Technique-Based Schedule

### Structure

Organized into categories:

```typescript
{
  category: string;              // e.g., "Images & Graphics"
  description: string;
  components: [
    {
      component: string;         // e.g., "Images"
      htmlElement: string;       // e.g., "img"
      techniques: [
        {
          techniqueId: string;   // e.g., "H37"
          technology: string;
          title: string;
          relatedSC: [           // All SC that use this technique
            {
              scNumber: string;
              scTitle: string;
              level: 'A' | 'AA' | 'AAA';
            }
          ];
          testingInstructions: string;
        }
      ];
      estimatedTime: number;
    }
  ];
  totalTime: number;
}
```

### Categories

1. **Images & Graphics** - Images, icons, graphics, alt text
2. **Forms & Inputs** - Form controls, labels, validation
3. **Links & Navigation** - Hyperlinks, navigation menus
4. **Interactive Controls** - Buttons, controls, widgets
5. **Structure & Semantics** - Headings, landmarks, document structure
6. **Data Tables** - Table structure, headers, relationships
7. **Multimedia** - Video, audio, captions, transcripts
8. **Lists & Groups** - Lists, grouped content
9. **ARIA & Custom Widgets** - ARIA attributes, custom components
10. **Visual Design** - Color contrast, visual presentation
11. **Text & Typography** - Text sizing, spacing, readability
12. **Navigation & Wayfinding** - Navigation systems
13. **Keyboard Accessibility** - Keyboard navigation, focus management
14. **General Content** - Page-level features

### Benefits

- ✅ Organized by what developers work on
- ✅ Shows all SC related to each component
- ✅ Efficient for component-by-component testing
- ✅ Groups related techniques together
- ✅ Provides testing instructions per technique

### Use Cases

1. **Component Testing** - Test all buttons, forms, images, etc. at once
2. **Development Workflow** - Developers can test components as they build
3. **Pattern Library Testing** - Test component library systematically
4. **Code Review** - Review specific component types for accessibility

## Statistics

Both schedules provide statistics:

### SC Schedule Stats
- Total Success Criteria
- Total Techniques (Sufficient + Advisory)
- Total Failures to Check
- Estimated Time in Hours
- Breakdown by Conformance Level (A, AA, AAA)
- Breakdown by Principle

### Component Schedule Stats
- Total Categories
- Total Components
- Total Techniques
- Estimated Time in Hours
- Breakdown by Category

## Filtering Options

### By Conformance Level

```typescript
// Only test Level A and AA
const schedule = testingScheduleService.generateSCSchedule({
  levels: ['A', 'AA'],
  includeAdvisory: true,
  includeFailures: true,
});
```

### By Sensory Requirements

```typescript
// Only visual tests (for blind testers to skip)
const visualTests = testingScheduleService.filterBySensory(schedule, {
  sight: true,
  hearing: false,
});

// Only auditory tests
const auditoryTests = testingScheduleService.filterBySensory(schedule, {
  hearing: true,
});

// Only keyboard/motor tests
const motorTests = testingScheduleService.filterBySensory(schedule, {
  motor: true,
});
```

## Export Formats

### Markdown

Human-readable documentation format with:
- Hierarchical structure (Principles → Guidelines → SC)
- Clickable links to W3C techniques
- Testing steps for each SC
- Statistics at the top
- Category breakdown for component schedule

### JSON

Machine-readable format for:
- Integration with other tools
- Custom processing
- Database import
- API responses

## Customization

The schedules can be customized by:

1. **Adjusting time estimates** - Modify `calculateEstimatedTime()` function
2. **Adding component mappings** - Update `mapTechniqueToComponent()` function
3. **Creating new categories** - Add to `getComponentCategory()` function
4. **Modifying testing steps** - Update `generateTestingSteps()` function
5. **Adding more filters** - Create new filtering functions

## Future Enhancements

Potential additions:
- [ ] Filter by technology (HTML, CSS, ARIA, JavaScript)
- [ ] Export to Excel/CSV format
- [ ] Integration with project management tools
- [ ] Checklist view for tracking progress
- [ ] Calendar integration for scheduling
- [ ] Team assignment for distributed testing
- [ ] Integration with bug tracking systems
- [ ] Screenshot upload areas per SC/component
- [ ] Automated test result suggestions

## Integration with VPAT Creator

These schedules integrate with the VPAT Creator application:

1. **Project Creation** - Choose schedule type when starting a project
2. **Testing Workflow** - Navigate through schedule items sequentially
3. **Progress Tracking** - Mark items as tested/passed/failed
4. **VPAT Generation** - SC-based schedule maps directly to VPAT structure
5. **Bug Reporting** - Component-based schedule groups issues by component
6. **Customization** - Allow users to modify schedules per project

## References

- [WCAG 2.2 Understanding Documentation](https://www.w3.org/WAI/WCAG22/Understanding/)
- [WCAG 2.2 Techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
- [How to Meet WCAG (Quick Reference)](https://www.w3.org/WAI/WCAG22/quickref/)
- [VPAT Template](https://www.itic.org/policy/accessibility/vpat)
