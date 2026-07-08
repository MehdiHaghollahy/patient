import classNames from '@/common/utils/classNames';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useEffect } from 'react';
import { useDoctorViewModeStore, type DoctorViewMode, isDoctorUser } from '../store/viewMode';
import { sendDoctorHomeEvent } from '../utils/analytics';
import { ds } from '../designSystem/tokens';

const options: { id: DoctorViewMode; label: string }[] = [
  { id: 'doctor', label: 'پزشک' },
  { id: 'patient', label: 'بیمار' },
];

export const DoctorViewSwitcher = ({ className }: { className?: string }) => {
  const user = useUserInfoStore(state => state.info);
  const userId = user?.id;
  const mode = useDoctorViewModeStore(state => state.mode);
  const setMode = useDoctorViewModeStore(state => state.setMode);

  useEffect(() => {
    void import('@/modules/home/views/homePageBody');
  }, []);

  if (!isDoctorUser(user)) return null;

  const viewBackground = mode === 'patient' ? 'bg-white' : ds.surface.page;

  return (
    <div className={classNames('flex justify-center px-4 pb-1.5 pt-3', viewBackground, className)}>
      <div
        className="inline-flex scale-[0.92] rounded-full border border-slate-200/80 bg-slate-100/80 p-0.5"
        role="tablist"
        aria-label="انتخاب نمای کاربری"
      >
        {options.map(option => {
          const isActive = mode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (option.id === mode) return;
                setMode(option.id);
                sendDoctorHomeEvent(userId, 'view_mode_switch', { mode: option.id });
              }}
              className={classNames(
                'min-w-[3.75rem] rounded-full px-2.5 py-1 text-[11px] transition-colors duration-150',
                isActive
                  ? 'bg-white/95 font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                  : 'bg-transparent font-medium text-slate-400',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
