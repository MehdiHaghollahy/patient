import { LayoutWithHeaderAndFooter } from '@/common/components/layouts/layoutWithHeaderAndFooter';
import { withServerUtils } from '@/common/hoc/withServerUtils';
import { ThemeConfig } from '@/common/hooks/useCustomize';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import LauncherMain from '.plasmic/LauncherMain';
import GlobalContextsProvider from '.plasmic/plasmic/launcher/PlasmicGlobalContextsProvider';
import Seo from '@/common/components/layouts/seo';
import useModal from '@/common/hooks/useModal';
import { NotificationPermissionModal } from '@/common/components/atom/notificationPermissionModal';
import Loading from '@/common/components/atom/loading';
import { useLauncherPageAccess } from '@/common/hooks/useLauncherPageAccess';
import { AppFrame } from '@/modules/hamdast/appFrame';
import { HamdastAppModal } from '@/modules/hamdast/components/appModal';
import { prefetchOneApp } from '@/modules/hamdast/utils/prefetchOneApp';
import { useNotificationPermission } from '@/common/hooks/useNotificationPermission';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { useQueryClient } from '@tanstack/react-query';
import { DoctorViewSwitcher, useDoctorViewRouteGuard, useDoctorViewSwapActive, useIsNewDoctorLauncherLoading } from '@/modules/doctorHome';
import { DoctorLauncherContent } from '@/modules/doctorHome/components/doctorLauncherContent';
import { ds } from '@/modules/doctorHome/designSystem/tokens';

const Page = () => {
  const queryClient = useQueryClient();
  const { handleOpen, handleClose, modalProps } = useModal();
  const [app, setApp] = useState<string>('');
  const swapActive = useDoctorViewSwapActive();
  const doctorLauncherLoading = useIsNewDoctorLauncherLoading();
  const { isResolving, shouldShowLauncher } = useLauncherPageAccess();
  const info = useUserInfoStore(state => state.info);
  const showSwitcher = swapActive || doctorLauncherLoading;

  useDoctorViewRouteGuard();
  const { isSupported, hasPermission, showModal, openModal, closeModal, checkPermission } = useNotificationPermission();

  useEffect(() => {
    window?.clarity?.('upgrade', 'LauncherMain');
  }, []);

  const handleSuccess = () => {
    checkPermission();
  };

  useEffect(() => {
    if (isSupported && !hasPermission && info?.is_doctor) {
      openModal();
    }
  }, [isSupported, hasPermission, info]);

  return (
    <>
      <Seo title="خدمات" noIndex />

      <HamdastAppModal {...modalProps} title="اپلیکیشن">
        <AppFrame appKey={app} params={['launcher']} onHamdastClose={handleClose} />
      </HamdastAppModal>
      <NotificationPermissionModal
        isOpen={showModal}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
      {showSwitcher ? (
        <>
          <div className={ds.surface.page}>
            <DoctorViewSwitcher className="px-0 pb-1 pt-3" />
          </div>
          {doctorLauncherLoading ? (
            <div className="flex min-h-[50vh] flex-grow items-center justify-center">
              <Loading />
            </div>
          ) : (
            <DoctorLauncherContent />
          )}
        </>
      ) : (
        <>
          {isResolving && (
            <div className="flex min-h-[50vh] flex-grow items-center justify-center">
              <Loading />
            </div>
          )}
          {!isResolving && shouldShowLauncher && (
            <GlobalContextsProvider>
              <LauncherMain
                onAction={action => {
                  if (action.action === 'OPEN_APP') {
                    void prefetchOneApp(queryClient, { appKey: action.appKey, pageKey: 'launcher' }, 0);
                    setApp(action.appKey);
                    handleOpen();
                  }
                }}
              />
            </GlobalContextsProvider>
          )}
        </>
      )}
    </>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutWithHeaderAndFooter {...page.props.config} className={ds.surface.page} shouldShowPromoteApp={false} showFooter={false}>
      {page}
    </LayoutWithHeaderAndFooter>
  );
};
export const getServerSideProps: GetServerSideProps = withServerUtils(
  async (context: GetServerSidePropsContext, themeConfing: ThemeConfig) => {
    return {};
  },
);

export default Page;
