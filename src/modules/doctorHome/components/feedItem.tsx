import Skeleton from '@/common/components/atom/skeleton';
import classNames from '@/common/utils/classNames';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { RaviCard } from '@/modules/rate-and-review';
import moment from 'jalali-moment';
import { UpcomingAppointment } from '../apis/upcomingAppointments';
import { DsDrawer } from './DsDrawer';
import { sheetDrawerProps, useSheetRoute } from '../hooks/useSheetRoute';
import { useSelectedDateStore } from '../store/selectedDate';
import { RAVI_DOCSIDE_URL } from '../utils/doctorPanelUrls';
import { mapFeedReviewToRaviReview } from '../utils/mapFeedReviewToRavi';
import { formatSelectedDateLabel } from '../utils/normalizeNotification';
import {
  DsButton,
  DsCard,
  DsSectionHeader,
  DsTimeline,
  DsTimelineItem,
  DsTaskCard,
  DsBadge,
  ds,
} from '../designSystem';
import { DoctorHomeFeedItem, DoctorHomeFeedReview } from '../types/feed';
import { sendDoctorHomeEvent } from '../utils/analytics';
import { appendUserIdToUrl } from '../utils/iframeUrl';
import { getAppointmentTimelineStatuses } from '../utils/timelineStatus';
import { FeedActionsSection } from './feedActionsSection';
import { NotificationsSection } from './notificationsSection';


const PillButton = ({ children }: { children: string }) => (
  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
    {children}
  </span>
);



