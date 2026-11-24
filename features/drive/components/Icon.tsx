import { type IconName, iconSrc } from "../lib/icons";

/**
 * Pixel icon, decorative by default. Pass `label` when the icon itself carries meaning
 * (visited, locked) so screen readers hear it. Sizes are multiples of 16 so pixels stay square.
 */
export function Icon({
  name,
  size = 16,
  className = "",
  label,
}: {
  name: IconName;
  size?: 16 | 32 | 48;
  className?: string;
  label?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: tiny static SVGs; next/image adds nothing here
    <img
      src={iconSrc(name)}
      alt={label ?? ""}
      width={size}
      height={size}
      draggable={false}
      className={`pixel-icon ${className}`}
    />
  );
}
