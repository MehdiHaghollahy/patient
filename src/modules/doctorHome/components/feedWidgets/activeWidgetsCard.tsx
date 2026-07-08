import classNames from '@/common/utils/classNames';
import type { HamdastCatalogApp } from '@/modules/hamdast/apis/appList';
import { DsCard } from '../../designSystem';
import type { ActiveWidgetGroup } from '../../utils/widgetCapabilitySections';
import { RowChevron, AppCapabilityContent, WidgetAppIcon } from './widgetListRow';

const GROUP_LABEL: Record<ActiveWidgetGroup['id'], string> = {
  assistant: 'دستیاران',
  profile: 'ابزارک‌های پروفایل',
  other: 'سایر ابزارک‌ها',
};

const WidgetRow = ({
  app,
  onClick,
  isLast,
}: {
  app: HamdastCatalogApp;
  onClick: () => void;
  isLast?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors active:bg-slate-50 hover:bg-slate-50/80',
      !isLast && 'border-b border-slate-100',
    )}
  >
    <WidgetAppIcon app={app} size="compact" />
    <AppCapabilityContent app={app} dense className="text-right" />
    <RowChevron />
  </button>
);

export const ActiveWidgetsCard = ({
  groups,
  onOpenApp,
}: {
  groups: ActiveWidgetGroup[];
  onOpenApp: (app: HamdastCatalogApp) => void;
}) => (
  <DsCard padding="none" className="overflow-hidden !shadow-sm">
    {groups.map((group, groupIndex) => (
      <div key={group.id}>
        <div
          className={classNames(
            'border-b border-slate-100 bg-slate-50/70 px-3 py-1.5',
            groupIndex === 0 && 'rounded-t-2xl',
          )}
        >
          <span className="text-[11px] font-medium text-slate-500">{GROUP_LABEL[group.id]}</span>
        </div>
        {group.apps.map((app, index) => (
          <WidgetRow
            key={app.app_key}
            app={app}
            onClick={() => onOpenApp(app)}
            isLast={index === group.apps.length - 1 && groupIndex === groups.length - 1}
          />
        ))}
      </div>
    ))}
  </DsCard>
);
