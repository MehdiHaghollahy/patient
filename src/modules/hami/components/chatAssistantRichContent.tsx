import { vardastRichContentClass } from '@/modules/hami/components/chatAssistantTypography';
import classNames from '@/common/utils/classNames';
import { detectTextDirection, getTextDirectionClass } from '@/common/utils/detectTextDirection';

interface ChatAssistantRichContentProps {
  html?: string;
  plain?: string;
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const ChatAssistantRichContent = ({ html, plain }: ChatAssistantRichContentProps) => {
  if (!html && !plain) return null;

  if (html) {
    const direction = detectTextDirection(stripHtml(html));

    return (
      <div
        dir={direction}
        className={classNames(vardastRichContentClass, getTextDirectionClass(direction))}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const lines = plain!.split('\n');

  return (
    <div className={vardastRichContentClass}>
      {lines.map((line, index) => {
        const direction = detectTextDirection(line);

        return (
          <p
            key={index}
            dir={direction}
            className={classNames(
              'whitespace-pre-wrap',
              getTextDirectionClass(direction),
              index > 0 && 'mt-2.5',
            )}
          >
            {line || '\u00A0'}
          </p>
        );
      })}
    </div>
  );
};

export default ChatAssistantRichContent;
