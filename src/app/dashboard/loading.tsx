export default function DashboardLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Loading dashboard">
      <div className="loading-line loading-line-title" />
      <div className="loading-block loading-attention" />
      <div className="loading-metrics">
        {[0, 1, 2, 3].map((item) => <div className="loading-block" key={item} />)}
      </div>
      <div className="loading-block loading-dashboard-content" />
    </div>
  );
}
