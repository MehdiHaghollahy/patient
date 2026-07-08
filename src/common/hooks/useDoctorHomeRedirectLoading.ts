import useCustomize from '@/common/hooks/useCustomize';
import { isMobileViewport } from '@/common/hooks/useResponsive';
import { isDoctorDeviceCached } from '@/common/utils/doctorDeviceCache';
import { useDoctorViewSwapActive } from '@/modules/doctorHome/hooks/useDoctorViewSwapActive';
import { isPatientViewModeStored, useDoctorViewModeStore } from '@/modules/doctorHome/store/viewMode';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { useRouter } from 'next/router';
import { isDoctorUser } from './useDoctorHomeRedirect';

const REDIRECT_PATHS = ['/', '/apphome'];

export const useDoctorHomeRedirectLoading = () => {
  const router = useRouter();
  const customize = useCustomize(state => state.customize);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const userInfo = useUserInfoStore(state => state.info);
  const launcherAsMainHome = useFeatureIsOn('launcher-as-main-home');
  const swapActive = useDoctorViewSwapActive();
  const isCachedDoctor = isDoctorDeviceCached();
  const viewMode = useDoctorViewModeStore(state => state.mode);
  const isPatientMode = isPatientViewModeStored() || viewMode === 'patient';

  if (swapActive && isPatientMode) return false;

  return (
    !customize.partnerKey &&
    REDIRECT_PATHS.includes(router.pathname) &&
    isMobileViewport() &&
    (launcherAsMainHome || isCachedDoctor) &&
    (isCachedDoctor || (isLogin && isDoctorUser(userInfo))) &&
    !isPatientViewModeStored()
  );
};
