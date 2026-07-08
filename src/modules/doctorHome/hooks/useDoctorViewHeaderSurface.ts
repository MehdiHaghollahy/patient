import { useRouter } from 'next/router';
import { useDoctorViewSwapActive } from './useDoctorViewSwapActive';
import { useDoctorViewModeStore } from '../store/viewMode';

import { ds } from '../designSystem/tokens';

export const DOCTOR_HOME_SURFACE_CLASS = ds.surface.page;

const SWAP_ROUTES = ['/', '/apphome', '/_'];

export const useDoctorViewHeaderSurface = () => {
  const router = useRouter();
  const swapActive = useDoctorViewSwapActive();
  const mode = useDoctorViewModeStore(state => state.mode);

  return swapActive && SWAP_ROUTES.includes(router.pathname) && mode === 'doctor';
};
