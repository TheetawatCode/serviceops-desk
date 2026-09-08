"use client";

import { useActionState } from "react";

import {
  initialJobMutationState,
  type JobMutationState,
  type StatusAction,
} from "@/lib/job-mutations";

type StatusActionHandler = (
  previousState: JobMutationState,
  formData: FormData,
) => Promise<JobMutationState>;

export function JobStatusActions({
  actions,
  action,
}: {
  actions: StatusAction[];
  action: StatusActionHandler;
}) {
  const [state, formAction, isPending] = useActionState(action, initialJobMutationState);

  return (
    <section className="status-action-card" aria-labelledby="status-action-heading">
      <div>
        <p className="section-kicker">Next step</p>
        <h2 id="status-action-heading">Status action</h2>
      </div>
      <form action={formAction} className="status-action-form">
        <p>{actions.length === 1 ? "Move this job forward when the work is ready." : "Choose the appropriate operational outcome."}</p>
        {state.message ? (
          <p className={state.changed ? "note-success" : "assignment-message"} role="status" aria-live="polite">
            {state.message}
          </p>
        ) : null}
        <div className="status-action-buttons">
          {actions.map((statusAction) => (
            <button
              key={statusAction.target}
              type="submit"
              name="status"
              value={statusAction.target}
              className={statusAction.target === "CLOSED" ? "button-secondary" : "button-primary"}
              disabled={isPending}
            >
              {isPending ? "Updating status…" : statusAction.label}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
