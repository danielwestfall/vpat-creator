import React, { useState, useEffect } from 'react';
import {
  issueTrackerService,
  type IssueTrackerConfig,
  type IssueTrackerType,
} from '../../services/issue-tracker-service';
import { Button, Input, Select } from '../common';
import { toast } from '../../store/toast-store';
import './IssueTrackerSettings.css';

interface IssueTrackerSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface AsanaResource {
  gid: string;
  name: string;
}

export const IssueTrackerSettings: React.FC<IssueTrackerSettingsProps> = ({ open, onClose }) => {
  const [config, setConfig] = useState<IssueTrackerConfig>(issueTrackerService.getConfig());
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'success' | 'error'>('none');

  // Asana specific state
  const [asanaWorkspaces, setAsanaWorkspaces] = useState<AsanaResource[]>([]);
  const [asanaProjects, setAsanaProjects] = useState<AsanaResource[]>([]);
  const [isLoadingAsanaData, setIsLoadingAsanaData] = useState(false);

  useEffect(() => {
    if (open) {
      setConfig(issueTrackerService.getConfig());
      setValidationStatus('none');
    }
  }, [open]);

  const handleTypeChange = (type: IssueTrackerType) => {
    setConfig((prev) => ({ ...prev, type }));
    setValidationStatus('none');
  };

  const handleSave = () => {
    issueTrackerService.saveConfig(config);
    toast.success('Issue tracker settings saved');
    onClose();
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationStatus('none');

    try {
      if (config.type === 'github') {
        if (!config.githubToken || !config.githubOwner || !config.githubRepo) {
          toast.error('Please fill in all GitHub fields');
          setValidationStatus('error');
          return;
        }
        const isValid = await issueTrackerService.validateGitHubConnection(
          config.githubToken,
          config.githubOwner,
          config.githubRepo
        );
        setValidationStatus(isValid ? 'success' : 'error');
        if (isValid) toast.success('Successfully connected to GitHub!');
        else toast.error('Failed to connect to GitHub. Check your token and repo details.');
      } else if (config.type === 'asana') {
        if (!config.asanaToken) {
          toast.error('Please enter an Asana Personal Access Token');
          setValidationStatus('error');
          return;
        }
        // Try to fetch workspaces to validate token
        await fetchAsanaData(config.asanaToken);
        setValidationStatus('success');
        toast.success('Successfully connected to Asana!');
      } else if (config.type === 'jira') {
        if (
          !config.jiraDomain ||
          !config.jiraEmail ||
          !config.jiraApiToken ||
          !config.jiraProjectKey
        ) {
          toast.error('Please fill in all Jira fields');
          setValidationStatus('error');
          return;
        }
        const isValid = await issueTrackerService.validateJiraConnection(
          config.jiraDomain,
          config.jiraEmail,
          config.jiraApiToken,
          config.jiraProjectKey
        );
        setValidationStatus(isValid ? 'success' : 'error');
        if (isValid) toast.success('Successfully connected to Jira!');
        else toast.error('Failed to connect to Jira. Check your credentials and project key.');
      }
    } catch (error) {
      console.error(error);
      setValidationStatus('error');
      toast.error('Connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  const fetchAsanaData = async (token: string) => {
    setIsLoadingAsanaData(true);
    try {
      const workspaces = await issueTrackerService.getAsanaWorkspaces(token);
      setAsanaWorkspaces(workspaces);

      // If we have a workspace selected (or default to first), fetch projects
      const workspaceId = config.asanaWorkspaceId || workspaces[0]?.gid;
      if (workspaceId) {
        const projects = await issueTrackerService.getAsanaProjects(token, workspaceId);
        setAsanaProjects(projects);

        // Update config with default workspace if not set
        if (!config.asanaWorkspaceId) {
          setConfig((prev) => ({ ...prev, asanaWorkspaceId: workspaceId }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch Asana data', error);
      throw error;
    } finally {
      setIsLoadingAsanaData(false);
    }
  };

  // Fetch Asana projects when workspace changes
  useEffect(() => {
    if (config.type === 'asana' && config.asanaToken && config.asanaWorkspaceId) {
      issueTrackerService
        .getAsanaProjects(config.asanaToken, config.asanaWorkspaceId)
        .then(setAsanaProjects)
        .catch(console.error);
    }
  }, [config.asanaWorkspaceId, config.asanaToken, config.type]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content issue-tracker-settings">
        <h2>Issue Tracker Integration</h2>

        <div className="tracker-selector">
          <button
            type="button"
            className={`tracker-option ${config.type === 'github' ? 'selected' : ''}`}
            onClick={() => handleTypeChange('github')}
            aria-pressed={config.type === 'github'}
          >
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🐙</span>
            GitHub
          </button>
          <button
            type="button"
            className={`tracker-option ${config.type === 'asana' ? 'selected' : ''}`}
            onClick={() => handleTypeChange('asana')}
            aria-pressed={config.type === 'asana'}
          >
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⚪</span>
            Asana
          </button>
          <button
            type="button"
            className={`tracker-option ${config.type === 'jira' ? 'selected' : ''}`}
            onClick={() => handleTypeChange('jira')}
            aria-pressed={config.type === 'jira'}
          >
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🔷</span>
            Jira
          </button>
        </div>

        <div className="config-form">
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              />
              Enable Integration
            </label>
          </div>

          {config.type === 'github' && (
            <>
              <Input
                label="Personal Access Token (PAT)"
                type="password"
                value={config.githubToken || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, githubToken: e.target.value }))}
                placeholder="ghp_..."
                helperText="Token needs 'repo' scope"
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Input
                  label="Owner / Organization"
                  value={config.githubOwner || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, githubOwner: e.target.value }))}
                  placeholder="e.g., microsoft"
                  fullWidth
                />
                <Input
                  label="Repository Name"
                  value={config.githubRepo || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, githubRepo: e.target.value }))}
                  placeholder="e.g., vscode"
                  fullWidth
                />
              </div>
            </>
          )}

          {config.type === 'asana' && (
            <>
              <Input
                label="Personal Access Token"
                type="password"
                value={config.asanaToken || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, asanaToken: e.target.value }))}
                placeholder="1/..."
                helperText="Get this from Asana Developer Console"
              />

              {asanaWorkspaces.length > 0 && (
                <Select
                  label="Workspace"
                  value={config.asanaWorkspaceId || ''}
                  onValueChange={(val) => setConfig((prev) => ({ ...prev, asanaWorkspaceId: val }))}
                  options={asanaWorkspaces.map((ws) => ({ value: ws.gid, label: ws.name }))}
                  fullWidth
                />
              )}

              {asanaProjects.length > 0 && (
                <Select
                  label="Project"
                  value={config.asanaProjectId || ''}
                  onValueChange={(val) => setConfig((prev) => ({ ...prev, asanaProjectId: val }))}
                  options={asanaProjects.map((p) => ({ value: p.gid, label: p.name }))}
                  fullWidth
                />
              )}

              {config.asanaToken && asanaWorkspaces.length === 0 && (
                <Button
                  onClick={() => fetchAsanaData(config.asanaToken!)}
                  variant="secondary"
                  size="sm"
                  loading={isLoadingAsanaData}
                >
                  Load Workspaces & Projects
                </Button>
              )}
            </>
          )}

          {config.type === 'jira' && (
            <>
              <Input
                label="Jira Domain"
                value={config.jiraDomain || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, jiraDomain: e.target.value }))}
                placeholder="your-company.atlassian.net"
                helperText="The URL of your Jira Cloud instance"
                fullWidth
              />
              <Input
                label="Email Address"
                type="email"
                value={config.jiraEmail || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, jiraEmail: e.target.value }))}
                placeholder="you@company.com"
                fullWidth
              />
              <Input
                label="API Token"
                type="password"
                value={config.jiraApiToken || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, jiraApiToken: e.target.value }))}
                placeholder="Token from Atlassian Account Settings"
                helperText="Create at: id.atlassian.com/manage-profile/security/api-tokens"
                fullWidth
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Input
                  label="Project Key"
                  value={config.jiraProjectKey || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, jiraProjectKey: e.target.value }))
                  }
                  placeholder="e.g., PROJ"
                  fullWidth
                />
                <Input
                  label="Issue Type"
                  value={config.jiraIssueType || 'Bug'}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, jiraIssueType: e.target.value }))
                  }
                  placeholder="Bug"
                  fullWidth
                />
              </div>
            </>
          )}

          {validationStatus !== 'none' && (
            <div className={`connection-status ${validationStatus}`}>
              {validationStatus === 'success' ? '✅ Connection Successful' : '❌ Connection Failed'}
            </div>
          )}
        </div>

        <div className="settings-actions">
          <Button onClick={handleValidate} variant="secondary" loading={isValidating}>
            Test Connection
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
