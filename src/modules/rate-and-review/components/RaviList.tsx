import Button from '@/common/components/atom/button/button';
import { useMemo } from 'react';
import { useRaviReviews } from '../composables/useRaviReviews';
import { RaviCenter } from '../types';
import { filterReviewsBySearch } from '../utils/filterReviews';
import { mapRawReviewToRaviReview } from '../utils/mapReview';
import { RaviCard } from './RaviCard';
import { RaviFilters } from './RaviFilters';
interface RaviListProps {
  doctorSlug: string;
  userId?: string;
  centers?: RaviCenter[];
}

export const RaviList = ({ doctorSlug, userId, centers = [] }: RaviListProps) => {
  const {
    list,
    isLoading,
    isSearchPending,
    hasMore,
    loadMore,
    search,
    debouncedSearch,
    sort,
    filter,
    onSearch,
    onSort,
    onFilter,
    error,
    page,
  } = useRaviReviews(doctorSlug, userId);

  const reviews = useMemo(() => list.map(mapRawReviewToRaviReview), [list]);
  const filteredReviews = useMemo(
    () => filterReviewsBySearch(reviews, debouncedSearch),
    [debouncedSearch, reviews],
  );
  const showLoading = (isLoading && !reviews.length) || isSearchPending;

  const selectedFilter = (() => {
    if (filter.type === 'center_id') return filter.value ?? 'all';
    if (filter.type === 'my_feedbacks') return 'my_feedbacks';
    return filter.type;
  })();

  const handleFilter = (value: string) => {
    if (value === 'all') return onFilter({ type: 'all' });
    if (value === 'my_feedbacks') return onFilter({ type: 'my_feedbacks', value: userId });
    if (value === 'not_recommended') return onFilter({ type: 'not_recommended' });
    onFilter({ type: 'center_id', value });
  };

  return (
    <section className="w-full bg-white md:rounded-b-lg">
      <div className="p-4">
        <RaviFilters
          sort={sort}
          filterValue={selectedFilter}
          search={search}
          userId={userId}
          centers={centers}
          onSort={onSort}
          onFilter={handleFilter}
          onSearch={onSearch}
        />
      </div>

      {error ? <p className="px-4 pb-3 text-sm text-rose-600">{error}</p> : null}

      {showLoading ? (
        <p className="px-4 pb-4 text-sm text-slate-500">
          {isSearchPending ? 'در حال جستجو...' : 'در حال بارگذاری نظرات...'}
        </p>
      ) : null}

      {!showLoading && !reviews.length ? (
        <p className="px-4 pb-4 text-sm text-slate-500">نظری ثبت نشده است.</p>
      ) : null}

      {!showLoading && reviews.length > 0 && !filteredReviews.length ? (
        <p className="px-4 pb-4 text-sm text-slate-500">نتیجه‌ای برای جستجوی شما یافت نشد.</p>
      ) : null}
      {!showLoading ? (
        <div>
          {filteredReviews.map(review => (
            <RaviCard key={review.id} review={review} highlightQuery={debouncedSearch} />
          ))}
        </div>
      ) : null}

      {hasMore ? (
        <div className="p-4">
          <Button variant="secondary" block onClick={loadMore} loading={page > 1 && isLoading}>
            نمایش بیشتر
          </Button>
        </div>
      ) : null}
    </section>
  );
};
