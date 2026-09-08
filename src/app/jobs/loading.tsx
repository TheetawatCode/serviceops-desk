export default function JobsLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Loading service jobs">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-filters" />
      <div className="table-card skeleton-table">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton skeleton-row" key={index} />
        ))}
      </div>
      <span className="sr-only">Loading service jobs…</span>
    </div>
  );
}