const AppointmentsFeedItem = ({
  data,
}: {
  data: { items: UpcomingAppointment[]; todayCount: number | null };
}) => {
  const userId = useUserInfoStore(state => state.info?.id);
  const selectedDate = useSelectedDateStore(state => state.selectedDate);
  const selectedMoment = moment(selectedDate, 'YYYY-MM-DD');
  const isToday = selectedMoment.isSame(moment(), 'day');
  const sectionTitle = isToday
    ? 'برنامه امروز'
    : `برنامه ${selectedMoment.clone().locale('fa').format('jD jMMMM')}`;
  const statuses = getAppointmentTimelineStatuses(data.items, selectedDate);

  const allSheet = useSheetRoute('appointments-all');

  return (
    <section>
      <DsSectionHeader
        title={sectionTitle}
        subtitle={
          data.todayCount != null
            ? `${data.todayCount.toLocaleString('fa-IR')} نوبت`
            : undefined
        }
        onPress={() => {
          sendDoctorHomeEvent(userId, 'appointments_see_all');
          allSheet.openSheet();
        }}
      />

      <DsDrawer
        {...sheetDrawerProps(allSheet)}
        description="لیست نوبت‌ها"
        fullHeight
        className="!p-0"
      >
        {allSheet.open && (
          <iframe
            src={appendUserIdToUrl('https://opium-dashboard.paziresh24.com/book-list/', userId)}
            title="لیست نوبت‌ها"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <DsTimeline>
        {data.items.map((appointment, index) => (
          <DsTimelineItem
            key={appointment.book_id}
            status={statuses[index]}
            isLast={index === data.items.length - 1}
          >
            <DsTaskCard
              onClick={() => {
                sendDoctorHomeEvent(userId, 'appointments_see_all');
                allSheet.openSheet();
              }}
              title={appointment.patient_name}
              meta={[appointment.center_name, appointment.service_name].filter(Boolean).join(' · ')}
              trailing={
                <div className="text-left">
                  <p className="text-sm font-bold tabular-nums text-slate-800">
                    {appointment.from
                      ? moment.unix(appointment.from).format('HH:mm')
                      : appointment.book_time_string || '—'}
                  </p>
                  <DsBadge
                    tone={appointment.is_online_visit ? 'online' : 'neutral'}
                    className="mt-1"
                  >
                    {appointment.is_online_visit ? 'آنلاین' : 'حضوری'}
                  </DsBadge>
                </div>
              }
            >
              {isToday && statuses[index] === 'current' && <PillButton>نوبت بعدی</PillButton>}
            </DsTaskCard>
          </DsTimelineItem>
        ))}
      </DsTimeline>
    </section>
  );
};

const ReviewsFeedItem = ({
  data,
}: {
  data: { items: DoctorHomeFeedReview[]; slug?: string; doctorUserId?: string };
}) => {
  const user = useUserInfoStore(state => state.info);
  const userId = user?.id;
  const selectedDate = useSelectedDateStore(state => state.selectedDate);
  const selectedDateLabel = formatSelectedDateLabel(selectedDate);

  const allSheet = useSheetRoute('reviews-all');

  if (data.items.length === 0) return null;

  return (
    <section>
      <DsSectionHeader
        title="بازخورد بیماران"
        subtitle={`${data.items.length.toLocaleString('fa-IR')} نظر بی‌پاسخ · ${selectedDateLabel}`}
        onPress={() => {
          sendDoctorHomeEvent(userId, 'reviews_see_all');
          allSheet.openSheet();
        }}
      />

      <DsDrawer
        {...sheetDrawerProps(allSheet)}
        title="بازخورد بیماران"
        description="نظرات بیماران"
        fullHeight
        className="!p-0"
      >
        {allSheet.open && (
          <iframe
            src={appendUserIdToUrl(RAVI_DOCSIDE_URL, userId)}
            title="راوی؛ نظرات بیماران"
            className="min-h-0 w-full flex-1 border-0"
          />
        )}
      </DsDrawer>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {data.items.map((review, index) => (
          <RaviCard
            key={review.id ?? index}
            review={mapFeedReviewToRaviReview(review)}
            doctorSlug={data.slug}
            doctorUserId={data.doctorUserId}
          />
        ))}
      </div>
    </section>
  );
};

interface FeedItemProps {
  item: DoctorHomeFeedItem;
}

export const FeedItem = ({ item }: FeedItemProps) => {
  const userId = useUserInfoStore(state => state.info?.id);

  switch (item.type) {
    case 'stats':
      return null;

    case 'actions':
      return <FeedActionsSection onlineVisit={item.data.onlineVisit} />;

    case 'online_visit':
      return <FeedActionsSection onlineVisit={item.data} />;

    case 'alert':
    case 'alerts':
      return <NotificationsSection items={item.type === 'alerts' ? item.data.items : [item.data]} />;

    case 'appointments_list':
      return <AppointmentsFeedItem data={item.data} />;

    case 'reviews_list':
      return <ReviewsFeedItem data={item.data} />;

    case 'loading':
      if (item.data.variant === 'appointment') {
        return (
          <section className="min-h-[60vh]">
            <div className="mb-3 flex items-start justify-between gap-2">
              <Skeleton h="0.875rem" w="5.5rem" rounded="full" />
              <Skeleton h="0.75rem" w="3.5rem" rounded="full" />
            </div>
            <div className="relative">
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="relative flex gap-4 pb-1">
                  <div className="flex w-6 shrink-0 flex-col items-center">
                    <Skeleton h="1.5rem" w="1.5rem" rounded="full" />
                    {idx < 3 && (
                      <div className="mt-1 min-h-[3.5rem] flex-1 border-r-2 border-dashed border-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton h="0.875rem" w="50%" rounded="full" />
                          <Skeleton h="0.75rem" w="35%" rounded="full" />
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Skeleton h="1rem" w="3rem" rounded="full" />
                          <Skeleton h="1.25rem" w="2.75rem" rounded="full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }
      return <Skeleton h="7rem" w="100%" rounded="lg" className="opacity-30" />;

    case 'empty':
      return (
        <DsCard className="text-center !shadow-sm" padding="lg">
          <p className={ds.type.cardBody}>{item.data.message}</p>
          {item.data.onLinkClick && (
            <div className="mt-4">
              <DsButton
                variant="ghost"
                onClick={() => {
                  if (item.data.href?.includes('appointments')) {
                    sendDoctorHomeEvent(userId, 'appointments_see_all');
                  }
                  item.data.onLinkClick?.();
                }}
              >
                {item.data.linkLabel ?? 'مشاهده'}
              </DsButton>
            </div>
          )}
        </DsCard>
      );

    default:
      return null;
  }
};
