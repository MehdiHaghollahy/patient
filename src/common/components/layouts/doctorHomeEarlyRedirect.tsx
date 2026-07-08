import { redirectCachedDoctorHome } from '@/common/utils/doctorDeviceCache';
import {
  useIsNewDoctorLauncherEnabled,
  useIsNewDoctorLauncherLoading,
} from '@/modules/doctorHome/hooks/useNewDoctorLauncher';
import { useLayoutEffect, useRef } from 'react';

export const DoctorHomeEarlyRedirect = () => {
  const hasRedirected = useRef(false);
  const newLauncherLoading = useIsNewDoctorLauncherLoading();
  const newLauncherEnabled = useIsNewDoctorLauncherEnabled();

  useLayoutEffect(() => {
    if (hasRedirected.current || newLauncherLoading || newLauncherEnabled) return;
    if (redirectCachedDoctorHome()) {
      hasRedirected.current = true;
    }
  }, [newLauncherEnabled, newLauncherLoading]);

  return null;
};
