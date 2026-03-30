import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {icon && (
        <div className="text-brand-muted mb-4 opacity-60">{icon}</div>
      )}
      <h3 className="text-brand-cream font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-brand-muted text-sm leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
