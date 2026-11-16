"use client";
import type { ReactNode } from "react";
import {
  CaretDown,
  Info,
  ArrowSquareOut,
  ShieldCheck,
} from "@phosphor-icons/react";
export function Panel({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <h2>
        {icon}
        {title}
      </h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}
export function Expandable({
  title,
  subtitle,
  icon,
  children,
  open = false,
  status,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  open?: boolean;
  status?: string;
}) {
  return (
    <details className="expandable" open={open}>
      <summary>
        {icon}
        <span>
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
        {status && <Status label={status} />}
        <CaretDown className="chevron" />
      </summary>
      <div className="details-body">{children}</div>
    </details>
  );
}
export function Status({ label }: { label: string }) {
  return (
    <span className={`status ${label.includes("Needs") ? "warning" : ""}`}>
      {label}
    </span>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <Info size={26} />
      <span>{children}</span>
    </div>
  );
}
export function SourceLink({
  href,
  label = "NASA Source",
}: {
  href: string;
  label?: string;
}) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      <ArrowSquareOut size={21} aria-hidden="true" focusable="false" />
      <span>{label}</span>
    </a>
  );
}
export function EvidenceFooter() {
  return (
    <div className="evidence-footer">
      <ShieldCheck size={27} />
      <strong>Evidence before confidence.</strong>
      <span>NASA Space Apps Challenge</span>
    </div>
  );
}
