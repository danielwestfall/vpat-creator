import type { VPATTemplate, TemplateImportData } from '../models/template-types';
import { DEFAULT_TEMPLATES } from '../models/template-types';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'vpat-templates';
const DB_VERSION = 1;
const TEMPLATES_STORE = 'templates';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase) {
        if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
          const store = db.createObjectStore(TEMPLATES_STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('isDefault', 'isDefault', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Initialize database with default templates if empty
 */
export async function initializeTemplates(): Promise<void> {
  const db = await getDB();
  const count = await db.count(TEMPLATES_STORE);

  if (count === 0) {
    // Add default templates
    for (const template of DEFAULT_TEMPLATES) {
      const fullTemplate: VPATTemplate = {
        ...template,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      await db.add(TEMPLATES_STORE, fullTemplate);
    }
  }
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<VPATTemplate[]> {
  const db = await getDB();
  return db.getAll(TEMPLATES_STORE);
}

/**
 * Get template by ID
 */
export async function getTemplate(id: string): Promise<VPATTemplate | undefined> {
  const db = await getDB();
  return db.get(TEMPLATES_STORE, id);
}

/**
 * Get default template
 */
export async function getDefaultTemplate(): Promise<VPATTemplate | null> {
  const db = await getDB();

  const allTemplates = await db.getAll(TEMPLATES_STORE);
  const template = allTemplates.find((t) => t.isDefault);
  return template || null;
}

/**
 * Save or update template
 */
export async function saveTemplate(template: VPATTemplate): Promise<void> {
  const db = await getDB();
  template.modifiedAt = new Date();
  await db.put(TEMPLATES_STORE, template);
}

/**
 * Create new template
 */
export async function createTemplate(
  templateData: Omit<VPATTemplate, 'id' | 'createdAt' | 'modifiedAt'>
): Promise<VPATTemplate> {
  const template: VPATTemplate = {
    ...templateData,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  await saveTemplate(template);
  return template;
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(TEMPLATES_STORE, id);
}

/**
 * Duplicate template
 */
export async function duplicateTemplate(id: string): Promise<VPATTemplate> {
  const original = await getTemplate(id);
  if (!original) {
    throw new Error('Template not found');
  }

  const duplicate: VPATTemplate = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    isDefault: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  await saveTemplate(duplicate);
  return duplicate;
}

/**
 * Set template as default
 */
export async function setDefaultTemplate(id: string): Promise<void> {
  const db = await getDB();

  // Unset all defaults
  const allTemplates = await getAllTemplates();
  for (const template of allTemplates) {
    if (template.isDefault) {
      template.isDefault = false;
      await db.put(TEMPLATES_STORE, template);
    }
  }

  // Set new default
  const template = await getTemplate(id);
  if (template) {
    template.isDefault = true;
    await db.put(TEMPLATES_STORE, template);
  }
}

/**
 * Export template to JSON
 */
export function exportTemplate(template: VPATTemplate): void {
  const exportData: TemplateImportData = {
    formatVersion: '1.0',
    template: {
      name: template.name,
      description: template.description,
      version: template.version,
      isDefault: false, // Never export as default
      header: template.header,
      sections: template.sections,
      styling: template.styling,
      columns: template.columns,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import template from JSON file
 */
export async function importTemplate(file: File): Promise<VPATTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data: TemplateImportData = JSON.parse(json);

        // Validate format
        if (!data.formatVersion || !data.template) {
          throw new Error('Invalid template format');
        }

        // Create template
        const template = await createTemplate(data.template);
        resolve(template);
      } catch (error) {
        reject(
          new Error(
            `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Import template from JSON string
 */
export async function importTemplateFromJSON(json: string): Promise<VPATTemplate> {
  try {
    const data: TemplateImportData = JSON.parse(json);

    // Validate format
    if (!data.formatVersion || !data.template) {
      throw new Error('Invalid template format');
    }

    // Create template
    return await createTemplate(data.template);
  } catch (error) {
    throw new Error(
      `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Reset to default templates
 */
export async function resetToDefaults(): Promise<void> {
  const db = await getDB();

  // Clear all templates
  const tx = db.transaction(TEMPLATES_STORE, 'readwrite');
  await tx.store.clear();
  await tx.done;

  // Re-initialize with defaults
  await initializeTemplates();
}

// Initialize on module load
initializeTemplates().catch(console.error);
