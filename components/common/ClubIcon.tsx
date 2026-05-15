import { ClubCategory } from '@/lib/types';
import { CATEGORY_ICONS } from '@/lib/defaults';

interface Props {
  category: ClubCategory;
  size?: number;
  className?: string;
}

export default function ClubIcon({ category, size = 28, className = '' }: Props) {
  const src = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.iron;
  return (
    <img
      src={src}
      alt={category}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
