import type { ReactNode } from 'react';

interface MacWindowProps {
  title: string;
  children: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** A macOS-style window with traffic lights, a centered title and optional toolbar/footer. */
export function MacWindow({
  title,
  children,
  toolbar,
  footer,
  className = '',
  bodyClassName = '',
}: MacWindowProps) {
  return (
    <section className={`mac-window flex flex-col ${className}`} aria-label={title}>
      <header className="mac-titlebar relative">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="traffic-light bg-[#ff5f57]" />
          <span className="traffic-light bg-[#febc2e]" />
          <span className="traffic-light bg-[#28c840]" />
        </div>
        <div className="pointer-events-none absolute inset-x-14 hidden truncate text-center text-[13px] font-semibold text-black/70 sm:block">
          {title}
        </div>
        <div className="relative z-10 ml-auto flex items-center gap-1.5 sm:gap-2">{toolbar}</div>
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
      {footer && (
        <footer className="border-t border-black/10 bg-[rgba(246,246,248,0.75)] px-4 py-3">
          {footer}
        </footer>
      )}
    </section>
  );
}
