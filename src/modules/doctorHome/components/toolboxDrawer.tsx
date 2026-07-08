'use client';

import LauncherBlocksFeaturedApps from '.plasmic/LauncherBlocksFeaturedApps';
import { useDoctorHomeAppModal } from '../hooks/useDoctorHomeAppModal';
import { DsDrawer } from './DsDrawer';

interface ToolboxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeOpenApp?: () => void;
}

export const ToolboxDrawer = ({ open, onOpenChange, onBeforeOpenApp }: ToolboxDrawerProps) => {
  const openDoctorHomeApp = useDoctorHomeAppModal();

  return (
    <DsDrawer
      open={open}
      onOpenChange={onOpenChange}
      description="جعبه ابزار"
      fullHeight
      className="px-4 pt-2"
    >
      {open && (
        <LauncherBlocksFeaturedApps
          openAppFrame={key => {
            onBeforeOpenApp?.();
            openDoctorHomeApp(key);
          }}
        />
      )}
    </DsDrawer>
  );
};
