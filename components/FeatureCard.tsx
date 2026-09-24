import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export default function FeatureCard({ title, icon, children, className = "", actions }: FeatureCardProps) {
  return (
    <article className={`card feature-card ${className}`.trim()}>
      {icon && <div className="feature-card__icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      <p>{children}</p>
      {actions && <div className="card__foot">{actions}</div>}
    </article>
  );
}
