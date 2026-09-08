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

import { JobAssignmentForm } from "@/components/job-assignment-form";
import { JobStatusActions } from "@/components/job-status-actions";
import { InternalNoteForm } from "@/components/internal-note-form";
import { SlaBadge, StatusBadge } from "@/components/status-badge";
import { formatDateTime, humanize } from "@/lib/format";
import type { JobMutationState, StatusAction } from "@/lib/job-mutations";
import type { JobActivityItem, JobDetail, PersonSummary } from "@/lib/job-types";

function ActivityIcon({ type }: { type: JobActivityItem["type"] }) {
  if (type === "NOTE_ADDED") return <MessageSquareText size={16} />;
  if (type === "STATUS_CHANGED") return <CheckCircle2 size={16} />;
  return <CircleDot size={16} />;
}

function formatActivityValue(activity: JobActivityItem, value: string | null) {
  if (!value) return "Unassigned";
  return activity.type === "ASSIGNED" ? value : humanize(value);
}

function activityDescription(activity: JobActivityItem) {
  if (activity.type === "NOTE_ADDED") return "added an internal note";
  if (activity.type === "STATUS_CHANGED") return "changed the status";
  if (activity.type === "ASSIGNED") return "updated assignment";
  return "created this job";
}

export function JobDetailView({
  job,
  assignmentAction,
  statusActions,
  statusAction,
  internalNoteAction,
  technicians,
  showCreatedFeedback,
}: {
  job: JobDetail;
  assignmentAction?: (
    previousState: JobMutationState,
    formData: FormData,
  ) => Promise<JobMutationState>;
  statusActions: StatusAction[];
  statusAction?: (
    previousState: JobMutationState,
    formData: FormData,
  ) => Promise<JobMutationState>;
  internalNoteAction?: (
    previousState: JobMutationState,
    formData: FormData,
  ) => Promise<JobMutationState>;
  technicians: PersonSummary[];
  showCreatedFeedback: boolean;
}) {
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
        <p className="read-only-label">Operations view</p>
      </header>

      {showCreatedFeedback ? (
        <p className="success-notice" role="status">
          Service job created and added to the operations queue.
        </p>
      ) : null}

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
                    <span className={`activity-icon activity-icon-${activity.type.toLowerCase()}`} aria-hidden="true">
                      <ActivityIcon type={activity.type} />
                    </span>
                    <div>
                      <p>
                        <strong>{activity.author.name}</strong>{" "}
                        {activityDescription(activity)}
                      </p>
                      {activity.fromValue || activity.toValue ? (
                        <p className="activity-change">
                          {formatActivityValue(activity, activity.fromValue)}
                          <span aria-hidden="true"> → </span>
                          <span className="sr-only"> changed to </span>
                          {formatActivityValue(activity, activity.toValue)}
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
          {internalNoteAction ? <InternalNoteForm action={internalNoteAction} /> : null}
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
          {statusAction && statusActions.length ? (
            <JobStatusActions actions={statusActions} action={statusAction} />
          ) : null}
          {assignmentAction ? (
            <JobAssignmentForm
              action={assignmentAction}
              technicians={technicians}
              currentAssigneeId={job.assignee?.id ?? null}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
