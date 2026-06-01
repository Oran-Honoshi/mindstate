type SparkyMood =
  | 'idle'
  | 'happy'
  | 'focused'
  | 'surprised'
  | 'celebrate'
  | 'resting'
  | 'gold'
  | 'violet'
  | 'hero';

interface SparkyImgProps {
  mood?: SparkyMood;
  size?: number;
  className?: string;
}

export function SparkyImg({ mood = 'idle', size = 80, className }: SparkyImgProps) {
  return (
    <img
      src={`/sparky/${mood}.png`}
      width={size}
      height={size}
      alt={`Sparky ${mood}`}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
