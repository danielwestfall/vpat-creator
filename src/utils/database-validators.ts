import { z } from 'zod';

// Database backup validation schema
export const databaseBackupSchema = z.object({
  projects: z.array(z.any()),
  components: z.array(z.any()),
  testResults: z.array(z.any()),
  screenshots: z.array(z.any()),
  wcagCustomizations: z.array(z.any()),
  exportDate: z.string().datetime(),
  version: z.string(),
});

export type DatabaseBackup = z.infer<typeof databaseBackupSchema>;

// Helper to validate backup data
export function validateBackupData(data: unknown): DatabaseBackup {
  return databaseBackupSchema.parse(data);
}
