import type { Metadata } from "next";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { complianceDocuments } from "@/lib/complianceDocuments";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getDocument(slug: string) {
  return complianceDocuments.find((document) => document.slug === slug);
}

export function generateStaticParams() {
  return complianceDocuments.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getDocument(slug);
  if (!document) return { title: "Document Not Found | IFFCO Kisan SEZ" };

  return {
    title: `${document.title} | IFFCO Kisan SEZ`,
    description: document.description,
    alternates: { canonical: `/compliances/${document.slug}/` },
  };
}

export default async function ComplianceDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = getDocument(slug);
  if (!document) notFound();

  return (
    <>
      <PageHero title={document.title} subtitle="IFFCO Kisan SEZ compliance document" banner="/images/about-us-banner.webp" />

      <section className="section">
        <div className="container container--narrow">
          <Link href="/compliances/" className="blog-post__back">
            <ArrowLeft /> Back to Compliance Documents
          </Link>

          <article className="compliance-detail">
            <div className="compliance-item__icon" aria-hidden="true">
              <FileText />
            </div>
            <span className="compliance-item__meta">PDF · {document.publishedLabel}</span>
            <h1>{document.title}</h1>
            <p className="lead">{document.description}</p>
            <div className="compliance-item__actions">
              <a className="btn btn--brand" href={document.fileUrl} target="_blank" rel="noopener">
                <ExternalLink /> View document
              </a>
              <a className="btn btn--outline" href={document.fileUrl} download={document.fileName}>
                <Download /> Download
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}