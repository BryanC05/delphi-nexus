type WidgetSkeletonProps = {
  title?: string;
};

export default function WidgetSkeleton({ title = 'Module' }: WidgetSkeletonProps) {
  return (
    <div className="widget widget-skeleton" style={{ padding: '24px' }} aria-busy="true" aria-label={`Loading ${title}`}>
      <div className="widget-skeleton-header">
        <span className="widget-skeleton-title">{title}</span>
        <span className="widget-skeleton-pulse" />
      </div>
      <div className="widget-skeleton-body">
        <div className="widget-skeleton-line" />
        <div className="widget-skeleton-line short" />
        <div className="widget-skeleton-line" />
      </div>
    </div>
  );
}
