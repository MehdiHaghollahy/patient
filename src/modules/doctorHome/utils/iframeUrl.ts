export const appendUserIdToUrl = (url: string, userId?: string | number | null): string => {
  if (userId == null || userId === '') return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('user_id', String(userId));
    return parsed.toString();
  } catch {
    return url;
  }
};
