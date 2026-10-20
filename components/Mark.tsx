type MarkProps = {
  size?: number;
  className?: string;
  /** Accessible name. Omit to render the mark as decorative. */
  title?: string;
};

/** oneTake mark: a play triangle cut once by a diagonal slit (one take, one cut). */
export function Mark({ size = 22, className, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d="M4 2.5 L4 21.5 L9.6 18.3 L9.6 5.7 Z" fill="currentColor" />
      <path d="M12.4 7.3 L21 12 L12.4 16.7 Z" fill="currentColor" />
    </svg>
  );
}

export default Mark;
