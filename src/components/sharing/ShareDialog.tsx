import { useState } from 'react';
import { Button, Input } from '../common';
import type { Project, TestResult, TeamMember } from '../../models/types';
import {
  generateSharePayload,
  shareViaEmail,
  shareViaWebAPI,
  copyToClipboard,
  downloadAuditFile,
  isWebShareSupported,
  generateImportInstructions,
} from '../../services/share-service';
import { toast } from '../../store/toast-store';
import './ShareDialog.css';

export interface ShareDialogProps {
  project: Project;
  results: TestResult[];
  teamMembers: TeamMember[];
  onClose: () => void;
}

export function ShareDialog({ project, results, teamMembers, onClose }: ShareDialogProps) {
  const [recipients, setRecipients] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);

  const payload = generateSharePayload(project, results, teamMembers);
  const supportsWebShare = isWebShareSupported();

  const handleEmailShare = async () => {
    try {
      setIsSharing(true);
      const recipientList = recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);
      
      await shareViaEmail(payload, recipientList, message);
      toast.success('Email client opened! JSON file downloaded.');
      onClose();
    } catch (error) {
      toast.error('Failed to share via email');
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleWebShare = async () => {
    try {
      setIsSharing(true);
      await shareViaWebAPI(payload);
      toast.success('Audit shared successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to share via Web Share API');
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard(payload);
      toast.success('Audit JSON copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error(error);
    }
  };

  const handleDownload = () => {
    try {
      downloadAuditFile(payload);
      toast.success('Audit file downloaded!');
    } catch (error) {
      toast.error('Failed to download audit');
      console.error(error);
    }
  };

  return (
    <div className="share-dialog">
      <div 
        className="share-dialog__overlay" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />

      <div className="share-dialog__content" role="dialog" aria-modal="true" aria-labelledby="share-dialog-title">
        <div className="share-dialog__header">
          <h2 id="share-dialog-title" className="share-dialog__title">
            📤 Share Audit
          </h2>
          <button className="share-dialog__close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <div className="share-dialog__body">
          {/* Audit Summary */}
          <div className="share-summary">
            <h3 className="share-summary__title">{project.name}</h3>
            <div className="share-summary__stats">
              <div className="share-stat">
                <span className="share-stat__label">Progress</span>
                <span className="share-stat__value">{payload.metadata.progressPercentage}%</span>
              </div>
              <div className="share-stat">
                <span className="share-stat__label">Tested</span>
                <span className="share-stat__value">
                  {payload.metadata.testedCount}/{payload.metadata.totalCriteria}
                </span>
              </div>
              <div className="share-stat">
                <span className="share-stat__label">Team Members</span>
                <span className="share-stat__value">{teamMembers.length}</span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="share-options">
            <h3 className="share-options__title">Choose Sharing Method</h3>

            {/* Native Web Share (if supported) */}
            {supportsWebShare && (
              <div className="share-option">
                <div className="share-option__info">
                  <div className="share-option__icon">📱</div>
                  <div>
                    <h4 className="share-option__name">Share via App</h4>
                    <p className="share-option__description">
                      Use your device's native sharing (email, messaging, etc.)
                    </p>
                  </div>
                </div>
                <Button onClick={handleWebShare} disabled={isSharing} variant="primary" size="sm">
                  Share
                </Button>
              </div>
            )}

            {/* Email Share */}
            <div className="share-option">
              <div className="share-option__info">
                <div className="share-option__icon">📧</div>
                <div>
                  <h4 className="share-option__name">Share via Email</h4>
                  <p className="share-option__description">Opens your email client with audit details</p>
                </div>
              </div>
            </div>
            <div className="share-option__form">
              <Input
                label="Recipients (comma-separated)"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="alice@example.com, bob@example.com"
                fullWidth
              />
              <Input
                label="Custom Message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please review the assigned test criteria..."
                fullWidth
              />
              <Button onClick={handleEmailShare} disabled={isSharing} variant="primary" size="sm" fullWidth>
                Open Email Client
              </Button>
            </div>

            {/* Copy to Clipboard */}
            <div className="share-option">
              <div className="share-option__info">
                <div className="share-option__icon">📋</div>
                <div>
                  <h4 className="share-option__name">Copy to Clipboard</h4>
                  <p className="share-option__description">Copy JSON data to paste in chat or document</p>
                </div>
              </div>
              <Button onClick={handleCopyToClipboard} variant="secondary" size="sm">
                Copy
              </Button>
            </div>

            {/* Download File */}
            <div className="share-option">
              <div className="share-option__info">
                <div className="share-option__icon">💾</div>
                <div>
                  <h4 className="share-option__name">Download & Share Manually</h4>
                  <p className="share-option__description">
                    Download JSON file to share via cloud storage (Drive, Dropbox, etc.)
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} variant="secondary" size="sm">
                Download
              </Button>
            </div>
          </div>

          {/* Import Instructions */}
          <div className="share-instructions">
            <h4 className="share-instructions__title">📥 Import Instructions for Recipients</h4>
            <pre className="share-instructions__text">{generateImportInstructions()}</pre>
          </div>
        </div>

        <div className="share-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
