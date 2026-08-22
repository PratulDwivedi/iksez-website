import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { complianceDocuments } from "@/lib/complianceDocuments";

export const metadata: Metadata = {
  title: "Compliances | IFFCO Kisan SEZ",
  description: "Environmental compliance reports and clearance documents from IFFCO Kisan SEZ.",
  alternates: { canonical: "/compliances/" },
};

export default function CompliancesPage() {
  return (
    <>
      <PageHero
        title="Compliance Documents"
        subtitle="Environmental reports and statutory clearances from IFFCO Kisan SEZ"
        banner="/images/about-us-banner.webp"
      />

      <section className="section">
        <div className="container container--narrow">
          <div className="compliance-intro">
            <span className="eyebrow">Documents &amp; disclosures</span>
            <h2>Environmental compliance</h2>
            <p className="lead">
              Access the latest reports and official clearance documentation for the IFFCO Kisan SEZ project.
            </p>
          </div>

          <div className="compliance-list">
            {complianceDocuments.map((document) => (
              <article className="compliance-item" key={document.slug}>
                <div className="compliance-item__icon" aria-hidden="true">
                  <FileText />
                </div>
                <div className="compliance-item__body">
                  <span className="compliance-item__meta">PDF · {document.publishedLabel}</span>
                  <h3>{document.title}</h3>
                  <p>{document.description}</p>
                  <div className="compliance-item__actions">
                    <Link className="btn btn--ghost btn--sm" href={`/compliances/${document.slug}/`}>
                      Details
                    </Link>
                    <a className="btn btn--brand btn--sm" href={document.fileUrl} target="_blank" rel="noopener">
                      <ExternalLink /> View document
                    </a>
                    <a className="btn btn--outline btn--sm" href={document.fileUrl} download={document.fileName}>
                      <Download /> Download
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}