import React, { useState } from 'react';
import { Modal, ModalFooter } from '../common/Modal';
import { Button } from '../common';
import { axeService, type AxeScanResult, type MappedResult } from '../../services/axe-service';
import { toast } from '../../store/toast-store';
import './AutomatedScanDialog.css';

interface AutomatedScanDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyResults: (results: MappedResult[]) => void;
}

export const AutomatedScanDialog: React.FC<AutomatedScanDialogProps> = ({
  open,
  onClose,
  onApplyResults,
}) => {
  const [htmlInput, setHtmlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AxeScanResult | null>(null);
  const [mappedResults, setMappedResults] = useState<MappedResult[]>([]);

  const handleScan = async () => {
    if (!htmlInput.trim()) {
      toast.error('Please enter HTML to scan');
      return;
    }

    setIsScanning(true);
    try {
      const result = await axeService.scanHtml(htmlInput);
      setScanResult(result);
      
      const mapped = axeService.mapResultsToWCAG(result);
      setMappedResults(mapped);
      
      if (result.violations.length === 0) {
        toast.success('No accessibility violations found!');
      } else {
        toast.warning(`Found ${result.violations.length} violations`);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Failed to run accessibility scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    onApplyResults(mappedResults);
    onClose();
    toast.success(`Applied results for ${mappedResults.length} criteria`);
  };

  // Group results by SC for display
  const groupedResults = mappedResults.reduce((acc, curr) => {
    if (!acc[curr.scNumber]) {
      acc[curr.scNumber] = [];
    }
    acc[curr.scNumber].push(curr);
    return acc;
  }, {} as Record<string, MappedResult[]>);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Automated Accessibility Scan"
      description="Paste HTML code to run an automated axe-core scan."
      size="lg"
      className="automated-scan-dialog"
    >
      <div className="scan-content">
        <div className="input-section">
          <label htmlFor="html-input" className="input-label">
            HTML Code to Test
          </label>
          <textarea
            id="html-input"
            className="html-input"
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="<div role='button'>Click me</div>"
            rows={10}
          />
        </div>

        {scanResult && (
          <div className="results-section">
            <div className="results-summary">
              <div className="result-stat error">
                <span className="count">{scanResult.violations.length}</span>
                <span className="label">Violations</span>
              </div>
              <div className="result-stat success">
                <span className="count">{scanResult.passes.length}</span>
                <span className="label">Passes</span>
              </div>
              <div className="result-stat neutral">
                <span className="count">{scanResult.incomplete.length}</span>
                <span className="label">Incomplete</span>
              </div>
            </div>

            {mappedResults.length > 0 ? (
              <div className="violations-list">
                <h4>Impact on Success Criteria</h4>
                {Object.entries(groupedResults).map(([scNumber, items]) => (
                  <div key={scNumber} className="violation-item">
                    <div className="violation-header">
                      <span className="sc-badge">{scNumber}</span>
                      <span className="status-badge fail">Does Not Support</span>
                    </div>
                    <ul className="violation-details">
                      {items.map((item, idx) => (
                        <li key={idx}>{item.reason}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : scanResult.violations.length > 0 ? (
              <div className="no-mapping-msg">
                Violations found but no direct WCAG mapping available in current configuration.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {!scanResult ? (
          <Button onClick={handleScan} loading={isScanning}>
            Run Scan
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setScanResult(null)}>
              Reset
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={mappedResults.length === 0}
              variant="primary"
            >
              Apply Results
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};
