import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  labels: { paginationLabel: string; previous: string; next: string };
}

export function BlogPagination({ currentPage, totalPages, buildHref, labels }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label={labels.paginationLabel} className="blog-pagination">
      <Link
        href={buildHref(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        rel="prev"
        className="blog-pagination__page blog-pagination__nav"
      >
        <ChevronLeft size={14} /> {labels.previous}
      </Link>

      {pageNumbers.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          className={`blog-pagination__page${p === currentPage ? ' is-active' : ''}`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildHref(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        rel="next"
        className="blog-pagination__page blog-pagination__nav"
      >
        {labels.next} <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
