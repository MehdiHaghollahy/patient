import useCustomize from '@/common/hooks/useCustomize';
import { isMobileViewport } from '@/common/hooks/useResponsive';
import {
  isDoctorDeviceCached,
  redirectCachedDoctorHome,
} from '@/common/utils/doctorDeviceCache';
import {
  useIsNewDoctorLauncherEnabled,
  useIsNewDoctorLauncherLoading,
} from '@/modules/doctorHome/hooks/useNewDoctorLauncher';
import { isPatientViewModeStored } from '@/modules/doctorHome/store/viewMode';
import { useUserInfoStore, UserInfo } from '@/modules/login/store/userInfo';
import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { growthbook } from 'src/pages/_app';

export const isDoctorUser = (user: UserInfo) =>
  user.provider?.job_title === 'doctor' || user.is_doctor === true || !!user.provider?.slug;

const REDIRECT_PATHS = ['/', '/apphome'];

const canRedirectToDoctorHome = (customize: { partnerKey?: string }) =>
  !customize.partnerKey && isMobileViewport();

export const useDoctorHomeRedirect = () => {
  const router = useRouter();
  const user = useUserInfoStore(state => state.info);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const customize = useCustomize(state => state.customize);
  const launcherAsMainHome = useFeatureIsOn('launcher-as-main-home');
  const newLauncherLoading = useIsNewDoctorLauncherLoading();
  const newLauncherEnabled = useIsNewDoctorLauncherEnabled();
  const hasRedirected = useRef(false);

  const isCachedDoctor = isDoctorDeviceCached();
  const shouldRedirect =
    !newLauncherLoading &&
    !newLauncherEnabled &&
    canRedirectToDoctorHome(customize) &&
    REDIRECT_PATHS.includes(router.pathname) &&
    (launcherAsMainHome || isCachedDoctor) &&
    (isCachedDoctor || isDoctorUser(user)) &&
    !isPatientViewModeStored();

  useEffect(() => {
    if (!growthbook.ready) {
      growthbook.loadFeatures({ timeout: 300 });
    }
  }, []);

  useEffect(() => {
    if (isLogin || isCachedDoctor) {
      router.prefetch('/_/');
    }
  }, [isLogin, isCachedDoctor, router]);

  useLayoutEffect(() => {
    if (hasRedirected.current || newLauncherLoading || newLauncherEnabled) return;
    if (redirectCachedDoctorHome()) {
      hasRedirected.current = true;
    }
  }, [newLauncherEnabled, newLauncherLoading]);

  useLayoutEffect(() => {
    if (hasRedirected.current) return;
    if (!shouldRedirect) return;

    hasRedirected.current = true;
    router.replace('/_/');
  }, [shouldRedirect, router]);
};
