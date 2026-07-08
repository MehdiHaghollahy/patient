import useCustomize from '@/common/hooks/useCustomize';
import { isMobileViewport } from '@/common/hooks/useResponsive';
import { isDoctorDeviceCached } from '@/common/utils/doctorDeviceCache';
import { useIsNewDoctorLauncherEnabled } from './useNewDoctorLauncher';

export const useDoctorViewSwapActive = () => {
  const customize = useCustomize(state => state.customize);
  const swapEnabled = useIsNewDoctorLauncherEnabled();

  return (
    swapEnabled ||
    (!customize.partnerKey && isMobileViewport() && isDoctorDeviceCached())
  );
};
