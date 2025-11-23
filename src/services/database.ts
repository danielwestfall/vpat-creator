import Dexie, { type Table } from 'dexie';
import { createLogger } from '../utils/logger';
import type {
  Project,
  Component,
  TestResult,
  Screenshot,
  WCAGCustomization,
  TeamMember,
} from '../models/types';

const logger = createLogger('database');

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export class VPATDatabase extends Dexie {
  // Tables
  projects!: Table<Project, string>;
  components!: Table<Component, string>;
  testResults!: Table<TestResult, string>;
  screenshots!: Table<Screenshot, string>;
  wcagCustomizations!: Table<WCAGCustomization, string>;

  constructor() {
    super('VPATCreatorDB');

    // Define schema version 1
    this.version(1).stores({
      projects: 'id, name, status, createdAt, modifiedAt, targetConformanceLevel',
      components: 'id, name, type, projectId, completed, testDate',
      testResults: 'id, componentId, successCriterionId, conformance, level',
      screenshots: 'id, componentId, testResultId, uploadedDate',
      wcagCustomizations: 'baseVersion, modified, modifiedDate',
    });

    // Define schema version 2 (add projectId to results and screenshots)
    this.version(2).stores({
      testResults: 'id, componentId, successCriterionId, conformance, level, projectId',
      screenshots: 'id, componentId, testResultId, uploadedDate, projectId',
    });
  }
}

// Create and export database instance
export const db = new VPATDatabase();

// ============================================================================
// DATABASE HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize the database with default data if needed
 */
