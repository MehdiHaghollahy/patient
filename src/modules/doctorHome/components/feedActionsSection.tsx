import classNames from '@/common/utils/classNames';
import Switch from '@/common/components/atom/switch';
import ChatIcon from '@/common/components/icons/chat';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useOnlineVisitServices, useToggleOnlineVisit } from '../apis/onlineVisit';
import { DsButton, DsCard, DsSectionHeader, ds } from '../designSystem';
import { DsDrawer } from './DsDrawer';
import { sheetDrawerProps, useSheetRoute } from '../hooks/useSheetRoute';
import { useSelectedCenterStore } from '../store/selectedCenter';
import { sendDoctorHomeEvent } from '../utils/analytics';
import { DOCTOR_PANEL_URLS } from '../utils/doctorPanelUrls';
import { formatDoctorCenterName, getClinicCenters, shouldShowClinicSection, shouldShowOnlineVisitSection } from '../utils/centers';
import { appendUserIdToUrl } from '../utils/iframeUrl';
import { RowChevron } from './feedWidgets/widgetListRow';

type ActionId = 'workhours' | 'vacation' | 'tariff';

const ClockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4.5l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VacationIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M8 4v4M16 4v4M4 11h16" strokeLinecap="round" />
  </svg>
);

const TariffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <path d="M6 7h12l-1 10H7L6 7z" strokeLinejoin="round" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);

const ClinicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <path d="M4 20V9l8-5 8 5v11" strokeLinejoin="round" />
    <path d="M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NEUTRAL_ICON = 'bg-slate-50 text-slate-600 ring-slate-200/80';

const SUB_ACTIONS: {
  id: ActionId;
  label: string;
  hint: string;
  description: string;
  url: string;
  analyticsFeature: 'shortcut_workhours' | 'shortcut_vacation' | 'shortcut_tariff';
  icon: (props: { className?: string }) => JSX.Element;
}[] = [
  {
    id: 'workhours',
    label: 'ساعات کاری',
    hint: 'زمان پذیرش',
    description: 'تنظیم ساعات کاری',
    url: DOCTOR_PANEL_URLS.workhours,
    analyticsFeature: 'shortcut_workhours',
    icon: ClockIcon,
  },
  {
    id: 'vacation',
    label: 'اعلام تعطیلی',
    hint: 'مرخصی مطب',
    description: 'مرخصی',
    url: DOCTOR_PANEL_URLS.vacation,
    analyticsFeature: 'shortcut_vacation',
    icon: VacationIcon,
  },
  {
    id: 'tariff',
    label: 'تعرفه‌ها',
    hint: 'قیمت خدمات',
    description: 'تغییر تعرفه‌ها',
    url: DOCTOR_PANEL_URLS.tariffs,
    analyticsFeature: 'shortcut_tariff',
    icon: TariffIcon,
  },
];

const ActionIcon = ({
  children,
  size = 'md',
}: {
  children: ReactNode;
  size?: 'md' | 'lg';
}) => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-[11px] ring-1',
      NEUTRAL_ICON,
      size === 'lg' ? 'h-10 w-10' : 'h-9 w-9',
    )}
  >
    {children}
  </span>
);

const PanelIframeDrawer = ({
  open,
  onClose,
  title,
  description,
  url,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  userId?: string | number | null;
}) => (
  <DsDrawer open={open} onOpenChange={o => { if (!o) onClose(); }} description={description} fullHeight className="!p-0">
    {open && (
      <iframe src={appendUserIdToUrl(url, userId)} title={title} className="min-h-0 w-full flex-1 border-0" />
    )}
  </DsDrawer>
);

const ActionSheetList = ({ onSelect }: { onSelect: (id: ActionId) => void }) => (
  <ul className="pb-6">
    {SUB_ACTIONS.map((action, index) => {
      const Icon = action.icon;
      return (
        <li key={action.id}>
          <button
            type="button"
            onClick={() => onSelect(action.id)}
            className={classNames(
              'flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-slate-50 active:bg-slate-50',
              index < SUB_ACTIONS.length - 1 && 'border-b border-slate-100',
            )}
          >
            <ActionIcon>
              <Icon className="h-4 w-4" />
            </ActionIcon>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{action.label}</p>
              <p className={classNames(ds.type.caption, 'mt-0.5')}>{action.hint}</p>
            </span>
            <RowChevron />
          </button>
        </li>
      );
    })}
  </ul>
);

