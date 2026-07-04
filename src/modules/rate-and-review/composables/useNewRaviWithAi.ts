import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { useEffect, useState } from 'react';
import { useUserInfoStore } from '@/modules/login/store/userInfo';
import { growthbook } from 'src/pages/_app';

export const useNewRaviWithAi = () => {
  const userId = useUserInfoStore(state => state.info?.id);
  const isLogin = useUserInfoStore(state => state.isLogin);
  const [isReady, setIsReady] = useState(growthbook.ready);
  const isEnabled = useFeatureIsOn('new-ravi-with-ai');

  useEffect(() => {
    const unsubscribe = growthbook.subscribe(() => {
      setIsReady(growthbook.ready);
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!isLogin || userId == null || userId === '') return;

    const normalizedUserId = String(userId);
    growthbook.setAttributes({
      ...growthbook.getAttributes(),
      user_id: normalizedUserId,
      userId: normalizedUserId,
      loggedIn: true,
    });
    void growthbook.refreshFeatures({ skipCache: true });
  }, [isLogin, userId]);

  return {
    isReady,
    isEnabled: isReady && isEnabled,
  };
};
