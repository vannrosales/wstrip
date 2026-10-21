import { StripTemplate } from '@/lib/types';
import { STRIP_FONT_FAMILIES } from '@/lib/composeStrip';

const PLACEHOLDER_PHOTOS = [
  'linear-gradient(135deg,#d9e4f5,#a8b9d6)',
  'linear-gradient(135deg,#f3dfe3,#d9a9b8)',
  'linear-gradient(135deg,#dff1e6,#a7cdb5)',
  'linear-gradient(135deg,#f6ead2,#d9bd8a)',
];

interface TemplateStripPreviewProps {
  template: StripTemplate;
  /** Rendered width in px; height follows the template aspect ratio. */
  width?: number;
  className?: string;
}

/** Scaled, static preview of a photostrip template (pure markup, no canvas). */
export function TemplateStripPreview({
  template,
  width = 112,
  className = '',
}: TemplateStripPreviewProps) {
  const { size, slots, background, borderColor, borderWidth, footer, header } = template;
  const scale = width / size.width;
  const tfKey = template.typeface ?? 'sans';
  const fontFam = STRIP_FONT_FAMILIES[tfKey] || STRIP_FONT_FAMILIES.sans;

  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 overflow-hidden shadow-[0_6px_18px_-4px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        width,
        aspectRatio: `${size.width} / ${size.height}`,
        background:
          background.type === 'gradient' && background.secondary
            ? `linear-gradient(to bottom, ${background.value}, ${background.secondary})`
            : background.value,
        boxShadow: `0 0 0 ${Math.max(0.5, (borderWidth ?? 1) * scale)}px ${borderColor ?? 'rgba(0,0,0,0.2)'}, 0 8px 20px -6px rgba(0,0,0,0.35)`,
        borderRadius: 2,
      }}
    >
      {header && (
        <span
          className="absolute inset-x-0 text-center font-semibold uppercase"
          style={{
            top: 40 * scale,
            fontSize: Math.max(3, (header.fontSize ?? 13) * scale),
            color: header.color,
            letterSpacing: '0.22em',
            opacity: 0.85,
            fontFamily: fontFam,
          }}
        >
          {header.text}
        </span>
      )}
      {slots.map((slot, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(slot.x / size.width) * 100}%`,
            top: `${(slot.y / size.height) * 100}%`,
            width: `${(slot.w / size.width) * 100}%`,
            height: `${(slot.h / size.height) * 100}%`,
            borderRadius: (slot.borderRadius ?? 0) * scale,
            background: PLACEHOLDER_PHOTOS[i % PLACEHOLDER_PHOTOS.length],
            filter: template.filter,
          }}
        />
      ))}
      {footer && (
        <div
          className="absolute inset-x-0 flex flex-col items-center px-1 text-center"
          style={{
            bottom: 40 * scale,
          }}
        >
          <span
            className="w-full truncate font-bold"
            style={{
              fontSize: Math.max(3.5, (template.typeface === 'serif' ? 28 : template.typeface === 'script' ? 32 : 22) * scale),
              color: footer.color,
              fontFamily: fontFam,
              fontStyle: template.typeface === 'serif' ? 'italic' : 'normal',
            }}
          >
            {footer.text}
          </span>
          {footer.subtext && (
            <span
              className="mt-0.5 w-full truncate font-medium opacity-65"
              style={{
                fontSize: Math.max(2.5, 9 * scale),
                color: footer.color,
                fontFamily: STRIP_FONT_FAMILIES.mono,
                letterSpacing: '0.14em',
              }}
            >
              {footer.subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
