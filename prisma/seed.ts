import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  ActivityType,
  JobCategory,
  JobStatus,
  Prisma,
  PrismaClient,
  Priority,
  Role,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const users = [
  {
    id: "demo-staff-mina",
    name: "Mina Chantarat",
    email: "mina.staff@serviceops.demo",
    role: Role.STAFF,
  },
  {
    id: "demo-technician-narin",
    name: "Narin Srisuk",
    email: "narin.tech@serviceops.demo",
    role: Role.TECHNICIAN,
  },
  {
    id: "demo-manager-ananda",
    name: "Ananda Rattanakul",
    email: "ananda.manager@serviceops.demo",
    role: Role.MANAGER,
  },
] satisfies Prisma.UserCreateManyInput[];

const jobs = [
  {
    id: "job-vpn-access",
    reference: "SVC-1048",
    title: "Restore VPN access for finance laptop",
    description:
      "The VPN client rejects Mina's company credentials after the latest laptop security update. Access is needed before the afternoon payroll review.",
    category: JobCategory.ACCESS,
    priority: Priority.URGENT,
    status: JobStatus.IN_PROGRESS,
    requesterId: users[0].id,
    assigneeId: users[1].id,
    slaDueAt: new Date("2026-09-08T09:30:00.000Z"),
    createdAt: new Date("2026-09-08T02:15:00.000Z"),
  },
  {
    id: "job-projector-flicker",
    reference: "SVC-1047",
    title: "Meeting room projector flickers",
    description:
      "The projector in Chao Phraya room flickers every few minutes when connected over HDMI. The room is booked for a client workshop tomorrow.",
    category: JobCategory.HARDWARE,
    priority: Priority.HIGH,
    status: JobStatus.OPEN,
    requesterId: users[0].id,
    assigneeId: null,
    slaDueAt: new Date("2026-09-09T03:00:00.000Z"),
    createdAt: new Date("2026-09-07T07:40:00.000Z"),
  },
  {
    id: "job-expense-export",
    reference: "SVC-1046",
    title: "Expense export produces blank spreadsheet",
    description:
      "The monthly expense export completes without an error, but the downloaded spreadsheet contains headers and no transaction rows.",
    category: JobCategory.SOFTWARE,
    priority: Priority.HIGH,
    status: JobStatus.RESOLVED,
    requesterId: users[0].id,
    assigneeId: users[1].id,
    slaDueAt: new Date("2026-09-08T05:00:00.000Z"),
    resolvedAt: new Date("2026-09-08T04:18:00.000Z"),
    createdAt: new Date("2026-09-07T04:10:00.000Z"),
  },
  {
    id: "job-aircon-zone",
    reference: "SVC-1045",
    title: "Air conditioning warm in east work zone",
    description:
      "The east side of level 12 remains noticeably warmer than the rest of the floor from mid-afternoon onward.",
    category: JobCategory.FACILITIES,
    priority: Priority.MEDIUM,
    status: JobStatus.IN_PROGRESS,
    requesterId: users[2].id,
    assigneeId: users[1].id,
    slaDueAt: new Date("2026-09-10T10:00:00.000Z"),
    createdAt: new Date("2026-09-06T08:20:00.000Z"),
  },
  {
    id: "job-license-request",
    reference: "SVC-1044",
    title: "Design software licence request",
    description:
      "A temporary licence is needed for the marketing team to update event artwork during the current campaign.",
    category: JobCategory.ACCESS,
    priority: Priority.MEDIUM,
    status: JobStatus.OPEN,
    requesterId: users[2].id,
    assigneeId: null,
    slaDueAt: new Date("2026-09-11T05:00:00.000Z"),
    createdAt: new Date("2026-09-05T03:30:00.000Z"),
  },
  {
    id: "job-printer-toner",
    reference: "SVC-1043",
    title: "Replace reception printer toner",
    description:
      "The reception printer showed a low-toner warning and fading print quality on the right edge.",
    category: JobCategory.HARDWARE,
    priority: Priority.LOW,
    status: JobStatus.CLOSED,
    requesterId: users[0].id,
    assigneeId: users[1].id,
    slaDueAt: new Date("2026-09-07T10:00:00.000Z"),
    resolvedAt: new Date("2026-09-07T04:45:00.000Z"),
    closedAt: new Date("2026-09-07T05:05:00.000Z"),
    createdAt: new Date("2026-09-04T06:25:00.000Z"),
  },
  {
    id: "job-wifi-guest",
    reference: "SVC-1042",
    title: "Guest Wi-Fi unavailable in training room",
    description:
      "Visitors can see the guest network but are redirected to an expired access page in the training room.",
    category: JobCategory.OTHER,
    priority: Priority.HIGH,
    status: JobStatus.IN_PROGRESS,
    requesterId: users[2].id,
    assigneeId: users[1].id,
    slaDueAt: new Date("2026-09-08T04:00:00.000Z"),
    createdAt: new Date("2026-09-06T02:50:00.000Z"),
  },
] satisfies Prisma.ServiceJobUncheckedCreateInput[];

