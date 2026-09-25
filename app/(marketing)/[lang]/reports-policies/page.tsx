import type { Metadata } from "next";
import { ExternalLink, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import { complianceDocuments } from "@/lib/complianceDocuments";

export const metadata: Metadata = {
  title: "Reports & Policies | IFFCO Kisan SEZ",
  description: "Annual reports, CSR information, policies and statutory documents from IFFCO Kisan SEZ.",
};

const GROUPS = [
  { id: "annual-reports", title: "Annual Reports", text: "Year-wise annual reports and organisational disclosures." },
  { id: "csr", title: "CSR", text: "Community initiatives and social responsibility disclosures." },
  { id: "policies", title: "Policies", text: "Policies and governance documents for stakeholders." },
];

export default function ReportsPoliciesPage() {
  return (
    <>
      <PageHero
        title="Reports & Policies"
        subtitle="Official reports, policies and disclosures from IFFCO Kisan SEZ"
        banner="/images/about-us-banner.webp"
      />
      <section className="section">
        <div className="container container--narrow">
          <div className="grid grid--3">
            {GROUPS.map((group) => (
              <article className="card card--flat" id={group.id} key={group.id}>
                <div className="card__icon"><FileText /></div>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
              </article>
            ))}
          </div>

          <div className="section-head mt-8">
            <div>
              <span className="eyebrow">Published documents</span>
              <h2>Compliance &amp; statutory records</h2>
            </div>
          </div>
          <div className="compliance-list">
            {complianceDocuments.map((document) => (
              <article className="compliance-item" key={document.slug}>
                <div className="compliance-item__icon" aria-hidden="true"><FileText /></div>
                <div className="compliance-item__body">
                  <span className="compliance-item__meta">PDF · {document.publishedLabel}</span>
                  <h3>{document.title}</h3>
                  <p>{document.description}</p>
                  <a className="btn btn--brand btn--sm" href={document.fileUrl} target="_blank" rel="noopener">
                    <ExternalLink /> View PDF in new tab
                  </a>
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
