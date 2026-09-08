"use client";

import { useActionState } from "react";

import {
  initialJobMutationState,
  type JobMutationState,
} from "@/lib/job-mutations";

type InternalNoteAction = (
  previousState: JobMutationState,
  formData: FormData,
) => Promise<JobMutationState>;

export function InternalNoteForm({ action }: { action: InternalNoteAction }) {
  const [state, formAction, isPending] = useActionState(action, initialJobMutationState);

  return (
    <section className="internal-note-card" aria-labelledby="internal-note-heading">
      <div>
        <p className="section-kicker">Internal only</p>
        <h2 id="internal-note-heading">Add work note</h2>
        <p>Visible to the service team in this demo workspace.</p>
      </div>
      <form action={formAction} className="internal-note-form">
        <label htmlFor="note">Work note</label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={1000}
          required
          aria-describedby="note-help note-error"
          aria-invalid={Boolean(state.errors.note)}
          disabled={isPending}
        />
        <p id="note-help">Keep it concise: what changed, what you checked, or what is needed next.</p>
        {state.errors.note ? <p id="note-error" className="field-error">{state.errors.note}</p> : null}
        {state.message ? (
          <p className={state.changed ? "note-success" : "assignment-message"} role="status" aria-live="polite">
            {state.message}
          </p>
        ) : null}
        <button type="submit" className="button-secondary" disabled={isPending}>
          {isPending ? "Adding note…" : "Add internal note"}
        </button>
      </form>
    </section>
  );
}
