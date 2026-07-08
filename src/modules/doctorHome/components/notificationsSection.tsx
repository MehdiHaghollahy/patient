import BellIcon from '@/common/components/icons/bell';
import classNames from '@/common/utils/classNames';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useEffect, useState } from 'react';
import { DsCard, DsSectionHeader, ds } from '../designSystem';
import { useSelectedDateStore } from '../store/selectedDate';
import { sheetDrawerProps, useSheetRoute } from '../hooks/useSheetRoute';
import { DoctorHomeFeedAlert } from '../types/feed';
import { sendDoctorHomeEvent } from '../utils/analytics';
import {
  formatSelectedDateLabel,
  getNotificationDateKey,
  getNotificationFullText,
  getNotificationHeadline,
  getNotificationPreview,
} from '../utils/normalizeNotification';
import { DsDrawer } from './DsDrawer';

interface NotificationsSectionProps {
  items: DoctorHomeFeedAlert[];
  className?: string;
}

export const NotificationsSection = ({ items, className }: NotificationsSectionProps) => {
  const userId = useUserInfoStore(state => state.info?.id);
  const selectedDate = useSelectedDateStore(state => state.selectedDate);
  const notificationSheet = useSheetRoute('notification');
  const [selectedNotification, setSelectedNotification] = useState<DoctorHomeFeedAlert | null>(null);
  const selectedDateLabel = formatSelectedDateLabel(selectedDate);

  useEffect(() => {
    if (!notificationSheet.open) {
      setSelectedNotification(null);
    }
  }, [notificationSheet.open]);

  if (!items.length) return null;

  const openNotification = (notification: DoctorHomeFeedAlert, index: number) => {
    setSelectedNotification(notification);
    notificationSheet.openSheet({
      notification_id: String(notification.id ?? index),
    });
    sendDoctorHomeEvent(userId, 'notification_click', {
      title: getNotificationHeadline(notification),
      index,
      count: items.length,
      selected_date: selectedDate,
    });
  };

  const selectedHeadline = selectedNotification ? getNotificationHeadline(selectedNotification) : '';
  const selectedFullText = selectedNotification ? getNotificationFullText(selectedNotification) : '';

  return (
    <section className={className}>
      <DsSectionHeader
        title="اعلان‌ها"
        subtitle={`${items.length.toLocaleString('fa-IR')} پیام · ${selectedDateLabel}`}
      />

      <DsCard padding="none" className="overflow-hidden">
        <ul>
          {items.map((notification, index) => {
            const headline = getNotificationHeadline(notification);
            const preview = getNotificationPreview(notification);

            return (
              <li key={notification.id ?? `${headline}-${index}`}>
                <button
                  type="button"
                  onClick={() => openNotification(notification, index)}
                  className={classNames(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-start transition-colors hover:bg-slate-50 active:bg-slate-100',
                    index < items.length - 1 && 'border-b border-slate-100',
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <BellIcon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-6 text-slate-800">{headline}</p>
                    {preview ? (
                      <p className={classNames(ds.type.cardBody, 'mt-1 line-clamp-3 leading-6')}>{preview}</p>
                    ) : null}
                    <span className={classNames(ds.type.link, 'mt-2 inline-block')}>مشاهده کامل</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </DsCard>

      <DsDrawer
        {...sheetDrawerProps(notificationSheet)}
        title={selectedHeadline}
        description={selectedNotification ? selectedDateLabel : undefined}
      >
        <div className="px-4 pb-8">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedFullText}</p>
        </div>
      </DsDrawer>
    </section>
  );
};
