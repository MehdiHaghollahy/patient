import { raviApisClient } from '@/common/apis/client';
import { deleteFeedback, editFeedback, fetchRateSummary, fetchReviewPage, reportFeedback } from './api';

jest.mock('@/common/apis/client', () => ({
  apiGatewayClient: { get: jest.fn() },
  raviApisClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/common/utils/formatRelativeFeedbackTime', () => ({
  enrichReviewResponseWithRelativeTime: (list: unknown[]) => list,
}));

const mockedGet = raviApisClient.get as jest.Mock;
const mockedPost = raviApisClient.post as jest.Mock;
const mockedPatch = raviApisClient.patch as jest.Mock;
const mockedDelete = raviApisClient.delete as jest.Mock;

describe('rate-and-review api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchRateSummary maps doctor rate response', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        hide_rates: true,
        comments_count: 12,
        doctor_encounter: 4.1,
        explanation_of_issue: 4.3,
        quality_of_treatment: 4.5,
      },
    });

    await expect(fetchRateSummary('dr-test')).resolves.toEqual({
      hideRates: true,
      count: 12,
      items: [
        { label: 'برخورد مناسب', value: 4.1 },
        { label: 'توضیح در هنگام ویزیت', value: 4.3 },
        { label: 'مهارت و تخصص', value: 4.5 },
      ],
    });

    expect(mockedGet).toHaveBeenCalledWith('/ravi/v1/rate/doctor/dr-test', { timeout: 12_000 });
  });

  it('fetchReviewPage requests feedbacks with filter params', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        data: [{ id: '1', description: 'test' }],
        meta: { offset: 0, total: 1, hasNext: false },
      },
    });

    const page = await fetchReviewPage('dr-test', {
      offset: 0,
      limit: 10,
      filter: 'negative',
      centerId: 'c1',
    });

    expect(mockedGet).toHaveBeenCalledWith('/ravi/v1/feedbacks/doctors/dr-test', {
      params: {
        filter: 'negative',
        limit: 10,
        offset: 0,
        user_id: undefined,
        center_id: 'c1',
      },
    });
    expect(page.list).toHaveLength(1);
    expect(page.hasMore).toBe(false);
  });

  it('editFeedback patches description', async () => {
    mockedPatch.mockResolvedValueOnce({ data: {} });
    await editFeedback({ feedbackId: 'fb-1', description: 'updated' });
    expect(mockedPatch).toHaveBeenCalledWith(
      '/ravi/v2/feedbacks?id=fb-1',
      { description: 'updated' },
      { withCredentials: true },
    );
  });

  it('deleteFeedback calls delete endpoint', async () => {
    mockedDelete.mockResolvedValueOnce({ data: {} });
    await deleteFeedback('fb-2');
    expect(mockedDelete).toHaveBeenCalledWith('/ravi/v1/feedbacks/fb-2', { withCredentials: true });
  });

  it('reportFeedback posts report and webhook', async () => {
    mockedPost.mockResolvedValue({ data: { ok: true } });
    await reportFeedback({
      feedbackId: 'fb-3',
      reportText: 'غیرواقعی',
      commentText: 'spam',
      doctorSlug: 'dr-test',
    });

    expect(mockedPost).toHaveBeenNthCalledWith(
      1,
      '/ravi/v1/feedbacks/report?id=fb-3',
      { feedback_id: 'fb-3', report_text: 'غیرواقعی' },
      { withCredentials: true },
    );
    expect(mockedPost).toHaveBeenNthCalledWith(
      2,
      '/ravi/v1/report-webhook?id=fb-3',
      {
        feedback_id: 'fb-3',
        report_text: 'غیرواقعی',
        comment_text: 'spam',
        doctor_slug: 'dr-test',
      },
      { withCredentials: true },
    );
  });
});
