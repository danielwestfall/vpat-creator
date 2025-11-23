import React from 'react';
import { testingScheduleService } from '../../services/testing-schedule-service';
import { standardsMappingService } from '../../services/standards-mapping-service';
import { toast } from '../../store/toast-store';
import { Button, Input, Select, Checkbox } from '../common';
import { AuditScopeConfig, type AuditScope } from './AuditScopeConfig';
import { ComponentInfo } from './ComponentInfo';
import { ScreenshotManager } from './ScreenshotManager';
import { PDFExportDialog } from '../export/PDFExportDialog';
import { BugReportGenerator } from '../export/BugReportGenerator';
import { EmailDialog } from '../export/EmailDialog';
import { ComparisonDialog } from '../export/ComparisonDialog';
import { VersionHistoryDialog } from '../settings/VersionHistoryDialog';
import { BatchImportDialog } from '../export/BatchImportDialog';
import { ExternalImportDialog } from '../export/ExternalImportDialog';
import { 
  addScreenshot, 
  getScreenshotsByTestResult, 
  updateScreenshotCaption, 
  deleteScreenshot,
  saveTestResult,
  getAllTestResults,
  saveCurrentProject,
  getCurrentProject,
  clearCurrentAudit,
  bulkSaveTestResults
} from '../../services/database';
import { ComponentTestingView } from './ComponentTestingView';
import { TeamManagement } from '../settings/TeamManagement';
import { ShareDialog } from '../sharing/ShareDialog';
import { ConflictResolutionDialog } from '../merge/ConflictResolutionDialog';
import { mergeAudits, applyMergeResolutions, type MergeResult } from '../../services/merge-service';
import type { TestingScheduleItem, ComponentCategory } from '../../utils/testing-schedule-generator';
import type { ConformanceStatus, Screenshot, Project, Component, TestResult as DBTestResult, TeamMember } from '../../models/types';
import { getTeamMembers } from '../../services/database';
import { ShortcutSettings, DEFAULT_SHORTCUTS, type ShortcutConfig } from '../settings/ShortcutSettings';
import { AutomatedScanDialog } from './AutomatedScanDialog';
import { IssueTrackerSettings } from '../settings/IssueTrackerSettings';
import type { MappedResult } from '../../services/axe-service';
import { processImage } from '../../utils/image-processing';
import { csvExportService } from '../../services/csv-export-service';
import './TestingWorkflow.css';

// UI-level test result (used in component state)
interface UITestResult {
  scId: string;
  status: ConformanceStatus | 'Not Tested';
  notes: string;
  testedBy: string;
  testedDate: Date;
  techniquesUsed: string[];
  failuresFound: string[];
  customTechniques: Array<{ description: string }>;
  toolsUsed: string;
  screenshots: string[];
  needsRecheck?: boolean; // For marking completed audits that need re-verification
  customColumnValues?: Record<string, string>;
  assignedTo?: string;
}

// Helper functions to convert between UI and DB test results
const uiResultToDbResult = (uiResult: UITestResult, scLevel: string): DBTestResult => ({
  id: uiResult.scId,
  projectId: 'current-audit',
  successCriterionId: uiResult.scId,
  level: scLevel as 'A' | 'AA' | 'AAA',
  conformance: uiResult.status === 'Not Tested' ? 'Not Applicable' : uiResult.status,
  observations: uiResult.notes,
  barriers: [],
  testingMethod: {
    type: 'Manual',
    tools: uiResult.toolsUsed ? [uiResult.toolsUsed] : [],
  },
  customNotes: uiResult.notes,
  customColumnValues: uiResult.customColumnValues,
  testedBy: uiResult.testedBy,
  testedDate: uiResult.testedDate,
  screenshotIds: uiResult.screenshots,
  assignedTo: uiResult.assignedTo,
});

const dbResultToUiResult = (dbResult: DBTestResult): UITestResult => ({
  scId: dbResult.successCriterionId,
  status: dbResult.conformance as ConformanceStatus | 'Not Tested',
  notes: dbResult.customNotes || dbResult.observations,
  testedBy: dbResult.testedBy || 'User',
  testedDate: dbResult.testedDate || new Date(),
  techniquesUsed: [],
  failuresFound: [],
  customTechniques: [],
  toolsUsed: dbResult.testingMethod.tools?.join(', ') || '',
  screenshots: dbResult.screenshotIds || [],
  needsRecheck: false,
  customColumnValues: dbResult.customColumnValues,
  assignedTo: dbResult.assignedTo,
});

type ScheduleView = 'sc-based' | 'component-based';

import type { VPATTemplate } from '../../models/template-types';

// ... (keep existing imports)

interface TestingWorkflowProps {
  activeTemplate?: VPATTemplate;
}