const activities = [
  {
    id: "activity-vpn-created",
    jobId: jobs[0].id,
    authorId: users[0].id,
    type: ActivityType.CREATED,
    note: "VPN stopped connecting after the security update.",
    createdAt: new Date("2026-09-08T02:15:00.000Z"),
  },
  {
    id: "activity-vpn-assigned",
    jobId: jobs[0].id,
    authorId: users[2].id,
    type: ActivityType.ASSIGNED,
    toValue: users[1].name,
    createdAt: new Date("2026-09-08T02:28:00.000Z"),
  },
  {
    id: "activity-vpn-progress",
    jobId: jobs[0].id,
    authorId: users[1].id,
    type: ActivityType.STATUS_CHANGED,
    fromValue: JobStatus.OPEN,
    toValue: JobStatus.IN_PROGRESS,
    note: "Reviewing the device certificate and client profile.",
    createdAt: new Date("2026-09-08T02:42:00.000Z"),
  },
  {
    id: "activity-projector-created",
    jobId: jobs[1].id,
    authorId: users[0].id,
    type: ActivityType.CREATED,
    note: "Issue reproduced with two different HDMI cables.",
    createdAt: new Date("2026-09-07T07:40:00.000Z"),
  },
  {
    id: "activity-export-note",
    jobId: jobs[2].id,
    authorId: users[1].id,
    type: ActivityType.NOTE_ADDED,
    note: "Reset the saved date filter and verified 126 transaction rows.",
    createdAt: new Date("2026-09-08T04:02:00.000Z"),
  },
  {
    id: "activity-export-resolved",
    jobId: jobs[2].id,
    authorId: users[1].id,
    type: ActivityType.STATUS_CHANGED,
    fromValue: JobStatus.IN_PROGRESS,
    toValue: JobStatus.RESOLVED,
    createdAt: new Date("2026-09-08T04:18:00.000Z"),
  },
  {
    id: "activity-aircon-note",
    jobId: jobs[3].id,
    authorId: users[1].id,
    type: ActivityType.NOTE_ADDED,
    note: "Facilities vendor visit confirmed for Wednesday morning.",
    createdAt: new Date("2026-09-08T03:20:00.000Z"),
  },
  {
    id: "activity-license-created",
    jobId: jobs[4].id,
    authorId: users[2].id,
    type: ActivityType.CREATED,
    createdAt: new Date("2026-09-05T03:30:00.000Z"),
  },
  {
    id: "activity-printer-closed",
    jobId: jobs[5].id,
    authorId: users[2].id,
    type: ActivityType.STATUS_CHANGED,
    fromValue: JobStatus.RESOLVED,
    toValue: JobStatus.CLOSED,
    note: "Reception confirmed print quality is back to normal.",
    createdAt: new Date("2026-09-07T05:05:00.000Z"),
  },
  {
    id: "activity-wifi-progress",
    jobId: jobs[6].id,
    authorId: users[1].id,
    type: ActivityType.STATUS_CHANGED,
    fromValue: JobStatus.OPEN,
    toValue: JobStatus.IN_PROGRESS,
    note: "Captive portal configuration is being reviewed.",
    createdAt: new Date("2026-09-08T01:15:00.000Z"),
  },
] satisfies Prisma.JobActivityUncheckedCreateInput[];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({ where: { id: user.id }, update: user, create: user });
  }

  for (const job of jobs) {
    await prisma.serviceJob.upsert({
      where: { id: job.id },
      update: job,
      create: job,
    });
  }

  for (const activity of activities) {
    await prisma.jobActivity.upsert({
      where: { id: activity.id },
      update: activity,
      create: activity,
    });
  }

  console.info("Seeded 3 demo identities and 7 service jobs.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
