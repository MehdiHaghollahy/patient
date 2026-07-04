import Skeleton from '@/common/components/atom/skeleton/skeleton';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useQuery } from '@tanstack/react-query';
import { fetchRateSummary } from '../api';
import { RaviCenter } from '../types';
import { RaviList } from './RaviList';
import { RaviSummary } from './RaviSummary';

export interface RaviWidgetProps {
  doctorSlug: string;
  displayName?: string;
  centers?: RaviCenter[];
  hideSummary?: boolean;
}

export const RaviWidget = ({ doctorSlug, displayName, centers = [], hideSummary = false }: RaviWidgetProps) => {
  const userId = useUserInfoStore(state => state.info?.id?.toString());

  const summaryQuery = useQuery(['ravi-rate-summary', doctorSlug], () => fetchRateSummary(doctorSlug), {
    enabled: !!doctorSlug,
    staleTime: 60_000,
  });

  if (!doctorSlug) {
    return <p className="text-sm text-slate-500">slug پزشک مشخص نشده است.</p>;
  }

  const summary = summaryQuery.data ?? { count: 0, items: [], hideRates: false };

  return (
    <div className="flex flex-col space-y-px" dir="rtl">
      {!hideSummary ? (
        summaryQuery.isLoading ? (
          <Skeleton w="100%" h="12rem" rounded="lg" />
        ) : summaryQuery.isError ? null : (
          <RaviSummary displayName={displayName} summary={summary} />
        )
      ) : null}
      <RaviList doctorSlug={doctorSlug} userId={userId} centers={centers} />
    </div>
  );
};

export default RaviWidget;
