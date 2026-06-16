import clsx from 'clsx';

interface BadgeProps {
  variant?: 'active' | 'expired' | 'protected' | 'used' | 'default';
  children: React.ReactNode;
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  const styles = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    protected: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    used: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    default: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', styles[variant])}>
      {variant === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
      {variant === 'expired' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
      {variant === 'protected' && '🔒'}
      {variant === 'used' && '⏰'}
      {children}
    </span>
  );
}
