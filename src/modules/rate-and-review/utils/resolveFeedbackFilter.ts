import { RaviFeedbackFilter, RaviReviewFilterValue, RaviSort } from '../types';

export const resolveFeedbackApiFilter = (
  sort: RaviSort,
  filter: RaviReviewFilterValue,
): RaviFeedbackFilter => {
  if (filter.type === 'not_recommended') return 'negative';
  if (sort === 'created_at') return 'newest';
  return 'default';
};
