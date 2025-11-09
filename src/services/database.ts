import Dexie, { type Table } from 'dexie';
import type {
  Project,
  Component,
  TestResult,
  Screenshot,
  WCAGCustomization,
} from '../models/types';

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
    console.log('Database opened successfully');
    
    // Check if this is first run
    const projectCount = await db.projects.count();
    if (projectCount === 0) {
      console.log('First run detected - database is ready');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
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
    console.log('Database cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear database:', error);
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
    console.error('Failed to export database:', error);
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

    console.log('Database imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import database:', error);
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
    console.error('Failed to get database stats:', error);
    throw error;
  }
}
