import type { ConformanceStatus } from '../models/types';

export interface SCTemplate {
  supports: string;
  partial: string;
  fails: string;
  na: string;
}

const DEFAULT_TEMPLATE: SCTemplate = {
  supports: 'The content fully meets the requirements of this success criterion.',
  partial: 'The content partially meets the requirements, but some issues remain.',
  fails: 'The content does not meet the requirements of this success criterion.',
  na: 'This success criterion is not applicable to the content.',
};

const SC_TEMPLATES: Record<string, SCTemplate> = {
  // 1.1.1 Non-text Content
  'non-text-content': {
    supports:
      'All non-text content, such as images and icons, has appropriate alternative text that serves the equivalent purpose.',
    partial:
      'Most non-text content has alternative text, but some decorative images are missing null alt attributes or some complex images lack detailed descriptions.',
    fails:
      'Significant non-text content lacks alternative text, or the provided alternative text does not serve the equivalent purpose.',
    na: 'There is no non-text content present on the page.',
  },
  // 1.2.1 Audio-only and Video-only (Prerecorded)
  'audio-only-and-video-only-prerecorded': {
    supports:
      'Transcripts are provided for all audio-only content, and audio tracks or text alternatives are provided for video-only content.',
    partial: 'Transcripts are provided but may be incomplete or inaccurate for some media files.',
    fails: 'No alternatives are provided for prerecorded audio-only or video-only content.',
    na: 'There is no prerecorded audio-only or video-only content.',
  },
  // 1.2.2 Captions (Prerecorded)
  'captions-prerecorded': {
    supports: 'Synchronized captions are provided for all prerecorded video content.',
    partial:
      'Captions are provided but are not perfectly synchronized or contain significant errors.',
    fails: 'Captions are missing for prerecorded video content.',
    na: 'There is no prerecorded video content.',
  },
  // 1.2.3 Audio Description or Media Alternative (Prerecorded)
  'audio-description-or-media-alternative-prerecorded': {
    supports:
      'Audio descriptions or text transcripts are provided for all prerecorded video content.',
    partial:
      'Alternatives are provided but do not cover all visual information required to understand the content.',
    fails: 'No audio description or media alternative is provided for video content.',
    na: 'There is no prerecorded video content.',
  },
  // 1.3.1 Info and Relationships
  'info-and-relationships': {
    supports:
      'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text. Semantic markup is used correctly.',
    partial:
      'Most structure is programmatically determined, but some headings or list elements are used incorrectly.',
    fails:
      'Visual structure is not represented in the code (e.g., using bold text for headings instead of heading tags).',
    na: 'The content does not have complex structure or relationships.',
  },
  // 1.3.2 Meaningful Sequence
  'meaningful-sequence': {
    supports:
      'The reading order of the content is correct and meaning is preserved when the content is read programmatically.',
    partial:
      'The reading sequence is mostly correct, but some elements (like modals or focus order) are illogical.',
    fails:
      'The DOM order does not match the visual order, causing confusion for screen reader users.',
    na: 'The content sequence does not affect its meaning.',
  },
  // 1.3.3 Sensory Characteristics
  'sensory-characteristics': {
    supports:
      'Instructions do not rely solely on sensory characteristics such as shape, size, visual location, orientation, or sound.',
    partial:
      'Some instructions use sensory language but also provide other means of identification.',
    fails:
      'Instructions rely solely on properties like "click the red button" or "see the right column".',
    na: 'There are no instructions or references to content based on sensory characteristics.',
  },
  // 1.4.1 Use of Color
  'use-of-color': {
    supports:
      'Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.',
    partial: 'Color is mostly supported by other means, but some error states rely only on color.',
    fails:
      'Information is conveyed solely through color (e.g., green for good, red for bad) without text or icon alternatives.',
    na: 'Color is not used to convey meaning.',
  },
  // 1.4.3 Contrast (Minimum)
  'contrast-minimum': {
    supports:
      'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1 (or 3:1 for large text).',
    partial:
      'Most text meets contrast requirements, but some brand colors or disabled states fall below the threshold.',
    fails: 'Significant portions of text do not meet the minimum contrast ratio requirements.',
    na: 'There is no text content on the page.',
  },
  // 2.1.1 Keyboard
  keyboard: {
    supports:
      'All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.',
    partial:
      'Most functionality is keyboard accessible, but some custom widgets or modals trap focus or cannot be opened.',
    fails: 'Major functionality cannot be accessed or operated using a keyboard.',
    na: 'The content does not require user input or interaction.',
  },
  // 2.1.2 No Keyboard Trap
  'no-keyboard-trap': {
    supports:
      'Keyboard focus is not trapped within any component, and the user can move focus to and from all components using only a keyboard.',
    partial:
      'Focus can be moved out of most components, but non-standard keystrokes might be required for some.',
    fails:
      'Keyboard focus gets trapped in a component (e.g., a modal), preventing navigation to the rest of the page.',
    na: 'There are no interactive components that capture focus.',
  },
  // 2.4.1 Bypass Blocks
  'bypass-blocks': {
    supports:
      'A mechanism is available to bypass blocks of content that are repeated on multiple Web pages (e.g., "Skip to Content" link).',
    partial: 'A skip link exists but is not visible on focus or does not work correctly.',
    fails: 'No mechanism exists to bypass repeated content blocks.',
    na: 'The content does not adhere to a consistent structure across pages or is a single page.',
  },
  // 2.4.2 Page Titled
  'page-titled': {
    supports: 'Web pages have titles that describe topic or purpose.',
    partial:
      'The page has a title, but it is generic or does not uniquely identify the page content.',
    fails: 'The page is missing a title or the title is completely unrelated.',
    na: 'The content is not a web page.',
  },
  // 2.4.3 Focus Order
  'focus-order': {
    supports:
      'Focusable components receive focus in an order that preserves meaning and operability.',
    partial:
      'Focus order is mostly logical, but some dynamically added elements are out of sequence.',
    fails: 'Focus order is chaotic or illogical, making navigation difficult.',
    na: 'There are no focusable components.',
  },
  // 2.4.4 Link Purpose (In Context)
  'link-purpose-in-context': {
    supports:
      'The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.',
    partial: 'Most links are descriptive, but some "Read More" links rely heavily on context.',
    fails: 'Links are ambiguous (e.g., "Click here") and cannot be understood even with context.',
    na: 'There are no links on the page.',
  },
  // 2.4.6 Headings and Labels
  'headings-and-labels': {
    supports: 'Headings and labels describe topic or purpose.',
    partial:
      'Headings and labels are present but some are vague or do not accurately describe the detailed content.',
    fails: 'Headings or labels are missing or misleading.',
    na: 'There are no headings or labels.',
  },
  // 2.4.7 Focus Visible
  'focus-visible': {
    supports:
      'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
    partial:
      'Focus indicators are present for most elements, but some custom controls hide the outline.',
    fails: 'There is no visible focus indicator for interactive elements.',
    na: 'There are no interactive user interface components.',
  },
  // 3.1.1 Language of Page
  'language-of-page': {
    supports: 'The default human language of each Web page can be programmatically determined.',
    partial: 'The language attribute is present but incorrect for the content.',
    fails: 'The language attribute is missing from the html tag.',
    na: 'The content is not a web page.',
  },
  // 3.2.1 On Focus
  'on-focus': {
    supports: 'When any component receives focus, it does not initiate a change of context.',
    partial: 'Most components behave correctly, but one form field submits automatically on focus.',
    fails:
      'Components frequently initiate context changes (e.g., referencing a new page) simply by receiving focus.',
    na: 'There are no interactive components.',
  },
  // 3.2.2 On Input
  'on-input': {
    supports:
      'Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.',
    partial: 'Some inputs trigger changes, but the user is usually warned.',
    fails:
      'Input changes cause unexpected context switches (e.g., dropdown selection submits form immediately without warning).',
    na: 'There are no components where data entry occurs.',
  },
  // 3.3.1 Error Identification
  'error-identification': {
    supports:
      'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.',
    partial: 'Errors are identified generally, but not associated with the specific field.',
    fails: 'Input errors are not identified or are identified only by color.',
    na: 'There is no form validation or user input.',
  },
  // 3.3.2 Labels or Instructions
  'labels-or-instructions': {
    supports: 'Labels or instructions are provided when content requires user input.',
    partial:
      'Fields have labels, but they are not visually persistent or lack necessary instructions for format.',
    fails: 'Form fields lack labels or instructions completely.',
    na: 'There are no content fields requiring user input.',
  },
  // 4.1.1 Parsing - Note: Obsolete in WCAG 2.2 but kept for 2.1 support
  parsing: {
    supports:
      'In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique.',
    partial:
      'Markup has some validation errors, but they do not impact accessibility or assistive technology parsing.',
    fails:
      'Significant parsing errors exist (e.g., duplicate IDs) that interfere with assistive technology.',
    na: 'The content does not use a markup language.',
  },
  // 4.1.2 Name, Role, Value
  'name-role-value': {
    supports:
      'For all user interface components (including but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.',
    partial:
      'Most components have correct names and roles, but some custom widgets lack state updates.',
    fails:
      'Standard HTML controls are used improperly or custom controls lack ARIA attributes for name, role, and value.',
    na: 'There are no user interface components.',
  },
};

export const getSCTemplate = (scId: string, status: ConformanceStatus | 'Not Tested'): string => {
  if (status === 'Not Tested') return '';

  const template = SC_TEMPLATES[scId] || DEFAULT_TEMPLATE;
  let text = '';

  switch (status) {
    case 'Supports':
      text = template.supports;
      break;
    case 'Partially Supports':
      text = template.partial;
      break;
    case 'Does Not Support':
      text = template.fails;
      break;
    case 'Not Applicable':
      text = template.na;
      break;
    default:
      text = '';
  }

  // Append future work statement for non-perfect, non-NA statuses
  if (status === 'Partially Supports' || status === 'Does Not Support') {
    text += ' Work is underway to meet this criteria in the future.';
  }

  return text;
};

export const getSCTemplatesObject = (scId: string): SCTemplate => {
  return SC_TEMPLATES[scId] || DEFAULT_TEMPLATE;
};
