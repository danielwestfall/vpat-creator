/**
 * Component Info Display
 * 
 * Shows detailed information about testing specific component types
 * with common WCAG criteria and testing guidance
 */

import React from 'react';
import './ComponentInfo.css';

interface ComponentTypeInfo {
  name: string;
  icon: string;
  description: string;
  commonSC: Array<{
    number: string;
    title: string;
    level: string;
    why: string;
  }>;
  testingTips: string[];
  commonIssues: string[];
}

const componentTypeInfo: Record<string, ComponentTypeInfo> = {
  'forms': {
    name: 'Forms & Inputs',
    icon: '📝',
    description: 'Form controls including inputs, selects, checkboxes, radio buttons, and textareas',
    commonSC: [
      {
        number: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        why: 'Labels must be programmatically associated with inputs',
      },
      {
        number: '2.4.6',
        title: 'Headings and Labels',
        level: 'AA',
        why: 'Form labels must be clear and descriptive',
      },
      {
        number: '3.2.2',
        title: 'On Input',
        level: 'A',
        why: 'Forms shouldn\'t change context unexpectedly',
      },
      {
        number: '3.3.1',
        title: 'Error Identification',
        level: 'A',
        why: 'Form errors must be clearly identified',
      },
      {
        number: '3.3.2',
        title: 'Labels or Instructions',
        level: 'A',
        why: 'Required fields and expected formats must be indicated',
      },
      {
        number: '4.1.2',
        title: 'Name, Role, Value',
        level: 'A',
        why: 'Form controls must have accessible names and roles',
      },
    ],
    testingTips: [
      'Tab through entire form - every field should be reachable',
      'Test with screen reader - labels should be announced with controls',
      'Submit with errors - error messages should be clear and associated',
      'Check required field indicators are visible and announced',
      'Verify all fields have visible labels (not just placeholders)',
    ],
    commonIssues: [
      'Missing or incorrectly associated labels',
      'Placeholder text used instead of proper labels',
      'Error messages not programmatically associated with fields',
      'Required fields not clearly indicated',
      'Submit button causes unexpected context change',
    ],
  },
  'images': {
    name: 'Images & Graphics',
    icon: '🖼️',
    description: 'Images, icons, graphics, charts, and other non-text content',
    commonSC: [
      {
        number: '1.1.1',
        title: 'Non-text Content',
        level: 'A',
        why: 'All images need alt text or be marked decorative',
      },
      {
        number: '1.4.5',
        title: 'Images of Text',
        level: 'AA',
        why: 'Use actual text instead of images of text when possible',
      },
      {
        number: '1.4.11',
        title: 'Non-text Contrast',
        level: 'AA',
        why: 'Graphics and UI components need 3:1 contrast',
      },
    ],
    testingTips: [
      'Turn off images - alt text should convey image meaning',
      'Test with screen reader - verify alt text is appropriate',
      'Check decorative images have empty alt="" or role="presentation"',
      'Verify complex images (charts, diagrams) have detailed descriptions',
      'Test image contrast with color contrast analyzer',
    ],
    commonIssues: [
      'Missing alt attributes on meaningful images',
      'Generic alt text like "image" or "graphic"',
      'Decorative images with descriptive alt text',
      'Complex images without long descriptions',
      'Icons without accessible names',
    ],
  },
  'navigation': {
    name: 'Navigation & Menus',
    icon: '🧭',
    description: 'Navigation menus, breadcrumbs, site navigation, and wayfinding elements',
    commonSC: [
      {
        number: '2.4.1',
        title: 'Bypass Blocks',
        level: 'A',
        why: 'Users need to skip repetitive navigation',
      },
      {
        number: '2.4.3',
        title: 'Focus Order',
        level: 'A',
        why: 'Navigation must follow logical keyboard order',
      },
      {
        number: '2.4.4',
        title: 'Link Purpose (In Context)',
        level: 'A',
        why: 'Navigation links must have clear purpose',
      },
      {
        number: '2.4.7',
        title: 'Focus Visible',
        level: 'AA',
        why: 'Keyboard focus must be visible on navigation items',
      },
      {
        number: '4.1.2',
        title: 'Name, Role, Value',
        level: 'A',
        why: 'Navigation landmarks and menus need proper ARIA',
      },
    ],
    testingTips: [
      'Test keyboard navigation through all menu items',
      'Verify skip link is present and works',
      'Check focus is clearly visible on all navigation items',
      'Test dropdown menus with keyboard and screen reader',
      'Verify current page is indicated in navigation',
    ],
    commonIssues: [
      'Missing skip navigation link',
      'Dropdown menus not keyboard accessible',
      'No indication of current page location',
      'Poor focus visibility on navigation items',
      'Missing navigation landmarks',
    ],
  },
  'links': {
    name: 'Links & Hyperlinks',
    icon: '🔗',
    description: 'Hyperlinks, anchor tags, and clickable text elements',
    commonSC: [
      {
        number: '2.4.4',
        title: 'Link Purpose (In Context)',
        level: 'A',
        why: 'Link text must describe the destination or purpose',
      },
      {
        number: '2.4.9',
        title: 'Link Purpose (Link Only)',
        level: 'AAA',
        why: 'Link text alone should be sufficient',
      },
      {
        number: '1.4.1',
        title: 'Use of Color',
        level: 'A',
        why: 'Links can\'t be distinguished by color alone',
      },
    ],
    testingTips: [
      'Read link text out of context - does it make sense?',
      'Check links are underlined or otherwise distinguished',
      'Verify visited links are visually distinguishable',
      'Test that links have clear focus indicators',
      'Avoid "click here" or "read more" without context',
    ],
    commonIssues: [
      'Generic link text like "Click Here" or "More"',
      'Links only distinguished by color',
      'Multiple "Read More" links without context',
      'Links to PDFs not indicated',
      'Missing link underlines or other indicators',
    ],
  },
  'buttons': {
    name: 'Buttons & Controls',
    icon: '🔘',
    description: 'Buttons, toggle switches, and interactive controls',
    commonSC: [
      {
        number: '2.1.1',
        title: 'Keyboard',
        level: 'A',
        why: 'All buttons must be keyboard accessible',
      },
      {
        number: '2.4.7',
        title: 'Focus Visible',
        level: 'AA',
        why: 'Button focus must be clearly visible',
      },
      {
        number: '4.1.2',
        title: 'Name, Role, Value',
        level: 'A',
        why: 'Buttons need accessible names and roles',
      },
    ],
    testingTips: [
      'Test all buttons with keyboard (Space/Enter)',
      'Verify button purpose is clear from text or accessible name',
      'Check icon-only buttons have accessible names',
      'Test toggle buttons announce their state',
      'Verify disabled buttons are marked as disabled',
    ],
    commonIssues: [
      'Divs or spans styled as buttons without role="button"',
      'Icon buttons without accessible names',
      'Toggle buttons without state indication',
      'Buttons not reachable by keyboard',
      'Unclear button labels',
    ],
  },
  'headings': {
    name: 'Headings & Structure',
    icon: '📑',
    description: 'Heading elements, page structure, and document hierarchy',
    commonSC: [
      {
        number: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        why: 'Headings create programmatic page structure',
      },
      {
        number: '2.4.6',
        title: 'Headings and Labels',
        level: 'AA',
        why: 'Headings must be descriptive and clear',
      },
      {
        number: '2.4.10',
        title: 'Section Headings',
        level: 'AAA',
        why: 'Use headings to organize content',
      },
    ],
    testingTips: [
      'Use heading outline tool to view hierarchy',
      'Verify heading levels don\'t skip (h1→h2→h3, not h1→h3)',
      'Check that each page has one h1',
      'Test screen reader heading navigation',
      'Verify headings accurately describe content',
    ],
    commonIssues: [
      'Skipped heading levels (h1 to h3)',
      'Multiple h1 elements on one page',
      'Visual headings not marked as heading elements',
      'Empty headings',
      'Generic heading text like "More Information"',
    ],
  },
  'tables': {
    name: 'Data Tables',
    icon: '📊',
    description: 'Data tables with rows, columns, headers, and relationships',
    commonSC: [
      {
        number: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        why: 'Table structure must be programmatically defined',
      },
      {
        number: '1.3.2',
        title: 'Meaningful Sequence',
        level: 'A',
        why: 'Table reading order must be logical',
      },
    ],
    testingTips: [
      'Verify <th> elements used for all headers',
      'Check complex tables use scope or headers/id',
      'Test with screen reader table navigation',
      'Verify table caption or aria-label describes purpose',
      'Check layout tables use role="presentation"',
    ],
    commonIssues: [
      'Missing or incorrect table headers',
      'Layout tables not marked with role="presentation"',
      'Complex tables without proper associations',
      'Missing table captions',
      'Merged cells not properly marked',
    ],
  },
  'media': {
    name: 'Audio & Video',
    icon: '🎬',
    description: 'Video players, audio players, captions, transcripts, and audio descriptions',
    commonSC: [
      {
        number: '1.2.1',
        title: 'Audio-only and Video-only (Prerecorded)',
        level: 'A',
        why: 'Provide alternatives for audio/video-only content',
      },
      {
        number: '1.2.2',
        title: 'Captions (Prerecorded)',
        level: 'A',
        why: 'Prerecorded video needs captions',
      },
      {
        number: '1.2.3',
        title: 'Audio Description or Media Alternative',
        level: 'A',
        why: 'Video needs audio description or transcript',
      },
      {
        number: '1.2.5',
        title: 'Audio Description (Prerecorded)',
        level: 'AA',
        why: 'Video needs full audio description',
      },
      {
        number: '2.2.2',
        title: 'Pause, Stop, Hide',
        level: 'A',
        why: 'Auto-playing media must be controllable',
      },
    ],
    testingTips: [
      'Verify video has accurate captions',
      'Check audio content has transcript',
      'Test media player controls with keyboard',
      'Verify auto-play can be paused',
      'Check audio descriptions for visual content',
    ],
    commonIssues: [
      'Missing captions on videos',
      'Auto-generated captions with many errors',
      'No transcript for audio content',
      'Media players not keyboard accessible',
      'Auto-playing content without controls',
    ],
  },
  'color-contrast': {
    name: 'Color & Contrast',
    icon: '🎨',
    description: 'Text contrast, color usage, and visual presentation',
    commonSC: [
      {
        number: '1.4.1',
        title: 'Use of Color',
        level: 'A',
        why: 'Information can\'t be conveyed by color alone',
      },
      {
        number: '1.4.3',
        title: 'Contrast (Minimum)',
        level: 'AA',
        why: 'Text needs 4.5:1 contrast (3:1 for large text)',
      },
      {
        number: '1.4.6',
        title: 'Contrast (Enhanced)',
        level: 'AAA',
        why: 'Text needs 7:1 contrast (4.5:1 for large text)',
      },
      {
        number: '1.4.11',
        title: 'Non-text Contrast',
        level: 'AA',
        why: 'UI components need 3:1 contrast',
      },
    ],
    testingTips: [
      'Use contrast checker on all text',
      'Check focus indicators have sufficient contrast',
      'Verify form controls and buttons have 3:1 contrast',
      'Test with grayscale - can you still distinguish elements?',
      'Check color isn\'t sole method for conveying information',
    ],
    commonIssues: [
      'Low contrast text (especially gray text)',
      'Poor contrast on buttons and controls',
      'Information conveyed only by color (e.g., red = required)',
      'Focus indicators with insufficient contrast',
      'Chart legends using only color to distinguish data',
    ],
  },
  'keyboard': {
    name: 'Keyboard Navigation',
    icon: '⌨️',
    description: 'Keyboard accessibility, focus management, and navigation',
    commonSC: [
      {
        number: '2.1.1',
        title: 'Keyboard',
        level: 'A',
        why: 'All functionality must work with keyboard',
      },
      {
        number: '2.1.2',
        title: 'No Keyboard Trap',
        level: 'A',
        why: 'Users must be able to navigate away from components',
      },
      {
        number: '2.4.3',
        title: 'Focus Order',
        level: 'A',
        why: 'Tab order must be logical',
      },
      {
        number: '2.4.7',
        title: 'Focus Visible',
        level: 'AA',
        why: 'Keyboard focus must be clearly visible',
      },
    ],
    testingTips: [
      'Put away your mouse - test entire page with keyboard only',
      'Tab through page - verify logical order',
      'Test all interactive elements can be activated',
      'Verify focus is always clearly visible',
      'Check for keyboard traps (can\'t escape component)',
    ],
    commonIssues: [
      'Interactive elements not reachable by keyboard',
      'Illogical tab order',
      'Keyboard traps in modals or custom widgets',
      'Poor or missing focus indicators',
      'Custom controls don\'t respond to expected keys',
    ],
  },
  'aria': {
    name: 'ARIA & Custom Widgets',
    icon: '🎭',
    description: 'ARIA attributes, custom components, and complex widgets',
    commonSC: [
      {
        number: '4.1.2',
        title: 'Name, Role, Value',
        level: 'A',
        why: 'Custom widgets need proper ARIA to be accessible',
      },
      {
        number: '1.3.1',
        title: 'Info and Relationships',
        level: 'A',
        why: 'ARIA establishes programmatic relationships',
      },
      {
        number: '4.1.3',
        title: 'Status Messages',
        level: 'AA',
        why: 'Dynamic updates need proper announcement',
      },
    ],
    testingTips: [
      'Test custom widgets with screen reader',
      'Verify ARIA roles match component behavior',
      'Check aria-label and aria-labelledby provide names',
      'Test state changes are announced (aria-live)',
      'Verify expanded/collapsed states are communicated',
    ],
    commonIssues: [
      'Incorrect or missing ARIA roles',
      'Missing accessible names on custom widgets',
      'State changes not announced',
      'Conflicting or redundant ARIA',
      'Using ARIA when native HTML would work',
    ],
  },
};

interface ComponentInfoProps {
  componentType: string;
}

export const ComponentInfo: React.FC<ComponentInfoProps> = ({ componentType }) => {
  const info = componentTypeInfo[componentType];

  if (!info) {
    return (
      <div className="component-info">
        <h3>Component Testing Guide</h3>
        <p>Select a component type to see testing guidance.</p>
      </div>
    );
  }

  return (
    <div className="component-info">
      <div className="component-header">
        <span className="component-icon">{info.icon}</span>
        <h3>{info.name}</h3>
      </div>
      
      <p className="component-description">{info.description}</p>

      <div className="info-section">
        <h4>Common Success Criteria</h4>
        <div className="sc-cards">
          {info.commonSC.map((sc) => (
            <div key={sc.number} className="sc-card">
              <div className="sc-card-header">
                <strong>{sc.number} {sc.title}</strong>
                <span className={`sc-level level-${sc.level.toLowerCase()}`}>{sc.level}</span>
              </div>
              <p className="sc-why">{sc.why}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h4>Testing Tips</h4>
        <ul className="tips-list">
          {info.testingTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="info-section">
        <h4>Common Issues</h4>
        <ul className="issues-list">
          {info.commonIssues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
