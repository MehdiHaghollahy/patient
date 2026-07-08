const RTL_SCRIPT = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LTR_SCRIPT = /[A-Za-z]/;

export type TextDirection = 'rtl' | 'ltr';

export const detectTextDirection = (text: string, fallback: TextDirection = 'rtl'): TextDirection => {
  for (const char of text.trim()) {
    if (RTL_SCRIPT.test(char)) return 'rtl';
    if (LTR_SCRIPT.test(char)) return 'ltr';
  }

  return fallback;
};

export const getTextDirectionClass = (direction: TextDirection) =>
  direction === 'rtl' ? 'text-right' : 'text-left';
