import classNames from '@/common/utils/classNames';
import type { HamdastCatalogApp } from '@/modules/hamdast/apis/appList';
import { getWidgetActionLabel } from '../../hooks/useInstalledAppKeys';
import { ds } from '../../designSystem';
import { AppCapabilityContent } from './widgetListRow';
import { getBadgeLabel } from '../../utils/widgetCapabilitySections';

export const AssistantCarouselSection = ({
  apps,
  installedKeys,
  onOpenApp,
  onActivate,
}: {
  apps: HamdastCatalogApp[];
  installedKeys: Set<string>;
  onOpenApp: (app: HamdastCatalogApp) => void;
  onActivate: (app: HamdastCatalogApp) => void;
}) => (
  <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-0.5 scrollbar-hide snap-x snap-mandatory">
    {apps.map(app => {
      const soon = getBadgeLabel(app.badges) === 'به‌زودی';
      const isActive = installedKeys.has(app.app_key);
      const actionLabel = getWidgetActionLabel(isActive, { soon });

      return (
        <button
          key={app.app_key}
          type="button"
          onClick={() => (soon ? onOpenApp(app) : isActive ? onOpenApp(app) : onActivate(app))}
          className={classNames(
            ds.radius.card,
            'flex w-[12.5rem] shrink-0 snap-start flex-col border bg-white p-3 text-start shadow-sm',
            isActive ? 'border-emerald-200/80' : 'border-slate-100',
            'transition-[transform,box-shadow] duration-150 ease-out active:scale-[0.98] hover:shadow-md',
          )}
        >
          <AppCapabilityContent app={app} soon={soon} />
          {!soon ? (
            <span
              className={classNames(
                'mt-2.5 text-xs font-semibold',
                isActive ? 'text-slate-500' : ds.type.link,
              )}
            >
              {actionLabel}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);
