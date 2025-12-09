export interface HelpTopic {
  id: string;
  title: string;
  icon: string;
  content: string;
  category: 'basics' | 'testing' | 'collaboration' | 'advanced';
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    category: 'basics',
    content: `
      <h2>Welcome to VPAT Creator</h2>
      <p>VPAT Creator is a tool designed to help you conduct accessibility audits and generate VPAT (Voluntary Product Accessibility Template) reports efficiently.</p>
      
      <h3>Key Concepts</h3>
      <ul>
        <li><strong>Audit Scope:</strong> Defines what you are testing (e.g., a website, application, or document).</li>
        <li><strong>WCAG 2.2:</strong> The Web Content Accessibility Guidelines version 2.2, which serves as the standard for testing.</li>
        <li><strong>Success Criteria:</strong> Specific rules that must be met for compliance (Level A, AA, AAA).</li>
      </ul>

      <h3>Starting an Audit</h3>
      <ol>
        <li>On the home page, enter your <strong>Product Name</strong> and <strong>Version</strong>.</li>
        <li>Select the <strong>Target Conformance Level</strong> (usually AA).</li>
        <li>Click <strong>"Start New Audit"</strong> to begin.</li>
      </ol>
      
      <p>Your progress is automatically saved to your browser's local storage, so you can close the tab and come back later.</p>
    `,
  },
  {
    id: 'conducting-audit',
    title: 'Conducting an Audit',
    icon: '📝',
    category: 'testing',
    content: `
      <h2>Testing Workflow</h2>
      <p>The audit interface guides you through each WCAG success criterion one by one.</p>

      <h3>For each criterion:</h3>
      <ol>
        <li><strong>Read the Requirement:</strong> Review the description and "How to Test" guidance.</li>
        <li><strong>Test Your Product:</strong> Check if your product meets the requirement.</li>
        <li><strong>Set Status:</strong>
          <ul>
            <li><strong>Supports:</strong> Fully meets the criterion.</li>
            <li><strong>Partially Supports:</strong> Meets some but not all aspects.</li>
            <li><strong>Does Not Support:</strong> Fails to meet the criterion.</li>
            <li><strong>Not Applicable:</strong> The content doesn't exist (e.g., no video, so captions aren't needed).</li>
          </ul>
        </li>
        <li><strong>Add Notes:</strong> Document your findings, specifically what passed or failed.</li>
      </ol>

      <h3>Navigation</h3>
      <p>Use the <strong>"Previous"</strong> and <strong>"Next"</strong> buttons to move between criteria. You can also use the sidebar to jump to specific sections.</p>
    `,
  },
  {
    id: 'evidence-screenshots',
    title: 'Managing Evidence',
    icon: '📸',
    category: 'testing',
    content: `
      <h2>Screenshots & Evidence</h2>
      <p>Documenting failures with visual evidence is crucial for developers to understand and fix issues.</p>

      <h3>Adding Screenshots</h3>
      <ol>
        <li>In the testing interface, look for the <strong>"Evidence"</strong> section.</li>
        <li>Click <strong>"Paste from Clipboard"</strong> (Ctrl+V) or <strong>"Upload Image"</strong>.</li>
        <li>Add a caption to explain what the screenshot demonstrates.</li>
      </ol>

      <p>Screenshots are stored locally in your browser. Note that including many high-resolution images may increase the size of your export file.</p>
    `,
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    icon: '👥',
    category: 'collaboration',
    content: `
      <h2>Working with Teams</h2>
      <p>VPAT Creator supports asynchronous collaboration through file sharing.</p>

      <h3>Sharing Work</h3>
      <ol>
        <li>Click the <strong>"Share"</strong> button in the top toolbar.</li>
        <li>Select criteria to assign to specific team members.</li>
        <li>Export a <strong>Assignment JSON</strong> file for each team member.</li>
      </ol>

      <h3>Merging Work</h3>
      <ol>
        <li>When team members finish their parts, they send their JSON files back.</li>
        <li>Click <strong>"Import & Merge"</strong> in the toolbar.</li>
        <li>Select a team member's file to merge it into your master audit.</li>
        <li>If there are conflicts (e.g., you both tested the same item), a dialog will let you choose which version to keep.</li>
      </ol>
    `,
  },
  {
    id: 'templates',
    title: 'Using Templates',
    icon: '📋',
    category: 'advanced',
    content: `
      <h2>Custom Templates</h2>
      <p>Customize the look and feel of your VPAT reports to match your organization's branding.</p>

      <h3>Managing Templates</h3>
      <ol>
        <li>Click the <strong>"📝 Templates"</strong> button in the top navigation.</li>
        <li>Browse the library to see available templates.</li>
        <li>Click <strong>"Use Template"</strong> to apply one to your current audit.</li>
      </ol>

      <h3>Creating Templates</h3>
      <p>You can customize:</p>
      <ul>
        <li><strong>Branding:</strong> Company name, report title.</li>
        <li><strong>Sections:</strong> Enable/disable sections like "Legal Disclaimer".</li>
        <li><strong>Styling:</strong> Colors, fonts, and table styles.</li>
        <li><strong>Columns:</strong> Choose which data columns to include in the report tables.</li>
      </ul>
    `,
  },
  {
    id: 'exporting',
    title: 'Exporting Reports',
    icon: '📤',
    category: 'advanced',
    content: `
      <h2>Generating Reports</h2>
      <p>Once your audit is complete, you can generate the final documents.</p>

      <h3>VPAT Report (PDF)</h3>
      <ol>
        <li>Click <strong>"Export PDF"</strong>.</li>
        <li>Review the preview.</li>
        <li>Click <strong>"Download"</strong> to get the official VPAT document.</li>
      </ol>

      <h3>Bug Report (HTML/CSV)</h3>
      <p>Useful for developers:</p>
      <ol>
        <li>Click <strong>"Bug Report"</strong>.</li>
        <li>This generates a list of all "Does Not Support" and "Partially Supports" items.</li>
        <li>Copy the list to your issue tracker (Jira, GitHub, etc.).</li>
      </ol>

      <h3>Backup (JSON)</h3>
      <p>Always keep a JSON backup of your work. Click <strong>"Backup JSON"</strong> to save the raw data file.</p>
    `,
  },
];
