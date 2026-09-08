"use client";

import { useActionState } from "react";

import {
  initialJobMutationState,
  type JobMutationState,
} from "@/lib/job-mutations";
import type { PersonSummary } from "@/lib/job-types";

type AssignmentAction = (
  previousState: JobMutationState,
  formData: FormData,
) => Promise<JobMutationState>;

export function JobAssignmentForm({
  action,
  technicians,
  currentAssigneeId,
}: {
  action: AssignmentAction;
  technicians: PersonSummary[];
  currentAssigneeId: string | null;
}) {
  const [state, formAction, isPending] = useActionState(action, initialJobMutationState);

  return (
    <section className="assignment-card" aria-labelledby="assignment-heading">
      <div>
        <p className="section-kicker">Manager action</p>
        <h2 id="assignment-heading">Assignment</h2>
        <p className="assignment-help">Route this open job to a seeded technician.</p>
      </div>
      <form action={formAction} className="assignment-form">
        <label htmlFor="assigneeId">Technician</label>
        <select
          id="assigneeId"
          name="assigneeId"
          defaultValue={currentAssigneeId ?? ""}
          aria-describedby="assignee-error"
          aria-invalid={Boolean(state.errors.assigneeId)}
          disabled={isPending}
        >
          <option value="" disabled>Choose a technician</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name}
            </option>
          ))}
        </select>
        {state.errors.assigneeId ? (
          <p id="assignee-error" className="field-error">{state.errors.assigneeId}</p>
        ) : null}
        {state.message ? (
          <p className="assignment-message" role="status" aria-live="polite">{state.message}</p>
        ) : null}
        <button type="submit" className="button-secondary" disabled={isPending}>
          {isPending ? "Saving assignment…" : "Save assignment"}
        </button>
      </form>
    </section>
  );
}
