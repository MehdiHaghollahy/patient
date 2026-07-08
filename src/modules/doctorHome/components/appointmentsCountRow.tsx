import Skeleton from '@/common/components/atom/skeleton';
import classNames from '@/common/utils/classNames';
import { ds } from '../designSystem';
import { sendDoctorHomeEvent } from '../utils/analytics';

interface AppointmentsCountRowProps {
  title: string;
  subtitle?: string;
  count: number | null;
  isLoading?: boolean;
  userId?: string;
  onPress: () => void;
  className?: string;
}

export const AppointmentsCountRow = ({
  title,
  subtitle,
  count,
  isLoading,
  userId,
  onPress,
  className,
}: AppointmentsCountRowProps) => (
  <button
    type="button"
    onClick={() => {
      sendDoctorHomeEvent(userId, 'stat_appointments', { count });
      onPress();
    }}
    className={classNames(
      ds.radius.card,
      ds.shadow.sm,
      'flex w-full items-center gap-3 border border-slate-100/90 bg-white px-3 py-3 text-start',
      'transition-[box-shadow,transform] duration-200 ease-out active:scale-[0.99]',
      className,
    )}
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DBE8FE] text-primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {subtitle ? <p className={classNames(ds.type.caption, 'mt-0.5')}>{subtitle}</p> : null}
    </div>

    <div className="flex shrink-0 items-center">
      {isLoading ? (
        <Skeleton h="1.25rem" w="2.5rem" rounded="md" />
      ) : (
        <span className="text-base font-bold tabular-nums text-slate-900">
          {count != null ? count.toLocaleString('fa-IR') : '—'}
        </span>
      )}
    </div>
  </button>
);
