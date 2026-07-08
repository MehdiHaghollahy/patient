import { isDoctorDeviceCached } from '@/common/utils/doctorDeviceCache';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useRouter } from 'next/router';
import { isDoctorUser } from './useDoctorHomeRedirect';

const REDIRECT_PATHS = ['/', '/apphome'];

export const useDoctorHomeRedirectLoading = () => {
  const router = useRouter();
  const isLogin = useUserInfoStore(state => state.isLogin);
  const pending = useUserInfoStore(state => state.pending);
  const doctorProfilePending = useUserInfoStore(state => state.doctorProfilePending);
  const userInfo = useUserInfoStore(state => state.info);
  const isCachedDoctor = isDoctorDeviceCached();

  const onRedirectPath = REDIRECT_PATHS.includes(router.pathname);

  if (!onRedirectPath) return false;

  const isDoctor = isCachedDoctor || (isLogin && isDoctorUser(userInfo));

  if ((pending || doctorProfilePending) && isCachedDoctor) return true;

  return !pending && !doctorProfilePending && isDoctor;
};
