import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state access-state">
      <span className="empty-icon" aria-hidden="true">
        <FileQuestion size={24} />
      </span>
      <h1>Service job not found</h1>
      <p>The reference may be incorrect or the demo record is unavailable.</p>
      <Link href="/jobs" className="button-secondary">
        Back to service jobs
      </Link>
    </div>
  );
}