const CompactRow = ({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  isLast,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  isLast?: boolean;
}) => (
  <div
    className={classNames(
      'flex items-center gap-2 px-3.5 py-2.5',
      !isLast && 'border-b border-slate-100',
    )}
  >
    <button
      type="button"
      onClick={onPress}
      className="flex min-w-0 flex-1 items-center gap-3 text-start transition-colors active:opacity-80"
    >
      <ActionIcon size="lg">
        {icon}
      </ActionIcon>
      <span className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {subtitle ? <p className={classNames(ds.type.caption, 'mt-0.5 line-clamp-1')}>{subtitle}</p> : null}
      </span>
      {!trailing ? <RowChevron /> : null}
    </button>
    {trailing}
  </div>
);

export const FeedActionsSection = ({
  onlineVisit,
}: {
  onlineVisit?: { userCenterId?: string; hasOnlineVisitCenter: boolean };
}) => {
  const user = useUserInfoStore(state => state.info);
  const userId = user?.id;
  const onlineSheet = useSheetRoute('online-visit-actions');
  const clinicSheet = useSheetRoute('clinic-actions');
  const activationSheet = useSheetRoute('online-visit-activation');
  const workhoursSheet = useSheetRoute('workhours');
  const vacationSheet = useSheetRoute('vacation');
  const tariffSheet = useSheetRoute('tariff');

  const selectedCenterId = useSelectedCenterStore(state => state.selectedCenterId);
  const setSelectedCenterId = useSelectedCenterStore(state => state.setSelectedCenterId);

  const clinics = useMemo(() => getClinicCenters(user), [user]);
  const showOnlineVisit = shouldShowOnlineVisitSection(selectedCenterId);
  const showClinic = shouldShowClinicSection(selectedCenterId);
  const activeClinic = useMemo(() => {
    if (!showClinic || clinics.length === 0) return null;
    if (selectedCenterId) {
      return clinics.find(center => String(center.id) === selectedCenterId) ?? clinics[0];
    }
    return clinics[0];
  }, [clinics, selectedCenterId, showClinic]);

  const { data, isLoading } = useOnlineVisitServices(onlineVisit?.userCenterId);
  const toggleMutation = useToggleOnlineVisit();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(!!data?.data?.some(item => item.active_booking));
  }, [data]);

  const handleToggle = async (checked: boolean) => {
    if (!onlineVisit?.userCenterId || toggleMutation.isLoading) return;
    setIsActive(checked);
    try {
      await toggleMutation.mutateAsync({
        user_center_id: onlineVisit.userCenterId,
        can_booking: checked ? '1' : '0',
      });
      sendDoctorHomeEvent(userId, 'online_visit_toggle', { is_on: checked });
    } catch {
      setIsActive(!checked);
    }
  };

  const sheets = { workhours: workhoursSheet, vacation: vacationSheet, tariff: tariffSheet } as const;

  const openAction = (id: ActionId) => {
    const action = SUB_ACTIONS.find(item => item.id === id);
    if (!action) return;
    sendDoctorHomeEvent(userId, action.analyticsFeature);
    onlineSheet.closeSheet();
    clinicSheet.closeSheet();
    sheets[id].openSheet();
  };

  const openOnlineSheet = () => {
    sendDoctorHomeEvent(userId, 'online_visit_actions_open');
    onlineSheet.openSheet();
  };

  const hasClinic = !!activeClinic;
  const showClinicRow = showClinic && hasClinic;
  const clinicTitle = activeClinic ? formatDoctorCenterName(activeClinic) : '';
  const clinicAddress = activeClinic?.address?.trim() || activeClinic?.city?.trim();
  const clinicSubtitle =
    clinics.length > 1 && !selectedCenterId
      ? `${clinics.length.toLocaleString('fa-IR')} مطب`
      : clinicAddress;

  if (!showOnlineVisit && !showClinicRow) return null;

  return (
    <section dir="rtl">
      <DsSectionHeader title="اقدامات" />
      <DsCard padding="none" className="overflow-hidden">
        {showOnlineVisit && onlineVisit && (
          <CompactRow
            icon={<ChatIcon className="h-[18px] w-[18px]" />}
            title="ویزیت آنلاین"
            subtitle={
              !onlineVisit.hasOnlineVisitCenter
                ? 'فعال‌سازی نوبت آنلاین'
                : isLoading
                  ? 'در حال بررسی…'
                  : isActive
                    ? 'نوبت‌دهی فعال'
                    : 'نوبت‌دهی غیرفعال'
            }
            isLast={!showClinicRow}
            trailing={
              onlineVisit.hasOnlineVisitCenter ? (
                <>
                  <Switch
                    checked={isActive}
                    onChange={e => handleToggle(e.target.checked)}
                    disabled={isLoading || toggleMutation.isLoading}
                  />
                  <button type="button" aria-label="مدیریت ویزیت آنلاین" onClick={openOnlineSheet} className="shrink-0 p-1">
                    <RowChevron />
                  </button>
                </>
              ) : (
                <DsButton variant="primary" className="!px-2.5 !py-1 !text-[11px]" onClick={() => activationSheet.openSheet()}>
                  شروع
                </DsButton>
              )
            }
            onPress={() => {
              if (!onlineVisit.hasOnlineVisitCenter) {
                activationSheet.openSheet();
                return;
              }
              openOnlineSheet();
            }}
          />
        )}

        {showClinicRow && (
          <CompactRow
            icon={<ClinicIcon className="h-[18px] w-[18px]" />}
            title={clinicTitle}
            subtitle={clinicSubtitle}
            isLast
            onPress={() => {
              sendDoctorHomeEvent(userId, 'clinic_actions_open');
              clinicSheet.openSheet();
            }}
          />
        )}
      </DsCard>

      <DsDrawer
        {...sheetDrawerProps(activationSheet)}
        title="فعال‌سازی ویزیت آنلاین"
        description="راهنمای فعال‌سازی"
      >
        <div className="flex flex-col items-center gap-4 px-4 pb-10 pt-2 text-center">
          <ActionIcon size="lg">
            <ChatIcon className="h-5 w-5" />
          </ActionIcon>
          <p className={classNames(ds.type.cardBody, 'leading-6')}>
            برای فعال‌سازی ویزیت آنلاین، ابتدا پروفایل خود را در پنل پزشکی پذیرش۲۴ تکمیل کنید.
          </p>
        </div>
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(onlineSheet)}
        title="ویزیت آنلاین"
        description="مدیریت نوبت آنلاین"
      >
        <ActionSheetList onSelect={openAction} />
      </DsDrawer>

      <DsDrawer
        {...sheetDrawerProps(clinicSheet)}
        title={clinicTitle}
        description="مدیریت مطب"
      >
        {clinics.length > 1 && (
          <div className="mb-1 flex gap-2 overflow-x-auto px-3 pb-2 pt-1 no-scroll">
            {clinics.map(clinic => {
              const clinicId = String(clinic.id);
              const isSelected = String(activeClinic?.id) === clinicId;
              const name = formatDoctorCenterName(clinic);

              return (
                <button
                  key={clinicId}
                  type="button"
                  onClick={() => {
                    setSelectedCenterId(clinicId);
                    sendDoctorHomeEvent(userId, 'clinic_picker_select', { center_id: clinicId });
                  }}
                  className={classNames(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isSelected
                      ? 'border-slate-300 bg-slate-100 text-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <ClinicIcon className="h-3.5 w-3.5" />
                  {name}
                </button>
              );
            })}
          </div>
        )}
        <ActionSheetList onSelect={openAction} />
      </DsDrawer>

      {SUB_ACTIONS.map(action => (
        <PanelIframeDrawer
          key={`drawer-${action.id}`}
          open={sheets[action.id].open}
          onClose={sheets[action.id].closeSheet}
          title={action.label}
          description={action.description}
          url={action.url}
          userId={userId}
        />
      ))}
    </section>
  );
};
