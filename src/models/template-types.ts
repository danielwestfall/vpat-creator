// VPAT Template Types

export interface VPATTemplateHeader {
  companyName: string;
  companyLogo?: string; // Base64 encoded image or URL
  reportTitle: string;
  includeDate: boolean;
  includePageNumbers: boolean;
  customText?: string; // Additional header text
}

export interface VPATTemplateSections {
  executiveSummary: {
    enabled: boolean;
    title: string;
    defaultContent?: string;
  };
  productInfo: {
    enabled: boolean;
    title: string;
  };
  evaluationMethods: {
    enabled: boolean;
    title: string;
  };
  applicableCriteria: {
    enabled: boolean;
    title: string;
  };
  legalDisclaimer: {
    enabled: boolean;
    content: string;
  };
}

export interface VPATTemplateStyling {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'Arial' | 'Helvetica' | 'Times New Roman' | 'Calibri' | 'Georgia';
  fontSize: number; // Base font size in pt
  tableStyle: 'bordered' | 'striped' | 'minimal';
  headerStyle: 'bold' | 'background' | 'both';
}

export interface VPATTemplateColumns {
  criterionNumber: boolean;
  criterionName: boolean;
  levelColumn: boolean;
  conformanceStatus: boolean;
  remarks: boolean;
  customColumns: Array<{
    id: string;
    name: string;
    width?: number;
  }>;
}

export interface VPATTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  isDefault: boolean;
  createdAt: Date;
  modifiedAt: Date;

  header: VPATTemplateHeader;
  sections: VPATTemplateSections;
  styling: VPATTemplateStyling;
  columns: VPATTemplateColumns;
}

export interface TemplateImportData {
  formatVersion: string;
  template: Omit<VPATTemplate, 'id' | 'createdAt' | 'modifiedAt'>;
}

// Default template configurations
export const DEFAULT_TEMPLATES: Omit<VPATTemplate, 'id' | 'createdAt' | 'modifiedAt'>[] = [
  {
    name: 'Standard VPAT 2.5',
    description: 'Official VPAT 2.5 format with all standard sections',
    version: '2.5',
    isDefault: true,
    header: {
      companyName: 'Your Company Name',
      reportTitle: 'Voluntary Product Accessibility Template (VPAT®)',
      includeDate: true,
      includePageNumbers: true,
    },
    sections: {
      executiveSummary: {
        enabled: true,
        title: 'Executive Summary',
      },
      productInfo: {
        enabled: true,
        title: 'Product Information',
      },
      evaluationMethods: {
        enabled: true,
        title: 'Evaluation Methods Used',
      },
      applicableCriteria: {
        enabled: true,
        title: 'Applicable Standards/Guidelines',
      },
      legalDisclaimer: {
        enabled: true,
        content:
          'This document is provided for information purposes only and the contents hereof are subject to change without notice. This document is not warranted to be error-free, nor subject to any other warranties or conditions.',
      },
    },
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Arial',
      fontSize: 11,
      tableStyle: 'bordered',
      headerStyle: 'both',
    },
    columns: {
      criterionNumber: true,
      criterionName: true,
      levelColumn: true,
      conformanceStatus: true,
      remarks: true,
      customColumns: [],
    },
  },
  {
    name: 'Minimal Report',
    description: 'Compact format with essential information only',
    version: '1.0',
    isDefault: false,
    header: {
      companyName: 'Your Company Name',
      reportTitle: 'Accessibility Conformance Report',
      includeDate: true,
      includePageNumbers: false,
    },
    sections: {
      executiveSummary: {
        enabled: false,
        title: 'Executive Summary',
      },
      productInfo: {
        enabled: true,
        title: 'Product Information',
      },
      evaluationMethods: {
        enabled: false,
        title: 'Evaluation Methods Used',
      },
      applicableCriteria: {
        enabled: true,
        title: 'Standards Evaluated',
      },
      legalDisclaimer: {
        enabled: false,
        content: '',
      },
    },
    styling: {
      primaryColor: '#059669',
      secondaryColor: '#6b7280',
      fontFamily: 'Calibri',
      fontSize: 10,
      tableStyle: 'minimal',
      headerStyle: 'bold',
    },
    columns: {
      criterionNumber: true,
      criterionName: true,
      levelColumn: false,
      conformanceStatus: true,
      remarks: true,
      customColumns: [],
    },
  },
  {
    name: 'Detailed Corporate',
    description: 'Professional format with all sections and branding',
    version: '1.0',
    isDefault: false,
    header: {
      companyName: 'Your Company Name',
      reportTitle: 'Accessibility Conformance Report - VPAT® 2.5',
      includeDate: true,
      includePageNumbers: true,
      customText: 'Accessibility Excellence Program',
    },
    sections: {
      executiveSummary: {
        enabled: true,
        title: 'Executive Summary',
        defaultContent:
          'This report documents the accessibility conformance evaluation results for our product.',
      },
      productInfo: {
        enabled: true,
        title: 'Product Details',
      },
      evaluationMethods: {
        enabled: true,
        title: 'Testing Methodology',
      },
      applicableCriteria: {
        enabled: true,
        title: 'Applicable Standards and Guidelines',
      },
      legalDisclaimer: {
        enabled: true,
        content:
          'This Voluntary Product Accessibility Template® (VPAT®) is provided for information purposes only. The information contained in this document is subject to change without notice and does not represent a commitment on the part of the vendor.',
      },
    },
    styling: {
      primaryColor: '#7c3aed',
      secondaryColor: '#475569',
      fontFamily: 'Georgia',
      fontSize: 11,
      tableStyle: 'striped',
      headerStyle: 'both',
    },
    columns: {
      criterionNumber: true,
      criterionName: true,
      levelColumn: true,
      conformanceStatus: true,
      remarks: true,
      customColumns: [
        { id: 'impact', name: 'Impact Level', width: 100 },
        { id: 'remediation', name: 'Remediation Plan', width: 150 },
      ],
    },
  },
];
