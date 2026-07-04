import { RaviReview } from '../types';

export const mapRawReviewToRaviReview = (item: Record<string, unknown> & { relativeCreatedTime?: string }): RaviReview => {
  const nameRaw =
    item.user_display_name ??
    item.user_name ??
    item.name ??
    item.display_name ??
    item.nik_name ??
    (item.user as Record<string, unknown> | undefined)?.name;

  const rateRaw = item.avg_rate_value ?? item.avgRateValue ?? item.rate ?? item.avg_rate ?? null;
  const rateNum = rateRaw != null && rateRaw !== '' ? Number(rateRaw) : null;

  const likeRaw = item.count_like ?? item.like;
  const likeNum = likeRaw != null && likeRaw !== '' ? Number(likeRaw) : undefined;

  const centerName = item.center_name ?? item.docCenter;
  const centerLabel = typeof centerName === 'string' && centerName.trim() ? centerName.trim() : undefined;

  const userIdRaw = item.user_id ?? item.userId;
  const userId = userIdRaw != null && userIdRaw !== '' ? String(userIdRaw) : undefined;

  return {
    id: String(item.id ?? item.Id ?? ''),
    userId,
    userName: typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : undefined,
    description: String(item.description ?? ''),
    dateLabel: item.relativeCreatedTime ?? '—',
    centerName: centerLabel,
    visited: item.visit_status === 'visited',
    rate: rateNum != null && Number.isFinite(rateNum) ? rateNum : null,
    likeCount: likeNum != null && Number.isFinite(likeNum) ? likeNum : undefined,
  };
};
