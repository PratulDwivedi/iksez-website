export interface ComplianceDocument {
  title: string;
  slug: string;
  description: string;
  fileUrl: string;
  fileName: string;
  publishedLabel: string;
}

// Kept behind a small data boundary so this catalog can later be replaced by
// a public documents RPC without changing the page or its URLs.
export const complianceDocuments: ComplianceDocument[] = [
  {
    title: "EC Compliance Report",
    slug: "ec-compliance-report-2025",
    description: "Environmental clearance compliance report for 2025.",
    fileUrl: "/images/EC-Compliance-Report-2025.pdf",
    fileName: "EC-Compliance-Report-2025.pdf",
    publishedLabel: "2025 report",
  },
  {
    title: "Environment Clearance",
    slug: "environment-clearance",
    description: "Environment clearance documentation for IFFCO Kisan SEZ.",
    fileUrl: "/images/iksez-EC-complains-enviroment.pdf",
    fileName: "iksez-EC-complains-enviroment.pdf",
    publishedLabel: "Official document",
  },
];