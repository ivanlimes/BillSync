import type { PropsWithChildren } from 'react';

interface PlaceholderBlockProps extends PropsWithChildren {
  title?: string;
  caption?: string;
}

export function PlaceholderBlock({ children, title, caption }: PlaceholderBlockProps) {
  return (
    <div className="ui-placeholder-block">
      {title ? <h3 className="ui-placeholder-block__title">{title}</h3> : null}
      {caption ? <p className="ui-placeholder-block__caption">{caption}</p> : null}
      <div className="ui-placeholder-block__content">{children}</div>
    </div>
  );
}
