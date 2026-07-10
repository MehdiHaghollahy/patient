'use client';

'use client';

import LauncherBlocksFeaturedApps from '.plasmic/LauncherBlocksFeaturedApps';
import { useDoctorHomeAppModal } from '../hooks/useDoctorHomeAppModal';
import { useDoctorHomeSheetHost } from '../hooks/doctorHomeSheetLayout';
import { DsDrawer } from './DsDrawer';

interface ToolboxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeOpenApp?: () => void;
}

export const ToolboxDrawer = ({ open, onOpenChange, onBeforeOpenApp }: ToolboxDrawerProps) => {
  const openDoctorHomeApp = useDoctorHomeAppModal();
  const isSheetHost = useDoctorHomeSheetHost();

  return (
    <DsDrawer
      open={open && isSheetHost}
      onOpenChange={onOpenChange}
      title="جعبه ابزار"
      description="اپلیکیشن‌ها و ابزارهای پزشک"
      fullHeight
      className="!p-0"
    >
      {open && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 [-webkit-overflow-scrolling:touch] [touch-action:pan-y]">
          <LauncherBlocksFeaturedApps
            openAppFrame={key => {
              onBeforeOpenApp?.();
              openDoctorHomeApp(key);
            }}
          />
        </div>
      )}
    </DsDrawer>
  );
};
