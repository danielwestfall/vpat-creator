import { createLogger } from '../utils/logger';

const logger = createLogger('issue-tracker');

export type IssueTrackerType = 'github' | 'asana' | 'jira';

export interface IssueTrackerConfig {
  type: IssueTrackerType;
  enabled: boolean;
  // GitHub specific
  githubToken?: string;
  githubOwner?: string;
  githubRepo?: string;
  // Asana specific
  asanaToken?: string;
  asanaWorkspaceId?: string;
  asanaProjectId?: string;
  // Jira specific
  jiraDomain?: string; // e.g., 'your-domain.atlassian.net'
  jiraEmail?: string;
  jiraApiToken?: string;
  jiraProjectKey?: string;
  jiraIssueType?: string; // e.g., 'Bug'
}

export interface IssueData {
  title: string;
  description: string;
  labels?: string[];
}

export interface TrackerIssueResult {
  id: string;
  url: string;
  key?: string; // e.g., ISSUE-123
}

export interface AsanaResource {
  gid: string;
  name: string;
  resource_type: string;
}

class IssueTrackerService {
  private config: IssueTrackerConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): IssueTrackerConfig {
    const saved = localStorage.getItem('vpat_issue_tracker_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        logger.error('Failed to parse issue tracker config', e);
      }
    }
    return {
      type: 'github',
      enabled: false,
    };
  }

  public saveConfig(config: IssueTrackerConfig) {
    this.config = config;
    localStorage.setItem('vpat_issue_tracker_config', JSON.stringify(config));
  }

  public getConfig(): IssueTrackerConfig {
    return this.config;
  }

  public async createIssue(issue: IssueData): Promise<TrackerIssueResult> {
    if (!this.config.enabled) {
      throw new Error('Issue tracker integration is disabled');
    }

    if (this.config.type === 'github') {
      return this.createGitHubIssue(issue);
    } else if (this.config.type === 'asana') {
      return this.createAsanaTask(issue);
    } else if (this.config.type === 'jira') {
      return this.createJiraIssue(issue);
    }

    throw new Error(`Unsupported tracker type: ${this.config.type}`);
  }

  private async createGitHubIssue(issue: IssueData): Promise<TrackerIssueResult> {
    const { githubToken, githubOwner, githubRepo } = this.config;

    if (!githubToken || !githubOwner || !githubRepo) {
      throw new Error('Missing GitHub configuration');
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: issue.title,
            body: issue.description,
            labels: issue.labels || ['accessibility', 'vpat-audit'],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create GitHub issue');
      }

      const data = await response.json();
      return {
        id: data.id.toString(),
        url: data.html_url,
        key: `#${data.number}`,
      };
    } catch (error) {
      logger.error('GitHub API Error:', error);
      throw error;
    }
  }

  private async createAsanaTask(issue: IssueData): Promise<TrackerIssueResult> {
    const { asanaToken, asanaProjectId } = this.config;

    if (!asanaToken || !asanaProjectId) {
      throw new Error('Missing Asana configuration');
    }

    try {
      const response = await fetch('https://app.asana.com/api/1.0/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${asanaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: issue.title,
            notes: issue.description,
            projects: [asanaProjectId],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create Asana task');
      }

      const data = await response.json();
      return {
        id: data.data.gid,
        url: data.data.permalink_url,
        key: data.data.gid,
      };
    } catch (error) {
      logger.error('Asana API Error:', error);
      throw error;
    }
  }

  private async createJiraIssue(issue: IssueData): Promise<TrackerIssueResult> {
    const { jiraDomain, jiraEmail, jiraApiToken, jiraProjectKey, jiraIssueType } = this.config;

    if (!jiraDomain || !jiraEmail || !jiraApiToken || !jiraProjectKey) {
      throw new Error('Missing Jira configuration');
    }

    // Ensure domain doesn't have protocol
    const domain = jiraDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const auth = btoa(`${jiraEmail}:${jiraApiToken}`);

    try {
      const response = await fetch(`https://${domain}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          fields: {
            project: {
              key: jiraProjectKey,
            },
            summary: issue.title,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: issue.description,
                    },
                  ],
                },
              ],
            },
            issuetype: {
              name: jiraIssueType || 'Bug',
            },
            labels: issue.labels || [],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages =
          errorData.errorMessages?.join(', ') || JSON.stringify(errorData.errors);
        throw new Error(errorMessages || 'Failed to create Jira issue');
      }

      const data = await response.json();
      return {
        id: data.id,
        url: `https://${domain}/browse/${data.key}`,
        key: data.key,
      };
    } catch (error) {
      logger.error('Jira API Error:', error);
      throw error;
    }
  }

  // Helper to validate GitHub connection
  public async validateGitHubConnection(
    token: string,
    owner: string,
    repo: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Helper to get Asana Workspaces (to help user select)
  public async getAsanaWorkspaces(token: string): Promise<AsanaResource[]> {
    try {
      const response = await fetch('https://app.asana.com/api/1.0/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch workspaces');
      const data = await response.json();
      return data.data;
    } catch (error) {
      logger.error('Asana Workspaces Error:', error);
      throw error;
    }
  }

  // Helper to get Asana Projects (to help user select)
  public async getAsanaProjects(token: string, workspaceId?: string): Promise<AsanaResource[]> {
    try {
      let url = 'https://app.asana.com/api/1.0/projects';
      if (workspaceId) {
        url += `?workspace=${workspaceId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.data;
    } catch (error) {
      logger.error('Asana Projects Error:', error);
      throw error;
    }
  }
  // Helper to validate Jira connection
  public async validateJiraConnection(
    domain: string,
    email: string,
    token: string,
    projectKey: string
  ): Promise<boolean> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const auth = btoa(`${email}:${token}`);

    try {
      // Try to fetch project details to validate credentials and project key
      const response = await fetch(`https://${cleanDomain}/rest/api/3/project/${projectKey}`, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const issueTrackerService = new IssueTrackerService();
