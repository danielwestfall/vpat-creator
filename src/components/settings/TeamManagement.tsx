import React from 'react';
import { toast } from '../../store/toast-store';
import { Button, Input, Select } from '../common';
import type { TeamMember } from '../../models/types';
import {
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamMembers,
} from '../../services/database';

interface TeamManagementProps {
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh parent state
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onClose, onUpdate }) => {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Form state
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<'Tester' | 'Reviewer' | 'Lead'>('Tester');
  const [email, setEmail] = React.useState('');
  const [initials, setInitials] = React.useState('');
  const [color, setColor] = React.useState('#6366f1'); // Default indigo

  const COLORS = [
    '#6366f1', // Indigo
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#64748b', // Slate
  ];

  React.useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const team = await getTeamMembers();
      setMembers(team);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setRole('Tester');
    setEmail('');
    setInitials('');
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name || !initials) return;

    try {
      const memberData: TeamMember = {
        id: editingId || crypto.randomUUID(),
        name,
        role,
        email,
        initials: initials.toUpperCase().slice(0, 2),
        color,
      };

      if (editingId) {
        await updateTeamMember(memberData);
      } else {
        await addTeamMember(memberData);
      }

      await loadMembers();
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Failed to save team member:', error);
      toast.error('Failed to save team member. Please try again.');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setName(member.name);
    setRole(member.role);
    setEmail(member.email || '');
    setInitials(member.initials);
    setColor(member.color);
    setEditingId(member.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeTeamMember(id);
        await loadMembers();
        onUpdate();
      } catch (error) {
        console.error('Failed to remove team member:', error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manage Team Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6">
          {!isAdding ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Add team members to assign them to specific success criteria.
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsAdding(true);
                  }}
                  variant="primary"
                  size="sm"
                >
                  + Add Member
                </Button>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No team members yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">
                            {member.role} {member.email && `• ${member.email}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(member)} variant="secondary" size="sm">
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(member.id)}
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId ? 'Edit Member' : 'Add New Member'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Auto-generate initials if empty
                    if (!initials && e.target.value) {
                      const parts = e.target.value.split(' ');
                      if (parts.length >= 2) {
                        setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
                      } else if (parts.length === 1) {
                        setInitials(parts[0].slice(0, 2).toUpperCase());
                      }
                    }
                  }}
                  required
                  fullWidth
                />
                <Input
                  label="Initials (2 chars)"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 2))}
                  required
                  maxLength={2}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Role"
                  value={role}
                  onValueChange={(v) => setRole(v as any)}
                  options={[
                    { value: 'Tester', label: 'Tester' },
                    { value: 'Reviewer', label: 'Reviewer' },
                    { value: 'Lead', label: 'Lead' },
                  ]}
                  fullWidth
                />
                <Input
                  label="Email (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  fullWidth
                />
              </div>

              <div>
                <span
                  id="avatar-color-label"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Avatar Color
                </span>
                <div className="flex gap-2" role="radiogroup" aria-labelledby="avatar-color-label">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={color === c}
                      aria-label={`Color ${c}`}
                      className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="primary" disabled={!name || !initials}>
                  {editingId ? 'Save Changes' : 'Add Member'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
