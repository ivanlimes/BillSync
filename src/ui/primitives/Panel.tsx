import type { HTMLAttributes, PropsWithChildren } from 'react';

type PanelTone = 'surface' | 'dense' | 'accent';

type PanelPadding = 'md' | 'lg';

interface PanelProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> {
  tone?: PanelTone;
  padding?: PanelPadding;
}

export function Panel({
  children,
  className = '',
  tone = 'surface',
  padding = 'lg',
  ...props
}: PanelProps) {
  const classes = ['ui-panel', `ui-panel--${tone}`, `ui-panel--padding-${padding}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}
