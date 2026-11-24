import { type IconName, iconSrc } from "../lib/icons";

/** Decorative pixel icon. Sizes should be multiples of 16 so pixels stay square. */
export function Icon({
  name,
  size = 16,
  className = "",
}: {
  name: IconName;
  size?: 16 | 32 | 48;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: tiny static SVGs; next/image adds nothing here
    <img
      src={iconSrc(name)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`pixel-icon ${className}`}
    />
  );
}
