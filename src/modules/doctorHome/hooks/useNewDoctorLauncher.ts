import useCustomize from '@/common/hooks/useCustomize';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useEffect, useState } from 'react';
import { growthbook } from 'src/pages/_app';
import { isDoctorUser } from '../store/viewMode';

let latched: { userId: string; enabled: boolean } | null = null;

export const useIsNewDoctorLauncherEnabled = () => {
  const user = useUserInfoStore(state => state.info);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const pending = useUserInfoStore(state => state.pending);
  const doctorProfilePending = useUserInfoStore(state => state.doctorProfilePending);
  const userId = user?.id;
  const customize = useCustomize(state => state.customize);
  const [isReady, setIsReady] = useState(growthbook.ready);
  const [isResolved, setIsResolved] = useState(
    () => latched != null && latched.userId === (userId != null && userId !== '' ? String(userId) : null),
  );
  const [isEnabled, setIsEnabled] = useState(() => latched?.enabled ?? false);

  const isDoctor = !customize.partnerKey && isDoctorUser(user);
  const normalizedUserId = userId != null && userId !== '' ? String(userId) : null;
  const shouldResolve =
    isDoctor && isLogin && normalizedUserId != null && !pending && !doctorProfilePending && isReady;

  useEffect(() => {
    const unsubscribe = growthbook.subscribe(() => {
      setIsReady(growthbook.ready);
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!isLogin || !normalizedUserId || !isDoctor) {
      latched = null;
      setIsResolved(false);
      setIsEnabled(false);
      return;
    }

    if (!shouldResolve) {
      setIsResolved(false);
      return;
    }

    if (latched?.userId === normalizedUserId) {
      setIsEnabled(latched.enabled);
      setIsResolved(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      const attributes = growthbook.getAttributes();
      if (attributes.user_id !== normalizedUserId) {
        growthbook.setAttributes({
          ...attributes,
          user_id: normalizedUserId,
          loggedIn: true,
          is_doctor: true,
        });
      }

      await growthbook.refreshFeatures({ skipCache: true });
      if (cancelled) return;

      const enabled = growthbook.isOn('doctor-home:enable');
      latched = { userId: normalizedUserId, enabled };
      setIsEnabled(enabled);
      setIsResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isDoctor, isLogin, normalizedUserId, shouldResolve]);

  if (!isDoctor || !isLogin || !normalizedUserId) {
    return false;
  }

  return isResolved && isEnabled;
};

export const useIsNewDoctorLauncherLoading = () => {
  const user = useUserInfoStore(state => state.info);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const pending = useUserInfoStore(state => state.pending);
  const doctorProfilePending = useUserInfoStore(state => state.doctorProfilePending);
  const userId = user?.id;
  const customize = useCustomize(state => state.customize);
  const [isReady, setIsReady] = useState(growthbook.ready);

  const isDoctor = !customize.partnerKey && isDoctorUser(user);
  const normalizedUserId = userId != null && userId !== '' ? String(userId) : null;

  useEffect(() => {
    const unsubscribe = growthbook.subscribe(() => {
      setIsReady(growthbook.ready);
    });

    return () => unsubscribe?.();
  }, []);

  return (
    isDoctor &&
    isLogin &&
    !!normalizedUserId &&
    (pending || doctorProfilePending || !isReady || latched?.userId !== normalizedUserId)
  );
};
