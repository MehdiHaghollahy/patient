import { convertLongToCompactNumber } from '@/common/utils/convertLongToCompactNumber';
import classNames from '@/common/utils/classNames';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import moment from 'jalali-moment';
import { useEffect, useMemo, useRef } from 'react';
import {
  DsDateStrip,
  DsInsightCarousel,
  ds,
} from '../designSystem';
import type { DsDateStripRef } from '../designSystem';
import { HOLIDAY_YEAR_END, HOLIDAY_YEAR_START, useHolidays } from '../apis/holidays';
import { getVacationsOnDate, useDoctorVacations } from '../apis/vacations';
import { useDoctorWalletBalance } from '../apis/walletBalance';
import { DoctorHomeFeedStats } from '../types/feed';
import { sendDoctorHomeEvent } from '../utils/analytics';
import { appendUserIdToUrl } from '../utils/iframeUrl';
import { CenterStrip } from './centerStrip';
import { useSelectedDateStore } from '../store/selectedDate';
import { useSelectedCenterStore } from '../store/selectedCenter';
import { getDoctorCenterOptions, getVacationCenterTargets } from '../utils/centers';
import { RAVI_DOCSIDE_URL } from '../utils/doctorPanelUrls';
import { useWalletBalanceVisibilityStore } from '../store/walletBalanceVisibility';
import { DsDrawer } from './DsDrawer';
import { sheetDrawerProps, useSheetRoute } from '../hooks/useSheetRoute';
import { AppointmentsCountRow } from './appointmentsCountRow';

interface FeedGreetingProps {
  stats?: DoctorHomeFeedStats;
  notificationDateSet?: Set<string>;
  className?: string;
}

