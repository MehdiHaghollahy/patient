import classNames from '@/common/utils/classNames';
import { DoctorHomeFeedItem } from '../types/feed';
import { FeedGreeting } from './feedGreeting';
import { FeedItem } from './feedItem';
import { FeedWidgetsSection } from './feedWidgetsSection';

interface DoctorHomeFeedProps {
  items: DoctorHomeFeedItem[];
  notificationDateSet?: Set<string>;
  className?: string;
}

export const DoctorHomeFeed = ({ items, notificationDateSet, className }: DoctorHomeFeedProps) => {
  const statsItem = items.find((item): item is Extract<DoctorHomeFeedItem, { type: 'stats' }> => item.type === 'stats');
  const feedItems = items.filter(item => item.type !== 'stats');

  return (
    <div className={classNames('flex flex-col gap-8', className)}>
      <FeedGreeting
        stats={statsItem?.data}
        notificationDateSet={notificationDateSet}
      />
      {feedItems.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
      <FeedWidgetsSection />
    </div>
  );
};
