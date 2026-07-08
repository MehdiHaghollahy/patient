import Loading from '@/common/components/atom/loading';
import dynamic from 'next/dynamic';
import { ComponentType, useEffect, useState } from 'react';
import PlasmicSearch from '.plasmic/plasmic/paziresh_24_search/PlasmicSearch';
import { useDoctorViewSwapActive } from '../hooks/useDoctorViewSwapActive';
import { useDoctorViewUrlSync } from '../hooks/useDoctorViewUrlSync';
import { useDoctorViewModeStore, type DoctorViewMode } from '../store/viewMode';
import { DoctorLauncherContent } from './doctorLauncherContent';
import { DoctorViewSwitcher } from './doctorViewSwitcher';
import { ds } from '../designSystem/tokens';

const HomePageBody = dynamic(() => import('@/modules/home/views/homePageBody'), {
  loading: () => (
    <div className="flex min-h-[50vh] flex-grow items-center justify-center">
      <Loading />
    </div>
  ),
});

interface DoctorViewSwapProps {
  fragmentComponents?: Record<string, unknown>;
  plasmicSearchComponent?: ComponentType<any>;
}

export const DoctorViewSwap = ({
  fragmentComponents,
  plasmicSearchComponent = PlasmicSearch,
}: DoctorViewSwapProps) => {
  const swapEnabled = useDoctorViewSwapActive();
  const mode = useDoctorViewModeStore(state => state.mode);
  const [visited, setVisited] = useState<Set<DoctorViewMode>>(() => new Set([mode]));

  useDoctorViewUrlSync(swapEnabled);

  useEffect(() => {
    if (!swapEnabled) return;
    setVisited(prev => {
      if (prev.has(mode)) return prev;
      const next = new Set(prev);
      next.add(mode);
      return next;
    });
  }, [mode, swapEnabled]);

  useEffect(() => {
    if (!swapEnabled) return;
    void import('@/modules/home/views/homePageBody');
  }, [swapEnabled]);

  if (!swapEnabled) return null;

  const showPatient = mode === 'patient';
  const showDoctor = mode === 'doctor';
  const switcherBackground = showPatient ? 'bg-white' : ds.surface.page;

  return (
    <>
      <div className={switcherBackground}>
        <DoctorViewSwitcher className="px-0 pb-1 pt-3" />
      </div>
      {visited.has('patient') && (
        <div className={showPatient ? undefined : 'hidden'} aria-hidden={!showPatient}>
          <HomePageBody fragmentComponents={fragmentComponents} plasmicSearchComponent={plasmicSearchComponent} />
        </div>
      )}
      {visited.has('doctor') && (
        <div className={showDoctor ? undefined : 'hidden'} aria-hidden={!showDoctor}>
          <DoctorLauncherContent />
        </div>
      )}
    </>
  );
};