const MetricDrawerContent = ({
  value,
  label,
  description,
}: {
  value: string | number | null;
  label: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-4 px-4 pb-10 pt-6">
    {value != null ? (
      <span className="text-5xl font-bold tabular-nums text-slate-900">{value}</span>
    ) : (
      <span className="text-lg text-slate-400">در حال بارگذاری…</span>
    )}
    <div className="text-center">
      <p className="text-base font-semibold text-slate-800">{label}</p>
      <p className={classNames(ds.type.caption, 'mt-1')}>{description}</p>
    </div>
  </div>
);

export const FeedGreeting = ({ stats, notificationDateSet, className }: FeedGreetingProps) => {
  const stripRef = useRef<DsDateStripRef>(null);
  const user = useUserInfoStore(state => state.info);
  const userId = user?.id;
  const selectedDate = useSelectedDateStore(s => s.selectedDate);
  const selectedCenterId = useSelectedCenterStore(s => s.selectedCenterId);
  const { data: walletBalance, isLoading: isWalletLoading } = useDoctorWalletBalance(user, !!user?.id, selectedCenterId);
  const isWalletVisible = useWalletBalanceVisibilityStore(state => state.isVisible);
  const isWalletHydrated = useWalletBalanceVisibilityStore(state => state.hydrated);
  const toggleWalletVisibility = useWalletBalanceVisibilityStore(state => state.toggle);
  const hydrateWalletVisibility = useWalletBalanceVisibilityStore(state => state.hydrate);
  const selectedMoment = moment(selectedDate, 'YYYY-MM-DD');
  const isToday = selectedMoment.isSame(moment(), 'day');
  const { data: holidays } = useHolidays(HOLIDAY_YEAR_START, HOLIDAY_YEAR_END);
  const vacationCenterTargets = useMemo(() => getVacationCenterTargets(user ?? undefined), [user]);
  const centerNameById = useMemo(() => {
    const map = new Map<string, string>();
    getDoctorCenterOptions(user).forEach(option => {
      if (option.id) map.set(option.id, option.name);
    });
    return map;
  }, [user]);
  const { vacations } = useDoctorVacations(vacationCenterTargets, selectedDate, selectedCenterId);
  const selectedDayHoliday = (holidays ?? []).find(h => h.date === selectedDate);
  const holidayEvents = selectedDayHoliday?.events ?? [];
  const allEvents = holidayEvents.filter(e => e.is_holiday);
  const vacationEvents = useMemo(
    () =>
      getVacationsOnDate(vacations, selectedDate, {
        selectedCenterId,
        getCenterName: id => centerNameById.get(id) ?? 'مرکز',
      }),
    [vacations, selectedDate, selectedCenterId, centerNameById],
  );
  const dateLabel = selectedMoment.clone().locale('fa').format('dddd، jD jMMMM');
  const appointmentDayLabel = isToday ? 'نوبت امروز' : `نوبت ${selectedMoment.clone().locale('fa').format('jD jMMMM')}`;
  const walletFormatted =
    walletBalance != null ? Math.round(walletBalance / 10).toLocaleString('fa-IR') : null;

  useEffect(() => {
    hydrateWalletVisibility();
  }, [hydrateWalletVisibility]);

  const apptSheet = useSheetRoute('stat-appointments');
  const reviewsSheet = useSheetRoute('stat-reviews');
  const walletSheet = useSheetRoute('stat-wallet');
  const performanceSheet = useSheetRoute('stat-performance');
  const pageViewSheet = useSheetRoute('stat-pageview');
  const vacationSheet = useSheetRoute('vacation');

  return (
    <header className={classNames('space-y-5', className)}>
      <div className="relative flex items-center justify-center">
        <p className={ds.type.display}>{dateLabel}</p>
        <div
          className={classNames(
            'absolute left-0 overflow-hidden transition-all duration-200',
            isToday ? 'w-0 opacity-0' : 'opacity-100',
          )}
        >
          <button
            type="button"
            onClick={() => stripRef.current?.goToToday()}
            className={classNames('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', ds.surface.primarySoft, 'text-primary')}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0">
              <path d="M4 10h9a3 3 0 0 0 0-6H9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 7l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            امروز
          </button>
        </div>
      </div>

      <DsDateStrip ref={stripRef} markedDates={notificationDateSet} />
      <CenterStrip />

      {(allEvents.length > 0 || vacationEvents.length > 0) && (
        <div className="flex flex-col gap-1">
          {allEvents.map((event, i) => (
            <div key={`holiday-${i}`} className={classNames('flex items-start gap-2 rounded-xl px-3 py-2', event.is_holiday ? 'bg-red-50' : 'bg-slate-50')}>
              <span className={classNames('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', event.is_holiday ? 'bg-red-400' : 'bg-slate-400')} />
              <div className="flex flex-col gap-0.5">
                <span className={classNames('text-xs font-medium', event.is_holiday ? 'text-red-500' : 'text-slate-600')}>{event.description}</span>
                {event.additional_description && (
                  <span className="text-[11px] text-slate-400">{event.additional_description}</span>
                )}
              </div>
            </div>
          ))}
          {vacationEvents.map((event, i) => (
            <button
              key={`vacation-${i}`}
              type="button"
              onClick={() => vacationSheet.openSheet()}
              className="flex w-full items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-right transition-colors active:bg-red-100"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-red-500">{event.description}</span>
                {event.additional_description && (
                  <span className="text-[11px] text-slate-400">{event.additional_description}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {stats && (
        <div>
          <DsInsightCarousel
            header={
              <AppointmentsCountRow
                title={appointmentDayLabel}
                count={stats.todayAppointmentsCount}
                isLoading={stats.isTodayCountLoading && stats.todayAppointmentsCount == null}
                userId={userId}
                onPress={() => apptSheet.openSheet()}
              />
            }
            items={[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" />
                  </svg>
                ),
                title: 'امتیاز',
                description: 'عملکرد در سنجه',
                value: stats.performanceScore ?? null,
                tint: ds.surface.primaryTint,
                isLoading: stats.isPerformanceLoading,
                onPress: () => {
                  sendDoctorHomeEvent(userId, 'stat_performance', { score: stats.performanceScore });
                  performanceSheet.openSheet();
                },
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-amber-500">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ),
                title: 'رضایت بیماران',
                description: stats.satisfactionReviewCount != null ? `${stats.satisfactionReviewCount} نظر` : 'میانگین امتیاز',
                value: stats.satisfactionRating ?? null,
                tint: 'bg-amber-50',
                isLoading: stats.isSatisfactionLoading,
                onPress: () => {
                  sendDoctorHomeEvent(userId, 'stat_satisfaction', { rating: stats.satisfactionRating, review_count: stats.satisfactionReviewCount });
                  reviewsSheet.openSheet();
                },
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-emerald-600">
                    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                    <path d="M16.5 12h4" strokeLinecap="round" />
                    <circle cx="16.5" cy="12" r="1.25" fill="currentColor" stroke="none" />
                  </svg>
                ),
                title: 'کیف پول',
                description: 'تومان',
                value: isWalletHydrated ? walletFormatted : null,
                hiddenValue: '••••••',
                tint: 'bg-emerald-50',
                isLoading: isWalletLoading || !isWalletHydrated,
                onPress: () => {
                  sendDoctorHomeEvent(userId, 'stat_wallet', { balance: walletBalance });
                  walletSheet.openSheet();
                },
                visibilityToggle: {
                  isVisible: isWalletVisible,
                  onToggle: toggleWalletVisibility,
                },
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                title: 'پیج ویو',
                description: 'بازدید پروفایل',
                value: stats.pageViewCount != null ? convertLongToCompactNumber(stats.pageViewCount) : null,
                tint: ds.surface.secondarySoft,
                isLoading: stats.isPageViewLoading,
                onPress: () => {
                  sendDoctorHomeEvent(userId, 'stat_page_view', { count: stats.pageViewCount });
                  pageViewSheet.openSheet();
                },
              },
            ]}
          />
        </div>
      )}

      <DsDrawer
        {...sheetDrawerProps(apptSheet)}
        description="لیست نوبت‌ها"
        fullHeight
        className="!p-0"
      >
        {apptSheet.open && (
          <iframe
            src={appendUserIdToUrl('https://opium-dashboard.paziresh24.com/book-list/', userId)}
            title="لیست نوبت‌ها"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(reviewsSheet)}
        description="نظرات بیماران"
        fullHeight
        className="!p-0"
      >
        {reviewsSheet.open && (
          <iframe
            src={appendUserIdToUrl(RAVI_DOCSIDE_URL, userId)}
            title="راوی؛ نظرات بیماران"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(walletSheet)}
        description="کتیبه، مدیریت امور مالی"
        fullHeight
        className="!p-0"
      >
        {walletSheet.open && (
          <iframe
            src={appendUserIdToUrl('https://katibe.paziresh24.com/transactions-search/?', userId)}
            title="کتیبه، مدیریت امور مالی"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(performanceSheet)}
        description="عملکرد من در سنجه"
        fullHeight
        className="!p-0"
      >
        {performanceSheet.open && (
          <iframe
            src={appendUserIdToUrl(
              'https://jahannama.paziresh24.com/my-performance/?utm_source=p24portal&utm_medium=internal-link&utm_campaign=sanje-my-performance',
              userId,
            )}
            title="عملکرد من در سنجه"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(pageViewSheet)}
        title="بازدید پروفایل"
        description="آمار بازدید"
      >
        <MetricDrawerContent
          value={stats?.pageViewCount != null ? stats.pageViewCount.toLocaleString('fa-IR') : null}
          label="بازدید از پروفایل شما"
          description="تعداد کل بازدیدکنندگانی که صفحه پروفایل شما را مشاهده کرده‌اند"
        />
      </DsDrawer>
    </header>
  );
};
