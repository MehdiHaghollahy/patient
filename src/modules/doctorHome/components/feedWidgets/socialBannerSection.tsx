import type { HamdastCatalogApp } from '@/modules/hamdast/apis/appList';
import { DsCard } from '../../designSystem';
import { RowChevron, WidgetListRow } from './widgetListRow';

export const SocialBannerSection = ({
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
  <div className="space-y-2">
    {apps.map(app => {
      const isActive = installedKeys.has(app.app_key);

      return (
        <DsCard key={app.app_key} padding="none" className="overflow-hidden !border-primary/15 !bg-primary/[0.03] !shadow-sm">
          <WidgetListRow
            app={app}
            onClick={() => (isActive ? onOpenApp(app) : onActivate(app))}
            trailing={<RowChevron />}
          />
        </DsCard>
      );
    })}
  </div>
);
