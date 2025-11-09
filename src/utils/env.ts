/**
 * Environment configuration utilities
 * Access environment variables with type safety
 */

export const env = {
  // Application
  appName: import.meta.env.VITE_APP_NAME || 'VPAT Creator',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Database
  dbName: import.meta.env.VITE_DB_NAME || 'VPATCreatorDB',
  dbVersion: parseInt(import.meta.env.VITE_DB_VERSION || '1', 10),

  // Features
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  enablePersistence: import.meta.env.VITE_ENABLE_PERSISTENCE === 'true',

  // Export limits
  maxScreenshotSizeMB: parseInt(import.meta.env.VITE_MAX_SCREENSHOT_SIZE_MB || '10', 10),
  maxExportSizeMB: parseInt(import.meta.env.VITE_MAX_EXPORT_SIZE_MB || '50', 10),

  // Development
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): boolean {
  const required = [
    'VITE_APP_NAME',
    'VITE_DB_NAME',
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    return false;
  }

  return true;
}

/**
 * Log environment configuration (development only)
 */
export function logEnvConfig(): void {
  if (env.isDevelopment) {
    console.log('Environment Configuration:', {
      appName: env.appName,
      appVersion: env.appVersion,
      dbName: env.dbName,
      dbVersion: env.dbVersion,
      enableDevtools: env.enableDevtools,
      enablePersistence: env.enablePersistence,
      isDevelopment: env.isDevelopment,
      isProduction: env.isProduction,
    });
  }
}
