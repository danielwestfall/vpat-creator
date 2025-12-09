export interface ShortcutConfig {
  enabled: boolean;
  next: string;
  previous: string;
  pass: string;
  fail: string;
  na: string;
}

export const DEFAULT_SHORTCUTS: ShortcutConfig = {
  enabled: true,
  next: 'ArrowRight',
  previous: 'ArrowLeft',
  pass: 'p',
  fail: 'f',
  na: 'n',
};