export async function initializeDatabase() {
  try {
    await db.open();
    logger.info('Database opened successfully');
    
    // Check if this is first run
    const projectCount = await db.projects.count();
    if (projectCount === 0) {
      logger.info('First run detected - database is ready');
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    return false;
  }
}

/**
 * Clear all data from the database (useful for development/testing)
 */
export async function clearDatabase() {
  try {
    await db.projects.clear();
    await db.components.clear();
    await db.testResults.clear();
    await db.screenshots.clear();
    await db.wcagCustomizations.clear();
    logger.info('Database cleared successfully');
    return true;
  } catch (error) {
    logger.error('Failed to clear database:', error);
    return false;
  }
}

/**
 * Export database to JSON for backup
 */
export async function exportDatabaseToJSON() {
  try {
    const data = {
      projects: await db.projects.toArray(),
      components: await db.components.toArray(),
      testResults: await db.testResults.toArray(),
      screenshots: await db.screenshots.toArray(),
      wcagCustomizations: await db.wcagCustomizations.toArray(),
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    return data;
  } catch (error) {
    logger.error('Failed to export database:', error);
    throw error;
  }
}

/**
 * Import database from JSON backup
 */
export async function importDatabaseFromJSON(data: unknown) {
  try {
    // Type guard for backup data
    const backupData = data as {
      projects?: Project[];
      components?: Component[];
      testResults?: TestResult[];
      screenshots?: Screenshot[];
      wcagCustomizations?: WCAGCustomization[];
    };

    // Validate data structure
    if (!backupData.projects || !Array.isArray(backupData.projects)) {
      throw new Error('Invalid backup data structure');
    }

    // Clear existing data
    await clearDatabase();

    // Import data
    if (backupData.projects.length > 0) {
      await db.projects.bulkAdd(backupData.projects);
    }
    if (backupData.components && backupData.components.length > 0) {
      await db.components.bulkAdd(backupData.components);
    }
    if (backupData.testResults && backupData.testResults.length > 0) {
      await db.testResults.bulkAdd(backupData.testResults);
    }
    if (backupData.screenshots && backupData.screenshots.length > 0) {
      await db.screenshots.bulkAdd(backupData.screenshots);
    }
    if (backupData.wcagCustomizations && backupData.wcagCustomizations.length > 0) {
      await db.wcagCustomizations.bulkAdd(backupData.wcagCustomizations);
    }

    logger.info('Database imported successfully');
    return true;
  } catch (error) {
    logger.error('Failed to import database:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      projects: await db.projects.count(),
      components: await db.components.count(),
      testResults: await db.testResults.count(),
      screenshots: await db.screenshots.count(),
      wcagCustomizations: await db.wcagCustomizations.count(),
    };
    return stats;
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
}

// ============================================================================
// SCREENSHOT OPERATIONS
// ============================================================================

/**
 * Add a screenshot
 */
export async function addScreenshot(screenshot: Screenshot): Promise<string> {
  try {
    const id = await db.screenshots.add(screenshot);
    logger.info('Screenshot added:', id);
    return id;
  } catch (error) {
    logger.error('Failed to add screenshot:', error);
    throw error;
  }
}

/**
 * Get screenshots for a test result
 */
export async function getScreenshotsByTestResult(testResultId: string): Promise<Screenshot[]> {
  try {
    const screenshots = await db.screenshots
      .where('testResultId')
      .equals(testResultId)
      .filter(s => !s.projectId || s.projectId === 'current-audit')
      .toArray();
    return screenshots;
  } catch (error) {
    logger.error('Failed to get screenshots:', error);
    throw error;
  }
}

/**
 * Get screenshots for a component
 */
export async function getScreenshotsByComponent(componentId: string): Promise<Screenshot[]> {
  try {
    const screenshots = await db.screenshots
      .where('componentId')
      .equals(componentId)
      .toArray();
    return screenshots;
  } catch (error) {
    logger.error('Failed to get screenshots:', error);
    throw error;
  }
}

/**
 * Update screenshot caption
 */
export async function updateScreenshotCaption(id: string, caption: string): Promise<void> {
  try {
    await db.screenshots.update(id, { caption });
    logger.info('Screenshot caption updated:', id);
  } catch (error) {
    logger.error('Failed to update screenshot caption:', error);
    throw error;
  }
}

/**
 * Delete a screenshot
 */
export async function deleteScreenshot(id: string): Promise<void> {
  try {
    await db.screenshots.delete(id);
    logger.info('Screenshot deleted:', id);
  } catch (error) {
    logger.error('Failed to delete screenshot:', error);
    throw error;
  }
}

// ============================================================================
// TEST RESULT OPERATIONS
// ============================================================================

/**
 * Save or update a test result
 */
export async function saveTestResult(result: TestResult): Promise<string> {
  try {
    // Use put to update if exists or add if new
    const id = await db.testResults.put(result);
    logger.info('Test result saved:', id);
    return id;
  } catch (error) {
    logger.error('Failed to save test result:', error);
    throw error;
  }
}

/**
 * Get all test results for the current project
 */
export async function getAllTestResults(): Promise<TestResult[]> {
  try {
    // Filter for results that belong to current audit (id='current-audit' or undefined for legacy)
    return await db.testResults
      .filter(r => !r.projectId || r.projectId === 'current-audit')
      .toArray();
  } catch (error) {
    logger.error('Failed to get test results:', error);
    throw error;
  }
}

/**
 * Bulk save test results (useful for import)
 */
export async function bulkSaveTestResults(results: TestResult[]): Promise<void> {
  try {
    await db.testResults.bulkPut(results);
    logger.info(`Saved ${results.length} test results`);
  } catch (error) {
    logger.error('Failed to bulk save test results:', error);
    throw error;
  }
}

// ============================================================================
// PROJECT / SCOPE OPERATIONS
// ============================================================================

/**
 * Save the current project (audit scope)
 * We'll use a fixed ID 'current-audit' for the active session to make it easy to restore
 */
export async function saveCurrentProject(project: Project): Promise<string> {
  try {
    // Ensure we use a consistent ID for the "active" project to allow resumption
    // In a multi-project app, this would be dynamic
    const projectToSave = { ...project, id: 'current-audit' };
    const id = await db.projects.put(projectToSave);
    logger.info('Project saved:', id);
    return id;
  } catch (error) {
    logger.error('Failed to save project:', error);
    throw error;
  }
}

/**
 * Get the current active project
 */
export async function getCurrentProject(): Promise<Project | undefined> {
  try {
    return await db.projects.get('current-audit');
  } catch (error) {
    logger.error('Failed to get current project:', error);
    throw error;
  }
}

/**
 * Clear the current audit data (start over)
 */
export async function clearCurrentAudit(): Promise<void> {
  try {
    await db.transaction('rw', db.projects, db.testResults, db.screenshots, async () => {
      await db.projects.delete('current-audit');
      await db.testResults.clear(); // Clear all results for now as we're single-session
      // We might want to keep screenshots or handle them more carefully in a real multi-project app
      await db.screenshots.clear(); 
    });
    logger.info('Current audit cleared');
  } catch (error) {
    logger.error('Failed to clear audit:', error);
    throw error;
  }
}
// ============================================================================
// TEAM MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Get all team members for the current project
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const project = await getCurrentProject();
    return project?.teamMembers || [];
  } catch (error) {
    logger.error('Failed to get team members:', error);
    throw error;
  }
}

/**
 * Add a team member to the current project
 */
export async function addTeamMember(member: TeamMember): Promise<void> {
  try {
    const project = await getCurrentProject();
    if (!project) throw new Error('No active project found');

    const teamMembers = project.teamMembers || [];
    // Check if member already exists
    if (teamMembers.some(m => m.id === member.id)) {
      throw new Error('Team member already exists');
    }

    const updatedProject = {
      ...project,
      teamMembers: [...teamMembers, member],
      modifiedAt: new Date(),
    };

    await saveCurrentProject(updatedProject);
    logger.info('Team member added:', member.name);
  } catch (error) {
    logger.error('Failed to add team member:', error);
    throw error;
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(member: TeamMember): Promise<void> {
  try {
    const project = await getCurrentProject();
    if (!project) throw new Error('No active project found');

    const teamMembers = project.teamMembers || [];
    const index = teamMembers.findIndex(m => m.id === member.id);
    
    if (index === -1) {
      throw new Error('Team member not found');
    }

    const updatedMembers = [...teamMembers];
    updatedMembers[index] = member;

    const updatedProject = {
      ...project,
      teamMembers: updatedMembers,
      modifiedAt: new Date(),
    };

    await saveCurrentProject(updatedProject);
    logger.info('Team member updated:', member.name);
  } catch (error) {
    logger.error('Failed to update team member:', error);
    throw error;
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(id: string): Promise<void> {
  try {
    const project = await getCurrentProject();
    if (!project) throw new Error('No active project found');

    const teamMembers = project.teamMembers || [];
    const updatedMembers = teamMembers.filter(m => m.id !== id);

    const updatedProject = {
      ...project,
      teamMembers: updatedMembers,
      modifiedAt: new Date(),
    };

    await saveCurrentProject(updatedProject);
    logger.info('Team member removed:', id);
  } catch (error) {
    logger.error('Failed to remove team member:', error);
    throw error;
  }
}

// ============================================================================
// SNAPSHOT / VERSION HISTORY OPERATIONS
// ============================================================================

/**
 * Create a snapshot of the current audit
 */
export async function createSnapshot(name: string): Promise<string> {
  try {
    const currentProject = await getCurrentProject();
    if (!currentProject) throw new Error('No active project to snapshot');

    const snapshotId = crypto.randomUUID();
    const snapshotProject: Project = {
      ...currentProject,
      id: snapshotId,
      name: name,
      status: 'snapshot',
      modifiedAt: new Date(),
    };

    // Get current results and screenshots
    const results = await getAllTestResults();
    const screenshots = await db.screenshots
      .filter(s => !s.projectId || s.projectId === 'current-audit')
      .toArray();

    // Clone results
    const snapshotResults = results.map(r => ({
      ...r,
      projectId: snapshotId,
      // We keep the same ID? No, IDs must be unique in the table if it's the primary key.
      // The schema says 'id' is primary key.
      // So we must generate new IDs for the snapshot copies.
      // But wait, if we change IDs, we break relationships (e.g. screenshots linked to result ID).
      // We need to map old result IDs to new result IDs.
      id: crypto.randomUUID(), 
      originalId: r.id // Optional: track original ID if needed
    }));

    // Create map of oldResultId -> newResultId
    const resultIdMap = new Map<string, string>();
    results.forEach((r, index) => {
      resultIdMap.set(r.id, snapshotResults[index].id);
    });

    // Clone screenshots
    const snapshotScreenshots = screenshots.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      projectId: snapshotId,
      testResultId: s.testResultId ? resultIdMap.get(s.testResultId) : undefined
    }));

    await db.transaction('rw', db.projects, db.testResults, db.screenshots, async () => {
      await db.projects.add(snapshotProject);
      await db.testResults.bulkAdd(snapshotResults);
      await db.screenshots.bulkAdd(snapshotScreenshots);
    });

    logger.info(`Snapshot created: ${name} (${snapshotId})`);
    return snapshotId;
  } catch (error) {
    logger.error('Failed to create snapshot:', error);
    throw error;
  }
}

/**
 * Get all snapshots
 */
export async function getSnapshots(): Promise<Project[]> {
  try {
    return await db.projects.where('status').equals('snapshot').reverse().sortBy('modifiedAt');
  } catch (error) {
    logger.error('Failed to get snapshots:', error);
    throw error;
  }
}

/**
 * Restore a snapshot to be the current audit
 * WARNING: Overwrites current progress!
 */
export async function restoreSnapshot(snapshotId: string): Promise<void> {
  try {
    const snapshot = await db.projects.get(snapshotId);
    if (!snapshot) throw new Error('Snapshot not found');

    // Get snapshot data
    const snapshotResults = await db.testResults.where('projectId').equals(snapshotId).toArray();
    const snapshotScreenshots = await db.screenshots.where('projectId').equals(snapshotId).toArray();

    // Prepare data for current audit
    // We need to generate NEW IDs again to avoid conflict if we snapshot this later?
    // Or we can just reuse them if we ensure 'current-audit' items have their own IDs.
    // Let's generate new IDs to be safe and clean.

    const newProject: Project = {
      ...snapshot,
      id: 'current-audit',
      status: 'in-progress',
      modifiedAt: new Date(),
    };

    const newResults = snapshotResults.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      projectId: 'current-audit'
    }));

    const resultIdMap = new Map<string, string>();
    snapshotResults.forEach((r, index) => {
      resultIdMap.set(r.id, newResults[index].id);
    });

    const newScreenshots = snapshotScreenshots.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      projectId: 'current-audit',
      testResultId: s.testResultId ? resultIdMap.get(s.testResultId) : undefined
    }));

    await db.transaction('rw', db.projects, db.testResults, db.screenshots, async () => {
      // Clear current
      await db.projects.delete('current-audit');
      // Delete all results/screenshots belonging to current-audit
      // Since we don't have a simple index delete for filtered items, we find keys first
      const currentResultKeys = await db.testResults
        .filter(r => !r.projectId || r.projectId === 'current-audit')
        .primaryKeys();
      await db.testResults.bulkDelete(currentResultKeys);

      const currentScreenshotKeys = await db.screenshots
        .filter(s => !s.projectId || s.projectId === 'current-audit')
        .primaryKeys();
      await db.screenshots.bulkDelete(currentScreenshotKeys);

      // Add restored data
      await db.projects.put(newProject);
      await db.testResults.bulkAdd(newResults);
      await db.screenshots.bulkAdd(newScreenshots);
    });

    logger.info(`Snapshot restored: ${snapshot.name}`);
  } catch (error) {
    logger.error('Failed to restore snapshot:', error);
    throw error;
  }
}

/**
 * Delete a snapshot
 */
export async function deleteSnapshot(snapshotId: string): Promise<void> {
  try {
    await db.transaction('rw', db.projects, db.testResults, db.screenshots, async () => {
      await db.projects.delete(snapshotId);
      
      const resultKeys = await db.testResults.where('projectId').equals(snapshotId).primaryKeys();
      await db.testResults.bulkDelete(resultKeys);

      const screenshotKeys = await db.screenshots.where('projectId').equals(snapshotId).primaryKeys();
      await db.screenshots.bulkDelete(screenshotKeys);
    });
    logger.info(`Snapshot deleted: ${snapshotId}`);
  } catch (error) {
    logger.error('Failed to delete snapshot:', error);
    throw error;
  }
}
