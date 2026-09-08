"use client";

import { AlertCircle } from "lucide-react";

export default function JobsError({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state error-state" role="alert">
      <span className="empty-icon" aria-hidden="true">
        <AlertCircle size={24} />
      </span>
      <h1>Service jobs could not be loaded</h1>
      <p>The demo data is unchanged. Check the local database, then try again.</p>
      <button type="button" className="button-secondary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
