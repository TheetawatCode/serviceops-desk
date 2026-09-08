"use client";

import { Inbox, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useDemoRole } from "@/components/role-provider";
import { SlaBadge, StatusBadge } from "@/components/status-badge";
import { formatDateTime, humanize, priorityRank } from "@/lib/format";
import type { JobListItem, JobStatus } from "@/lib/job-types";

const statusOptions: Array<JobStatus | "ALL"> = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function PriorityLabel({ priority }: { priority: JobListItem["priority"] }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <span aria-hidden="true" />
      {humanize(priority)}
    </span>
  );
}

function MobileJobCard({ job }: { job: JobListItem }) {
  return (
    <article className="mobile-job-card">
      <div className="job-card-topline">
        <Link href={`/jobs/${job.reference}`} className="job-reference">
          {job.reference}
        </Link>
        <PriorityLabel priority={job.priority} />
      </div>
      <h2>
        <Link href={`/jobs/${job.reference}`}>{job.title}</Link>
      </h2>
      <div className="job-card-badges">
        <StatusBadge status={job.status} />
        <SlaBadge dueAt={job.slaDueAt} status={job.status} />
      </div>
      <dl className="job-card-meta">
        <div>
          <dt>Assignee</dt>
          <dd>{job.assignee?.name ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>SLA due</dt>
          <dd>{formatDateTime(job.slaDueAt)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function JobsView({ jobs }: { jobs: JobListItem[] }) {
  const { identity } = useDemoRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");

  const visibleJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs
      .filter((job) => status === "ALL" || job.status === status)
      .filter((job) => {
        if (!normalizedQuery) return true;
        return [job.reference, job.title, job.category, job.assignee?.name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        const priorityDifference = priorityRank[b.priority] - priorityRank[a.priority];
        if (priorityDifference) return priorityDifference;
        return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime();
      });
  }, [jobs, query, status]);

  const scopeLabel =
    identity.role === "MANAGER"
      ? "All service jobs"
      : identity.role === "TECHNICIAN"
        ? "Jobs assigned to you"
        : "Jobs submitted by you";

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Service jobs</h1>
          <p>{scopeLabel}. Review ownership, progress, and SLA timing.</p>
        </div>
        <div className="page-header-actions">
          {identity.role !== "TECHNICIAN" ? (
            <Link href="/jobs/new" className="button-primary">
              <Plus size={16} aria-hidden="true" />
              New service job
            </Link>
          ) : null}
          <div className="result-count" aria-live="polite">
            <strong>{visibleJobs.length}</strong>
            <span>{visibleJobs.length === 1 ? "job" : "jobs"}</span>
          </div>
        </div>
      </header>

      <section className="filters" aria-label="Filter service jobs">
        <label className="search-field">
          <span className="sr-only">Search service jobs</span>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, title, category…"
          />
        </label>
        <label className="select-field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as JobStatus | "ALL")}
          >
            {statusOptions.map((option) => (
              <option value={option} key={option}>
                {option === "ALL" ? "All statuses" : humanize(option)}
              </option>
            ))}
          </select>
        </label>
      </section>

      {visibleJobs.length ? (
        <>
          <div className="table-card">
            <table>
              <caption className="sr-only">
                Service jobs available to {identity.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Status</th>
                  <th scope="col">Assignee</th>
                  <th scope="col">SLA</th>
                  <th scope="col">Due</th>
                </tr>
              </thead>
              <tbody>
                {visibleJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link href={`/jobs/${job.reference}`} className="job-cell-link">
                        <span className="job-reference">{job.reference}</span>
                        <strong>{job.title}</strong>
                        <small>{humanize(job.category)}</small>
                      </Link>
                    </td>
                    <td>
                      <PriorityLabel priority={job.priority} />
                    </td>
                    <td>
                      <StatusBadge status={job.status} />
                    </td>
                    <td>
                      <span className="assignee-cell">
                        <UserRound size={15} aria-hidden="true" />
                        {job.assignee?.name ?? "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <SlaBadge dueAt={job.slaDueAt} status={job.status} />
                    </td>
                    <td className="date-cell">{formatDateTime(job.slaDueAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-job-list">
            {visibleJobs.map((job) => (
              <MobileJobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <Inbox size={24} />
          </span>
          <h2>No jobs match this view</h2>
          <p>Try a different status or clear the search to see the available queue.</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setQuery("");
              setStatus("ALL");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
