'use client';
import { Drawer } from 'vaul';
import { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import classNames from '@/common/utils/classNames';

interface DsDrawerProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** مودال‌های روی‌هم (stacked): level بالاتر = z-index بالاتر تا overlay روی مودال قبلی بیفته */
  level?: number;
  /** شیت رو ثابت روی ۹۰٪ باز می‌کنه (بدون اندازه‌گیری محتوا — مناسب iframe و محتوای بلند) */
  fullHeight?: boolean;
  /** وقتی این شیت داخل یک شیت دیگر باز میشه (nested) — از Drawer.NestedRoot وال استفاده می‌کنه */
  nested?: boolean;
}

export const DsDrawer = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  className,
  level = 0,
  fullHeight = false,
  nested = false,
}: DsDrawerProps) => {
  const Root = nested ? Drawer.NestedRoot : Drawer.Root;
  const isFlush = className?.includes('!p-0');
  const handleOpenChange = (nextOpen: boolean) => {
    if (!onOpenChange) return;
    if (!nextOpen) {
      // Avoid one-frame "re-open" flicker when closing by drag.
      flushSync(() => onOpenChange(false));
      return;
    }
    // In controlled mode, opening is driven by explicit UI actions (openSheet/onPress).
    // Ignoring "true" here prevents vaul gesture bounce from re-triggering open.
    if (typeof open === 'undefined') onOpenChange(true);
  };

  return (
    <Root open={open} onOpenChange={handleOpenChange} handleOnly={false}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" style={{ zIndex: 200 + level * 10 }} />
        <Drawer.Content
          className={classNames(
            'fixed inset-x-0 bottom-0 flex flex-col rounded-t-[24px] bg-white outline-none',
            fullHeight ? 'h-[90dvh] max-h-[90dvh]' : 'max-h-[90dvh]',
          )}
          style={{ zIndex: 201 + level * 10 }}
          dir="rtl"
        >
          <div className="flex shrink-0 cursor-grab justify-center pt-3.5 pb-2 active:cursor-grabbing">
            <Drawer.Handle className="!h-1 !w-10 !rounded-full !bg-slate-200" />
          </div>
          {title ? (
            <Drawer.Title className="border-b border-slate-100 px-5 py-3 text-base font-bold text-slate-900">
              {title}
            </Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">{description ?? 'sheet'}</Drawer.Title>
          )}
          {description && (
            <Drawer.Description className="sr-only">{description}</Drawer.Description>
          )}
          <div
            className={classNames(
              'no-scroll flex min-h-0 flex-col overscroll-contain',
              fullHeight ? 'flex-1 overflow-hidden' : 'overflow-y-auto',
              '[&_*]:[-ms-overflow-style:none] [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden',
              !isFlush && 'pb-[max(1rem,env(safe-area-inset-bottom))]',
              className,
            )}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Root>
  );
};
