import { z } from 'zod';

// URL validation schema
export const urlSchema = z.string().url().optional().or(z.literal(''));

// Audit scope validation
export const auditScopeSchema = z.object({
  pageTitle: z.string().min(1, 'Page or component name is required'),
  pageUrl: urlSchema,
  wcagVersion: z.enum(['2.1', '2.2']),
  conformanceLevels: z
    .array(z.enum(['A', 'AA', 'AAA']))
    .min(1, 'At least one conformance level is required'),
  includeEN301549: z.boolean(),
  includeSection508: z.boolean(),
  testingTools: z.array(z.string()),
  evaluationMethods: z.array(z.string()),
});

export type AuditScopeValidation = z.infer<typeof auditScopeSchema>;
