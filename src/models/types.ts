// Core data models for VPAT Creator application

// ============================================================================
// WCAG TYPES
// ============================================================================

export type ConformanceLevel = 'A' | 'AA' | 'AAA';

export type ConformanceStatus = 
  | 'Supports' 
  | 'Partially Supports' 
  | 'Does Not Support' 
  | 'Not Applicable';

export type BarrierType = 
  | 'Hearing' 
  | 'Vision' 
  | 'Motor' 
  | 'Cognitive' 
  | 'Speech';

// ============================================================================
// FUNCTIONAL BARRIERS (508 Compliance)
// ============================================================================

export interface FunctionalBarrier {
  type: BarrierType;
  preventsUse: boolean;
  description: string;
}

// ============================================================================
// TESTING ENVIRONMENT
// ============================================================================

export interface Browser {
  name: string;
  version: string;
}

export interface AssistiveTechnology {
  name: string;
  version: string;
  type: 'Screen Reader' | 'Screen Magnifier' | 'Voice Control' | 'Other';
}

export interface OperatingSystem {
  name: string;
  version: string;
}

export interface Device {
  type: 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';
  name: string;
}

export interface TestEnvironment {
  browsers: Browser[];
  assistiveTech: AssistiveTechnology[];
  operatingSystems: OperatingSystem[];
  devices: Device[];
}

// ============================================================================
// TESTING METHOD
// ============================================================================

export interface TestingMethod {
  type: 'Manual' | 'Automated' | 'Hybrid';
  tools?: string[];
  description?: string;
}

// ============================================================================
// TEST RESULTS
// ============================================================================

export interface TestResult {
  id: string;
  successCriterionId: string; // e.g., "1.1.1"
  level: ConformanceLevel;
  conformance: ConformanceStatus;
  observations: string;
  barriers: FunctionalBarrier[];
  testingMethod: TestingMethod;
  customNotes: string;
  environmentOverride?: TestEnvironment;
  testedBy?: string;
  testedDate?: Date;
  screenshotIds?: string[]; // References to screenshots
}

// ============================================================================
// SCREENSHOTS
// ============================================================================

export interface Screenshot {
  id: string;
  componentId: string;
  testResultId?: string;
  filename: string;
  dataUrl: string; // Base64 encoded image
  caption?: string;
  annotations?: string;
  uploadedDate: Date;
}

// ============================================================================
// COMPONENT (Page or UI Component being tested)
// ============================================================================

export interface Component {
  id: string;
  name: string;
  type: 'page' | 'component';
  description?: string;
  url?: string;
  testDate: Date;
  version: string;
  results: TestResult[];
  screenshots: Screenshot[];
  completed: boolean;
  completedDate?: Date;
}

// ============================================================================
// VPAT CONFIGURATION
// ============================================================================

export interface CustomColumn {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface AdditionalPage {
  id: string;
  title: string;
  content: string;
  order: number;
  includeInExport: boolean;
}

export interface StyleGuide {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headingStyle?: 'bold' | 'normal';
  tableStyle?: 'bordered' | 'striped' | 'minimal';
  pageMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type VPATTone = 'formal' | 'friendly';

export interface VPATConfiguration {
  tone: VPATTone;
  customColumns: CustomColumn[];
  additionalPages: AdditionalPage[];
  styleGuide: StyleGuide;
  includeExecutiveSummary: boolean;
  includeRoadmap: boolean;
  productName?: string;
  productVersion?: string;
  companyName?: string;
  reportDate?: Date;
}

// ============================================================================
// WCAG CUSTOMIZATION
// ============================================================================

export interface CustomSuccessCriterion {
  id: string;
  num: string;
  handle: string;
  title: string;
  level: ConformanceLevel;
  content: string;
  isCustom: true;
}

export interface WCAGCustomization {
  baseVersion: '2.2';
  modified: boolean;
  disclaimer: string;
  modifiedDate?: Date;
  customSuccessCriteria?: CustomSuccessCriterion[];
  excludedCriteria?: string[]; // IDs of criteria to exclude
}

// ============================================================================
// PROJECT (Top-level container)
// ============================================================================

export type ProjectStatus = 'in-progress' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  modifiedAt: Date;
  testingEnvironment: TestEnvironment;
  vpatConfig: VPATConfiguration;
  wcagCustomization?: WCAGCustomization;
  components: Component[];
  status: ProjectStatus;
  completedDate?: Date;
  targetConformanceLevel: ConformanceLevel; // A, AA, or AAA
  testingMode: 'by-criterion' | 'by-component' | 'hybrid';
}

// ============================================================================
// WCAG DATA STRUCTURE (from wcag22.json)
// ============================================================================

export interface WCAGTechnique {
  id: string;
  technology: string;
  title: string;
  suffix?: string;
}

export interface WCAGSuccessCriterion {
  id: string;
  num: string;
  alt_id?: string[];
  handle: string;
  title: string;
  content: string;
  level: ConformanceLevel;
  versions: string[];
  details?: unknown[];
  techniques?: {
    sufficient?: unknown[];
    advisory?: unknown[];
    failure?: unknown[];
  };
}

export interface WCAGGuideline {
  id: string;
  num: string;
  alt_id?: string[];
  handle: string;
  title: string;
  content: string;
  versions: string[];
  successcriteria: WCAGSuccessCriterion[];
}

export interface WCAGPrinciple {
  id: string;
  num: string;
  handle: string;
  title: string;
  content: string;
  versions: string[];
  guidelines: WCAGGuideline[];
}

export interface WCAGData {
  principles: WCAGPrinciple[];
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

export interface ExportOptions {
  format: 'latex' | 'pdf' | 'csv' | 'excel' | 'html' | 'markdown';
  includeScreenshots: boolean;
  includeCustomPages: boolean;
  groupBy: 'criterion' | 'component' | 'level';
}

export interface BugReportItem {
  id: string;
  successCriterionId: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  componentName: string;
  screenshots: Screenshot[];
  codeSnippet?: string;
  recommendedFix?: string;
  wcagTechniques: string[];
  dateReported: Date;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface TestingProgress {
  totalCriteria: number;
  testedCriteria: number;
  totalComponents: number;
  completedComponents: number;
  currentStep: number;
  percentComplete: number;
}

export interface NavigationState {
  currentPage: string;
  previousPage?: string;
  hasUnsavedChanges: boolean;
}
