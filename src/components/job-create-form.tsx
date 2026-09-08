"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  createServiceJobAction,
} from "@/app/jobs/new/actions";
import { initialJobMutationState } from "@/lib/job-mutations";

const categories = [
  ["HARDWARE", "Hardware"],
  ["SOFTWARE", "Software"],
  ["ACCESS", "Access"],
  ["FACILITIES", "Facilities"],
  ["OTHER", "Other"],
] as const;

const priorities = [
  ["LOW", "Low"],
  ["MEDIUM", "Medium"],
  ["HIGH", "High"],
  ["URGENT", "Urgent"],
] as const;

export function JobCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createServiceJobAction,
    initialJobMutationState,
  );

  return (
    <form action={formAction} className="job-form" noValidate>
      <div className="form-intro">
        <p>Describe the outcome you need. The request starts unassigned and open.</p>
      </div>

      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <div className="form-field">
        <label htmlFor="title">Title</label>
        <p id="title-help">A short, specific summary of the service needed.</p>
        <input
          id="title"
          name="title"
          type="text"
          minLength={5}
          maxLength={120}
          required
          aria-describedby="title-help title-error"
          aria-invalid={Boolean(state.errors.title)}
        />
        {state.errors.title ? <p id="title-error" className="field-error">{state.errors.title}</p> : null}
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <p id="description-help">Include the impact, location or device, and anything already tried.</p>
        <textarea
          id="description"
          name="description"
          rows={7}
          minLength={20}
          maxLength={1500}
          required
          aria-describedby="description-help description-error"
          aria-invalid={Boolean(state.errors.description)}
        />
        {state.errors.description ? <p id="description-error" className="field-error">{state.errors.description}</p> : null}
      </div>

      <div className="form-field">
        <label htmlFor="category">Category</label>
        <p id="category-help">This helps the operations team route the request.</p>
        <select
          id="category"
          name="category"
          defaultValue=""
          required
          aria-describedby="category-help category-error"
          aria-invalid={Boolean(state.errors.category)}
        >
          <option value="" disabled>Select a category</option>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {state.errors.category ? <p id="category-error" className="field-error">{state.errors.category}</p> : null}
      </div>

      <div className="form-field">
        <label htmlFor="priority">Priority</label>
        <p id="priority-help">SLA timing is set automatically from this priority.</p>
        <select
          id="priority"
          name="priority"
          defaultValue="MEDIUM"
          required
          aria-describedby="priority-help priority-error"
          aria-invalid={Boolean(state.errors.priority)}
        >
          {priorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {state.errors.priority ? <p id="priority-error" className="field-error">{state.errors.priority}</p> : null}
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary" disabled={isPending}>
          {isPending ? "Creating service job…" : "Create service job"}
        </button>
        <Link href="/jobs" className="button-link">Cancel</Link>
      </div>
    </form>
  );
}