export const TestingWorkflow: React.FC<TestingWorkflowProps> = ({ activeTemplate }) => {
  const [auditScope, setAuditScope] = React.useState<AuditScope | null>(null);
  const [schedule, setSchedule] = React.useState<TestingScheduleItem[]>([]);

  // Use template columns if available
  const templateColumns = React.useMemo(() => {
    if (!activeTemplate?.columns?.customColumns) return [];
    return activeTemplate.columns.customColumns
      .map(col => ({ id: col.id, label: col.name }));
  }, [activeTemplate]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [results, setResults] = React.useState<Map<string, UITestResult>>(new Map());
  const [notes, setNotes] = React.useState('');
  const [status, setStatus] = React.useState<ConformanceStatus | 'Not Tested'>('Not Tested');
  const [selectedTechniques, setSelectedTechniques] = React.useState<string[]>([]);
  const [selectedFailures, setSelectedFailures] = React.useState<string[]>([]);
  const [customTechniques, setCustomTechniques] = React.useState<Array<{ description: string; checked: boolean }>>([]);
  const [toolsUsed, setToolsUsed] = React.useState('');
  const [customColumnValues, setCustomColumnValues] = React.useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = React.useState(false);
  const [scheduleView, setScheduleView] = React.useState<ScheduleView>('sc-based');
  const [isCompletedAudit, setIsCompletedAudit] = React.useState(false);
  const [auditDate, setAuditDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedComponentType, setSelectedComponentType] = React.useState<string>('');
  const [showComponentInfo, setShowComponentInfo] = React.useState(false);

  // Phase 6: Screenshot Management
  const [screenshots, setScreenshots] = React.useState<Screenshot[]>([]);
  const [showPDFDialog, setShowPDFDialog] = React.useState(false);
  const [showBugDialog, setShowBugDialog] = React.useState(false);
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = React.useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = React.useState(false);
  const [showBatchImportDialog, setShowBatchImportDialog] = React.useState(false);
  const [showExternalImportDialog, setShowExternalImportDialog] = React.useState(false);

  // Store both schedules
  const [componentSchedule, setComponentSchedule] = React.useState<ComponentCategory[]>([]);
  const [scSchedule, setSCSchedule] = React.useState<TestingScheduleItem[]>([]);
  const [scLookup, setScLookup] = React.useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  // Collaboration
  const [showTeamManagement, setShowTeamManagement] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [assignedTo, setAssignedTo] = React.useState<string>('');
  const [filterAssignedToMe, setFilterAssignedToMe] = React.useState(false);
  const [filterUntestedOnly, setFilterUntestedOnly] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<string>(''); // ID of current user for filtering

  // Share
  const [showShareDialog, setShowShareDialog] = React.useState(false);

  // Merge
  const [showMergeDialog, setShowMergeDialog] = React.useState(false);
  const [mergeResult, setMergeResult] = React.useState<MergeResult | null>(null);

  // Keyboard Shortcuts
  const [showShortcutSettings, setShowShortcutSettings] = React.useState(false);
  const [shortcutConfig, setShortcutConfig] = React.useState<ShortcutConfig>(DEFAULT_SHORTCUTS);

  // Automated Scan
  const [showAutoScanDialog, setShowAutoScanDialog] = React.useState(false);

  // Issue Tracker
  const [showIssueTrackerSettings, setShowIssueTrackerSettings] = React.useState(false);

  // Enhanced Navigation (Phase 3)
  const [searchQuery, setSearchQuery] = React.useState('');
  const [groupBy, setGroupBy] = React.useState<'none' | 'status' | 'level'>('none');
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set(['A', 'AA', 'AAA', 'Not Tested', 'Supports', 'Partially Supports', 'Does Not Support', 'Not Applicable']));

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  // Load shortcut settings
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('vpat_shortcut_config');
    if (savedConfig) {
      try {
        setShortcutConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse shortcut config', e);
      }
    }
  }, []);

  const handleSaveShortcutConfig = (config: ShortcutConfig) => {
    setShortcutConfig(config);
    localStorage.setItem('vpat_shortcut_config', JSON.stringify(config));
    setShowShortcutSettings(false);
    toast.success('Shortcut settings saved');
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Ctrl+S/Cmd+S anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveResult();
        return;
      }

      // Help Shortcut (?) - Always active unless in input
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowShortcutSettings(true);
        return;
      }

      // If shortcuts are disabled, stop here (except save and help)
      if (!shortcutConfig.enabled) return;

      // Ignore other shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Navigation
      if (e.altKey) {
        if (e.key === shortcutConfig.next) {
          e.preventDefault();
          goToNext();
          return;
        }
        if (e.key === shortcutConfig.previous) {
          e.preventDefault();
          goToPrevious();
          return;
        }

        // Status Shortcuts
        switch (e.key.toLowerCase()) {
          case shortcutConfig.pass:
            e.preventDefault();
            setStatus('Supports');
            break;
          case shortcutConfig.fail:
            e.preventDefault();
            setStatus('Does Not Support');
            break;
          case shortcutConfig.na:
            e.preventDefault();
            setStatus('Not Applicable');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Re-bind on every render to capture latest state closures

  const loadTeamMembers = async () => {
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
      // Default current user to first member if exists, for testing
      if (members.length > 0 && !currentUser) {
        setCurrentUser(members[0].id);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const handleScopeConfirmed = React.useCallback(async (scope: AuditScope, saveToDb = true) => {
    setAuditScope(scope);
    
    // Save scope to localStorage for easy recovery
    localStorage.setItem('vpat_current_scope', JSON.stringify(scope));
    
    // Generate both schedules based on selected levels
    const scSched = testingScheduleService.generateSCSchedule({
      levels: scope.conformanceLevels,
      includeAdvisory: false, // Focus on sufficient techniques for testing
      includeFailures: true,
    });
    setSCSchedule(scSched);
    setSchedule(scSched); // Start with SC-based view
    
    // Create SC Lookup Map (Number -> ID)
    const lookup = new Map<string, string>();
    scSched.forEach(item => {
      lookup.set(item.scNumber, item.id);
    });
    setScLookup(lookup);
    
    // Generate component schedule
    const componentSched = testingScheduleService.generateComponentSchedule({
      levels: scope.conformanceLevels,
      includeAdvisory: false,
      includeFailures: true,
    });
    setComponentSchedule(componentSched);

    if (saveToDb) {
      // Create a project entry in DB to represent this audit
      // We need to pass the scope to prepareProjectData, but it's defined outside
      // Let's move prepareProjectData logic here or pass it
      // For now, we can just use the scope object we have since prepareProjectData relies on state that might not be set yet
      const project: Project = {
        id: 'current-audit',
        name: scope.pageTitle,
        description: scope.pageUrl || '',
        targetConformanceLevel: scope.conformanceLevels[0] || 'AA',
        status: 'in-progress',
        createdAt: new Date(),
        modifiedAt: new Date(),
        testingEnvironment: {
          browsers: [{ name: 'Chrome', version: 'Latest' }],
          assistiveTech: [{ name: 'NVDA', version: 'Latest', type: 'Screen Reader' }],
          operatingSystems: [{ name: 'Windows', version: '11' }],
          devices: [{ type: 'Desktop', name: 'PC' }]
        },
        vpatConfig: {
          tone: 'formal',
          customColumns: (scope.customColumns || []).map((col, index) => ({
            id: `col-${index}`,
            name: col,
            description: '',
            order: index
          })),
          additionalPages: [],
          styleGuide: {},
          includeExecutiveSummary: true,
          includeRoadmap: false,
          productName: scope.pageTitle,
          productVersion: '1.0',
          reportDate: new Date(),
        },
        components: [],
        testingMode: 'by-criterion',
      };
      
      await saveCurrentProject(project);
    }
  }, []);

  const loadSavedState = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. Try to load saved project/scope
      const savedProject = await getCurrentProject();
      
      if (savedProject) {
        // Let's check localStorage for the exact scope config to be safe
        const storedScope = localStorage.getItem('vpat_current_scope');
        if (storedScope) {
           const parsedScope = JSON.parse(storedScope);
           handleScopeConfirmed(parsedScope, false); // false = don't save again, just load
        }
        
        // 2. Load saved test results
        const savedResults = await getAllTestResults();
        if (savedResults.length > 0) {
          const resultsMap = new Map<string, UITestResult>();
          savedResults.forEach(r => {
            // Convert DB result to UI result
            resultsMap.set(r.successCriterionId, dbResultToUiResult(r));
          });
          setResults(resultsMap);
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleScopeConfirmed]);

  // Load saved state on mount
  React.useEffect(() => {
    loadSavedState();
    loadTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearAudit = async () => {
    if (window.confirm('Are you sure you want to clear the current audit? This will delete all progress and cannot be undone.')) {
      await clearCurrentAudit();
      localStorage.removeItem('vpat_current_scope');
      setAuditScope(null);
      setResults(new Map());
      setSchedule([]);
      setCurrentIndex(0);
    }
  };
  


  const currentSC = schedule[currentIndex];
  const progress = schedule.length > 0 ? Math.round((results.size / schedule.length) * 100) : 0;
  const testedCount = results.size;
  const totalCount = schedule.length;

  const handleRecheckItem = () => {
    if (!currentSC) return;
    
    const existing = results.get(currentSC.id);
    if (existing) {
      // Clear recheck flag when item is reviewed
      setResults(new Map(results.set(currentSC.id, { ...existing, needsRecheck: false })));
    }
  };

  const handleUpdateAuditDate = () => {
    // Update all test dates to the new audit date
    const updatedResults = new Map<string, UITestResult>();
    const newDate = new Date(auditDate);
    
    results.forEach((result, key) => {
      updatedResults.set(key, {
        ...result,
        testedDate: newDate,
        needsRecheck: false, // Clear recheck flags when date is updated
      });
    });
    
    setResults(updatedResults);
    setIsCompletedAudit(false);
    alert('✅ Audit date updated for all criteria!');
  };

  const toggleScheduleView = () => {
    if (scheduleView === 'sc-based') {
      // Switch to component-based view
      setScheduleView('component-based');
    } else {
      setScheduleView('sc-based');
      setSchedule(scSchedule);
    }
  };

  const handleMarkRemainingNA = async () => {
    if (!window.confirm('Mark all remaining untested items as "Not Applicable"?')) return;
    
    const newResults = new Map(results);
    const resultsToSave: DBTestResult[] = [];
    let count = 0;
    
    schedule.forEach(sc => {
      if (!newResults.has(sc.id) || newResults.get(sc.id)?.status === 'Not Tested') {
        const newResult: UITestResult = {
          scId: sc.id,
          status: 'Not Applicable',
          notes: 'Marked as N/A via Quick Action',
          testedBy: 'User',
          testedDate: new Date(),
          techniquesUsed: [],
          failuresFound: [],
          customTechniques: [],
          toolsUsed: '',
          screenshots: [],
          needsRecheck: false,
          customColumnValues: {},
          assignedTo: assignedTo || undefined
        };
        
        newResults.set(sc.id, newResult);
        resultsToSave.push(uiResultToDbResult(newResult, sc.scLevel));
        count++;
      }
    });
    
    if (count > 0) {
      setResults(newResults);
      await bulkSaveTestResults(resultsToSave);
      toast.success(`Marked ${count} items as Not Applicable`);
      
      // If current item was updated, reload it
      if (currentSC && resultsToSave.some(r => r.id === currentSC.id)) {
        loadExistingResult(currentSC);
      }
    } else {
      toast.info('No untested items found');
    }
  };

  const handleMarkRemainingSupports = async () => {
    if (!window.confirm('Mark all remaining untested items as "Supports"?')) return;
    
    const newResults = new Map(results);
    const resultsToSave: DBTestResult[] = [];
    let count = 0;
    
    schedule.forEach(sc => {
      if (!newResults.has(sc.id) || newResults.get(sc.id)?.status === 'Not Tested') {
        const newResult: UITestResult = {
          scId: sc.id,
          status: 'Supports',
          notes: 'Marked as Supports via Quick Action',
          testedBy: 'User',
          testedDate: new Date(),
          techniquesUsed: [],
          failuresFound: [],
          customTechniques: [],
          toolsUsed: '',
          screenshots: [],
          needsRecheck: false,
          customColumnValues: {},
          assignedTo: assignedTo || undefined
        };
        
        newResults.set(sc.id, newResult);
        resultsToSave.push(uiResultToDbResult(newResult, sc.scLevel));
        count++;
      }
    });
    
    if (count > 0) {
      setResults(newResults);
      await bulkSaveTestResults(resultsToSave);
      toast.success(`Marked ${count} items as Supports`);
      
      // If current item was updated, reload it
      if (currentSC && resultsToSave.some(r => r.id === currentSC.id)) {
        loadExistingResult(currentSC);
      }
    } else {
      toast.info('No untested items found');
    }
  };

  const handleComponentResultUpdate = (scId: string, status: ConformanceStatus, notes: string) => {
    const existing = results.get(scId);
    
    const newResult: UITestResult = {
      scId,
      status,
      notes,
      testedBy: existing?.testedBy || 'User',
      testedDate: new Date(),
      techniquesUsed: existing?.techniquesUsed || [],
      failuresFound: existing?.failuresFound || [],
      customTechniques: existing?.customTechniques || [],
      toolsUsed: existing?.toolsUsed || '',
      screenshots: existing?.screenshots || [],
      needsRecheck: false,
      customColumnValues: existing?.customColumnValues || {},
      assignedTo: existing?.assignedTo,
    };

    setResults(new Map(results.set(scId, newResult)));
    
    // Auto-save individual result - convert to DB format
    const sc = schedule.find(s => s.id === scId);
    if (sc) {
      const dbResult = uiResultToDbResult(newResult, sc.scLevel);
      saveTestResult(dbResult).catch(err => console.error('Failed to auto-save result:', err));
    }
  };

  const handleSaveResult = () => {
    if (!currentSC) return;

    const result: UITestResult = {
      scId: currentSC.id,
      status,
      notes,
      testedBy: 'User', // TODO: Get from user profile
      testedDate: new Date(),
      techniquesUsed: selectedTechniques,
      failuresFound: selectedFailures,
      customTechniques: customTechniques.filter(t => t.checked).map(t => ({ description: t.description })),
      toolsUsed,
      screenshots: [], // TODO: Add screenshot upload
      needsRecheck: false,
      customColumnValues,
      assignedTo,
    };

    setResults(new Map(results.set(currentSC.id, result)));

    // Auto-save result - convert to DB format
    const dbResult = uiResultToDbResult(result, currentSC.scLevel);
    saveTestResult(dbResult).catch(err => console.error('Failed to auto-save result:', err));

    // Move to next untested item
    goToNextUntested();

    // Clear form
    setNotes('');
    setStatus('Not Tested');
    setSelectedTechniques([]);
    setSelectedFailures([]);
    setCustomTechniques([]);
    setToolsUsed('');
    setCustomColumnValues({});
  };

  const goToNextUntested = () => {
    // Find next untested item
    for (let i = currentIndex + 1; i < schedule.length; i++) {
      if (!results.has(schedule[i].id)) {
        setCurrentIndex(i);
        return;
      }
    }
    // If no untested items after current, find first untested from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!results.has(schedule[i].id)) {
        setCurrentIndex(i);
        return;
      }
    }
    // All tested, show summary
    setShowSummary(true);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      loadExistingResult(schedule[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < schedule.length - 1) {
      setCurrentIndex(currentIndex + 1);
      loadExistingResult(schedule[currentIndex + 1]);
    }
  };

  const loadExistingResult = (sc: TestingScheduleItem) => {
    const existing = results.get(sc.id);
    if (existing) {
      setStatus(existing.status);
      setNotes(existing.notes);
      setSelectedTechniques(existing.techniquesUsed);
      setSelectedFailures(existing.failuresFound);
      setCustomTechniques(existing.customTechniques.map(t => ({ description: t.description, checked: true })));
      setToolsUsed(existing.toolsUsed);
      setCustomColumnValues(existing.customColumnValues || {});
      setAssignedTo(existing.assignedTo || '');
    } else {
      setStatus('Not Tested');
      setNotes('');
      setSelectedTechniques([]);
      setSelectedFailures([]);
      setCustomTechniques([]);
      setToolsUsed('');
      setCustomColumnValues({});
      setAssignedTo('');
    }
  };

  const jumpToSC = (index: number) => {
    setCurrentIndex(index);
    loadExistingResult(schedule[index]);
    setShowSummary(false);
  };

  const toggleTechnique = (techniqueId: string) => {
    if (selectedTechniques.includes(techniqueId)) {
      setSelectedTechniques(selectedTechniques.filter((id) => id !== techniqueId));
    } else {
      setSelectedTechniques([...selectedTechniques, techniqueId]);
    }
  };

  const toggleFailure = (failureId: string) => {
    setSelectedFailures((prev) =>
      prev.includes(failureId)
        ? prev.filter((id) => id !== failureId)
        : [...prev, failureId]
    );
  };

  const addCustomTechnique = () => {
    setCustomTechniques((prev) => [...prev, { description: '', checked: false }]);
  };

  const updateCustomTechnique = (index: number, description: string) => {
    setCustomTechniques((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    );
  };

  const toggleCustomTechnique = (index: number) => {
    setCustomTechniques((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const removeCustomTechnique = (index: number) => {
    setCustomTechniques((prev) => prev.filter((_, i) => i !== index));
  };

  // Phase 6: Screenshot Handlers
  const handleAddScreenshot = React.useCallback(async (screenshot: Omit<Screenshot, 'id'>) => {
    const newScreenshot: Screenshot = {
      ...screenshot,
      id: crypto.randomUUID(),
    };
    await addScreenshot(newScreenshot);
    const updated = await getScreenshotsByTestResult(currentSC.id);
    setScreenshots(updated);
  }, [currentSC]);

  const handleDeleteScreenshot = async (id: string) => {
    await deleteScreenshot(id);
    const updated = await getScreenshotsByTestResult(currentSC.id);
    setScreenshots(updated);
  };

  const handleUpdateCaption = async (id: string, caption: string) => {
    await updateScreenshotCaption(id, caption);
    const updated = await getScreenshotsByTestResult(currentSC.id);
    setScreenshots(updated);
  };

  // Handle paste events for screenshots
  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if we are in the testing view (not component view)
      if (scheduleView !== 'sc-based' || !currentSC) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const processed = await processImage(file);
              await handleAddScreenshot({
                testResultId: currentSC.id,
                componentId: auditScope!.pageTitle,
                filename: `pasted-image-${Date.now()}.png`,
                dataUrl: processed.base64Data,
                caption: '',
                uploadedDate: new Date(),
              });
              toast.success('Screenshot pasted successfully');
            } catch (error) {
              console.error('Failed to process pasted image:', error);
              toast.error('Failed to paste image');
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentSC, scheduleView, auditScope, handleAddScreenshot]);

  // Phase 6: Data Conversion Helpers
  const prepareProjectData = (scope: AuditScope = auditScope!): Project => ({
    id: 'current-audit', // Use fixed ID for active session
    name: scope.pageTitle,
    description: scope.pageUrl || '',
    targetConformanceLevel: scope.conformanceLevels[0] || 'AA',
    status: 'in-progress',
    createdAt: new Date(),
    modifiedAt: new Date(),
    testingEnvironment: {
      browsers: [{ name: 'Chrome', version: 'Latest' }],
      assistiveTech: [{ name: 'NVDA', version: 'Latest', type: 'Screen Reader' }],
      operatingSystems: [{ name: 'Windows', version: '11' }],
      devices: [{ type: 'Desktop', name: 'PC' }]
    },
    vpatConfig: {
      tone: 'formal',
      customColumns: (scope.customColumns || []).map((col, index) => ({
        id: `col-${index}`,
        name: col,
        description: '',
        order: index
      })),
      additionalPages: [],
      styleGuide: {},
      includeExecutiveSummary: true,
      includeRoadmap: false,
      productName: scope.pageTitle,
      productVersion: '1.0',
      reportDate: new Date(),
    },
    components: [],
    testingMode: 'by-criterion',
  });

  const prepareComponentData = (): Component => ({
    id: crypto.randomUUID(),
    name: auditScope!.pageTitle,
    type: 'component',
    description: auditScope!.pageUrl || '',
    testDate: new Date(),
    version: '1.0',
    results: convertToTestResults(),
    screenshots: [],
    completed: results.size === schedule.length,
  });

  const convertToTestResults = (): DBTestResult[] => {
    const testResults: DBTestResult[] = [];
    
    results.forEach((result, scId) => {
      const sc = schedule.find(s => s.id === scId);
      if (!sc) return;
      
      testResults.push({
        id: scId,
        successCriterionId: scId,
        level: sc.scLevel as 'A' | 'AA' | 'AAA',
        conformance: result.status === 'Not Tested' ? 'Not Applicable' : result.status,
        observations: result.notes,
        barriers: [],
        testingMethod: {
          type: 'Manual',
          tools: result.toolsUsed ? [result.toolsUsed] : [],
        },
        customNotes: result.notes,
        customColumnValues: result.customColumnValues,
      });
    });
    
    return testResults;
  };

  const getAllScreenshots = (): Screenshot[] => {
    // For now, return current screenshots
    // TODO: Aggregate all screenshots from all test results
    return screenshots;
  };

  const getFailureCount = (): number => {
    return Array.from(results.values()).filter(r => 
      r.status === 'Does Not Support' || r.status === 'Partially Supports'
    ).length;
  };

  const exportResults = () => {
    if (!auditScope) return;
    // Prepare WCAG results for mapping
    const wcagResultsMap = new Map(
      Array.from(results.entries()).map(([id, result]) => {
        const sc = schedule.find((s) => s.id === id);
        return [id, { status: result.status, scNumber: sc?.scNumber || '' }];
      })
    );

    // Generate mapped standards results
    let en301549Results = null;
    let section508Results = null;

    if (auditScope.includeEN301549) {
      en301549Results = Array.from(
        standardsMappingService.mapWCAGToEN301549(wcagResultsMap, auditScope.wcagVersion).entries()
      ).map(([sectionNumber, data]) => ({
        sectionNumber,
        status: data.status,
        mappedFromWCAG: data.mappedFrom,
      }));
    }

    if (auditScope.includeSection508) {
      section508Results = Array.from(
        standardsMappingService.mapWCAGToSection508(wcagResultsMap).entries()
      ).map(([sectionNumber, data]) => ({
        sectionNumber,
        status: data.status,
        mappedFromWCAG: data.mappedFrom,
        requiresAdditionalTesting: data.requiresAdditionalTesting,
      }));
    }

    const exportData = {
      auditScope: {
        pageTitle: auditScope.pageTitle,
        pageUrl: auditScope.pageUrl,
        wcagVersion: auditScope.wcagVersion,
        conformanceLevels: auditScope.conformanceLevels,
        includeEN301549: auditScope.includeEN301549,
        includeSection508: auditScope.includeSection508,
        testingTools: auditScope.testingTools,
        evaluationMethods: auditScope.evaluationMethods,
      },
      testDate: new Date().toISOString(),
      totalCriteria: schedule.length,
      tested: results.size,
      wcagResults: Array.from(results.entries()).map(([id, result]) => {
        const sc = schedule.find((s) => s.id === id);
        return {
          scNumber: sc?.scNumber,
          scTitle: sc?.scTitle,
          scLevel: sc?.scLevel,
          status: result.status,
          notes: result.notes,
          techniquesUsed: result.techniquesUsed,
          failuresFound: result.failuresFound,
          customTechniques: result.customTechniques,
          toolsUsed: result.toolsUsed,
          testedBy: result.testedBy,
          testedDate: result.testedDate,
        };
      }),
      en301549Results,
      section508Results,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create filename from page title (sanitize for filesystem)
    const sanitizedTitle = auditScope.pageTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `vpat-${sanitizedTitle}-${dateStr}.json`;
    
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    const message = results.size === schedule.length 
      ? `✅ Complete audit saved! All ${schedule.length} criteria tested.`
      : `💾 Progress saved! ${results.size} of ${schedule.length} criteria tested. You can resume later by importing this file.`;
    
    alert(message);
  };

  const handleExportCSV = () => {
    if (!auditScope) return;
    const csv = csvExportService.generateCSV(convertToTestResults(), schedule);
    const sanitizedTitle = auditScope.pageTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    csvExportService.downloadCSV(csv, `vpat-${sanitizedTitle}-${dateStr}.csv`);
    toast.success('CSV export downloaded');
  };

  const handleImportResults = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data structure
        if (!importedData.auditScope || !importedData.wcagResults) {
          alert('❌ Invalid file format. Please select a valid VPAT test results file.');
          return;
        }

        // Restore audit scope and regenerate schedule
        handleScopeConfirmed(importedData.auditScope);

        // Check if this is a completed audit (all criteria tested)
        const totalCriteria = importedData.wcagResults.length;
        const testedCriteria = importedData.wcagResults.filter(
          (r: { status: string }) => r.status !== 'Not Tested'
        ).length;
        const isComplete = testedCriteria === totalCriteria && totalCriteria > 0;

        // Restore test results
        const restoredResults = new Map<string, UITestResult>();
        importedData.wcagResults.forEach((result: { scNumber: string; status: ConformanceStatus | 'Not Tested'; notes: string; testedBy: string; testedDate: string; techniquesUsed: string[]; failuresFound: string[]; customTechniques: Array<{ description: string }>; toolsUsed: string; screenshots: string[]; customColumnValues?: Record<string, string> }) => {
          const scId = schedule.find(s => s.scNumber === result.scNumber)?.id;
          if (scId) {
            restoredResults.set(scId, {
              scId,
              status: result.status,
              notes: result.notes,
              testedBy: result.testedBy,
              testedDate: new Date(result.testedDate),
              techniquesUsed: result.techniquesUsed || [],
              failuresFound: result.failuresFound || [],
              customTechniques: result.customTechniques || [],
              toolsUsed: result.toolsUsed || '',
              screenshots: result.screenshots || [],
              needsRecheck: isComplete, // Mark all for recheck if completed audit
              customColumnValues: result.customColumnValues || {},
            });
          }
        });

        setResults(restoredResults);
        setIsCompletedAudit(isComplete);

        // If completed, show date update option
        if (isComplete) {
          const oldDate = new Date(importedData.wcagResults[0]?.testedDate || new Date());
          setAuditDate(oldDate.toISOString().split('T')[0]);
        }

        // Find first untested item or go to beginning
        const firstUntestedIndex = schedule.findIndex(sc => !restoredResults.has(sc.id));
        setCurrentIndex(firstUntestedIndex >= 0 ? firstUntestedIndex : 0);

        const message = isComplete
          ? `✅ Loaded completed audit (${testedCriteria} criteria). You can update the date or recheck individual items.`
          : `✅ Imported ${restoredResults.size} test results. Ready to continue!`;
        alert(message);
      } catch (error) {
        alert('❌ Error reading file. Please ensure it\'s a valid JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  //Merge handler for importing and merging results
  const handleMergeResults = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data structure
        if (!importedData.auditScope || !importedData.wcagResults) {
          alert('❌ Invalid file format. Please select a valid VPAT test results file.');
          return;
        }

        // Convert current results to TestResult format for merge
        const currentResults: DBTestResult[] = convertToTestResults();
        
        // Convert imported results to TestResult format
        const incomingResults: DBTestResult[] = [];
        importedData.wcagResults.forEach((result: { scNumber: string; status: string; notes: string; toolsUsed?: string; customColumnValues?: Record<string, string>; testedBy?: string; testedDate: string; screenshots?: string[]; assignedTo?: string }) => {
          const sc = schedule.find(s => s.scNumber === result.scNumber);
          if (sc) {
            incomingResults.push({
              id: sc.id,
              successCriterionId: sc.id,
              level: sc.scLevel as 'A' | 'AA' | 'AAA',
              conformance: result.status === 'Not Tested' ? 'Not Applicable' : (result.status as ConformanceStatus),
              observations: result.notes,
              barriers: [],
              testingMethod: {
                type: 'Manual',
                tools: result.toolsUsed ? [result.toolsUsed] : [],
              },
              customNotes: result.notes,
              customColumnValues: result.customColumnValues,
              testedBy: result.testedBy,
              testedDate: new Date(result.testedDate),
              screenshotIds: result.screenshots || [],
              assignedTo: result.assignedTo,
            });
          }
        });

        // Get team members (or empty arrays if not available)
        const currentTeamMembers = teamMembers || [];
        const incomingTeamMembers: TeamMember[] = importedData.teamMembers || [];

        // Perform merge
        const currentProject = prepareProjectData();
        const incomingProject = {
          ...currentProject,
          name: importedData.auditScope.pageTitle,
          description: importedData.auditScope.pageUrl || '',
        };

        const merge = mergeAudits(
          currentProject,
          currentResults,
          currentTeamMembers,
          incomingProject,
          incomingResults,
          incomingTeamMembers
        );

        // Update team members immediately
        setTeamMembers(merge.mergedTeamMembers);

        if (merge.conflicts.length > 0) {
          // Show conflict resolution dialog
          setMergeResult(merge);
          setShowMergeDialog(true);
        } else {
          // No conflicts - apply merge immediately
          applyMerge(merge, new Map());
        }
      } catch (error) {
        alert('❌ Error reading file. Please ensure it\'s a valid JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const applyMerge = (merge: MergeResult, resolutions: Map<string, 'local' | 'incoming'>) => {
    // Apply resolved merges
    const finalResults = applyMergeResolutions(merge, resolutions);
    
    // Convert final results to UI format
    const mergedUIResults = new Map<string, UITestResult>();
    finalResults.forEach(result => {
      mergedUIResults.set(result.successCriterionId, dbResultToUiResult(result));
    });
    
    setResults(mergedUIResults);
    setShowMergeDialog(false);
    setMergeResult(null);

    // Show success message
    const message = merge.conflicts.length > 0
      ? `✅ Merge complete! Resolved ${merge.conflicts.length} conflicts. ${merge.summary.autoMerged} tests auto-merged, ${merge.summary.new} new tests added.`
      : `✅ Merge complete! ${merge.summary.autoMerged} tests auto-merged, ${merge.summary.new} new tests added.`;
    
    alert(message);
  };

  const handleApplyAutoScanResults = (mappedResults: MappedResult[]) => {
    const newResults = new Map(results);


    mappedResults.forEach((result) => {
      // Find the SC ID for this SC Number
      const scId = scLookup.get(result.scNumber);
      if (!scId) return;

      // Get existing result or create new one
      const existing = newResults.get(scId);
      const currentNotes = existing?.notes || '';
      
      // Append automated finding to notes
      const newNotes = currentNotes 
        ? `${currentNotes}\n\n[Automated Scan]: ${result.reason}`
        : `[Automated Scan]: ${result.reason}`;

      // Update result
      newResults.set(scId, {
        scId,
        status: result.status, // 'Does Not Support'
        notes: newNotes,
        testedBy: 'Automated Scan',
        testedDate: new Date(),
        techniquesUsed: existing?.techniquesUsed || [],
        failuresFound: existing?.failuresFound || [],
        customTechniques: existing?.customTechniques || [],
        toolsUsed: 'axe-core',
        screenshots: existing?.screenshots || [],
        needsRecheck: true, // Flag for manual review
        customColumnValues: existing?.customColumnValues || {},
        assignedTo: existing?.assignedTo,
      });
      

    });

    setResults(newResults);
    
    // If we updated the current SC, refresh the form
    if (currentSC && newResults.has(currentSC.id)) {
      loadExistingResult(currentSC);
    }
  };

  const handleBatchImport = async (importedResults: DBTestResult[]) => {
    const newResults = new Map(results);
    let importCount = 0;
    
    importedResults.forEach(dbResult => {
      // We need to ensure the result corresponds to a valid SC in our schedule
      // The import service tries to match by ID, but let's double check
      if (schedule.some(s => s.id === dbResult.successCriterionId)) {
         newResults.set(dbResult.successCriterionId, dbResultToUiResult(dbResult));
         importCount++;
      }
    });

    if (importCount > 0) {
      setResults(newResults);
      
      // Save to DB
      await bulkSaveTestResults(importedResults);
      
      toast.success(`Successfully imported ${importCount} results`);
      
      // Refresh current view if needed
      if (currentSC && newResults.has(currentSC.id)) {
        loadExistingResult(currentSC);
      }
    } else {
      toast.info('No matching criteria found in import');
    }
  };

  const handleExternalImport = (mappedResults: MappedResult[]) => {
    const newResults = new Map(results);
    let importCount = 0;

    mappedResults.forEach((result) => {
      // Find the SC ID for this SC Number
      const scId = scLookup.get(result.scNumber);
      if (!scId) return;

      // Get existing result or create new one
      const existing = newResults.get(scId);
      const currentNotes = existing?.notes || '';
      
      // Append automated finding to notes
      const newNotes = currentNotes 
        ? `${currentNotes}\n\n[External Tool]: ${result.reason}`
        : `[External Tool]: ${result.reason}`;

      // Update result
      newResults.set(scId, {
        scId,
        status: result.status, // 'Does Not Support'
        notes: newNotes,
        testedBy: 'External Tool',
        testedDate: new Date(),
        techniquesUsed: existing?.techniquesUsed || [],
        failuresFound: existing?.failuresFound || [],
        customTechniques: existing?.customTechniques || [],
        toolsUsed: 'axe-core',
        screenshots: existing?.screenshots || [],
        needsRecheck: true, // Flag for manual review
        customColumnValues: existing?.customColumnValues || {},
        assignedTo: existing?.assignedTo,
      });
      importCount++;
    });

    if (importCount > 0) {
      setResults(newResults);
      
      // Auto-save imported results
      const resultsToSave: DBTestResult[] = [];
      newResults.forEach((uiResult, scId) => {
        const sc = schedule.find(s => s.id === scId);
        if (sc) {
          resultsToSave.push(uiResultToDbResult(uiResult, sc.scLevel));
        }
      });
      bulkSaveTestResults(resultsToSave);

      toast.success(`Imported ${importCount} issues from external tool`);
      
      // If current item was updated, reload it
      if (currentSC && newResults.has(currentSC.id)) {
        loadExistingResult(currentSC);
      }
    } else {
      toast.info('No matching criteria found in import');
    }
  };

  // Show scope config if not set yet
  if (!auditScope) {
    if (isLoading) {
      return <div className="workflow-loading">Loading saved audit...</div>;
    }
    return <AuditScopeConfig onScopeConfirmed={handleScopeConfirmed} />;
  }

  if (schedule.length === 0) {
    return (
      <div className="workflow-loading">
        <p>Loading testing workflow...</p>
      </div>
    );
  }

  if (showSummary) {
    const conformsCount = Array.from(results.values()).filter(
      (r) => r.status === 'Supports'
    ).length;
    const failsCount = Array.from(results.values()).filter(
      (r) => r.status === 'Does Not Support' || r.status === 'Partially Supports'
    ).length;

    return (
      <div className="workflow-container">
        <header className="workflow-header">
          <h1>Testing Complete! 🎉</h1>
          <p>
            Audit of <strong>{auditScope.pageTitle}</strong> - WCAG {auditScope.wcagVersion} Level {auditScope.conformanceLevels.join(', ')}
            {auditScope.includeEN301549 && ' + EN 301 549'}
            {auditScope.includeSection508 && ' + Section 508'}
          </p>
        </header>

        <div className="workflow-summary">
          <div className="summary-stats">
            <div className="stat-card stat-success">
              <div className="stat-value">{conformsCount}</div>
              <div className="stat-label">Passing</div>
            </div>
            <div className="stat-card stat-error">
              <div className="stat-value">{failsCount}</div>
              <div className="stat-label">Issues Found</div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total Tested</div>
            </div>
          </div>

          <div className="summary-actions">
            <Button onClick={exportResults} variant="primary" size="lg">
              Export Results
            </Button>
            <Button onClick={() => setShowSummary(false)} variant="secondary" size="lg">
              Review Tests
            </Button>
          </div>

          <div className="summary-list">
            <h3>Test Results by Success Criteria</h3>
            <div className="results-grid">
              {schedule.map((sc, index) => {
                const result = results.get(sc.id);
                return (
                  <button
                    key={sc.id}
                    className={`result-item result-${result?.status.replace(/\s+/g, '-').toLowerCase() || 'not-tested'}`}
                    onClick={() => jumpToSC(index)}
                    type="button"
                  >
                    <div className="result-number">{sc.scNumber}</div>
                    <div className="result-title">{sc.scTitle}</div>
                    <div className="result-status">
                      {result?.status === 'Supports' && '✓ Supports'}
                      {result?.status === 'Partially Supports' && '⚠ Partially Supports'}
                      {result?.status === 'Does Not Support' && '✗ Does Not Support'}
                      {result?.status === 'Not Applicable' && '— Not Applicable'}
                      {result?.status === 'Not Tested' && '○ Not Tested'}
                      {!result && '○ Not Tested'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-container">
      <header className="workflow-header">
        <div className="workflow-progress">
          <div className="audit-info">
            <h1>{auditScope.pageTitle}</h1>
            <div className="audit-meta">
              {auditScope.pageUrl && <span>🔗 {auditScope.pageUrl}</span>}
              <span>📋 WCAG {auditScope.wcagVersion} Level {auditScope.conformanceLevels.join(', ')}</span>
              {auditScope.includeEN301549 && <span>🇪🇺 EN 301 549</span>}
              {auditScope.includeSection508 && <span>🇺🇸 Section 508</span>}
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">
            {testedCount} of {totalCount} tested ({progress}%)
          </div>
        </div>
      </header>

      {isCompletedAudit && (
        <div className="completed-audit-banner">
          <div className="banner-content">
            <span>📅 This is a completed audit. Update the date below or recheck individual items.</span>
            <div className="date-update">
              <Input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                label="Audit Date"
              />
              <Button onClick={handleUpdateAuditDate} variant="primary" size="sm">
                Update All Dates
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="workflow-navigation">
        <div className="nav-actions">
          <Button 
            onClick={() => setShowAutoScanDialog(true)} 
            variant="primary" 
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            🤖 Auto Scan
          </Button>
          <select 
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            onChange={(e) => {
              if (e.target.value === 'na') handleMarkRemainingNA();
              if (e.target.value === 'supports') handleMarkRemainingSupports();
              e.target.value = ''; // Reset
            }}
            defaultValue=""
            title="Perform bulk actions on remaining items"
          >
            <option value="" disabled>⚡ Quick Actions</option>
            <option value="na">Mark Remaining N/A</option>
            <option value="supports">Mark Remaining Supports</option>
          </select>
          <Button 
            onClick={() => document.getElementById('import-results')?.click()} 
            variant="secondary" 
            size="sm"
          >
            📂 Resume Audit
          </Button>
          <input
            id="import-results"
            type="file"
            accept=".json"
            onChange={handleImportResults}
            style={{ display: 'none' }}
          />
          <Button 
            onClick={toggleScheduleView} 
            variant="secondary" 
            size="sm"
            title="Switch between SC-based and Component-based views"
          >
            {scheduleView === 'sc-based' ? '🔄 Component View' : '🔄 SC View'}
          </Button>
          <Button 
            onClick={handleClearAudit} 
            variant="secondary" 
            size="sm"
            className="text-red-600 hover:bg-red-50"
            title="Clear all data and start over"
          >
            🗑️ Clear Audit
          </Button>
        </div>
        <div className="nav-controls">
          <Button onClick={goToPrevious} disabled={currentIndex === 0} size="sm">
            ← Previous
          </Button>
          <div className="nav-indicator">
            {currentIndex + 1} / {totalCount}
          </div>
          <Button onClick={goToNext} disabled={currentIndex === schedule.length - 1} size="sm">
            Next →
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button onClick={() => setShowPDFDialog(true)} variant="primary" size="sm">
            📄 Export PDF
          </Button>
          <Button onClick={() => setShowEmailDialog(true)} variant="secondary" size="sm">
            📧 Email
          </Button>
          <Button 
            onClick={() => setShowShareDialog(true)} 
            variant="primary" 
            size="sm"
            title="Share audit with team members"
          >
            📤 Share
          </Button>
          <Button 
            onClick={() => setShowBugDialog(true)} 
            variant="secondary" 
            size="sm"
            disabled={getFailureCount() === 0}
            title={getFailureCount() === 0 ? 'No failures to report' : `Generate report for ${getFailureCount()} issues`}
          >
            🐛 Bugs ({getFailureCount()})
          </Button>
          <Button 
            onClick={() => setShowIssueTrackerSettings(true)} 
            variant="secondary" 
            size="sm"
            title="Configure Issue Tracker (GitHub/Asana)"
          >
            ⚙️ Tracker
          </Button>
          <Button onClick={handleExportCSV} variant="secondary" size="sm">
            📊 Export CSV
          </Button>
          <Button onClick={() => setShowComparisonDialog(true)} variant="secondary" size="sm">
            ⚖️ Compare
          </Button>
          <Button onClick={exportResults} variant="secondary" size="sm">
            💾 Backup JSON
          </Button>
          <Button onClick={() => setShowHistoryDialog(true)} variant="secondary" size="sm">
            🕒 History
          </Button>
          <Button onClick={() => setShowBatchImportDialog(true)} variant="secondary" size="sm">
            📥 Batch Import
          </Button>
          <Button onClick={() => setShowExternalImportDialog(true)} variant="secondary" size="sm">
            🤖 Tool Import
          </Button>
          <Button 
            onClick={() => document.getElementById('merge-upload')?.click()} 
            variant="secondary" 
            size="sm"
          >
            🔀 Import & Merge
          </Button>
          <input
            id="merge-upload"
            type="file"
            accept=".json"
            onChange={handleMergeResults}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {showTeamManagement && (
        <TeamManagement 
          onClose={() => setShowTeamManagement(false)} 
          onUpdate={loadTeamMembers}
        />
      )}

      {showShareDialog && (
        <ShareDialog
          project={prepareProjectData()}
          results={convertToTestResults()}
          teamMembers={teamMembers}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      {showMergeDialog && mergeResult && (
        <ConflictResolutionDialog
          mergeResult={mergeResult}
          onResolve={(resolutions) => applyMerge(mergeResult, resolutions)}
          onCancel={() => {
            setShowMergeDialog(false);
            setMergeResult(null);
          }}
        />
      )}

      {scheduleView === 'component-based' ? (
        <ComponentTestingView 
          schedule={componentSchedule}
          results={results}
          scLookup={scLookup}
          onUpdateResult={handleComponentResultUpdate}
        />
      ) : (
        <main className="workflow-content">
          <aside className="workflow-sidebar">
            {!showComponentInfo ? (
              <>
              <div className="sidebar-header">
                <div className="flex justify-between items-center w-full mb-2">
                  <h3>Success Criteria List</h3>
                  <Button 
                    onClick={() => setShowTeamManagement(true)} 
                    size="sm" 
                    variant="secondary"
                    title="Manage team members"
                  >
                    👥 Team
                  </Button>
                </div>
                
                <div className="mb-2">
                  <Input
                    placeholder="🔍 Search criteria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2 mb-2 flex-wrap">
                  <Button 
                    onClick={() => setShowComponentInfo(true)} 
                    size="sm" 
                    variant="secondary"
                    title="View component testing guide"
                    className="flex-1"
                  >
                    📚 Guide
                  </Button>
                  {teamMembers.length > 0 && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-gray-100 border border-transparent hover:border-gray-200" title="Show only tasks assigned to me">
                      <input 
                        type="checkbox" 
                        checked={filterAssignedToMe} 
                        onChange={(e) => setFilterAssignedToMe(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>My Tasks</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-gray-100 border border-transparent hover:border-gray-200" title="Show only untested items">
                    <input 
                      type="checkbox" 
                      checked={filterUntestedOnly} 
                      onChange={(e) => setFilterUntestedOnly(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Untested</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Group by:</span>
                    <select 
                      value={groupBy} 
                      onChange={(e) => setGroupBy(e.target.value as 'none' | 'status' | 'level')}
                      className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-8"
                    >
                      <option value="none">None</option>
                      <option value="status">Status</option>
                      <option value="level">Level</option>
                    </select>
                  </div>
                </div>
              </div>
              {results.size > 0 && (
                <div className="sidebar-info">
                  💾 Click "Save & Exit" to save your progress and resume later
                </div>
              )}
              <div className="sc-list">
                {(() => {
                  const filteredSchedule = schedule.filter(sc => {
                    const result = results.get(sc.id);
                    if (filterAssignedToMe && result?.assignedTo !== currentUser) return false;
                    if (filterUntestedOnly && result && result.status !== 'Not Tested') return false;
                    
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      return sc.scNumber.toLowerCase().includes(query) || 
                             sc.scTitle.toLowerCase().includes(query);
                    }
                    return true;
                  });

                  if (filteredSchedule.length === 0) {
                    return <div className="p-4 text-center text-gray-500">No matching criteria found</div>;
                  }

                  if (groupBy !== 'none') {
                    const groups: Record<string, typeof schedule> = {};
                    
                    // Initialize groups based on type to ensure order
                    if (groupBy === 'status') {
                       groups['Not Tested'] = [];
                       groups['Supports'] = [];
                       groups['Partially Supports'] = [];
                       groups['Does Not Support'] = [];
                       groups['Not Applicable'] = [];
                    } else if (groupBy === 'level') {
                       groups['A'] = [];
                       groups['AA'] = [];
                       groups['AAA'] = [];
                    }

                    filteredSchedule.forEach(sc => {
                      let key = '';
                      if (groupBy === 'status') {
                        key = results.get(sc.id)?.status || 'Not Tested';
                      } else {
                        key = sc.scLevel;
                      }
                      
                      // Fallback for any other status/level
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(sc);
                    });

                    return Object.entries(groups).map(([groupName, items]) => {
                      if (items.length === 0) return null;
                      
                      const isExpanded = expandedGroups.has(groupName);
                      
                      const statusColors: Record<string, string> = {
                        'Not Tested': 'bg-gray-100 text-gray-700',
                        'Supports': 'bg-green-100 text-green-800',
                        'Partially Supports': 'bg-yellow-100 text-yellow-800',
                        'Does Not Support': 'bg-red-100 text-red-800',
                        'Not Applicable': 'bg-gray-100 text-gray-500',
                        'A': 'bg-blue-100 text-blue-800',
                        'AA': 'bg-indigo-100 text-indigo-800',
                        'AAA': 'bg-purple-100 text-purple-800',
                      };

                      return (
                        <div key={groupName} className="mb-4">
                          <button 
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 ${statusColors[groupName] || 'bg-gray-100'}`}
                            onClick={() => toggleGroup(groupName)}
                          >
                            <span>{groupName} ({items.length})</span>
                            <span>{isExpanded ? '▼' : '▶'}</span>
                          </button>
                          
                          {isExpanded && items.map((sc) => {
                            const index = schedule.findIndex(s => s.id === sc.id);
                            const result = results.get(sc.id);
                            const assignee = teamMembers.find(m => m.id === result?.assignedTo);
                            
                            return (
                              <button
                                key={sc.id}
                                className={`sc-list-item ${index === currentIndex ? 'active' : ''} ${
                                  results.has(sc.id) ? 'tested' : ''
                                }`}
                                onClick={() => jumpToSC(index)}
                              >
                                <span className="sc-number">{sc.scNumber}</span>
                                <div className="flex-1 text-left overflow-hidden">
                                  <span className="sc-title block truncate">{sc.scTitle}</span>
                                  {assignee && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                      <span 
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                        style={{ backgroundColor: assignee.color }}
                                      >
                                        {assignee.initials}
                                      </span>
                                      {assignee.name}
                                    </span>
                                  )}
                                </div>
                                {results.has(sc.id) && <span className="sc-check">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      );
                    });
                  }

                  return filteredSchedule.map((sc) => {
                    const index = schedule.findIndex(s => s.id === sc.id);
                    const result = results.get(sc.id);
                    const assignee = teamMembers.find(m => m.id === result?.assignedTo);
                    
                    return (
                      <button
                        key={sc.id}
                        className={`sc-list-item ${index === currentIndex ? 'active' : ''} ${
                          results.has(sc.id) ? 'tested' : ''
                        }`}
                        onClick={() => jumpToSC(index)}
                      >
                        <span className="sc-number">{sc.scNumber}</span>
                        <div className="flex-1 text-left overflow-hidden">
                          <span className="sc-title block truncate">{sc.scTitle}</span>
                          {assignee && (
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <span 
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                style={{ backgroundColor: assignee.color }}
                              >
                                {assignee.initials}
                              </span>
                              {assignee.name}
                            </span>
                          )}
                        </div>
                        {results.has(sc.id) && <span className="sc-check">✓</span>}
                      </button>
                    );
                  });
                })()}
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-header">
                <h3>Component Testing Guide</h3>
                <Button 
                  onClick={() => setShowComponentInfo(false)} 
                  size="sm" 
                  variant="secondary"
                >
                  ← Back to List
                </Button>
              </div>
              <Select
                label="Select Component Type"
                value={selectedComponentType}
                onValueChange={setSelectedComponentType}
                options={[
                  { value: '', label: 'Choose a component...' },
                  { value: 'forms', label: '📝 Forms & Inputs' },
                  { value: 'images', label: '🖼️ Images & Graphics' },
                  { value: 'navigation', label: '🧭 Navigation & Menus' },
                  { value: 'links', label: '🔗 Links & Hyperlinks' },
                  { value: 'buttons', label: '🔘 Buttons & Controls' },
                  { value: 'headings', label: '📑 Headings & Structure' },
                  { value: 'tables', label: '📊 Data Tables' },
                  { value: 'media', label: '🎬 Audio & Video' },
                  { value: 'color-contrast', label: '🎨 Color & Contrast' },
                  { value: 'keyboard', label: '⌨️ Keyboard Navigation' },
                  { value: 'aria', label: '🎭 ARIA & Custom Widgets' },
                ]}
                fullWidth
              />
              <div className="component-info-container">
                <ComponentInfo componentType={selectedComponentType} />
              </div>
            </>
          )}
        </aside>

        <section className="workflow-main">
          <div className="sc-details">
            <div className="sc-header">
              <h2>
                {currentSC.scNumber} {currentSC.scTitle}
              </h2>
              <span className={`level-badge level-${currentSC.scLevel.toLowerCase()}`}>
                Level {currentSC.scLevel}
              </span>
            </div>

            {results.get(currentSC.id)?.needsRecheck && (
              <div className="recheck-banner">
                <span>🔄 This item needs rechecking. Review the result and click "Mark as Rechecked" when complete.</span>
                <Button onClick={handleRecheckItem} variant="primary" size="sm">
                  ✓ Mark as Rechecked
                </Button>
              </div>
            )}

            <div className="sc-info">
              <p className="sc-guideline">{currentSC.guideline}</p>
              <p className="sc-description">{currentSC.description}</p>
            </div>

            <div className="sc-metadata">
              <span>⏱️ Estimated: {currentSC.estimatedTime} min</span>
              {currentSC.componentsToTest.length > 0 && (
                <span>🧩 Components: {currentSC.componentsToTest.join(', ')}</span>
              )}
              <button 
                className="keyboard-hint" 
                onClick={() => setShowShortcutSettings(true)}
                title="Click to configure keyboard shortcuts"
                aria-label="Configure keyboard shortcuts"
              >
                {shortcutConfig.enabled ? '⌨️ Shortcuts Active' : '⌨️ Shortcuts Disabled'}
              </button>
            </div>
          </div>

          <div className="testing-section">
            <h3>Testing Steps</h3>
            <ol className="testing-steps">
              {currentSC.testingSteps.map((step, index) => (
                <li key={index} className={step.startsWith(' ') ? 'sub-step' : ''}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="techniques-section">
            <h3>Sufficient Techniques (Select which were used)</h3>
            <div className="techniques-list">
              {currentSC.sufficientTechniques.map((tech) => (
                <Checkbox
                  key={tech.id}
                  label={`${tech.id}: ${tech.title}`}
                  checked={selectedTechniques.includes(tech.id)}
                  onCheckedChange={() => toggleTechnique(tech.id)}
                />
              ))}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Custom Techniques</strong>
                <Button onClick={addCustomTechnique} size="sm" variant="secondary">
                  + Add Custom
                </Button>
              </div>
              {customTechniques.map((custom, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <Checkbox
                    label=""
                    checked={custom.checked}
                    onCheckedChange={() => toggleCustomTechnique(index)}
                  />
                  <Input
                    value={custom.description}
                    onChange={(e) => updateCustomTechnique(index, e.target.value)}
                    placeholder="Describe the technique you used..."
                    fullWidth
                  />
                  <Button onClick={() => removeCustomTechnique(index)} size="sm" variant="secondary">
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {currentSC.failures.length > 0 && (
            <div className="failures-section">
              <h3>Common Failures (Check if found)</h3>
              <div className="techniques-list">
                {currentSC.failures.map((failure) => (
                  <Checkbox
                    key={failure.id}
                    label={`${failure.id}: ${failure.title}`}
                    checked={selectedFailures.includes(failure.id)}
                    onCheckedChange={() => toggleFailure(failure.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="result-form">
            <h3>Test Result</h3>

            <Select
              label="Conformance Status"
              value={status}
              onValueChange={(value) => setStatus(value as ConformanceStatus | 'Not Tested')}
              options={[
                { value: 'Not Tested', label: 'Not Tested' },
                { value: 'Supports', label: 'Supports' },
                { value: 'Partially Supports', label: 'Partially Supports' },
                { value: 'Does Not Support', label: 'Does Not Support' },
                { value: 'Not Applicable', label: 'Not Applicable' },
              ]}
              required
              fullWidth
            />

            {teamMembers.length > 0 && (
              <div className="mb-4">
                <Select
                  label="Assign To"
                  value={assignedTo}
                  onValueChange={setAssignedTo}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...teamMembers.map(m => ({ value: m.id, label: `${m.name} (${m.role})` }))
                  ]}
                  fullWidth
                />
              </div>
            )}

            <Input
              label="Notes / Remarks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what was tested, any issues found, or exceptions..."
              helperText="Be specific about what was tested and any deviations"
              fullWidth
            />
            
            <div className="flex justify-end -mt-2 mb-4">
               <button 
                 className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                 onClick={() => toast.info('You can paste images (Ctrl+V) directly onto this page')}
                 type="button"
               >
                 📋 Paste Image (Ctrl+V) supported
               </button>
            </div>

            <Input
              label="Testing Tools Used (for this criterion)"
              value={toolsUsed}
              onChange={(e) => setToolsUsed(e.target.value)}
              placeholder="e.g., NVDA with Chrome, axe DevTools, Manual keyboard testing..."
              helperText="Document which specific tools or methods you used to test this success criterion"
              fullWidth
            />

            {(() => {
              const columnsToRender = templateColumns.length > 0 
                ? templateColumns 
                : (auditScope.customColumns || []).map(c => ({ id: c, label: c }));
              
              if (columnsToRender.length === 0) return null;

              return (
                <div className="custom-columns-section" style={{ marginTop: '1rem' }}>
                  {columnsToRender.map((col) => (
                    <Input
                      key={col.id}
                      label={col.label}
                      value={customColumnValues[col.label] || ''}
                      onChange={(e) => setCustomColumnValues(prev => ({ ...prev, [col.label]: e.target.value }))}
                      placeholder={`Enter ${col.label}...`}
                      fullWidth
                    />
                  ))}
                </div>
              );
            })()}

            {/* Phase 6: Screenshot Management */}
            <div className="testing-section" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>
                Screenshots
                {screenshots.length > 0 && (
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.875rem', 
                    backgroundColor: 'var(--color-primary-light, #eef2ff)',
                    color: 'var(--color-primary, #6366f1)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {screenshots.length}
                  </span>
                )}
              </h3>
              <ScreenshotManager
                testResultId={currentSC.id}
                componentId={auditScope.pageTitle}
                screenshots={screenshots}
                onAdd={handleAddScreenshot}
                onDelete={handleDeleteScreenshot}
                onUpdateCaption={handleUpdateCaption}
              />
            </div>

            <div className="form-actions">
              <Button onClick={handleSaveResult} variant="primary" size="lg" fullWidth>
                Save & Continue
              </Button>
            </div>
          </div>
        </section>
        </main>
      )}

      {/* Phase 6: Export Dialogs */}
      {showPDFDialog && (
        <PDFExportDialog
          project={prepareProjectData()}
          components={[prepareComponentData()]}
          results={convertToTestResults()}
          screenshots={getAllScreenshots()}
          template={activeTemplate}
          onClose={() => setShowPDFDialog(false)}
        />
      )}

      {showBugDialog && (
        <BugReportGenerator
          results={convertToTestResults()}
          components={[prepareComponentData()]}
          screenshots={getAllScreenshots()}
          defaultComponentName={auditScope.pageTitle}
          onClose={() => setShowBugDialog(false)}
        />
      )}

      {showEmailDialog && (
        <EmailDialog
          project={prepareProjectData()}
          results={convertToTestResults()}
          onClose={() => setShowEmailDialog(false)}
        />
      )}

      {showComparisonDialog && (
        <ComparisonDialog
          currentProject={prepareProjectData()}
          currentResults={convertToTestResults()}
          onClose={() => setShowComparisonDialog(false)}
        />
      )}

      {showHistoryDialog && (
        <VersionHistoryDialog
          onClose={() => setShowHistoryDialog(false)}
          onRestore={() => {
            loadSavedState();
            setShowHistoryDialog(false);
          }}
        />
      )}

      {showBatchImportDialog && (
        <BatchImportDialog
          onClose={() => setShowBatchImportDialog(false)}
          onImport={handleBatchImport}
        />
      )}

      {showExternalImportDialog && (
        <ExternalImportDialog
          onClose={() => setShowExternalImportDialog(false)}
          onImport={handleExternalImport}
        />
      )}

      <ShortcutSettings
        open={showShortcutSettings}
        onClose={() => setShowShortcutSettings(false)}
        onSave={handleSaveShortcutConfig}
        currentConfig={shortcutConfig}
      />

      <AutomatedScanDialog
        open={showAutoScanDialog}
        onClose={() => setShowAutoScanDialog(false)}

        onApplyResults={handleApplyAutoScanResults}
      />

      <IssueTrackerSettings
        open={showIssueTrackerSettings}
        onClose={() => setShowIssueTrackerSettings(false)}
      />
    </div>
  );
};
