import React from 'react';
import { Button, Input, Select, Checkbox, Modal, ModalFooter } from './components/common';
import './ComponentDemo.css';

export const ComponentDemo: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="demo-container">
      <header className="demo-header">
        <h1>VPAT Creator - Component Library</h1>
        <p>Accessible UI components built with Radix UI and WCAG 2.2 compliance</p>
      </header>

      <main className="demo-main">
        {/* Button Section */}
        <section className="demo-section">
          <h2>Button Component</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h3>Variants</h3>
              <div className="demo-group">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div className="demo-item">
              <h3>Sizes</h3>
              <div className="demo-group">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div className="demo-item">
              <h3>States</h3>
              <div className="demo-group">
                <Button loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>

            <div className="demo-item">
              <h3>With Icons</h3>
              <div className="demo-group">
                <Button
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  }
                  iconPosition="left"
                >
                  Add Item
                </Button>
                <Button
                  variant="secondary"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  }
                  iconPosition="right"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="demo-section">
          <h2>Input Component</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h3>Basic Input</h3>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                helperText="We'll never share your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <div className="demo-item">
              <h3>Required Input</h3>
              <Input
                label="Username"
                placeholder="Choose a username"
                required
                helperText="Must be unique"
              />
            </div>

            <div className="demo-item">
              <h3>Error State</h3>
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
              />
            </div>

            <div className="demo-item">
              <h3>With Icons</h3>
              <Input
                label="Search"
                placeholder="Search components..."
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M12 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Select Section */}
        <section className="demo-section">
          <h2>Select Component</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h3>Basic Select</h3>
              <Select
                label="Conformance Level"
                placeholder="Select level..."
                value={selectValue}
                onValueChange={setSelectValue}
                options={[
                  { value: 'a', label: 'Level A' },
                  { value: 'aa', label: 'Level AA' },
                  { value: 'aaa', label: 'Level AAA' },
                ]}
                helperText="Choose WCAG conformance level"
              />
            </div>

            <div className="demo-item">
              <h3>Required Select</h3>
              <Select
                label="Browser"
                placeholder="Select browser..."
                required
                options={[
                  { value: 'chrome', label: 'Google Chrome' },
                  { value: 'firefox', label: 'Mozilla Firefox' },
                  { value: 'safari', label: 'Safari' },
                  { value: 'edge', label: 'Microsoft Edge' },
                ]}
              />
            </div>

            <div className="demo-item">
              <h3>Error State</h3>
              <Select
                label="Assistive Technology"
                options={[
                  { value: 'jaws', label: 'JAWS' },
                  { value: 'nvda', label: 'NVDA' },
                  { value: 'voiceover', label: 'VoiceOver' },
                ]}
                error="Please select an assistive technology"
              />
            </div>

            <div className="demo-item">
              <h3>With Disabled Option</h3>
              <Select
                label="Operating System"
                options={[
                  { value: 'windows', label: 'Windows' },
                  { value: 'macos', label: 'macOS' },
                  { value: 'linux', label: 'Linux' },
                  { value: 'ios', label: 'iOS (Coming Soon)', disabled: true },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Checkbox Section */}
        <section className="demo-section">
          <h2>Checkbox Component</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h3>Basic Checkbox</h3>
              <Checkbox
                label="Enable keyboard navigation testing"
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
                helperText="Test all interactive elements with keyboard only"
              />
            </div>

            <div className="demo-item">
              <h3>Required Checkbox</h3>
              <Checkbox
                label="I agree to the testing guidelines"
                required
                helperText="You must agree to continue"
              />
            </div>

            <div className="demo-item">
              <h3>Error State</h3>
              <Checkbox
                label="Include automated tests"
                error="This option is required for compliance"
              />
            </div>

            <div className="demo-item">
              <h3>Disabled Checkbox</h3>
              <Checkbox label="Feature not available" disabled />
            </div>
          </div>
        </section>

        {/* Modal Section */}
        <section className="demo-section">
          <h2>Modal Component</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h3>Basic Modal</h3>
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
              <Modal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Create New Project"
                description="Enter the details for your new VPAT project"
                size="md"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input label="Project Name" placeholder="My Accessibility Project" required />
                  <Input
                    label="Product Name"
                    placeholder="Product being tested"
                    required
                  />
                  <Select
                    label="Conformance Level"
                    options={[
                      { value: 'a', label: 'Level A' },
                      { value: 'aa', label: 'Level AA' },
                      { value: 'aaa', label: 'Level AAA' },
                    ]}
                    required
                  />
                </div>
                <ModalFooter>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>Create Project</Button>
                </ModalFooter>
              </Modal>
            </div>
          </div>
        </section>
      </main>

      <footer className="demo-footer">
        <p>
          Built with React, TypeScript, Radix UI • WCAG 2.2 AAA Compliant • Keyboard
          Navigable
        </p>
      </footer>
    </div>
  );
};
