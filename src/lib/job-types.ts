export type DemoRole = "STAFF" | "TECHNICIAN" | "MANAGER";
export type JobStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type PersonSummary = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
};

export type JobListItem = {
  id: string;
  reference: string;
  title: string;
  category: string;
  priority: Priority;
  status: JobStatus;
  slaDueAt: string;
  createdAt: string;
  requester: PersonSummary;
  assignee: PersonSummary | null;
};

export type JobActivityItem = {
  id: string;
  type: "CREATED" | "ASSIGNED" | "STATUS_CHANGED" | "NOTE_ADDED";
  note: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  author: PersonSummary;
};

export type JobDetail = JobListItem & {
  description: string;
  resolvedAt: string | null;
  closedAt: string | null;
  activities: JobActivityItem[];
};
