import React from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SelectComponent as Select } from '../common/Select';
import { ComponentInfo } from './ComponentInfo';
import type { TeamMember, UITestResult, TestingScheduleItem } from '../../models/types';
import './TestingWorkflow.css';

interface TestingSidebarProps {
  showComponentInfo: boolean;
  onToggleComponentInfo: (show: boolean) => void;
  onShowTeamManagement: () => void;

  searchQuery: string;
  onSearchChange: (query: string) => void;

  groupBy: 'none' | 'status' | 'level';
  onGroupByChange: (group: 'none' | 'status' | 'level') => void;

  filterAssignedToMe: boolean;
  onFilterAssignedToMeChange: (checked: boolean) => void;

  filterUntestedOnly: boolean;
  onFilterUntestedOnlyChange: (checked: boolean) => void;

  teamMembers: TeamMember[];
  results: Map<string, UITestResult>;
  schedule: TestingScheduleItem[];
  currentUser: { id: string };

  expandedGroups: Set<string>;
  onToggleGroup: (group: string) => void;

  currentIndex: number;
  onJumpToSC: (index: number) => void;

  selectedComponentType: string;
  onSelectComponentType: (type: string) => void;
}

export const TestingSidebar: React.FC<TestingSidebarProps> = ({
  showComponentInfo,
  onToggleComponentInfo,
  onShowTeamManagement,
  searchQuery,
  onSearchChange,
  groupBy,
  onGroupByChange,
  filterAssignedToMe,
  onFilterAssignedToMeChange,
  filterUntestedOnly,
  onFilterUntestedOnlyChange,
  teamMembers,
  results,
  schedule,
  currentUser,
  expandedGroups,
  onToggleGroup,
  currentIndex,
  onJumpToSC,
  selectedComponentType,
  onSelectComponentType,
}) => {
  if (showComponentInfo) {
    return (
      <aside className="workflow-sidebar">
        <div className="sidebar-header">
          <h3>Component Testing Guide</h3>
          <Button onClick={() => onToggleComponentInfo(false)} size="sm" variant="secondary">
            ← Back to List
          </Button>
        </div>
        <Select
          label="Select Component Type"
          value={selectedComponentType}
          onValueChange={onSelectComponentType}
          options={[
            { value: '', label: 'Choose a component...' },
            { value: 'forms', label: '📝 Forms & Inputs' },
            { value: 'images', label: '🖼️ Images & Graphics' },
            { value: 'navigation', label: '🧭 Navigation & Menus' },
            { value: 'links', label: '🔗 Links & Hyperlinks' },
            { value: 'buttons', label: '🔘 Buttons & Controls' },
            { value: 'headings', label: '📑 Headings & Structure' },
            { value: 'tables', label: '📊 Data Tables' },
            { value: 'media', label: '🎬 Audio & Video' },
            { value: 'color-contrast', label: '🎨 Color & Contrast' },
            { value: 'keyboard', label: '⌨️ Keyboard Navigation' },
            { value: 'aria', label: '🎭 ARIA & Custom Widgets' },
          ]}
          fullWidth
        />
        <div className="component-info-container">
          <ComponentInfo componentType={selectedComponentType} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="workflow-sidebar">
      <div className="sidebar-header">
        <div className="flex justify-between items-center w-full">
          <h3>Success Criteria List</h3>
          <Button
            onClick={onShowTeamManagement}
            size="sm"
            variant="secondary"
            title="Manage team members"
            icon="👥"
          >
            Team
          </Button>
        </div>

        <div className="w-full">
          <Input
            placeholder="🔍 Search criteria..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => onToggleComponentInfo(true)}
              size="sm"
              variant="secondary"
              title="View component testing guide"
              className="flex-1"
              icon="📚"
            >
              Guide
            </Button>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-xs text-gray-600 font-medium">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value as 'none' | 'status' | 'level')}
                className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-6"
              >
                <option value="none">None</option>
                <option value="status">Status</option>
                <option value="level">Level</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            {teamMembers.length > 0 && (
              <label
                className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-gray-50 border border-gray-200 transition-colors"
                title="Show only tasks assigned to me"
              >
                <input
                  type="checkbox"
                  checked={filterAssignedToMe}
                  onChange={(e) => onFilterAssignedToMeChange(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>My Tasks</span>
              </label>
            )}
            <label
              className="flex items-center gap-2 text-xs cursor-pointer px-2 py-1.5 rounded hover:bg-gray-50 border border-gray-200 transition-colors"
              title="Show only untested items"
            >
              <input
                type="checkbox"
                checked={filterUntestedOnly}
                onChange={(e) => onFilterUntestedOnlyChange(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Untested Only</span>
            </label>
          </div>
        </div>
      </div>

      {results.size > 0 && (
        <div className="sidebar-info">
          💾 Click "Save & Exit" to save your progress and resume later
        </div>
      )}

      <div className="sc-list">
        {(() => {
          const filteredSchedule = schedule.filter((sc) => {
            const result = results.get(sc.id);
            if (filterAssignedToMe && result?.assignedTo !== currentUser.id) return false;
            if (filterUntestedOnly && result && result.status !== 'Not Tested') return false;

            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                sc.scNumber.toLowerCase().includes(query) ||
                sc.scTitle.toLowerCase().includes(query)
              );
            }
            return true;
          });

          if (filteredSchedule.length === 0) {
            return <div className="p-4 text-center text-gray-500">No matching criteria found</div>;
          }

          if (groupBy !== 'none') {
            const groups: Record<string, typeof schedule> = {};

            // Initialize groups based on type to ensure order
            if (groupBy === 'status') {
              groups['Not Tested'] = [];
              groups['Supports'] = [];
              groups['Partially Supports'] = [];
              groups['Does Not Support'] = [];
              groups['Not Applicable'] = [];
            } else if (groupBy === 'level') {
              groups['A'] = [];
              groups['AA'] = [];
              groups['AAA'] = [];
            }

            filteredSchedule.forEach((sc) => {
              let key = '';
              if (groupBy === 'status') {
                key = results.get(sc.id)?.status || 'Not Tested';
              } else {
                key = sc.scLevel;
              }

              if (!groups[key]) groups[key] = [];
              groups[key].push(sc);
            });

            return Object.entries(groups).map(([groupName, items]) => {
              if (items.length === 0) return null;

              const isExpanded = expandedGroups.has(groupName);

              const statusColors: Record<string, string> = {
                'Not Tested': 'bg-gray-100 text-gray-700',
                Supports: 'bg-green-100 text-green-800',
                'Partially Supports': 'bg-yellow-100 text-yellow-800',
                'Does Not Support': 'bg-red-100 text-red-800',
                'Not Applicable': 'bg-gray-100 text-gray-500',
                A: 'bg-blue-100 text-blue-800',
                AA: 'bg-indigo-100 text-indigo-800',
                AAA: 'bg-purple-100 text-purple-800',
              };

              return (
                <div key={groupName} className="mb-4">
                  <button
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 ${statusColors[groupName] || 'bg-gray-100'}`}
                    onClick={() => onToggleGroup(groupName)}
                  >
                    <span>
                      {groupName} ({items.length})
                    </span>
                    <span>{isExpanded ? '▼' : '▶'}</span>
                  </button>

                  {isExpanded &&
                    items.map((sc) => {
                      const index = schedule.findIndex((s) => s.id === sc.id);
                      const result = results.get(sc.id);
                      const assignee = teamMembers.find((m) => m.id === result?.assignedTo);

                      return (
                        <button
                          key={sc.id}
                          className={`sc-list-item ${index === currentIndex ? 'active' : ''} ${
                            results.has(sc.id) ? 'tested' : ''
                          }`}
                          onClick={() => onJumpToSC(index)}
                        >
                          <span className="sc-number">{sc.scNumber}</span>
                          <div className="flex-1 text-left overflow-hidden">
                            <span className="sc-title block truncate">{sc.scTitle}</span>
                            {assignee && (
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <span
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                  style={{ backgroundColor: assignee.color }}
                                >
                                  {assignee.initials}
                                </span>
                                {assignee.name}
                              </span>
                            )}
                          </div>
                          {results.has(sc.id) && <span className="sc-check">✓</span>}
                        </button>
                      );
                    })}
                </div>
              );
            });
          }

          return filteredSchedule.map((sc) => {
            const index = schedule.findIndex((s) => s.id === sc.id);
            const result = results.get(sc.id);
            const assignee = teamMembers.find((m) => m.id === result?.assignedTo);

            return (
              <button
                key={sc.id}
                className={`sc-list-item ${index === currentIndex ? 'active' : ''} ${
                  results.has(sc.id) ? 'tested' : ''
                }`}
                onClick={() => onJumpToSC(index)}
              >
                <span className="sc-number">{sc.scNumber}</span>
                <div className="flex-1 text-left overflow-hidden">
                  <span className="sc-title block truncate">{sc.scTitle}</span>
                  {assignee && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: assignee.color }}
                      >
                        {assignee.initials}
                      </span>
                      {assignee.name}
                    </span>
                  )}
                </div>
                {results.has(sc.id) && <span className="sc-check">✓</span>}
              </button>
            );
          });
        })()}
      </div>
    </aside>
  );
};
