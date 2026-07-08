import {
  isDoctorDeviceCached,
  redirectCachedDoctorHome,
} from '@/common/utils/doctorDeviceCache';
import { useUserInfoStore, UserInfo } from '@/modules/login/store/userInfo';
import { useRouter } from 'next/router';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { growthbook } from 'src/pages/_app';

export const isDoctorUser = (user: UserInfo) =>
  user.provider?.job_title === 'doctor' || user.is_doctor === true || !!user.provider?.slug;

const REDIRECT_PATHS = ['/', '/apphome'];

export const useDoctorHomeRedirect = () => {
  const router = useRouter();
  const user = useUserInfoStore(state => state.info);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const pending = useUserInfoStore(state => state.pending);
  const doctorProfilePending = useUserInfoStore(state => state.doctorProfilePending);
  const hasRedirected = useRef(false);

  const isCachedDoctor = isDoctorDeviceCached();
  const isDoctor = isCachedDoctor || (isLogin && isDoctorUser(user));
  const shouldRedirect =
    !pending &&
    !doctorProfilePending &&
    REDIRECT_PATHS.includes(router.pathname) &&
    isDoctor;

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
    if (hasRedirected.current) return;
    if (redirectCachedDoctorHome()) {
      hasRedirected.current = true;
    }
  }, []);

  useLayoutEffect(() => {
    if (hasRedirected.current) return;
    if (!shouldRedirect) return;

    hasRedirected.current = true;
    router.replace('/_/');
  }, [shouldRedirect, router]);
};
