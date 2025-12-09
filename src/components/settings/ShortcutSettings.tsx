import React from 'react';
import { Modal, ModalFooter } from '../common/Modal';
import { Button, Checkbox, Input, Select } from '../common';

import { type ShortcutConfig } from '../../models/shortcuts';

interface ShortcutSettingsProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: ShortcutConfig) => void;
  currentConfig: ShortcutConfig;
}

export const ShortcutSettings: React.FC<ShortcutSettingsProps> = ({
  open,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [config, setConfig] = React.useState<ShortcutConfig>(currentConfig);

  // Reset config when modal opens
  React.useEffect(() => {
    if (open) {
      setConfig(currentConfig);
    }
  }, [open, currentConfig]);

  const handleChange = (key: keyof ShortcutConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const navigationOptions = [
    { value: 'ArrowRight', label: 'Arrow Keys (Right/Left)' },
    { value: 'n', label: 'N / P (Next/Previous)' },
    { value: 'j', label: 'J / K (Vim style)' },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Keyboard Shortcuts Settings"
      description="Configure keyboard shortcuts for the testing workflow."
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--color-primary-light, #eef2ff)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-primary-light, #e0e7ff)',
            color: 'var(--color-primary-dark, #3730a3)',
            fontSize: '0.875rem',
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Note for Screen Reader Users:</strong> Shortcuts use the <strong>Alt</strong>{' '}
            modifier key to avoid conflicts with common screen reader commands. You can disable them
            entirely below if they interfere with your workflow.
          </p>
        </div>

        <Checkbox
          label="Enable Keyboard Shortcuts"
          checked={config.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            opacity: config.enabled ? 1 : 0.5,
            pointerEvents: config.enabled ? 'auto' : 'none',
            transition: 'opacity 0.2s',
          }}
        >
          <h4
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.5rem',
            }}
          >
            Navigation (Alt + Key)
          </h4>

          <Select
            label="Navigation Style"
            value={config.next === 'ArrowRight' ? 'ArrowRight' : config.next === 'n' ? 'n' : 'j'}
            onValueChange={(val) => {
              if (val === 'ArrowRight') {
                setConfig((prev) => ({ ...prev, next: 'ArrowRight', previous: 'ArrowLeft' }));
              } else if (val === 'n') {
                setConfig((prev) => ({ ...prev, next: 'n', previous: 'p' }));
              } else if (val === 'j') {
                setConfig((prev) => ({ ...prev, next: 'j', previous: 'k' }));
              }
            }}
            options={navigationOptions}
            fullWidth
          />

          <h4
            style={{
              margin: '1rem 0 0.5rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.5rem',
            }}
          >
            Status Marking (Alt + Key)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Pass / Supports"
              value={config.pass}
              onChange={(e) => handleChange('pass', e.target.value.slice(0, 1).toLowerCase())}
              maxLength={1}
              fullWidth
            />
            <Input
              label="Fail / Does Not Support"
              value={config.fail}
              onChange={(e) => handleChange('fail', e.target.value.slice(0, 1).toLowerCase())}
              maxLength={1}
              fullWidth
            />
            <Input
              label="Not Applicable"
              value={config.na}
              onChange={(e) => handleChange('na', e.target.value.slice(0, 1).toLowerCase())}
              maxLength={1}
              fullWidth
            />
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave(config)}>Save Settings</Button>
      </ModalFooter>
    </Modal>
  );
};
