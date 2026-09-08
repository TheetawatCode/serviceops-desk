"use client";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { SlaBadge, StatusBadge } from "@/components/status-badge";
import { formatDateTime, humanize } from "@/lib/format";
import type { JobActivityItem, JobDetail } from "@/lib/job-types";

function ActivityIcon({ type }: { type: JobActivityItem["type"] }) {
  if (type === "NOTE_ADDED") return <MessageSquareText size={16} />;
  if (type === "STATUS_CHANGED") return <CheckCircle2 size={16} />;
  return <CircleDot size={16} />;
}

export function JobDetailView({ job }: { job: JobDetail }) {
  return (
    <div className="page-stack detail-page">
      <Link href="/jobs" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to service jobs
      </Link>

      <header className="detail-header">
        <div>
          <p className="eyebrow">{job.reference}</p>
          <h1>{job.title}</h1>
          <div className="detail-badges">
            <StatusBadge status={job.status} />
            <SlaBadge dueAt={job.slaDueAt} status={job.status} />
          </div>
        </div>
        <p className="read-only-label">Read-only milestone</p>
      </header>

      <div className="detail-grid">
        <div className="detail-primary">
          <section className="content-card" aria-labelledby="description-heading">
            <p className="section-kicker">Request</p>
            <h2 id="description-heading">Service details</h2>
            <p className="description-copy">{job.description}</p>
          </section>

          <section className="content-card" aria-labelledby="activity-heading">
            <div className="section-heading-row">
              <div>
                <p className="section-kicker">History</p>
                <h2 id="activity-heading">Activity</h2>
              </div>
              <span>{job.activities.length} updates</span>
            </div>
            {job.activities.length ? (
              <ol className="activity-list">
                {job.activities.map((activity) => (
                  <li key={activity.id}>
                    <span className="activity-icon" aria-hidden="true">
                      <ActivityIcon type={activity.type} />
                    </span>
                    <div>
                      <p>
                        <strong>{activity.author.name}</strong>{" "}
                        {humanize(activity.type).toLowerCase()}
                      </p>
                      {activity.fromValue || activity.toValue ? (
                        <p className="activity-change">
                          {activity.fromValue ? humanize(activity.fromValue) : "Unassigned"}
                          <span aria-hidden="true"> → </span>
                          <span className="sr-only"> changed to </span>
                          {activity.toValue ? humanize(activity.toValue) : "Unassigned"}
                        </p>
                      ) : null}
                      {activity.note ? <p>{activity.note}</p> : null}
                      <time dateTime={activity.createdAt}>
                        {formatDateTime(activity.createdAt)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="quiet-copy">No activity has been recorded.</p>
            )}
          </section>
        </div>

        <aside className="content-card details-panel" aria-labelledby="job-info-heading">
          <p className="section-kicker">At a glance</p>
          <h2 id="job-info-heading">Job information</h2>
          <dl>
            <div>
              <dt>Priority</dt>
              <dd>{humanize(job.priority)}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{humanize(job.category)}</dd>
            </div>
            <div>
              <dt>
                <UserRound size={15} aria-hidden="true" /> Requester
              </dt>
              <dd>{job.requester.name}</dd>
            </div>
            <div>
              <dt>
                <UserRound size={15} aria-hidden="true" /> Assignee
              </dt>
              <dd>{job.assignee?.name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt>
                <CalendarClock size={15} aria-hidden="true" /> SLA due
              </dt>
              <dd>{formatDateTime(job.slaDueAt)}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(job.createdAt)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
