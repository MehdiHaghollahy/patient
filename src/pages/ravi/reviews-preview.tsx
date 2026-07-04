import { LayoutWithHeaderAndFooter } from '@/common/components/layouts/layoutWithHeaderAndFooter';
import { RaviWidget } from '@/modules/rate-and-review';
import { useNewRaviWithAi } from '@/modules/rate-and-review/composables/useNewRaviWithAi';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';

export default function RaviReviewsPreviewPage() {
  const router = useRouter();
  const { isEnabled: showNewRaviWithAi, isReady } = useNewRaviWithAi();
  const [slugInput, setSlugInput] = useState('');
  const [activeSlug, setActiveSlug] = useState('');

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const slugFromQuery = typeof router.query.slug === 'string' ? router.query.slug : '';
    setSlugInput(slugFromQuery);
    setActiveSlug(slugFromQuery);
  }, [router.isReady, router.query.slug]);

  const submitSlug = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSlug = slugInput.trim();
    setActiveSlug(nextSlug);
    router.replace({ pathname: '/ravi/reviews-preview', query: nextSlug ? { slug: nextSlug } : {} }, undefined, {
      shallow: true,
    });
  };

  return (
    <LayoutWithHeaderAndFooter showBottomNavigation={false}>
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4" dir="rtl">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h1 className="text-lg font-bold text-slate-900">پیش‌نمایش Rate & Review</h1>
          <p className="mt-2 text-sm text-slate-600">برای تست، slug پزشک را وارد کنید. این صفحه مستقل از پروفایل است.</p>
          <form className="mt-4 flex gap-2" onSubmit={submitSlug}>
            <input
              value={slugInput}
              onChange={event => setSlugInput(event.target.value)}
              placeholder="مثال: dr-mohammad-ali-mirzaei"
              className="flex-1 rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500"
            />
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              نمایش
            </button>
          </form>
        </div>

        {!isReady ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">در حال بارگذاری تنظیمات...</p>
        ) : null}

        {isReady && !showNewRaviWithAi ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            این پیش‌نمایش فقط برای کاربرانی که در فیچر فلگ <code>new-ravi-with-ai</code> فعال هستند در دسترس است.
          </p>
        ) : null}

        {showNewRaviWithAi && activeSlug ? <RaviWidget doctorSlug={activeSlug} /> : null}
      </div>
    </LayoutWithHeaderAndFooter>
  );
}
