import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  MessageSquareText,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SlaBadge, StatusBadge } from "@/components/status-badge";
import type { DashboardData } from "@/lib/dashboard";
import { formatDateTime, humanize } from "@/lib/format";
import type { JobActivityItem, PersonSummary, Priority } from "@/lib/job-types";

function PriorityLabel({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <span aria-hidden="true" />
      {humanize(priority)}
    </span>
  );
}

function ActivityIcon({ type }: { type: JobActivityItem["type"] }) {
  if (type === "NOTE_ADDED") return <MessageSquareText size={15} />;
  if (type === "STATUS_CHANGED") return <CheckCircle2 size={15} />;
  return <CircleDot size={15} />;
}

function activityDescription(activity: JobActivityItem) {
  if (activity.type === "NOTE_ADDED") return "added an internal note";
  if (activity.type === "STATUS_CHANGED") return "changed a job status";
  if (activity.type === "ASSIGNED") return "updated an assignment";
  return "created a service job";
}

function MetricCard({
  label,
  value,
  supportingText,
  tone = "default",
}: {
  label: string;
  value: number;
  supportingText: string;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <article className={`dashboard-metric dashboard-metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{supportingText}</span>
    </article>
  );
}

export function DashboardView({
  data,
  identity,
}: {
  data: DashboardData;
  identity: PersonSummary;
}) {
  const isManager = identity.role === "MANAGER";
  const scopeLabel =
    identity.role === "STAFF"
      ? "your submitted service jobs"
      : identity.role === "TECHNICIAN"
        ? "service jobs assigned to you"
        : "the full service operation";

  return (
    <div className="page-stack dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>Good morning, {identity.name.split(" ")[0]}</h1>
          <p>Stay ahead of SLA commitments across {scopeLabel}.</p>
        </div>
        <Link href="/jobs" className="button-secondary dashboard-jobs-link">
          View service jobs
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>

      <section className="attention-strip" aria-labelledby="attention-heading">
        <div className="attention-strip-icon" aria-hidden="true">
          <ShieldAlert size={19} />
        </div>
        <div>
          <p className="section-kicker">SLA attention</p>
          <h2 id="attention-heading">
            {data.attentionJobs.length
              ? `${data.attentionJobs.length} active job${data.attentionJobs.length === 1 ? " needs" : "s need"} attention`
              : "No active SLA risks"}
          </h2>
          <p>
            {data.attentionJobs.length
              ? "Breached jobs are listed before work approaching its SLA due time."
              : "All active jobs are currently on track."}
          </p>
        </div>
        {data.attentionJobs.length ? (
          <div className="attention-links" aria-label="Jobs needing SLA attention">
            {data.attentionJobs.slice(0, 3).map((job) => (
              <Link key={job.id} href={`/jobs/${job.reference}`}>
                <AlertTriangle size={14} aria-hidden="true" />
                {job.reference}
              </Link>
            ))}
          </div>
        ) : (
          <CheckCircle2 className="attention-ok" size={23} aria-hidden="true" />
        )}
      </section>

      <section className="dashboard-metrics" aria-label="Job summary">
        <MetricCard label="Open" value={data.metrics.open} supportingText="Awaiting active work" />
        <MetricCard
          label="In progress"
          value={data.metrics.inProgress}
          supportingText="Currently being worked"
        />
        <MetricCard
          label="At risk"
          value={data.metrics.atRisk}
          supportingText="Due within 24 hours"
          tone="warning"
        />
        <MetricCard
          label="Resolved this week"
          value={data.metrics.resolvedThisWeek}
          supportingText="Completed operational work"
          tone="success"
        />
      </section>

      <div className="dashboard-content-grid">
        <section className="content-card dashboard-queue" aria-labelledby="priority-queue-heading">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">Action queue</p>
              <h2 id="priority-queue-heading">Priority service jobs</h2>
            </div>
            <Link href="/jobs" className="text-link">
              All jobs <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {data.priorityQueue.length ? (
            <ul className="dashboard-job-list">
              {data.priorityQueue.map((job) => (
                <li key={job.id}>
                  <Link href={`/jobs/${job.reference}`} className="dashboard-job-link">
                    <span className="job-reference">{job.reference}</span>
                    <strong>{job.title}</strong>
                    <span className="dashboard-job-meta">
                      <PriorityLabel priority={job.priority} />
                      <StatusBadge status={job.status} />
                      <SlaBadge dueAt={job.slaDueAt} status={job.status} />
                    </span>
                  </Link>
                  <time dateTime={job.slaDueAt}>{formatDateTime(job.slaDueAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <DashboardEmpty
              icon={<ClipboardList size={21} />}
              title="No active jobs in this queue"
              description="New or assigned work will appear here when it needs attention."
            />
          )}
        </section>

        <aside className="dashboard-side-stack">
          {isManager && data.workload ? (
            <section className="content-card dashboard-workload" aria-labelledby="workload-heading">
              <div className="section-heading-row">
                <div>
                  <p className="section-kicker">Team capacity</p>
                  <h2 id="workload-heading">Technician workload</h2>
                </div>
              </div>
              {data.workload.length ? (
                <ul className="workload-list">
                  {data.workload.map(({ technician, activeJobs, slaRiskJobs }) => (
                    <li key={technician.id}>
                      <span className="workload-avatar" aria-hidden="true">
                        {technician.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{technician.name}</strong>
                        <span>
                          {activeJobs} active · {slaRiskJobs} SLA risk
                        </span>
                      </div>
                      <span className="workload-number" aria-label={`${activeJobs} active assigned jobs`}>
                        {activeJobs}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <DashboardEmpty
                  icon={<UserRound size={21} />}
                  title="No technicians available"
                  description="Seeded technicians will be shown here."
                />
              )}
            </section>
          ) : data.personalSummary ? (
            <section className="content-card personal-summary" aria-labelledby="personal-summary-heading">
              <p className="section-kicker">Your focus</p>
              <h2 id="personal-summary-heading">{data.personalSummary.label}</h2>
              <div>
                <strong>{data.personalSummary.activeJobs}</strong>
                <span>active</span>
              </div>
              <p>
                {data.personalSummary.slaRiskJobs
                  ? `${data.personalSummary.slaRiskJobs} active job${data.personalSummary.slaRiskJobs === 1 ? " is" : "s are"} at SLA risk.`
                  : "No active jobs are currently at SLA risk."}
              </p>
            </section>
          ) : null}

          <section className="content-card dashboard-activity" aria-labelledby="recent-activity-heading">
            <div className="section-heading-row">
              <div>
                <p className="section-kicker">Latest updates</p>
                <h2 id="recent-activity-heading">Recent activity</h2>
              </div>
            </div>
            {data.recentActivity.length ? (
              <ol className="dashboard-activity-list">
                {data.recentActivity.map((activity) => (
                  <li key={activity.id}>
                    <span className="dashboard-activity-icon" aria-hidden="true">
                      <ActivityIcon type={activity.type} />
                    </span>
                    <div>
                      <p>
                        <strong>{activity.author.name}</strong> {activityDescription(activity)}
                      </p>
                      <Link href={`/jobs/${activity.job.reference}`}>
                        {activity.job.reference} · {activity.job.title}
                      </Link>
                      <time dateTime={activity.createdAt}>{formatDateTime(activity.createdAt)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <DashboardEmpty
                icon={<Clock3 size={21} />}
                title="No recent activity"
                description="Updates to your visible jobs will appear here."
              />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function DashboardEmpty({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="dashboard-empty">
      <span aria-hidden="true">{icon}</span>
      <p><strong>{title}</strong></p>
      <p>{description}</p>
    </div>
  );
}
