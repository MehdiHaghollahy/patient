import { apiGatewayClient, raviApisClient } from '@/common/apis/client';
import { enrichReviewResponseWithRelativeTime } from '@/common/utils/formatRelativeFeedbackTime';
import { RaviRateSummary, RaviReviewPage, RaviReviewQuery } from './types';

const PAGE_SIZE = 10;

interface RaviFeedbacksResponse {
  data?: Array<Record<string, unknown>>;
  list?: Array<Record<string, unknown>>;
  meta?: {
    count?: number;
    limit?: number;
    offset?: number;
    total?: number;
    hasNext?: boolean;
  };
  pageInfo?: RaviReviewPage['pageInfo'];
}

export const fetchRateSummary = async (doctorSlug: string): Promise<RaviRateSummary> => {
  const { data } = await raviApisClient.get<Record<string, unknown>>(
    `/ravi/v1/rate/doctor/${encodeURIComponent(doctorSlug)}`,
    { timeout: 12_000 },
  );

  return {
    hideRates: Boolean(data?.hide_rates),
    count: Number(data?.comments_count ?? data?.count_rates ?? 0),
    items: [
      { label: 'برخورد مناسب', value: Number(data?.doctor_encounter) || 0 },
      { label: 'توضیح در هنگام ویزیت', value: Number(data?.explanation_of_issue) || 0 },
      { label: 'مهارت و تخصص', value: Number(data?.quality_of_treatment) || 0 },
    ],
  };
};

/** GET /ravi/v1/feedbacks/doctors/{slug} — feedbacks webservice (filter: default | newest | negative). */
export const fetchReviewPage = async (doctorSlug: string, query: RaviReviewQuery): Promise<RaviReviewPage> => {
  const { data } = await raviApisClient.get<RaviFeedbacksResponse>(
    `/ravi/v1/feedbacks/doctors/${encodeURIComponent(doctorSlug)}`,
    {
      params: {
        filter: query.filter,
        limit: query.limit || PAGE_SIZE,
        offset: query.offset,
        user_id: query.userId,
        center_id: query.centerId,
      },
    },
  );
  const rawList = data?.data ?? data?.list ?? [];
  const list = enrichReviewResponseWithRelativeTime(rawList);
  const pageInfo = {
    ...data?.pageInfo,
    page: Math.floor((data?.meta?.offset ?? query.offset) / (query.limit || PAGE_SIZE)) + 1,
    total: data?.meta?.total ?? data?.pageInfo?.total,
    isLastPage: data?.meta?.hasNext != null ? !data.meta.hasNext : data?.pageInfo?.isLastPage,
  };
  const hasMore = pageInfo.isLastPage != null ? !pageInfo.isLastPage : list.length >= (query.limit || PAGE_SIZE);

  return { list, hasMore, pageInfo };
};

export { PAGE_SIZE };

export const fetchReviewerName = async (userId: string): Promise<string | null> => {
  const { data } = await apiGatewayClient.get(`/v1/users/${userId}`);
  const users = (data?.users ?? data?.data?.users) as Array<Record<string, unknown>> | undefined;
  const name = users?.[0]?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
};

export const submitLikeRate = async ({
  feedbackId,
  rate,
  userId,
}: {
  feedbackId: string;
  rate: number;
  userId: string;
}) =>
  raviApisClient.post(
    '/ravi/v1/like_rate',
    { feedback_id: feedbackId, rate, user_id: userId },
    { withCredentials: true },
  );

export const editFeedback = async ({ feedbackId, description }: { feedbackId: string; description: string }) =>
  raviApisClient.patch(`/ravi/v2/feedbacks?id=${encodeURIComponent(feedbackId)}`, { description }, { withCredentials: true });

export const deleteFeedback = async (feedbackId: string) =>
  raviApisClient.delete(`/ravi/v1/feedbacks/${encodeURIComponent(feedbackId)}`, { withCredentials: true });

export const reportFeedback = async ({
  feedbackId,
  reportText,
  commentText,
  doctorSlug,
}: {
  feedbackId: string;
  reportText: string;
  commentText?: string;
  doctorSlug?: string;
}) => {
  const res = await raviApisClient.post(
    `/ravi/v1/feedbacks/report?id=${encodeURIComponent(feedbackId)}`,
    { feedback_id: feedbackId, report_text: reportText },
    { withCredentials: true },
  );
  raviApisClient
    .post(
      `/ravi/v1/report-webhook?id=${encodeURIComponent(feedbackId)}`,
      { feedback_id: feedbackId, report_text: reportText, comment_text: commentText, doctor_slug: doctorSlug },
      { withCredentials: true },
    )
    .catch(() => undefined);
  return res;
};
