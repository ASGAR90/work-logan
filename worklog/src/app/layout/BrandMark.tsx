/**
 * MyTime mark.
 *
 * The real artwork from the repo's logo.png, served from public/ — it replaces
 * an earlier hand-authored SVG approximation. The source is 810x729 with a
 * genuine alpha channel, so it is never letterboxed onto a background: the
 * square box plus object-fit keeps its proportions on any surface, dark or
 * light. Decorative, because the adjacent wordmark already names the product.
 */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <img
      className="brand-logo"
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
    />
  );
}
