import { useState, useEffect } from 'react';
import { Button, Input } from '../common';
import { createSnapshot, getSnapshots, restoreSnapshot, deleteSnapshot } from '../../services/database';
import type { Project } from '../../models/types';
import { toast } from '../../store/toast-store';
import './VersionHistoryDialog.css';

interface VersionHistoryDialogProps {
  onClose: () => void;
  onRestore: () => void; // Callback to trigger reload of current audit
}

export function VersionHistoryDialog({ onClose, onRestore }: VersionHistoryDialogProps) {
  const [snapshots, setSnapshots] = useState<Project[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      setIsLoading(true);
      const list = await getSnapshots();
      setSnapshots(list);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!newSnapshotName.trim()) return;

    try {
      setIsCreating(true);
      await createSnapshot(newSnapshotName);
      toast.success('Snapshot created successfully');
      setNewSnapshotName('');
      await loadSnapshots();
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (snapshot: Project) => {
    if (!window.confirm(`Are you sure you want to restore "${snapshot.name}"? \n\n⚠️ This will overwrite your current progress! Make sure to save a snapshot of your current work first if needed.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await restoreSnapshot(snapshot.id);
      toast.success('Version restored successfully');
      onRestore(); // Trigger parent reload
      onClose();
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      toast.error('Failed to restore version');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this snapshot? This cannot be undone.')) {
      return;
    }

    try {
      await deleteSnapshot(id);
      toast.success('Snapshot deleted');
      await loadSnapshots();
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      toast.error('Failed to delete snapshot');
    }
  };

  return (
    <div className="version-history-dialog">
      <div 
        className="version-history-dialog__overlay" 
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close dialog"
      />

      <div className="version-history-dialog__content" role="dialog" aria-modal="true">
        <div className="version-history-dialog__header">
          <h2>🕒 Version History</h2>
          <button className="version-history-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="version-history-dialog__body">
          <div className="create-snapshot-section">
            <h3>Save Current Version</h3>
            <div className="create-snapshot-form">
              <div style={{ flex: 1 }}>
                <Input
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  placeholder="e.g., Phase 1 Complete"
                  fullWidth
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleCreateSnapshot}
                disabled={!newSnapshotName.trim() || isCreating}
              >
                {isCreating ? 'Saving...' : 'Save Snapshot'}
              </Button>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#334155' }}>Saved Versions</h3>
          
          {isLoading && snapshots.length === 0 ? (
            <div className="workflow-loading">Loading history...</div>
          ) : snapshots.length === 0 ? (
            <div className="empty-state">
              No saved versions yet. Create a snapshot to back up your work.
            </div>
          ) : (
            <div className="version-history-list">
              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="version-item">
                  <div className="version-info">
                    <h4>{snapshot.name}</h4>
                    <p className="version-date">
                      {new Date(snapshot.modifiedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="version-actions">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleRestore(snapshot)}
                      title="Restore this version (Overwrites current)"
                    >
                      Restore
                    </Button>
                    <Button 
                      variant="error" 
                      size="sm" 
                      onClick={() => handleDelete(snapshot.id)}
                      title="Delete snapshot"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="version-history-dialog__footer" style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
