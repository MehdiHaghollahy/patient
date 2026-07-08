import classNames from '@/common/utils/classNames';
import { Fragment } from 'react';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useSelectedCenterStore } from '../store/selectedCenter';
import { getDoctorCenterOptions } from '../utils/centers';

export const CenterStrip = ({ className }: { className?: string }) => {
  const user = useUserInfoStore(state => state.info);
  const options = getDoctorCenterOptions(user);
  const selectedCenterId = useSelectedCenterStore(state => state.selectedCenterId);
  const setSelectedCenterId = useSelectedCenterStore(state => state.setSelectedCenterId);

  if (options.length <= 1) return null;

  return (
    <div className={classNames('-mx-1 overflow-x-auto px-1 no-scroll', className)}>
      <div className="flex w-max min-w-full items-center whitespace-nowrap text-xs">
        {options.map((option, index) => {
          const isSelected = selectedCenterId === option.id;

          return (
            <Fragment key={option.id ?? 'all'}>
              {index > 0 && <span className="px-2 text-slate-300 select-none">•</span>}
              <button
                type="button"
                onClick={() => setSelectedCenterId(option.id)}
                className={classNames(
                  'shrink-0 py-1 transition-colors',
                  isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-500',
                )}
              >
                {option.name}
                {option.addressHint && (
                  <span className={classNames('font-normal', isSelected ? 'text-slate-500' : 'text-slate-400')}>
                    {' '}({option.addressHint})
                  </span>
                )}
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
